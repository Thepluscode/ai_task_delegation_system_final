"""AI Agents module for the AI Automation Platform.

This module provides the core components for creating and managing AI agents
that can perform autonomous tasks, make decisions, and interact with other
system components.
"""

from .base import BaseAgent, AgentState, AgentCapability, AgentRole
from .manager import AgentManager
from .registry import AgentRegistry
from .types import AgentConfig, AgentStatus, AgentEvent

__all__ = [
    'BaseAgent',
    'AgentState',
    'AgentCapability',
    'AgentRole',
    'AgentManager',
    'AgentRegistry',
    'AgentConfig',
    'AgentStatus',
    'AgentEvent',
]
