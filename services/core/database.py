"""
Database Manager for the AI Task Delegation System
"""

import asyncio
import logging
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import json

from .models import Task, Agent, Assignment

class DatabaseManager:
    """Mock database manager for demonstration"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Mock data storage
        self.tasks: Dict[str, Task] = {}
        self.agents: Dict[str, Agent] = {}
        self.assignments: Dict[str, Assignment] = {}
        
        # Initialize with sample data
        self._initialize_sample_data()
    
    def _initialize_sample_data(self):
        """Initialize with sample agents and tasks"""
        
        # Sample agents
        sample_agents = [
            Agent(
                agent_id="robot_001",
                name="Precision Assembly Robot",
                type="ROBOT",
                status="AVAILABLE",
                capabilities=["precision_assembly", "quality_inspection"],
                current_workload=0.3,
                location="factory_floor_1"
            ),
            Agent(
                agent_id="human_001",
                name="Senior Technician",
                type="HUMAN",
                status="AVAILABLE",
                capabilities=["creative_problem_solving", "quality_inspection"],
                current_workload=0.5,
                location="factory_floor_1"
            ),
            Agent(
                agent_id="ai_system_001",
                name="Data Analysis AI",
                type="AI_SYSTEM",
                status="AVAILABLE",
                capabilities=["data_analysis", "pattern_recognition"],
                current_workload=0.2,
                location="cloud"
            )
        ]
        
        for agent in sample_agents:
            self.agents[agent.agent_id] = agent
    
    async def initialize(self):
        """Initialize database connection"""
        self.logger.info("Database manager initialized")
    
    async def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        return self.tasks.get(task_id)
    
    async def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get agent by ID"""
        return self.agents.get(agent_id)
    
    async def get_all_agents(self) -> List[Agent]:
        """Get all agents"""
        return list(self.agents.values())
    
    async def get_available_agents(self) -> List[Agent]:
        """Get available agents"""
        return [agent for agent in self.agents.values() if agent.status == "AVAILABLE"]
    
    async def get_agents_by_location(self, location: str) -> List[Agent]:
        """Get agents by location"""
        return [agent for agent in self.agents.values() if agent.location == location]
    
    async def get_pending_tasks(self) -> List[Task]:
        """Get pending tasks"""
        return [task for task in self.tasks.values() if task.status == "PENDING"]
    
    async def get_agent_recent_tasks(self, agent_id: str, hours: int = 24) -> List[Task]:
        """Get recent tasks for an agent"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Find assignments for this agent
        agent_assignments = [
            assignment for assignment in self.assignments.values()
            if assignment.agent_id == agent_id and assignment.assigned_at >= cutoff_time
        ]
        
        # Get corresponding tasks
        recent_tasks = []
        for assignment in agent_assignments:
            task = self.tasks.get(assignment.task_id)
            if task:
                recent_tasks.append(task)
        
        return recent_tasks
    
    async def get_completed_assignments_since(self, cutoff_date: datetime) -> List[Assignment]:
        """Get completed assignments since a date"""
        return [
            assignment for assignment in self.assignments.values()
            if assignment.assigned_at >= cutoff_date
        ]
    
    async def get_agent_pending_tasks(self, agent_id: str) -> List[Task]:
        """Get pending tasks for an agent"""
        # Find assignments for this agent
        agent_assignments = [
            assignment for assignment in self.assignments.values()
            if assignment.agent_id == agent_id
        ]
        
        # Get corresponding pending tasks
        pending_tasks = []
        for assignment in agent_assignments:
            task = self.tasks.get(assignment.task_id)
            if task and task.status == "PENDING":
                pending_tasks.append(task)
        
        return pending_tasks
    
    async def store_assignment(self, assignment: Assignment):
        """Store an assignment"""
        self.assignments[assignment.assignment_id] = assignment
        self.logger.info(f"Stored assignment {assignment.assignment_id}")
    
    async def cancel_assignment(self, task_id: str, agent_id: str):
        """Cancel an assignment"""
        # Find and remove the assignment
        assignment_to_remove = None
        for assignment_id, assignment in self.assignments.items():
            if assignment.task_id == task_id and assignment.agent_id == agent_id:
                assignment_to_remove = assignment_id
                break
        
        if assignment_to_remove:
            del self.assignments[assignment_to_remove]
            self.logger.info(f"Cancelled assignment for task {task_id} and agent {agent_id}")
    
    async def update_agent_workload(self, agent_id: str, workload_increase: float):
        """Update agent workload"""
        agent = self.agents.get(agent_id)
        if agent:
            agent.current_workload = min(agent.current_workload + workload_increase, 1.0)
            self.logger.info(f"Updated workload for agent {agent_id} to {agent.current_workload}")
    
    async def store_task(self, task: Task):
        """Store a task"""
        self.tasks[task.task_id] = task
        self.logger.info(f"Stored task {task.task_id}")
    
    async def update_task_status(self, task_id: str, status: str):
        """Update task status"""
        task = self.tasks.get(task_id)
        if task:
            task.status = status
            if status == "IN_PROGRESS" and not task.started_at:
                task.started_at = datetime.now()
            elif status == "COMPLETED" and not task.completed_at:
                task.completed_at = datetime.now()
                if task.started_at:
                    task.actual_duration = int((task.completed_at - task.started_at).total_seconds() / 60)
            
            self.logger.info(f"Updated task {task_id} status to {status}")
