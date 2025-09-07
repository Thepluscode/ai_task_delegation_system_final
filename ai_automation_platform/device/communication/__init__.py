"""Communication module for the AI Automation Platform."""

from .manager import CommunicationManager
from .models import (
    Message,
    MessageType,
    MessagePriority,
    MessageStatus,
    MessageDirection,
    ChannelType,
    DeliveryStatus
)
from .channels import (
    BaseChannel,
    WebSocketChannel,
    MQTTChannel,
    HTTPChannel,
    GRPCChannel
)
from .handlers import (
    BaseMessageHandler,
    CommandHandler,
    EventHandler,
    DataHandler
)

__all__ = [
    'CommunicationManager',
    'Message',
    'MessageType',
    'MessagePriority',
    'MessageStatus',
    'MessageDirection',
    'ChannelType',
    'DeliveryStatus',
    'BaseChannel',
    'WebSocketChannel',
    'MQTTChannel',
    'HTTPChannel',
    'GRPCChannel',
    'BaseMessageHandler',
    'CommandHandler',
    'EventHandler',
    'DataHandler'
]
