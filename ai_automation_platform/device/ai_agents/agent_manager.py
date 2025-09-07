"""Agent manager for managing the lifecycle of all agents in the system."""

import asyncio
import logging
from typing import Dict, Any, Optional, List, Type, TypeVar, Generic, cast

from .base_agent import BaseAgent
from .sensor_agent import SensorAgent
from ..sensors import BaseSensor, SensorManager

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseAgent)

class AgentManager:
    """Manages the lifecycle of all agents in the system."""
    
    def __init__(self, comm_manager: Any, config: Optional[Dict[str, Any]] = None):
        """Initialize the agent manager.
        
        Args:
            comm_manager: Communication manager instance
            config: Configuration dictionary
        """
        self.comm_manager = comm_manager
        self.config = config or {}
        self.agents: Dict[str, BaseAgent] = {}
        self._running = False
        self._sensor_manager: Optional[SensorManager] = None
        
    async def start(self) -> None:
        """Start all agents."""
        if self._running:
            return
            
        logger.info("Starting agent manager...")
        self._running = True
        
        try:
            # Initialize sensor manager
            self._sensor_manager = SensorManager()
            await self._sensor_manager.initialize()
            
            # Get all sensors
            sensors = await self._get_all_sensors()
            
            # Create and start sensor agent
            sensor_agent = SensorAgent(
                agent_id="sensor_agent_1",
                comm_manager=self.comm_manager,
                sensors=sensors,
                config=self.config.get("sensor_agent", {})
            )
            
            self.agents[sensor_agent.agent_id] = sensor_agent
            await sensor_agent.start()
            
            logger.info(f"Started {len(self.agents)} agents")
            
        except Exception as e:
            logger.error(f"Failed to start agent manager: {str(e)}", exc_info=True)
            await self.stop()
            raise
        
    async def stop(self) -> None:
        """Stop all agents and clean up resources."""
        if not self._running:
            return
            
        logger.info("Stopping agent manager...")
        
        # Stop all agents
        for agent in list(self.agents.values()):
            try:
                await agent.stop()
            except Exception as e:
                logger.error(f"Error stopping agent {agent.agent_id}: {str(e)}", exc_info=True)
        
        self.agents.clear()
        
        # Clean up sensor manager
        if self._sensor_manager:
            try:
                await self._sensor_manager.shutdown()
            except Exception as e:
                logger.error(f"Error shutting down sensor manager: {str(e)}", exc_info=True)
            self._sensor_manager = None
            
        self._running = False
        logger.info("Agent manager stopped")
        
    async def _get_all_sensors(self) -> Dict[str, BaseSensor]:
        """Get all available sensors from the sensor manager."""
        if not self._sensor_manager:
            return {}
            
        # This assumes the sensor manager has a get_sensors() method
        # that returns a dictionary of sensor_id -> sensor instance
        return getattr(self._sensor_manager, 'get_sensors', lambda: {})()
    
    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """Get an agent by ID.
        
        Args:
            agent_id: ID of the agent to retrieve
            
        Returns:
            The agent instance, or None if not found
        """
        return self.agents.get(agent_id)
    
    def get_agents_by_type(self, agent_type: str) -> List[BaseAgent]:
        """Get all agents of a specific type.
        
        Args:
            agent_type: Type of agents to retrieve
            
        Returns:
            List of agent instances
        """
        return [
            agent for agent in self.agents.values() 
            if agent.agent_type == agent_type
        ]
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents and their status.
        
        Returns:
            List of dictionaries containing agent information
        """
        return [
            {
                "agent_id": agent.agent_id,
                "type": agent.agent_type,
                "running": getattr(agent, 'is_running', False)
            }
            for agent in self.agents.values()
        ]
    
    async def __aenter__(self):
        """Support async context manager protocol."""
        await self.start()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Clean up on exit."""
        await self.stop()
