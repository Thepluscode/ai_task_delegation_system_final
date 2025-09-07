"""Utility functions for communication in the AI Automation Platform."""
import asyncio
import json
import logging
import time
from typing import Any, Dict, List, Optional, Union, Callable, Awaitable, TypeVar, Type, cast
from uuid import uuid4

from .models import (
    Message,
    MessageType,
    MessagePriority,
    MessageStatus,
    MessageDirection,
    MessageAck,
    Subscription,
    MessageBatch
)
from .channels import BaseChannel

logger = logging.getLogger(__name__)

T = TypeVar('T')

# Message Creation Utilities

def create_message(
    message_type: Union[str, MessageType],
    payload: Dict[str, Any],
    sender: Optional[Dict[str, str]] = None,
    receiver: Optional[Dict[str, str]] = None,
    priority: Union[str, MessagePriority] = MessagePriority.NORMAL,
    correlation_id: Optional[str] = None,
    reply_to: Optional[str] = None,
    ttl: Optional[float] = None,
    **metadata
) -> Message:
    """
    Create a new message with the given parameters.
    
    Args:
        message_type: Type of the message
        payload: Message payload
        sender: Sender information (id and type)
        receiver: Receiver information (id and type)
        priority: Message priority
        correlation_id: Correlation ID for request/response
        reply_to: Address to send the response to
        ttl: Time to live in seconds
        **metadata: Additional metadata
        
    Returns:
        Message: The created message
    """
    if isinstance(message_type, str):
        try:
            message_type = MessageType(message_type.lower())
        except ValueError:
            logger.warning(f"Unknown message type: {message_type}")
    
    if isinstance(priority, str):
        try:
            priority = MessagePriority(priority.lower())
        except ValueError:
            logger.warning(f"Unknown priority: {priority}")
            priority = MessagePriority.NORMAL
    
    return Message(
        type=message_type,
        payload=payload,
        sender=sender or {},
        receiver=receiver or {},
        priority=priority,
        correlation_id=correlation_id,
        reply_to=reply_to,
        ttl=ttl,
        metadata=metadata,
        direction=MessageDirection.OUTBOUND
    )


def create_command_message(
    command: str,
    params: Optional[Dict[str, Any]] = None,
    **kwargs
) -> Message:
    """
    Create a command message.
    
    Args:
        command: Command name
        params: Command parameters
        **kwargs: Additional arguments for create_message
        
    Returns:
        Message: The created command message
    """
    return create_message(
        message_type=MessageType.COMMAND,
        payload={
            "command": command,
            "params": params or {}
        },
        **kwargs
    )


def create_event_message(
    event: str,
    data: Optional[Dict[str, Any]] = None,
    **kwargs
) -> Message:
    """
    Create an event message.
    
    Args:
        event: Event name
        data: Event data
        **kwargs: Additional arguments for create_message
        
    Returns:
        Message: The created event message
    """
    return create_message(
        message_type=MessageType.EVENT,
        payload={
            "event": event,
            "data": data or {}
        },
        **kwargs
    )


def create_data_message(
    data: Any,
    data_type: Optional[str] = None,
    **kwargs
) -> Message:
    """
    Create a data message.
    
    Args:
        data: The data to send
        data_type: Optional data type identifier
        **kwargs: Additional arguments for create_message
        
    Returns:
        Message: The created data message
    """
    metadata = kwargs.pop('metadata', {})
    if data_type:
        metadata['data_type'] = data_type
        
    return create_message(
        message_type=MessageType.DATA,
        payload={"data": data},
        metadata=metadata,
        **kwargs
    )


def create_notification_message(
    title: str,
    message: str,
    level: str = "info",
    **kwargs
) -> Message:
    """
    Create a notification message.
    
    Args:
        title: Notification title
        message: Notification message
        level: Notification level (info, warning, error, etc.)
        **kwargs: Additional arguments for create_message
        
    Returns:
        Message: The created notification message
    """
    return create_message(
        message_type=MessageType.NOTIFICATION,
        payload={
            "title": title,
            "message": message,
            "level": level,
            "timestamp": time.time()
        },
        **kwargs
    )


