"""Operator implementation for human operators in the automation system."""
import asyncio
import logging
from typing import Dict, Any, Optional, List, Callable, Awaitable

from .base_human import BaseHuman
from .models import HumanInfo, HumanRole, HumanState, HumanTaskAssignment, HumanCapability

logger = logging.getLogger(__name__)

class Operator(BaseHuman):
    """Implementation of a human operator in the automation system."""
    
    def __init__(self, operator_info: Dict[str, Any]):
        """Initialize the operator with the given information."""
        # Ensure the role is set to OPERATOR
        operator_info['role'] = HumanRole.OPERATOR
        
        # Add default capabilities if not specified
        if 'capabilities' not in operator_info:
            operator_info['capabilities'] = [
                HumanCapability.TASK_APPROVAL,
                HumanCapability.EMERGENCY_STOP,
                HumanCapability.DEVICE_CONTROL
            ]
        
        # Create human info object
        human_info = HumanInfo(**operator_info)
        
        super().__init__(human_info)
        
        # Operator-specific state
        self._current_station: Optional[str] = None
        self._active_alerts: List[Dict[str, Any]] = []
        self._notification_callbacks: List[Callable[[Dict[str, Any]], Awaitable[None]]] = []
    
    @property
    def current_station(self) -> Optional[str]:
        """Get the operator's current station/work area."""
        return self._current_station
    
    @property
    def active_alerts(self) -> List[Dict[str, Any]]:
        """Get the operator's active alerts."""
        return self._active_alerts.copy()
    
    async def move_to_station(self, station_id: str) -> bool:
        """
        Move the operator to a different station/work area.
        
        Args:
            station_id: ID of the station to move to
            
        Returns:
            bool: True if the move was successful
        """
        if self._current_station == station_id:
            return True
            
        logger.info(f"Operator {self._info.username} moving to station {station_id}")
        
        # In a real implementation, this would update the operator's location in the system
        # and potentially trigger location-based events
        
        old_station = self._current_station
        self._current_station = station_id
        
        # Emit station changed event
        await self._emit_event("station_changed", {
            "user_id": self._info.user_id,
            "old_station": old_station,
            "new_station": station_id,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        return True
    
    async def acknowledge_alert(self, alert_id: str) -> bool:
        """
        Acknowledge an alert.
        
        Args:
            alert_id: ID of the alert to acknowledge
            
        Returns:
            bool: True if the alert was acknowledged
        """
        for i, alert in enumerate(self._active_alerts):
            if alert['id'] == alert_id:
                # Remove the alert from active alerts
                self._active_alerts.pop(i)
                
                # Emit alert acknowledged event
                await self._emit_event("alert_acknowledged", {
                    "user_id": self._info.user_id,
                    "alert_id": alert_id,
                    "timestamp": asyncio.get_event_loop().time()
                })
                
                logger.info(f"Operator {self._info.username} acknowledged alert {alert_id}")
                return True
                
        logger.warning(f"Alert {alert_id} not found for operator {self._info.username}")
        return False
    
    # Implementation of abstract methods
    
    async def _on_connect(self) -> None:
        """Handle operator connection to the system."""
        logger.info(f"Operator {self._info.username} connected to the system")
        
        # In a real implementation, this would restore the operator's session,
        # including active tasks, alerts, and station assignment
        
    async def _on_disconnect(self) -> None:
        """Handle operator disconnection from the system."""
        logger.info(f"Operator {self._info.username} disconnected from the system")
        
        # In a real implementation, this would clean up resources and update presence
        
    async def _on_task_assigned(self, task: HumanTaskAssignment) -> None:
        """
        Handle a newly assigned task.
        
        Args:
            task: The assigned task
        """
        # Notify the operator about the new task
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
        # Notify the operator about task completion
        await self.notify(
            message=f"Task completed: {task.instructions}",
            level="success",
            task_id=task.task_id,
            result=result
        )
    
    async def notify(self, message: str, level: str = "info", **kwargs) -> bool:
        """
        Send a notification to the operator.
        
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
        
        # Store the notification
        if level in ["warning", "error"]:
            self._active_alerts.append(notification)
        
        # Emit notification event
        await self._emit_event("notification", notification)
        
        logger.info(f"Notification to {self._info.username} [{level}]: {message}")
        return True
    
    # Additional operator-specific methods
    
    async def request_help(self, message: str, priority: str = "normal") -> bool:
        """
        Request help from a supervisor.
        
        Args:
            message: Help request message
            priority: Priority of the help request (low, normal, high, critical)
            
        Returns:
            bool: True if the help request was sent successfully
        """
        help_request = {
            "id": f"help_{asyncio.get_event_loop().time()}",
            "timestamp": asyncio.get_event_loop().time(),
            "operator_id": self._info.user_id,
            "operator_name": self._info.display_name,
            "station": self._current_station,
            "message": message,
            "priority": priority
        }
        
        # Emit help requested event
        await self._emit_event("help_requested", help_request)
        
        logger.info(f"Help requested by {self._info.username}: {message}")
        return True
    
    async def report_issue(self, issue_type: str, description: str, **details) -> bool:
        """
        Report an issue or incident.
        
        Args:
            issue_type: Type of issue (e.g., 'equipment', 'safety', 'quality')
            description: Description of the issue
            **details: Additional details about the issue
            
        Returns:
            bool: True if the issue was reported successfully
        """
        issue_report = {
            "id": f"issue_{asyncio.get_event_loop().time()}",
            "timestamp": asyncio.get_event_loop().time(),
            "reporter_id": self._info.user_id,
            "reporter_name": self._info.display_name,
            "station": self._current_station,
            "issue_type": issue_type,
            "description": description,
            **details
        }
        
        # Emit issue reported event
        await self._emit_event("issue_reported", issue_report)
        
        logger.info(f"Issue reported by {self._info.username}: {issue_type} - {description}")
        return True
