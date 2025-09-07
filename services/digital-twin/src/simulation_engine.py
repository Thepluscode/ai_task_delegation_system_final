"""
Digital Twin & Simulation Engine
3D visualization, physics simulation, and virtual commissioning system
"""

import asyncio
import json
import logging
import numpy as np
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import math
import threading
import time

logger = logging.getLogger(__name__)

class SimulationState(Enum):
    STOPPED = "stopped"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"

class ObjectType(Enum):
    ROBOT = "robot"
    CONVEYOR = "conveyor"
    SENSOR = "sensor"
    WORKPIECE = "workpiece"
    OBSTACLE = "obstacle"
    TOOL = "tool"
    FIXTURE = "fixture"

@dataclass
class Vector3D:
    x: float
    y: float
    z: float
    
    def __add__(self, other):
        return Vector3D(self.x + other.x, self.y + other.y, self.z + other.z)
    
    def __sub__(self, other):
        return Vector3D(self.x - other.x, self.y - other.y, self.z - other.z)
    
    def __mul__(self, scalar):
        return Vector3D(self.x * scalar, self.y * scalar, self.z * scalar)
    
    def magnitude(self):
        return math.sqrt(self.x**2 + self.y**2 + self.z**2)
    
    def normalize(self):
        mag = self.magnitude()
        if mag > 0:
            return Vector3D(self.x/mag, self.y/mag, self.z/mag)
        return Vector3D(0, 0, 0)

@dataclass
class Quaternion:
    w: float
    x: float
    y: float
    z: float
    
    def to_euler(self) -> Tuple[float, float, float]:
        """Convert quaternion to Euler angles (roll, pitch, yaw)"""
        # Roll (x-axis rotation)
        sinr_cosp = 2 * (self.w * self.x + self.y * self.z)
        cosr_cosp = 1 - 2 * (self.x * self.x + self.y * self.y)
        roll = math.atan2(sinr_cosp, cosr_cosp)
        
        # Pitch (y-axis rotation)
        sinp = 2 * (self.w * self.y - self.z * self.x)
        if abs(sinp) >= 1:
            pitch = math.copysign(math.pi / 2, sinp)
        else:
            pitch = math.asin(sinp)
        
        # Yaw (z-axis rotation)
        siny_cosp = 2 * (self.w * self.z + self.x * self.y)
        cosy_cosp = 1 - 2 * (self.y * self.y + self.z * self.z)
        yaw = math.atan2(siny_cosp, cosy_cosp)
        
        return roll, pitch, yaw

@dataclass
class Transform:
    position: Vector3D
    rotation: Quaternion
    scale: Vector3D = None
    
    def __post_init__(self):
        if self.scale is None:
            self.scale = Vector3D(1.0, 1.0, 1.0)

@dataclass
class PhysicsProperties:
    mass: float
    friction: float
    restitution: float  # Bounciness
    is_static: bool = False
    collision_enabled: bool = True

@dataclass
class SimulationObject:
    object_id: str
    name: str
    object_type: ObjectType
    transform: Transform
    physics: PhysicsProperties
    geometry: Dict[str, Any]  # Mesh, bounding box, etc.
    properties: Dict[str, Any]  # Object-specific properties
    parent_id: Optional[str] = None
    children: List[str] = None
    
    def __post_init__(self):
        if self.children is None:
            self.children = []

@dataclass
class SimulationScenario:
    scenario_id: str
    name: str
    description: str
    objects: List[SimulationObject]
    environment: Dict[str, Any]
    initial_conditions: Dict[str, Any]
    success_criteria: Dict[str, Any]
    duration: float  # seconds
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)

