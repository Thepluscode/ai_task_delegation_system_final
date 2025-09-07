"""Data models for local workflow state management."""
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Any, Union
import json
import uuid

from .enums import TaskState, TaskPriority, TaskType

@dataclass
class TaskDependency:
    """Represents a dependency between tasks."""
    task_id: str
    required_state: TaskState = TaskState.COMPLETED
    timeout: Optional[timedelta] = None
    
    def to_dict(self) -> dict:
        """Convert to a dictionary."""
        return {
            "task_id": self.task_id,
            "required_state": self.required_state.value,
            "timeout_seconds": self.timeout.total_seconds() if self.timeout else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'TaskDependency':
        """Create from a dictionary."""
        return cls(
            task_id=data["task_id"],
            required_state=TaskState(data["required_state"]),
            timeout=timedelta(seconds=data["timeout_seconds"]) if data.get("timeout_seconds") else None
        )

@dataclass
class TaskHistoryEntry:
    """A single entry in the task history."""
    timestamp: datetime
    state: TaskState
    message: str
    data: Optional[dict] = None
    
    def to_dict(self) -> dict:
        """Convert to a dictionary."""
        return {
            "timestamp": self.timestamp.isoformat(),
            "state": self.state.value,
            "message": self.message,
            "data": self.data or {}
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'TaskHistoryEntry':
        """Create from a dictionary."""
        return cls(
            timestamp=datetime.fromisoformat(data["timestamp"]),
            state=TaskState(data["state"]),
            message=data["message"],
            data=data.get("data")
        )

@dataclass
class TaskStateData:
    """Represents the state of a task."""
    task_id: str
    state: TaskState = TaskState.PENDING
    task_type: TaskType = TaskType.COMPUTE
    priority: TaskPriority = TaskPriority.NORMAL
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Task metadata
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Set[str] = field(default_factory=set)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Dependencies and relationships
    dependencies: List[TaskDependency] = field(default_factory=list)
    parent_task_id: Optional[str] = None
    child_task_ids: List[str] = field(default_factory=list)
    
    # Execution context
    retry_count: int = 0
    max_retries: int = 3
    timeout: Optional[timedelta] = None
    
    # Resource requirements
    required_resources: Dict[str, Any] = field(default_factory=dict)
    
    # Error handling
    error: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None
    
    # History and logging
    history: List[TaskHistoryEntry] = field(default_factory=list)
    
    def __post_init__(self):
        """Initialize the task state."""
        # Ensure task_id is a string
        self.task_id = str(self.task_id)
        
        # Ensure timestamps are timezone-aware
        if self.created_at and self.created_at.tzinfo is None:
            self.created_at = self.created_at.replace(tzinfo=datetime.utcnow().tzinfo)
        if self.updated_at and self.updated_at.tzinfo is None:
            self.updated_at = self.updated_at.replace(tzinfo=datetime.utcnow().tzinfo)
        if self.started_at and isinstance(self.started_at, str):
            self.started_at = datetime.fromisoformat(self.started_at)
        if self.completed_at and isinstance(self.completed_at, str):
            self.completed_at = datetime.fromisoformat(self.completed_at)
        
        # Convert string enums to enum values
        if isinstance(self.state, str):
            self.state = TaskState(self.state)
        if isinstance(self.task_type, str):
            self.task_type = TaskType(self.task_type)
        if isinstance(self.priority, (str, int)):
            if isinstance(self.priority, str):
                self.priority = TaskPriority[self.priority.upper()]
            else:
                self.priority = TaskPriority(self.priority)
        
        # Convert dependencies if needed
        if self.dependencies and isinstance(self.dependencies[0], dict):
            self.dependencies = [
                TaskDependency.from_dict(dep) if isinstance(dep, dict) else dep
                for dep in self.dependencies
            ]
        
        # Convert history entries if needed
        if self.history and isinstance(self.history[0], dict):
            self.history = [
                TaskHistoryEntry.from_dict(entry) if isinstance(entry, dict) else entry
                for entry in self.history
            ]
    
    def to_dict(self) -> dict:
        """Convert to a dictionary."""
        return {
            "task_id": self.task_id,
            "state": self.state.value,
            "task_type": self.task_type.value,
            "priority": self.priority.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "name": self.name,
            "description": self.description,
            "tags": list(self.tags),
            "metadata": self.metadata,
            "dependencies": [dep.to_dict() for dep in self.dependencies],
            "parent_task_id": self.parent_task_id,
            "child_task_ids": self.child_task_ids,
            "retry_count": self.retry_count,
            "max_retries": self.max_retries,
            "timeout_seconds": self.timeout.total_seconds() if self.timeout else None,
            "required_resources": self.required_resources,
            "error": self.error,
            "error_details": self.error_details,
            "history": [entry.to_dict() for entry in self.history]
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'TaskStateData':
        """Create from a dictionary."""
        # Handle potential nested serialization
        data = data.copy()
        
        # Convert string enums to enum values
        if 'state' in data and isinstance(data['state'], str):
            data['state'] = TaskState(data['state'])
        if 'task_type' in data and isinstance(data['task_type'], str):
            data['task_type'] = TaskType(data['task_type'])
        if 'priority' in data and isinstance(data['priority'], (str, int)):
            if isinstance(data['priority'], str):
                data['priority'] = TaskPriority[data['priority'].upper()]
            else:
                data['priority'] = TaskPriority(data['priority'])
        
        # Convert string timestamps to datetime objects
        timestamp_fields = ['created_at', 'updated_at', 'started_at', 'completed_at']
        for field in timestamp_fields:
            if field in data and data[field] and isinstance(data[field], str):
                data[field] = datetime.fromisoformat(data[field])
        
        # Convert timeout from seconds to timedelta
        if 'timeout_seconds' in data and data['timeout_seconds'] is not None:
            data['timeout'] = timedelta(seconds=data.pop('timeout_seconds'))
        
        # Convert dependencies
        if 'dependencies' in data and data['dependencies'] and isinstance(data['dependencies'][0], dict):
            data['dependencies'] = [TaskDependency.from_dict(dep) for dep in data['dependencies']]
        
        # Convert history entries
        if 'history' in data and data['history'] and isinstance(data['history'][0], dict):
            data['history'] = [TaskHistoryEntry.from_dict(entry) for entry in data['history']]
        
        # Convert tags to a set
        if 'tags' in data and not isinstance(data['tags'], set):
            data['tags'] = set(data['tags'])
        
        return cls(**data)
    
    def add_history_entry(self, state: TaskState, message: str, data: Optional[dict] = None) -> None:
        """Add an entry to the task history."""
        entry = TaskHistoryEntry(
            timestamp=datetime.utcnow(),
            state=state,
            message=message,
            data=data
        )
        self.history.append(entry)
        self.updated_at = datetime.utcnow()
    
    def update_state(self, new_state: TaskState, message: str, data: Optional[dict] = None) -> None:
        """Update the task state and add a history entry."""
        old_state = self.state
        self.state = new_state
        
        # Update timestamps
        self.updated_at = datetime.utcnow()
        
        if new_state == TaskState.RUNNING and not self.started_at:
            self.started_at = self.updated_at
        
        if new_state in (TaskState.COMPLETED, TaskState.FAILED, TaskState.CANCELLED, TaskState.TIMED_OUT):
            self.completed_at = self.updated_at
        
        # Add history entry
        history_data = {
            "old_state": old_state.value,
            "new_state": new_state.value,
            **(data or {})
        }
        self.add_history_entry(new_state, message, history_data)
    
    def add_dependency(self, task_id: str, required_state: TaskState = TaskState.COMPLETED, 
                      timeout: Optional[timedelta] = None) -> bool:
        """Add a dependency on another task."""
        # Check if dependency already exists
        if any(dep.task_id == task_id for dep in self.dependencies):
            return False
        
        self.dependencies.append(TaskDependency(
            task_id=task_id,
            required_state=required_state,
            timeout=timeout
        ))
        self.updated_at = datetime.utcnow()
        return True
    
    def remove_dependency(self, task_id: str) -> bool:
        """Remove a dependency on another task."""
        initial_count = len(self.dependencies)
        self.dependencies = [dep for dep in self.dependencies if dep.task_id != task_id]
        
        if len(self.dependencies) < initial_count:
            self.updated_at = datetime.utcnow()
            return True
        return False
    
    def get_dependency_status(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get the status of all dependencies."""
        result = {
            "met": [],
            "unmet": [],
            "failed": []
        }
        
        for dep in self.dependencies:
            dep_status = {
                "task_id": dep.task_id,
                "required_state": dep.required_state.value,
                "timeout_seconds": dep.timeout.total_seconds() if dep.timeout else None
            }
            
            # In a real implementation, we would check the actual state of the dependency
            # For now, we'll just return all dependencies as met
            result["met"].append(dep_status)
            
        return result
    
    def can_start(self) -> Tuple[bool, List[Dict[str, Any]]]:
        """Check if the task can start (all dependencies met)."""
        dep_status = self.get_dependency_status()
        
        if dep_status["unmet"] or dep_status["failed"]:
            return False, dep_status
            
        return True, dep_status
    
    def to_json(self) -> str:
        """Convert to a JSON string."""
        return json.dumps(self.to_dict(), indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'TaskStateData':
        """Create from a JSON string."""
        data = json.loads(json_str)
        return cls.from_dict(data)
    
    def __str__(self) -> str:
        """String representation of the task state."""
        return (f"TaskStateData(task_id='{self.task_id}', "
                f"state={self.state.value}, "
                f"type={self.task_type.value}, "
                f"priority={self.priority.value})")
