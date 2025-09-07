"""Task handler registry and base handler classes."""

from typing import Dict, Type, Callable, Awaitable, Any, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class TaskHandler:
    """Handler for a specific task type."""
    execute: Callable[..., Awaitable[Dict[str, Any]]]
    required_capabilities: list[str] = None
    description: str = ""

class TaskRegistry:
    """Registry for task handlers."""
    
    def __init__(self):
        self._handlers: Dict[str, TaskHandler] = {}
    
    def register(
        self, 
        task_type: str, 
        required_capabilities: Optional[list[str]] = None,
        description: str = ""
    ) -> Callable:
        """Decorator to register a task handler."""
        def decorator(func: Callable) -> Callable:
            self._handlers[task_type] = TaskHandler(
                execute=func,
                required_capabilities=required_capabilities or [],
                description=description
            )
            return func
        return decorator
    
    def get_handler(self, task_type: str) -> Optional[TaskHandler]:
        """Get a handler for a task type."""
        return self._handlers.get(task_type)
    
    def list_tasks(self) -> Dict[str, dict]:
        """List all registered task types and their descriptions."""
        return {
            name: {
                "description": handler.description,
                "required_capabilities": handler.required_capabilities
            }
            for name, handler in self._handlers.items()
        }

# Global registry instance
task_registry = TaskRegistry()