class PhysicsEngine:
    """Physics simulation engine for realistic object interactions"""
    
    def __init__(self, gravity: Vector3D = Vector3D(0, 0, -9.81)):
        self.gravity = gravity
        self.objects = {}
        self.velocities = {}
        self.angular_velocities = {}
        self.forces = {}
        self.torques = {}
        self.time_step = 1.0 / 60.0  # 60 FPS
        
    def add_object(self, obj: SimulationObject):
        """Add object to physics simulation"""
        self.objects[obj.object_id] = obj
        self.velocities[obj.object_id] = Vector3D(0, 0, 0)
        self.angular_velocities[obj.object_id] = Vector3D(0, 0, 0)
        self.forces[obj.object_id] = Vector3D(0, 0, 0)
        self.torques[obj.object_id] = Vector3D(0, 0, 0)
    
    def apply_force(self, object_id: str, force: Vector3D, position: Vector3D = None):
        """Apply force to object"""
        if object_id in self.forces:
            self.forces[object_id] = self.forces[object_id] + force
            
            # Apply torque if force is applied at offset position
            if position:
                obj = self.objects[object_id]
                offset = position - obj.transform.position
                torque = self.cross_product(offset, force)
                self.torques[object_id] = self.torques[object_id] + torque
    
    def cross_product(self, a: Vector3D, b: Vector3D) -> Vector3D:
        """Calculate cross product of two vectors"""
        return Vector3D(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        )
    
    def update(self, dt: float):
        """Update physics simulation by one time step"""
        for object_id, obj in self.objects.items():
            if obj.physics.is_static:
                continue
            
            # Apply gravity
            gravity_force = self.gravity * obj.physics.mass
            self.forces[object_id] = self.forces[object_id] + gravity_force
            
            # Update velocity (F = ma, so a = F/m)
            acceleration = self.forces[object_id] * (1.0 / obj.physics.mass)
            self.velocities[object_id] = self.velocities[object_id] + acceleration * dt
            
            # Apply friction
            friction_force = self.velocities[object_id] * (-obj.physics.friction)
            self.velocities[object_id] = self.velocities[object_id] + friction_force * dt
            
            # Update position
            obj.transform.position = obj.transform.position + self.velocities[object_id] * dt
            
            # Reset forces for next frame
            self.forces[object_id] = Vector3D(0, 0, 0)
            self.torques[object_id] = Vector3D(0, 0, 0)
    
    def check_collisions(self) -> List[Tuple[str, str]]:
        """Check for collisions between objects"""
        collisions = []
        object_ids = list(self.objects.keys())
        
        for i in range(len(object_ids)):
            for j in range(i + 1, len(object_ids)):
                obj1_id = object_ids[i]
                obj2_id = object_ids[j]
                obj1 = self.objects[obj1_id]
                obj2 = self.objects[obj2_id]
                
                if not obj1.physics.collision_enabled or not obj2.physics.collision_enabled:
                    continue
                
                # Simple sphere collision detection
                distance = (obj1.transform.position - obj2.transform.position).magnitude()
                radius1 = obj1.geometry.get('radius', 0.5)
                radius2 = obj2.geometry.get('radius', 0.5)
                
                if distance < (radius1 + radius2):
                    collisions.append((obj1_id, obj2_id))
                    self._resolve_collision(obj1_id, obj2_id)
        
        return collisions
    
    def _resolve_collision(self, obj1_id: str, obj2_id: str):
        """Resolve collision between two objects"""
        obj1 = self.objects[obj1_id]
        obj2 = self.objects[obj2_id]
        
        # Calculate collision normal
        collision_normal = (obj2.transform.position - obj1.transform.position).normalize()
        
        # Calculate relative velocity
        relative_velocity = self.velocities[obj2_id] - self.velocities[obj1_id]
        
        # Calculate collision impulse
        velocity_along_normal = self.dot_product(relative_velocity, collision_normal)
        
        if velocity_along_normal > 0:
            return  # Objects separating
        
        # Calculate restitution
        restitution = min(obj1.physics.restitution, obj2.physics.restitution)
        
        # Calculate impulse scalar
        impulse_scalar = -(1 + restitution) * velocity_along_normal
        impulse_scalar /= (1/obj1.physics.mass + 1/obj2.physics.mass)
        
        # Apply impulse
        impulse = collision_normal * impulse_scalar
        self.velocities[obj1_id] = self.velocities[obj1_id] - impulse * (1/obj1.physics.mass)
        self.velocities[obj2_id] = self.velocities[obj2_id] + impulse * (1/obj2.physics.mass)
    
    def dot_product(self, a: Vector3D, b: Vector3D) -> float:
        """Calculate dot product of two vectors"""
        return a.x * b.x + a.y * b.y + a.z * b.z

