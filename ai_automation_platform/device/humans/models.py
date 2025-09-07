"""Models for human interaction components."""
from enum import Enum, auto
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator


class HumanRole(str, Enum):
    """Roles that humans can have in the system."""
    OPERATOR = "operator"
    SUPERVISOR = "supervisor"
    ADMINISTRATOR = "administrator"
    MAINTENANCE = "maintenance"
    GUEST = "guest"


class HumanState(str, Enum):
    """Possible states of a human user."""
    AVAILABLE = "available"
    BUSY = "busy"
    AWAY = "away"
    OFFLINE = "offline"
    ERROR = "error"


class HumanCapability(str, Enum):
    """Capabilities that humans can have in the system."""
    TASK_APPROVAL = "task_approval"
    TASK_OVERRIDE = "task_override"
    EMERGENCY_STOP = "emergency_stop"
    SYSTEM_CONFIG = "system_config"
    DEVICE_CONTROL = "device_control"
    DATA_ACCESS = "data_access"


class HumanInfo(BaseModel):
    """Information about a human user in the system."""
    user_id: str = Field(..., description="Unique user identifier")
    username: str = Field(..., description="Username for authentication")
    display_name: str = Field(..., description="Human-readable name")
    role: HumanRole = Field(..., description="User's role in the system")
    capabilities: List[HumanCapability] = Field(
        default_factory=list,
        description="List of user capabilities"
    )
    contact_info: Dict[str, str] = Field(
        default_factory=dict,
        description="Contact information (email, phone, etc.)"
    )
    preferences: Dict[str, Any] = Field(
        default_factory=dict,
        description="User preferences and settings"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the user was registered"
    )
    last_seen: Optional[datetime] = Field(
        None,
        description="When the user was last active"
    )

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        use_enum_values = True


class HumanStateUpdate(BaseModel):
    """Update model for human state changes."""
    state: HumanState
    message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HumanTaskAssignment(BaseModel):
    """Model for assigning tasks to humans."""
    task_id: str
    priority: int = 1
    deadline: Optional[datetime] = None
    instructions: str
    required_capabilities: List[HumanCapability] = Field(default_factory=list)
