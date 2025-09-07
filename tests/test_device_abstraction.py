#!/usr/bin/env python3
"""
Test Suite for Device Abstraction Layer
Tests unified robot interfaces, PAL Robotics integration, and device communication
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'enhanced-robot-control-service'))

from device_abstraction import (
    DeviceAbstractionLayer, PALRoboticsInterface, UniversalRobotsInterface,
    GenericRobotInterface, RobotCommand, RobotStatus, ExecutionResult,
    RobotManufacturer, RobotCapability, CommandType
)

class TestDeviceAbstraction:
    """Test suite for Device Abstraction Layer functionality"""
    
    @pytest.fixture
    async def device_layer(self):
        """Create DeviceAbstractionLayer instance for testing"""
        layer = DeviceAbstractionLayer()
        return layer
    
    @pytest.fixture
    async def pal_interface(self):
        """Create PAL Robotics interface for testing"""
        interface = PALRoboticsInterface("pal_robot_001", "tiago")
        return interface
    
    @pytest.fixture
    async def ur_interface(self):
        """Create Universal Robots interface for testing"""
        interface = UniversalRobotsInterface("ur_robot_001", "UR5")
        return interface
    
    @pytest.fixture
    def sample_command(self):
        """Create sample robot command for testing"""
        return RobotCommand(
            command_id="cmd_001",
            command_type=CommandType.MOVE,
            parameters={"target": {"x": 1.0, "y": 2.0, "z": 0.0}},
            priority=5,
            timeout=30.0,
            safety_level="medium"
        )
    
    @pytest.fixture
    def navigation_command(self):
        """Create navigation command for testing"""
        return RobotCommand(
            command_id="nav_001",
            command_type=CommandType.MOVE,
            parameters={
                "target": {"x": 5.0, "y": 3.0},
                "max_speed": 0.5,
                "avoid_obstacles": True
            },
            safety_level="high"
        )
    
    @pytest.fixture
    def manipulation_command(self):
        """Create manipulation command for testing"""
        return RobotCommand(
            command_id="manip_001",
            command_type=CommandType.PICK,
            parameters={
                "object_id": "cup_001",
                "approach_vector": [0, 0, -1],
                "grasp_force": 15.0
            },
            safety_level="high"
        )

    @pytest.mark.asyncio
    async def test_device_layer_initialization(self, device_layer):
        """Test DeviceAbstractionLayer initialization"""
        assert device_layer is not None
        assert device_layer.robot_interfaces == {}
        assert device_layer.robot_registry == {}
        assert device_layer.command_history == {}
        assert device_layer.performance_metrics == {}

    @pytest.mark.asyncio
    async def test_pal_robotics_registration(self, device_layer):
        """Test PAL Robotics robot registration"""
        robot_id = "tiago_001"
        manufacturer = RobotManufacturer.PAL_ROBOTICS
        robot_model = "tiago"
        capabilities = [
            RobotCapability.NAVIGATION,
            RobotCapability.MANIPULATION,
            RobotCapability.VISION,
            RobotCapability.SPEECH
        ]
        connection_params = {"ros_master_uri": "http://localhost:11311"}
        
        success = await device_layer.register_robot(
            robot_id, manufacturer, robot_model, capabilities, connection_params
        )
        
        assert success == True
        assert robot_id in device_layer.robot_interfaces
        assert isinstance(device_layer.robot_interfaces[robot_id], PALRoboticsInterface)
        assert robot_id in device_layer.robot_registry
        assert robot_id in device_layer.command_history
        assert robot_id in device_layer.performance_metrics

    @pytest.mark.asyncio
    async def test_universal_robots_registration(self, device_layer):
        """Test Universal Robots registration"""
        robot_id = "ur5_001"
        manufacturer = RobotManufacturer.UNIVERSAL_ROBOTS
        robot_model = "UR5"
        capabilities = [
            RobotCapability.MANIPULATION,
            RobotCapability.PRECISION_WORK
        ]
        connection_params = {"ip_address": "192.168.1.100", "port": 30003}
        
        success = await device_layer.register_robot(
            robot_id, manufacturer, robot_model, capabilities, connection_params
        )
        
        assert success == True
        assert isinstance(device_layer.robot_interfaces[robot_id], UniversalRobotsInterface)

    @pytest.mark.asyncio
    async def test_generic_robot_registration(self, device_layer):
        """Test generic robot registration"""
        robot_id = "generic_001"
        manufacturer = RobotManufacturer.GENERIC
        robot_model = "CustomBot"
        capabilities = [RobotCapability.NAVIGATION, RobotCapability.CLEANING]
        connection_params = {"protocol": "custom", "endpoint": "tcp://robot:8080"}
        
        success = await device_layer.register_robot(
            robot_id, manufacturer, robot_model, capabilities, connection_params
        )
        
        assert success == True
        assert isinstance(device_layer.robot_interfaces[robot_id], GenericRobotInterface)

    @pytest.mark.asyncio
    async def test_pal_robotics_connection(self, pal_interface):
        """Test PAL Robotics robot connection"""
        connected = await pal_interface.connect()
        
        assert connected == True
        assert pal_interface.is_connected == True

    @pytest.mark.asyncio
    async def test_pal_robotics_status(self, pal_interface):
        """Test PAL Robotics status retrieval"""
        await pal_interface.connect()
        status = await pal_interface.get_status()
        
        assert isinstance(status, RobotStatus)
        assert status.robot_id == pal_interface.robot_id
        assert status.is_connected == True
        assert status.is_operational == True
        assert "x" in status.current_position
        assert "y" in status.current_position

    @pytest.mark.asyncio
    async def test_pal_robotics_navigation(self, pal_interface, navigation_command):
        """Test PAL Robotics navigation command"""
        await pal_interface.connect()
        result = await pal_interface.execute_command(navigation_command)
        
        assert isinstance(result, ExecutionResult)
        assert result.success == True
        assert "final_position" in result.result_data
        assert result.execution_time > 0

    @pytest.mark.asyncio
    async def test_pal_robotics_manipulation(self, pal_interface, manipulation_command):
        """Test PAL Robotics manipulation command"""
        await pal_interface.connect()
        result = await pal_interface.execute_command(manipulation_command)
        
        assert isinstance(result, ExecutionResult)
        assert result.success == True
        assert "object_picked" in result.result_data or "grasp_force" in result.result_data

    @pytest.mark.asyncio
    async def test_pal_robotics_speech(self, pal_interface):
        """Test PAL Robotics speech command"""
        await pal_interface.connect()
        
        speech_command = RobotCommand(
            command_id="speech_001",
            command_type=CommandType.SPEAK,
            parameters={"text": "Hello, I am TIAGo robot"}
        )
        
        result = await pal_interface.execute_command(speech_command)
        
        assert result.success == True
        assert "text_spoken" in result.result_data
        assert result.result_data["text_spoken"] == "Hello, I am TIAGo robot"

    @pytest.mark.asyncio
    async def test_universal_robots_connection(self, ur_interface):
        """Test Universal Robots connection"""
        connected = await ur_interface.connect()
        
        assert connected == True
        assert ur_interface.is_connected == True

    @pytest.mark.asyncio
    async def test_universal_robots_status(self, ur_interface):
        """Test Universal Robots status retrieval"""
        await ur_interface.connect()
        status = await ur_interface.get_status()
        
        assert isinstance(status, RobotStatus)
        assert status.robot_id == ur_interface.robot_id
        assert status.is_connected == True
        assert "joint1" in status.current_position
        assert status.battery_level is None  # UR arms are mains powered

    @pytest.mark.asyncio
    async def test_universal_robots_manipulation(self, ur_interface):
        """Test Universal Robots manipulation"""
        await ur_interface.connect()
        
        pose_command = RobotCommand(
            command_id="pose_001",
            command_type=CommandType.MOVE,
            parameters={"pose": [0.5, -0.5, 0.3, 0, 1.57, 0]}
        )
        
        result = await ur_interface.execute_command(pose_command)
        
        assert result.success == True
        assert "final_pose" in result.result_data

    @pytest.mark.asyncio
    async def test_unified_command_execution(self, device_layer, sample_command):
        """Test unified command execution through abstraction layer"""
        # Register a robot first
        robot_id = "test_robot_001"
        await device_layer.register_robot(
            robot_id,
            RobotManufacturer.PAL_ROBOTICS,
            "tiago",
            [RobotCapability.NAVIGATION],
            {}
        )
        
        # Execute command through unified interface
        result = await device_layer.execute_unified_command(robot_id, sample_command)
        
        assert isinstance(result, ExecutionResult)
        assert result.success == True
        assert robot_id in device_layer.command_history
        assert len(device_layer.command_history[robot_id]) > 0

    @pytest.mark.asyncio
    async def test_robot_capability_filtering(self, device_layer):
        """Test filtering robots by capability"""
        # Register robots with different capabilities
        await device_layer.register_robot(
            "nav_robot",
            RobotManufacturer.PAL_ROBOTICS,
            "tiago",
            [RobotCapability.NAVIGATION, RobotCapability.VISION],
            {}
        )
        
        await device_layer.register_robot(
            "manip_robot",
            RobotManufacturer.UNIVERSAL_ROBOTS,
            "UR5",
            [RobotCapability.MANIPULATION, RobotCapability.PRECISION_WORK],
            {}
        )
        
        # Filter by navigation capability
        nav_robots = device_layer.get_robots_by_capability(RobotCapability.NAVIGATION)
        assert "nav_robot" in nav_robots
        assert "manip_robot" not in nav_robots
        
        # Filter by manipulation capability
        manip_robots = device_layer.get_robots_by_capability(RobotCapability.MANIPULATION)
        assert "manip_robot" in manip_robots
        assert "nav_robot" not in manip_robots

    @pytest.mark.asyncio
    async def test_manufacturer_filtering(self, device_layer):
        """Test filtering robots by manufacturer"""
        # Register robots from different manufacturers
        await device_layer.register_robot(
            "pal_robot",
            RobotManufacturer.PAL_ROBOTICS,
            "tiago",
            [RobotCapability.NAVIGATION],
            {}
        )
        
        await device_layer.register_robot(
            "ur_robot",
            RobotManufacturer.UNIVERSAL_ROBOTS,
            "UR5",
            [RobotCapability.MANIPULATION],
            {}
        )
        
        # Filter by PAL Robotics
        pal_robots = device_layer.get_robots_by_manufacturer(RobotManufacturer.PAL_ROBOTICS)
        assert "pal_robot" in pal_robots
        assert "ur_robot" not in pal_robots
        
        # Filter by Universal Robots
        ur_robots = device_layer.get_robots_by_manufacturer(RobotManufacturer.UNIVERSAL_ROBOTS)
        assert "ur_robot" in ur_robots
        assert "pal_robot" not in ur_robots

    @pytest.mark.asyncio
    async def test_performance_metrics_tracking(self, device_layer, sample_command):
        """Test performance metrics tracking"""
        robot_id = "metrics_robot"
        await device_layer.register_robot(
            robot_id,
            RobotManufacturer.PAL_ROBOTICS,
            "tiago",
            [RobotCapability.NAVIGATION],
            {}
        )
        
        initial_metrics = device_layer.performance_metrics[robot_id].copy()
        
        # Execute multiple commands
        for i in range(3):
            command = RobotCommand(
                command_id=f"cmd_{i}",
                command_type=CommandType.MOVE,
                parameters={"target": {"x": i, "y": i}}
            )
            await device_layer.execute_unified_command(robot_id, command)
        
        final_metrics = device_layer.performance_metrics[robot_id]
        
        # Metrics should be updated
        assert final_metrics["total_commands"] == initial_metrics["total_commands"] + 3
        assert final_metrics["successful_commands"] >= initial_metrics["successful_commands"]
        assert final_metrics["average_execution_time"] > 0

    @pytest.mark.asyncio
    async def test_emergency_stop_individual(self, device_layer):
        """Test emergency stop for individual robot"""
        robot_id = "emergency_robot"
        await device_layer.register_robot(
            robot_id,
            RobotManufacturer.PAL_ROBOTICS,
            "tiago",
            [RobotCapability.NAVIGATION],
            {}
        )
        
        success = await device_layer.emergency_stop_robot(robot_id)
        assert success == True

    @pytest.mark.asyncio
    async def test_emergency_stop_all(self, device_layer):
        """Test emergency stop for all robots"""
        # Register multiple robots
        robot_ids = ["robot_1", "robot_2", "robot_3"]
        for robot_id in robot_ids:
            await device_layer.register_robot(
                robot_id,
                RobotManufacturer.PAL_ROBOTICS,
                "tiago",
                [RobotCapability.NAVIGATION],
                {}
            )
        
        results = await device_layer.emergency_stop_all()
        
        assert isinstance(results, dict)
        assert len(results) == len(robot_ids)
        assert all(success for success in results.values())

    @pytest.mark.asyncio
    async def test_command_timeout_handling(self, pal_interface):
        """Test command timeout handling"""
        await pal_interface.connect()
        
        # Create command with short timeout
        timeout_command = RobotCommand(
            command_id="timeout_001",
            command_type=CommandType.MOVE,
            parameters={"target": {"x": 100, "y": 100}},  # Far target
            timeout=0.1  # Very short timeout
        )
        
        # Command should complete (simulated) even with short timeout
        result = await pal_interface.execute_command(timeout_command)
        assert isinstance(result, ExecutionResult)

    @pytest.mark.asyncio
    async def test_robot_disconnection_handling(self, pal_interface):
        """Test robot disconnection handling"""
        await pal_interface.connect()
        assert pal_interface.is_connected == True
        
        await pal_interface.disconnect()
        assert pal_interface.is_connected == False
        
        # Commands should fail when disconnected
        result = await pal_interface.execute_command(RobotCommand(
            "disconnected_cmd", CommandType.MOVE, {}
        ))
        assert result.success == False
        assert "not connected" in result.error_message.lower()

    @pytest.mark.asyncio
    async def test_concurrent_command_execution(self, device_layer):
        """Test concurrent command execution"""
        # Register multiple robots
        robot_ids = []
        for i in range(3):
            robot_id = f"concurrent_robot_{i}"
            robot_ids.append(robot_id)
            await device_layer.register_robot(
                robot_id,
                RobotManufacturer.PAL_ROBOTICS,
                "tiago",
                [RobotCapability.NAVIGATION],
                {}
            )
        
        # Execute commands concurrently
        commands = []
        for i, robot_id in enumerate(robot_ids):
            command = RobotCommand(
                f"concurrent_cmd_{i}",
                CommandType.MOVE,
                {"target": {"x": i, "y": i}}
            )
            commands.append(device_layer.execute_unified_command(robot_id, command))
        
        start_time = time.time()
        results = await asyncio.gather(*commands)
        execution_time = time.time() - start_time
        
        # All commands should succeed
        assert len(results) == len(robot_ids)
        assert all(result.success for result in results)
        
        # Concurrent execution should be efficient
        assert execution_time < 5.0, f"Concurrent execution took {execution_time:.2f}s"

    @pytest.mark.asyncio
    async def test_status_callback_system(self, pal_interface):
        """Test status callback system"""
        callback_called = False
        callback_status = None
        
        def status_callback(status):
            nonlocal callback_called, callback_status
            callback_called = True
            callback_status = status
        
        pal_interface.add_status_callback(status_callback)
        await pal_interface.connect()
        
        # Trigger status update
        status = await pal_interface.get_status()
        await pal_interface._notify_status_change(status)
        
        # Give callback time to execute
        await asyncio.sleep(0.1)
        
        assert callback_called == True
        assert callback_status is not None

    @pytest.mark.asyncio
    async def test_command_history_tracking(self, device_layer, sample_command):
        """Test command history tracking"""
        robot_id = "history_robot"
        await device_layer.register_robot(
            robot_id,
            RobotManufacturer.PAL_ROBOTICS,
            "tiago",
            [RobotCapability.NAVIGATION],
            {}
        )
        
        initial_history_length = len(device_layer.command_history[robot_id])
        
        # Execute command
        await device_layer.execute_unified_command(robot_id, sample_command)
        
        final_history_length = len(device_layer.command_history[robot_id])
        
        # History should be updated
        assert final_history_length == initial_history_length + 1
        assert device_layer.command_history[robot_id][-1] == sample_command

    @pytest.mark.asyncio
    async def test_error_handling_and_recovery(self, device_layer):
        """Test error handling and recovery"""
        # Try to execute command on non-existent robot
        result = await device_layer.execute_unified_command(
            "non_existent_robot",
            RobotCommand("error_cmd", CommandType.MOVE, {})
        )
        
        assert result.success == False
        assert "not registered" in result.error_message.lower()

    @pytest.mark.asyncio
    async def test_robot_status_monitoring(self, device_layer):
        """Test robot status monitoring"""
        robot_id = "status_robot"
        await device_layer.register_robot(
            robot_id,
            RobotManufacturer.PAL_ROBOTICS,
            "tiago",
            [RobotCapability.NAVIGATION],
            {}
        )
        
        status = await device_layer.get_robot_status(robot_id)
        
        assert status is not None
        assert isinstance(status, RobotStatus)
        assert status.robot_id == robot_id

    @pytest.mark.asyncio
    async def test_interface_specific_features(self, pal_interface, ur_interface):
        """Test interface-specific features"""
        # Test PAL Robotics specific features
        await pal_interface.connect()
        assert pal_interface.robot_model == "tiago"
        assert RobotCapability.SOCIAL_INTERACTION in pal_interface.capabilities
        
        # Test Universal Robots specific features
        await ur_interface.connect()
        assert ur_interface.robot_model == "UR5"
        assert RobotCapability.PRECISION_WORK in ur_interface.capabilities

if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
