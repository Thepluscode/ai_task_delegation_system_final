"""Type definitions for sensors and drivers."""
from enum import Enum, auto
from typing import Dict, Any, List, Optional, Union, Type, TypeVar
from pydantic import BaseModel, Field, validator
from datetime import datetime

class SensorType(str, Enum):
    """Types of sensors."""
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    PRESSURE = "pressure"
    LIGHT = "light"
    MOTION = "motion"
    PROXIMITY = "proximity"
    GPS = "gps"
    ACCELEROMETER = "accelerometer"
    GYROSCOPE = "gyroscope"
    MAGNETOMETER = "magnetometer"
    CAMERA = "camera"
    MICROPHONE = "microphone"
    CUSTOM = "custom"

class SensorState(str, Enum):
    """Possible states of a sensor."""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    IDLE = "idle"
    ACTIVE = "active"
    ERROR = "error"
    CALIBRATING = "calibrating"

class DriverState(str, Enum):
    """Possible states of a driver."""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    UNAVAILABLE = "unavailable"

class SensorEventType(str, Enum):
    """Types of sensor events."""
    READING = "reading"
    STATE_CHANGED = "state_changed"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    CALIBRATION_STARTED = "calibration_started"
    CALIBRATION_COMPLETED = "calibration_completed"
    CONFIG_UPDATED = "config_updated"

class DriverEventType(str, Enum):
    """Types of driver events."""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    STATE_CHANGED = "state_changed"
    ERROR = "error"
    COMMAND_RECEIVED = "command_received"
    COMMAND_COMPLETED = "command_completed"
    COMMAND_FAILED = "command_failed"

class SensorReading(BaseModel):
    """A reading from a sensor."""
    sensor_id: str = Field(..., description="Unique identifier for the sensor")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the reading was taken")
    value: Any = Field(..., description="The sensor reading value")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata about the reading"
    )
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class SensorConfig(BaseModel):
    """Configuration for a sensor."""
    sensor_id: str = Field(..., description="Unique identifier for the sensor")
    name: str = Field(..., description="Human-readable name for the sensor")
    sensor_type: SensorType = Field(..., description="Type of the sensor")
    driver_id: str = Field(..., description="ID of the driver that manages this sensor")
    address: Optional[str] = Field(None, description="Address or identifier of the sensor on the driver")
    poll_interval: float = Field(1.0, description="How often to poll the sensor (seconds)")
    enabled: bool = Field(True, description="Whether the sensor is enabled")
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Sensor-specific configuration"
    )

class DriverConfig(BaseModel):
    """Configuration for a driver."""
    driver_id: str = Field(..., description="Unique identifier for the driver")
    driver_type: str = Field(..., description="Type of the driver")
    name: str = Field(..., description="Human-readable name for the driver")
    connection_string: Optional[str] = Field(
        None,
        description="Connection string or parameters for the driver"
    )
    auto_connect: bool = Field(
        True,
        description="Whether to automatically connect the driver on startup"
    )
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Driver-specific configuration"
    )

class SensorEvent(BaseModel):
    """An event from a sensor."""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sensor_id: str
    event_type: SensorEventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class DriverEvent(BaseModel):
    """An event from a driver."""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    driver_id: str
    event_type: DriverEventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class SensorStatus(BaseModel):
    """Current status of a sensor."""
    sensor_id: str
    state: SensorState = SensorState.DISCONNECTED
    last_reading: Optional[SensorReading] = None
    last_error: Optional[str] = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class DriverStatus(BaseModel):
    """Current status of a driver."""
    driver_id: str
    state: DriverState = DriverState.DISCONNECTED
    last_error: Optional[str] = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    connected_devices: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
