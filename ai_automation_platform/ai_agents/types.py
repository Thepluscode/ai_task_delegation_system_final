"""Type definitions for AI Agents."""
from enum import Enum, auto
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime

class AgentState(str, Enum):
    """Possible states of an AI agent."""
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    INITIALIZING = "initializing"
    TERMINATED = "terminated"

class AgentRole(str, Enum):
    """Roles that an agent can have in the system."""
    WORKER = "worker"
    SUPERVISOR = "supervisor"
    ORCHESTRATOR = "orchestrator"
    ANALYTICS = "analytics"
    MONITOR = "monitor"

class AgentCapability(str, Enum):
    """Capabilities that an agent can have."""
    TASK_EXECUTION = "task_execution"
    DECISION_MAKING = "decision_making"
    PLANNING = "planning"
    LEARNING = "learning"
    PERCEPTION = "perception"
    COMMUNICATION = "communication"
    MEMORY = "memory"

class AgentConfig(BaseModel):
    """Configuration for an AI agent."""
    agent_id: str = Field(..., description="Unique identifier for the agent")
    agent_type: str = Field(..., description="Type/class of the agent")
    name: str = Field(..., description="Human-readable name of the agent")
    description: str = Field("", description="Description of the agent's purpose")
    role: AgentRole = Field(..., description="Primary role of the agent")
    capabilities: List[AgentCapability] = Field(
        default_factory=list,
        description="List of capabilities this agent possesses"
    )
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Agent-specific configuration parameters"
    )
    dependencies: List[str] = Field(
        default_factory=list,
        description="List of agent IDs this agent depends on"
    )

class AgentStatus(BaseModel):
    """Current status of an agent."""
    agent_id: str
    state: AgentState = AgentState.INITIALIZING
    last_heartbeat: datetime = Field(default_factory=datetime.utcnow)
    metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Performance and health metrics"
    )
    active_tasks: List[str] = Field(
        default_factory=list,
        description="IDs of tasks currently being processed"
    )

class AgentEventType(str, Enum):
    """Types of events that can be emitted by agents."""
    STATE_CHANGED = "state_changed"
    TASK_STARTED = "task_started"
    TASK_COMPLETED = "task_completed"
    TASK_FAILED = "task_failed"
    ERROR_OCCURRED = "error_occurred"
    HEARTBEAT = "heartbeat"

class AgentEvent(BaseModel):
    """An event emitted by an agent."""
    event_id: str = Field(default_factory=lambda: str(uuid4()))
    agent_id: str
    event_type: AgentEventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class TaskResult(BaseModel):
    """Result of a task execution."""
    task_id: str
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
