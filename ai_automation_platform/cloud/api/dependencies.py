"""Dependency injection for the Cloud API."""
from typing import Optional
from fastapi import Request
from ai_automation_platform.cloud.workflow_state_management.manager import WorkflowStateManager

# Global workflow manager instance
_workflow_manager: Optional[WorkflowStateManager] = None

def get_workflow_manager() -> WorkflowStateManager:
    """Dependency to get the workflow manager."""
    if _workflow_manager is None:
        raise RuntimeError("Workflow manager not initialized")
    return _workflow_manager

def set_workflow_manager(manager: WorkflowStateManager) -> None:
    """Set the global workflow manager instance."""
    global _workflow_manager
    _workflow_manager = manager
