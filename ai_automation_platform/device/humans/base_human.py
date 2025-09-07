"""Base human interface for the AI Automation Platform."""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Callable, Awaitable
import asyncio
import logging

from .models import HumanInfo, HumanState, HumanRole, HumanCapability, HumanStateUpdate, HumanTaskAssignment

logger = logging.getLogger(__name__)

class BaseHuman(ABC):
    """Base class for human interfaces in the automation system."""
    
    def __init__(self, human_info: HumanInfo):
        """Initialize the human interface."""
        self._info = human_info
        self._state = HumanState.OFFLINE
        self._tasks: Dict[str, HumanTaskAssignment] = {}
        self._event_handlers: Dict[str, List[Callable[[Dict[str, Any]], Awaitable[None]]]] = {}
        self._last_interaction = None
        
    @property
    def user_id(self) -> str:
        """Get the user's unique identifier."""
        return self._info.user_id
    
    @property
    def username(self) -> str:
        """Get the user's username."""
        return self._info.username
    
    @property
    def role(self) -> HumanRole:
        """Get the user's role."""
        return self._info.role
    
    @property
    def state(self) -> HumanState:
        """Get the current state of the human."""
        return self._state
    
    @property
    def current_tasks(self) -> Dict[str, HumanTaskAssignment]:
        """Get the user's current tasks."""
        return self._tasks.copy()
    
    # Lifecycle methods
    
    async def connect(self) -> bool:
        """
        Connect the human to the system.
        
        Returns:
            bool: True if connection was successful
        """
        if self._state != HumanState.OFFLINE:
            return True
            
        try:
            await self._on_connect()
            await self.update_state(HumanState.AVAILABLE, "Connected to system")
            logger.info(f"Human {self._info.username} connected")
            return True
        except Exception as e:
            logger.error(f"Error connecting human {self._info.username}: {str(e)}")
            return False
    
    async def disconnect(self) -> None:
        """Disconnect the human from the system."""
        if self._state == HumanState.OFFLINE:
            return
            
        try:
            await self.update_state(HumanState.OFFLINE, "Disconnected from system")
            await self._on_disconnect()
            logger.info(f"Human {self._info.username} disconnected")
        except Exception as e:
            logger.error(f"Error disconnecting human {self._info.username}: {str(e)}")
    
    # State management
    
    async def update_state(self, new_state: HumanState, message: str = "") -> bool:
        """
        Update the human's state.
        
        Args:
            new_state: The new state
            message: Optional message describing the state change
            
        Returns:
            bool: True if state was updated
        """
        old_state = self._state
        if old_state == new_state:
            return False
            
        self._state = new_state
        self._info.last_seen = asyncio.get_event_loop().time()
        
        # Log the state change
        logger.info(f"Human {self._info.username} state changed: {old_state} -> {new_state}")
        
        # Emit state change event
        await self._emit_event("state_changed", {
            "user_id": self._info.user_id,
            "old_state": old_state.value,
            "new_state": new_state.value,
            "message": message,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        return True
    
    # Task management
    
    async def assign_task(self, task: HumanTaskAssignment) -> bool:
        """
        Assign a task to the human.
        
        Args:
            task: The task to assign
            
        Returns:
            bool: True if task was assigned successfully
        """
        if task.task_id in self._tasks:
            logger.warning(f"Task {task.task_id} is already assigned to {self._info.username}")
            return False
            
        # Check if human has required capabilities
        for cap in task.required_capabilities:
            if cap not in self._info.capabilities:
                logger.error(f"Cannot assign task {task.task_id}: missing required capability {cap}")
                return False
        
        self._tasks[task.task_id] = task
        
        # Notify the human about the new task
        await self._on_task_assigned(task)
        
        # Emit task assigned event
        await self._emit_event("task_assigned", {
            "user_id": self._info.user_id,
            "task_id": task.task_id,
            "task": task.dict(),
            "timestamp": asyncio.get_event_loop().time()
        })
        
        logger.info(f"Assigned task {task.task_id} to {self._info.username}")
        return True
    
    async def complete_task(self, task_id: str, result: Dict[str, Any] = None) -> bool:
        """
        Mark a task as completed.
        
        Args:
            task_id: The ID of the task to complete
            result: Optional result data
            
        Returns:
            bool: True if task was completed successfully
        """
        if task_id not in self._tasks:
            logger.warning(f"Cannot complete task {task_id}: not assigned to {self._info.username}")
            return False
            
        task = self._tasks.pop(task_id)
        
        # Notify about task completion
        await self._on_task_completed(task, result or {})
        
        # Emit task completed event
        await self._emit_event("task_completed", {
            "user_id": self._info.user_id,
            "task_id": task_id,
            "result": result,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        logger.info(f"Task {task_id} completed by {self._info.username}")
        return True
    
    # Event handling
    
    def add_event_handler(self, event_type: str, handler: Callable[[Dict[str, Any]], Awaitable[None]]):
        """
        Add an event handler.
        
        Args:
            event_type: Type of event to handle
            handler: Async function that handles the event
        """
        if event_type not in self._event_handlers:
            self._event_handlers[event_type] = []
        self._event_handlers[event_type].append(handler)
    
    def remove_event_handler(self, event_type: str, handler: Callable[[Dict[str, Any]], Awaitable[None]]):
        """
        Remove an event handler.
        
        Args:
            event_type: Type of event
            handler: Handler function to remove
        """
        if event_type in self._event_handlers:
            try:
                self._event_handlers[event_type].remove(handler)
            except ValueError:
                pass
    
    async def _emit_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """
        Emit an event to all registered handlers.
        
        Args:
            event_type: Type of event
            data: Event data
        """
        if event_type not in self._event_handlers:
            return
            
        event = {"type": event_type, "data": data, "timestamp": asyncio.get_event_loop().time()}
        
        for handler in self._event_handlers[event_type]:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Error in event handler for {event_type}: {str(e)}", exc_info=True)
    
    # Abstract methods to be implemented by subclasses
    
    @abstractmethod
    async def _on_connect(self) -> None:
        """Handle connection to the system."""
        pass
    
    @abstractmethod
    async def _on_disconnect(self) -> None:
        """Handle disconnection from the system."""
        pass
    
    @abstractmethod
    async def _on_task_assigned(self, task: HumanTaskAssignment) -> None:
        """
        Handle a newly assigned task.
        
        Args:
            task: The assigned task
        """
        pass
    
    @abstractmethod
    async def _on_task_completed(self, task: HumanTaskAssignment, result: Dict[str, Any]) -> None:
        """
        Handle task completion.
        
        Args:
            task: The completed task
            result: Task result data
        """
        pass
    
    @abstractmethod
    async def notify(self, message: str, level: str = "info", **kwargs) -> bool:
        """
        Send a notification to the human.
        
        Args:
            message: The notification message
            level: Notification level (info, warning, error, etc.)
            **kwargs: Additional notification data
            
        Returns:
            bool: True if notification was sent successfully
        """
        pass
    
    # Context manager support
    
    async def __aenter__(self):
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()
