"""Message handlers for the AI Automation Platform."""
from abc import ABC, abstractmethod
import asyncio
import json
import logging
from typing import Any, Dict, List, Optional, Union, Awaitable, Callable

from .models import Message, MessageAck, MessageType, MessageStatus

logger = logging.getLogger(__name__)

class BaseMessageHandler(ABC):
    """Base class for all message handlers."""
    
    def __init__(self, 
                 name: str,
                 message_types: Optional[List[Union[str, MessageType]]] = None):
        """
        Initialize the message handler.
        
        Args:
            name: Name of the handler for logging and identification
            message_types: List of message types this handler can process
        """
        self.name = name
        self.message_types = set()
        
        if message_types:
            for msg_type in message_types:
                self.add_message_type(msg_type)
    
    def add_message_type(self, message_type: Union[str, MessageType]) -> None:
        """
        Add a message type that this handler can process.
        
        Args:
            message_type: Message type to add
        """
        if isinstance(message_type, str):
            try:
                message_type = MessageType(message_type.lower())
            except ValueError:
                logger.warning(f"Unknown message type: {message_type}")
                return
                
        self.message_types.add(message_type)
    
    def can_handle(self, message: Message) -> bool:
        """
        Check if this handler can process the given message.
        
        Args:
            message: Message to check
            
        Returns:
            bool: True if this handler can process the message
        """
        return message.type in self.message_types
    
    @abstractmethod
    async def handle(self, message: Message, **kwargs) -> Optional[MessageAck]:
        """
        Process a message.
        
        Args:
            message: Message to process
            **kwargs: Additional context
            
        Returns:
            Optional[MessageAck]: Acknowledgement if required, None otherwise
        """
        pass
    
    async def __call__(self, message: Message, **kwargs) -> Optional[MessageAck]:
        """
        Make the handler callable.
        
        Args:
            message: Message to process
            **kwargs: Additional context
            
        Returns:
            Optional[MessageAck]: Acknowledgement if required, None otherwise
        """
        if not self.can_handle(message):
            return None
            
        try:
            return await self.handle(message, **kwargs)
        except Exception as e:
            logger.error(f"Error in {self.name} handler: {str(e)}", exc_info=True)
            return MessageAck(
                message_id=message.id,
                status="failed",
                error={"type": type(e).__name__, "message": str(e)}
            )


class CommandHandler(BaseMessageHandler):
    """Handler for command messages."""
    
    def __init__(self, 
                 name: str,
                 command_name: Optional[str] = None,
                 validator: Optional[Callable[[Dict[str, Any]], bool]] = None):
        """
        Initialize the command handler.
        
        Args:
            name: Name of the handler
            command_name: Specific command name this handler processes (None for all commands)
            validator: Optional function to validate command payload
        """
        super().__init__(name, [MessageType.COMMAND])
        self.command_name = command_name
        self.validator = validator
    
    def can_handle(self, message: Message) -> bool:
        """
        Check if this handler can process the given command message.
        
        Args:
            message: Message to check
            
        Returns:
            bool: True if this handler can process the message
        """
        if not super().can_handle(message):
            return False
            
        # Check if this is a specific command handler
        if self.command_name is not None:
            return message.payload.get("command") == self.command_name
            
        return True
    
    async def validate(self, payload: Dict[str, Any]) -> bool:
        """
        Validate the command payload.
        
        Args:
            payload: Command payload to validate
            
        Returns:
            bool: True if the payload is valid
        """
        if self.validator is None:
            return True
            
        try:
            return await asyncio.get_event_loop().run_in_executor(
                None, self.validator, payload
            )
        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            return False
    
    @abstractmethod
    async def execute(self, 
                     command: str, 
                     params: Dict[str, Any], 
                     **kwargs) -> Dict[str, Any]:
        """
        Execute the command.
        
        Args:
            command: Command name
            params: Command parameters
            **kwargs: Additional context
            
        Returns:
            Dict[str, Any]: Command result
        """
        pass
    
    async def handle(self, message: Message, **kwargs) -> MessageAck:
        """
        Process a command message.
        
        Args:
            message: Message to process
            **kwargs: Additional context
            
        Returns:
            MessageAck: Command execution result
        """
        command = message.payload.get("command")
        params = message.payload.get("params", {})
        
        # Validate the command payload
        if not await self.validate(message.payload):
            return MessageAck(
                message_id=message.id,
                status="failed",
                error={"code": "validation_error", "message": "Invalid command payload"}
            )
        
        try:
            # Execute the command
            result = await self.execute(command, params, **kwargs)
            
            # Return success ack with result
            return MessageAck(
                message_id=message.id,
                status="completed",
                metadata={"result": result}
            )
            
        except Exception as e:
            logger.error(f"Command execution failed: {str(e)}", exc_info=True)
            return MessageAck(
                message_id=message.id,
                status="failed",
                error={
                    "code": "execution_error",
                    "type": type(e).__name__,
                    "message": str(e)
                }
            )


