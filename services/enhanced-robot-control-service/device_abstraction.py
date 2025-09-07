#!/usr/bin/env python3
"""
Device Abstraction Layer for Unified Robot Control
Provides unified interface for different robot types and manufacturers
"""

import asyncio
import json
import logging
import time
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
import threading
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class RobotManufacturer(str, Enum):
    PAL_ROBOTICS = "pal_robotics"
    UNIVERSAL_ROBOTS = "universal_robots"
    BOSTON_DYNAMICS = "boston_dynamics"
    ABB = "abb"
    KUKA = "kuka"
    FANUC = "fanuc"
    SOFTBANK = "softbank"
    HONDA = "honda"
    TOYOTA = "toyota"
    GENERIC = "generic"

class RobotCapability(str, Enum):
    NAVIGATION = "navigation"
    MANIPULATION = "manipulation"
    VISION = "vision"
    SPEECH = "speech"
    SOCIAL_INTERACTION = "social_interaction"
    HEAVY_LIFTING = "heavy_lifting"
    PRECISION_WORK = "precision_work"
    AUTONOMOUS_DRIVING = "autonomous_driving"
    CLEANING = "cleaning"
    SECURITY = "security"

class CommandType(str, Enum):
    MOVE = "move"
    PICK = "pick"
    PLACE = "place"
    SPEAK = "speak"
    LOOK = "look"
    WAIT = "wait"
    STOP = "stop"
    HOME = "home"
    CALIBRATE = "calibrate"
    CUSTOM = "custom"

@dataclass
class RobotCommand:
    command_id: str
    command_type: CommandType
    parameters: Dict[str, Any]
    priority: int = 5
    timeout: float = 30.0
    safety_level: str = "medium"
    requires_confirmation: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class RobotStatus:
    robot_id: str
    is_connected: bool
    is_operational: bool
    current_position: Dict[str, float]
    battery_level: Optional[float] = None
    error_messages: List[str] = field(default_factory=list)
    last_command: Optional[str] = None
    last_update: datetime = field(default_factory=datetime.utcnow)

@dataclass
class ExecutionResult:
    success: bool
    result_data: Dict[str, Any]
    execution_time: float
    error_message: Optional[str] = None
    warnings: List[str] = field(default_factory=list)

