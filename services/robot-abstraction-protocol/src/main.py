#!/usr/bin/env python3
"""
Robot Abstraction Protocol (RAP) Service
Universal robot integration system for enterprise automation platform
"""

import asyncio
import logging
import time
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import json

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Robot Abstraction Protocol (RAP) Service",
    description="Universal robot integration system with sub-10ms command translation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class RobotType(str, Enum):
    UNIVERSAL_ROBOTS = "universal_robots"
    ABB = "abb"
    KUKA = "kuka"
    FANUC = "fanuc"
    BOSTON_DYNAMICS = "boston_dynamics"
    CUSTOM = "custom"

class RobotStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BUSY = "busy"
    ERROR = "error"
    MAINTENANCE = "maintenance"

class CommandType(str, Enum):
    MOVE_TO_POSITION = "move_to_position"
    PICK_OBJECT = "pick_object"
    PLACE_OBJECT = "place_object"
    EXECUTE_WORKFLOW = "execute_workflow"
    GET_STATUS = "get_status"
    EMERGENCY_STOP = "emergency_stop"

@dataclass
class RobotCapability:
    name: str
    level: float  # 0.0 to 1.0
    last_assessed: datetime
    confidence: float = 1.0

@dataclass
class RobotConfig:
    robot_id: str
    robot_type: RobotType
    name: str
    ip_address: str
    port: int
    api_key: Optional[str] = None
    connection_timeout: int = 5
    command_timeout: int = 30
    capabilities: List[RobotCapability] = None

@dataclass
class RAPCommand:
    command_id: str
    robot_id: str
    command_type: CommandType
    parameters: Dict[str, Any]
    priority: str = "normal"  # low, normal, high, critical
    timeout: int = 30
    created_at: datetime = None

@dataclass
class CommandResult:
    command_id: str
    robot_id: str
    success: bool
    result_data: Dict[str, Any]
    execution_time: float
    error_message: Optional[str] = None
    timestamp: datetime = None

@dataclass
class RobotStatusInfo:
    robot_id: str
    status: RobotStatus
    position: Optional[List[float]] = None
    joint_angles: Optional[List[float]] = None
    tool_status: Optional[Dict[str, Any]] = None
    error_codes: List[str] = None
    last_updated: datetime = None

# RAP Command Definitions
RAP_COMMANDS = {
    CommandType.MOVE_TO_POSITION: {
        'parameters': ['x', 'y', 'z', 'rx', 'ry', 'rz', 'speed', 'precision'],
        'response_time_target': 50,  # milliseconds
        'safety_critical': True
    },
    CommandType.PICK_OBJECT: {
        'parameters': ['grip_force', 'object_type', 'approach_vector'],
        'response_time_target': 100,
        'safety_critical': True
    },
    CommandType.PLACE_OBJECT: {
        'parameters': ['target_position', 'placement_force', 'release_condition'],
        'response_time_target': 100,
        'safety_critical': True
    },
    CommandType.EXECUTE_WORKFLOW: {
        'parameters': ['workflow_id', 'parameters'],
        'response_time_target': 200,
        'safety_critical': False
    },
    CommandType.GET_STATUS: {
        'parameters': [],
        'response_time_target': 10,
        'safety_critical': False
    },
    CommandType.EMERGENCY_STOP: {
        'parameters': [],
        'response_time_target': 1,  # 1ms for safety
        'safety_critical': True
    }
}

