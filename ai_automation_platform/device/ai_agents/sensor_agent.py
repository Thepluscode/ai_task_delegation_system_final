"""Sensor agent implementation for interacting with sensors."""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Type, TypeVar, Generic, cast

from .base_agent import BaseAgent
from .task_handlers import task_registry
from ...sensors import BaseSensor, SensorReading, SensorState

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseSensor)

class SensorAgent(BaseAgent):
    """Agent for managing and interacting with sensors."""
    
    def __init__(
        self,
        agent_id: str,
        comm_manager: Any,
        sensors: Dict[str, BaseSensor],
        config: Optional[Dict[str, Any]] = None
    ):
        """Initialize the sensor agent.
        
        Args:
            agent_id: Unique identifier for this agent
            comm_manager: Communication manager instance
            sensors: Dictionary of sensor_id -> sensor instance
            config: Optional configuration dictionary
        """
        super().__init__(
            agent_id=agent_id,
            agent_type="sensor_agent",
            comm_manager=comm_manager,
            config=config or {}
        )
        
        self.sensors = sensors
        self._sensor_tasks: Dict[str, asyncio.Task] = {}
        self._monitoring_tasks: Dict[str, asyncio.Task] = {}
        
        # Register task handlers
        self._register_task_handlers()
    
    def _register_task_handlers(self) -> None:
        """Register all task handlers for this agent."""
        
        @task_registry.register(
            "read_sensor",
            required_capabilities=["sensor_control"],
            description="Read the current value from a sensor"
        )
        async def read_sensor(sensor_id: str, **kwargs) -> Dict[str, Any]:
            """Task handler for reading a sensor."""
            if sensor_id not in self.sensors:
                raise ValueError(f"Unknown sensor: {sensor_id}")
                
            sensor = self.sensors[sensor_id]
            
            # Ensure sensor is initialized and started
            if not getattr(sensor, 'initialized', False):
                await sensor.initialize()
            if sensor.state != SensorState.ACTIVE:
                await sensor.start()
                
            reading = await sensor.take_reading()
            return {
                "sensor_id": sensor_id,
                "reading": reading.dict() if reading else None,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        @task_registry.register(
            "monitor_sensor",
            required_capabilities=["sensor_control", "data_collection"],
            description="Monitor a sensor for changes"
        )
        async def monitor_sensor(
            sensor_id: str,
            interval: float = 60.0,
            duration: Optional[float] = None,
            callback_topic: Optional[str] = None,
            **kwargs
        ) -> Dict[str, Any]:
            """Task handler for monitoring a sensor over time."""
            if sensor_id not in self.sensors:
                raise ValueError(f"Unknown sensor: {sensor_id}")
                
            sensor = self.sensors[sensor_id]
            readings = []
            start_time = datetime.utcnow()
            task_id = kwargs.get("task_id", "unknown")
            
            # Ensure sensor is initialized and started
            if not getattr(sensor, 'initialized', False):
                await sensor.initialize()
            if sensor.state != SensorState.ACTIVE:
                await sensor.start()
            
            try:
                while True:
                    # Check if we should stop
                    if (duration and 
                        (datetime.utcnow() - start_time).total_seconds() > duration):
                        break
                        
                    # Take reading
                    reading = await sensor.take_reading()
                    if reading:
                        reading_data = {
                            "timestamp": datetime.utcnow().isoformat(),
                            "value": reading.dict()
                        }
                        readings.append(reading_data)
                        
                        # If callback topic is provided, send the reading
                        if callback_topic and self.comm_manager:
                            await self.comm_manager.publish(
                                callback_topic,
                                {
                                    "sensor_id": sensor_id,
                                    "reading": reading_data,
                                    "task_id": task_id
                                }
                            )
                    
                    # Wait for next reading
                    await asyncio.sleep(interval)
                    
            except asyncio.CancelledError:
                logger.info(f"Monitoring task {task_id} was cancelled")
                raise
                
            return {
                "sensor_id": sensor_id,
                "readings": readings,
                "start_time": start_time.isoformat(),
                "end_time": datetime.utcnow().isoformat()
            }
    
    async def process_message(self, message: Dict[str, Any]) -> None:
        """Process an incoming message."""
        try:
            message_type = message.get("type")
            
            if message_type == "task_request":
                await self._handle_task_request(message)
            elif message_type == "cancel_task":
                await self._cancel_task(message.get("task_id"))
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            
    async def _handle_task_request(self, message: Dict[str, Any]) -> None:
        """Handle a task request message."""
        task_id = message.get("task_id")
        task_type = message.get("task_type")
        params = message.get("parameters", {})
        
        try:
            # Get the handler for this task type
            handler = task_registry.get_handler(task_type)
            if not handler:
                raise ValueError(f"Unknown task type: {task_type}")
                
            # Execute the task
            result = await handler.execute(**params)
            
            # Send success response
            await self.send_message(
                "task_response",
                {
                    "task_id": task_id,
                    "status": "completed",
                    "result": result
                }
            )
            
        except Exception as e:
            logger.error(f"Task {task_id} failed: {str(e)}", exc_info=True)
            await self.send_message(
                "task_response",
                {
                    "task_id": task_id,
                    "status": "failed",
                    "error": str(e)
                }
            )
    
    async def _cancel_task(self, task_id: str) -> None:
        """Cancel a running task."""
        if task_id in self._monitoring_tasks:
            task = self._monitoring_tasks.pop(task_id)
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
                
    async def _on_start(self) -> None:
        """Called when the agent starts."""
        logger.info(f"{self.agent_id} started with {len(self.sensors)} sensors")
        
    async def _on_stop(self) -> None:
        """Called when the agent stops."""
        # Cancel all monitoring tasks
        for task_id, task in list(self._monitoring_tasks.items()):
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
                
        self._monitoring_tasks.clear()
        logger.info(f"{self.agent_id} stopped")
