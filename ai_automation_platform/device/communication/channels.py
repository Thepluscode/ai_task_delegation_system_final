"""Communication channel implementations for the AI Automation Platform."""
from abc import ABC, abstractmethod
import asyncio
import json
import logging
from typing import Any, Callable, Dict, List, Optional, Union, Awaitable

from .models import (
    Message,
    MessageType,
    MessageStatus,
    ChannelType,
    MessageAck,
    Subscription
)

logger = logging.getLogger(__name__)

class BaseChannel(ABC):
    """Base class for all communication channels."""
    
    def __init__(self, 
                 channel_id: str, 
                 config: Dict[str, Any],
                 on_message: Optional[Callable[[Message], Awaitable[None]]] = None):
        """
        Initialize the communication channel.
        
        Args:
            channel_id: Unique identifier for this channel
            config: Configuration dictionary for the channel
            on_message: Callback for handling incoming messages
        """
        self.channel_id = channel_id
        self.config = config
        self.on_message = on_message
        self.is_connected = False
        self._message_handlers = {}
        self._subscriptions = {}
        self._connection_lock = asyncio.Lock()
        
        # Statistics
        self.messages_sent = 0
        self.messages_received = 0
        self.errors = 0
    
    @property
    @abstractmethod
    def channel_type(self) -> ChannelType:
        """Get the type of this channel."""
        pass
    
    async def connect(self) -> bool:
        """
        Connect to the channel.
        
        Returns:
            bool: True if connection was successful
        """
        if self.is_connected:
            return True
            
        async with self._connection_lock:
            try:
                await self._connect_impl()
                self.is_connected = True
                logger.info(f"Connected to {self.channel_type.value} channel {self.channel_id}")
                return True
            except Exception as e:
                logger.error(f"Failed to connect to {self.channel_type.value} channel {self.channel_id}: {str(e)}")
                self.is_connected = False
                return False
    
    @abstractmethod
    async def _connect_impl(self) -> None:
        """Implementation of the connection logic."""
        pass
    
    async def disconnect(self) -> None:
        """Disconnect from the channel."""
        if not self.is_connected:
            return
            
        async with self._connection_lock:
            try:
                await self._disconnect_impl()
                logger.info(f"Disconnected from {self.channel_type.value} channel {self.channel_id}")
            except Exception as e:
                logger.error(f"Error disconnecting from {self.channel_type.value} channel {self.channel_id}: {str(e)}")
            finally:
                self.is_connected = False
    
    @abstractmethod
    async def _disconnect_impl(self) -> None:
        """Implementation of the disconnection logic."""
        pass
    
    async def send_message(self, message: Union[Message, Dict[str, Any]], **kwargs) -> MessageAck:
        """
        Send a message through the channel.
        
        Args:
            message: Message to send (can be a Message object or a dict)
            **kwargs: Additional arguments for the send operation
            
        Returns:
            MessageAck: Acknowledgement of the message
        """
        if not self.is_connected:
            await self.connect()
        
        # Convert dict to Message if needed
        if isinstance(message, dict):
            message = Message(**message)
        
        # Set default values if not provided
        if not message.sender:
            message.sender = {"id": self.channel_id, "type": self.channel_type.value}
        
        try:
            # Mark the message as sending
            message.mark_sent()
            
            # Send the message
            result = await self._send_impl(message, **kwargs)
            
            # Update statistics
            self.messages_sent += 1
            
            return MessageAck(
                message_id=message.id,
                status="delivered",
                metadata={"channel": self.channel_id}
            )
            
        except Exception as e:
            self.errors += 1
            logger.error(f"Failed to send message {message.id}: {str(e)}", exc_info=True)
            return MessageAck(
                message_id=message.id if hasattr(message, 'id') else 'unknown',
                status="failed",
                error={"type": type(e).__name__, "message": str(e)},
                metadata={"channel": self.channel_id}
            )
    
    @abstractmethod
    async def _send_impl(self, message: Message, **kwargs) -> Any:
        """
        Implementation of the message sending logic.
        
        Args:
            message: Message to send
            **kwargs: Additional arguments
            
        Returns:
            Any: Result of the send operation
        """
        pass
    
    async def broadcast(self, messages: List[Message], **kwargs) -> List[MessageAck]:
        """
        Send multiple messages through the channel.
        
        Args:
            messages: List of messages to send
            **kwargs: Additional arguments for the send operation
            
        Returns:
            List[MessageAck]: Acknowledgements for the sent messages
        """
        if not self.is_connected:
            await self.connect()
            
        results = []
        for message in messages:
            ack = await self.send_message(message, **kwargs)
            results.append(ack)
            
        return results
    
    async def subscribe(self, topic: str, callback: Callable[[Message], Awaitable[None]], **kwargs) -> str:
        """
        Subscribe to a topic or pattern.
        
        Args:
            topic: Topic or pattern to subscribe to
            callback: Async function to call when a message is received
            **kwargs: Additional subscription options
            
        Returns:
            str: Subscription ID
        """
        if not self.is_connected:
            await self.connect()
            
        subscription_id = f"sub_{len(self._subscriptions) + 1}"
        subscription = Subscription(
            id=subscription_id,
            topic=topic,
            channel_type=self.channel_type,
            callback=callback.__name__ if hasattr(callback, '__name__') else 'anonymous',
            metadata=kwargs
        )
        
        # Store the subscription
        self._subscriptions[subscription_id] = {
            "subscription": subscription,
            "callback": callback
        }
        
        # Perform channel-specific subscription
        await self._subscribe_impl(topic, subscription_id, **kwargs)
        
        logger.info(f"Subscribed to {topic} with ID {subscription_id}")
        return subscription_id
    
    @abstractmethod
    async def _subscribe_impl(self, topic: str, subscription_id: str, **kwargs) -> None:
        """
        Implementation of the subscription logic.
        
        Args:
            topic: Topic or pattern to subscribe to
            subscription_id: ID of the subscription
            **kwargs: Additional subscription options
        """
        pass
    
    async def unsubscribe(self, subscription_id: str) -> bool:
        """
        Unsubscribe from a topic.
        
        Args:
            subscription_id: ID of the subscription to remove
            
        Returns:
            bool: True if unsubscribed successfully
        """
        if subscription_id not in self._subscriptions:
            logger.warning(f"No subscription found with ID {subscription_id}")
            return False
            
        subscription = self._subscriptions[subscription_id]["subscription"]
        
        # Perform channel-specific unsubscription
        await self._unsubscribe_impl(subscription.topic, subscription_id)
        
        # Remove the subscription
        del self._subscriptions[subscription_id]
        
        logger.info(f"Unsubscribed from {subscription.topic} with ID {subscription_id}")
        return True
    
    @abstractmethod
    async def _unsubscribe_impl(self, topic: str, subscription_id: str) -> None:
        """
        Implementation of the unsubscription logic.
        
        Args:
            topic: Topic or pattern to unsubscribe from
            subscription_id: ID of the subscription
        """
        pass
    
    async def handle_incoming_message(self, raw_message: Any, **kwargs) -> None:
        """
        Handle an incoming message from the channel.
        
        Args:
            raw_message: Raw message data from the channel
            **kwargs: Additional context
        """
        try:
            # Convert the raw message to our Message model
            message = self._parse_message(raw_message)
            
            # Update statistics
            self.messages_received += 1
            
            # Mark as delivered
            message.mark_delivered()
            
            # Call the registered message handler if available
            if self.on_message:
                await self.on_message(message)
                
            # Call any matching subscription callbacks
            await self._dispatch_to_subscriptions(message, **kwargs)
            
            # Mark as read if supported by the channel
            if hasattr(self, '_acknowledge_message'):
                await self._acknowledge_message(raw_message)
                
        except Exception as e:
            self.errors += 1
            logger.error(f"Error handling incoming message: {str(e)}", exc_info=True)
    
    def _parse_message(self, raw_message: Any) -> Message:
        """
        Parse a raw message into a Message object.
        
        Args:
            raw_message: Raw message data
            
        Returns:
            Message: Parsed message
        """
        # Default implementation expects a dict or JSON string
        if isinstance(raw_message, str):
            try:
                data = json.loads(raw_message)
            except json.JSONDecodeError:
                data = {"payload": {"raw": raw_message}}
        elif isinstance(raw_message, dict):
            data = raw_message
        else:
            data = {"payload": {"raw": str(raw_message)}}
            
        # Ensure we have required fields
        if "type" not in data:
            data["type"] = "data"  # Default type
            
        # Create the message
        return Message(**data)
    
    async def _dispatch_to_subscriptions(self, message: Message, **kwargs) -> None:
        """
        Dispatch a message to all matching subscriptions.
        
        Args:
            message: Message to dispatch
            **kwargs: Additional context
        """
        tasks = []
        
        for sub_id, sub_info in self._subscriptions.items():
            subscription = sub_info["subscription"]
            callback = sub_info["callback"]
            
            # Simple topic matching (can be overridden in subclasses)
            if self._is_topic_match(subscription.topic, message.metadata.get("topic", "")):
                tasks.append(callback(message, **kwargs))
        
        # Run all callbacks concurrently
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    def _is_topic_match(self, pattern: str, topic: str) -> bool:
        """
        Check if a topic matches a pattern.
        
        Args:
            pattern: Pattern to match against (supports * and # wildcards)
            topic: Topic to check
            
        Returns:
            bool: True if the topic matches the pattern
        """
        # Simple exact match
        if pattern == topic:
            return True
            
        # Simple wildcard matching (can be extended)
        if pattern == "#":
            return True
            
        pattern_parts = pattern.split('/')
        topic_parts = topic.split('/')
        
        for p, t in zip(pattern_parts, topic_parts):
            if p == "#":
                return True
            if p != "*" and p != t:
                return False
                
        return len(pattern_parts) == len(topic_parts)
    
    async def __aenter__(self):
        """Context manager entry."""
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.disconnect()