# Base Robot Adapter
class BaseRobotAdapter(ABC):
    """Base class for all robot adapters"""
    
    def __init__(self, robot_config: RobotConfig):
        self.robot_id = robot_config.robot_id
        self.robot_type = robot_config.robot_type
        self.config = robot_config
        self.capabilities = self.discover_capabilities()
        self.connection = None
        self.last_heartbeat = None
        self.command_history = []
        
    @abstractmethod
    async def establish_connection(self) -> bool:
        """Establish connection to robot"""
        pass
    
    @abstractmethod
    async def translate_command(self, rap_command: RAPCommand) -> Any:
        """Translate RAP command to robot-specific format"""
        pass
    
    @abstractmethod
    async def execute_command(self, native_command: Any) -> CommandResult:
        """Execute command on robot"""
        pass
    
    @abstractmethod
    async def get_status(self) -> RobotStatusInfo:
        """Get current robot status"""
        pass
    
    @abstractmethod
    def discover_capabilities(self) -> List[RobotCapability]:
        """Discover robot capabilities"""
        pass
    
    async def send_heartbeat(self) -> bool:
        """Send heartbeat to robot"""
        try:
            status = await self.get_status()
            self.last_heartbeat = datetime.now(timezone.utc)
            return status.status != RobotStatus.OFFLINE
        except Exception as e:
            logger.error(f"Heartbeat failed for robot {self.robot_id}: {e}")
            return False
    
    async def validate_command(self, rap_command: RAPCommand) -> bool:
        """Validate command before execution"""
        command_spec = RAP_COMMANDS.get(rap_command.command_type)
        if not command_spec:
            return False
        
        # Check required parameters
        required_params = command_spec['parameters']
        for param in required_params:
            if param not in rap_command.parameters:
                logger.error(f"Missing required parameter: {param}")
                return False
        
        return True

# Universal Robots Adapter
class UniversalRobotsAdapter(BaseRobotAdapter):
    """Adapter for Universal Robots (UR series)"""
    
    def __init__(self, robot_config: RobotConfig):
        super().__init__(robot_config)
        self.rtde_client = None
        self.dashboard_client = None
    
    async def establish_connection(self) -> bool:
        """Establish connection to UR robot"""
        try:
            # Simulate RTDE connection
            logger.info(f"Connecting to UR robot at {self.config.ip_address}:{self.config.port}")
            
            # In real implementation, would use:
            # self.rtde_client = RTDEClient(self.config.ip_address)
            # self.dashboard_client = DashboardClient(self.config.ip_address)
            
            self.connection = {
                'connected': True,
                'connection_time': datetime.now(timezone.utc)
            }
            
            logger.info(f"Successfully connected to UR robot {self.robot_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to UR robot {self.robot_id}: {e}")
            return False
    
    async def translate_command(self, rap_command: RAPCommand) -> str:
        """Translate RAP command to URScript"""
        if rap_command.command_type == CommandType.MOVE_TO_POSITION:
            coords = [
                rap_command.parameters.get('x', 0),
                rap_command.parameters.get('y', 0),
                rap_command.parameters.get('z', 0),
                rap_command.parameters.get('rx', 0),
                rap_command.parameters.get('ry', 0),
                rap_command.parameters.get('rz', 0)
            ]
            speed = rap_command.parameters.get('speed', 50) / 100  # Convert percentage to UR format
            return f"movel(p[{','.join(map(str, coords))}], a=1.2, v={speed})"
            
        elif rap_command.command_type == CommandType.PICK_OBJECT:
            grip_force = rap_command.parameters.get('grip_force', 50)
            return f"set_digital_out(0, True)\nsleep(0.5)\nset_analog_out(0, {grip_force/100})"
            
        elif rap_command.command_type == CommandType.EMERGENCY_STOP:
            return "stop()"
            
        else:
            raise ValueError(f"Unsupported command type: {rap_command.command_type}")
    
    async def execute_command(self, native_command: str) -> CommandResult:
        """Execute URScript command"""
        start_time = time.perf_counter()
        
        try:
            # Simulate command execution
            logger.info(f"Executing UR command: {native_command}")
            
            # In real implementation, would send to robot:
            # self.rtde_client.send_command(native_command)
            
            # Simulate execution time
            await asyncio.sleep(0.1)
            
            execution_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
            
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_id,
                success=True,
                result_data={'status': 'completed', 'execution_time_ms': execution_time},
                execution_time=execution_time,
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_id,
                success=False,
                result_data={},
                execution_time=execution_time,
                error_message=str(e),
                timestamp=datetime.now(timezone.utc)
            )
    
    async def get_status(self) -> RobotStatusInfo:
        """Get UR robot status"""
        # Simulate status retrieval
        return RobotStatusInfo(
            robot_id=self.robot_id,
            status=RobotStatus.ONLINE,
            position=[0.1, 0.2, 0.3, 0.0, 0.0, 0.0],
            joint_angles=[0.0, -1.57, 1.57, 0.0, 1.57, 0.0],
            tool_status={'gripper_open': True, 'force': 0.0},
            error_codes=[],
            last_updated=datetime.now(timezone.utc)
        )
    
    def discover_capabilities(self) -> List[RobotCapability]:
        """Discover UR robot capabilities"""
        return [
            RobotCapability("precision_movement", 0.9, datetime.now(timezone.utc)),
            RobotCapability("pick_and_place", 0.85, datetime.now(timezone.utc)),
            RobotCapability("force_control", 0.8, datetime.now(timezone.utc)),
            RobotCapability("path_planning", 0.9, datetime.now(timezone.utc)),
            RobotCapability("safety_monitoring", 0.95, datetime.now(timezone.utc))
        ]

