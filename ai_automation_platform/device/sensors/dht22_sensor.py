"""DHT22 Temperature and Humidity Sensor implementation."""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from pydantic import Field, validator

from .base_sensor import BaseSensor, SensorConfig, SensorReading, SensorState, SensorEventType
from .drivers.dht22_driver import DHT22Driver, DHT22Config

logger = logging.getLogger(__name__)

class DHT22Reading(SensorReading):
    """Extended SensorReading with temperature and humidity specific fields."""
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity percentage")
    heat_index: Optional[float] = Field(
        None,
        description="Heat index in Celsius (calculated from temperature and humidity)"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "sensor_id": "living_room_dht22",
                "timestamp": "2023-06-18T22:15:30.123456",
                "temperature": 23.5,
                "humidity": 45.2,
                "heat_index": 24.1,
                "unit": "celsius",
                "metadata": {"location": "living_room"}
            }
        }

class DHT22SensorConfig(SensorConfig):
    """Configuration for DHT22 sensor."""
    driver_config: DHT22Config = Field(
        default_factory=DHT22Config,
        description="Configuration for the DHT22 driver"
    )
    calculate_heat_index: bool = Field(
        True,
        description="Whether to calculate heat index from temperature and humidity"
    )
    temperature_offset: float = Field(
        0.0,
        description="Offset to apply to temperature readings (in Celsius)"
    )
    humidity_offset: float = Field(
        0.0,
        description="Offset to apply to humidity readings (in percentage)"
    )
    
    @validator('temperature_offset')
    def validate_temperature_offset(cls, v):
        """Validate temperature offset is reasonable."""
        if abs(v) > 10:
            raise ValueError("Temperature offset must be between -10 and 10")
        return v
    
    @validator('humidity_offset')
    def validate_humidity_offset(cls, v):
        """Validate humidity offset is reasonable."""
        if abs(v) > 10:
            raise ValueError("Humidity offset must be between -10 and 10")
        return v

