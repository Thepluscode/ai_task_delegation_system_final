"""Supervisor implementation for managing operators and handling escalations."""
import asyncio
import logging
from typing import Dict, Any, List, Optional, Set, Callable, Awaitable

from .base_human import BaseHuman
from .models import HumanInfo, HumanRole, HumanState, HumanTaskAssignment, HumanCapability
from ..device.manager import DeviceManager

logger = logging.getLogger(__name__)

class Supervisor(BaseHuman):
    """Implementation of a supervisor in the automation system."""
    
    def __init__(self, supervisor_info: Dict[str, Any], device_manager: Optional[DeviceManager] = None):
        """
        Initialize the supervisor.
        
        Args:
            supervisor_info: Supervisor information
            device_manager: Optional device manager for device control
        """
        # Ensure the role is set to SUPERVISOR
        supervisor_info['role'] = HumanRole.SUPERVISOR
        
        # Add supervisor capabilities if not specified
        if 'capabilities' not in supervisor_info:
            supervisor_info['capabilities'] = [
                HumanCapability.TASK_APPROVAL,
                HumanCapability.TASK_OVERRIDE,
                HumanCapability.EMERGENCY_STOP,
                HumanCapability.SYSTEM_CONFIG,
                HumanCapability.DEVICE_CONTROL,
                HumanCapability.DATA_ACCESS
            ]
        
        # Create human info object
        human_info = HumanInfo(**supervisor_info)
        
        super().__init__(human_info)
        
        # Supervisor-specific state
        self._managed_operators: Dict[str, Dict[str, Any]] = {}
        self._active_alerts: List[Dict[str, Any]] = []
        self._escalated_issues: List[Dict[str, Any]] = []
        self._device_manager = device_manager
        self._assigned_areas: Set[str] = set()
        
        # Default notification preferences
        self._notification_preferences = {
            "email": True,
            "push": True,
            "sound": True,
            "priority_threshold": "medium"
        }
    
    @property
    def managed_operators(self) -> Dict[str, Dict[str, Any]]:
        """Get information about managed operators."""
        return self._managed_operators.copy()
    
    @property
    def active_alerts(self) -> List[Dict[str, Any]]:
        """Get active alerts in supervised areas."""
        return self._active_alerts.copy()
    
    @property
    def escalated_issues(self) -> List[Dict[str, Any]]:
        """Get escalated issues."""
        return self._escalated_issues.copy()
    
    # Operator Management
    
    async def add_operator(self, operator_id: str, operator_info: Dict[str, Any]) -> bool:
        """
        Add an operator to the supervisor's managed list.
        
        Args:
            operator_id: ID of the operator to add
            operator_info: Operator information
            
        Returns:
            bool: True if operator was added successfully
        """
        if operator_id in self._managed_operators:
            logger.warning(f"Operator {operator_id} is already managed by {self._info.username}")
            return False
            
        self._managed_operators[operator_id] = {
            **operator_info,
            "status": "active",
            "last_updated": asyncio.get_event_loop().time(),
            "metrics": {
                "tasks_completed": 0,
                "escalations": 0,
                "average_task_time": 0.0
            }
        }
        
        logger.info(f"Added operator {operator_id} to {self._info.username}'s managed list")
        return True
    
    async def remove_operator(self, operator_id: str) -> bool:
        """
        Remove an operator from the supervisor's managed list.
        
        Args:
            operator_id: ID of the operator to remove
            
        Returns:
            bool: True if operator was removed successfully
        """
        if operator_id not in self._managed_operators:
            logger.warning(f"Operator {operator_id} is not managed by {self._info.username}")
            return False
            
        del self._managed_operators[operator_id]
        logger.info(f"Removed operator {operator_id} from {self._info.username}'s managed list")
        return True
    
    async def assign_operator_to_area(self, operator_id: str, area_id: str) -> bool:
        """
        Assign an operator to a work area.
        
        Args:
            operator_id: ID of the operator
            area_id: ID of the work area
            
        Returns:
            bool: True if assignment was successful
        """
        if operator_id not in self._managed_operators:
            logger.warning(f"Cannot assign operator {operator_id}: not managed by {self._info.username}")
            return False
            
        self._managed_operators[operator_id]["assigned_area"] = area_id
        logger.info(f"Assigned operator {operator_id} to area {area_id}")
        return True
    
    # Alert and Issue Management
    
    async def escalate_issue(self, issue: Dict[str, Any]) -> bool:
        """
        Escalate an issue to the supervisor.
        
        Args:
            issue: The issue to escalate
            
        Returns:
            bool: True if issue was escalated successfully
        """
        issue_id = issue.get("id", f"issue_{asyncio.get_event_loop().time()}")
        
        # Check if this issue is already escalated
        if any(i.get("id") == issue_id for i in self._escalated_issues):
            logger.warning(f"Issue {issue_id} is already escalated")
            return False
            
        # Add to escalated issues
        self._escalated_issues.append({
            **issue,
            "escalated_at": asyncio.get_event_loop().time(),
            "status": "pending",
            "assigned_to": None,
            "resolution": None
        })
        
        # Notify the supervisor
        await self.notify(
            message=f"New issue escalated: {issue.get('title', 'No title')}",
            level="warning",
            issue_id=issue_id,
            priority=issue.get("priority", "medium"),
            source=issue.get("source", "unknown")
        )
        
        logger.info(f"Issue {issue_id} escalated to {self._info.username}")
        return True
    
    async def acknowledge_alert(self, alert_id: str) -> bool:
        """
        Acknowledge an alert.
        
        Args:
            alert_id: ID of the alert to acknowledge
            
        Returns:
            bool: True if alert was acknowledged
        """
        for i, alert in enumerate(self._active_alerts):
            if alert['id'] == alert_id:
                # Update the alert status
                self._active_alerts[i]['status'] = 'acknowledged'
                self._active_alerts[i]['acknowledged_by'] = self._info.user_id
                self._active_alerts[i]['acknowledged_at'] = asyncio.get_event_loop().time()
                
                # Emit alert acknowledged event
                await self._emit_event("alert_acknowledged", {
                    "supervisor_id": self._info.user_id,
                    "alert_id": alert_id,
                    "timestamp": asyncio.get_event_loop().time()
                })
                
                logger.info(f"Supervisor {self._info.username} acknowledged alert {alert_id}")
                return True
                
        logger.warning(f"Alert {alert_id} not found for supervisor {self._info.username}")
        return False
    
    # Implementation of abstract methods
    
    async def _on_connect(self) -> None:
        """Handle supervisor connection to the system."""
        logger.info(f"Supervisor {self._info.username} connected to the system")
        
        # In a real implementation, this would restore the supervisor's session,
        # including managed operators, active alerts, and assigned areas
        
    async def _on_disconnect(self) -> None:
        """Handle supervisor disconnection from the system."""
        logger.info(f"Supervisor {self._info.username} disconnected from the system")
        
        # In a real implementation, this would clean up resources and update presence
        
    async def _on_task_assigned(self, task: HumanTaskAssignment) -> None:
        """
        Handle a newly assigned task.
        
        Args:
            task: The assigned task
        """
        # Notify the supervisor about the new task
        await self.notify(
            message=f"New task assigned: {task.instructions}",
            level="info",
            task_id=task.task_id,
            priority=task.priority,
            deadline=task.deadline.isoformat() if task.deadline else None
        )
    
    async def _on_task_completed(self, task: HumanTaskAssignment, result: Dict[str, Any]) -> None:
        """
        Handle task completion.
        
        Args:
            task: The completed task
            result: Task result data
        """
        # Notify the supervisor about task completion
        await self.notify(
            message=f"Task completed: {task.instructions}",
            level="success",
            task_id=task.task_id,
            result=result
        )
    
    async def notify(self, message: str, level: str = "info", **kwargs) -> bool:
        """
        Send a notification to the supervisor.
        
        Args:
            message: The notification message
            level: Notification level (info, warning, error, success)
            **kwargs: Additional notification data
            
        Returns:
            bool: True if notification was sent successfully
        """
        notification = {
            "id": f"notif_{asyncio.get_event_loop().time()}",
            "timestamp": asyncio.get_event_loop().time(),
            "message": message,
            "level": level,
            **kwargs
        }
        
        # Store the notification if it's an alert
        if level in ["warning", "error"]:
            self._active_alerts.append({
                **notification,
                "status": "active"
            })
        
        # Emit notification event
        await self._emit_event("notification", notification)
        
        logger.info(f"Notification to supervisor {self._info.username} [{level}]: {message}")
        return True
    
    # Additional supervisor-specific methods
    
    async def broadcast_message(self, message: str, level: str = "info", **kwargs) -> Dict[str, bool]:
        """
        Broadcast a message to all managed operators.
        
        Args:
            message: The message to broadcast
            level: Message level (info, warning, error, success)
            **kwargs: Additional message data
            
        Returns:
            Dict[str, bool]: Mapping of operator IDs to send status
        """
        results = {}
        
        for operator_id in self._managed_operators:
            try:
                # In a real implementation, this would send the message to each operator
                results[operator_id] = True
                logger.info(f"Broadcast message to operator {operator_id}: {message}")
            except Exception as e:
                results[operator_id] = False
                logger.error(f"Failed to send message to operator {operator_id}: {str(e)}")
        
        return results
    
    async def request_status_update(self, operator_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Request a status update from one or all managed operators.
        
        Args:
            operator_id: Optional ID of a specific operator, or None for all
            
        Returns:
            Dict[str, Any]: Status information
        """
        if operator_id:
            if operator_id not in self._managed_operators:
                logger.warning(f"Cannot get status for unmanaged operator {operator_id}")
                return {}
                
            # In a real implementation, this would request status from the operator
            return {
                "operator_id": operator_id,
                "status": "active",
                "last_activity": asyncio.get_event_loop().time() - 60,  # Simulated
                "current_task": "Sample Task"
            }
        else:
            # Return status for all managed operators
            status = {}
            for op_id in self._managed_operators:
                status[op_id] = {
                    "status": "active",
                    "last_activity": asyncio.get_event_loop().time() - 60,  # Simulated
                    "current_task": "Sample Task"
                }
            return status
    
    async def override_operator_action(self, operator_id: str, action: str, **params) -> bool:
        """
        Override an operator's action.
        
        Args:
            operator_id: ID of the operator
            action: Action to perform (e.g., 'pause', 'resume', 'cancel')
            **params: Action parameters
            
        Returns:
            bool: True if override was successful
        """
        if operator_id not in self._managed_operators:
            logger.warning(f"Cannot override action for unmanaged operator {operator_id}")
            return False
            
        logger.info(f"Overriding action for operator {operator_id}: {action} with params {params}")
        
        # In a real implementation, this would send the override command to the operator
        
        # Emit override event
        await self._emit_event("operator_override", {
            "supervisor_id": self._info.user_id,
            "operator_id": operator_id,
            "action": action,
            "params": params,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        return True
