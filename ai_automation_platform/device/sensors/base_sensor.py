"""Base sensor implementation for the AI Automation Platform."""

import asyncio
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Type, TypeVar, Generic, Callable, Awaitable, Type

from pydantic import BaseModel, Field, validator

from ....communication import CommunicationManager
from .base_driver import BaseDriver, DriverEvent, DriverEventType

logger = logging.getLogger(__name__)

class SensorState(str, Enum):
    """Possible states of a sensor."""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    IDLE = "idle"
    ACTIVE = "active"
    ERROR = "error"
    CALIBRATING = "calibrating"

class SensorEventType(str, Enum):
    """Types of events that can be emitted by a sensor."""
    READING = "reading"
    STATE_CHANGED = "state_changed"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    CALIBRATION_STARTED = "calibration_started"
    CALIBRATION_COMPLETED = "calibration_completed"
    CONFIG_UPDATED = "config_updated"

class SensorReading(BaseModel):
    """A reading from a sensor."""
    sensor_id: str = Field(..., description="Unique identifier for the sensor")
    timestamp: datetime = Field(default_factory=datetime.utcnow, 
                              description="When the reading was taken")
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
    sensor_type: str = Field(..., description="Type of the sensor")
    driver_id: str = Field(..., description="ID of the driver that manages this sensor")
    address: Optional[str] = Field(None, description="Address or identifier of the sensor on the driver")
    poll_interval: float = Field(1.0, description="How often to poll the sensor (seconds)")
    enabled: bool = Field(True, description="Whether the sensor is enabled")
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Sensor-specific configuration"
    )

class SensorEvent(BaseModel):
    """An event from a sensor."""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sensor_id: str = Field(..., description="ID of the sensor that emitted the event")
    event_type: SensorEventType = Field(..., description="Type of the event")
    timestamp: datetime = Field(default_factory=datetime.utcnow, 
                              description="When the event occurred")
    data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Event-specific data"
    )
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

# Type variables for generic sensor and driver classes
T = TypeVar('T', bound=BaseModel)
DriverT = TypeVar('DriverT', bound=BaseDriver)

# Type aliases
EventHandler = Callable[['BaseSensor', SensorEvent], Awaitable[None]]

