"""Driver for the DHT22 temperature and humidity sensor."""

import asyncio
import logging
from typing import Any, Dict, Optional, Type

import adafruit_dht
import board
from adafruit_dht import DHT22 as DHT22_Sensor

from ....communication import CommunicationManager
from ...base_driver import BaseDriver, DriverConfig, DriverEventType

logger = logging.getLogger(__name__)

class DHT22Config(DriverConfig):
    """Configuration for DHT22 driver."""
    gpio_pin: int = Field(
        default=4,
        description="GPIO pin number the sensor is connected to (using BCM numbering)"
    )
    retry_count: int = Field(
        default=3,
        description="Number of times to retry reading from the sensor before failing"
    )
    retry_delay: float = Field(
        default=0.5,
        description="Delay between retry attempts in seconds"
    )

class DHT22Driver(BaseDriver):
    """Driver for the DHT22 temperature and humidity sensor.
    
    This driver uses the Adafruit CircuitPython DHT library to communicate with
    the DHT22 sensor over a single GPIO pin.
    """
    
    def __init__(
        self,
        config: DHT22Config,
        comm_manager: Optional[CommunicationManager] = None
    ) -> None:
        """Initialize the DHT22 driver.
        
        Args:
            config: Configuration for the DHT22 driver
            comm_manager: Optional communication manager for system-wide messaging
        """
        super().__init__(config, comm_manager)
        self._sensor: Optional[DHT22_Sensor] = None
        self._pin_map = {
            4: board.D4,
            17: board.D17,
            18: board.D18,
            22: board.D22,
            23: board.D23,
            24: board.D24,
            25: board.D25,
            27: board.D27
        }
    
    async def _initialize(self) -> None:
        """Initialize the DHT22 sensor."""
        try:
            pin = self._get_pin()
            self._sensor = DHT22_Sensor(pin, use_pulseio=False)
            # Give the sensor time to initialize
            await asyncio.sleep(1)
            logger.info(f"DHT22 driver initialized on GPIO {self.config.gpio_pin}")
        except Exception as e:
            error_msg = f"Failed to initialize DHT22 on GPIO {self.config.gpio_pin}: {str(e)}"
            logger.error(error_msg)
            await self._emit_event(DriverEventType.ERROR, {"error": error_msg})
            raise
    
    async def _connect(self) -> None:
        """Connect to the DHT22 sensor.
        
        For the DHT22, this is a no-op since connection is handled in _initialize.
        """
        pass
    
    async def _disconnect(self) -> None:
        """Disconnect from the DHT22 sensor."""
        if self._sensor:
            try:
                self._sensor.exit()
                logger.info(f"DHT22 driver disconnected from GPIO {self.config.gpio_pin}")
            except Exception as e:
                error_msg = f"Error disconnecting DHT22: {str(e)}"
                logger.error(error_msg)
                await self._emit_event(DriverEventType.ERROR, {"error": error_msg})
    
    async def read_sensor(self) -> Dict[str, float]:
        """Read temperature and humidity from the DHT22 sensor.
        
        Returns:
            Dictionary containing 'temperature' in Celsius and 'humidity' percentage
            
        Raises:
            RuntimeError: If the sensor cannot be read after retries
        """
        if not self._sensor:
            raise RuntimeError("DHT22 sensor not initialized")
        
        last_error = None
        
        for attempt in range(self.config.retry_count):
            try:
                # Read temperature and humidity
                temperature = self._sensor.temperature
                humidity = self._sensor.humidity
                
                # Validate readings
                if temperature is not None and humidity is not None:
                    return {
                        'temperature': float(temperature),
                        'humidity': float(humidity)
                    }
                
            except RuntimeError as e:
                last_error = e
                if attempt < self.config.retry_count - 1:
                    await asyncio.sleep(self.config.retry_delay)
            except Exception as e:
                last_error = e
                await self._emit_event(DriverEventType.ERROR, {
                    "error": f"Unexpected error reading DHT22: {str(e)}"
                })
                break
        
        error_msg = f"Failed to read DHT22 after {self.config.retry_count} attempts"
        if last_error:
            error_msg += f": {str(last_error)}"
        
        await self._emit_event(DriverEventType.ERROR, {"error": error_msg})
        raise RuntimeError(error_msg)
    
    def _get_pin(self):
        """Get the board pin for the configured GPIO number."""
        if self.config.gpio_pin not in self._pin_map:
            raise ValueError(
                f"Unsupported GPIO pin: {self.config.gpio_pin}. "
                f"Supported pins: {list(self._pin_map.keys())}"
            )
        return self._pin_map[self.config.gpio_pin]
    
    async def _shutdown(self) -> None:
        """Clean up resources."""
        if self._sensor:
            try:
                self._sensor.exit()
            except Exception as e:
                logger.warning(f"Error cleaning up DHT22: {str(e)}")
        self._sensor = None
