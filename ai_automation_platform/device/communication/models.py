"""Communication models for the AI Automation Platform."""
from enum import Enum, auto
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel, Field, validator


class MessageType(str, Enum):
    """Types of messages in the system."""
    COMMAND = "command"
    EVENT = "event"
    DATA = "data"
    REQUEST = "request"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    HEARTBEAT = "heartbeat"
    ERROR = "error"


class MessagePriority(str, Enum):
    """Message priority levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class MessageStatus(str, Enum):
    """Message status in the delivery lifecycle."""
    CREATED = "created"
    QUEUED = "queued"
    SENDING = "sending"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    RETRYING = "retrying"
    EXPIRED = "expired"


class MessageDirection(str, Enum):
    """Direction of the message flow."""
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    INTERNAL = "internal"


class ChannelType(str, Enum):
    """Types of communication channels."""
    WEBSOCKET = "websocket"
    MQTT = "mqtt"
    HTTP = "http"
    GRPC = "grpc"
    ZEROMQ = "zeromq"
    REDIS = "redis"
    KAFKA = "kafka"
    RABBITMQ = "rabbitmq"
    TCP = "tcp"
    UDP = "udp"
    SERIAL = "serial"


class DeliveryStatus(str, Enum):
    """Status of message delivery."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class Message(BaseModel):
    """Base message model for all communications."""
    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique message ID")
    type: MessageType = Field(..., description="Type of the message")
    priority: MessagePriority = Field(default=MessagePriority.NORMAL, description="Message priority")
    
    # Sender and receiver information
    sender: Dict[str, str] = Field(..., description="Sender information")
    receiver: Dict[str, str] = Field(..., description="Receiver information")
    
    # Message content
    payload: Dict[str, Any] = Field(default_factory=dict, description="Message payload")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Message metadata")
    
    # Timing information
    created_at: datetime = Field(default_factory=datetime.utcnow, description="When the message was created")
    sent_at: Optional[datetime] = Field(None, description="When the message was sent")
    delivered_at: Optional[datetime] = Field(None, description="When the message was delivered")
    read_at: Optional[datetime] = Field(None, description="When the message was read")
    
    # Status tracking
    status: MessageStatus = Field(default=MessageStatus.CREATED, description="Current message status")
    direction: MessageDirection = Field(..., description="Message direction")
    channel: Optional[str] = Field(None, description="Channel used for this message")
    
    # For command/response pattern
    correlation_id: Optional[str] = Field(None, description="Correlation ID for request/response")
    reply_to: Optional[str] = Field(None, description="Address to send the response to")
    
    # For error handling
    error: Optional[Dict[str, Any]] = Field(None, description="Error details if applicable")
    
    # TTL in seconds (None means no expiration)
    ttl: Optional[float] = Field(None, description="Time to live in seconds")
    
    # Retry information
    retry_count: int = Field(default=0, description="Number of retry attempts")
    max_retries: int = Field(default=3, description="Maximum number of retry attempts")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        use_enum_values = True
    
    @validator('sender', 'receiver')
    def validate_participant(cls, v):
        """Validate that participant has required fields."""
        required = {'id', 'type'}
        if not all(field in v for field in required):
            raise ValueError(f"Participant must contain {required} fields")
        return v
    
    def is_expired(self) -> bool:
        """Check if the message has expired."""
        if self.ttl is None:
            return False
        elapsed = (datetime.utcnow() - self.created_at).total_seconds()
        return elapsed > self.ttl
    
    def mark_sent(self) -> None:
        """Mark the message as sent."""
        self.sent_at = datetime.utcnow()
        self.status = MessageStatus.SENDING
    
    def mark_delivered(self) -> None:
        """Mark the message as delivered."""
        self.delivered_at = datetime.utcnow()
        self.status = MessageStatus.DELIVERED
    
    def mark_read(self) -> None:
        """Mark the message as read."""
        self.read_at = datetime.utcnow()
        self.status = MessageStatus.READ
    
    def mark_failed(self, error: Optional[Exception] = None) -> None:
        """Mark the message as failed."""
        self.status = MessageStatus.FAILED
        if error is not None:
            self.error = {
                "type": error.__class__.__name__,
                "message": str(error)
            }
    
    def should_retry(self) -> bool:
        """Check if the message should be retried."""
        return (
            self.retry_count < self.max_retries and 
            self.status in [MessageStatus.FAILED, MessageStatus.RETRYING]
        )
    
    def prepare_for_retry(self) -> None:
        """Prepare the message for a retry attempt."""
        if self.should_retry():
            self.retry_count += 1
            self.status = MessageStatus.RETRYING
            self.sent_at = None
            self.delivered_at = None
            self.read_at = None
            self.error = None


class MessageBatch(BaseModel):
    """A batch of messages to be sent together."""
    id: str = Field(default_factory=lambda: str(uuid4()), description="Batch ID")
    messages: List[Message] = Field(default_factory=list, description="Messages in the batch")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="When the batch was created")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Batch metadata")
    
    def add_message(self, message: Message) -> None:
        """Add a message to the batch."""
        self.messages.append(message)
    
    def __len__(self) -> int:
        """Get the number of messages in the batch."""
        return len(self.messages)


class MessageAck(BaseModel):
    """Acknowledgement for a received message."""
    message_id: str = Field(..., description="ID of the message being acknowledged")
    status: DeliveryStatus = Field(..., description="Delivery status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the ack was created")
    error: Optional[Dict[str, Any]] = Field(None, description="Error details if status is failed")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        use_enum_values = True


class Subscription(BaseModel):
    """Subscription to a message topic or pattern."""
    id: str = Field(default_factory=lambda: str(uuid4()), description="Subscription ID")
    topic: str = Field(..., description="Topic or pattern to subscribe to")
    channel_type: ChannelType = Field(..., description="Type of channel for this subscription")
    callback: str = Field(..., description="Callback function to handle messages")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="When the subscription was created")
    active: bool = Field(default=True, description="Whether the subscription is active")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Subscription metadata")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        use_enum_values = True


class MessageQueueStats(BaseModel):
    """Statistics for a message queue."""
    queue_name: str = Field(..., description="Name of the queue")
    message_count: int = Field(0, description="Current number of messages in the queue")
    consumer_count: int = Field(0, description="Number of active consumers")
    avg_processing_time: float = Field(0.0, description="Average processing time in seconds")
    error_rate: float = Field(0.0, description="Error rate (0.0 to 1.0)")
    last_processed_at: Optional[datetime] = Field(None, description="When the last message was processed")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional statistics")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        use_enum_values = True
