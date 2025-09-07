"""Agent registry for discovering and managing agent instances."""
import asyncio
import logging
from typing import Dict, Type, Any, Optional, List, TypeVar, Generic
from pydantic import BaseModel

from communication import CommunicationManager
from .types import AgentConfig, AgentStatus
from .base import BaseAgent

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseAgent)

class AgentRegistry:
    """Registry for managing agent instances and their metadata."""
    
    def __init__(self, comm_manager: CommunicationManager):
        """Initialize the agent registry.
        
        Args:
            comm_manager: Communication manager instance
        """
        self.comm_manager = comm_manager
        self._agents: Dict[str, BaseAgent] = {}
        self._agent_configs: Dict[str, AgentConfig] = {}
        self._agent_status: Dict[str, AgentStatus] = {}
        self._agent_classes: Dict[str, Type[BaseAgent]] = {}
        self._lock = asyncio.Lock()
    
    def register_agent_class(
        self,
        agent_type: str,
        agent_class: Type[T]
    ) -> None:
        """Register an agent class with the registry.
        
        Args:
            agent_type: Type identifier for the agent
            agent_class: The agent class to register
        """
        if not issubclass(agent_class, BaseAgent):
            raise ValueError(f"Agent class must be a subclass of BaseAgent")
            
        self._agent_classes[agent_type] = agent_class
        logger.info(f"Registered agent class: {agent_type} -> {agent_class.__name__}")
    
    def get_agent_class(self, agent_type: str) -> Type[BaseAgent]:
        """Get an agent class by type.
        
        Args:
            agent_type: Type identifier for the agent
            
        Returns:
            The agent class
            
        Raises:
            KeyError: If no agent class is registered for the given type
        """
        if agent_type not in self._agent_classes:
            raise KeyError(f"No agent class registered for type: {agent_type}")
            
        return self._agent_classes[agent_type]
    
    def list_agent_types(self) -> List[str]:
        """Get a list of all registered agent types.
        
        Returns:
            List of agent type strings
        """
        return list(self._agent_classes.keys())
    
    def create_agent(
        self,
        config: AgentConfig,
        **kwargs
    ) -> BaseAgent:
        """Create a new agent instance.
        
        Args:
            config: Configuration for the agent
            **kwargs: Additional arguments to pass to the agent constructor
            
        Returns:
            A new agent instance
            
        Raises:
            KeyError: If no agent class is registered for the given type
        """
        agent_class = self.get_agent_class(config.agent_type)
        return agent_class(config=config, comm_manager=self.comm_manager, **kwargs)
    
    async def add_agent(
        self,
        agent: BaseAgent,
        config: Optional[AgentConfig] = None
    ) -> None:
        """Add an agent to the registry.
        
        Args:
            agent: The agent instance to add
            config: Optional configuration for the agent
        """
        if config is None:
            config = agent.config
            
        async with self._lock:
            if agent.agent_id in self._agents:
                raise ValueError(f"Agent with ID {agent.agent_id} already exists")
                
            self._agents[agent.agent_id] = agent
            self._agent_configs[agent.agent_id] = config
            self._agent_status[agent.agent_id] = AgentStatus(
                agent_id=agent.agent_id
            )
            
            # Initialize the agent
            await agent.initialize()
            
            logger.info(f"Added agent: {agent.agent_id} ({config.agent_type})")
    
    async def remove_agent(self, agent_id: str) -> None:
        """Remove an agent from the registry.
        
        Args:
            agent_id: ID of the agent to remove
            
        Raises:
            KeyError: If no agent exists with the given ID
        """
        async with self._lock:
            if agent_id not in self._agents:
                raise KeyError(f"No agent with ID {agent_id}")
                
            agent = self._agents[agent_id]
            
            # Shut down the agent
            await agent.shutdown()
            
            # Remove from registry
            del self._agents[agent_id]
            del self._agent_configs[agent_id]
            if agent_id in self._agent_status:
                del self._agent_status[agent_id]
                
            logger.info(f"Removed agent: {agent_id}")
    
    def get_agent(self, agent_id: str) -> BaseAgent:
        """Get an agent by ID.
        
        Args:
            agent_id: ID of the agent to get
            
        Returns:
            The agent instance
            
        Raises:
            KeyError: If no agent exists with the given ID
        """
        return self._agents[agent_id]
    
    def get_agent_config(self, agent_id: str) -> AgentConfig:
        """Get an agent's configuration.
        
        Args:
            agent_id: ID of the agent
            
        Returns:
            The agent's configuration
            
        Raises:
            KeyError: If no agent exists with the given ID
        """
        return self._agent_configs[agent_id]
    
    def get_agent_status(self, agent_id: str) -> AgentStatus:
        """Get an agent's status.
        
        Args:
            agent_id: ID of the agent
            
        Returns:
            The agent's status
            
        Raises:
            KeyError: If no agent exists with the given ID
        """
        return self._agent_status.get(agent_id, AgentStatus(agent_id=agent_id))
    
    def list_agents(self) -> List[str]:
        """Get a list of all agent IDs.
        
        Returns:
            List of agent IDs
        """
        return list(self._agents.keys())
    
    def find_agents(
        self,
        agent_type: Optional[str] = None,
        **filters
    ) -> List[str]:
        """Find agents matching the given criteria.
        
        Args:
            agent_type: Optional agent type to filter by
            **filters: Additional filters to apply
            
        Returns:
            List of matching agent IDs
        """
        result = []
        
        for agent_id, config in self._agent_configs.items():
            if agent_type is not None and config.agent_type != agent_type:
                continue
                
            # Check additional filters
            match = True
            for key, value in filters.items():
                if key in config.config and config.config[key] != value:
                    match = False
                    break
                    
            if match:
                result.append(agent_id)
                
        return result
    
    async def shutdown(self) -> None:
        """Shut down all agents and clean up resources."""
        logger.info("Shutting down agent registry")
        
        # Create a list of tasks to shut down all agents in parallel
        tasks = []
        for agent_id in list(self._agents.keys()):
            agent = self._agents[agent_id]
            tasks.append(agent.shutdown())
        
        # Wait for all agents to shut down
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        
        # Clear all collections
        self._agents.clear()
        self._agent_configs.clear()
        self._agent_status.clear()
        
        logger.info("Agent registry shutdown complete")
