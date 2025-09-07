"""
Example script demonstrating how to use the DeviceManager with a UR robot.
"""
import asyncio
import logging
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ai_automation_platform.device import DeviceManager, DeviceInfo, DeviceType, DeviceCapability
from ai_automation_platform.device.robots import URRobot

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """Main function to demonstrate device management."""
    # Create a device manager
    device_manager = DeviceManager(auto_reconnect=True)
    
    # Register the UR robot device type
    device_manager.register_device_type(DeviceType.ROBOT, URRobot)
    
    # Create device info for a UR robot
    robot_info = DeviceInfo(
        device_id="ur_robot_001",
        name="UR5e Robot Arm",
        type=DeviceType.ROBOT,
        manufacturer="Universal Robots",
        model="UR5e",
        firmware_version="5.10.0",
        capabilities=[
            DeviceCapability.READ,
            DeviceCapability.WRITE,
            DeviceCapability.EXECUTE,
            "ur_dashboard",
            "rtde_control"
        ],
        metadata={
            "ip_address": "192.168.1.100",
            "dashboard_port": 29999,
            "rtde_port": 30004,
            "socket_port": 30003
        }
    )
    
    # Add an event handler for device events
    async def handle_device_event(event):
        event_type = event["type"]
        data = event["data"]
        logger.info(f"Device event: {event_type} - {data}")
    
    device_manager.add_event_handler("device_connected", handle_device_event)
    device_manager.add_event_handler("device_disconnected", handle_device_event)
    device_manager.add_event_handler("command_executed", handle_device_event)
    device_manager.add_event_handler("command_failed", handle_device_event)
    
    try:
        # Start the device manager
        await device_manager.start()
        
        # Add the robot to the device manager
        robot = await device_manager.add_device(robot_info)
        
        # Connect to the robot
        connected = await device_manager.connect_device(robot.device_id)
        if not connected:
            logger.error("Failed to connect to robot")
            return
        
        # Get the current joint positions
        joint_positions = await device_manager.execute_command(
            robot.device_id, "get_joint_positions"
        )
        logger.info(f"Current joint positions: {joint_positions}")
        
        # Move the robot to a new position
        target_positions = [0.0, -1.57, 0.0, -1.57, 0.0, 0.0]  # Home position
        logger.info(f"Moving to position: {target_positions}")
        
        success = await device_manager.execute_command(
            robot.device_id, "move_joints", {"positions": target_positions, "speed": 0.5}
        )
        
        if success:
            logger.info("Move completed successfully")
        else:
            logger.error("Move failed")
        
        # Start a program
        logger.info("Starting program")
        await device_manager.execute_command(robot.device_id, "start_program")
        
        # Let the program run for a bit
        await asyncio.sleep(5)
        
        # Stop the program
        logger.info("Stopping program")
        await device_manager.execute_command(robot.device_id, "stop_program")
        
        # Get telemetry data
        telemetry = await device_manager.execute_command(
            robot.device_id, "get_telemetry"
        )
        logger.info(f"Telemetry data: {telemetry}")
        
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
    finally:
        # Clean up
        logger.info("Shutting down...")
        await device_manager.stop()

if __name__ == "__main__":
    asyncio.run(main())
