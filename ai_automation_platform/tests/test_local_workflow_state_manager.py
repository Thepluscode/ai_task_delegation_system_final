"""Unit tests for LocalWorkflowStateManager."""
import asyncio
import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Any, Optional
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from edge.local_workflow_state.local_state_manager import (
    LocalWorkflowStateManager,
    TaskState,
    TaskStateData,
)


class TestLocalWorkflowStateManager(unittest.IsolatedAsyncioTestCase):
    """Test cases for LocalWorkflowStateManager."""

    async def asyncSetUp(self):
        """Set up test environment."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = str(Path(self.temp_dir.name) / "test_workflow.db")
        self.manager = LocalWorkflowStateManager(self.db_path)
        await self.manager.initialize()

    async def asyncTearDown(self):
        """Clean up test environment."""
        await self.manager.close()
        self.temp_dir.cleanup()

    async def test_initialization(self):
        """Test manager initialization."""
        self.assertTrue(self.manager._initialized)
        self.assertIsNotNone(self.manager._db_conn)

    async def test_set_and_get_state(self):
        """Test setting and getting task state."""
        task_id = "test_task"
        state = TaskState.IN_PROGRESS
        status_message = "Processing started"
        
        # Set state
        await self.manager.set_state(
            task_id=task_id,
            state=state,
            status_message=status_message,
            progress=0.25
        )
        
        # Get state
        result = await self.manager.get_state(task_id)
        
        # Verify
        self.assertIsNotNone(result)
        self.assertEqual(result.task_id, task_id)
        self.assertEqual(result.state, state)
        self.assertEqual(result.status_message, status_message)
        self.assertEqual(result.progress, 0.25)
        self.assertIsNotNone(result.last_updated)

    async def test_state_transitions(self):
        """Test valid and invalid state transitions."""
        task_id = "test_transition"
        
        # Valid transition: PENDING -> IN_PROGRESS
        await self.manager.set_state(task_id, TaskState.PENDING)
        await self.manager.set_state(task_id, TaskState.IN_PROGRESS)
        
        # Valid transition: IN_PROGRESS -> COMPLETED
        await self.manager.set_state(task_id, TaskState.COMPLETED)
        
        # Verify final state
        state = await self.manager.get_state(task_id)
        self.assertEqual(state.state, TaskState.COMPLETED)
        
        # Invalid transition: COMPLETED -> IN_PROGRESS (should raise)
        with self.assertRaises(ValueError):
            await self.manager.set_state(task_id, TaskState.IN_PROGRESS)

    async def test_dependencies(self):
        """Test task dependencies."""
        # Create tasks with dependencies
        task1 = "task1"
        task2 = "task2"
        
        # Task 1 has no dependencies
        await self.manager.set_state(task1, TaskState.PENDING)
        
        # Task 2 depends on task1
        await self.manager.set_state(
            task2, 
            TaskState.PENDING,
            dependencies={task1}
        )
        
        # Check dependencies
        ready, missing = await self.manager.check_dependencies_met(task2)
        self.assertFalse(ready)
        self.assertEqual(missing, [task1])
        
        # Complete task1
        await self.manager.set_state(task1, TaskState.COMPLETED)
        
        # Check dependencies again
        ready, missing = await self.manager.check_dependencies_met(task2)
        self.assertTrue(ready)
        self.assertEqual(missing, [])

    async def test_retry_failed_task(self):
        """Test retrying a failed task."""
        task_id = "failed_task"
        
        # Create a failed task
        await self.manager.set_state(
            task_id,
            TaskState.FAILED,
            error="Something went wrong",
            max_retries=3
        )
        
        # Retry the task
        with patch.object(self.manager, 'set_state') as mock_set_state:
            await self.manager.retry_task(task_id)
            
            # Should schedule a retry
            await asyncio.sleep(0.1)  # Let the retry schedule
            
            # Verify set_state was called with PENDING state
            args, kwargs = mock_set_state.call_args
            self.assertEqual(kwargs['state'], TaskState.PENDING)
            self.assertIn("Retry 1/3", kwargs['status_message'])

    async def test_cloud_sync(self):
        """Test cloud synchronization."""
        # Create a mock cloud provider
        mock_provider = AsyncMock()
        mock_provider.push_state.return_value = True
        
        # Initialize manager with cloud provider
        manager = LocalWorkflowStateManager(
            db_path=self.db_path,
            cloud_sync_provider=mock_provider
        )
        await manager.initialize()
        
        try:
            # Create a task and sync it
            task_id = "cloud_task"
            await manager.set_state(task_id, TaskState.PENDING)
            
            # Sync with cloud
            result = await manager.sync_with_cloud(task_id)
            
            # Verify
            self.assertTrue(result)
            mock_provider.push_state.assert_called_once()
            
            # Check the pushed state
            pushed_state = mock_provider.push_state.call_args[0][0]
            self.assertEqual(pushed_state['task_id'], task_id)
            self.assertEqual(pushed_state['state'], TaskState.PENDING.value)
            
        finally:
            await manager.close()

    async def test_cleanup_old_states(self):
        """Test cleaning up old task states."""
        # Create some old completed tasks
        old_time = datetime.now(timezone.utc) - timedelta(days=60)
        
        # Create a task with old timestamp
        with patch('edge.local_workflow_state.local_state_manager.datetime') as mock_datetime:
            mock_datetime.now.return_value = old_time
            await self.manager.set_state("old_task", TaskState.COMPLETED)
        
        # Create a recent task
        await self.manager.set_state("recent_task", TaskState.IN_PROGRESS)
        
        # Clean up tasks older than 30 days
        removed = await self.manager.cleanup_old_states(older_than_days=30)
        
        # Verify
        self.assertEqual(removed, 1)  # Only old_task should be removed
        
        # Verify old task is gone
        self.assertIsNone(await self.manager.get_state("old_task"))
        self.assertIsNotNone(await self.manager.get_state("recent_task"))

    async def test_concurrent_updates(self):
        """Test concurrent state updates."""
        task_id = "concurrent_task"
        num_updates = 10
        
        async def update_task(i):
            await asyncio.sleep(random.random() * 0.1)  # Random delay
            await self.manager.set_state(
                task_id,
                TaskState.IN_PROGRESS,
                status_message=f"Update {i}",
                progress=i/num_updates
            )
        
        # Run concurrent updates
        await asyncio.gather(*[update_task(i) for i in range(num_updates)])
        
        # Verify final state
        state = await self.manager.get_state(task_id)
        self.assertEqual(state.state, TaskState.IN_PROGRESS)
        self.assertTrue(0 <= state.progress <= 1.0)


if __name__ == "__main__":
    unittest.main()