# ABB Adapter
class ABBAdapter(BaseRobotAdapter):
    """Adapter for ABB robots"""
    
    def __init__(self, robot_config: RobotConfig):
        super().__init__(robot_config)
        self.rws_client = None
    
    async def establish_connection(self) -> bool:
        """Establish connection to ABB robot"""
        try:
            logger.info(f"Connecting to ABB robot at {self.config.ip_address}:{self.config.port}")
            
            # In real implementation, would use:
            # self.rws_client = RobotWebServicesClient(self.config.ip_address)
            
            self.connection = {
                'connected': True,
                'connection_time': datetime.now(timezone.utc)
            }
            
            logger.info(f"Successfully connected to ABB robot {self.robot_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to ABB robot {self.robot_id}: {e}")
            return False
    
    async def translate_command(self, rap_command: RAPCommand) -> str:
        """Translate RAP command to RAPID"""
        if rap_command.command_type == CommandType.MOVE_TO_POSITION:
            coords = [
                rap_command.parameters.get('x', 0),
                rap_command.parameters.get('y', 0),
                rap_command.parameters.get('z', 0),
                rap_command.parameters.get('rx', 0),
                rap_command.parameters.get('ry', 0),
                rap_command.parameters.get('rz', 0)
            ]
            speed = f"v{rap_command.parameters.get('speed', 50)}"
            return f"MoveL [{','.join(map(str, coords))}], {speed}, fine, tool0;"
            
        elif rap_command.command_type == CommandType.PICK_OBJECT:
            grip_force = rap_command.parameters.get('grip_force', 50)
            return f"SetDO gripper_close, 1;\nWaitTime 0.5;\nSetAO grip_force, {grip_force};"
            
        elif rap_command.command_type == CommandType.EMERGENCY_STOP:
            return "Stop;"
            
        else:
            raise ValueError(f"Unsupported command type: {rap_command.command_type}")
    
    async def execute_command(self, native_command: str) -> CommandResult:
        """Execute RAPID command"""
        start_time = time.perf_counter()
        
        try:
            logger.info(f"Executing ABB command: {native_command}")
            
            # Simulate execution
            await asyncio.sleep(0.1)
            
            execution_time = (time.perf_counter() - start_time) * 1000
            
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_id,
                success=True,
                result_data={'status': 'completed', 'execution_time_ms': execution_time},
                execution_time=execution_time,
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_id,
                success=False,
                result_data={},
                execution_time=execution_time,
                error_message=str(e),
                timestamp=datetime.now(timezone.utc)
            )
    
    async def get_status(self) -> RobotStatusInfo:
        """Get ABB robot status"""
        return RobotStatusInfo(
            robot_id=self.robot_id,
            status=RobotStatus.ONLINE,
            position=[0.15, 0.25, 0.35, 0.0, 0.0, 0.0],
            joint_angles=[0.0, -1.5, 1.5, 0.0, 1.5, 0.0],
            tool_status={'gripper_open': True, 'force': 0.0},
            error_codes=[],
            last_updated=datetime.now(timezone.utc)
        )
    
    def discover_capabilities(self) -> List[RobotCapability]:
        """Discover ABB robot capabilities"""
        return [
            RobotCapability("precision_movement", 0.95, datetime.now(timezone.utc)),
            RobotCapability("pick_and_place", 0.9, datetime.now(timezone.utc)),
            RobotCapability("force_control", 0.85, datetime.now(timezone.utc)),
            RobotCapability("path_planning", 0.95, datetime.now(timezone.utc)),
            RobotCapability("safety_monitoring", 0.9, datetime.now(timezone.utc)),
            RobotCapability("high_payload", 0.95, datetime.now(timezone.utc))
        ]