class EventHandler(BaseMessageHandler):
    """Handler for event messages."""
    
    def __init__(self, 
                 name: str,
                 event_type: Optional[str] = None):
        """
        Initialize the event handler.
        
        Args:
            name: Name of the handler
            event_type: Specific event type this handler processes (None for all events)
        """
        super().__init__(name, [MessageType.EVENT])
        self.event_type = event_type
    
    def can_handle(self, message: Message) -> bool:
        """
        Check if this handler can process the given event message.
        
        Args:
            message: Message to check
            
        Returns:
            bool: True if this handler can process the message
        """
        if not super().can_handle(message):
            return False
            
        # Check if this is a specific event handler
        if self.event_type is not None:
            return message.payload.get("event") == self.event_type
            
        return True
    
    @abstractmethod
    async def process(self, 
                     event: str, 
                     data: Dict[str, Any], 
                     **kwargs) -> None:
        """
        Process the event.
        
        Args:
            event: Event name
            data: Event data
            **kwargs: Additional context
        """
        pass
    
    async def handle(self, message: Message, **kwargs) -> Optional[MessageAck]:
        """
        Process an event message.
        
        Args:
            message: Message to process
            **kwargs: Additional context
            
        Returns:
            Optional[MessageAck]: Acknowledgment if required
        """
        event = message.payload.get("event")
        data = message.payload.get("data", {})
        
        try:
            # Process the event
            await self.process(event, data, **kwargs)
            
            # Events typically don't require a response unless it's a request/response pattern
            if message.correlation_id or message.reply_to:
                return MessageAck(
                    message_id=message.id,
                    status="processed"
                )
                
            return None
            
        except Exception as e:
            logger.error(f"Event processing failed: {str(e)}", exc_info=True)
            
            # Only return an error ack if this is part of a request/response
            if message.correlation_id or message.reply_to:
                return MessageAck(
                    message_id=message.id,
                    status="failed",
                    error={
                        "code": "processing_error",
                        "type": type(e).__name__,
                        "message": str(e)
                    }
                )
            return None


class DataHandler(BaseMessageHandler):
    """Handler for data messages."""
    
    def __init__(self, 
                 name: str,
                 data_type: Optional[str] = None):
        """
        Initialize the data handler.
        
        Args:
            name: Name of the handler
            data_type: Specific data type this handler processes (None for all data)
        """
        super().__init__(name, [MessageType.DATA])
        self.data_type = data_type
    
    def can_handle(self, message: Message) -> bool:
        """
        Check if this handler can process the given data message.
        
        Args:
            message: Message to check
            
        Returns:
            bool: True if this handler can process the message
        """
        if not super().can_handle(message):
            return False
            
        # Check if this is a specific data handler
        if self.data_type is not None:
            return message.metadata.get("data_type") == self.data_type
            
        return True
    
    @abstractmethod
    async def process_data(self, 
                         data: Any, 
                         metadata: Dict[str, Any],
                         **kwargs) -> Any:
        """
        Process the data.
        
        Args:
            data: Data to process
            metadata: Message metadata
            **kwargs: Additional context
            
        Returns:
            Any: Processing result
        """
        pass
    
    async def handle(self, message: Message, **kwargs) -> Optional[MessageAck]:
        """
        Process a data message.
        
        Args:
            message: Message to process
            **kwargs: Additional context
            
        Returns:
            Optional[MessageAck]: Processing result if required
        """
        try:
            # Process the data
            result = await self.process_data(
                data=message.payload,
                metadata=message.metadata,
                **kwargs
            )
            
            # Return result if this is a request/response
            if message.correlation_id or message.reply_to:
                return MessageAck(
                    message_id=message.id,
                    status="processed",
                    metadata={"result": result} if result is not None else None
                )
                
            return None
            
        except Exception as e:
            logger.error(f"Data processing failed: {str(e)}", exc_info=True)
            
            # Only return an error ack if this is part of a request/response
            if message.correlation_id or message.reply_to:
                return MessageAck(
                    message_id=message.id,
                    status="failed",
                    error={
                        "code": "processing_error",
                        "type": type(e).__name__,
                        "message": str(e)
                    }
                )
            return None