class DHT22Sensor(BaseSensor[DHT22Driver, DHT22Reading]):
    """DHT22 Temperature and Humidity Sensor.
    
    This sensor provides temperature and humidity readings from a DHT22 sensor.
    It can also calculate the heat index (feels-like temperature) based on the
    temperature and humidity readings.
    """
    
    def __init__(
        self,
        config: DHT22SensorConfig,
        driver: Optional[DHT22Driver] = None,
        comm_manager: Optional[Any] = None
    ) -> None:
        """Initialize the DHT22 sensor.
        
        Args:
            config: Configuration for the sensor
            driver: Optional pre-configured DHT22 driver. If not provided, one will be created.
            comm_manager: Optional communication manager for system-wide messaging
        """
        # If no driver is provided, create one from the config
        if driver is None:
            driver = DHT22Driver(
                config=config.driver_config,
                comm_manager=comm_manager
            )
            
        super().__init__(config, driver, comm_manager)
        
        # Initialize driver reference with proper type hint
        self.driver: DHT22Driver = driver  # type: ignore[assignment]
    
    @classmethod
    def create(
        cls,
        sensor_id: str,
        name: str,
        gpio_pin: int = 4,
        poll_interval: float = 30.0,
        calculate_heat_index: bool = True,
        temperature_offset: float = 0.0,
        humidity_offset: float = 0.0,
        comm_manager: Optional[Any] = None
    ) -> 'DHT22Sensor':
        """Create a new DHT22 sensor with default configuration.
        
        Args:
            sensor_id: Unique identifier for the sensor
            name: Human-readable name for the sensor
            gpio_pin: GPIO pin number the sensor is connected to (BCM numbering)
            poll_interval: How often to poll the sensor (seconds)
            calculate_heat_index: Whether to calculate heat index
            temperature_offset: Offset to apply to temperature readings
            humidity_offset: Offset to apply to humidity readings
            comm_manager: Optional communication manager
            
        Returns:
            Configured DHT22Sensor instance
        """
        config = DHT22SensorConfig(
            sensor_id=sensor_id,
            name=name,
            sensor_type="dht22",
            poll_interval=poll_interval,
            driver_config=DHT22Config(
                driver_id=f"dht22_driver_{sensor_id}",
                name=f"DHT22 Driver for {name}",
                gpio_pin=gpio_pin
            ),
            calculate_heat_index=calculate_heat_index,
            temperature_offset=temperature_offset,
            humidity_offset=humidity_offset
        )
        
        return cls(config=config, comm_manager=comm_manager)
    
    async def _initialize(self) -> None:
        """Initialize the sensor."""
        logger.info(f"Initializing DHT22 sensor: {self.sensor_id}")
        
        # Initialize the driver if it's not already initialized
        if not getattr(self.driver, 'initialized', False):
            await self.driver.initialize()
        
        # Test the sensor with a reading
        try:
            reading = await self._read_sensor()
            if not reading:
                raise RuntimeError("Failed to get initial reading from DHT22")
            
            logger.info(
                f"DHT22 sensor {self.sensor_id} initialized with initial reading: "
                f"{reading.temperature:.1f}°C, {reading.humidity:.1f}%"
            )
            
        except Exception as e:
            error_msg = f"Failed to initialize DHT22 sensor {self.sensor_id}: {str(e)}"
            logger.error(error_msg)
            await self._emit_event(SensorEventType.ERROR, {"error": error_msg})
            raise
    
    async def _read_sensor(self) -> Optional[DHT22Reading]:
        """Read temperature and humidity from the DHT22 sensor."""
        try:
            # Read raw values from the driver
            raw_data = await self.driver.read_sensor()
            
            # Apply any configured offsets
            temperature = raw_data['temperature'] + self.config.temperature_offset
            humidity = raw_data['humidity'] + self.config.humidity_offset
            
            # Calculate heat index if enabled
            heat_index = None
            if self.config.calculate_heat_index:
                heat_index = self._calculate_heat_index(temperature, humidity)
            
            # Create and return the reading
            return DHT22Reading(
                sensor_id=self.sensor_id,
                temperature=round(temperature, 2),
                humidity=round(humidity, 2),
                heat_index=round(heat_index, 2) if heat_index is not None else None,
                unit="celsius",
                metadata={
                    "sensor_type": "DHT22",
                    "gpio_pin": self.config.driver_config.gpio_pin
                }
            )
            
        except Exception as e:
            error_msg = f"Error reading from DHT22 sensor {self.sensor_id}: {str(e)}"
            logger.error(error_msg, exc_info=True)
            await self._emit_event(SensorEventType.ERROR, {"error": error_msg})
            return None
    
    def _calculate_heat_index(self, temperature: float, humidity: float) -> float:
        """Calculate the heat index (feels-like temperature) in Celsius.
        
        Uses the Rothfusz regression equation for heat index.
        
        Args:
            temperature: Temperature in Celsius
            humidity: Relative humidity percentage (0-100)
            
        Returns:
            Heat index in Celsius
        """
        # Convert temperature to Fahrenheit for calculation
        tf = (temperature * 9/5) + 32
        
        # Constants for Rothfusz regression
        c1 = -42.379
        c2 = 2.04901523
        c3 = 10.14333127
        c4 = -0.22475541
        c5 = -6.83783e-3
        c6 = -5.481717e-2
        c7 = 1.22874e-3
        c8 = 8.5282e-4
        c9 = -1.99e-6
        
        # Calculate heat index in Fahrenheit
        hi_f = (
            c1 + 
            (c2 * tf) + 
            (c3 * humidity) + 
            (c4 * tf * humidity) + 
            (c5 * tf**2) + 
            (c6 * humidity**2) + 
            (c7 * tf**2 * humidity) + 
            (c8 * tf * humidity**2) + 
            (c9 * tf**2 * humidity**2)
        )
        
        # Convert back to Celsius and return
        return (hi_f - 32) * 5/9
    
    async def _stop(self) -> None:
        """Clean up when the sensor is stopped."""
        logger.info(f"Stopping DHT22 sensor: {self.sensor_id}")
        # The driver will be managed separately, so we don't shut it down here
        
    async def _shutdown(self) -> None:
        """Clean up resources during shutdown."""
        logger.info(f"Shutting down DHT22 sensor: {self.sensor_id}")
        # The driver will be managed separately, so we don't shut it down here

    # Convenience methods for direct access to readings
    async def get_temperature(self) -> Optional[float]:
        """Get the current temperature in Celsius."""
        reading = await self.take_reading()
        return reading.temperature if reading else None
    
    async def get_humidity(self) -> Optional[float]:
        """Get the current relative humidity percentage."""
        reading = await self.take_reading()
        return reading.humidity if reading else None
    
    async def get_heat_index(self) -> Optional[float]:
        """Get the current heat index in Celsius if enabled."""
        if not self.config.calculate_heat_index:
            return None
            
        reading = await self.take_reading()
        return reading.heat_index if reading else None