# Robot Abstraction Protocol Manager
class RobotAbstractionProtocolManager:
    """Main manager for Robot Abstraction Protocol"""

    def __init__(self):
        self.robot_registry: Dict[str, BaseRobotAdapter] = {}
        self.command_queue = asyncio.Queue()
        self.active_commands: Dict[str, RAPCommand] = {}
        # Import additional adapters
        try:
            from adapters import KUKAAdapter, FanucAdapter, BostonDynamicsAdapter
            additional_adapters = {
                RobotType.KUKA: KUKAAdapter,
                RobotType.FANUC: FanucAdapter,
                RobotType.BOSTON_DYNAMICS: BostonDynamicsAdapter
            }
        except ImportError:
            additional_adapters = {}

        self.adapter_factories = {
            RobotType.UNIVERSAL_ROBOTS: UniversalRobotsAdapter,
            RobotType.ABB: ABBAdapter,
            **additional_adapters
        }
        self.performance_metrics = {}
        self.heartbeat_interval = 30  # seconds

    async def register_robot(self, robot_config: RobotConfig) -> bool:
        """Register a new robot with the system"""
        try:
            # Create appropriate adapter
            adapter_class = self.adapter_factories.get(robot_config.robot_type)
            if not adapter_class:
                raise ValueError(f"Unsupported robot type: {robot_config.robot_type}")

            adapter = adapter_class(robot_config)

            # Establish connection
            if await adapter.establish_connection():
                self.robot_registry[robot_config.robot_id] = adapter

                # Start heartbeat monitoring
                asyncio.create_task(self._monitor_robot_heartbeat(robot_config.robot_id))

                logger.info(f"Successfully registered robot {robot_config.robot_id}")
                return True
            else:
                logger.error(f"Failed to connect to robot {robot_config.robot_id}")
                return False

        except Exception as e:
            logger.error(f"Error registering robot {robot_config.robot_id}: {e}")
            return False

    async def execute_command(self, rap_command: RAPCommand) -> CommandResult:
        """Execute RAP command on specified robot"""
        start_time = time.perf_counter()

        try:
            # Get robot adapter
            adapter = self.robot_registry.get(rap_command.robot_id)
            if not adapter:
                raise ValueError(f"Robot {rap_command.robot_id} not found")

            # Validate command
            if not await adapter.validate_command(rap_command):
                raise ValueError("Command validation failed")

            # Add to active commands
            self.active_commands[rap_command.command_id] = rap_command

            # Translate command
            native_command = await adapter.translate_command(rap_command)

            # Execute command
            result = await adapter.execute_command(native_command)

            # Record performance metrics
            total_time = (time.perf_counter() - start_time) * 1000
            await self._record_performance_metric(rap_command, total_time)

            # Remove from active commands
            self.active_commands.pop(rap_command.command_id, None)

            return result

        except Exception as e:
            # Remove from active commands
            self.active_commands.pop(rap_command.command_id, None)

            execution_time = (time.perf_counter() - start_time) * 1000
            return CommandResult(
                command_id=rap_command.command_id,
                robot_id=rap_command.robot_id,
                success=False,
                result_data={},
                execution_time=execution_time,
                error_message=str(e),
                timestamp=datetime.now(timezone.utc)
            )

    async def get_robot_status(self, robot_id: str) -> RobotStatusInfo:
        """Get status of specified robot"""
        adapter = self.robot_registry.get(robot_id)
        if not adapter:
            raise ValueError(f"Robot {robot_id} not found")

        return await adapter.get_status()

    async def get_all_robots_status(self) -> Dict[str, RobotStatusInfo]:
        """Get status of all registered robots"""
        status_dict = {}

        for robot_id, adapter in self.robot_registry.items():
            try:
                status_dict[robot_id] = await adapter.get_status()
            except Exception as e:
                logger.error(f"Error getting status for robot {robot_id}: {e}")
                status_dict[robot_id] = RobotStatusInfo(
                    robot_id=robot_id,
                    status=RobotStatus.ERROR,
                    error_codes=[str(e)],
                    last_updated=datetime.now(timezone.utc)
                )

        return status_dict

    async def emergency_stop_all(self) -> Dict[str, CommandResult]:
        """Emergency stop all robots"""
        results = {}

        for robot_id in self.robot_registry.keys():
            emergency_command = RAPCommand(
                command_id=str(uuid.uuid4()),
                robot_id=robot_id,
                command_type=CommandType.EMERGENCY_STOP,
                parameters={},
                priority="critical",
                timeout=1,
                created_at=datetime.now(timezone.utc)
            )

            results[robot_id] = await self.execute_command(emergency_command)

        return results

    async def _monitor_robot_heartbeat(self, robot_id: str):
        """Monitor robot heartbeat"""
        while robot_id in self.robot_registry:
            try:
                adapter = self.robot_registry[robot_id]
                heartbeat_success = await adapter.send_heartbeat()

                if not heartbeat_success:
                    logger.warning(f"Heartbeat failed for robot {robot_id}")

                await asyncio.sleep(self.heartbeat_interval)

            except Exception as e:
                logger.error(f"Error in heartbeat monitoring for robot {robot_id}: {e}")
                await asyncio.sleep(self.heartbeat_interval)

    async def _record_performance_metric(self, command: RAPCommand, execution_time: float):
        """Record performance metrics for analysis"""
        if command.robot_id not in self.performance_metrics:
            self.performance_metrics[command.robot_id] = []

        metric = {
            'command_type': command.command_type.value,
            'execution_time': execution_time,
            'priority': command.priority,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        self.performance_metrics[command.robot_id].append(metric)

        # Keep only last 1000 metrics per robot
        if len(self.performance_metrics[command.robot_id]) > 1000:
            self.performance_metrics[command.robot_id] = self.performance_metrics[command.robot_id][-1000:]

# Global RAP manager
rap_manager = RobotAbstractionProtocolManager()

# Pydantic models for API
class RobotConfigRequest(BaseModel):
    robot_id: str
    robot_type: RobotType
    name: str
    ip_address: str
    port: int
    api_key: Optional[str] = None
    connection_timeout: int = 5
    command_timeout: int = 30

class RAPCommandRequest(BaseModel):
    robot_id: str
    command_type: CommandType
    parameters: Dict[str, Any]
    priority: str = "normal"
    timeout: int = 30

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Robot Abstraction Protocol (RAP)",
        "version": "1.0.0",
        "description": "Universal robot integration with sub-10ms command translation",
        "supported_robots": list(RobotType),
        "registered_robots": len(rap_manager.robot_registry),
        "active_commands": len(rap_manager.active_commands)
    }