class NotificationHandler(BaseMessageHandler):
    """Handler for notification messages."""
    
    def __init__(self, 
                 name: str,
                 notification_type: Optional[str] = None):
        """
        Initialize the notification handler.
        
        Args:
            name: Name of the handler
            notification_type: Specific notification type this handler processes (None for all)
        """
        super().__init__(name, [MessageType.NOTIFICATION])
        self.notification_type = notification_type
    
    def can_handle(self, message: Message) -> bool:
        """
        Check if this handler can process the given notification message.
        
        Args:
            message: Message to check
            
        Returns:
            bool: True if this handler can process the message
        """
        if not super().can_handle(message):
            return False
            
        # Check if this is a specific notification handler
        if self.notification_type is not None:
            return message.payload.get("type") == self.notification_type
            
        return True
    
    @abstractmethod
    async def notify(self, 
                    title: str, 
                    message: str, 
                    level: str,
                    metadata: Dict[str, Any],
                    **kwargs) -> None:
        """
        Process the notification.
        
        Args:
            title: Notification title
            message: Notification message
            level: Notification level (info, warning, error, etc.)
            metadata: Additional notification metadata
            **kwargs: Additional context
        """
        pass
    
    async def handle(self, message: Message, **kwargs) -> Optional[MessageAck]:
        """
        Process a notification message.
        
        Args:
            message: Message to process
            **kwargs: Additional context
            
        Returns:
            Optional[MessageAck]: Acknowledgment if required
        """
        payload = message.payload
        
        try:
            # Process the notification
            await self.notify(
                title=payload.get("title", ""),
                message=payload.get("message", ""),
                level=payload.get("level", "info"),
                metadata=payload.get("metadata", {}),
                **kwargs
            )
            
            # Notifications typically don't require a response
            return None
            
        except Exception as e:
            logger.error(f"Notification handling failed: {str(e)}", exc_info=True)
            return None


class HeartbeatHandler(BaseMessageHandler):
    """Handler for heartbeat messages."""
    
    def __init__(self, name: str = "heartbeat"):
        """
        Initialize the heartbeat handler.
        
        Args:
            name: Name of the handler
        """
        super().__init__(name, [MessageType.HEARTBEAT])
        self.last_heartbeat = {}
        self.timeout = 60  # Default timeout in seconds
    
    async def handle(self, message: Message, **kwargs) -> Optional[MessageAck]:
        """
        Process a heartbeat message.
        
        Args:
            message: Message to process
            **kwargs: Additional context
            
        Returns:
            Optional[MessageAck]: Heartbeat acknowledgment
        """
        source = message.sender.get("id", "unknown")
        timestamp = message.payload.get("timestamp")
        
        # Update the last heartbeat timestamp
        self.last_heartbeat[source] = {
            "timestamp": timestamp or asyncio.get_event_loop().time(),
            "source": source,
            "metadata": message.payload.get("metadata", {})
        }
        
        # Check for stale heartbeats
        await self._check_stale_heartbeats()
        
        # Return a simple ack
        return MessageAck(
            message_id=message.id,
            status="received"
        )
    
    async def _check_stale_heartbeats(self) -> None:
        """Check for and handle stale heartbeats."""
        current_time = asyncio.get_event_loop().time()
        stale = []
        
        for source, hb in self.last_heartbeat.items():
            if current_time - hb["timestamp"] > self.timeout:
                stale.append(source)
        
        # Handle stale heartbeats
        for source in stale:
            logger.warning(f"Stale heartbeat from {source}")
            await self.on_heartbeat_timeout(source, self.last_heartbeat[source])
            del self.last_heartbeat[source]
    
    async def on_heartbeat_timeout(self, source: str, last_heartbeat: Dict[str, Any]) -> None:
        """
        Handle a heartbeat timeout.
        
        Args:
            source: ID of the source that timed out
            last_heartbeat: Last heartbeat data from the source
        """
        # Subclasses can override this to handle timeouts
        pass
