"""Base driver implementation for sensor devices."""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type, TypeVar, Generic, Callable, Awaitable
from datetime import datetime

from pydantic import BaseModel, Field

from ....communication import CommunicationManager
from .base_sensor import SensorReading, SensorConfig

logger = logging.getLogger(__name__)

class DriverConfig(BaseModel):
    """Configuration for a sensor driver."""
    driver_id: str = Field(..., description="Unique identifier for the driver")
    name: str = Field(..., description="Human-readable name for the driver")
    driver_type: str = Field(..., description="Type of the driver (e.g., 'gpio', 'i2c', 'spi')")
    connection_params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Parameters required to establish connection"
    )
    auto_connect: bool = Field(
        default=True,
        description="Whether to automatically connect when the driver is initialized"
    )
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Driver-specific configuration"
    )

class DriverEventType(str):
    """Types of events that can be emitted by a driver."""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    STATE_CHANGED = "state_changed"
    DATA_RECEIVED = "data_received"

class DriverEvent(BaseModel):
    """An event emitted by a driver."""
    event_type: str
    driver_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = Field(default_factory=dict)

# Type alias for event handler callbacks
EventHandler = Callable[['BaseDriver', DriverEvent], Awaitable[None]]

class BaseDriver(ABC):
    """Base class for all sensor drivers.
    
    This class provides common functionality for drivers that interface with
    physical sensor hardware.
    """
    
    def __init__(
        self,
        config: DriverConfig,
        comm_manager: Optional[CommunicationManager] = None
    ) -> None:
        """Initialize the driver with the given configuration.
        
        Args:
            config: Configuration for the driver
            comm_manager: Optional communication manager for system-wide messaging
        """
        self.config = config
        self.comm_manager = comm_manager
        self._is_connected = False
        self._event_handlers: Dict[str, List[EventHandler]] = {}
        self._sensors: Dict[str, 'BaseSensor'] = {}
        self._initialized = False
        
        # Register default event handlers
        self.on_event(self._default_event_handler)
    
    @property
    def driver_id(self) -> str:
        """Get the unique identifier for this driver."""
        return self.config.driver_id
    
    @property
    def name(self) -> str:
        """Get the display name of the driver."""
        return self.config.name or self.config.driver_id
    
    @property
    def is_connected(self) -> bool:
        """Check if the driver is connected to the hardware."""
        return self._is_connected
    
    @property
    def initialized(self) -> bool:
        """Check if the driver has been initialized."""
        return self._initialized
    
    async def initialize(self) -> None:
        """Initialize the driver.
        
        This method should be called before any other operations are performed.
        It sets up any required resources and establishes the initial connection
        if auto_connect is True.
        """
        if self._initialized:
            return
            
        logger.info(f"Initializing driver: {self.driver_id}")
        
        try:
            await self._initialize()
            
            if self.config.auto_connect:
                await self.connect()
                
            self._initialized = True
            logger.info(f"Driver initialized: {self.driver_id}")
            
        except Exception as e:
            error_msg = f"Failed to initialize driver {self.driver_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            await self._emit_event(DriverEventType.ERROR, {"error": error_msg})
            raise
    
    async def connect(self) -> None:
        """Establish connection to the hardware."""
        if self._is_connected:
            return
            
        logger.info(f"Connecting driver: {self.driver_id}")
        
        try:
            await self._connect()
            self._is_connected = True
            await self._emit_event(DriverEventType.CONNECTED, {})
            logger.info(f"Driver connected: {self.driver_id}")
            
        except Exception as e:
            error_msg = f"Failed to connect driver {self.driver_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            await self._emit_event(DriverEventType.ERROR, {"error": error_msg})
            raise
    
    async def disconnect(self) -> None:
        """Close the connection to the hardware."""
        if not self._is_connected:
            return
            
        logger.info(f"Disconnecting driver: {self.driver_id}")
        
        try:
            await self._disconnect()
            self._is_connected = False
            await self._emit_event(DriverEventType.DISCONNECTED, {})
            logger.info(f"Driver disconnected: {self.driver_id}")
            
        except Exception as e:
            error_msg = f"Error disconnecting driver {self.driver_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            await self._emit_event(DriverEventType.ERROR, {"error": error_msg})
            raise
    
    async def shutdown(self) -> None:
        """Shut down the driver and release all resources."""
        if not self._initialized:
            return
            
        logger.info(f"Shutting down driver: {self.driver_id}")
        
        try:
            # Disconnect if connected
            if self._is_connected:
                await self.disconnect()
            
            # Call implementation-specific cleanup
            await self._shutdown()
            
            # Clear event handlers and sensors
            self._event_handlers.clear()
            self._sensors.clear()
            
            self._initialized = False
            logger.info(f"Driver shut down: {self.driver_id}")
            
        except Exception as e:
            error_msg = f"Error shutting down driver {self.driver_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            await self._emit_event(DriverEventType.ERROR, {"error": error_msg})
            raise
    
    def register_sensor(self, sensor: 'BaseSensor') -> None:
        """Register a sensor with this driver.
        
        Args:
            sensor: The sensor to register
        """
        self._sensors[sensor.config.sensor_id] = sensor
        logger.debug(f"Registered sensor {sensor.config.sensor_id} with driver {self.driver_id}")
    
    def unregister_sensor(self, sensor_id: str) -> None:
        """Unregister a sensor from this driver.
        
        Args:
            sensor_id: The ID of the sensor to unregister
        """
        if sensor_id in self._sensors:
            del self._sensors[sensor_id]
            logger.debug(f"Unregistered sensor {sensor_id} from driver {self.driver_id}")
    
    def on_event(self, handler: EventHandler, event_types: Optional[List[str]] = None) -> None:
        """Register an event handler.
        
        Args:
            handler: The callback function to call when the event occurs
            event_types: List of event types to subscribe to. If None, subscribes to all events.
        """
        if event_types is None:
            event_types = list(DriverEventType.__dict__.values())
            
        for event_type in event_types:
            if event_type not in self._event_handlers:
                self._event_handlers[event_type] = []
            if handler not in self._event_handlers[event_type]:
                self._event_handlers[event_type].append(handler)
    
    def remove_event_handler(self, handler: EventHandler, event_types: Optional[List[str]] = None) -> None:
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
    
    async def _emit_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """Emit an event to all registered handlers.
        
        Args:
            event_type: The type of event
            data: Event data
        """
        event = DriverEvent(
            event_type=event_type,
            driver_id=self.driver_id,
            data=data
        )
        
        # Get handlers for this event type and all events
        handlers = []
        if event_type in self._event_handlers:
            handlers.extend(self._event_handlers[event_type])
        if '*' in self._event_handlers:
            handlers.extend(self._event_handlers['*'])
        
        # Call all handlers
        for handler in handlers:
            try:
                await handler(self, event)
            except Exception as e:
                logger.error(
                    f"Error in event handler for driver {self.driver_id} "
                    f"event {event_type}: {str(e)}",
                    exc_info=True
                )
    
    async def _default_event_handler(self, driver: 'BaseDriver', event: DriverEvent) -> None:
        """Default event handler for driver events."""
        logger.debug(f"Driver {driver.driver_id} event: {event.event_type}")
    
    # Abstract methods to be implemented by subclasses
    @abstractmethod
    async def _initialize(self) -> None:
        """Implementation-specific initialization."""
        pass
    
    @abstractmethod
    async def _connect(self) -> None:
        """Implementation-specific connection logic."""
        pass
    
    @abstractmethod
    async def _disconnect(self) -> None:
        """Implementation-specific disconnection logic."""
        pass
    
    async def _shutdown(self) -> None:
        """Implementation-specific cleanup during shutdown."""
        pass
