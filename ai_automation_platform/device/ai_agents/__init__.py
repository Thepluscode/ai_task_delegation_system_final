# ai_automation_platform/ai_agents/__init__.py
from .base_agent import BaseAgent
from .task_agent import TaskAgent, TaskDefinition, TaskStatus
from .supervisor_agent import SupervisorAgent
from .orchestrator_agent import OrchestratorAgent
from .llm_agent import LLMAgent
from .sensor_agent import SensorAgent
from .agent_manager import AgentManager
from .task_handlers import task_registry, TaskHandler, TaskRegistry

__all__ = [
    # Base classes
    'BaseAgent',
    'TaskAgent',
    'TaskDefinition',
    'TaskStatus',
    'SensorAgent',
    'AgentManager',
    'task_registry',
    'TaskHandler',
    'TaskRegistry',
    
    # Backward compatibility
    'SupervisorAgent',
    'OrchestratorAgent',
    'LLMAgent'
]