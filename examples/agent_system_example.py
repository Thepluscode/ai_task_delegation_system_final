"""
Example demonstrating how to use the agent system with sensors.
"""

import asyncio
import logging
import signal
import sys
from typing import Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import the agent system components
from ai_automation_platform.device.ai_agents import AgentManager
from ai_automation_platform.device.sensors import DHT22Sensor, DHT22Config
from ai_automation_platform.communication import CommunicationManager

# Configuration
CONFIG = {
    "sensor_agent": {
        "poll_interval": 5.0,  # seconds between sensor readings
    },
    "sensors": {
        "living_room": {
            "type": "dht22",
            "gpio_pin": 4,
            "name": "Living Room",
            "poll_interval": 30.0
        },
        "bedroom": {
            "type": "dht22",
            "gpio_pin": 17,
            "name": "Bedroom",
            "poll_interval": 60.0
        }
    }
}

class SensorAgentExample:
    """Example class demonstrating the agent system with sensors."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the example."""
        self.config = config
        self.comm_manager = CommunicationManager()
        self.agent_manager = AgentManager(
            comm_manager=self.comm_manager,
            config=config
        )
        self.running = False
        
        # Set up signal handlers
        self._setup_signal_handlers()
    
    def _setup_signal_handlers(self) -> None:
        """Set up signal handlers for graceful shutdown."""
        loop = asyncio.get_event_loop()
        
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(
                sig, 
                lambda s=sig: asyncio.create_task(self.shutdown(s == signal.SIGTERM))
            )
    
    async def start(self) -> None:
        """Start the example."""
        logger.info("Starting sensor agent example...")
        
        try:
            # Start the communication manager
            await self.comm_manager.initialize()
            
            # Start the agent manager
            await self.agent_manager.start()
            
            # Run the main loop
            self.running = True
            await self._main_loop()
            
        except Exception as e:
            logger.error(f"Error in sensor agent example: {str(e)}", exc_info=True)
            await self.shutdown(True)
    
    async def _main_loop(self) -> None:
        """Main application loop."""
        logger.info("Sensor agent example is running. Press Ctrl+C to stop.")
        
        # Example: Periodically list all agents
        while self.running:
            agents = self.agent_manager.list_agents()
            logger.info(f"Active agents: {len(agents)}")
            
            # Example: Get sensor data every 30 seconds
            sensor_agents = self.agent_manager.get_agents_by_type("sensor_agent")
            for agent in sensor_agents:
                # In a real application, you would send task requests to the agent
                # Here we just log the agent status
                logger.info(f"Sensor agent {agent.agent_id} is running: {getattr(agent, 'is_running', False)}")
            
            # Wait for next iteration or until shutdown
            try:
                await asyncio.sleep(30)
            except asyncio.CancelledError:
                logger.info("Main loop was cancelled")
                break
    
    async def shutdown(self, immediate: bool = False) -> None:
        """Shut down the example."""
        if not self.running:
            return
            
        logger.info("Shutting down sensor agent example...")
        self.running = False
        
        # Stop the agent manager
        if hasattr(self, 'agent_manager'):
            await self.agent_manager.stop()
        
        # Stop the communication manager
        if hasattr(self, 'comm_manager'):
            await self.comm_manager.shutdown()
        
        logger.info("Shutdown complete")

async def main() -> None:
    """Main entry point."""
    example = SensorAgentExample(CONFIG)
    
    try:
        await example.start()
    except asyncio.CancelledError:
        await example.shutdown()
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        await example.shutdown()
        raise

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Example stopped by user")
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        sys.exit(1)
