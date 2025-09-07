"""
Core data models for the AI Task Delegation System
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class TaskStatus(Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class AgentStatus(Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"
    MAINTENANCE = "MAINTENANCE"

class AgentType(Enum):
    ROBOT = "ROBOT"
    HUMAN = "HUMAN"
    AI_SYSTEM = "AI_SYSTEM"

@dataclass
class Task:
    task_id: str
    task_type: str
    priority: str = "MEDIUM"
    complexity: float = 0.5
    estimated_duration: int = 60  # minutes
    quality_requirements: float = 0.8
    safety_requirements: float = 0.8
    location: str = "default"
    status: str = "PENDING"
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    deadline: Optional[datetime] = None
    parameters: Optional[Dict[str, Any]] = None
    required_capabilities: Optional[List[str]] = None
    actual_duration: Optional[int] = None
    quality_score: Optional[float] = None

@dataclass
class Agent:
    agent_id: str
    name: str
    type: str = "ROBOT"
    status: str = "AVAILABLE"
    capabilities: Optional[List[str]] = None
    current_workload: float = 0.0
    location: str = "default"
    energy_consumption: float = 0.5
    safety_rating: float = 0.9
    performance_score: float = 0.8

@dataclass
class Assignment:
    assignment_id: str
    task_id: str
    agent_id: str
    assigned_at: datetime = field(default_factory=datetime.now)
    confidence_score: float = 0.8
    assignment_method: str = "manual"
    optimization_weights: Optional[Dict[str, float]] = None
    industry_context: Optional[str] = None

@dataclass
class Workflow:
    workflow_id: str
    name: str
    industry: str
    status: str = "PENDING"
    created_at: datetime = field(default_factory=datetime.now)
    steps: List[Dict] = field(default_factory=list)