def create_heartbeat_message(
    source_id: str,
    source_type: str,
    metadata: Optional[Dict[str, Any]] = None,
    **kwargs
) -> Message:
    """
    Create a heartbeat message.
    
    Args:
        source_id: ID of the source
        source_type: Type of the source
        metadata: Additional metadata
        **kwargs: Additional arguments for create_message
        
    Returns:
        Message: The created heartbeat message
    """
    return create_message(
        message_type=MessageType.HEARTBEAT,
        sender={"id": source_id, "type": source_type},
        payload={
            "timestamp": time.time(),
            "metadata": metadata or {}
        },
        **kwargs
    )


# Message Sending Utilities

async def send_and_wait(
    send_func: Callable[..., Awaitable[MessageAck]],
    message: Message,
    timeout: float = 10.0,
    retries: int = 2,
    **kwargs
) -> MessageAck:
    """
    Send a message and wait for a response.
    
    Args:
        send_func: Function to send the message
        message: Message to send
        timeout: Timeout in seconds
        retries: Number of retry attempts
        **kwargs: Additional arguments for send_func
        
    Returns:
        MessageAck: The response acknowledgment
        
    Raises:
        asyncio.TimeoutError: If the operation times out
    """
    last_error = None
    
    for attempt in range(retries + 1):
        try:
            # Send the message
            ack = await asyncio.wait_for(
                send_func(message, **kwargs),
                timeout=timeout
            )
            
            # Check if the message was delivered
            if ack.status in ["delivered", "processed", "completed"]:
                return ack
                
            last_error = ack.error or {"message": f"Message delivery failed with status: {ack.status}"}
            
        except asyncio.TimeoutError as e:
            last_error = {"message": f"Timeout after {timeout} seconds"}
            if attempt < retries:
                logger.warning(f"Attempt {attempt + 1} failed: {last_error['message']}")
                await asyncio.sleep(1)  # Small delay before retry
                continue
            raise
            
        except Exception as e:
            last_error = {"type": type(e).__name__, "message": str(e)}
            if attempt < retries:
                logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                await asyncio.sleep(1)  # Small delay before retry
                continue
            raise
    
    # If we get here, all retries failed
    return MessageAck(
        message_id=message.id,
        status="failed",
        error=last_error,
        metadata={"retries": retries}
    )


async def request_response(
    send_func: Callable[..., Awaitable[MessageAck]],
    message: Message,
    response_handler: Callable[[MessageAck], Awaitable[Optional[T]]],
    timeout: float = 30.0,
    **kwargs
) -> T:
    """
    Send a request and wait for a response using a handler.
    
    Args:
        send_func: Function to send the message
        message: Request message to send
        response_handler: Async function to handle the response
        timeout: Timeout in seconds
        **kwargs: Additional arguments for send_func
        
    Returns:
        The result from the response handler
        
    Raises:
        asyncio.TimeoutError: If the operation times out
        Exception: If the response handler raises an exception
    """
    # Ensure we have a correlation ID for the response
    if not message.correlation_id:
        message.correlation_id = f"req_{uuid4().hex[:8]}"
    
    # Send the message and wait for a response
    ack = await send_and_wait(send_func, message, timeout=timeout, **kwargs)
    
    # Process the response
    result = await response_handler(ack)
    
    # If the handler returns None, check if there was an error
    if result is None and ack.error:
        error_msg = ack.error.get("message", "Unknown error")
        error_type = ack.error.get("type", "Error")
        raise Exception(f"{error_type}: {error_msg}")
    
    # Return the result
    return cast(T, result)


# Channel Utilities

def get_channel_by_type(
    channels: Dict[str, BaseChannel],
    channel_type: Union[str, ChannelType],
    preferred_channel: Optional[str] = None
) -> Optional[BaseChannel]:
    """
    Get a channel by type, optionally preferring a specific channel ID.
    
    Args:
        channels: Dictionary of available channels
        channel_type: Type of channel to find
        preferred_channel: Preferred channel ID (if any)
        
    Returns:
        Optional[BaseChannel]: The matching channel, or None if not found
    """
    if isinstance(channel_type, str):
        try:
            channel_type = ChannelType(channel_type.lower())
        except ValueError:
            return None
    
    # Check preferred channel first
    if preferred_channel and preferred_channel in channels:
        channel = channels[preferred_channel]
        if channel.channel_type == channel_type:
            return channel
    
    # Find first matching channel by type
    for channel in channels.values():
        if channel.channel_type == channel_type:
            return channel
    
    return None


