"""Cloud-based Workflow State Management."""
import asyncio
import logging
import json
import uuid
from uuid import uuid4
from datetime import datetime, timedelta, timezone, UTC
from typing import Dict, List, Optional, Set, Any, Union, TYPE_CHECKING, Tuple

from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError

from ai_automation_platform.cloud.database.database import AsyncSessionLocal, init_db
from ai_automation_platform.cloud.database.models import WorkflowDB, workflow_dependencies
from .models import WorkflowStateData
from .states import WorkflowState

logger = logging.getLogger(__name__)

class WorkflowStateManager:
    """Manages workflow state in the cloud layer."""
    
    def __init__(self, db_url: str = None):
        """Initialize the WorkflowStateManager.
        
        Args:
            db_url: Optional database URL. If not provided, will use the one from settings.
        """
        from ai_automation_platform.core.config import settings
        
        self.db_url = db_url or settings.DATABASE_URL or "sqlite+aiosqlite:///./workflows.db"
        self._lock = asyncio.Lock()
        self._state_cache: Dict[str, WorkflowStateData] = {}
        self._initialized = False
        self._db_pool = None
        self._session_factory = None
    
    async def initialize(self):
        """Initialize the workflow state manager and database connections."""
        if self._initialized:
            return
            
        logger.info(f"Initializing WorkflowStateManager with database: {self.db_url}")
        
        # Initialize the database
        await init_db()
        
        # Load initial state from database
        await self._load_initial_state()
        
        self._initialized = True
        logger.info("WorkflowStateManager initialized")
    
    async def _create_tables(self):
        """Create database tables if they don't exist."""
        # In a real implementation, this would execute CREATE TABLE statements
        logger.info("Ensuring database tables exist")
    
    async def _load_initial_state(self):
        """Load initial workflow states from the database."""
        logger.debug("Loading initial workflow states from database")
        
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(select(WorkflowDB))
                workflows = result.scalars().all()
                
                for db_workflow in workflows:
                    # Load the full workflow state data including dependencies
                    state_data = await self._load_workflow_state_from_db(db_workflow, session)
                    if state_data:
                        self._state_cache[state_data.workflow_id] = state_data
                
                logger.info(f"Loaded {len(workflows)} workflow states from database")
                
        except Exception as e:
            logger.error(f"Failed to load initial workflow states: {str(e)}", exc_info=True)
            raise
    
    async def create_workflow(self, workflow_data: Dict[str, Any]) -> WorkflowStateData:
        """Create a new workflow with the given data."""
        if not self._initialized:
            await self.initialize()
            
        workflow_id = workflow_data.get('workflow_id', str(uuid4()))
        state = workflow_data.get('state', WorkflowState.PENDING)  # Default to PENDING
        
        # Convert state to string if it's a WorkflowState enum
        state_str = state.name if hasattr(state, 'name') else str(state)
        
        # Ensure metadata is a dictionary
        metadata = workflow_data.get('metadata', {})
        if not isinstance(metadata, dict):
            logger.warning(f"Non-dict metadata provided for workflow {workflow_id}, converting to dict")
            metadata = {}
        
        workflow = WorkflowDB(
            workflow_id=workflow_id,
            state=state_str,  # Store as string in the database
            metadata_=metadata,
            retry_count=0,
            max_retries=workflow_data.get('max_retries', 3)
        )
        
        async with AsyncSessionLocal() as session:
            async with session.begin():
                session.add(workflow)
                await session.flush()  # Ensure the workflow is persisted
                
                # Create the state data object using the helper method
                state_data = await self._load_workflow_state_from_db(workflow, session)
                
                # Update cache
                self._state_cache[workflow_id] = state_data
                
                return state_data
    
    async def get_workflow(self, workflow_id: str) -> Optional[WorkflowStateData]:
        """Fetch a workflow by its ID."""
        # Check cache first
        if workflow_id in self._state_cache:
            return self._state_cache[workflow_id]
        
        # Load from database
        return await self.get_workflow_state(workflow_id)

    async def get_workflow_state(self, workflow_id: str) -> Optional[WorkflowStateData]:
        """Get workflow state data from cache or database."""
        if not self._initialized:
            await self.initialize()
            
        # Check cache first
        if workflow_id in self._state_cache:
            return self._state_cache[workflow_id]
        
        # Load from database
        state_data = await self._load_workflow_state(workflow_id)
        if state_data:
            self._state_cache[workflow_id] = state_data
        
        return state_data

    def _to_workflow_state(self, workflow: WorkflowDB) -> WorkflowStateData:
        """Convert a WorkflowDB instance to WorkflowStateData.
        
        Args:
            workflow: The WorkflowDB instance to convert
            
        Returns:
            WorkflowStateData instance with the converted data
        """
        # Convert string state to WorkflowState enum
        try:
            if isinstance(workflow.state, str):
                state = WorkflowState[workflow.state]
            elif isinstance(workflow.state, WorkflowState):
                state = workflow.state
            else:
                logger.warning(f"Unexpected workflow state type: {type(workflow.state)}, defaulting to CREATED")
                state = WorkflowState.CREATED
        except (KeyError, AttributeError) as e:
            logger.warning(f"Invalid workflow state: {workflow.state}, error: {str(e)}, defaulting to CREATED")
            state = WorkflowState.CREATED
        
        # Ensure metadata is a dictionary
        metadata = workflow.metadata_ or {}
        if not isinstance(metadata, dict):
            logger.warning(f"Workflow {workflow.workflow_id} has non-dict metadata: {metadata}")
            metadata = {}
        
        return WorkflowStateData(
            workflow_id=workflow.workflow_id,
            state=state,
            created_at=workflow.created_at,
            updated_at=workflow.updated_at or workflow.created_at or datetime.utcnow(),
            metadata=metadata,
            error=workflow.error,
            retry_count=workflow.retry_count if workflow.retry_count is not None else 0,
            max_retries=workflow.max_retries if workflow.max_retries is not None else 3,
            parent_workflow_id=workflow.parent_workflow_id,
            dependencies=set(),
            child_workflows=[]
        )
    
    async def _load_workflow_state_from_db(self, workflow: WorkflowDB, session=None) -> WorkflowStateData:
        """Load complete workflow state data from database."""
        should_close_session = session is None
        if session is None:
            session = AsyncSessionLocal()
        
        try:
            # First, get the basic workflow data
            state_data = self._to_workflow_state(workflow)
            
            # Then load dependencies if needed
            try:
                result = await session.execute(
                    select(workflow_dependencies.c.dependency_id, workflow_dependencies.c.is_child)
                    .where(workflow_dependencies.c.workflow_id == workflow.workflow_id)
                )
                
                # Clear any existing dependencies from the default empty sets
                state_data.dependencies.clear()
                state_data.child_workflows.clear()
                
                # Add the loaded dependencies
                for dep_id, is_child in result:
                    state_data.dependencies.add(dep_id)
                    if is_child:
                        state_data.child_workflows.append(dep_id)
                        
            except SQLAlchemyError as e:
                logger.warning(f"Failed to load dependencies for workflow {workflow.workflow_id}: {e}")
            
            return state_data
            
        except Exception as e:
            logger.error(f"Error loading workflow state from DB: {e}", exc_info=True)
            raise
            
        finally:
            if should_close_session:
                await session.close()
    
    async def update_workflow_state(
        self,
        workflow_id: str,
        new_state: Union[WorkflowState, str],
        error: Optional[str] = None,
        metadata_updates: Optional[Dict[str, Any]] = None
    ) -> Optional[WorkflowStateData]:
        """Update the state of a workflow.
        
        Args:
            workflow_id: ID of the workflow to update
            new_state: New state (can be WorkflowState enum or string)
            error: Optional error message
            metadata_updates: Optional metadata updates
            
        Returns:
            Updated workflow state or None if not found
        """
        if not self._initialized:
            await self.initialize()
            
        # Convert string state to enum if needed
        if isinstance(new_state, str):
            try:
                new_state = WorkflowState[new_state]
            except KeyError:
                raise ValueError(f"Invalid workflow state: {new_state}")
        
        async with self._lock:
            state_data = await self.get_workflow_state(workflow_id)
            if not state_data:
                return None
                
            # Check if transition is valid
            if not self._is_valid_transition(state_data.state, new_state):
                raise ValueError(
                    f"Invalid state transition from {state_data.state.name} to {new_state.name}"
                )
                
            # Update state and metadata
            state_data.state = new_state
            state_data.updated_at = datetime.now(UTC)
            
            if error is not None:
                state_data.error = error
                # Increment retry count when there's an error, unless we're moving to COMPLETED state
                if new_state != WorkflowState.COMPLETED:
                    state_data.retry_count = (state_data.retry_count or 0) + 1
            else:
                state_data.error = None
                
            if metadata_updates:
                if state_data.metadata is None:
                    state_data.metadata = {}
                state_data.metadata.update(metadata_updates)
            
            # Persist to database
            await self._save_workflow_state(state_data)
            
            # Update cache
            self._state_cache[workflow_id] = state_data
            
            logger.info(
                f"Updated workflow {workflow_id} to state {new_state.name}"
            )
            return state_data
    
    async def cleanup_old_workflows(self, older_than_days: int = 30) -> int:
        """Clean up old completed or failed workflows.
        
        Args:
            older_than_days: Only clean up workflows completed/failed before this many days ago
            **kwargs: Additional keyword arguments (ignored, for backward compatibility)
            
        Returns:
            Number of workflows cleaned up
        """
        if not self._initialized:
            await self.initialize()
            
        cutoff = datetime.now(UTC) - timedelta(days=older_than_days)
        count = 0
        
        # Define states that can be cleaned up
        states_to_clean = [
            WorkflowState.COMPLETED,
            WorkflowState.FAILED,
            WorkflowState.CANCELLED
        ]
        
        # Convert to string names for the query
        state_names = [state.name for state in states_to_clean]
        
        logger.info(f"Cleaning up workflows older than {cutoff} with states: {state_names}")
        
        # Query database for old workflows to clean up
        async with AsyncSessionLocal() as session:
            try:
                async with session.begin():
                    # First, find all workflows that match our criteria
                    stmt = select(WorkflowDB).where(
                        WorkflowDB.state.in_(state_names),
                        WorkflowDB.updated_at < cutoff
                    )
                    
                    result = await session.execute(stmt)
                    workflows_to_clean = result.scalars().all()
                    
                    if not workflows_to_clean:
                        logger.info("No old workflows to clean up")
                        return 0
                        
                    workflow_ids = [w.workflow_id for w in workflows_to_clean]
                    logger.info(f"Found {len(workflow_ids)} old workflows to clean up")
                    
                    # Delete dependencies in batches to avoid too many parameters
                    batch_size = 100
                    for i in range(0, len(workflow_ids), batch_size):
                        batch = workflow_ids[i:i + batch_size]
                        await session.execute(
                            workflow_dependencies.delete().where(
                                workflow_dependencies.c.workflow_id.in_(batch)
                            )
                        )
                    
                    # Delete the workflows
                    for workflow in workflows_to_clean:
                        await session.delete(workflow)
                        self._state_cache.pop(workflow.workflow_id, None)
                        count += 1
                    
                    # Commit the transaction
                    await session.commit()
                    
            except SQLAlchemyError as e:
                logger.error(f"Failed to cleanup old workflows: {str(e)}", exc_info=True)
                await session.rollback()
                raise
            except Exception as e:
                logger.error(f"Unexpected error during cleanup: {str(e)}", exc_info=True)
                await session.rollback()
                raise
        
        logger.info(f"Successfully cleaned up {count} old workflows")
        return count
    
    async def close(self):
        """Close the workflow state manager and release resources."""
        logger.info("Closing WorkflowStateManager")
        
        # In a real implementation, this would close the database connection pool
        if self._db_pool:
            logger.info("Closing database connection pool")
            self._db_pool = None
        
        self._initialized = False
        logger.info("WorkflowStateManager closed")

    def _is_valid_transition(self, from_state: Union[WorkflowState, str], to_state: Union[WorkflowState, str]) -> bool:
        """Check if a state transition is valid.
        
        Args:
            from_state: Current state (can be WorkflowState enum or string)
            to_state: New state (can be WorkflowState enum or string)
            
        Returns:
            bool: True if the transition is valid, False otherwise
        """
        # Convert string states to enums
        if isinstance(from_state, str):
            try:
                from_state = WorkflowState[from_state]
            except KeyError:
                return False
                
        if isinstance(to_state, str):
            try:
                to_state = WorkflowState[to_state]
            except KeyError:
                return False
        
        valid_transitions = {
            WorkflowState.CREATED: {
                WorkflowState.PENDING,
                WorkflowState.CANCELLED
            },
            WorkflowState.PENDING: {
                WorkflowState.RUNNING,
                WorkflowState.FAILED,
                WorkflowState.CANCELLED
            },
            WorkflowState.RUNNING: {
                WorkflowState.PAUSED,
                WorkflowState.COMPLETED,
                WorkflowState.FAILED,
                WorkflowState.CANCELLED
            },
            WorkflowState.PAUSED: {
                WorkflowState.RUNNING,
                WorkflowState.CANCELLED
            },
            # Terminal states - no transitions out
            WorkflowState.COMPLETED: set(),
            WorkflowState.FAILED: {
                WorkflowState.PENDING  # For retries
            },
            WorkflowState.CANCELLED: set()
        }
        
        return to_state in valid_transitions.get(from_state, set())

    async def _save_workflow_state(self, state_data: WorkflowStateData) -> None:
        """Save workflow state to the database.
        
        Args:
            state_data: The workflow state data to save
            
        Raises:
            SQLAlchemyError: If there's an error saving to the database
        """
        if not self._initialized:
            await self.initialize()
            
        async with AsyncSessionLocal() as session:
            async with session.begin():
                try:
                    # Check if workflow exists
                    result = await session.execute(
                        select(WorkflowDB).where(WorkflowDB.workflow_id == state_data.workflow_id)
                    )
                    workflow = result.scalar_one_or_none()
                    
                    # Convert state to string for storage
                    state_str = state_data.state.name if hasattr(state_data.state, 'name') else str(state_data.state)
                    
                    # Ensure metadata is JSON-serializable
                    metadata = state_data.metadata or {}
                    if not isinstance(metadata, dict):
                        logger.warning(f"Non-dict metadata for workflow {state_data.workflow_id}, converting to dict")
                        metadata = {}
                    
                    if workflow:
                        # Update existing workflow
                        workflow.state = state_str
                        workflow.updated_at = datetime.now(UTC)
                        workflow.metadata_ = metadata
                        workflow.error = state_data.error
                        workflow.retry_count = state_data.retry_count
                        workflow.max_retries = state_data.max_retries
                        workflow.parent_workflow_id = state_data.parent_workflow_id
                    else:
                        # Create new workflow
                        workflow = WorkflowDB(
                            workflow_id=state_data.workflow_id,
                            state=state_str,
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow(),
                            metadata_=metadata,
                            error=state_data.error,
                            retry_count=state_data.retry_count,
                            max_retries=state_data.max_retries,
                            parent_workflow_id=state_data.parent_workflow_id
                        )
                        session.add(workflow)
                    
                    # Update dependencies - delete existing ones first
                    await session.execute(
                        workflow_dependencies.delete().where(
                            workflow_dependencies.c.workflow_id == state_data.workflow_id
                        )
                    )
                    
                    # Insert new dependencies if any
                    if state_data.dependencies:
                        # Convert to list in case it's a set
                        deps = list(state_data.dependencies)
                        child_workflows = set(state_data.child_workflows or [])
                        
                        # Prepare batch insert
                        deps_to_insert = [
                            {
                                'workflow_id': state_data.workflow_id,
                                'dependency_id': dep_id,
                                'is_child': dep_id in child_workflows
                            }
                            for dep_id in deps
                        ]
                        
                        if deps_to_insert:
                            await session.execute(
                                workflow_dependencies.insert(),
                                deps_to_insert
                            )
                    
                    # Update the cache
                    self._state_cache[state_data.workflow_id] = state_data
                    
                except SQLAlchemyError as e:
                    logger.error(f"Failed to save workflow state for {state_data.workflow_id}: {e}", exc_info=True)
                    await session.rollback()
                    raise
                except Exception as e:
                    logger.error(f"Unexpected error saving workflow state for {state_data.workflow_id}: {e}", exc_info=True)
                    await session.rollback()
                    raise

    async def _load_workflow_state(self, workflow_id: str) -> Optional[WorkflowStateData]:
        """Load workflow state from the database.
        
        Args:
            workflow_id: The ID of the workflow to load
            
        Returns:
            WorkflowStateData if found, None otherwise
        """
        async with AsyncSessionLocal() as session:
            try:
                result = await session.execute(
                    select(WorkflowDB).where(WorkflowDB.workflow_id == workflow_id)
                )
                workflow = result.scalar_one_or_none()
                
                if not workflow:
                    return None
                
                # Use the helper method that handles all the state conversion
                return await self._load_workflow_state_from_db(workflow, session)
                
            except SQLAlchemyError as e:
                logger.error(f"Error loading workflow state for {workflow_id}: {e}", exc_info=True)
                return None

    async def _delete_workflow_state(self, workflow_id: str) -> bool:
        """Delete workflow state from the database."""
        logger.debug(f"Deleting workflow state for {workflow_id}")
        
        async with AsyncSessionLocal() as session:
            async with session.begin():
                try:
                    # Delete dependencies first
                    await session.execute(
                        workflow_dependencies.delete().where(
                            workflow_dependencies.c.workflow_id == workflow_id
                        )
                    )
                    
                    # Delete the workflow
                    result = await session.execute(
                        select(WorkflowDB).where(WorkflowDB.workflow_id == workflow_id)
                    )
                    db_workflow = result.scalar_one_or_none()
                    
                    if db_workflow:
                        await session.delete(db_workflow)
                        # Remove from cache
                        self._state_cache.pop(workflow_id, None)
                        return True
                    return False
                    
                except SQLAlchemyError as e:
                    await session.rollback()
                    logger.error(f"Failed to delete workflow state: {str(e)}", exc_info=True)
                    return False