class RobotKinematics:
    """Robot kinematics and motion planning"""
    
    def __init__(self, robot_config: Dict[str, Any]):
        self.robot_config = robot_config
        self.joint_limits = robot_config.get('joint_limits', [])
        self.dh_parameters = robot_config.get('dh_parameters', [])
        self.current_joint_angles = [0.0] * len(self.joint_limits)
        
    def forward_kinematics(self, joint_angles: List[float]) -> Transform:
        """Calculate end-effector pose from joint angles"""
        # Simplified forward kinematics using DH parameters
        transform_matrix = np.eye(4)
        
        for i, (angle, dh_params) in enumerate(zip(joint_angles, self.dh_parameters)):
            a = dh_params.get('a', 0)
            alpha = dh_params.get('alpha', 0)
            d = dh_params.get('d', 0)
            theta = angle + dh_params.get('theta_offset', 0)
            
            # DH transformation matrix
            ct = math.cos(theta)
            st = math.sin(theta)
            ca = math.cos(alpha)
            sa = math.sin(alpha)
            
            dh_matrix = np.array([
                [ct, -st*ca, st*sa, a*ct],
                [st, ct*ca, -ct*sa, a*st],
                [0, sa, ca, d],
                [0, 0, 0, 1]
            ])
            
            transform_matrix = np.dot(transform_matrix, dh_matrix)
        
        # Extract position and rotation
        position = Vector3D(
            transform_matrix[0, 3],
            transform_matrix[1, 3],
            transform_matrix[2, 3]
        )
        
        # Convert rotation matrix to quaternion (simplified)
        rotation = Quaternion(1, 0, 0, 0)  # Identity quaternion
        
        return Transform(position, rotation)
    
    def inverse_kinematics(self, target_pose: Transform) -> Optional[List[float]]:
        """Calculate joint angles for target end-effector pose"""
        # Simplified inverse kinematics using numerical methods
        # In a real implementation, this would use analytical or numerical IK solvers
        
        best_solution = None
        min_error = float('inf')
        
        # Try different joint angle combinations
        for _ in range(1000):  # Random search (simplified)
            joint_angles = []
            for joint_limit in self.joint_limits:
                min_angle = joint_limit.get('min', -math.pi)
                max_angle = joint_limit.get('max', math.pi)
                angle = np.random.uniform(min_angle, max_angle)
                joint_angles.append(angle)
            
            # Calculate forward kinematics
            current_pose = self.forward_kinematics(joint_angles)
            
            # Calculate error
            position_error = (current_pose.position - target_pose.position).magnitude()
            
            if position_error < min_error:
                min_error = position_error
                best_solution = joint_angles
                
                if position_error < 0.01:  # Good enough solution
                    break
        
        return best_solution if min_error < 0.1 else None
    
    def plan_trajectory(self, start_pose: Transform, end_pose: Transform, 
                       duration: float, num_points: int = 50) -> List[Transform]:
        """Plan smooth trajectory between two poses"""
        trajectory = []
        
        for i in range(num_points):
            t = i / (num_points - 1)  # Interpolation parameter (0 to 1)
            
            # Linear interpolation for position
            position = Vector3D(
                start_pose.position.x + t * (end_pose.position.x - start_pose.position.x),
                start_pose.position.y + t * (end_pose.position.y - start_pose.position.y),
                start_pose.position.z + t * (end_pose.position.z - start_pose.position.z)
            )
            
            # SLERP for rotation (simplified)
            rotation = start_pose.rotation  # Simplified - should use SLERP
            
            trajectory.append(Transform(position, rotation))
        
        return trajectory

