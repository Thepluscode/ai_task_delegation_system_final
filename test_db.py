"""Test database initialization and table creation."""
import asyncio
import os
import sys
import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Any, List, Set

from sqlalchemy import select, text, func, and_
from sqlalchemy.exc import IntegrityError, NoResultFound

# Set timezone-aware UTC now function
utc_now = lambda: datetime.now(timezone.utc)

# Add the project root to the Python path
project_root = str(Path(__file__).parent.absolute())
sys.path.insert(0, project_root)

from ai_automation_platform.cloud.database.database import init_db, close_db, engine, AsyncSessionLocal
from ai_automation_platform.cloud.database.base import Base
from ai_automation_platform.cloud.database.models import WorkflowDB, workflow_dependencies as workflow_deps_table
from ai_automation_platform.cloud.workflow_state_management.manager import WorkflowStateManager
from ai_automation_platform.cloud.workflow_state_management.states import WorkflowState

# Helper functions
async def create_test_workflow(session, workflow_id: str, state: str = "PENDING", **kwargs) -> WorkflowDB:
    """Helper to create a test workflow."""
    workflow = WorkflowDB(
        workflow_id=workflow_id,
        state=state,
        metadata_=kwargs.get("metadata_", {"test": "data"}),
        error=kwargs.get("error"),
        retry_count=kwargs.get("retry_count", 0),
        max_retries=kwargs.get("max_retries", 3),
        parent_workflow_id=kwargs.get("parent_workflow_id"),
    )
    session.add(workflow)
    await session.commit()
    return workflow

# Pytest fixtures for async tests
@pytest.fixture(scope="module")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="function")
async def db_session():
    """Create a database session for testing."""
    # Initialize the database
    await init_db()
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Create a new session for testing
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
    
    # Clean up
    await close_db()

@pytest_asyncio.fixture
async def workflow_manager():
    """Create a WorkflowStateManager instance for testing."""
    manager = WorkflowStateManager("sqlite+aiosqlite:///:memory:")
    await manager.initialize()
    try:
        yield manager
    finally:
        await manager.close()

@pytest.mark.asyncio
async def test_database_init(db_session):
    """Test database initialization and table creation."""
    # Verify tables were created
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [row[0].lower() for row in result.fetchall()]
        
        # Check for required tables
        required_tables = ['workflows', 'workflow_dependencies']
        missing_tables = [t for t in required_tables if t not in tables]
        assert not missing_tables, f"Missing required tables: {missing_tables}"

@pytest.mark.asyncio
async def test_workflow_model(db_session):
    """Test creating and retrieving a workflow from the database."""
    # Create a test workflow
    workflow = await create_test_workflow(
        db_session,
        workflow_id="test_workflow_123",
        state="PENDING"
    )
    
    # Clear the session to ensure we're getting fresh data from the database
    db_session.expunge_all()
    
    # Retrieve from database
    result = await db_session.execute(
        select(WorkflowDB).where(WorkflowDB.workflow_id == "test_workflow_123")
    )
    db_workflow = result.scalar_one_or_none()
    
    # Verify data
    assert db_workflow is not None, "Workflow not found in database"
    assert db_workflow.workflow_id == "test_workflow_123"
    assert db_workflow.state == "PENDING"
    assert db_workflow.retry_count == 0
    assert db_workflow.max_retries == 3
    assert db_workflow.metadata_ == {"test": "data"}
    assert db_workflow.created_at is not None
    assert db_workflow.updated_at is not None
    assert db_workflow.created_at.replace(tzinfo=timezone.utc) <= utc_now()
    assert db_workflow.updated_at.replace(tzinfo=timezone.utc) <= utc_now()

@pytest.mark.asyncio
async def test_workflow_relationships(db_session):
    """Test workflow parent-child and dependency relationships."""
    try:
        # Create parent workflow
        parent = await create_test_workflow(
            db_session,
            workflow_id="parent_workflow",
            state="PENDING"
        )
        
        # Create child workflows
        child1 = await create_test_workflow(
            db_session,
            workflow_id="child1_workflow",
            state="PENDING",
            parent_workflow_id="parent_workflow"
        )
        
        child2 = await create_test_workflow(
            db_session,
            workflow_id="child2_workflow",
            state="PENDING",
            parent_workflow_id="parent_workflow"
        )
        
        # Create dependency workflow
        dependency = await create_test_workflow(
            db_session,
            workflow_id="dependency_workflow",
            state="COMPLETED"
        )
        
        # Add dependency relationship directly through the association table
        await db_session.execute(
            workflow_deps_table.insert().values(
                workflow_id="parent_workflow",
                dependency_id="dependency_workflow",
                is_child=False
            )
        )
        await db_session.commit()
        
        # Refresh all objects to get the latest state
        await db_session.refresh(parent)
        await db_session.refresh(child1)
        await db_session.refresh(child2)
        await db_session.refresh(dependency)
        
        # Test parent-child relationships
        result = await db_session.execute(
            select(WorkflowDB).where(WorkflowDB.parent_workflow_id == "parent_workflow")
        )
        children = result.scalars().all()
        assert len(children) == 2
        assert {w.workflow_id for w in children} == {"child1_workflow", "child2_workflow"}
        
        # Test dependency relationship
        result = await db_session.execute(
            select(workflow_deps_table).where(
                workflow_deps_table.c.workflow_id == "parent_workflow"
            )
        )
        deps = result.mappings().all()
        assert len(deps) == 1
        assert deps[0]["dependency_id"] == "dependency_workflow"
        assert deps[0]["is_child"] is False
        
    except Exception as e:
        await db_session.rollback()
        raise e