class WebSocketChannel(BaseChannel):
    """WebSocket communication channel."""
    
    def __init__(self, 
                 channel_id: str, 
                 config: Dict[str, Any],
                 on_message: Optional[Callable[[Message], Awaitable[None]]] = None):
        """
        Initialize the WebSocket channel.
        
        Args:
            channel_id: Unique identifier for this channel
            config: Configuration dictionary
            on_message: Callback for handling incoming messages
        """
        super().__init__(channel_id, config, on_message)
        self.uri = config.get("uri", "ws://localhost:8765")
        self.websocket = None
        self._reconnect_attempts = 0
        self._max_reconnect_attempts = config.get("max_reconnect_attempts", 5)
        self._reconnect_delay = config.get("reconnect_delay", 5.0)
    
    @property
    def channel_type(self) -> str:
        """Get the channel type."""
        return "websocket"
    
    async def _connect_impl(self) -> None:
        """Connect to the WebSocket server."""
        import websockets
        
        try:
            self.websocket = await websockets.connect(
                self.uri,
                ping_interval=30,
                ping_timeout=10,
                close_timeout=5,
                max_queue=1024,
                **self.config.get("websocket_options", {})
            )
            
            # Reset reconnect attempts on successful connection
            self._reconnect_attempts = 0
            
            # Start the receive loop
            asyncio.create_task(self._receive_loop())
            
        except Exception as e:
            logger.error(f"WebSocket connection error: {str(e)}")
            await self._handle_connection_error()
            raise
    
    async def _disconnect_impl(self) -> None:
        """Disconnect from the WebSocket server."""
        if self.websocket:
            await self.websocket.close()
            self.websocket = None
    
    async def _send_impl(self, message: Message, **kwargs) -> None:
        """
        Send a message through the WebSocket.
        
        Args:
            message: Message to send
            **kwargs: Additional arguments
        """
        if not self.websocket:
            raise RuntimeError("WebSocket is not connected")
            
        try:
            await self.websocket.send(message.json())
        except Exception as e:
            logger.error(f"WebSocket send error: {str(e)}")
            await self._handle_connection_error()
            raise
    
    async def _receive_loop(self) -> None:
        """Background task to receive messages from the WebSocket."""
        while self.is_connected and self.websocket:
            try:
                message = await self.websocket.recv()
                await self.handle_incoming_message(message)
            except Exception as e:
                if self.is_connected:  # Only log if we didn't disconnect intentionally
                    logger.error(f"WebSocket receive error: {str(e)}")
                    await self._handle_connection_error()
                break
    
    async def _handle_connection_error(self) -> None:
        """Handle WebSocket connection errors and attempt to reconnect."""
        if self._reconnect_attempts >= self._max_reconnect_attempts:
            logger.error("Max reconnection attempts reached")
            self.is_connected = False
            return
            
        self._reconnect_attempts += 1
        delay = min(self._reconnect_delay * (2 ** (self._reconnect_attempts - 1)), 300)  # Max 5 minutes
        
        logger.info(f"Attempting to reconnect in {delay} seconds (attempt {self._reconnect_attempts}/{self._max_reconnect_attempts})")
        
        await asyncio.sleep(delay)
        
        try:
            await self.connect()
        except Exception as e:
            logger.error(f"Reconnection attempt failed: {str(e)}")
    
    async def _subscribe_impl(self, topic: str, subscription_id: str, **kwargs) -> None:
        """
        Subscribe to a topic.
        
        Args:
            topic: Topic to subscribe to
            subscription_id: ID of the subscription
            **kwargs: Additional subscription options
        """
        # WebSocket subscriptions are handled at the application level
        pass
    
    async def _unsubscribe_impl(self, topic: str, subscription_id: str) -> None:
        """
        Unsubscribe from a topic.
        
        Args:
            topic: Topic to unsubscribe from
            subscription_id: ID of the subscription
        """
        # WebSocket unsubscriptions are handled at the application level
        pass


