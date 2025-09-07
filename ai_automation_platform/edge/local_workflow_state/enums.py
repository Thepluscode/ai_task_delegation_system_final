"""Enums for the local workflow state management."""
from enum import Enum, auto

class TaskState(Enum):
    """Possible states of a task."""
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"
    TIMED_OUT = "timed_out"
    
    @classmethod
    def is_terminal(cls, state: 'TaskState') -> bool:
        """Check if a state is terminal (no further transitions)."""
        return state in (cls.COMPLETED, cls.FAILED, cls.CANCELLED, cls.TIMED_OUT)
    
    @classmethod
    def is_active(cls, state: 'TaskState') -> bool:
        """Check if a state is active (can make progress)."""
        return state in (cls.QUEUED, cls.RUNNING, cls.RETRYING)


class TaskPriority(Enum):
    """Priority levels for tasks."""
    LOWEST = 0
    LOW = 1
    NORMAL = 2
    HIGH = 3
    HIGHEST = 4
    CRITICAL = 5
    
    @classmethod
    def from_string(cls, priority_str: str) -> 'TaskPriority':
        """Convert a string to a TaskPriority."""
        try:
            return cls[priority_str.upper()]
        except KeyError:
            return cls.NORMAL


class TaskType(Enum):
    """Types of tasks."""
    COMPUTE = "compute"
    IO = "io"
    NETWORK = "network"
    SENSOR = "sensor"
    ACTUATOR = "actuator"
    AI_MODEL = "ai_model"
    DATA_PROCESSING = "data_processing"
    USER_INTERACTION = "user_interaction"
    BATCH = "batch"
    STREAMING = "streaming"
    
    @classmethod
    def from_string(cls, type_str: str) -> 'TaskType':
        """Convert a string to a TaskType."""
        try:
            return cls(type_str.lower())
        except ValueError:
            return cls.COMPUTE  # Default to COMPUTE for unknown types
