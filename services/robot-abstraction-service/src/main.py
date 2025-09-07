"""
Robot Abstraction Protocol (RAP) Service
Universal robot control interface supporting multiple manufacturers
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union, Callable
from enum import Enum
from datetime import datetime, timezone, timedelta
import asyncio
import logging
import json
import time
import uuid
import socket
import struct
import threading
import sqlite3
from collections import deque, defaultdict
from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Robot Abstraction Protocol (RAP) Service",
    description="Universal robot control interface supporting multiple manufacturers",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums and Models
class RobotBrand(str, Enum):
    UNIVERSAL_ROBOTS = "universal_robots"
    ABB = "abb"
    KUKA = "kuka"
    FANUC = "fanuc"
    BOSTON_DYNAMICS = "boston_dynamics"
    CUSTOM = "custom"

class RobotStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    ERROR = "error"
    MAINTENANCE = "maintenance"
    EMERGENCY_STOP = "emergency_stop"
    OFFLINE = "offline"

class CommandType(str, Enum):
    MOVE_TO_POSITION = "move_to_position"
    PICK_OBJECT = "pick_object"
    PLACE_OBJECT = "place_object"
    EXECUTE_WORKFLOW = "execute_workflow"
    GET_STATUS = "get_status"
    EMERGENCY_STOP = "emergency_stop"
    HOME_POSITION = "home_position"
    CALIBRATE = "calibrate"

class PrecisionLevel(str, Enum):
    ROUGH = "rough"
    FINE = "fine"
    ULTRA_FINE = "ultra_fine"

class ObjectType(str, Enum):
    FRAGILE = "fragile"
    STANDARD = "standard"
    HEAVY = "heavy"

class CommunicationProtocol(str, Enum):
    ETHERNET_IP = "ethernet_ip"
    MODBUS_TCP = "modbus_tcp"
    OPCUA = "opcua"
    ROS = "ros"
    GRPC = "grpc"
    WEBSOCKET = "websocket"
    RTDE = "rtde"  # Universal Robots Real-Time Data Exchange
    RWS = "rws"    # ABB Robot Web Services

# Data Models
@dataclass
class Coordinates:
    x: float
    y: float
    z: float
    rx: float = 0.0  # rotation around x-axis
    ry: float = 0.0  # rotation around y-axis
    rz: float = 0.0  # rotation around z-axis

class RAPCommand(BaseModel):
    command_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    command_type: CommandType
    robot_id: str
    parameters: Dict[str, Any] = {}
    priority: int = Field(default=5, ge=1, le=10)
    timeout_seconds: int = Field(default=30, ge=1, le=300)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MoveCommand(BaseModel):
    coordinates: List[float] = Field(..., min_items=6, max_items=6)  # [x, y, z, rx, ry, rz]
    speed: float = Field(..., ge=0.1, le=100.0)  # percentage
    precision: PrecisionLevel = PrecisionLevel.FINE
    relative: bool = False  # absolute or relative movement

class PickCommand(BaseModel):
    coordinates: List[float] = Field(..., min_items=6, max_items=6)
    grip_force: float = Field(..., ge=0.1, le=100.0)  # percentage of max force
    object_type: ObjectType = ObjectType.STANDARD
    approach_height: float = Field(default=50.0, ge=0.0)  # mm above object

class RobotCapabilities(BaseModel):
    movement: Dict[str, Any] = {}
    sensors: Dict[str, bool] = {}
    specialized_tools: Dict[str, Any] = {}
    communication_protocols: List[CommunicationProtocol] = []
    max_payload: float = 0.0  # kg
    reach_radius: float = 0.0  # mm
    degrees_of_freedom: int = 6
    precision_rating: float = 0.0  # mm

class RobotInfo(BaseModel):
    robot_id: str
    name: str
    brand: RobotBrand
    model: str
    ip_address: str
    port: int = 502
    status: RobotStatus = RobotStatus.OFFLINE
    capabilities: RobotCapabilities
    last_command: Optional[str] = None
    last_seen: Optional[datetime] = None
    error_message: Optional[str] = None
    firmware_version: Optional[str] = None
    serial_number: Optional[str] = None

class CommandResult(BaseModel):
    command_id: str
    robot_id: str
    success: bool
    execution_time_ms: float
    result_data: Dict[str, Any] = {}
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Enterprise Robot Management Models
class TaskPriority(str, Enum):
    EMERGENCY = "emergency"      # 1ms target
    SAFETY_CRITICAL = "safety_critical"  # 10ms target
    HIGH = "high"               # 100ms target
    NORMAL = "normal"           # 1s target
    LOW = "low"                 # 5s target

class TaskStatus(str, Enum):
    PENDING = "pending"
    QUEUED = "queued"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class MaintenanceType(str, Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    PREDICTIVE = "predictive"
    EMERGENCY = "emergency"

class SafetyZoneType(str, Enum):
    RESTRICTED = "restricted"
    COLLABORATIVE = "collaborative"
    MAINTENANCE = "maintenance"
    EMERGENCY_STOP = "emergency_stop"

class RobotTask(BaseModel):
    task_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    robot_id: str
    task_type: str
    priority: TaskPriority = TaskPriority.NORMAL
    status: TaskStatus = TaskStatus.PENDING
    commands: List[RAPCommand] = []
    estimated_duration: float = 0.0  # seconds
    actual_duration: Optional[float] = None
    dependencies: List[str] = []  # task_ids that must complete first
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class MaintenanceRecord(BaseModel):
    maintenance_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    robot_id: str
    maintenance_type: MaintenanceType
    description: str
    scheduled_date: datetime
    completed_date: Optional[datetime] = None
    technician: Optional[str] = None
    parts_replaced: List[str] = []
    cost: Optional[float] = None
    notes: Optional[str] = None

class SafetyZone(BaseModel):
    zone_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    zone_type: SafetyZoneType
    coordinates: List[List[float]]  # polygon vertices [[x1,y1,z1], [x2,y2,z2], ...]
    active: bool = True
    robots_allowed: List[str] = []  # robot_ids allowed in this zone
    max_speed: Optional[float] = None  # maximum speed in this zone

class PerformanceMetrics(BaseModel):
    robot_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    uptime_percentage: float
    tasks_completed: int
    average_task_time: float
    error_rate: float
    efficiency_score: float
    energy_consumption: Optional[float] = None
    maintenance_score: float

class FleetSummary(BaseModel):
    total_robots: int
    active_robots: int
    idle_robots: int
    error_robots: int
    maintenance_robots: int
    total_tasks_today: int
    completed_tasks_today: int
    average_efficiency: float
    total_uptime: float

# Base Robot Adapter
class BaseRobotAdapter(ABC):
    """Abstract base class for robot-specific adapters"""
    
    def __init__(self, robot_info: RobotInfo):
        self.robot_info = robot_info
        self.connected = False
        self.last_heartbeat = None
    
    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection to robot"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """Disconnect from robot"""
        pass
    
    @abstractmethod
    async def translate_command(self, rap_command: RAPCommand) -> str:
        """Translate RAP command to robot-specific command"""
        pass
    
    @abstractmethod
    async def execute_command(self, native_command: str) -> CommandResult:
        """Execute robot-specific command"""
        pass
    
    @abstractmethod
    async def get_status(self) -> Dict[str, Any]:
        """Get current robot status"""
        pass
    
    @abstractmethod
    async def emergency_stop(self) -> bool:
        """Emergency stop the robot"""
        pass

# Universal Robots Adapter
class UniversalRobotsAdapter(BaseRobotAdapter):
    """Adapter for Universal Robots using RTDE and URScript"""
    
    PROTOCOL_LATENCY = 10  # milliseconds
    
    async def connect(self) -> bool:
        try:
            # Simulate RTDE connection
            logger.info(f"Connecting to UR robot at {self.robot_info.ip_address}")
            await asyncio.sleep(0.1)  # Simulate connection time
            self.connected = True
            self.last_heartbeat = datetime.now(timezone.utc)
            return True
        except Exception as e:
            logger.error(f"Failed to connect to UR robot: {e}")
            return False
    
    async def disconnect(self) -> bool:
        self.connected = False
        return True
    
    async def translate_command(self, rap_command: RAPCommand) -> str:
        """Translate RAP command to URScript"""
        if rap_command.command_type == CommandType.MOVE_TO_POSITION:
            params = MoveCommand(**rap_command.parameters)
            coords = params.coordinates
            speed = params.speed / 100.0  # Convert percentage to 0-1
            
            if params.precision == PrecisionLevel.ULTRA_FINE:
                blend_radius = 0.001
            elif params.precision == PrecisionLevel.FINE:
                blend_radius = 0.01
            else:
                blend_radius = 0.05
            
            return f"movel(p[{','.join(map(str, coords))}], a=1.2, v={speed}, r={blend_radius})"
        
        elif rap_command.command_type == CommandType.PICK_OBJECT:
            params = PickCommand(**rap_command.parameters)
            coords = params.coordinates
            force = params.grip_force / 100.0
            
            urscript = f"""
            # Move to approach position
            approach_pos = p[{','.join(map(str, coords[:3]))}+[0,0,{params.approach_height/1000}], {','.join(map(str, coords[3:]))}]
            movel(approach_pos, a=1.2, v=0.5)
            
            # Move to pick position
            pick_pos = p[{','.join(map(str, coords))}]
            movel(pick_pos, a=1.2, v=0.1)
            
            # Close gripper with specified force
            set_digital_out(0, True)  # Activate gripper
            """
            return urscript.strip()
        
        elif rap_command.command_type == CommandType.EMERGENCY_STOP:
            return "stop()"
        
        elif rap_command.command_type == CommandType.HOME_POSITION:
            return "movej([0, -1.57, 0, -1.57, 0, 0], a=1.4, v=1.05)"
        
        else:
            raise ValueError(f"Unsupported command type: {rap_command.command_type}")
    
    async def execute_command(self, native_command: str) -> CommandResult:
        """Execute URScript command via RTDE"""
        start_time = time.perf_counter()
        
        try:
            # Simulate command execution
            logger.info(f"Executing URScript: {native_command[:100]}...")
            await asyncio.sleep(0.05)  # Simulate execution time
            
            execution_time = (time.perf_counter() - start_time) * 1000
            
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_info.robot_id,
                success=True,
                execution_time_ms=execution_time,
                result_data={"urscript_executed": native_command}
            )
        
        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_info.robot_id,
                success=False,
                execution_time_ms=execution_time,
                error_message=str(e)
            )
    
    async def get_status(self) -> Dict[str, Any]:
        """Get UR robot status via RTDE"""
        return {
            "joint_positions": [0.0, -1.57, 0.0, -1.57, 0.0, 0.0],
            "tcp_position": [400.0, 0.0, 300.0, 0.0, 0.0, 0.0],
            "tcp_speed": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            "joint_temperatures": [35.2, 34.8, 36.1, 35.5, 34.9, 35.3],
            "robot_mode": "RUNNING",
            "safety_mode": "NORMAL",
            "program_state": "PLAYING"
        }
    
    async def emergency_stop(self) -> bool:
        """Emergency stop UR robot"""
        try:
            await self.execute_command("stop()")
            return True
        except:
            return False

# ABB Adapter
class ABBAdapter(BaseRobotAdapter):
    """Adapter for ABB robots using Robot Web Services (RWS)"""
    
    PROTOCOL_LATENCY = 5  # milliseconds
    
    async def connect(self) -> bool:
        try:
            logger.info(f"Connecting to ABB robot at {self.robot_info.ip_address}")
            await asyncio.sleep(0.1)
            self.connected = True
            self.last_heartbeat = datetime.now(timezone.utc)
            return True
        except Exception as e:
            logger.error(f"Failed to connect to ABB robot: {e}")
            return False
    
    async def disconnect(self) -> bool:
        self.connected = False
        return True
    
    async def translate_command(self, rap_command: RAPCommand) -> str:
        """Translate RAP command to RAPID"""
        if rap_command.command_type == CommandType.MOVE_TO_POSITION:
            params = MoveCommand(**rap_command.parameters)
            coords = params.coordinates
            speed = f"v{int(params.speed)}"
            
            precision = "fine" if params.precision == PrecisionLevel.ULTRA_FINE else "z10"
            
            return f"MoveL [[{coords[0]},{coords[1]},{coords[2]}],[{coords[3]},{coords[4]},{coords[5]},1]], {speed}, {precision}, tool0;"
        
        elif rap_command.command_type == CommandType.PICK_OBJECT:
            params = PickCommand(**rap_command.parameters)
            coords = params.coordinates
            
            rapid_code = f"""
            ! Move to approach position
            MoveL [[{coords[0]},{coords[1]},{coords[2]+params.approach_height}],[{coords[3]},{coords[4]},{coords[5]},1]], v50, z10, tool0;
            
            ! Move to pick position
            MoveL [[{coords[0]},{coords[1]},{coords[2]}],[{coords[3]},{coords[4]},{coords[5]},1]], v10, fine, tool0;
            
            ! Close gripper
            SetDO do_gripper_close, 1;
            WaitTime 0.5;
            """
            return rapid_code.strip()
        
        elif rap_command.command_type == CommandType.EMERGENCY_STOP:
            return "Stop;"
        
        elif rap_command.command_type == CommandType.HOME_POSITION:
            return "MoveAbsJ [[0,0,0,0,90,0],[9E+09,9E+09,9E+09,9E+09,9E+09,9E+09]], v1000, z100, tool0;"
        
        else:
            raise ValueError(f"Unsupported command type: {rap_command.command_type}")
    
    async def execute_command(self, native_command: str) -> CommandResult:
        """Execute RAPID command via RWS"""
        start_time = time.perf_counter()
        
        try:
            logger.info(f"Executing RAPID: {native_command[:100]}...")
            await asyncio.sleep(0.03)  # Simulate execution time
            
            execution_time = (time.perf_counter() - start_time) * 1000
            
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_info.robot_id,
                success=True,
                execution_time_ms=execution_time,
                result_data={"rapid_executed": native_command}
            )
        
        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_info.robot_id,
                success=False,
                execution_time_ms=execution_time,
                error_message=str(e)
            )
    
    async def get_status(self) -> Dict[str, Any]:
        """Get ABB robot status via RWS"""
        return {
            "joint_positions": [0.0, 0.0, 0.0, 0.0, 90.0, 0.0],
            "tcp_position": [600.0, 0.0, 400.0, 180.0, 0.0, 180.0],
            "operation_mode": "AUTO",
            "controller_state": "motoron",
            "execution_state": "running",
            "speed_ratio": 100
        }
    
    async def emergency_stop(self) -> bool:
        """Emergency stop ABB robot"""
        try:
            await self.execute_command("Stop;")
            return True
        except:
            return False

# KUKA Adapter
class KUKAAdapter(BaseRobotAdapter):
    """Adapter for KUKA robots using KRL and KUKA.Connect"""

    PROTOCOL_LATENCY = 20  # milliseconds

    async def connect(self) -> bool:
        try:
            logger.info(f"Connecting to KUKA robot at {self.robot_info.ip_address}")
            await asyncio.sleep(0.1)
            self.connected = True
            self.last_heartbeat = datetime.now(timezone.utc)
            return True
        except Exception as e:
            logger.error(f"Failed to connect to KUKA robot: {e}")
            return False

    async def disconnect(self) -> bool:
        self.connected = False
        return True

    async def translate_command(self, rap_command: RAPCommand) -> str:
        """Translate RAP command to KRL"""
        if rap_command.command_type == CommandType.MOVE_TO_POSITION:
            params = MoveCommand(**rap_command.parameters)
            coords = params.coordinates
            speed = int(params.speed)

            return f"LIN {{X {coords[0]}, Y {coords[1]}, Z {coords[2]}, A {coords[3]}, B {coords[4]}, C {coords[5]}}} C_VEL={speed}"

        elif rap_command.command_type == CommandType.PICK_OBJECT:
            params = PickCommand(**rap_command.parameters)
            coords = params.coordinates

            krl_code = f"""
            ; Move to approach position
            LIN {{X {coords[0]}, Y {coords[1]}, Z {coords[2]+params.approach_height}, A {coords[3]}, B {coords[4]}, C {coords[5]}}} C_VEL=50

            ; Move to pick position
            LIN {{X {coords[0]}, Y {coords[1]}, Z {coords[2]}, A {coords[3]}, B {coords[4]}, C {coords[5]}}} C_VEL=10

            ; Close gripper
            $OUT[1] = TRUE
            WAIT SEC 0.5
            """
            return krl_code.strip()

        elif rap_command.command_type == CommandType.EMERGENCY_STOP:
            return "HALT"

        elif rap_command.command_type == CommandType.HOME_POSITION:
            return "PTP HOME Vel=100%"

        else:
            raise ValueError(f"Unsupported command type: {rap_command.command_type}")

    async def execute_command(self, native_command: str) -> CommandResult:
        """Execute KRL command via KUKA.Connect"""
        start_time = time.perf_counter()

        try:
            logger.info(f"Executing KRL: {native_command[:100]}...")
            await asyncio.sleep(0.08)  # Simulate execution time

            execution_time = (time.perf_counter() - start_time) * 1000

            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_info.robot_id,
                success=True,
                execution_time_ms=execution_time,
                result_data={"krl_executed": native_command}
            )

        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000
            return CommandResult(
                command_id=str(uuid.uuid4()),
                robot_id=self.robot_info.robot_id,
                success=False,
                execution_time_ms=execution_time,
                error_message=str(e)
            )

    async def get_status(self) -> Dict[str, Any]:
        """Get KUKA robot status"""
        return {
            "axis_positions": [0.0, -90.0, 90.0, 0.0, 90.0, 0.0],
            "tcp_position": [850.0, 0.0, 1200.0, 180.0, 0.0, 180.0],
            "operation_mode": "AUT",
            "program_status": "RUNNING",
            "override": 100,
            "drives_on": True
        }

    async def emergency_stop(self) -> bool:
        """Emergency stop KUKA robot"""
        try:
            await self.execute_command("HALT")
            return True
        except:
            return False

# Protocol Handler
class ProtocolHandler:
    """Handles different communication protocols"""

    PROTOCOL_LATENCIES = {
        CommunicationProtocol.ETHERNET_IP: 5,
        CommunicationProtocol.MODBUS_TCP: 50,
        CommunicationProtocol.OPCUA: 20,
        CommunicationProtocol.ROS: 15,
        CommunicationProtocol.GRPC: 10,
        CommunicationProtocol.WEBSOCKET: 10,
        CommunicationProtocol.RTDE: 10,
        CommunicationProtocol.RWS: 5
    }

    def __init__(self):
        self.active_connections = {}

    async def auto_detect_protocol(self, robot_ip: str, robot_brand: RobotBrand) -> CommunicationProtocol:
        """Auto-detect the best communication protocol for a robot"""

        # Brand-specific protocol preferences
        brand_protocols = {
            RobotBrand.UNIVERSAL_ROBOTS: [CommunicationProtocol.RTDE, CommunicationProtocol.MODBUS_TCP],
            RobotBrand.ABB: [CommunicationProtocol.RWS, CommunicationProtocol.OPCUA],
            RobotBrand.KUKA: [CommunicationProtocol.OPCUA, CommunicationProtocol.ETHERNET_IP],
            RobotBrand.FANUC: [CommunicationProtocol.ETHERNET_IP, CommunicationProtocol.MODBUS_TCP],
            RobotBrand.BOSTON_DYNAMICS: [CommunicationProtocol.GRPC, CommunicationProtocol.WEBSOCKET]
        }

        protocols_to_test = brand_protocols.get(robot_brand, [CommunicationProtocol.MODBUS_TCP])

        for protocol in protocols_to_test:
            if await self.test_protocol_connection(robot_ip, protocol):
                return protocol

        raise ConnectionError(f"Cannot establish communication with robot at {robot_ip}")

    async def test_protocol_connection(self, robot_ip: str, protocol: CommunicationProtocol) -> bool:
        """Test if a specific protocol can connect to the robot"""
        try:
            # Simulate protocol testing
            await asyncio.sleep(0.01)

            # For demo purposes, assume all protocols work
            return True
        except:
            return False

    def get_protocol_latency(self, protocol: CommunicationProtocol) -> int:
        """Get expected latency for a protocol in milliseconds"""
        return self.PROTOCOL_LATENCIES.get(protocol, 50)

# Capability Discovery Engine
class RobotCapabilityDiscovery:
    """Discovers and analyzes robot capabilities"""

    def __init__(self):
        self.capability_cache = {}

    async def discover_robot_capabilities(self, robot_info: RobotInfo) -> RobotCapabilities:
        """Discover comprehensive robot capabilities"""

        # Brand-specific capability templates
        brand_capabilities = {
            RobotBrand.UNIVERSAL_ROBOTS: {
                "movement": {
                    "reach_radius": 850.0,  # mm
                    "precision": 0.1,  # mm
                    "max_speed": 1000.0,  # mm/s
                    "acceleration": 1200.0  # mm/s²
                },
                "sensors": {
                    "force_feedback": True,
                    "vision_system": False,
                    "collision_detection": True,
                    "joint_torque_sensing": True
                },
                "specialized_tools": {
                    "gripper_types": ["pneumatic", "electric", "vacuum"],
                    "welding_capability": False,
                    "painting_capability": False,
                    "assembly_capability": True
                },
                "communication_protocols": [CommunicationProtocol.RTDE, CommunicationProtocol.MODBUS_TCP],
                "max_payload": 10.0,  # kg
                "reach_radius": 850.0,  # mm
                "degrees_of_freedom": 6,
                "precision_rating": 0.1  # mm
            },

            RobotBrand.ABB: {
                "movement": {
                    "reach_radius": 1200.0,
                    "precision": 0.05,
                    "max_speed": 1500.0,
                    "acceleration": 2000.0
                },
                "sensors": {
                    "force_feedback": True,
                    "vision_system": True,
                    "collision_detection": True,
                    "joint_torque_sensing": True
                },
                "specialized_tools": {
                    "gripper_types": ["pneumatic", "electric", "servo"],
                    "welding_capability": True,
                    "painting_capability": True,
                    "assembly_capability": True
                },
                "communication_protocols": [CommunicationProtocol.RWS, CommunicationProtocol.OPCUA],
                "max_payload": 20.0,
                "reach_radius": 1200.0,
                "degrees_of_freedom": 6,
                "precision_rating": 0.05
            },

            RobotBrand.KUKA: {
                "movement": {
                    "reach_radius": 1300.0,
                    "precision": 0.03,
                    "max_speed": 2000.0,
                    "acceleration": 2500.0
                },
                "sensors": {
                    "force_feedback": True,
                    "vision_system": True,
                    "collision_detection": True,
                    "joint_torque_sensing": True
                },
                "specialized_tools": {
                    "gripper_types": ["pneumatic", "electric", "servo", "magnetic"],
                    "welding_capability": True,
                    "painting_capability": True,
                    "assembly_capability": True
                },
                "communication_protocols": [CommunicationProtocol.OPCUA, CommunicationProtocol.ETHERNET_IP],
                "max_payload": 30.0,
                "reach_radius": 1300.0,
                "degrees_of_freedom": 6,
                "precision_rating": 0.03
            }
        }

        # Get base capabilities for the robot brand
        base_caps = brand_capabilities.get(robot_info.brand, {})

        # Create RobotCapabilities object
        capabilities = RobotCapabilities(
            movement=base_caps.get("movement", {}),
            sensors=base_caps.get("sensors", {}),
            specialized_tools=base_caps.get("specialized_tools", {}),
            communication_protocols=base_caps.get("communication_protocols", []),
            max_payload=base_caps.get("max_payload", 0.0),
            reach_radius=base_caps.get("reach_radius", 0.0),
            degrees_of_freedom=base_caps.get("degrees_of_freedom", 6),
            precision_rating=base_caps.get("precision_rating", 0.1)
        )

        # Cache the capabilities
        self.capability_cache[robot_info.robot_id] = capabilities

        return capabilities

    async def measure_robot_precision(self, robot_id: str) -> float:
        """Measure actual robot precision through test movements"""
        # Simulate precision measurement
        await asyncio.sleep(0.1)
        return 0.05  # mm

    async def test_robot_reach(self, robot_id: str) -> float:
        """Test actual robot reach radius"""
        # Simulate reach testing
        await asyncio.sleep(0.1)
        return 850.0  # mm

# Robot Abstraction Protocol Manager
class RAPManager:
    """Main manager for Robot Abstraction Protocol"""

    def __init__(self):
        self.robots: Dict[str, RobotInfo] = {}
        self.adapters: Dict[str, BaseRobotAdapter] = {}
        self.protocol_handler = ProtocolHandler()
        self.capability_discovery = RobotCapabilityDiscovery()
        self.command_history: List[CommandResult] = []
        self.active_websockets: List[WebSocket] = []

    def get_adapter_class(self, brand: RobotBrand) -> type:
        """Get the appropriate adapter class for a robot brand"""
        adapter_map = {
            RobotBrand.UNIVERSAL_ROBOTS: UniversalRobotsAdapter,
            RobotBrand.ABB: ABBAdapter,
            RobotBrand.KUKA: KUKAAdapter,
            # Add more adapters as needed
        }

        adapter_class = adapter_map.get(brand)
        if not adapter_class:
            raise ValueError(f"No adapter available for robot brand: {brand}")

        return adapter_class

    async def register_robot(self, robot_info: RobotInfo) -> bool:
        """Register a new robot with the RAP system"""
        try:
            # Discover capabilities
            capabilities = await self.capability_discovery.discover_robot_capabilities(robot_info)
            robot_info.capabilities = capabilities

            # Create appropriate adapter
            adapter_class = self.get_adapter_class(robot_info.brand)
            adapter = adapter_class(robot_info)

            # Test connection
            if await adapter.connect():
                self.robots[robot_info.robot_id] = robot_info
                self.adapters[robot_info.robot_id] = adapter
                robot_info.status = RobotStatus.IDLE
                robot_info.last_seen = datetime.now(timezone.utc)

                logger.info(f"Successfully registered robot {robot_info.robot_id}")
                await self.broadcast_robot_update(robot_info)
                return True
            else:
                logger.error(f"Failed to connect to robot {robot_info.robot_id}")
                return False

        except Exception as e:
            logger.error(f"Error registering robot {robot_info.robot_id}: {e}")
            return False

    async def execute_command(self, command: RAPCommand) -> CommandResult:
        """Execute a RAP command on the specified robot"""
        if command.robot_id not in self.adapters:
            raise HTTPException(status_code=404, detail=f"Robot {command.robot_id} not found")

        adapter = self.adapters[command.robot_id]
        robot_info = self.robots[command.robot_id]

        try:
            # Update robot status
            robot_info.status = RobotStatus.RUNNING
            robot_info.last_command = command.command_type.value

            # Translate command to robot-specific format
            native_command = await adapter.translate_command(command)

            # Execute the command
            result = await adapter.execute_command(native_command)
            result.command_id = command.command_id

            # Update robot status
            robot_info.status = RobotStatus.IDLE if result.success else RobotStatus.ERROR
            robot_info.last_seen = datetime.now(timezone.utc)

            if not result.success:
                robot_info.error_message = result.error_message

            # Store command history
            self.command_history.append(result)
            if len(self.command_history) > 1000:  # Keep last 1000 commands
                self.command_history = self.command_history[-1000:]

            # Broadcast update
            await self.broadcast_robot_update(robot_info)

            return result

        except Exception as e:
            robot_info.status = RobotStatus.ERROR
            robot_info.error_message = str(e)

            error_result = CommandResult(
                command_id=command.command_id,
                robot_id=command.robot_id,
                success=False,
                execution_time_ms=0.0,
                error_message=str(e)
            )

            self.command_history.append(error_result)
            await self.broadcast_robot_update(robot_info)

            return error_result

    async def get_robot_status(self, robot_id: str) -> Dict[str, Any]:
        """Get detailed status of a specific robot"""
        if robot_id not in self.adapters:
            raise HTTPException(status_code=404, detail=f"Robot {robot_id} not found")

        adapter = self.adapters[robot_id]
        robot_info = self.robots[robot_id]

        try:
            detailed_status = await adapter.get_status()
            return {
                "robot_info": robot_info.dict(),
                "detailed_status": detailed_status,
                "connection_status": adapter.connected,
                "last_heartbeat": adapter.last_heartbeat
            }
        except Exception as e:
            return {
                "robot_info": robot_info.dict(),
                "error": str(e),
                "connection_status": False
            }

    async def emergency_stop_robot(self, robot_id: str) -> bool:
        """Emergency stop a specific robot"""
        if robot_id not in self.adapters:
            raise HTTPException(status_code=404, detail=f"Robot {robot_id} not found")

        adapter = self.adapters[robot_id]
        robot_info = self.robots[robot_id]

        try:
            success = await adapter.emergency_stop()
            if success:
                robot_info.status = RobotStatus.EMERGENCY_STOP
                robot_info.last_seen = datetime.now(timezone.utc)
                await self.broadcast_robot_update(robot_info)

            return success
        except Exception as e:
            logger.error(f"Emergency stop failed for robot {robot_id}: {e}")
            return False

    async def emergency_stop_all(self) -> Dict[str, bool]:
        """Emergency stop all robots"""
        results = {}

        for robot_id in self.adapters.keys():
            results[robot_id] = await self.emergency_stop_robot(robot_id)

        return results

    async def broadcast_robot_update(self, robot_info: RobotInfo):
        """Broadcast robot status update to all connected WebSocket clients"""
        if not self.active_websockets:
            return

        update_message = {
            "type": "robot_update",
            "robot_id": robot_info.robot_id,
            "status": robot_info.status.value,
            "last_command": robot_info.last_command,
            "error_message": robot_info.error_message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        # Send to all connected clients
        disconnected_clients = []
        for websocket in self.active_websockets:
            try:
                await websocket.send_json(update_message)
            except:
                disconnected_clients.append(websocket)

        # Remove disconnected clients
        for client in disconnected_clients:
            self.active_websockets.remove(client)

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics for all robots"""
        if not self.command_history:
            return {"total_commands": 0, "success_rate": 0.0, "avg_execution_time": 0.0}

        total_commands = len(self.command_history)
        successful_commands = sum(1 for cmd in self.command_history if cmd.success)
        success_rate = (successful_commands / total_commands) * 100

        execution_times = [cmd.execution_time_ms for cmd in self.command_history if cmd.success]
        avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0.0

        return {
            "total_commands": total_commands,
            "successful_commands": successful_commands,
            "success_rate": success_rate,
            "avg_execution_time": avg_execution_time,
            "active_robots": len([r for r in self.robots.values() if r.status != RobotStatus.OFFLINE])
        }