class BaseSensor(Generic[DriverT, T], ABC):
    """Base class for all sensors in the AI Automation Platform.
    
    This class provides common functionality for sensor devices, including:
    - Lifecycle management (initialize, start, stop, shutdown)
    - State management (idle, active, error, etc.)
    - Event emission for state changes and readings
    - Configuration management
    - Communication with drivers and other system components
    """
    
    def __init__(
        self,
        config: SensorConfig,
        driver: Optional[DriverT] = None,
        comm_manager: Optional[CommunicationManager] = None,
        **kwargs
    ) -> None:
        """Initialize the sensor with the given configuration and optional driver.
        
        Args:
            config: Configuration for the sensor
            driver: Optional driver instance that manages the sensor hardware
            comm_manager: Optional communication manager for system-wide messaging
            **kwargs: Additional keyword arguments for subclasses
        """
        self.config = config
        self.driver = driver
        self.comm_manager = comm_manager
        self._state = SensorState.DISCONNECTED
        self._last_reading: Optional[SensorReading] = None
        self._last_error: Optional[str] = None
        self._event_handlers: Dict[SensorEventType, List[EventHandler]] = {}
        self._task: Optional[asyncio.Task] = None
        self._stop_event = asyncio.Event()
        self._lock = asyncio.Lock()
        self._initialized = False
        
        # Set up default event handler for state changes
        self.on_event(self._default_event_handler, [SensorEventType.STATE_CHANGED])
        
        # If a driver is provided, subscribe to its events
        if self.driver:
            self.driver.on_event(self._handle_driver_event)
    
    @property
    def sensor_id(self) -> str:
        """Get the unique identifier for this sensor."""
        return self.config.sensor_id
    
    @property
    def name(self) -> str:
        """Get the display name of the sensor."""
        return self.config.name or self.config.sensor_id
    
    @property
    def state(self) -> SensorState:
        """Get the current state of the sensor."""
        return self._state
    
    @property
    def last_reading(self) -> Optional[SensorReading]:
        """Get the last reading from the sensor."""
        return self._last_reading
    
    @property
    def last_error(self) -> Optional[str]:
        """Get the last error message, if any."""
        return self._last_error
    
    async def initialize(self) -> None:
        """Initialize the sensor and its dependencies."""
        if self._initialized:
            return
            
        logger.info(f"Initializing sensor: {self.sensor_id}")
        
        try:
            await self._set_state(SensorState.CONNECTING)
            
            # Initialize driver if available
            if self.driver and not getattr(self.driver, 'initialized', False):
                await self.driver.initialize()
            
            # Call implementation-specific initialization
            await self._initialize()
            
            self._initialized = True
            await self._set_state(SensorState.IDLE)
            logger.info(f"Sensor initialized: {self.sensor_id}")
            
        except Exception as e:
            error_msg = f"Failed to initialize sensor {self.sensor_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self._last_error = error_msg
            await self._set_state(SensorState.ERROR, error_msg)
            raise
    
    async def start(self) -> None:
        """Start the sensor's operation."""
        if self.state == SensorState.ACTIVE:
            return
            
        if not self._initialized:
            await self.initialize()
            
        logger.info(f"Starting sensor: {self.sensor_id}")
        
        try:
            # Start driver if available
            if self.driver and getattr(self.driver, 'state', None) != 'connected':
                await self.driver.connect()
            
            # Start polling if configured
            if self.config.poll_interval > 0:
                self._stop_event.clear()
                self._task = asyncio.create_task(
                    self._polling_loop(), 
                    name=f"sensor-{self.sensor_id}-polling"
                )
            
            await self._set_state(SensorState.ACTIVE)
            logger.info(f"Sensor started: {self.sensor_id}")
            
        except Exception as e:
            error_msg = f"Failed to start sensor {self.sensor_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self._last_error = error_msg
            await self._set_state(SensorState.ERROR, error_msg)
            raise
    
    async def stop(self) -> None:
        """Stop the sensor's operation."""
        if self.state in {SensorState.DISCONNECTED, SensorState.ERROR}:
            return
            
        logger.info(f"Stopping sensor: {self.sensor_id}")
        
        try:
            self._stop_event.set()
            
            if self._task and not self._task.done():
                self._task.cancel()
                try:
                    await self._task
                except asyncio.CancelledError:
                    pass
                self._task = None
            
            await self._stop()
            
            # Don't stop the driver as it might be shared by other sensors
            
            await self._set_state(SensorState.IDLE)
            logger.info(f"Sensor stopped: {self.sensor_id}")
            
        except Exception as e:
            error_msg = f"Error stopping sensor {self.sensor_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self._last_error = error_msg
            await self._set_state(SensorState.ERROR, error_msg)
            raise
    
    async def shutdown(self) -> None:
        """Shut down the sensor and release resources."""
        if self.state == SensorState.DISCONNECTED:
            return
            
        logger.info(f"Shutting down sensor: {self.sensor_id}")
        
        try:
            # Stop the sensor if it's running
            if self.state != SensorState.IDLE:
                await self.stop()
            
            # Call the implementation-specific shutdown
            await self._shutdown()
            
            # Clear event handlers
            self._event_handlers.clear()
            
            self._initialized = False
            await self._set_state(SensorState.DISCONNECTED)
            logger.info(f"Sensor shut down: {self.sensor_id}")
            
        except Exception as e:
            error_msg = f"Error shutting down sensor {self.sensor_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self._last_error = error_msg
            await self._set_state(SensorState.ERROR, error_msg)
            raise
    
    async def take_reading(self) -> Optional[SensorReading]:
        """Take a single reading from the sensor."""
        if not self._initialized or self.state not in {SensorState.IDLE, SensorState.ACTIVE}:
            logger.warning(f"Cannot take reading: sensor {self.sensor_id} is not ready")
            return None
            
        try:
            reading = await self._read_sensor()
            if reading:
                self._last_reading = reading
                await self._emit_event(
                    SensorEventType.READING, 
                    {"reading": reading.dict()}
                )
                
                # Publish the reading via the communication manager if available
                if self.comm_manager:
                    await self.comm_manager.publish(
                        f"sensors/{self.sensor_id}/reading",
                        reading.dict()
                    )
                    
            return reading
            
        except Exception as e:
            error_msg = f"Error taking reading from sensor {self.sensor_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self._last_error = error_msg
            await self._set_state(SensorState.ERROR, error_msg)
            return None
    
    def on_event(
        self, 
        handler: EventHandler, 
        event_types: Optional[List[SensorEventType]] = None
    ) -> None:
        """Register an event handler.
        
        Args:
            handler: The callback function to call when the event occurs
            event_types: List of event types to subscribe to. If None, subscribes to all events.
        """
        if event_types is None:
            event_types = list(SensorEventType)
            
        for event_type in event_types:
            if event_type not in self._event_handlers:
                self._event_handlers[event_type] = []
            if handler not in self._event_handlers[event_type]:
                self._event_handlers[event_type].append(handler)
    
    def remove_event_handler(
        self, 
        handler: EventHandler, 
        event_types: Optional[List[SensorEventType]] = None
    ) -> None:
        """Remove an event handler.
        
        Args:
            handler: The handler function to remove
            event_types: List of event types to unsubscribe from. If None, unsubscribes from all events.
        """
        if event_types is None:
            event_types = list(self._event_handlers.keys())
            
        for event_type in event_types:
            if event_type in self._event_handlers:
                try:
                    self._event_handlers[event_type].remove(handler)
                except ValueError:
                    pass
    
    async def update_config(self, config: SensorConfig) -> None:
        """Update the sensor's configuration.
        
        Args:
            config: New configuration for the sensor
        """
        async with self._lock:
            old_config = self.config
            self.config = config
            
            # If the update interval changed and we're running, restart the polling loop
            if (old_config.poll_interval != config.poll_interval and 
                self.state == SensorState.ACTIVE and self._task):
                await self.stop()
                await self.start()
            
            # Notify about the config update
            await self._emit_event(
                SensorEventType.CONFIG_UPDATED,
                {"old_config": old_config.dict(), "new_config": config.dict()}
            )
    
    async def _polling_loop(self) -> None:
        """Background task that takes readings at the configured interval."""
        try:
            while not self._stop_event.is_set():
                start_time = asyncio.get_event_loop().time()
                
                await self.take_reading()
                
                elapsed = asyncio.get_event_loop().time() - start_time
                sleep_time = max(0, self.config.poll_interval - elapsed)
                
                while sleep_time > 0 and not self._stop_event.is_set():
                    await asyncio.sleep(min(0.1, sleep_time))
                    sleep_time -= 0.1
                    
        except asyncio.CancelledError:
            logger.info(f"Polling loop for sensor {self.sensor_id} was cancelled")
            raise
            
        except Exception as e:
            error_msg = f"Error in polling loop for sensor {self.sensor_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self._last_error = error_msg
            await self._set_state(SensorState.ERROR, error_msg)
    
    async def _handle_driver_event(self, driver: DriverT, event: DriverEvent) -> None:
        """Handle events from the associated driver."""
        if event.event_type == DriverEventType.STATE_CHANGED:
            new_state = event.data.get("new_state")
            
            if new_state == "error":
                error_msg = event.data.get("error", "Driver error")
                await self._set_state(SensorState.ERROR, f"Driver error: {error_msg}")
            elif new_state == "disconnected":
                await self._set_state(SensorState.DISCONNECTED, "Driver disconnected")
    
    async def _emit_event(
        self, 
        event_type: SensorEventType, 
        data: Optional[Dict[str, Any]] = None
    ) -> None:
        """Emit an event to all registered handlers."""
        if data is None:
            data = {}
            
        event = SensorEvent(
            sensor_id=self.sensor_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            data=data
        )
        
        handlers = self._event_handlers.get(event_type, []).copy()
        
        for handler in handlers:
            try:
                await handler(self, event)
            except Exception as e:
                logger.error(
                    f"Error in event handler for sensor {self.sensor_id} "
                    f"event {event_type}: {str(e)}",
                    exc_info=True
                )
    
    async def _set_state(
        self, 
        new_state: SensorState, 
        message: Optional[str] = None
    ) -> None:
        """Update the sensor's state and emit an event."""
        old_state = self._state
        
        if old_state == new_state:
            return
            
        self._state = new_state
        
        log_msg = f"Sensor {self.sensor_id} state changed: {old_state.value} -> {new_state.value}"
        if message:
            log_msg += f" ({message})"
        logger.info(log_msg)
        
        await self._emit_event(
            SensorEventType.STATE_CHANGED,
            {
                "old_state": old_state.value,
                "new_state": new_state.value,
                "message": message
            }
        )
    
    async def _default_event_handler(self, sensor: 'BaseSensor', event: SensorEvent) -> None:
        """Default event handler for state changes."""
        if event.event_type == SensorEventType.STATE_CHANGED:
            logger.debug(
                f"Sensor {sensor.sensor_id} state changed: "
                f"{event.data.get('old_state')} -> {event.data.get('new_state')}"
            )
    
    # Abstract methods to be implemented by subclasses
    @abstractmethod
    async def _initialize(self) -> None:
        """Implementation-specific initialization."""
        pass
    
    @abstractmethod
    async def _read_sensor(self) -> Optional[SensorReading]:
        """Read a single value from the sensor."""
        pass
    
    async def _stop(self) -> None:
        """Implementation-specific cleanup when the sensor is stopped."""
        pass
    
    async def _shutdown(self) -> None:
        """Implementation-specific cleanup during shutdown."""
        pass