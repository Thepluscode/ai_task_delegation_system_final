"""Communication manager for the AI Automation Platform."""
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Callable, Awaitable, Union
from uuid import uuid4

from .models import (
    Message,
    MessageType,
    MessagePriority,
    MessageStatus,
    MessageDirection,
    ChannelType,
    MessageAck,
    Subscription,
    MessageBatch,
    MessageQueueStats
)
from .channels import (
    BaseChannel,
    WebSocketChannel,
    MQTTChannel
)

logger = logging.getLogger(__name__)

class CommunicationManager:
    """
    Centralized communication manager for handling all messaging between components.
    
    This class provides a unified interface for sending and receiving messages
    across different communication channels.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the communication manager.
        
        Args:
            config: Configuration dictionary for the communication manager
        """
        self.config = config or {}
        self._channels: Dict[str, BaseChannel] = {}
        self._message_handlers = {}
        self._subscriptions: Dict[str, Dict[str, Any]] = {}
        self._is_running = False
        self._lock = asyncio.Lock()
        
        # Message queues
        self._incoming_queue: asyncio.Queue = asyncio.Queue()
        self._outgoing_queue: asyncio.Queue = asyncio.Queue()
        
        # Statistics
        self.messages_sent = 0
        self.messages_received = 0
        self.messages_failed = 0
        self.bytes_sent = 0
        self.bytes_received = 0
    
    # Channel Management
    
    async def add_channel(self, 
                         channel_id: str, 
                         channel_type: Union[str, ChannelType],
                         config: Optional[Dict[str, Any]] = None) -> BaseChannel:
        """
        Add a communication channel.
        
        Args:
            channel_id: Unique identifier for the channel
            channel_type: Type of the channel (e.g., 'websocket', 'mqtt')
            config: Channel-specific configuration
            
        Returns:
            BaseChannel: The created channel instance
            
        Raises:
            ValueError: If the channel ID is already in use or the channel type is invalid
        """
        if channel_id in self._channels:
            raise ValueError(f"Channel with ID '{channel_id}' already exists")
            
        # Convert string channel type to enum if needed
        if isinstance(channel_type, str):
            try:
                channel_type = ChannelType(channel_type.lower())
            except ValueError as e:
                raise ValueError(f"Invalid channel type: {channel_type}") from e
        
        # Create the appropriate channel instance
        channel_class = self._get_channel_class(channel_type)
        channel = channel_class(
            channel_id=channel_id,
            config=config or {},
            on_message=self._handle_incoming_message
        )
        
        # Add the channel
        self._channels[channel_id] = channel
        
        # Connect the channel if the manager is running
        if self._is_running:
            await channel.connect()
            
        logger.info(f"Added {channel_type.value} channel: {channel_id}")
        return channel
    
    def _get_channel_class(self, channel_type: ChannelType) -> type:
        """
        Get the channel class for the given channel type.
        
        Args:
            channel_type: Type of the channel
            
        Returns:
            type: Channel class
            
        Raises:
            ValueError: If the channel type is not supported
        """
        channel_classes = {
            ChannelType.WEBSOCKET: WebSocketChannel,
            ChannelType.MQTT: MQTTChannel,
            # Add more channel types as needed
        }
        
        if channel_type not in channel_classes:
            raise ValueError(f"Unsupported channel type: {channel_type}")
            
        return channel_classes[channel_type]
    
    async def remove_channel(self, channel_id: str) -> bool:
        """
        Remove a communication channel.
        
        Args:
            channel_id: ID of the channel to remove
            
        Returns:
            bool: True if the channel was removed, False if not found
        """
        if channel_id not in self._channels:
            return False
            
        # Disconnect the channel
        channel = self._channels[channel_id]
        await channel.disconnect()
        
        # Remove the channel
        del self._channels[channel_id]
        
        logger.info(f"Removed channel: {channel_id}")
        return True
    
    def get_channel(self, channel_id: str) -> Optional[BaseChannel]:
        """
        Get a channel by ID.
        
        Args:
            channel_id: ID of the channel to get
            
        Returns:
            Optional[BaseChannel]: The channel instance, or None if not found
        """
        return self._channels.get(channel_id)
    
    def get_channels(self) -> Dict[str, BaseChannel]:
        """
        Get all channels.
        
        Returns:
            Dict[str, BaseChannel]: Mapping of channel IDs to channel instances
        """
        return self._channels.copy()
    
    # Message Handling
    
    async def send_message(self, 
                          message: Union[Message, Dict[str, Any]],
                          channel_id: Optional[str] = None,
                          **kwargs) -> MessageAck:
        """
        Send a message through the specified channel or all channels.
        
        Args:
            message: Message to send (can be a Message object or a dict)
            channel_id: ID of the channel to use (None for all channels)
            **kwargs: Additional arguments for the send operation
            
        Returns:
            MessageAck: Acknowledgement of the message
        """
        # Convert dict to Message if needed
        if isinstance(message, dict):
            message = Message(**message)
            
        # Set default values if not provided
        if not message.id:
            message.id = str(uuid4())
            
        if not message.created_at:
            message.created_at = asyncio.get_event_loop().time()
            
        # If no channel is specified, send to all channels
        if channel_id is None:
            if not self._channels:
                return MessageAck(
                    message_id=message.id,
                    status="failed",
                    error={"message": "No channels available"}
                )
                
            # Send to all channels and collect results
            results = []
            for ch_id, channel in self._channels.items():
                try:
                    ack = await self._send_via_channel(channel, message, **kwargs)
                    results.append(ack)
                except Exception as e:
                    logger.error(f"Failed to send message via channel {ch_id}: {str(e)}")
                    results.append(MessageAck(
                        message_id=message.id,
                        status="failed",
                        error={"channel": ch_id, "message": str(e)}
                    ))
            
            # Return a combined ack
            if any(ack.status == "delivered" for ack in results):
                return MessageAck(
                    message_id=message.id,
                    status="delivered",
                    metadata={"channel_acks": [ack.dict() for ack in results]}
                )
            else:
                return MessageAck(
                    message_id=message.id,
                    status="failed",
                    error={"message": "Message delivery failed on all channels"},
                    metadata={"channel_acks": [ack.dict() for ack in results]}
                )
        else:
            # Send via the specified channel
            channel = self._channels.get(channel_id)
            if not channel:
                return MessageAck(
                    message_id=message.id,
                    status="failed",
                    error={"message": f"Channel not found: {channel_id}"}
                )
                
            return await self._send_via_channel(channel, message, **kwargs)
    
    async def _send_via_channel(self, 
                              channel: BaseChannel, 
                              message: Message,
                              **kwargs) -> MessageAck:
        """
        Send a message via a specific channel.
        
        Args:
            channel: Channel to send the message through
            message: Message to send
            **kwargs: Additional arguments for the send operation
            
        Returns:
            MessageAck: Acknowledgement of the message
        """
        try:
            # Ensure the channel is connected
            if not channel.is_connected:
                await channel.connect()
                
            # Send the message
            ack = await channel.send_message(message, **kwargs)
            
            # Update statistics
            self.messages_sent += 1
            self.bytes_sent += len(str(message.dict()))
            
            return ack
            
        except Exception as e:
            self.messages_failed += 1
            logger.error(f"Error sending message via channel {channel.channel_id}: {str(e)}", exc_info=True)
            return MessageAck(
                message_id=message.id,
                status="failed",
                error={"type": type(e).__name__, "message": str(e)}
            )
    
    async def broadcast(self, 
                       messages: List[Union[Message, Dict[str, Any]]],
                       channel_id: Optional[str] = None,
                       **kwargs) -> List[MessageAck]:
        """
        Send multiple messages.
        
        Args:
            messages: List of messages to send
            channel_id: ID of the channel to use (None for all channels)
            **kwargs: Additional arguments for the send operation
            
        Returns:
            List[MessageAck]: Acknowledgements for the sent messages
        """
        tasks = []
        for msg in messages:
            tasks.append(self.send_message(msg, channel_id=channel_id, **kwargs))
            
        return await asyncio.gather(*tasks, return_exceptions=False)
    
    async def _handle_incoming_message(self, message: Message, **kwargs) -> None:
        """
        Handle an incoming message from any channel.
        
        Args:
            message: The incoming message
            **kwargs: Additional context
        """
        try:
            # Update statistics
            self.messages_received += 1
            self.bytes_received += len(str(message.dict()))
            
            # Add to incoming queue for processing
            await self._incoming_queue.put((message, kwargs))
            
        except Exception as e:
            logger.error(f"Error handling incoming message: {str(e)}", exc_info=True)
    
    async def _process_incoming_messages(self) -> None:
        """Background task to process incoming messages."""
        while self._is_running:
            try:
                # Get the next message from the queue
                message, context = await self._incoming_queue.get()
                
                # Process the message
                await self._dispatch_message(message, context)
                
                # Mark the task as done
                self._incoming_queue.task_done()
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in message processing loop: {str(e)}", exc_info=True)
                await asyncio.sleep(1)  # Prevent tight loop on errors
    
    async def _dispatch_message(self, message: Message, context: Dict[str, Any]) -> None:
        """
        Dispatch a message to the appropriate handlers.
        
        Args:
            message: The message to dispatch
            context: Additional context for the message
        """
        handlers = self._message_handlers.get(message.type, [])
        
        # Also get handlers for the specific message ID if it exists
        if message.id and message.id in self._message_handlers:
            handlers.extend(self._message_handlers[message.id])
            
        if not handlers:
            logger.debug(f"No handlers registered for message type: {message.type}")
            return
            
        # Call all matching handlers
        tasks = []
        for handler in handlers:
            try:
                tasks.append(handler(message, **context))
            except Exception as e:
                logger.error(f"Error in message handler: {str(e)}", exc_info=True)
                
        # Run all handlers concurrently
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    # Subscription Management
    
    async def subscribe(self, 
                       topic: str, 
                       handler: Callable[[Message, Dict[str, Any]], Awaitable[None]],
                       channel_id: Optional[str] = None,
                       **kwargs) -> str:
        """
        Subscribe to a topic or pattern.
        
        Args:
            topic: Topic or pattern to subscribe to
            handler: Async function to call when a matching message is received
            channel_id: ID of the channel to use (None for all channels)
            **kwargs: Additional subscription options
            
        Returns:
            str: Subscription ID
            
        Raises:
            ValueError: If no channels are available or the specified channel is not found
        """
        subscription_id = f"sub_{uuid4().hex[:8]}"
        
        # Determine which channels to subscribe to
        if channel_id is not None:
            if channel_id not in self._channels:
                raise ValueError(f"Channel not found: {channel_id}")
            channels = {channel_id: self._channels[channel_id]}
        else:
            if not self._channels:
                raise ValueError("No channels available for subscription")
            channels = self._channels
        
        # Create the subscription
        self._subscriptions[subscription_id] = {
            "topic": topic,
            "handler": handler,
            "channel_ids": list(channels.keys()),
            "created_at": asyncio.get_event_loop().time(),
            **kwargs
        }
        
        # Subscribe on each channel
        for ch_id, channel in channels.items():
            try:
                await channel.subscribe(topic, handler, **kwargs)
                logger.debug(f"Subscribed to {topic} on channel {ch_id}")
            except Exception as e:
                logger.error(f"Failed to subscribe to {topic} on channel {ch_id}: {str(e)}")
                # Continue with other channels even if one fails
                
        return subscription_id
    
    async def unsubscribe(self, subscription_id: str) -> bool:
        """
        Unsubscribe from a topic.
        
        Args:
            subscription_id: ID of the subscription to remove
            
        Returns:
            bool: True if unsubscribed successfully, False if not found
        """
        if subscription_id not in self._subscriptions:
            return False
            
        sub = self._subscriptions[subscription_id]
        
        # Unsubscribe from each channel
        for ch_id in sub["channel_ids"]:
            if ch_id in self._channels:
                try:
                    await self._channels[ch_id].unsubscribe(sub["topic"])
                    logger.debug(f"Unsubscribed from {sub['topic']} on channel {ch_id}")
                except Exception as e:
                    logger.error(f"Failed to unsubscribe from {sub['topic']} on channel {ch_id}: {str(e)}")
        
        # Remove the subscription
        del self._subscriptions[subscription_id]
        return True
    
    # Lifecycle Management
    
    async def start(self) -> None:
        """Start the communication manager and all channels."""
        if self._is_running:
            return
            
        self._is_running = True
        
        # Start all channels
        for channel in self._channels.values():
            try:
                await channel.connect()
            except Exception as e:
                logger.error(f"Failed to start channel {channel.channel_id}: {str(e)}")
        
        # Start the message processing task
        self._process_task = asyncio.create_task(self._process_incoming_messages())
        
        logger.info("Communication manager started")
    
    async def stop(self) -> None:
        """Stop the communication manager and all channels."""
        if not self._is_running:
            return
            
        self._is_running = False
        
        # Cancel the processing task
        if hasattr(self, '_process_task') and not self._process_task.done():
            self._process_task.cancel()
            try:
                await self._process_task
            except asyncio.CancelledError:
                pass
        
        # Stop all channels
        for channel in self._channels.values():
            try:
                await channel.disconnect()
            except Exception as e:
                logger.error(f"Error stopping channel {channel.channel_id}: {str(e)}")
        
        logger.info("Communication manager stopped")
    
    # Context manager support
    
    async def __aenter__(self):
        """Context manager entry."""
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.stop()
    
    # Statistics and Monitoring
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get communication statistics.
        
        Returns:
            Dict[str, Any]: Statistics including message counts and channel status
        """
        return {
            "messages_sent": self.messages_sent,
            "messages_received": self.messages_received,
            "messages_failed": self.messages_failed,
            "bytes_sent": self.bytes_sent,
            "bytes_received": self.bytes_received,
            "channels": {
                ch_id: {
                    "type": ch.channel_type,
                    "connected": ch.is_connected,
                    "messages_sent": ch.messages_sent,
                    "messages_received": ch.messages_received,
                    "errors": ch.errors
                }
                for ch_id, ch in self._channels.items()
            },
            "subscriptions": {
                sub_id: {
                    "topic": sub["topic"],
                    "channels": sub["channel_ids"],
                    "created_at": sub["created_at"]
                }
                for sub_id, sub in self._subscriptions.items()
            }
        }
    
    # Message Handler Registration
    
    def add_message_handler(self, 
                           message_type: str, 
                           handler: Callable[[Message, Dict[str, Any]], Awaitable[None]]) -> None:
        """
        Register a handler for a specific message type.
        
        Args:
            message_type: Type of message to handle
            handler: Async function to handle the message
        """
        if message_type not in self._message_handlers:
            self._message_handlers[message_type] = []
            
        if handler not in self._message_handlers[message_type]:
            self._message_handlers[message_type].append(handler)
            logger.debug(f"Added handler for message type: {message_type}")
    
    def remove_message_handler(self, 
                             message_type: str, 
                             handler: Callable[[Message, Dict[str, Any]], Awaitable[None]]) -> bool:
        """
        Remove a message handler.
        
        Args:
            message_type: Type of message
            handler: Handler function to remove
            
        Returns:
            bool: True if the handler was removed, False if not found
        """
        if message_type not in self._message_handlers:
            return False
            
        try:
            self._message_handlers[message_type].remove(handler)
            
            # Clean up if no more handlers for this type
            if not self._message_handlers[message_type]:
                del self._message_handlers[message_type]
                
            logger.debug(f"Removed handler for message type: {message_type}")
            return True
            
        except ValueError:
            return False
