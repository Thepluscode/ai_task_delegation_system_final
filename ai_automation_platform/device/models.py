"""Device models and data structures."""
from enum import Enum, auto
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator


class DeviceType(str, Enum):
    """Supported device types."""
    ROBOT = "robot"
    SENSOR = "sensor"
    GATEWAY = "gateway"
    CONTROLLER = "controller"
    ACTUATOR = "actuator"
    CAMERA = "camera"
    UNKNOWN = "unknown"


class DeviceStatus(str, Enum):
    """Possible device statuses."""
    OFFLINE = "offline"
    ONLINE = "online"
    BUSY = "busy"
    ERROR = "error"
    UPDATING = "updating"
    MAINTENANCE = "maintenance"


class DeviceCapability(str, Enum):
    """Common device capabilities."""
    READ = "read"
    WRITE = "write"
    EXECUTE = "execute"
    STREAM = "stream"
    CONFIGURE = "configure"""


class DeviceInfo(BaseModel):
    """Device information model."""
    device_id: str = Field(..., description="Unique device identifier")
    name: str = Field(..., description="Human-readable device name")
    type: DeviceType = Field(..., description="Device type")
    manufacturer: str = Field("Unknown", description="Device manufacturer")
    model: str = Field("Unknown", description="Device model")
    firmware_version: str = Field("1.0.0", description="Device firmware version")
    capabilities: List[DeviceCapability] = Field(
        default_factory=list, 
        description="List of device capabilities"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional device metadata"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the device was registered"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the device was last updated"
    )

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        use_enum_values = True


class DeviceState(BaseModel):
    """Current device state."""
    status: DeviceStatus = Field(
        default=DeviceStatus.OFFLINE,
        description="Current device status"
    )
    last_seen: Optional[datetime] = Field(
        None,
        description="When the device was last seen online"
    )
    connection_info: Dict[str, Any] = Field(
        default_factory=dict,
        description="Connection information"
    )
    metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Device metrics (CPU, memory, etc.)"
    )
    errors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of recent errors"
    )

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
        }