# Enterprise Task Queue Manager
class TaskQueueManager:
    def __init__(self):
        self.task_queue: deque = deque()
        self.active_tasks: Dict[str, RobotTask] = {}
        self.completed_tasks: List[RobotTask] = []
        self.task_history: List[RobotTask] = []
        self.lock = threading.Lock()

    def add_task(self, task: RobotTask) -> bool:
        """Add task to queue with priority ordering"""
        with self.lock:
            # Insert task based on priority
            priority_order = {
                TaskPriority.EMERGENCY: 0,
                TaskPriority.SAFETY_CRITICAL: 1,
                TaskPriority.HIGH: 2,
                TaskPriority.NORMAL: 3,
                TaskPriority.LOW: 4
            }

            task_priority = priority_order[task.priority]

            # Find insertion point
            inserted = False
            for i, existing_task in enumerate(self.task_queue):
                if priority_order[existing_task.priority] > task_priority:
                    self.task_queue.insert(i, task)
                    inserted = True
                    break

            if not inserted:
                self.task_queue.append(task)

            task.status = TaskStatus.QUEUED
            return True

    def get_next_task(self, robot_id: str) -> Optional[RobotTask]:
        """Get next task for specific robot"""
        with self.lock:
            for i, task in enumerate(self.task_queue):
                if task.robot_id == robot_id:
                    # Check dependencies
                    if self._check_dependencies(task):
                        task = self.task_queue[i]
                        del self.task_queue[i]
                        task.status = TaskStatus.EXECUTING
                        task.started_at = datetime.now(timezone.utc)
                        self.active_tasks[task.task_id] = task
                        return task
            return None

    def _check_dependencies(self, task: RobotTask) -> bool:
        """Check if task dependencies are satisfied"""
        for dep_task_id in task.dependencies:
            # Check if dependency is completed
            if not any(t.task_id == dep_task_id and t.status == TaskStatus.COMPLETED
                      for t in self.completed_tasks):
                return False
        return True

    def complete_task(self, task_id: str, success: bool, error_message: Optional[str] = None):
        """Mark task as completed"""
        with self.lock:
            if task_id in self.active_tasks:
                task = self.active_tasks[task_id]
                task.completed_at = datetime.now(timezone.utc)
                task.actual_duration = (task.completed_at - task.started_at).total_seconds()

                if success:
                    task.status = TaskStatus.COMPLETED
                else:
                    task.status = TaskStatus.FAILED
                    task.error_message = error_message

                self.completed_tasks.append(task)
                self.task_history.append(task)
                del self.active_tasks[task_id]

                # Keep only last 1000 completed tasks
                if len(self.completed_tasks) > 1000:
                    self.completed_tasks = self.completed_tasks[-1000:]

    def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue status"""
        with self.lock:
            return {
                "queued_tasks": len(self.task_queue),
                "active_tasks": len(self.active_tasks),
                "completed_tasks": len(self.completed_tasks),
                "queue_by_priority": {
                    priority.value: sum(1 for t in self.task_queue if t.priority == priority)
                    for priority in TaskPriority
                }
            }

# Fleet Performance Analytics
class FleetAnalytics:
    def __init__(self):
        self.performance_data: Dict[str, List[PerformanceMetrics]] = defaultdict(list)
        self.maintenance_records: List[MaintenanceRecord] = []
        self.safety_incidents: List[Dict[str, Any]] = []

    def record_performance(self, metrics: PerformanceMetrics):
        """Record performance metrics for a robot"""
        self.performance_data[metrics.robot_id].append(metrics)

        # Keep only last 1000 entries per robot
        if len(self.performance_data[metrics.robot_id]) > 1000:
            self.performance_data[metrics.robot_id] = self.performance_data[metrics.robot_id][-1000:]

    def get_fleet_summary(self, robots: Dict[str, Any]) -> FleetSummary:
        """Generate fleet summary statistics"""
        total_robots = len(robots)
        active_robots = len([r for r in robots.values() if r.status == RobotStatus.RUNNING])
        idle_robots = len([r for r in robots.values() if r.status == RobotStatus.IDLE])
        error_robots = len([r for r in robots.values() if r.status == RobotStatus.ERROR])
        maintenance_robots = len([r for r in robots.values() if r.status == RobotStatus.MAINTENANCE])

        # Calculate today's tasks
        today = datetime.now(timezone.utc).date()
        total_tasks_today = 0
        completed_tasks_today = 0

        # Calculate average efficiency
        all_efficiency_scores = []
        all_uptime_scores = []

        for robot_id, metrics_list in self.performance_data.items():
            recent_metrics = [m for m in metrics_list if m.timestamp.date() == today]
            if recent_metrics:
                latest = recent_metrics[-1]
                all_efficiency_scores.append(latest.efficiency_score)
                all_uptime_scores.append(latest.uptime_percentage)

        average_efficiency = np.mean(all_efficiency_scores) if all_efficiency_scores else 0.0
        total_uptime = np.mean(all_uptime_scores) if all_uptime_scores else 0.0

        return FleetSummary(
            total_robots=total_robots,
            active_robots=active_robots,
            idle_robots=idle_robots,
            error_robots=error_robots,
            maintenance_robots=maintenance_robots,
            total_tasks_today=total_tasks_today,
            completed_tasks_today=completed_tasks_today,
            average_efficiency=average_efficiency,
            total_uptime=total_uptime
        )

    def get_robot_performance_trend(self, robot_id: str, days: int = 7) -> Dict[str, Any]:
        """Get performance trend for specific robot"""
        if robot_id not in self.performance_data:
            return {"error": "No performance data available"}

        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        recent_metrics = [
            m for m in self.performance_data[robot_id]
            if m.timestamp >= cutoff_date
        ]

        if not recent_metrics:
            return {"error": "No recent performance data"}

        # Calculate trends
        efficiency_trend = [m.efficiency_score for m in recent_metrics]
        uptime_trend = [m.uptime_percentage for m in recent_metrics]
        error_rate_trend = [m.error_rate for m in recent_metrics]

        return {
            "robot_id": robot_id,
            "period_days": days,
            "data_points": len(recent_metrics),
            "efficiency": {
                "current": efficiency_trend[-1] if efficiency_trend else 0,
                "average": np.mean(efficiency_trend),
                "trend": "improving" if len(efficiency_trend) > 1 and efficiency_trend[-1] > efficiency_trend[0] else "declining"
            },
            "uptime": {
                "current": uptime_trend[-1] if uptime_trend else 0,
                "average": np.mean(uptime_trend),
                "trend": "improving" if len(uptime_trend) > 1 and uptime_trend[-1] > uptime_trend[0] else "declining"
            },
            "error_rate": {
                "current": error_rate_trend[-1] if error_rate_trend else 0,
                "average": np.mean(error_rate_trend),
                "trend": "improving" if len(error_rate_trend) > 1 and error_rate_trend[-1] < error_rate_trend[0] else "declining"
            }
        }

# Global RAP Manager instance
rap_manager = RAPManager()
task_manager = TaskQueueManager()
fleet_analytics = FleetAnalytics()

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Robot Abstraction Protocol (RAP) Service",
        "version": "1.0.0",
        "description": "Universal robot control interface supporting multiple manufacturers",
        "supported_brands": [brand.value for brand in RobotBrand],
        "active_robots": len(rap_manager.robots),
        "total_commands_executed": len(rap_manager.command_history)
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "robot-abstraction-protocol",
        "active_robots": len(rap_manager.robots),
        "active_connections": len(rap_manager.adapters)
    }

# Robot Management Endpoints
@app.post("/api/v1/robots/register")
async def register_robot(robot_info: RobotInfo):
    """Register a new robot with the RAP system"""
    success = await rap_manager.register_robot(robot_info)

    if success:
        return {
            "success": True,
            "message": f"Robot {robot_info.robot_id} registered successfully",
            "robot_info": robot_info.dict()
        }
    else:
        raise HTTPException(status_code=400, detail=f"Failed to register robot {robot_info.robot_id}")

@app.get("/api/v1/robots")
async def list_robots():
    """List all registered robots"""
    robots = [robot.dict() for robot in rap_manager.robots.values()]
    return {
        "robots": robots,
        "total_count": len(robots)
    }

@app.get("/api/v1/robots/{robot_id}")
async def get_robot(robot_id: str):
    """Get detailed information about a specific robot"""
    if robot_id not in rap_manager.robots:
        raise HTTPException(status_code=404, detail=f"Robot {robot_id} not found")

    return await rap_manager.get_robot_status(robot_id)

@app.delete("/api/v1/robots/{robot_id}")
async def unregister_robot(robot_id: str):
    """Unregister a robot from the RAP system"""
    if robot_id not in rap_manager.robots:
        raise HTTPException(status_code=404, detail=f"Robot {robot_id} not found")

    # Disconnect adapter
    if robot_id in rap_manager.adapters:
        await rap_manager.adapters[robot_id].disconnect()
        del rap_manager.adapters[robot_id]

    # Remove robot
    del rap_manager.robots[robot_id]

    return {
        "success": True,
        "message": f"Robot {robot_id} unregistered successfully"
    }

# Command Execution Endpoints
@app.post("/api/v1/robots/{robot_id}/commands")
async def execute_command(robot_id: str, command: RAPCommand):
    """Execute a RAP command on a specific robot"""
    command.robot_id = robot_id  # Ensure robot_id matches URL parameter
    result = await rap_manager.execute_command(command)

    return {
        "success": result.success,
        "command_result": result.dict()
    }

@app.post("/api/v1/robots/{robot_id}/move")
async def move_robot(robot_id: str, move_params: MoveCommand):
    """Move robot to specified position"""
    command = RAPCommand(
        command_type=CommandType.MOVE_TO_POSITION,
        robot_id=robot_id,
        parameters=move_params.dict()
    )

    result = await rap_manager.execute_command(command)
    return {
        "success": result.success,
        "command_result": result.dict()
    }

@app.post("/api/v1/robots/{robot_id}/pick")
async def pick_object(robot_id: str, pick_params: PickCommand):
    """Pick an object at specified position"""
    command = RAPCommand(
        command_type=CommandType.PICK_OBJECT,
        robot_id=robot_id,
        parameters=pick_params.dict()
    )

    result = await rap_manager.execute_command(command)
    return {
        "success": result.success,
        "command_result": result.dict()
    }

@app.post("/api/v1/robots/{robot_id}/home")
async def home_robot(robot_id: str):
    """Move robot to home position"""
    command = RAPCommand(
        command_type=CommandType.HOME_POSITION,
        robot_id=robot_id
    )

    result = await rap_manager.execute_command(command)
    return {
        "success": result.success,
        "command_result": result.dict()
    }

@app.post("/api/v1/robots/{robot_id}/emergency-stop")
async def emergency_stop_robot(robot_id: str):
    """Emergency stop a specific robot"""
    success = await rap_manager.emergency_stop_robot(robot_id)

    return {
        "success": success,
        "message": f"Emergency stop {'successful' if success else 'failed'} for robot {robot_id}"
    }

@app.post("/api/v1/robots/emergency-stop-all")
async def emergency_stop_all():
    """Emergency stop all robots"""
    results = await rap_manager.emergency_stop_all()

    return {
        "success": all(results.values()),
        "results": results,
        "message": f"Emergency stop executed on {len(results)} robots"
    }

# Status and Monitoring Endpoints
@app.get("/api/v1/robots/{robot_id}/status")
async def get_robot_status(robot_id: str):
    """Get current status of a specific robot"""
    return await rap_manager.get_robot_status(robot_id)

@app.get("/api/v1/robots/brands")
async def get_supported_brands():
    """Get list of supported robot brands"""
    return {
        "supported_brands": [
            {
                "brand": brand.value,
                "name": brand.value.replace("_", " ").title(),
                "protocols": []  # Could be populated with specific protocols
            }
            for brand in RobotBrand
        ]
    }

@app.get("/api/v1/commands/history")
async def get_command_history(limit: int = 100):
    """Get command execution history"""
    history = rap_manager.command_history[-limit:] if rap_manager.command_history else []

    return {
        "commands": [cmd.dict() for cmd in history],
        "total_count": len(rap_manager.command_history)
    }

@app.get("/api/v1/performance/stats")
async def get_performance_stats():
    """Get performance statistics"""
    return rap_manager.get_performance_stats()

# Capability and Discovery Endpoints
@app.get("/api/v1/robots/{robot_id}/capabilities")
async def get_robot_capabilities(robot_id: str):
    """Get capabilities of a specific robot"""
    if robot_id not in rap_manager.robots:
        raise HTTPException(status_code=404, detail=f"Robot {robot_id} not found")

    robot = rap_manager.robots[robot_id]
    return {
        "robot_id": robot_id,
        "capabilities": robot.capabilities.dict()
    }

@app.post("/api/v1/robots/{robot_id}/discover-capabilities")
async def rediscover_capabilities(robot_id: str):
    """Rediscover capabilities of a specific robot"""
    if robot_id not in rap_manager.robots:
        raise HTTPException(status_code=404, detail=f"Robot {robot_id} not found")

    robot_info = rap_manager.robots[robot_id]
    capabilities = await rap_manager.capability_discovery.discover_robot_capabilities(robot_info)
    robot_info.capabilities = capabilities

    return {
        "success": True,
        "robot_id": robot_id,
        "capabilities": capabilities.dict()
    }

# Command Templates and Utilities
@app.get("/api/v1/robots/commands/templates")
async def get_command_templates():
    """Get command templates for different robot operations"""
    return {
        "move_to_position": {
            "command_type": "move_to_position",
            "parameters": {
                "coordinates": [400.0, 0.0, 300.0, 0.0, 0.0, 0.0],
                "speed": 50.0,
                "precision": "fine",
                "relative": False
            }
        },
        "pick_object": {
            "command_type": "pick_object",
            "parameters": {
                "coordinates": [400.0, 0.0, 100.0, 0.0, 0.0, 0.0],
                "grip_force": 50.0,
                "object_type": "standard",
                "approach_height": 50.0
            }
        },
        "home_position": {
            "command_type": "home_position",
            "parameters": {}
        }
    }

# WebSocket endpoint for real-time updates
@app.websocket("/ws/robots")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time robot status updates"""
    await websocket.accept()
    rap_manager.active_websockets.append(websocket)

    try:
        # Send initial status
        initial_status = {
            "type": "initial_status",
            "robots": [robot.dict() for robot in rap_manager.robots.values()],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await websocket.send_json(initial_status)

        # Keep connection alive
        while True:
            # Send periodic heartbeat
            heartbeat = {
                "type": "heartbeat",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "active_robots": len(rap_manager.robots)
            }
            await websocket.send_json(heartbeat)
            await asyncio.sleep(30)  # Send heartbeat every 30 seconds

    except WebSocketDisconnect:
        rap_manager.active_websockets.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in rap_manager.active_websockets:
            rap_manager.active_websockets.remove(websocket)

# Enterprise Fleet Management API Endpoints

@app.post("/api/v1/fleet/tasks")
async def create_task(task: RobotTask):
    """Create a new robot task"""
    success = task_manager.add_task(task)

    if success:
        return {
            "success": True,
            "message": f"Task {task.task_id} added to queue",
            "task_id": task.task_id,
            "priority": task.priority.value,
            "estimated_duration": task.estimated_duration
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to add task to queue")

@app.get("/api/v1/fleet/tasks/queue")
async def get_task_queue():
    """Get current task queue status"""
    return task_manager.get_queue_status()

@app.get("/api/v1/fleet/tasks/{task_id}")
async def get_task_status(task_id: str):
    """Get status of specific task"""
    # Check active tasks
    if task_id in task_manager.active_tasks:
        return task_manager.active_tasks[task_id]

    # Check completed tasks
    for task in task_manager.completed_tasks:
        if task.task_id == task_id:
            return task

    # Check queue
    for task in task_manager.task_queue:
        if task.task_id == task_id:
            return task

    raise HTTPException(status_code=404, detail="Task not found")

@app.post("/api/v1/fleet/tasks/{task_id}/cancel")
async def cancel_task(task_id: str):
    """Cancel a pending or active task"""
    # Remove from queue if pending
    with task_manager.lock:
        for i, task in enumerate(task_manager.task_queue):
            if task.task_id == task_id:
                task.status = TaskStatus.CANCELLED
                del task_manager.task_queue[i]
                return {"success": True, "message": "Task cancelled"}

        # Cancel active task
        if task_id in task_manager.active_tasks:
            task = task_manager.active_tasks[task_id]
            task.status = TaskStatus.CANCELLED
            task_manager.complete_task(task_id, False, "Task cancelled by user")
            return {"success": True, "message": "Active task cancelled"}

    raise HTTPException(status_code=404, detail="Task not found or already completed")

@app.get("/api/v1/fleet/summary")
async def get_fleet_summary():
    """Get fleet summary statistics"""
    summary = fleet_analytics.get_fleet_summary(rap_manager.robots)
    return summary

@app.get("/api/v1/fleet/performance/{robot_id}")
async def get_robot_performance(robot_id: str, days: int = 7):
    """Get performance trend for specific robot"""
    if robot_id not in rap_manager.robots:
        raise HTTPException(status_code=404, detail="Robot not found")

    return fleet_analytics.get_robot_performance_trend(robot_id, days)

@app.post("/api/v1/fleet/performance/{robot_id}")
async def record_robot_performance(robot_id: str, metrics: PerformanceMetrics):
    """Record performance metrics for a robot"""
    if robot_id not in rap_manager.robots:
        raise HTTPException(status_code=404, detail="Robot not found")

    metrics.robot_id = robot_id
    fleet_analytics.record_performance(metrics)

    return {
        "success": True,
        "message": f"Performance metrics recorded for robot {robot_id}",
        "timestamp": metrics.timestamp.isoformat()
    }

@app.get("/api/v1/fleet/analytics/efficiency")
async def get_efficiency_analytics():
    """Get fleet efficiency analytics"""
    all_robots = rap_manager.robots
    efficiency_data = {}

    for robot_id in all_robots.keys():
        trend = fleet_analytics.get_robot_performance_trend(robot_id, 7)
        if "error" not in trend:
            efficiency_data[robot_id] = {
                "current_efficiency": trend["efficiency"]["current"],
                "average_efficiency": trend["efficiency"]["average"],
                "trend": trend["efficiency"]["trend"]
            }

    return {
        "fleet_efficiency": efficiency_data,
        "fleet_average": np.mean([data["current_efficiency"] for data in efficiency_data.values()]) if efficiency_data else 0.0,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/v1/fleet/maintenance/schedule")
async def get_maintenance_schedule():
    """Get maintenance schedule for all robots"""
    # Generate predictive maintenance schedule based on performance data
    maintenance_schedule = []

    for robot_id in rap_manager.robots.keys():
        trend = fleet_analytics.get_robot_performance_trend(robot_id, 30)
        if "error" not in trend:
            # Simple predictive logic
            efficiency = trend["efficiency"]["current"]
            error_rate = trend["error_rate"]["current"]

            if efficiency < 70 or error_rate > 5:
                maintenance_schedule.append({
                    "robot_id": robot_id,
                    "maintenance_type": MaintenanceType.PREDICTIVE.value,
                    "priority": "high" if efficiency < 50 or error_rate > 10 else "medium",
                    "recommended_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
                    "reason": f"Efficiency: {efficiency}%, Error rate: {error_rate}%"
                })

    return {
        "maintenance_schedule": maintenance_schedule,
        "total_robots_needing_maintenance": len(maintenance_schedule),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/v1/fleet/emergency-stop")
async def fleet_emergency_stop():
    """Emergency stop all robots in the fleet"""
    results = {}

    for robot_id in rap_manager.robots.keys():
        try:
            command = RAPCommand(
                command_type=CommandType.EMERGENCY_STOP,
                robot_id=robot_id,
                priority=10,  # Maximum priority
                timeout_seconds=5
            )
            result = await rap_manager.execute_command(command)
            results[robot_id] = {"success": result.success, "message": "Emergency stop executed"}
        except Exception as e:
            results[robot_id] = {"success": False, "error": str(e)}

    return {
        "fleet_emergency_stop": True,
        "results": results,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.websocket("/ws/fleet/realtime")
async def fleet_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time fleet monitoring"""
    await websocket.accept()

    try:
        while True:
            # Send fleet summary
            summary = fleet_analytics.get_fleet_summary(rap_manager.robots)
            queue_status = task_manager.get_queue_status()

            fleet_update = {
                "type": "fleet_update",
                "fleet_summary": summary.dict(),
                "task_queue": queue_status,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            await websocket.send_json(fleet_update)
            await asyncio.sleep(2)  # Send updates every 2 seconds

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Fleet WebSocket error: {e}")

# Startup event to register demo robots
@app.on_event("startup")
async def startup_event():
    """Initialize RAP service with demo robots"""
    logger.info("Robot Abstraction Protocol Service starting up...")

    # Register demo robots for testing
    demo_robots = [
        RobotInfo(
            robot_id="ur5e_001",
            name="UR5e Assembly Robot",
            brand=RobotBrand.UNIVERSAL_ROBOTS,
            model="UR5e",
            ip_address="192.168.1.100",
            port=30001,
            capabilities=RobotCapabilities()
        ),
        RobotInfo(
            robot_id="abb_irb120_001",
            name="ABB IRB120 Precision Robot",
            brand=RobotBrand.ABB,
            model="IRB120",
            ip_address="192.168.1.101",
            port=80,
            capabilities=RobotCapabilities()
        ),
        RobotInfo(
            robot_id="kuka_kr6_001",
            name="KUKA KR6 R900 Robot",
            brand=RobotBrand.KUKA,
            model="KR6 R900",
            ip_address="192.168.1.102",
            port=7000,
            capabilities=RobotCapabilities()
        )
    ]

    for robot in demo_robots:
        try:
            await rap_manager.register_robot(robot)
            logger.info(f"Registered demo robot: {robot.robot_id}")

            # Initialize demo performance data
            demo_metrics = PerformanceMetrics(
                robot_id=robot.robot_id,
                uptime_percentage=np.random.uniform(85, 99),
                tasks_completed=np.random.randint(50, 200),
                average_task_time=np.random.uniform(30, 120),
                error_rate=np.random.uniform(0.1, 5.0),
                efficiency_score=np.random.uniform(70, 95),
                maintenance_score=np.random.uniform(80, 100)
            )
            fleet_analytics.record_performance(demo_metrics)

        except Exception as e:
            logger.warning(f"Failed to register demo robot {robot.robot_id}: {e}")

    # Create some demo tasks
    demo_tasks = [
        RobotTask(
            robot_id="ur5e_001",
            task_type="assembly",
            priority=TaskPriority.HIGH,
            estimated_duration=300.0,
            commands=[]
        ),
        RobotTask(
            robot_id="abb_irb120_001",
            task_type="quality_inspection",
            priority=TaskPriority.NORMAL,
            estimated_duration=180.0,
            commands=[]
        ),
        RobotTask(
            robot_id="kuka_kr6_001",
            task_type="packaging",
            priority=TaskPriority.LOW,
            estimated_duration=240.0,
            commands=[]
        )
    ]

    for task in demo_tasks:
        task_manager.add_task(task)
        logger.info(f"Added demo task: {task.task_id}")

    logger.info(f"🤖 RAP Service initialized with {len(rap_manager.robots)} robots")
    logger.info(f"📋 Task queue initialized with {len(demo_tasks)} demo tasks")
    logger.info(f"📊 Fleet analytics system ready")
    logger.info(f"🚀 Enterprise robot management features active")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
