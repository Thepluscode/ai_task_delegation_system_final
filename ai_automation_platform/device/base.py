"""Base device interface and exceptions."""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Union, List
from datetime import datetime

from .models import DeviceInfo, DeviceState, DeviceStatus, DeviceCapability


class DeviceException(Exception):
    """Base exception for device-related errors."""
    def __init__(self, message: str, device_id: Optional[str] = None):
        self.device_id = device_id
        self.message = message
        super().__init__(f"{message} (device_id={device_id or 'N/A'})")


class ConnectionError(DeviceException):
    """Raised when a device connection fails."""
    pass


class CommandError(DeviceException):
    """Raised when a device command fails."""
    pass


class BaseDevice(ABC):
    """Abstract base class for all devices."""
    
    def __init__(self, device_info: DeviceInfo):
        """Initialize the device with its information."""
        self._info = device_info
        self._state = DeviceState()
        self._last_updated = datetime.utcnow()
    
    @property
    def device_id(self) -> str:
        """Get the device's unique identifier."""
        return self._info.device_id
    
    @property
    def device_info(self) -> DeviceInfo:
        """Get the device information."""
        return self._info
    
    @property
    def device_state(self) -> DeviceState:
        """Get the current device state."""
        return self._state
    
    @property
    def is_connected(self) -> bool:
        """Check if the device is currently connected."""
        return self._state.status == DeviceStatus.ONLINE
    
    @abstractmethod
    async def connect(self) -> bool:
        """
        Connect to the device.
        
        Returns:
            bool: True if connection was successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Disconnect from the device."""
        pass
    
    @abstractmethod
    async def execute_command(
        self, 
        command: str, 
        params: Optional[Dict[str, Any]] = None
    ) -> Any:
        """
        Execute a command on the device.
        
        Args:
            command: The command to execute
            params: Optional parameters for the command
            
        Returns:
            The result of the command execution
            
        Raises:
            CommandError: If the command execution fails
        """
        pass
    
    async def get_telemetry(self) -> Dict[str, Any]:
        """
        Get telemetry data from the device.
        
        Returns:
            Dictionary containing telemetry data
        """
        return {}
    
    async def update_firmware(self, version: str) -> bool:
        """
        Update the device firmware.
        
        Args:
            version: The target firmware version
            
        Returns:
            bool: True if update was successful, False otherwise
        """
        return False
    
    def _update_state(self, status: Optional[DeviceStatus] = None, **kwargs) -> None:
        """
        Update the device state.
        
        Args:
            status: New status (if any)
            **kwargs: Additional state attributes to update
        """
        if status is not None:
            self._state.status = status
            if status == DeviceStatus.ONLINE:
                self._state.last_seen = datetime.utcnow()
        
        for key, value in kwargs.items():
            if hasattr(self._state, key):
                setattr(self._state, key, value)
        
        self._last_updated = datetime.utcnow()
    
    def __str__(self) -> str:
        """String representation of the device."""
        return f"{self.__class__.__name__}(id={self.device_id}, name={self._info.name}, type={self._info.type})"
