# ai_automation_platform/ai_agents/base_agent.py
import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, TypeVar, Generic, Type
from pydantic import BaseModel

from communication import CommunicationManager, Message
from communication.utils import handle_communication_errors

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseModel)

class BaseAgent(ABC):
    """Base class for all AI agents in the system."""
    
    def __init__(
        self,
        agent_id: str,
        agent_type: str,
        comm_manager: CommunicationManager,
        config: Optional[Dict[str, Any]] = None
    ):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.comm_manager = comm_manager
        self.config = config or {}
        self.is_running = False
        self._tasks: List[asyncio.Task] = []
        
    async def start(self) -> None:
        """Start the agent and all its components."""
        if self.is_running:
            return
            
        logger.info(f"Starting {self.agent_type} agent: {self.agent_id}")
        await self._setup_handlers()
        self.is_running = True
        await self._on_start()
        
    async def stop(self) -> None:
        """Stop the agent and clean up resources."""
        if not self.is_running:
            return
            
        logger.info(f"Stopping {self.agent_type} agent: {self.agent_id}")
        self.is_running = False
        
        # Cancel all running tasks
        for task in self._tasks:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                    
        await self._on_stop()
        
    async def _setup_handlers(self) -> None:
        """Set up message handlers for this agent."""
        pass
        
    async def _on_start(self) -> None:
        """Called when the agent starts. Override in subclasses."""
        pass
        
    async def _on_stop(self) -> None:
        """Called when the agent stops. Override in subclasses."""
        pass
        
    def create_task(self, coro) -> asyncio.Task:
        """Create and track an asyncio task."""
        task = asyncio.create_task(coro)
        self._tasks.append(task)
        task.add_done_callback(self._tasks.remove)
        return task
        
    async def send_message(
        self,
        message_type: str,
        payload: Dict[str, Any],
        receiver: Optional[Dict[str, str]] = None,
        **kwargs
    ) -> None:
        """Send a message through the communication manager."""
        message = {
            "type": message_type,
            "sender": {"id": self.agent_id, "type": self.agent_type},
            "payload": payload,
            **kwargs
        }
        if receiver:
            message["receiver"] = receiver
            
        await self.comm_manager.send_message(message)
        
    @abstractmethod
    async def process_message(self, message: Message) -> None:
        """Process an incoming message. Must be implemented by subclasses."""
        pass