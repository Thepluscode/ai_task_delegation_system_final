# ai_automation_platform/ai_agents/task_agent.py
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

from .base_agent import BaseAgent
from communication import Message

class TaskDefinition(BaseModel):
    """Definition of a task that can be executed by a TaskAgent."""
    task_id: str
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    priority: int = 1
    timeout: Optional[float] = None
    dependencies: List[str] = Field(default_factory=list)

class TaskStatus(BaseModel):
    """Current status of a task."""
    task_id: str
    status: str  # pending, running, completed, failed, cancelled
    progress: float = 0.0
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class TaskAgent(BaseAgent):
    """An agent that can execute specific tasks."""
    
    def __init__(
        self,
        agent_id: str,
        comm_manager: Any,
        capabilities: List[str],
        config: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            agent_id=agent_id,
            agent_type="task_agent",
            comm_manager=comm_manager,
            config=config
        )
        self.capabilities = capabilities
        self.available = True
        self.current_task: Optional[TaskDefinition] = None
        self.task_status: Dict[str, TaskStatus] = {}
        
    async def _setup_handlers(self) -> None:
        """Set up message handlers for task-related messages."""
        await self.comm_manager.subscribe(
            f"agent/{self.agent_id}/task",
            self._handle_task_message
        )
        
    async def _handle_task_message(self, message: Message) -> None:
        """Handle incoming task messages."""
        task_data = message.payload
        action = task_data.get("action")
        
        if action == "assign":
            await self._handle_task_assignment(task_data)
        elif action == "cancel":
            await self._handle_task_cancellation(task_data)
        elif action == "status":
            await self._send_task_status(task_data.get("task_id"))
            
    async def _handle_task_assignment(self, task_data: Dict[str, Any]) -> None:
        """Handle a new task assignment."""
        if not self.available:
            await self._send_task_response(
                task_data["task_id"],
                "error",
                "Agent is not available"
            )
            return
            
        task_def = TaskDefinition(**task_data["task"])
        
        # Check if we have the required capabilities
        if not all(cap in self.capabilities for cap in task_def.parameters.get("required_capabilities", [])):
            await self._send_task_response(
                task_def.task_id,
                "error",
                "Insufficient capabilities"
            )
            return
            
        self.current_task = task_def
        self.available = False
        
        # Create task status
        self.task_status[task_def.task_id] = TaskStatus(
            task_id=task_def.task_id,
            status="running",
            start_time=datetime.utcnow()
        )
        
        # Start task execution in background
        self.create_task(self._execute_task(task_def))
        
    async def _execute_task(self, task_def: TaskDefinition) -> None:
        """Execute the assigned task."""
        task_id = task_def.task_id
        try:
            # Update status to running
            self.task_status[task_id].status = "running"
            await self._update_task_progress(task_id, 0.1)
            
            # Execute the task (to be implemented by subclasses)
            result = await self._perform_task(task_def)
            
            # Mark as completed
            self.task_status[task_id].status = "completed"
            self.task_status[task_id].result = result
            self.task_status[task_id].progress = 1.0
            self.task_status[task_id].end_time = datetime.utcnow()
            
            await self._send_task_response(
                task_id,
                "completed",
                result=result
            )
            
        except Exception as e:
            logger.error(f"Task {task_id} failed: {str(e)}", exc_info=True)
            self.task_status[task_id].status = "failed"
            self.task_status[task_id].error = str(e)
            self.task_status[task_id].end_time = datetime.utcnow()
            
            await self._send_task_response(
                task_id,
                "failed",
                error=str(e)
            )
        finally:
            self.current_task = None
            self.available = True
            
    @abstractmethod
    async def _perform_task(self, task_def: TaskDefinition) -> Dict[str, Any]:
        """Perform the actual task work. Must be implemented by subclasses."""
        pass
        
    async def _update_task_progress(self, task_id: str, progress: float) -> None:
        """Update the progress of a task."""
        if task_id in self.task_status:
            self.task_status[task_id].progress = max(0.0, min(1.0, progress))
            await self._send_task_update(task_id)
            
    async def _send_task_response(
        self,
        task_id: str,
        status: str,
        message: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> None:
        """Send a task response message."""
        response = {
            "task_id": task_id,
            "status": status,
            "agent_id": self.agent_id
        }
        
        if message:
            response["message"] = message
        if result is not None:
            response["result"] = result
        if error:
            response["error"] = error
            
        await self.send_message(
            "task_response",
            response
        )
        
    async def _send_task_update(self, task_id: str) -> None:
        """Send a task status update."""
        if task_id not in self.task_status:
            return
            
        status = self.task_status[task_id]
        await self.send_message(
            "task_update",
            status.dict()
        )