async def broadcast_to_channels(
    channels: Dict[str, BaseChannel],
    message: Message,
    channel_type: Optional[Union[str, ChannelType]] = None,
    exclude: Optional[List[str]] = None
) -> Dict[str, MessageAck]:
    """
    Broadcast a message to multiple channels.
    
    Args:
        channels: Dictionary of channels to broadcast to
        message: Message to broadcast
        channel_type: Optional channel type filter
        exclude: List of channel IDs to exclude
        
    Returns:
        Dict[str, MessageAck]: Mapping of channel IDs to acknowledgments
    """
    results = {}
    
    for channel_id, channel in channels.items():
        # Skip excluded channels
        if exclude and channel_id in exclude:
            continue
            
        # Skip if channel type doesn't match
        if channel_type is not None:
            if isinstance(channel_type, str):
                if channel.channel_type != channel_type:
                    continue
            elif channel.channel_type != channel_type.value:
                continue
        
        try:
            ack = await channel.send_message(message)
            results[channel_id] = ack
        except Exception as e:
            logger.error(f"Failed to send message to channel {channel_id}: {str(e)}")
            results[channel_id] = MessageAck(
                message_id=message.id,
                status="failed",
                error={"type": type(e).__name__, "message": str(e)}
            )
    
    return results


# Serialization Utilities

def message_to_dict(message: Message) -> Dict[str, Any]:
    """
    Convert a Message to a dictionary.
    
    Args:
        message: Message to convert
        
    Returns:
        Dict[str, Any]: Dictionary representation of the message
    """
    return message.dict()


def message_from_dict(data: Dict[str, Any]) -> Message:
    """
    Create a Message from a dictionary.
    
    Args:
        data: Dictionary containing message data
        
    Returns:
        Message: The created message
    """
    return Message(**data)


def message_to_json(message: Message, **kwargs) -> str:
    """
    Convert a Message to a JSON string.
    
    Args:
        message: Message to convert
        **kwargs: Additional arguments for json.dumps
        
    Returns:
        str: JSON string representation of the message
    """
    return message.json(**kwargs)


def message_from_json(json_str: str) -> Message:
    """
    Create a Message from a JSON string.
    
    Args:
        json_str: JSON string containing message data
        
    Returns:
        Message: The created message
    """
    return Message.parse_raw(json_str)


# Subscription Utilities

def create_subscription(
    topic: str,
    callback: Callable[[Message, Dict[str, Any]], Awaitable[None]],
    channel_type: Optional[Union[str, ChannelType]] = None,
    **kwargs
) -> Subscription:
    """
    Create a subscription object.
    
    Args:
        topic: Topic or pattern to subscribe to
        callback: Callback function for incoming messages
        channel_type: Optional channel type filter
        **kwargs: Additional subscription options
        
    Returns:
        Subscription: The created subscription
    """
    return Subscription(
        topic=topic,
        channel_type=channel_type,
        callback=callback.__name__ if hasattr(callback, '__name__') else 'anonymous',
        metadata=kwargs
    )


# Error Handling Utilities

class CommunicationError(Exception):
    """Base class for communication errors."""
    pass


class MessageDeliveryError(CommunicationError):
    """Raised when a message cannot be delivered."""
    def __init__(self, message: str, ack: Optional[MessageAck] = None):
        self.ack = ack
        super().__init__(message)


class TimeoutError(CommunicationError, asyncio.TimeoutError):
    """Raised when a communication operation times out."""
    pass


async def handle_communication_errors(
    coro: Awaitable[T],
    error_mapping: Optional[Dict[Type[Exception], Callable[[Exception], Awaitable[None]]]] = None,
    default_error_handler: Optional[Callable[[Exception], Awaitable[None]]] = None
) -> T:
    """
    Execute a coroutine and handle communication errors.
    
    Args:
        coro: The coroutine to execute
        error_mapping: Mapping of exception types to handler functions
        default_error_handler: Default error handler for unhandled exceptions
        
    Returns:
        The result of the coroutine
        
    Raises:
        Exception: If no handler is found for the exception
    """
    error_mapping = error_mapping or {}
    
    try:
        return await coro
    except Exception as e:
        # Find a handler for this exception type
        for exc_type, handler in error_mapping.items():
            if isinstance(e, exc_type):
                await handler(e)
                return None
        
        # Use default handler if available
        if default_error_handler is not None:
            await default_error_handler(e)
            return None
            
        # Re-raise if no handler was found
        raise
