"""
Automated Workflow Orchestrator
Manages automated task routing, load balancing, and workflow optimization
"""

import asyncio
import logging
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json

from ..core.models import Task, Agent, Assignment, Workflow
from ..core.database import DatabaseManager
from ..intelligent_assignment.auto_assignment_engine import IntelligentAutoAssignmentEngine
from ..ml.performance_predictor import PerformancePredictor

class WorkflowStatus(Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

@dataclass
class WorkflowStep:
    step_id: str
    task_template: Dict
    dependencies: List[str] = field(default_factory=list)
    parallel_execution: bool = False
    retry_count: int = 0
    max_retries: int = 3

@dataclass
class AutomatedWorkflow:
    workflow_id: str
    name: str
    industry: str
    steps: List[WorkflowStep]
    status: WorkflowStatus = WorkflowStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    priority: str = "MEDIUM"
    auto_assignment: bool = True
    load_balancing: bool = True

class WorkflowOrchestrator:
    """Automated workflow orchestration and management"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.assignment_engine = IntelligentAutoAssignmentEngine(db_manager)
        self.performance_predictor = PerformancePredictor(db_manager)
        self.logger = logging.getLogger(__name__)
        
        # Active workflows
        self.active_workflows: Dict[str, AutomatedWorkflow] = {}
        self.workflow_tasks: Dict[str, List[Task]] = {}
        
        # Load balancing
        self.agent_load_tracker: Dict[str, float] = {}
        self.task_queue: List[Task] = []
        
        # Automation settings
        self.auto_assignment_enabled = True
        self.load_balancing_enabled = True
        self.max_concurrent_workflows = 50
        
    async def start_orchestrator(self):
        """Start the automated workflow orchestrator"""
        self.logger.info("Starting Workflow Orchestrator...")
        
        # Start background tasks
        tasks = [
            asyncio.create_task(self._workflow_execution_loop()),
            asyncio.create_task(self._load_balancing_loop()),
            asyncio.create_task(self._task_queue_processor()),
            asyncio.create_task(self._performance_monitoring_loop())
        ]
        
        await asyncio.gather(*tasks)
    
    async def create_automated_workflow(self, workflow_config: Dict) -> str:
        """Create a new automated workflow"""
        try:
            workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self.active_workflows)}"
            
            # Parse workflow steps
            steps = []
            for step_config in workflow_config.get("steps", []):
                step = WorkflowStep(
                    step_id=step_config["step_id"],
                    task_template=step_config["task_template"],
                    dependencies=step_config.get("dependencies", []),
                    parallel_execution=step_config.get("parallel_execution", False),
                    max_retries=step_config.get("max_retries", 3)
                )
                steps.append(step)
            
            # Create workflow
            workflow = AutomatedWorkflow(
                workflow_id=workflow_id,
                name=workflow_config["name"],
                industry=workflow_config.get("industry", "manufacturing"),
                steps=steps,
                priority=workflow_config.get("priority", "MEDIUM"),
                auto_assignment=workflow_config.get("auto_assignment", True),
                load_balancing=workflow_config.get("load_balancing", True)
            )
            
            # Store workflow
            self.active_workflows[workflow_id] = workflow
            self.workflow_tasks[workflow_id] = []
            
            # Start workflow execution
            asyncio.create_task(self._execute_workflow(workflow))
            
            self.logger.info(f"Created automated workflow: {workflow_id}")
            return workflow_id
            
        except Exception as e:
            self.logger.error(f"Error creating workflow: {str(e)}")
            raise
    
    async def submit_task_for_automation(self, task: Task, workflow_id: Optional[str] = None) -> bool:
        """Submit a task for automated assignment and execution"""
        try:
            if workflow_id and workflow_id in self.active_workflows:
                # Add to specific workflow
                self.workflow_tasks[workflow_id].append(task)
            else:
                # Add to general task queue
                self.task_queue.append(task)
            
            self.logger.info(f"Task {task.task_id} submitted for automation")
            return True
            
        except Exception as e:
            self.logger.error(f"Error submitting task: {str(e)}")
            return False
    
    async def _workflow_execution_loop(self):
        """Main workflow execution loop"""
        while True:
            try:
                for workflow_id, workflow in list(self.active_workflows.items()):
                    if workflow.status == WorkflowStatus.RUNNING:
                        await self._process_workflow_step(workflow)
                
                await asyncio.sleep(5)  # Check every 5 seconds
                
            except Exception as e:
                self.logger.error(f"Error in workflow execution loop: {str(e)}")
                await asyncio.sleep(10)
    
    async def _execute_workflow(self, workflow: AutomatedWorkflow):
        """Execute a specific workflow"""
        try:
            workflow.status = WorkflowStatus.RUNNING
            self.logger.info(f"Starting workflow execution: {workflow.workflow_id}")
            
            # Execute steps based on dependencies
            completed_steps: Set[str] = set()
            
            while len(completed_steps) < len(workflow.steps):
                # Find executable steps
                executable_steps = [
                    step for step in workflow.steps
                    if step.step_id not in completed_steps and
                    all(dep in completed_steps for dep in step.dependencies)
                ]
                
                if not executable_steps:
                    self.logger.warning(f"No executable steps found for workflow {workflow.workflow_id}")
                    break
                
                # Execute steps
                if any(step.parallel_execution for step in executable_steps):
                    # Parallel execution
                    tasks = [self._execute_workflow_step(workflow, step) for step in executable_steps]
                    results = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    for step, result in zip(executable_steps, results):
                        if not isinstance(result, Exception):
                            completed_steps.add(step.step_id)
                else:
                    # Sequential execution
                    for step in executable_steps:
                        success = await self._execute_workflow_step(workflow, step)
                        if success:
                            completed_steps.add(step.step_id)
                        else:
                            break
                
                await asyncio.sleep(1)
            
            # Mark workflow as completed
            workflow.status = WorkflowStatus.COMPLETED
            self.logger.info(f"Workflow {workflow.workflow_id} completed")
            
        except Exception as e:
            workflow.status = WorkflowStatus.FAILED
            self.logger.error(f"Workflow {workflow.workflow_id} failed: {str(e)}")
    
    async def _execute_workflow_step(self, workflow: AutomatedWorkflow, step: WorkflowStep) -> bool:
        """Execute a single workflow step"""
        try:
            # Create task from template
            task_data = step.task_template.copy()
            task_data["task_id"] = f"{workflow.workflow_id}_{step.step_id}_{datetime.now().strftime('%H%M%S')}"
            
            task = Task(**task_data)
            
            # Auto-assign task if enabled
            if workflow.auto_assignment and self.auto_assignment_enabled:
                assignment = await self.assignment_engine.auto_assign_task(task, workflow.industry)
                
                if assignment:
                    # Add to workflow tasks
                    self.workflow_tasks[workflow.workflow_id].append(task)
                    self.logger.info(f"Step {step.step_id} assigned to {assignment.agent_id}")
                    return True
                else:
                    # Retry logic
                    step.retry_count += 1
                    if step.retry_count < step.max_retries:
                        self.logger.warning(f"Retrying step {step.step_id} ({step.retry_count}/{step.max_retries})")
                        await asyncio.sleep(30)  # Wait before retry
                        return False
                    else:
                        self.logger.error(f"Step {step.step_id} failed after {step.max_retries} retries")
                        return False
            else:
                # Add to task queue for manual assignment
                self.task_queue.append(task)
                return True
                
        except Exception as e:
            self.logger.error(f"Error executing workflow step {step.step_id}: {str(e)}")
            return False
    
    async def _load_balancing_loop(self):
        """Load balancing loop for optimal resource utilization"""
        while True:
            try:
                if self.load_balancing_enabled:
                    await self._balance_agent_loads()
                
                await asyncio.sleep(30)  # Balance every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Error in load balancing loop: {str(e)}")
                await asyncio.sleep(60)
    
    async def _balance_agent_loads(self):
        """Balance loads across available agents"""
        try:
            # Get current agent loads
            agents = await self.db_manager.get_all_agents()
            
            # Update load tracker
            for agent in agents:
                self.agent_load_tracker[agent.agent_id] = agent.current_workload
            
            # Identify overloaded and underloaded agents
            overloaded_agents = [
                agent for agent in agents 
                if agent.current_workload > 0.85 and agent.status == "AVAILABLE"
            ]
            
            underloaded_agents = [
                agent for agent in agents 
                if agent.current_workload < 0.5 and agent.status == "AVAILABLE"
            ]
            
            # Redistribute tasks if needed
            if overloaded_agents and underloaded_agents:
                await self._redistribute_tasks(overloaded_agents, underloaded_agents)
            
        except Exception as e:
            self.logger.error(f"Error balancing agent loads: {str(e)}")
    
    async def _redistribute_tasks(self, overloaded_agents: List[Agent], underloaded_agents: List[Agent]):
        """Redistribute tasks from overloaded to underloaded agents"""
        try:
            for overloaded_agent in overloaded_agents:
                # Get pending tasks for this agent
                pending_tasks = await self.db_manager.get_agent_pending_tasks(overloaded_agent.agent_id)
                
                # Find tasks that can be reassigned
                reassignable_tasks = [
                    task for task in pending_tasks 
                    if task.status == "PENDING" and not task.started_at
                ]
                
                for task in reassignable_tasks[:2]:  # Limit to 2 tasks per cycle
                    # Find best underloaded agent
                    best_agent = None
                    best_score = -1
                    
                    for underloaded_agent in underloaded_agents:
                        performance = await self.performance_predictor.predict_performance(task, underloaded_agent)
                        score = performance["success_probability"] * (1 - underloaded_agent.current_workload)
                        
                        if score > best_score:
                            best_score = score
                            best_agent = underloaded_agent
                    
                    if best_agent:
                        # Reassign task
                        await self._reassign_task(task, overloaded_agent, best_agent)
                        self.logger.info(f"Redistributed task {task.task_id} from {overloaded_agent.agent_id} to {best_agent.agent_id}")
                        
                        # Update workloads
                        overloaded_agent.current_workload -= 0.1
                        best_agent.current_workload += 0.1
            
        except Exception as e:
            self.logger.error(f"Error redistributing tasks: {str(e)}")
    
    async def _reassign_task(self, task: Task, from_agent: Agent, to_agent: Agent):
        """Reassign a task from one agent to another"""
        try:
            # Cancel current assignment
            await self.db_manager.cancel_assignment(task.task_id, from_agent.agent_id)
            
            # Create new assignment
            new_assignment = Assignment(
                assignment_id=f"reassign_{task.task_id}_{datetime.now().strftime('%H%M%S')}",
                task_id=task.task_id,
                agent_id=to_agent.agent_id,
                assigned_at=datetime.now(),
                assignment_method="load_balancing",
                confidence_score=0.8
            )
            
            await self.db_manager.store_assignment(new_assignment)
            
        except Exception as e:
            self.logger.error(f"Error reassigning task: {str(e)}")
    
    async def _task_queue_processor(self):
        """Process tasks in the automation queue"""
        while True:
            try:
                if self.task_queue:
                    task = self.task_queue.pop(0)
                    
                    # Determine industry context
                    industry = self._determine_task_industry(task)
                    
                    # Auto-assign task
                    assignment = await self.assignment_engine.auto_assign_task(task, industry)
                    
                    if assignment:
                        self.logger.info(f"Auto-assigned queued task {task.task_id}")
                    else:
                        # Re-queue task for retry
                        self.task_queue.append(task)
                        await asyncio.sleep(60)  # Wait before retry
                
                await asyncio.sleep(10)  # Process every 10 seconds
                
            except Exception as e:
                self.logger.error(f"Error processing task queue: {str(e)}")
                await asyncio.sleep(30)
    
    async def _performance_monitoring_loop(self):
        """Monitor and optimize system performance"""
        while True:
            try:
                # Collect performance metrics
                metrics = await self._collect_performance_metrics()
                
                # Optimize based on metrics
                await self._optimize_system_performance(metrics)
                
                await asyncio.sleep(300)  # Monitor every 5 minutes
                
            except Exception as e:
                self.logger.error(f"Error in performance monitoring: {str(e)}")
                await asyncio.sleep(600)
    
    async def _collect_performance_metrics(self) -> Dict:
        """Collect system performance metrics"""
        try:
            total_agents = len(await self.db_manager.get_all_agents())
            available_agents = len(await self.db_manager.get_available_agents())
            pending_tasks = len(await self.db_manager.get_pending_tasks())
            active_workflows = len([w for w in self.active_workflows.values() if w.status == WorkflowStatus.RUNNING])
            
            avg_workload = np.mean([load for load in self.agent_load_tracker.values()]) if self.agent_load_tracker else 0
            
            return {
                "total_agents": total_agents,
                "available_agents": available_agents,
                "utilization_rate": available_agents / max(total_agents, 1),
                "pending_tasks": pending_tasks,
                "active_workflows": active_workflows,
                "average_workload": avg_workload,
                "queue_length": len(self.task_queue)
            }
            
        except Exception as e:
            self.logger.error(f"Error collecting metrics: {str(e)}")
            return {}
    
    async def _optimize_system_performance(self, metrics: Dict):
        """Optimize system performance based on metrics"""
        try:
            # Adjust automation settings based on performance
            if metrics.get("utilization_rate", 0) < 0.3:
                # Low utilization - increase automation
                self.auto_assignment_enabled = True
                self.load_balancing_enabled = True
            elif metrics.get("average_workload", 0) > 0.9:
                # High workload - enable aggressive load balancing
                self.load_balancing_enabled = True
            
            # Log performance insights
            self.logger.info(f"Performance metrics: {json.dumps(metrics, indent=2)}")
            
        except Exception as e:
            self.logger.error(f"Error optimizing performance: {str(e)}")
    
    def _determine_task_industry(self, task: Task) -> str:
        """Determine industry context from task characteristics"""
        task_type = task.task_type.lower()
        
        industry_keywords = {
            "manufacturing": ["assembly", "precision", "material_handling", "quality_inspection"],
            "healthcare": ["patient", "medical", "diagnosis", "treatment", "care"],
            "finance": ["trading", "analysis", "risk", "compliance", "audit"],
            "retail": ["customer", "inventory", "sales", "service", "support"],
            "iot": ["sensor", "device", "monitoring", "data_collection", "automation"],
            "social_media": ["content", "moderation", "engagement", "social", "community"]
        }
        
        for industry, keywords in industry_keywords.items():
            if any(keyword in task_type for keyword in keywords):
                return industry
        
        return "manufacturing"  # Default industry