class DigitalTwinEngine:
    """Main digital twin simulation engine"""
    
    def __init__(self):
        self.physics_engine = PhysicsEngine()
        self.robot_kinematics = {}
        self.simulation_objects = {}
        self.scenarios = {}
        self.current_scenario = None
        self.simulation_state = SimulationState.STOPPED
        self.simulation_time = 0.0
        self.real_time_factor = 1.0  # 1.0 = real-time, 2.0 = 2x speed
        self.simulation_thread = None
        self.running = False
        
    async def create_scenario(self, scenario: SimulationScenario) -> str:
        """Create new simulation scenario"""
        self.scenarios[scenario.scenario_id] = scenario
        logger.info(f"Created simulation scenario: {scenario.name}")
        return scenario.scenario_id
    
    async def load_scenario(self, scenario_id: str) -> bool:
        """Load simulation scenario"""
        if scenario_id not in self.scenarios:
            logger.error(f"Scenario not found: {scenario_id}")
            return False
        
        scenario = self.scenarios[scenario_id]
        self.current_scenario = scenario
        
        # Clear existing objects
        self.simulation_objects.clear()
        self.physics_engine.objects.clear()
        
        # Load scenario objects
        for obj in scenario.objects:
            self.simulation_objects[obj.object_id] = obj
            self.physics_engine.add_object(obj)
            
            # Initialize robot kinematics if object is a robot
            if obj.object_type == ObjectType.ROBOT:
                robot_config = obj.properties.get('kinematics', {})
                self.robot_kinematics[obj.object_id] = RobotKinematics(robot_config)
        
        logger.info(f"Loaded scenario: {scenario.name}")
        return True
    
    async def start_simulation(self, real_time_factor: float = 1.0):
        """Start simulation"""
        if self.current_scenario is None:
            logger.error("No scenario loaded")
            return False
        
        self.real_time_factor = real_time_factor
        self.simulation_state = SimulationState.RUNNING
        self.simulation_time = 0.0
        self.running = True
        
        # Start simulation thread
        self.simulation_thread = threading.Thread(target=self._simulation_loop)
        self.simulation_thread.start()
        
        logger.info("Simulation started")
        return True
    
    async def stop_simulation(self):
        """Stop simulation"""
        self.running = False
        self.simulation_state = SimulationState.STOPPED
        
        if self.simulation_thread:
            self.simulation_thread.join()
        
        logger.info("Simulation stopped")
    
    async def pause_simulation(self):
        """Pause simulation"""
        self.simulation_state = SimulationState.PAUSED
        logger.info("Simulation paused")
    
    async def resume_simulation(self):
        """Resume simulation"""
        if self.simulation_state == SimulationState.PAUSED:
            self.simulation_state = SimulationState.RUNNING
            logger.info("Simulation resumed")
    
    def _simulation_loop(self):
        """Main simulation loop"""
        last_time = time.time()
        
        while self.running:
            current_time = time.time()
            real_dt = current_time - last_time
            last_time = current_time
            
            if self.simulation_state == SimulationState.RUNNING:
                # Calculate simulation time step
                sim_dt = real_dt * self.real_time_factor
                
                # Update physics
                self.physics_engine.update(sim_dt)
                
                # Check collisions
                collisions = self.physics_engine.check_collisions()
                if collisions:
                    logger.warning(f"Collisions detected: {collisions}")
                
                # Update simulation time
                self.simulation_time += sim_dt
                
                # Check scenario completion
                if self.current_scenario and self.simulation_time >= self.current_scenario.duration:
                    self._check_success_criteria()
                    self.running = False
            
            # Sleep to maintain frame rate
            time.sleep(1.0 / 60.0)  # 60 FPS
    
    def _check_success_criteria(self):
        """Check if simulation scenario succeeded"""
        if not self.current_scenario:
            return
        
        success_criteria = self.current_scenario.success_criteria
        success = True
        
        # Check position criteria
        for criteria in success_criteria.get('positions', []):
            object_id = criteria['object_id']
            target_position = Vector3D(**criteria['target_position'])
            tolerance = criteria.get('tolerance', 0.1)
            
            if object_id in self.simulation_objects:
                obj = self.simulation_objects[object_id]
                distance = (obj.transform.position - target_position).magnitude()
                if distance > tolerance:
                    success = False
                    break
        
        # Check collision criteria
        if success_criteria.get('no_collisions', False):
            collisions = self.physics_engine.check_collisions()
            if collisions:
                success = False
        
        result = "SUCCESS" if success else "FAILURE"
        logger.info(f"Scenario completed: {result}")
    
    async def get_simulation_state(self) -> Dict[str, Any]:
        """Get current simulation state"""
        object_states = {}
        for obj_id, obj in self.simulation_objects.items():
            object_states[obj_id] = {
                'position': asdict(obj.transform.position),
                'rotation': asdict(obj.transform.rotation),
                'velocity': asdict(self.physics_engine.velocities.get(obj_id, Vector3D(0, 0, 0)))
            }
        
        return {
            'simulation_time': self.simulation_time,
            'state': self.simulation_state.value,
            'real_time_factor': self.real_time_factor,
            'scenario_id': self.current_scenario.scenario_id if self.current_scenario else None,
            'objects': object_states
        }
    
    async def move_robot(self, robot_id: str, target_pose: Transform, duration: float):
        """Move robot to target pose"""
        if robot_id not in self.robot_kinematics:
            logger.error(f"Robot not found: {robot_id}")
            return False
        
        robot_ik = self.robot_kinematics[robot_id]
        robot_obj = self.simulation_objects[robot_id]
        
        # Calculate trajectory
        trajectory = robot_ik.plan_trajectory(
            robot_obj.transform, 
            target_pose, 
            duration
        )
        
        # Execute trajectory (simplified - would be more complex in real implementation)
        for pose in trajectory:
            robot_obj.transform = pose
            await asyncio.sleep(duration / len(trajectory))
        
        logger.info(f"Robot {robot_id} moved to target pose")
        return True

# Global digital twin engine instance
digital_twin_engine = DigitalTwinEngine()