class RobotInterface(ABC):
    """Abstract base class for robot interfaces"""
    
    def __init__(self, robot_id: str, manufacturer: RobotManufacturer, capabilities: List[RobotCapability]):
        self.robot_id = robot_id
        self.manufacturer = manufacturer
        self.capabilities = capabilities
        self.is_connected = False
        self.command_queue = asyncio.Queue()
        self.status_callbacks: List[Callable] = []
        self.executor = ThreadPoolExecutor(max_workers=2)
        
    @abstractmethod
    async def connect(self) -> bool:
        """Connect to the robot"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """Disconnect from the robot"""
        pass
    
    @abstractmethod
    async def get_status(self) -> RobotStatus:
        """Get current robot status"""
        pass
    
    @abstractmethod
    async def execute_command(self, command: RobotCommand) -> ExecutionResult:
        """Execute a command on the robot"""
        pass
    
    @abstractmethod
    async def emergency_stop(self) -> bool:
        """Emergency stop the robot"""
        pass
    
    def add_status_callback(self, callback: Callable[[RobotStatus], None]):
        """Add callback for status updates"""
        self.status_callbacks.append(callback)
    
    async def _notify_status_change(self, status: RobotStatus):
        """Notify all callbacks of status change"""
        for callback in self.status_callbacks:
            try:
                await asyncio.get_event_loop().run_in_executor(
                    self.executor, callback, status
                )
            except Exception as e:
                logger.error(f"Status callback failed: {str(e)}")

class PALRoboticsInterface(RobotInterface):
    """Interface for PAL Robotics robots (TIAGo, ARI, etc.)"""
    
    def __init__(self, robot_id: str, robot_model: str = "tiago"):
        capabilities = [
            RobotCapability.NAVIGATION,
            RobotCapability.MANIPULATION,
            RobotCapability.VISION,
            RobotCapability.SPEECH,
            RobotCapability.SOCIAL_INTERACTION
        ]
        super().__init__(robot_id, RobotManufacturer.PAL_ROBOTICS, capabilities)
        self.robot_model = robot_model
        self.ros_interface = None
        
    async def connect(self) -> bool:
        """Connect to PAL Robotics robot via ROS"""
        try:
            # Initialize ROS connection
            # In a real implementation, this would use actual ROS libraries
            logger.info(f"Connecting to PAL Robotics {self.robot_model} robot {self.robot_id}")
            
            # Simulate connection
            await asyncio.sleep(1)
            self.is_connected = True
            
            # Start status monitoring
            asyncio.create_task(self._status_monitor())
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to PAL robot {self.robot_id}: {str(e)}")
            return False
    
    async def disconnect(self) -> bool:
        """Disconnect from PAL Robotics robot"""
        try:
            self.is_connected = False
            logger.info(f"Disconnected from PAL robot {self.robot_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to disconnect from PAL robot {self.robot_id}: {str(e)}")
            return False
    
    async def get_status(self) -> RobotStatus:
        """Get PAL robot status"""
        return RobotStatus(
            robot_id=self.robot_id,
            is_connected=self.is_connected,
            is_operational=self.is_connected,
            current_position={"x": 1.0, "y": 2.0, "z": 0.0, "theta": 0.5},
            battery_level=0.85,
            error_messages=[],
            last_command="navigate_to_point",
            last_update=datetime.utcnow()
        )
    
    async def execute_command(self, command: RobotCommand) -> ExecutionResult:
        """Execute command on PAL robot"""
        start_time = time.time()
        
        try:
            if not self.is_connected:
                return ExecutionResult(
                    success=False,
                    result_data={},
                    execution_time=0.0,
                    error_message="Robot not connected"
                )
            
            # Route command based on type
            if command.command_type == CommandType.MOVE:
                result = await self._execute_navigation(command)
            elif command.command_type == CommandType.PICK:
                result = await self._execute_pick(command)
            elif command.command_type == CommandType.PLACE:
                result = await self._execute_place(command)
            elif command.command_type == CommandType.SPEAK:
                result = await self._execute_speech(command)
            elif command.command_type == CommandType.LOOK:
                result = await self._execute_vision(command)
            else:
                result = await self._execute_generic(command)
            
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            return ExecutionResult(
                success=False,
                result_data={},
                execution_time=execution_time,
                error_message=str(e)
            )
    
    async def emergency_stop(self) -> bool:
        """Emergency stop PAL robot"""
        try:
            logger.critical(f"EMERGENCY STOP for PAL robot {self.robot_id}")
            # In real implementation, would send emergency stop command via ROS
            return True
        except Exception as e:
            logger.error(f"Emergency stop failed for PAL robot {self.robot_id}: {str(e)}")
            return False
    
    async def _execute_navigation(self, command: RobotCommand) -> ExecutionResult:
        """Execute navigation command"""
        target = command.parameters.get("target", {"x": 0, "y": 0})
        
        # Simulate navigation
        await asyncio.sleep(2)  # Simulate movement time
        
        return ExecutionResult(
            success=True,
            result_data={
                "final_position": target,
                "path_length": 3.5,
                "obstacles_avoided": 2
            },
            execution_time=0.0  # Will be set by caller
        )
    
    async def _execute_pick(self, command: RobotCommand) -> ExecutionResult:
        """Execute pick command"""
        object_id = command.parameters.get("object_id", "unknown")
        
        # Simulate pick operation
        await asyncio.sleep(3)
        
        return ExecutionResult(
            success=True,
            result_data={
                "object_picked": object_id,
                "grasp_force": 15.2,
                "grasp_quality": 0.92
            },
            execution_time=0.0
        )
    
    async def _execute_place(self, command: RobotCommand) -> ExecutionResult:
        """Execute place command"""
        location = command.parameters.get("location", {"x": 0, "y": 0, "z": 0})
        
        # Simulate place operation
        await asyncio.sleep(2)
        
        return ExecutionResult(
            success=True,
            result_data={
                "placed_at": location,
                "placement_accuracy": 0.95
            },
            execution_time=0.0
        )
    
    async def _execute_speech(self, command: RobotCommand) -> ExecutionResult:
        """Execute speech command"""
        text = command.parameters.get("text", "Hello")
        
        # Simulate speech synthesis
        await asyncio.sleep(1)
        
        return ExecutionResult(
            success=True,
            result_data={
                "text_spoken": text,
                "duration": len(text) * 0.1,
                "language": "en-US"
            },
            execution_time=0.0
        )
    
    async def _execute_vision(self, command: RobotCommand) -> ExecutionResult:
        """Execute vision command"""
        target = command.parameters.get("target", "general")
        
        # Simulate vision processing
        await asyncio.sleep(1)
        
        return ExecutionResult(
            success=True,
            result_data={
                "objects_detected": ["person", "table", "chair"],
                "confidence_scores": [0.95, 0.88, 0.92],
                "processing_time": 0.8
            },
            execution_time=0.0
        )
    
    async def _execute_generic(self, command: RobotCommand) -> ExecutionResult:
        """Execute generic command"""
        await asyncio.sleep(1)
        
        return ExecutionResult(
            success=True,
            result_data={"command_executed": command.command_type.value},
            execution_time=0.0
        )
    
    async def _status_monitor(self):
        """Monitor robot status and notify callbacks"""
        while self.is_connected:
            try:
                status = await self.get_status()
                await self._notify_status_change(status)
                await asyncio.sleep(5)  # Update every 5 seconds
            except Exception as e:
                logger.error(f"Status monitoring error for PAL robot {self.robot_id}: {str(e)}")
                await asyncio.sleep(10)

class UniversalRobotsInterface(RobotInterface):
    """Interface for Universal Robots (UR3, UR5, UR10, etc.)"""
    
    def __init__(self, robot_id: str, robot_model: str = "UR5"):
        capabilities = [
            RobotCapability.MANIPULATION,
            RobotCapability.PRECISION_WORK,
            RobotCapability.HEAVY_LIFTING
        ]
        super().__init__(robot_id, RobotManufacturer.UNIVERSAL_ROBOTS, capabilities)
        self.robot_model = robot_model
        
    async def connect(self) -> bool:
        """Connect to Universal Robots arm"""
        try:
            logger.info(f"Connecting to Universal Robots {self.robot_model} arm {self.robot_id}")
            await asyncio.sleep(1)
            self.is_connected = True
            asyncio.create_task(self._status_monitor())
            return True
        except Exception as e:
            logger.error(f"Failed to connect to UR arm {self.robot_id}: {str(e)}")
            return False
    
    async def disconnect(self) -> bool:
        """Disconnect from Universal Robots arm"""
        self.is_connected = False
        return True
    
    async def get_status(self) -> RobotStatus:
        """Get UR arm status"""
        return RobotStatus(
            robot_id=self.robot_id,
            is_connected=self.is_connected,
            is_operational=self.is_connected,
            current_position={"joint1": 0.0, "joint2": -1.57, "joint3": 1.57, "joint4": 0.0, "joint5": 1.57, "joint6": 0.0},
            battery_level=None,  # UR arms are typically mains powered
            error_messages=[],
            last_command="move_to_pose",
            last_update=datetime.utcnow()
        )
    
    async def execute_command(self, command: RobotCommand) -> ExecutionResult:
        """Execute command on UR arm"""
        start_time = time.time()
        
        try:
            if command.command_type == CommandType.MOVE:
                result = await self._execute_move_to_pose(command)
            elif command.command_type == CommandType.PICK:
                result = await self._execute_pick_operation(command)
            elif command.command_type == CommandType.PLACE:
                result = await self._execute_place_operation(command)
            else:
                result = await self._execute_generic_ur(command)
            
            result.execution_time = time.time() - start_time
            return result
            
        except Exception as e:
            return ExecutionResult(
                success=False,
                result_data={},
                execution_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def emergency_stop(self) -> bool:
        """Emergency stop UR arm"""
        logger.critical(f"EMERGENCY STOP for UR arm {self.robot_id}")
        return True
    
    async def _execute_move_to_pose(self, command: RobotCommand) -> ExecutionResult:
        """Execute move to pose command"""
        pose = command.parameters.get("pose", [0, 0, 0, 0, 0, 0])
        await asyncio.sleep(2)
        
        return ExecutionResult(
            success=True,
            result_data={
                "final_pose": pose,
                "trajectory_time": 2.5,
                "max_velocity": 0.5
            },
            execution_time=0.0
        )
    
    async def _execute_pick_operation(self, command: RobotCommand) -> ExecutionResult:
        """Execute pick operation"""
        await asyncio.sleep(3)
        
        return ExecutionResult(
            success=True,
            result_data={
                "pick_successful": True,
                "force_applied": 25.0,
                "precision": 0.1  # mm
            },
            execution_time=0.0
        )
    
    async def _execute_place_operation(self, command: RobotCommand) -> ExecutionResult:
        """Execute place operation"""
        await asyncio.sleep(2)
        
        return ExecutionResult(
            success=True,
            result_data={
                "place_successful": True,
                "final_accuracy": 0.05  # mm
            },
            execution_time=0.0
        )
    
    async def _execute_generic_ur(self, command: RobotCommand) -> ExecutionResult:
        """Execute generic UR command"""
        await asyncio.sleep(1)
        
        return ExecutionResult(
            success=True,
            result_data={"command_executed": command.command_type.value},
            execution_time=0.0
        )
    
    async def _status_monitor(self):
        """Monitor UR arm status"""
        while self.is_connected:
            try:
                status = await self.get_status()
                await self._notify_status_change(status)
                await asyncio.sleep(3)
            except Exception as e:
                logger.error(f"Status monitoring error for UR arm {self.robot_id}: {str(e)}")
                await asyncio.sleep(5)

class DeviceAbstractionLayer:
    """Unified device abstraction layer for all robot types"""
    
    def __init__(self):
        self.robot_interfaces: Dict[str, RobotInterface] = {}
        self.robot_registry: Dict[str, Dict[str, Any]] = {}
        self.command_history: Dict[str, List[RobotCommand]] = {}
        self.performance_metrics: Dict[str, Dict[str, float]] = {}
        
    async def register_robot(
        self, 
        robot_id: str, 
        manufacturer: RobotManufacturer, 
        robot_model: str,
        capabilities: List[RobotCapability],
        connection_params: Dict[str, Any]
    ) -> bool:
        """Register a new robot with the abstraction layer"""
        try:
            # Create appropriate interface based on manufacturer
            if manufacturer == RobotManufacturer.PAL_ROBOTICS:
                interface = PALRoboticsInterface(robot_id, robot_model)
            elif manufacturer == RobotManufacturer.UNIVERSAL_ROBOTS:
                interface = UniversalRobotsInterface(robot_id, robot_model)
            else:
                # Generic interface for other manufacturers
                interface = GenericRobotInterface(robot_id, manufacturer, capabilities)
            
            # Register the interface
            self.robot_interfaces[robot_id] = interface
            self.robot_registry[robot_id] = {
                "manufacturer": manufacturer,
                "model": robot_model,
                "capabilities": capabilities,
                "connection_params": connection_params,
                "registered_at": datetime.utcnow()
            }
            
            # Initialize command history and metrics
            self.command_history[robot_id] = []
            self.performance_metrics[robot_id] = {
                "total_commands": 0,
                "successful_commands": 0,
                "average_execution_time": 0.0,
                "uptime": 0.0
            }
            
            # Connect to the robot
            connected = await interface.connect()
            
            logger.info(f"Robot {robot_id} registered successfully (connected: {connected})")
            return connected
            
        except Exception as e:
            logger.error(f"Failed to register robot {robot_id}: {str(e)}")
            return False
    
    async def execute_unified_command(
        self, 
        robot_id: str, 
        command: RobotCommand
    ) -> ExecutionResult:
        """Execute command on specified robot using unified interface"""
        try:
            if robot_id not in self.robot_interfaces:
                return ExecutionResult(
                    success=False,
                    result_data={},
                    execution_time=0.0,
                    error_message=f"Robot {robot_id} not registered"
                )
            
            interface = self.robot_interfaces[robot_id]
            
            # Add command to history
            self.command_history[robot_id].append(command)
            
            # Execute command
            result = await interface.execute_command(command)
            
            # Update performance metrics
            self._update_performance_metrics(robot_id, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to execute command on robot {robot_id}: {str(e)}")
            return ExecutionResult(
                success=False,
                result_data={},
                execution_time=0.0,
                error_message=str(e)
            )
    
    async def get_robot_status(self, robot_id: str) -> Optional[RobotStatus]:
        """Get status of specified robot"""
        if robot_id in self.robot_interfaces:
            return await self.robot_interfaces[robot_id].get_status()
        return None
    
    async def emergency_stop_robot(self, robot_id: str) -> bool:
        """Emergency stop specified robot"""
        if robot_id in self.robot_interfaces:
            return await self.robot_interfaces[robot_id].emergency_stop()
        return False
    
    async def emergency_stop_all(self) -> Dict[str, bool]:
        """Emergency stop all registered robots"""
        results = {}
        for robot_id, interface in self.robot_interfaces.items():
            try:
                results[robot_id] = await interface.emergency_stop()
            except Exception as e:
                logger.error(f"Emergency stop failed for robot {robot_id}: {str(e)}")
                results[robot_id] = False
        return results
    
    def get_robots_by_capability(self, capability: RobotCapability) -> List[str]:
        """Get list of robot IDs that have specified capability"""
        matching_robots = []
        for robot_id, robot_info in self.robot_registry.items():
            if capability in robot_info["capabilities"]:
                matching_robots.append(robot_id)
        return matching_robots
    
    def get_robots_by_manufacturer(self, manufacturer: RobotManufacturer) -> List[str]:
        """Get list of robot IDs from specified manufacturer"""
        matching_robots = []
        for robot_id, robot_info in self.robot_registry.items():
            if robot_info["manufacturer"] == manufacturer:
                matching_robots.append(robot_id)
        return matching_robots
    
    def _update_performance_metrics(self, robot_id: str, result: ExecutionResult):
        """Update performance metrics for robot"""
        metrics = self.performance_metrics[robot_id]
        
        metrics["total_commands"] += 1
        if result.success:
            metrics["successful_commands"] += 1
        
        # Update average execution time
        total_commands = metrics["total_commands"]
        current_avg = metrics["average_execution_time"]
        new_avg = ((current_avg * (total_commands - 1)) + result.execution_time) / total_commands
        metrics["average_execution_time"] = new_avg

class GenericRobotInterface(RobotInterface):
    """Generic interface for robots not specifically supported"""
    
    def __init__(self, robot_id: str, manufacturer: RobotManufacturer, capabilities: List[RobotCapability]):
        super().__init__(robot_id, manufacturer, capabilities)
    
    async def connect(self) -> bool:
        """Connect to generic robot"""
        logger.info(f"Connecting to generic robot {self.robot_id}")
        self.is_connected = True
        return True
    
    async def disconnect(self) -> bool:
        """Disconnect from generic robot"""
        self.is_connected = False
        return True
    
    async def get_status(self) -> RobotStatus:
        """Get generic robot status"""
        return RobotStatus(
            robot_id=self.robot_id,
            is_connected=self.is_connected,
            is_operational=self.is_connected,
            current_position={"x": 0.0, "y": 0.0, "z": 0.0},
            battery_level=0.75,
            error_messages=[],
            last_command="generic_command",
            last_update=datetime.utcnow()
        )
    
    async def execute_command(self, command: RobotCommand) -> ExecutionResult:
        """Execute command on generic robot"""
        # Simulate command execution
        await asyncio.sleep(1)
        
        return ExecutionResult(
            success=True,
            result_data={"command_type": command.command_type.value},
            execution_time=1.0
        )
    
    async def emergency_stop(self) -> bool:
        """Emergency stop generic robot"""
        logger.critical(f"EMERGENCY STOP for generic robot {self.robot_id}")
        return True
