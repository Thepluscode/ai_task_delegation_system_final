"""Base classes for AI Agents."""
import asyncio
import logging
import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type, TypeVar, Generic, Callable, Awaitable
from datetime import datetime, timedelta

from pydantic import BaseModel, Field

from communication import CommunicationManager, Message, MessageType
from .types import (
    AgentState, AgentRole, AgentCapability, AgentConfig,
    AgentStatus, AgentEvent, AgentEventType, TaskResult
)

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseModel)

class BaseAgent(ABC):
    """Base class for all AI agents in the system."""
    
    def __init__(
        self,
        config: AgentConfig,
        comm_manager: CommunicationManager,
    ):
        """Initialize the base agent.
        
        Args:
            config: Configuration for this agent
            comm_manager: Communication manager instance
        """
        self.config = config
        self.comm_manager = comm_manager
        self.agent_id = config.agent_id
        self.state = AgentState.INITIALIZING
        self._status = AgentStatus(agent_id=self.agent_id)
        self._event_handlers: Dict[AgentEventType, List[Callable[[AgentEvent], Awaitable[None]]]] = {}
        self._tasks: Dict[str, asyncio.Task] = {}
        self._shutdown_event = asyncio.Event()
        
        # Register default event handlers
        self._register_default_handlers()
    
    async def initialize(self) -> None:
        """Initialize the agent and its resources."""
        if self.state != AgentState.INITIALIZING:
            raise RuntimeError("Agent already initialized")
            
        logger.info(f"Initializing agent {self.agent_id}")
        
        try:
            # Set up communication
            await self._setup_communication()
            
            # Initialize agent-specific resources
            await self._initialize_agent()
            
            # Start the main loop
            self._tasks["main_loop"] = asyncio.create_task(self._main_loop())
            
            # Update state
            await self._update_state(AgentState.IDLE)
            
            logger.info(f"Agent {self.agent_id} initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize agent {self.agent_id}: {str(e)}", exc_info=True)
            await self._update_state(AgentState.ERROR, error=str(e))
            raise
    
    async def shutdown(self) -> None:
        """Shut down the agent and clean up resources."""
        if self.state == AgentState.TERMINATED:
            return
            
        logger.info(f"Shutting down agent {self.agent_id}")
        
        # Set shutdown flag
        self._shutdown_event.set()
        
        # Cancel all running tasks
        for task_name, task in list(self._tasks.items()):
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                except Exception as e:
                    logger.error(f"Error in task {task_name}: {str(e)}")
        
        # Clean up agent-specific resources
        try:
            await self._cleanup_agent()
        except Exception as e:
            logger.error(f"Error during agent cleanup: {str(e)}")
        
        # Update state
        await self._update_state(AgentState.TERMINATED)
        
        logger.info(f"Agent {self.agent_id} has been shut down")
    
    async def _main_loop(self) -> None:
        """Main agent loop."""
        while not self._shutdown_event.is_set():
            try:
                # Update heartbeat
                self._status.last_heartbeat = datetime.utcnow()
                
                # Perform periodic tasks
                await self._periodic_tasks()
                
                # Small sleep to prevent busy waiting
                await asyncio.sleep(1)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in main loop: {str(e)}", exc_info=True)
                await asyncio.sleep(5)  # Prevent tight loop on errors
    
    async def _periodic_tasks(self) -> None:
        """Override this method to perform periodic tasks."""
        pass
    
    async def _setup_communication(self) -> None:
        """Set up communication channels and subscriptions."""
        # Subscribe to agent-specific messages
        await self.comm_manager.subscribe(
            f"agent/{self.agent_id}/command",
            self._handle_command_message
        )
        
        # Subscribe to broadcast messages
        await self.comm_manager.subscribe(
            "agent/broadcast",
            self._handle_broadcast_message
        )
        
        # Subscribe to system events
        await self.comm_manager.subscribe(
            "system/events",
            self._handle_system_event
        )
    
    async def _handle_command_message(self, message: Message) -> None:
        """Handle incoming command messages."""
        try:
            command = message.payload.get("command")
            params = message.payload.get("params", {})
            
            logger.debug(f"Received command: {command} with params: {params}")
            
            # Handle built-in commands
            if command == "status":
                await self._send_status_update(message)
            elif command == "ping":
                await self._handle_ping(message)
            else:
                # Delegate to agent-specific command handler
                await self.handle_command(command, params, message)
                
        except Exception as e:
            logger.error(f"Error handling command: {str(e)}", exc_info=True)
            await self._send_error_response(
                message,
                f"Error processing command: {str(e)}"
            )
    
    async def _handle_broadcast_message(self, message: Message) -> None:
        """Handle broadcast messages."""
        try:
            await self.handle_broadcast(message.payload, message)
        except Exception as e:
            logger.error(f"Error handling broadcast: {str(e)}", exc_info=True)
    
    async def _handle_system_event(self, message: Message) -> None:
        """Handle system events."""
        try:
            event_type = message.payload.get("event")
            data = message.payload.get("data", {})
            
            if event_type == "shutdown":
                logger.info("Received system shutdown event")
                await self.shutdown()
            else:
                await self.handle_system_event(event_type, data, message)
                
        except Exception as e:
            logger.error(f"Error handling system event: {str(e)}", exc_info=True)
    
    async def _send_status_update(self, request_message: Optional[Message] = None) -> None:
        """Send a status update."""
        status_update = {
            "agent_id": self.agent_id,
            "state": self.state,
            "status": self._status.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if request_message:
            # Send as a response to a status request
            await self.comm_manager.send_message({
                "type": MessageType.RESPONSE,
                "correlation_id": request_message.id,
                "sender": {"id": self.agent_id, "type": self.config.agent_type},
                "receiver": request_message.sender,
                "payload": status_update
            })
        else:
            # Broadcast status update
            await self.comm_manager.send_message({
                "type": MessageType.EVENT,
                "sender": {"id": self.agent_id, "type": self.config.agent_type},
                "payload": {
                    "event": "status_update",
                    "data": status_update
                }
            })
    
    async def _handle_ping(self, message: Message) -> None:
        """Handle ping command."""
        await self.comm_manager.send_message({
            "type": MessageType.RESPONSE,
            "correlation_id": message.id,
            "sender": {"id": self.agent_id, "type": self.config.agent_type},
            "receiver": message.sender,
            "payload": {
                "status": "pong",
                "agent_id": self.agent_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
    
    async def _send_error_response(
        self,
        original_message: Message,
        error: str,
        error_code: str = "agent_error"
    ) -> None:
        """Send an error response."""
        await self.comm_manager.send_message({
            "type": MessageType.ERROR,
            "correlation_id": original_message.id,
            "sender": {"id": self.agent_id, "type": self.config.agent_type},
            "receiver": original_message.sender,
            "payload": {
                "error": error,
                "error_code": error_code,
                "agent_id": self.agent_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
    
    async def _update_state(
        self,
        new_state: AgentState,
        error: Optional[str] = None,
        **extra_data
    ) -> None:
        """Update the agent's state and emit an event."""
        old_state = self.state
        self.state = new_state
        self._status.state = new_state
        
        # Update metrics if provided
        if "metrics" in extra_data:
            self._status.metrics.update(extra_data["metrics"])
        
        # Emit state change event
        await self.emit_event(
            AgentEventType.STATE_CHANGED,
            {
                "old_state": old_state,
                "new_state": new_state,
                "error": error,
                **extra_data
            }
        )
        
        logger.info(f"Agent {self.agent_id} state changed: {old_state} -> {new_state}")
    
    async def emit_event(
        self,
        event_type: AgentEventType,
        data: Optional[Dict[str, Any]] = None,
        **extra_data
    ) -> AgentEvent:
        """Emit an agent event."""
        event_data = data or {}
        event_data.update(extra_data)
        
        event = AgentEvent(
            agent_id=self.agent_id,
            event_type=event_type,
            data=event_data
        )
        
        # Call registered handlers
        if event_type in self._event_handlers:
            for handler in self._event_handlers[event_type]:
                try:
                    await handler(event)
                except Exception as e:
                    logger.error(f"Error in event handler: {str(e)}", exc_info=True)
        
        # Also publish to message bus
        await self.comm_manager.send_message({
            "type": MessageType.EVENT,
            "sender": {"id": self.agent_id, "type": self.config.agent_type},
            "payload": {
                "event": f"agent.{event_type.value}",
                "data": event.dict()
            }
        })
        
        return event
    
    def on_event(
        self,
        event_type: AgentEventType
    ) -> Callable[[Callable[[AgentEvent], Awaitable[None]]], Callable[[AgentEvent], Awaitable[None]]]:
        """Decorator to register an event handler."""
        def decorator(handler: Callable[[AgentEvent], Awaitable[None]]) -> Callable[[AgentEvent], Awaitable[None]]:
            if event_type not in self._event_handlers:
                self._event_handlers[event_type] = []
            self._event_handlers[event_type].append(handler)
            return handler
        return decorator
    
    def _register_default_handlers(self) -> None:
        """Register default event handlers."""
        @self.on_event(AgentEventType.ERROR_OCCURRED)
        async def _on_error(event: AgentEvent) -> None:
            logger.error(f"Agent {self.agent_id} error: {event.data.get('error')}")
    
    @abstractmethod
    async def _initialize_agent(self) -> None:
        """Initialize agent-specific resources.
        
        Override this method in subclasses to perform agent-specific initialization.
        """
        pass
    
    @abstractmethod
    async def _cleanup_agent(self) -> None:
        """Clean up agent-specific resources.
        
        Override this method in subclasses to perform agent-specific cleanup.
        """
        pass
    
    @abstractmethod
    async def handle_command(
        self,
        command: str,
        params: Dict[str, Any],
        message: Message
    ) -> None:
        """Handle an incoming command.
        
        Args:
            command: The command to execute
            params: Command parameters
            message: The original message
            
        Raises:
            NotImplementedError: If the command is not supported
        """
        raise NotImplementedError(f"Command '{command}' not implemented")
    
    async def handle_broadcast(
        self,
        payload: Dict[str, Any],
        message: Message
    ) -> None:
        """Handle a broadcast message.
        
        Args:
            payload: The broadcast payload
            message: The original message
        """
        pass
    
    async def handle_system_event(
        self,
        event_type: str,
        data: Dict[str, Any],
        message: Message
    ) -> None:
        """Handle a system event.
        
        Args:
            event_type: Type of system event
            data: Event data
            message: The original message
        """
        pass

class TaskAgent(BaseAgent):
    """Base class for agents that execute tasks."""
    
    def __init__(
        self,
        config: AgentConfig,
        comm_manager: CommunicationManager,
    ):
        """Initialize the task agent."""
        super().__init__(config, comm_manager)
        self.active_tasks: Dict[str, asyncio.Task] = {}
    
    async def _cleanup_agent(self) -> None:
        """Clean up tasks and resources."""
        # Cancel all active tasks
        for task_id, task in list(self.active_tasks.items()):
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                except Exception as e:
                    logger.error(f"Error in task {task_id}: {str(e)}")
        
        self.active_tasks.clear()
    
    async def execute_task(
        self,
        task_id: str,
        task_data: Dict[str, Any],
        message: Optional[Message] = None
    ) -> Dict[str, Any]:
        """Execute a task and return the result.
        
        Args:
            task_id: Unique identifier for the task
            task_data: Task parameters
            message: Original message that triggered the task
            
        Returns:
            Dict containing the task result
        """
        if task_id in self.active_tasks:
            raise ValueError(f"Task {task_id} is already running")
        
        # Create and store the task
        task = asyncio.create_task(
            self._execute_task_with_cleanup(task_id, task_data, message)
        )
        self.active_tasks[task_id] = task
        
        # Add callback to remove task when done
        task.add_done_callback(
            lambda t, tid=task_id: self.active_tasks.pop(tid, None)
        )
        
        # Return task info
        return {
            "task_id": task_id,
            "status": "started",
            "agent_id": self.agent_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _execute_task_with_cleanup(
        self,
        task_id: str,
        task_data: Dict[str, Any],
        message: Optional[Message] = None
    ) -> None:
        """Execute a task with proper cleanup and error handling."""
        try:
            # Emit task started event
            await self.emit_event(
                AgentEventType.TASK_STARTED,
                {"task_id": task_id, "task_data": task_data}
            )
            
            # Execute the task
            result = await self.execute_task_impl(task_id, task_data, message)
            
            # Emit task completed event
            await self.emit_event(
                AgentEventType.TASK_COMPLETED,
                {
                    "task_id": task_id,
                    "result": result,
                    "status": "completed"
                }
            )
            
            return result
            
        except Exception as e:
            error_msg = f"Task {task_id} failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            
            # Emit task failed event
            await self.emit_event(
                AgentEventType.TASK_FAILED,
                {
                    "task_id": task_id,
                    "error": str(e),
                    "status": "failed"
                }
            )
            
            # Re-raise the exception
            raise
    
    @abstractmethod
    async def execute_task_impl(
        self,
        task_id: str,
        task_data: Dict[str, Any],
        message: Optional[Message] = None
    ) -> Dict[str, Any]:
        """Execute the actual task logic.
        
        Args:
            task_id: Unique identifier for the task
            task_data: Task parameters
            message: Original message that triggered the task
            
        Returns:
            Dict containing the task result
            
        Raises:
            Exception: If the task fails
        """
        raise NotImplementedError("execute_task_impl must be implemented by subclasses")