class MQTTChannel(BaseChannel):
    """MQTT communication channel."""
    
    def __init__(self, 
                 channel_id: str, 
                 config: Dict[str, Any],
                 on_message: Optional[Callable[[Message], Awaitable[None]]] = None):
        """
        Initialize the MQTT channel.
        
        Args:
            channel_id: Unique identifier for this channel
            config: Configuration dictionary
            on_message: Callback for handling incoming messages
        """
        super().__init__(channel_id, config, on_message)
        self.host = config.get("host", "localhost")
        self.port = config.get("port", 1883)
        self.client_id = config.get("client_id", f"mqtt-client-{channel_id}")
        self.username = config.get("username")
        self.password = config.get("password")
        self.clean_session = config.get("clean_session", True)
        self.keepalive = config.get("keepalive", 60)
        self.client = None
    
    @property
    def channel_type(self) -> str:
        """Get the channel type."""
        return "mqtt"
    
    async def _connect_impl(self) -> None:
        """Connect to the MQTT broker."""
        import gmqtt
        
        self.client = gmqtt.Client(self.client_id, clean_session=self.clean_session)
        
        # Set credentials if provided
        if self.username and self.password:
            self.client.set_auth_credentials(self.username, self.password)
        
        # Set up event handlers
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        
        # Connect to the broker
        await self.client.connect(self.host, self.port, keepalive=self.keepalive)
    
    async def _disconnect_impl(self) -> None:
        """Disconnect from the MQTT broker."""
        if self.client:
            await self.client.disconnect()
            self.client = None
    
    async def _send_impl(self, message: Message, **kwargs) -> None:
        """
        Publish a message to an MQTT topic.
        
        Args:
            message: Message to publish
            **kwargs: Additional arguments
        """
        if not self.client:
            raise RuntimeError("MQTT client is not connected")
            
        topic = message.metadata.get("topic", "")
        if not topic:
            raise ValueError("Topic is required for MQTT messages")
            
        qos = kwargs.get("qos", 1)
        retain = kwargs.get("retain", False)
        
        await self.client.publish(
            topic,
            message.json().encode(),
            qos=qos,
            retain=retain
        )
    
    async def _subscribe_impl(self, topic: str, subscription_id: str, **kwargs) -> None:
        """
        Subscribe to an MQTT topic.
        
        Args:
            topic: Topic to subscribe to
            subscription_id: ID of the subscription
            **kwargs: Additional subscription options
        """
        if not self.client:
            raise RuntimeError("MQTT client is not connected")
            
        qos = kwargs.get("qos", 1)
        
        await self.client.subscribe([(topic, qos)])
    
    async def _unsubscribe_impl(self, topic: str, subscription_id: str) -> None:
        """
        Unsubscribe from an MQTT topic.
        
        Args:
            topic: Topic to unsubscribe from
            subscription_id: ID of the subscription
        """
        if not self.client:
            return
            
        await self.client.unsubscribe([topic])
    
    def _on_connect(self, client, flags, rc, properties):
        """Handle MQTT connection event."""
        if rc == 0:
            logger.info(f"Connected to MQTT broker at {self.host}:{self.port}")
        else:
            logger.error(f"Failed to connect to MQTT broker: {rc}")
    
    def _on_disconnect(self, client, packet, exc=None):
        """Handle MQTT disconnection event."""
        logger.info("Disconnected from MQTT broker")
    
    def _on_message(self, client, topic, payload, qos, properties):
        """Handle incoming MQTT message."""
        asyncio.create_task(self.handle_incoming_message(payload, topic=topic, qos=qos, properties=properties))
