"""Agent manager for coordinating multiple agents."""
import asyncio
import logging
from typing import Dict, List, Optional, Type, Any, TypeVar, Generic, Callable, Awaitable
from pydantic import BaseModel, Field

from communication import CommunicationManager, Message, MessageType
from .registry import AgentRegistry
from .types import AgentConfig, AgentStatus, AgentEvent, AgentEventType
from .base import BaseAgent

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseAgent)

class AgentManager:
    """Manages the lifecycle and coordination of multiple agents."""
    
    def __init__(
        self,
        comm_manager: CommunicationManager,
        registry: Optional[AgentRegistry] = None
    ):
        """Initialize the agent manager.
        
        Args:
            comm_manager: Communication manager instance
            registry: Optional agent registry (will create one if not provided)
        """
        self.comm_manager = comm_manager
        self.registry = registry or AgentRegistry(comm_manager)
        self._event_handlers: Dict[str, List[Callable[[AgentEvent], Awaitable[None]]]] = {}
        self._shutdown_event = asyncio.Event()
        self._tasks: Dict[str, asyncio.Task] = {}
        
    async def initialize(self) -> None:
        """Initialize the agent manager."""
        logger.info("Initializing agent manager")
        
        # Set up communication
        await self._setup_communication()
        
        # Start the main monitoring loop
        self._tasks["monitor_loop"] = asyncio.create_task(self._monitor_loop())
        
        logger.info("Agent manager initialized")
    
    async def shutdown(self) -> None:
        """Shut down the agent manager and all managed agents."""
        if self._shutdown_event.is_set():
            return
            
        logger.info("Shutting down agent manager")
        
        # Signal shutdown
        self._shutdown_event.set()
        
        # Cancel all tasks
        for task_name, task in list(self._tasks.items()):
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                except Exception as e:
                    logger.error(f"Error in task {task_name}: {str(e)}")
        
        # Shut down the registry (which will shut down all agents)
        await self.registry.shutdown()
        
        logger.info("Agent manager shutdown complete")
    
    async def _setup_communication(self) -> None:
        """Set up communication channels and subscriptions."""
        # Subscribe to agent management commands
        await self.comm_manager.subscribe(
            "agent/management/command",
            self._handle_management_command
        )
        
        # Subscribe to agent events
        await self.comm_manager.subscribe(
            "agent/events",
            self._handle_agent_event
        )
    
    async def _monitor_loop(self) -> None:
        """Main monitoring loop for the agent manager."""
        while not self._shutdown_event.is_set():
            try:
                # Periodically check agent health
                await self._check_agent_health()
                
                # Small sleep to prevent busy waiting
                await asyncio.sleep(10)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in monitor loop: {str(e)}", exc_info=True)
                await asyncio.sleep(5)  # Prevent tight loop on errors
    
    async def _check_agent_health(self) -> None:
        """Check the health of all registered agents."""
        for agent_id in self.registry.list_agents():
            try:
                agent = self.registry.get_agent(agent_id)
                status = self.registry.get_agent_status(agent_id)
                
                # Check if agent is responsive
                try:
                    # Send a ping and wait for response
                    response = await self.comm_manager.send_message_and_wait(
                        {
                            "type": MessageType.REQUEST,
                            "sender": {"id": "agent_manager", "type": "system"},
                            "receiver": {"id": agent_id},
                            "payload": {"command": "ping"}
                        },
                        timeout=5.0
                    )
                    
                    if response.payload.get("status") != "pong":
                        logger.warning(f"Agent {agent_id} did not respond correctly to ping")
                        # Handle unresponsive agent
                        await self._handle_unresponsive_agent(agent_id)
                        
                except asyncio.TimeoutError:
                    logger.warning(f"Agent {agent_id} did not respond to ping (timeout)")
                    await self._handle_unresponsive_agent(agent_id)
                    
                except Exception as e:
                    logger.error(f"Error pinging agent {agent_id}: {str(e)}")
                    
            except Exception as e:
                logger.error(f"Error checking health of agent {agent_id}: {str(e)}", exc_info=True)
    
    async def _handle_unresponsive_agent(self, agent_id: str) -> None:
        """Handle an unresponsive agent.
        
        Args:
            agent_id: ID of the unresponsive agent
        """
        logger.warning(f"Agent {agent_id} is unresponsive, attempting recovery...")
        
        try:
            # Try to gracefully shut down the agent
            await self.registry.remove_agent(agent_id)
            
            # Get the agent's configuration
            config = self.registry.get_agent_config(agent_id)
            
            # Recreate and restart the agent
            agent = self.registry.create_agent(config)
            await self.registry.add_agent(agent, config)
            
            logger.info(f"Successfully restarted agent {agent_id}")
            
        except Exception as e:
            logger.error(f"Failed to recover agent {agent_id}: {str(e)}", exc_info=True)
    
    async def _handle_management_command(self, message: Message) -> None:
        """Handle agent management commands.
        
        Args:
            message: The incoming management command message
        """
        try:
            command = message.payload.get("command")
            params = message.payload.get("params", {})
            
            logger.debug(f"Received management command: {command} with params: {params}")
            
            # Route the command to the appropriate handler
            handler_name = f"_handle_{command}_command"
            if hasattr(self, handler_name):
                handler = getattr(self, handler_name)
                result = await handler(params, message)
            else:
                await self._send_error_response(
                    message,
                    f"Unknown command: {command}",
                    "unknown_command"
                )
                return
                
            # Send success response
            await self.comm_manager.send_message({
                "type": MessageType.RESPONSE,
                "correlation_id": message.id,
                "sender": {"id": "agent_manager", "type": "system"},
                "receiver": message.sender,
                "payload": {
                    "status": "success",
                    "result": result
                }
            })
            
        except Exception as e:
            logger.error(f"Error handling management command: {str(e)}", exc_info=True)
            await self._send_error_response(
                message,
                f"Error processing command: {str(e)}",
                "command_error"
            )
    
    async def _handle_create_agent_command(
        self,
        params: Dict[str, Any],
        message: Optional[Message] = None
    ) -> Dict[str, Any]:
        """Handle create_agent command.
        
        Args:
            params: Command parameters
            message: Original message
            
        Returns:
            Result of the operation
        """
        # Parse and validate the agent configuration
        config = AgentConfig(**params["config"])
        
        # Create and add the agent
        agent = self.registry.create_agent(config)
        await self.registry.add_agent(agent, config)
        
        return {
            "agent_id": config.agent_id,
            "status": "created"
        }
    
    async def _handle_remove_agent_command(
        self,
        params: Dict[str, Any],
        message: Optional[Message] = None
    ) -> Dict[str, Any]:
        """Handle remove_agent command.
        
        Args:
            params: Command parameters
            message: Original message
            
        Returns:
            Result of the operation
        """
        agent_id = params["agent_id"]
        await self.registry.remove_agent(agent_id)
        
        return {
            "agent_id": agent_id,
            "status": "removed"
        }
    
    async def _handle_list_agents_command(
        self,
        params: Dict[str, Any],
        message: Optional[Message] = None
    ) -> Dict[str, Any]:
        """Handle list_agents command.
        
        Args:
            params: Command parameters
            message: Original message
            
        Returns:
            List of agents and their statuses
        """
        agent_type = params.get("agent_type")
        
        if agent_type:
            agent_ids = self.registry.find_agents(agent_type=agent_type)
        else:
            agent_ids = self.registry.list_agents()
        
        agents = []
        for agent_id in agent_ids:
            try:
                config = self.registry.get_agent_config(agent_id)
                status = self.registry.get_agent_status(agent_id)
                
                agents.append({
                    "agent_id": agent_id,
                    "type": config.agent_type,
                    "name": config.name,
                    "status": status.dict()
                })
            except Exception as e:
                logger.error(f"Error getting info for agent {agent_id}: {str(e)}")
        
        return {
            "count": len(agents),
            "agents": agents
        }
    
    async def _handle_agent_event(
        self,
        message: Message
    ) -> None:
        """Handle agent events.
        
        Args:
            message: The incoming event message
        """
        try:
            event_data = message.payload.get("data", {})
            event = AgentEvent(**event_data)
            
            # Update agent status if this is a state change event
            if event.event_type == AgentEventType.STATE_CHANGED:
                agent_id = event.agent_id
                new_state = event.data.get("new_state")
                
                # Forward the event to any registered handlers
                await self._dispatch_event(event)
                
        except Exception as e:
            logger.error(f"Error handling agent event: {str(e)}", exc_info=True)
    
    async def _dispatch_event(self, event: AgentEvent) -> None:
        """Dispatch an event to all registered handlers.
        
        Args:
            event: The event to dispatch
        """
        handlers = self._event_handlers.get(event.event_type, [])
        for handler in handlers:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Error in event handler: {str(e)}", exc_info=True)
    
    def on_event(
        self,
        event_type: str
    ) -> Callable[[Callable[[AgentEvent], Awaitable[None]]], Callable[[AgentEvent], Awaitable[None]]]:
        """Decorator to register an event handler.
        
        Args:
            event_type: The type of event to handle
            
        Returns:
            Decorator function
        """
        def decorator(handler: Callable[[AgentEvent], Awaitable[None]]) -> Callable[[AgentEvent], Awaitable[None]]:
            if event_type not in self._event_handlers:
                self._event_handlers[event_type] = []
            self._event_handlers[event_type].append(handler)
            return handler
        return decorator
    
    async def _send_error_response(
        self,
        original_message: Message,
        error: str,
        error_code: str = "agent_manager_error"
    ) -> None:
        """Send an error response.
        
        Args:
            original_message: The original message that caused the error
            error: Error message
            error_code: Error code
        """
        await self.comm_manager.send_message({
            "type": MessageType.ERROR,
            "correlation_id": original_message.id,
            "sender": {"id": "agent_manager", "type": "system"},
            "receiver": original_message.sender,
            "payload": {
                "error": error,

                "error_code": error_code
            }
        })