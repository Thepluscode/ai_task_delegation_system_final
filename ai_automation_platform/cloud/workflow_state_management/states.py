"""Workflow state definitions."""
from enum import Enum, auto

class WorkflowState(Enum):
    """Possible states of a workflow."""
    CREATED = auto()
    PENDING = auto()
    RUNNING = auto()
    PAUSED = auto()
    COMPLETED = auto()
    FAILED = auto()
    CANCELLED = auto()
