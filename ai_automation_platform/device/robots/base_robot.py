"""Base robot interface and common functionality."""
from typing import Dict, Any, List, Optional
import asyncio
import logging

from ...device.base import BaseDevice
from ...device.models import DeviceInfo, DeviceState, DeviceStatus, DeviceType, DeviceCapability

logger = logging.getLogger(__name__)

class BaseRobot(BaseDevice):
    """Base class for all robot implementations."""
    
    def __init__(self, device_info: DeviceInfo):
        """Initialize the base robot."""
        # Ensure the device type is set to ROBOT
        if device_info.type != DeviceType.ROBOT:
            device_info.type = DeviceType.ROBOT
            
        # Add robot-specific capabilities if not present
        if not any(cap == DeviceCapability.EXECUTE for cap in device_info.capabilities):
            device_info.capabilities.extend([
                DeviceCapability.EXECUTE,
                DeviceCapability.READ,
                DeviceCapability.WRITE
            ])
            
        super().__init__(device_info)
        
        # Robot-specific state
        self._joint_positions: List[float] = []
        self._tcp_pose: List[float] = []
        self._program_running: bool = False
    
    # Abstract methods that must be implemented by subclasses
    
    async def get_joint_positions(self) -> List[float]:
        """Get the current joint positions in radians."""
        raise NotImplementedError
    
    async def move_joints(self, positions: List[float], speed: float = 0.5) -> bool:
        """
        Move robot joints to the specified positions.
        
        Args:
            positions: Target joint positions in radians
            speed: Movement speed (0.0 to 1.0)
            
        Returns:
            bool: True if movement was successful
        """
        raise NotImplementedError
    
    async def move_linear(self, pose: List[float], speed: float = 0.5) -> bool:
        """
        Move the robot TCP to the specified pose.
        
        Args:
            pose: Target pose [x, y, z, rx, ry, rz] in meters and radians
            speed: Movement speed (0.0 to 1.0)
            
        Returns:
            bool: True if movement was successful
        """
        raise NotImplementedError
    
    async def get_tcp_pose(self) -> List[float]:
        """
        Get the current TCP pose.
        
        Returns:
            List[float]: [x, y, z, rx, ry, rz] in meters and radians
        """
        raise NotImplementedError
    
    async def set_tool_digital_out(self, output: int, state: bool) -> bool:
        """
        Set a digital output on the robot tool.
        
        Args:
            output: Output number (0-7)
            state: Desired output state
            
        Returns:
            bool: True if successful
        """
        raise NotImplementedError
    
    async def load_program(self, program_name: str) -> bool:
        """
        Load a robot program.
        
        Args:
            program_name: Name of the program to load
            
        Returns:
            bool: True if program was loaded successfully
        """
        raise NotImplementedError
    
    async def start_program(self) -> bool:
        """
        Start the currently loaded program.
        
        Returns:
            bool: True if program started successfully
        """
        raise NotImplementedError
    
    async def stop_program(self) -> bool:
        """
        Stop the currently running program.
        
        Returns:
            bool: True if program was stopped successfully
        """
        raise NotImplementedError
    
    # Common robot commands
    
    async def move_to_home(self, speed: float = 0.5) -> bool:
        """Move the robot to its home position."""
        home_positions = self._get_home_positions()
        return await self.move_joints(home_positions, speed)
    
    async def get_telemetry(self) -> Dict[str, Any]:
        """Get telemetry data from the robot."""
        try:
            joints = await self.get_joint_positions()
            tcp_pose = await self.get_tcp_pose()
            
            return {
                "joint_positions": joints,
                "tcp_pose": tcp_pose,
                "program_running": self._program_running,
                "timestamp": self._last_updated.isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting robot telemetry: {str(e)}")
            return {}
    
    # Helper methods
    
    def _get_home_positions(self) -> List[float]:
        """Get the home positions for the robot."""
        # Default to all zeros - should be overridden by subclasses
        return [0.0] * 6  # Assuming 6-axis robot by default
    
    def _validate_joint_positions(self, positions: List[float]) -> bool:
        """Validate joint positions."""
        if not positions:
            return False
        return all(isinstance(p, (int, float)) for p in positions)
    
    def _validate_tcp_pose(self, pose: List[float]) -> bool:
        """Validate TCP pose."""
        if len(pose) != 6:
            return False
        return all(isinstance(p, (int, float)) for p in pose)