@app.get("/health")
async def health_check():
    robot_statuses = await rap_manager.get_all_robots_status()

    online_robots = sum(1 for status in robot_statuses.values() if status.status == RobotStatus.ONLINE)
    total_robots = len(robot_statuses)

    return {
        "status": "healthy",
        "service": "robot-abstraction-protocol",
        "robots": {
            "total": total_robots,
            "online": online_robots,
            "offline": total_robots - online_robots
        },
        "active_commands": len(rap_manager.active_commands)
    }

@app.post("/api/v1/robots/register")
async def register_robot(robot_config: RobotConfigRequest):
    """Register a new robot with the RAP system"""
    try:
        config = RobotConfig(
            robot_id=robot_config.robot_id,
            robot_type=robot_config.robot_type,
            name=robot_config.name,
            ip_address=robot_config.ip_address,
            port=robot_config.port,
            api_key=robot_config.api_key,
            connection_timeout=robot_config.connection_timeout,
            command_timeout=robot_config.command_timeout
        )

        success = await rap_manager.register_robot(config)

        if success:
            return {
                "success": True,
                "message": f"Robot {robot_config.robot_id} registered successfully",
                "robot_id": robot_config.robot_id
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to register robot")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/robots")
async def list_robots():
    """List all registered robots"""
    try:
        robot_statuses = await rap_manager.get_all_robots_status()

        robots = []
        for robot_id, adapter in rap_manager.robot_registry.items():
            status = robot_statuses.get(robot_id)
            robots.append({
                "robot_id": robot_id,
                "robot_type": adapter.robot_type.value,
                "status": status.status.value if status else "unknown",
                "capabilities": [asdict(cap) for cap in adapter.capabilities],
                "last_heartbeat": adapter.last_heartbeat.isoformat() if adapter.last_heartbeat else None
            })

        return {
            "robots": robots,
            "total_count": len(robots)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/robots/{robot_id}")
async def get_robot_details(robot_id: str):
    """Get detailed information about a specific robot"""
    try:
        if robot_id not in rap_manager.robot_registry:
            raise HTTPException(status_code=404, detail="Robot not found")

        adapter = rap_manager.robot_registry[robot_id]
        status = await rap_manager.get_robot_status(robot_id)

        return {
            "robot_id": robot_id,
            "robot_type": adapter.robot_type.value,
            "name": adapter.config.name,
            "status": asdict(status),
            "capabilities": [asdict(cap) for cap in adapter.capabilities],
            "connection_info": {
                "ip_address": adapter.config.ip_address,
                "port": adapter.config.port,
                "last_heartbeat": adapter.last_heartbeat.isoformat() if adapter.last_heartbeat else None
            },
            "performance_metrics": rap_manager.performance_metrics.get(robot_id, [])[-10:]  # Last 10 metrics
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/robots/{robot_id}/command")
async def execute_robot_command(robot_id: str, command_request: RAPCommandRequest):
    """Execute a command on a specific robot"""
    try:
        if robot_id not in rap_manager.robot_registry:
            raise HTTPException(status_code=404, detail="Robot not found")

        # Create RAP command
        rap_command = RAPCommand(
            command_id=str(uuid.uuid4()),
            robot_id=robot_id,
            command_type=command_request.command_type,
            parameters=command_request.parameters,
            priority=command_request.priority,
            timeout=command_request.timeout,
            created_at=datetime.now(timezone.utc)
        )

        # Execute command
        result = await rap_manager.execute_command(rap_command)

        return {
            "command_id": rap_command.command_id,
            "result": asdict(result)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/robots/{robot_id}/status")
async def get_robot_status(robot_id: str):
    """Get current status of a specific robot"""
    try:
        if robot_id not in rap_manager.robot_registry:
            raise HTTPException(status_code=404, detail="Robot not found")

        status = await rap_manager.get_robot_status(robot_id)

        return {
            "robot_id": robot_id,
            "status": asdict(status)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/robots/{robot_id}/emergency-stop")
async def emergency_stop_robot(robot_id: str):
    """Emergency stop a specific robot"""
    try:
        if robot_id not in rap_manager.robot_registry:
            raise HTTPException(status_code=404, detail="Robot not found")

        emergency_command = RAPCommand(
            command_id=str(uuid.uuid4()),
            robot_id=robot_id,
            command_type=CommandType.EMERGENCY_STOP,
            parameters={},
            priority="critical",
            timeout=1,
            created_at=datetime.now(timezone.utc)
        )

        result = await rap_manager.execute_command(emergency_command)

        return {
            "success": result.success,
            "message": "Emergency stop executed",
            "result": asdict(result)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/emergency-stop-all")
async def emergency_stop_all_robots():
    """Emergency stop all registered robots"""
    try:
        results = await rap_manager.emergency_stop_all()

        return {
            "message": "Emergency stop executed on all robots",
            "results": {robot_id: asdict(result) for robot_id, result in results.items()}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/performance/metrics")
async def get_performance_metrics():
    """Get performance metrics for all robots"""
    try:
        return {
            "performance_metrics": rap_manager.performance_metrics,
            "summary": {
                robot_id: {
                    "total_commands": len(metrics),
                    "avg_execution_time": sum(m['execution_time'] for m in metrics) / len(metrics) if metrics else 0,
                    "last_command": metrics[-1]['timestamp'] if metrics else None
                }
                for robot_id, metrics in rap_manager.performance_metrics.items()
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/commands/active")
async def get_active_commands():
    """Get currently active commands"""
    try:
        return {
            "active_commands": [asdict(cmd) for cmd in rap_manager.active_commands.values()],
            "count": len(rap_manager.active_commands)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time robot monitoring
@app.websocket("/ws/robots")
async def robot_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time robot status updates"""
    await websocket.accept()

    try:
        while True:
            # Send robot status updates
            robot_statuses = await rap_manager.get_all_robots_status()

            status_update = {
                "type": "robot_status_update",
                "data": {
                    robot_id: asdict(status) for robot_id, status in robot_statuses.items()
                },
                "active_commands": len(rap_manager.active_commands),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            await websocket.send_json(status_update)
            await asyncio.sleep(1)  # Send updates every second

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
