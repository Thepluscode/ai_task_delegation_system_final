# edge/local_workflow_state/manager.py
import asyncio
import aiosqlite
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Set, Any, AsyncIterator
from pathlib import Path

from .models import TaskStateData, TaskDependency, TaskHistoryEntry
from .enums import TaskState, TaskPriority, TaskType

logger = logging.getLogger(__name__)

class LocalWorkflowStateManager:
    """
    Manages workflow state locally on edge devices with SQLite persistence.
    Provides async CRUD operations for tasks with dependency management.
    """
    
    def __init__(self, db_path: str = "workflow_state.db"):
        self.db_path = db_path
        self._db = None
        self._lock = asyncio.Lock()
        self._cache: Dict[str, TaskStateData] = {}
        
    async def initialize(self) -> None:
        """Initialize the database and create tables if they don't exist."""
        async with self._lock:
            self._db = await aiosqlite.connect(self.db_path)
            self._db.row_factory = aiosqlite.Row
            
            # Enable WAL mode for better concurrency
            await self._db.execute("PRAGMA journal_mode=WAL")
            
            # Create tables
            await self._create_tables()
            
            # Load existing tasks into cache
            await self._load_tasks_into_cache()
    
    async def _create_tables(self) -> None:
        """Create database tables if they don't exist."""
        await self._db.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id TEXT PRIMARY KEY,
            state TEXT NOT NULL,
            task_type TEXT NOT NULL,
            priority INTEGER NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            metadata TEXT NOT NULL,
            error TEXT,
            retry_count INTEGER DEFAULT 0,
            max_retries INTEGER DEFAULT 3,
            is_active INTEGER DEFAULT 1
        )
        """)
        
        await self._db.execute("""
        CREATE TABLE IF NOT EXISTS task_dependencies (
            parent_id TEXT NOT NULL,
            child_id TEXT NOT NULL,
            dependency_type TEXT NOT NULL,
            PRIMARY KEY (parent_id, child_id),
            FOREIGN KEY (parent_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
            FOREIGN KEY (child_id) REFERENCES tasks(task_id) ON DELETE CASCADE
        )
        """)
        
        await self._db.execute("""
        CREATE TABLE IF NOT EXISTS task_history (
            task_id TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL,
            from_state TEXT,
            to_state TEXT NOT NULL,
            message TEXT NOT NULL,
            data TEXT,
            PRIMARY KEY (task_id, timestamp),
            FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
        )
        """)
        
        await self._db.execute("""
        CREATE INDEX IF NOT EXISTS idx_task_state ON tasks(state)
        """)
        
        await self._db.execute("""
        CREATE INDEX IF NOT EXISTS idx_task_updated ON tasks(updated_at)
        """)
        
        await self._db.commit()
    
    async def _load_tasks_into_cache(self) -> None:
        """Load all active tasks from the database into the cache."""
        async with self._db.execute("SELECT * FROM tasks WHERE is_active = 1") as cursor:
            async for row in cursor:
                task = await self._row_to_task(row)
                self._cache[task.task_id] = task
    
    async def create_task(self, task_data: Dict[str, Any]) -> TaskStateData:
        """Create a new task with the given data."""
        task_id = task_data.get("task_id") or str(uuid.uuid4())
        
        # Create task object
        task = TaskStateData(
            task_id=task_id,
            state=TaskState.PENDING,
            task_type=TaskType.from_str(task_data.get("task_type", "compute")),
            priority=TaskPriority.from_str(task_data.get("priority", "normal")),
            metadata=task_data.get("metadata", {}),
            max_retries=task_data.get("max_retries", 3)
        )
        
        async with self._lock:
            # Insert task into database
            await self._db.execute(
                """
                INSERT INTO tasks (
                    task_id, state, task_type, priority, created_at, updated_at, 
                    metadata, max_retries, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    task.task_id,
                    task.state.value,
                    task.task_type.value,
                    task.priority.value,
                    task.created_at.isoformat(),
                    task.updated_at.isoformat(),
                    json.dumps(task.metadata),
                    task.max_retries,
                    1
                )
            )
            
            # Add to cache
            self._cache[task_id] = task
            
            # Add initial history entry
            await self._add_history_entry(
                task_id,
                None,
                task.state,
                "Task created"
            )
            
            # Process dependencies if any
            dependencies = task_data.get("dependencies", [])
            if dependencies:
                await self._add_dependencies(task_id, dependencies)
            
            await self._db.commit()
            
        return task
    
    async def get_task(self, task_id: str) -> Optional[TaskStateData]:
        """Get a task by ID, first checking cache then database."""
        # Check cache first
        if task_id in self._cache:
            return self._cache[task_id]
            
        # If not in cache, try to load from database
        async with self._lock:
            async with self._db.execute(
                "SELECT * FROM tasks WHERE task_id = ?", 
                (task_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if not row:
                    return None
                    
                task = await self._row_to_task(row)
                self._cache[task_id] = task
                return task
    
    async def update_task_state(
        self,
        task_id: str,
        new_state: TaskState,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Optional[TaskStateData]:
        """Update a task's state with validation."""
        task = await self.get_task(task_id)
        if not task:
            return None
            
        # Validate state transition
        if not self._is_valid_transition(task.state, new_state):
            logger.warning(
                f"Invalid state transition: {task.state} -> {new_state} for task {task_id}"
            )
            return None
            
        old_state = task.state
        task.state = new_state
        task.updated_at = datetime.utcnow()
        
        # Handle retry count
        if new_state == TaskState.RETRYING:
            task.retry_count += 1
        
        async with self._lock:
            # Update database
            await self._db.execute(
                """
                UPDATE tasks 
                SET state = ?, updated_at = ?, retry_count = ?
                WHERE task_id = ?
                """,
                (
                    task.state.value,
                    task.updated_at.isoformat(),
                    task.retry_count,
                    task_id
                )
            )
            
            # Update cache
            self._cache[task_id] = task
            
            # Add history entry
            await self._add_history_entry(
                task_id,
                old_state,
                new_state,
                message,
                data
            )
            
            await self._db.commit()
            
        return task
    
    async def delete_task(self, task_id: str, force: bool = False) -> bool:
        """Delete a task and its dependencies."""
        task = await self.get_task(task_id)
        if not task:
            return False
            
        # Don't delete active tasks unless forced
        if task.state not in (TaskState.COMPLETED, TaskState.FAILED, TaskState.CANCELLED) and not force:
            logger.warning(f"Cannot delete active task {task_id} without force flag")
            return False
            
        async with self._lock:
            # Mark as inactive in database (soft delete)
            await self._db.execute(
                "UPDATE tasks SET is_active = 0 WHERE task_id = ?",
                (task_id,)
            )
            
            # Remove from cache
            self._cache.pop(task_id, None)
            
            await self._db.commit()
            
        return True
    
    async def get_task_dependencies(self, task_id: str) -> List[TaskDependency]:
        """Get all dependencies for a task."""
        dependencies = []
        async with self._db.execute(
            """
            SELECT td.*, t.state as parent_state 
            FROM task_dependencies td
            JOIN tasks t ON td.parent_id = t.task_id
            WHERE td.child_id = ?
            """,
            (task_id,)
        ) as cursor:
            async for row in cursor:
                dependencies.append(TaskDependency(
                    parent_id=row["parent_id"],
                    child_id=row["child_id"],
                    dependency_type=row["dependency_type"],
                    parent_state=TaskState(row["parent_state"])
                ))
        return dependencies
    
    async def get_dependent_tasks(self, task_id: str) -> List[TaskStateData]:
        """Get all tasks that depend on the given task."""
        dependents = []
        async with self._db.execute(
            "SELECT child_id FROM task_dependencies WHERE parent_id = ?",
            (task_id,)
        ) as cursor:
            async for row in cursor:
                task = await self.get_task(row["child_id"])
                if task:
                    dependents.append(task)
        return dependents
    
    async def get_task_history(self, task_id: str) -> List[TaskHistoryEntry]:
        """Get the history of a task."""
        history = []
        async with self._db.execute(
            "SELECT * FROM task_history WHERE task_id = ? ORDER BY timestamp",
            (task_id,)
        ) as cursor:
            async for row in cursor:
                history.append(TaskHistoryEntry(
                    task_id=row["task_id"],
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    from_state=TaskState(row["from_state"]) if row["from_state"] else None,
                    to_state=TaskState(row["to_state"]),
                    message=row["message"],
                    data=json.loads(row["data"]) if row["data"] else None
                ))
        return history
    
    async def find_ready_tasks(self, limit: int = 100) -> List[TaskStateData]:
        """Find tasks that are ready to run (all dependencies met)."""
        ready_tasks = []
        async with self._lock:
            # Get all pending tasks
            async with self._db.execute(
                "SELECT * FROM tasks WHERE state = ? AND is_active = 1",
                (TaskState.PENDING.value,)
            ) as cursor:
                async for row in cursor:
                    task = await self._row_to_task(row)
                    if await self._are_dependencies_met(task.task_id):
                        ready_tasks.append(task)
                        if len(ready_tasks) >= limit:
                            break
        return ready_tasks
    
    async def cleanup_old_tasks(self, older_than_days: int = 30) -> int:
        """Clean up old completed/failed tasks."""
        cutoff = datetime.utcnow() - timedelta(days=older_than_days)
        count = 0
        
        async with self._lock:
            # Find tasks to delete
            async with self._db.execute(
                """
                SELECT task_id FROM tasks 
                WHERE updated_at < ? 
                AND state IN (?, ?, ?)
                AND is_active = 1
                """,
                (
                    cutoff.isoformat(),
                    TaskState.COMPLETED.value,
                    TaskState.FAILED.value,
                    TaskState.CANCELLED.value
                )
            ) as cursor:
                task_ids = [row["task_id"] async for row in cursor]
            
            # Delete tasks
            for task_id in task_ids:
                await self.delete_task(task_id)
                count += 1
                
            await self._db.commit()
            
        return count
    
    async def close(self) -> None:
        """Close the database connection."""
        if self._db:
            await self._db.close()
            self._db = None
    
    # Helper methods
    
    async def _add_dependencies(self, task_id: str, dependencies: List[Dict[str, str]]) -> None:
        """Add dependencies for a task."""
        for dep in dependencies:
            await self._db.execute(
                """
                INSERT OR IGNORE INTO task_dependencies 
                (parent_id, child_id, dependency_type)
                VALUES (?, ?, ?)
                """,
                (
                    dep["parent_id"],
                    task_id,
                    dep.get("type", "completion")  # completion, success, etc.
                )
            )
    
    async def _are_dependencies_met(self, task_id: str) -> bool:
        """Check if all dependencies for a task are met."""
        deps = await self.get_task_dependencies(task_id)
        if not deps:
            return True
            
        for dep in deps:
            parent = await self.get_task(dep.parent_id)
            if not parent:
                return False
                
            if dep.dependency_type == "completion":
                if parent.state not in (TaskState.COMPLETED, TaskState.FAILED):
                    return False
            elif dep.dependency_type == "success":
                if parent.state != TaskState.COMPLETED:
                    return False
                    
        return True
    
    async def _add_history_entry(
        self,
        task_id: str,
        from_state: Optional[TaskState],
        to_state: TaskState,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> None:
        """Add an entry to the task history."""
        await self._db.execute(
            """
            INSERT INTO task_history 
            (task_id, timestamp, from_state, to_state, message, data)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                task_id,
                datetime.utcnow().isoformat(),
                from_state.value if from_state else None,
                to_state.value,
                message,
                json.dumps(data) if data else None
            )
        )
    
    def _is_valid_transition(self, from_state: TaskState, to_state: TaskState) -> bool:
        """Check if a state transition is valid."""
        # Terminal states can't be changed
        if from_state in (TaskState.COMPLETED, TaskState.FAILED, TaskState.CANCELLED):
            return False
            
        # Any state can transition to failed or cancelled
        if to_state in (TaskState.FAILED, TaskState.CANCELLED):
            return True
            
        # Define valid transitions
        transitions = {
            TaskState.PENDING: {TaskState.QUEUED, TaskState.RUNNING},
            TaskState.QUEUED: {TaskState.RUNNING, TaskState.CANCELLED},
            TaskState.RUNNING: {TaskState.PAUSED, TaskState.COMPLETED, TaskState.RETRYING},
            TaskState.PAUSED: {TaskState.RUNNING, TaskState.CANCELLED},
            TaskState.RETRYING: {TaskState.RUNNING, TaskState.FAILED}
        }
        
        return to_state in transitions.get(from_state, set())
    
    async def _row_to_task(self, row) -> TaskStateData:
        """Convert a database row to a TaskStateData object."""
        return TaskStateData(
            task_id=row["task_id"],
            state=TaskState(row["state"]),
            task_type=TaskType(row["task_type"]),
            priority=TaskPriority(row["priority"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
            metadata=json.loads(row["metadata"]),
            error=row["error"],
            retry_count=row["retry_count"],
            max_retries=row["max_retries"]
        )
    
    # Context manager support
    async def __aenter__(self):
        await self.initialize()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

# Singleton instance
local_workflow_manager = LocalWorkflowStateManager()