@pytest.mark.asyncio
async def test_workflow_state_transitions(workflow_manager):
    """Test workflow state transitions."""
    # Create a new workflow
    workflow_id = str(uuid4())
    workflow_data = {
        "workflow_id": workflow_id,
        "state": "PENDING",
        "metadata": {"test": "data"}
    }
    
    # Test initial state
    workflow = await workflow_manager.create_workflow(workflow_data)
    assert workflow.state == WorkflowState.PENDING
    
    # Test transition to RUNNING
    updated = await workflow_manager.update_workflow_state(
        workflow_id,
        WorkflowState.RUNNING
    )
    assert updated.state == WorkflowState.RUNNING
    
    # Test invalid transition (RUNNING -> PENDING)
    with pytest.raises(ValueError) as exc_info:
        await workflow_manager.update_workflow_state(
            workflow_id,
            WorkflowState.PENDING
        )
    assert "Invalid state transition" in str(exc_info.value)
    
    # Test valid transition to COMPLETED
    updated = await workflow_manager.update_workflow_state(
        workflow_id,
        WorkflowState.COMPLETED
    )
    assert updated.state == WorkflowState.COMPLETED

@pytest.mark.asyncio
async def test_concurrent_updates(workflow_manager):
    """Test handling of concurrent workflow updates."""
    workflow_id = str(uuid4())
    workflow_data = {
        "workflow_id": workflow_id,
        "state": "PENDING",
        "metadata": {"counter": 0}
    }
    
    # Create initial workflow
    await workflow_manager.create_workflow(workflow_data)
    
    # Simulate concurrent updates
    async def update_workflow():
        async with workflow_manager._lock:
            workflow = await workflow_manager.get_workflow(workflow_id)
            workflow.metadata["counter"] += 1
            return await workflow_manager.update_workflow(workflow_id, workflow.metadata)
    
    # Run multiple updates concurrently
    tasks = [update_workflow() for _ in range(5)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Verify all updates were applied
    final_workflow = await workflow_manager.get_workflow(workflow_id)
    assert final_workflow.metadata["counter"] == 5

@pytest.mark.asyncio
async def test_workflow_retries(workflow_manager):
    """Test workflow retry logic."""
    workflow_id = str(uuid4())
    workflow_data = {
        "workflow_id": workflow_id,
        "state": "PENDING",
        "retry_count": 0,
        "max_retries": 3
    }
    
    # Create workflow
    await workflow_manager.create_workflow(workflow_data)
    
    # Simulate failures and retries
    for i in range(3):
        workflow = await workflow_manager.get_workflow(workflow_id)
        assert workflow.retry_count == i
        assert workflow.state == WorkflowState.PENDING
        
        # Simulate failure
        await workflow_manager.update_workflow_state(
            workflow_id,
            WorkflowState.FAILED,
            error=f"Error attempt {i+1}"
        )
        
        # Verify retry count is incremented
        workflow = await workflow_manager.get_workflow(workflow_id)
        assert workflow.retry_count == i + 1
        
        if i < 2:
            # Retry the workflow
            await workflow_manager.update_workflow_state(
                workflow_id,
                WorkflowState.PENDING
            )
    
    # After max retries, workflow should be in FAILED state
    workflow = await workflow_manager.get_workflow(workflow_id)
    assert workflow.state == WorkflowState.FAILED
    assert "Error attempt 3" in workflow.error

@pytest.mark.asyncio
async def test_workflow_cleanup(workflow_manager):
    """Test cleanup of old completed workflows."""
    now = utc_now()
    
    # Create test workflow IDs
    old_completed_id = "test_old_completed_" + str(uuid4())
    new_completed_id = "test_new_completed_" + str(uuid4())
    old_failed_id = "test_old_failed_" + str(uuid4())
    
    try:
        # Create old and new workflows in different states
        await workflow_manager.create_workflow({
            "workflow_id": old_completed_id,
            "state": "COMPLETED"
        })
        
        # Update the updated_at timestamp to be old
        async with AsyncSessionLocal() as session:
            async with session.begin():
                workflow = await session.get(WorkflowDB, old_completed_id)
                if workflow:
                    workflow.updated_at = now - timedelta(days=8)
        
        await workflow_manager.create_workflow({
            "workflow_id": new_completed_id,
            "state": "COMPLETED"
        })
        
        await workflow_manager.create_workflow({
            "workflow_id": old_failed_id,
            "state": "FAILED"
        })
        
        # Update the updated_at timestamp to be old
        async with AsyncSessionLocal() as session:
            async with session.begin():
                workflow = await session.get(WorkflowDB, old_failed_id)
                if workflow:
                    workflow.updated_at = now - timedelta(days=8)
        
        # Run cleanup for workflows older than 7 days
        await workflow_manager.cleanup_old_workflows(older_than_days=7)
        
        # Verify old completed and failed workflows were deleted
        assert await workflow_manager.get_workflow(old_completed_id) is None
        assert await workflow_manager.get_workflow(old_failed_id) is None
        
        # Verify new completed workflow still exists
        assert await workflow_manager.get_workflow(new_completed_id) is not None
    except Exception as e:
        # Clean up any created workflows
        for workflow_id in [old_completed_id, new_completed_id, old_failed_id]:
            try:
                await workflow_manager.delete_workflow(workflow_id)
            except Exception:
                pass
        raise e
