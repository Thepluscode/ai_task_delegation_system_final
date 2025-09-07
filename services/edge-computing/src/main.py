#!/usr/bin/env python3
"""
Edge Computing Architecture Service
Real-time decision making with sub-10ms latency and autonomous operation
"""

import asyncio
import logging
import time
import uuid
import json
import math
import threading
from abc import ABC, abstractmethod
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Union, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from collections import defaultdict, deque
import numpy as np

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Edge Computing Architecture Service",
    description="Real-time decision making with sub-10ms latency and autonomous operation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"
    SAFETY_CRITICAL = "safety_critical"

class EdgeNodeStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    DEGRADED = "degraded"
    MAINTENANCE = "maintenance"

class DecisionType(str, Enum):
    TASK_ROUTING = "task_routing"
    RESOURCE_ALLOCATION = "resource_allocation"
    SAFETY_RESPONSE = "safety_response"
    QUALITY_CONTROL = "quality_control"
    OPTIMIZATION = "optimization"

@dataclass
class EdgeTask:
    id: str
    type: str
    priority: TaskPriority
    data: Dict[str, Any]
    created_at: datetime
    deadline: Optional[datetime] = None
    requires_cloud: bool = False

@dataclass
class Agent:
    id: str
    type: str
    capabilities: Dict[str, float]
    current_load: float
    status: str
    last_heartbeat: datetime

@dataclass
class DecisionRequest:
    id: str
    type: DecisionType
    priority: TaskPriority
    input_data: Dict[str, Any]
    context: Dict[str, Any]
    created_at: datetime
    deadline_ms: int  # milliseconds from creation

@dataclass
class DecisionResult:
    request_id: str
    decision: Dict[str, Any]
    confidence: float
    processing_time_ms: float
    model_used: str
    fallback_used: bool = False

@dataclass
class EdgeNodeInfo:
    node_id: str
    facility_id: str
    status: EdgeNodeStatus
    capabilities: List[str]
    current_load: float
    last_heartbeat: datetime
    performance_metrics: Dict[str, float]

# Real-Time Task Router
class RealTimeTaskRouter:
    """Ultra-fast task routing with sub-10ms decision making"""
    
    def __init__(self):
        self.decision_cache = {}  # LRU cache for decisions
        self.cache_max_size = 10000
        self.local_models = self._load_lightweight_models()
        self.response_targets = {
            TaskPriority.SAFETY_CRITICAL: 1,      # 1ms
            TaskPriority.CRITICAL: 10,            # 10ms
            TaskPriority.HIGH: 100,               # 100ms
            TaskPriority.NORMAL: 500              # 500ms
        }
        self.performance_metrics = defaultdict(list)
    
    def _load_lightweight_models(self) -> Dict[str, Any]:
        """Load lightweight ML models for edge inference"""
        return {
            'task_routing': self._create_simple_routing_model(),
            'resource_allocation': self._create_resource_model(),
            'safety_classifier': self._create_safety_model()
        }
    
    def _create_simple_routing_model(self) -> Dict[str, Any]:
        """Create simple rule-based routing model"""
        return {
            'type': 'rule_based',
            'rules': {
                'high_precision': {'agent_type': 'robot', 'min_capability': 0.9},
                'complex_decision': {'agent_type': 'human', 'min_capability': 0.8},
                'visual_inspection': {'agent_type': 'ai_system', 'min_capability': 0.85}
            }
        }
    
    def _create_resource_model(self) -> Dict[str, Any]:
        """Create resource allocation model"""
        return {
            'type': 'load_balancing',
            'strategy': 'least_loaded_first',
            'max_load_threshold': 0.8
        }
    
    def _create_safety_model(self) -> Dict[str, Any]:
        """Create safety classification model"""
        return {
            'type': 'safety_classifier',
            'safety_keywords': ['emergency', 'stop', 'danger', 'hazard', 'critical'],
            'safety_threshold': 0.9
        }
    
    async def route_task_realtime(self, task: EdgeTask, available_agents: List[Agent]) -> Dict[str, Any]:
        """Route task with real-time constraints"""
        start_time = time.perf_counter_ns()
        
        try:
            # Check cache first for ultra-fast response
            cache_key = self._generate_cache_key(task, available_agents)
            if cache_key in self.decision_cache:
                cached_decision = self.decision_cache[cache_key]
                if self._is_decision_valid(cached_decision):
                    processing_time = (time.perf_counter_ns() - start_time) / 1_000_000  # Convert to ms
                    self._record_performance_metric(task.priority, processing_time, True)
                    return cached_decision
            
            # Make decision based on priority
            if task.priority == TaskPriority.SAFETY_CRITICAL:
                decision = await self._safety_critical_routing(task, available_agents)
            elif task.priority == TaskPriority.CRITICAL:
                decision = await self._critical_routing(task, available_agents)
            else:
                decision = await self._standard_routing(task, available_agents)
            
            # Cache decision
            self._cache_decision(cache_key, decision)
            
            # Record performance
            processing_time = (time.perf_counter_ns() - start_time) / 1_000_000
            self._record_performance_metric(task.priority, processing_time, False)
            
            # Check if we met the response target
            target_time = self.response_targets.get(task.priority, 500)
            if processing_time > target_time:
                logger.warning(f"Decision time {processing_time:.2f}ms exceeded target {target_time}ms for {task.priority}")
            
            return decision
            
        except Exception as e:
            processing_time = (time.perf_counter_ns() - start_time) / 1_000_000
            logger.error(f"Error in task routing: {e}, time: {processing_time:.2f}ms")
            
            # Return fallback decision
            return self._fallback_decision(task, available_agents)
    
    async def _safety_critical_routing(self, task: EdgeTask, agents: List[Agent]) -> Dict[str, Any]:
        """Ultra-fast routing for safety-critical tasks"""
        # Immediate routing to highest capability agent
        best_agent = max(agents, key=lambda a: a.capabilities.get('safety_protocols', 0))
        
        return {
            'assigned_agent': best_agent.id,
            'routing_strategy': 'safety_critical_immediate',
            'confidence': 0.95,
            'emergency_protocols': True
        }
    
    async def _critical_routing(self, task: EdgeTask, agents: List[Agent]) -> Dict[str, Any]:
        """Fast routing for critical tasks"""
        # Balance capability and availability
        scored_agents = []
        for agent in agents:
            capability_score = agent.capabilities.get(task.type, 0.5)
            load_score = 1.0 - agent.current_load
            combined_score = (capability_score * 0.7) + (load_score * 0.3)
            scored_agents.append((agent, combined_score))
        
        best_agent = max(scored_agents, key=lambda x: x[1])[0]
        
        return {
            'assigned_agent': best_agent.id,
            'routing_strategy': 'critical_balanced',
            'confidence': 0.85
        }
    
    async def _standard_routing(self, task: EdgeTask, agents: List[Agent]) -> Dict[str, Any]:
        """Standard routing with full optimization"""
        model = self.local_models['task_routing']
        
        if model['type'] == 'rule_based':
            return self._rule_based_routing(task, agents, model)
        else:
            return self._ml_based_routing(task, agents, model)
    
    def _rule_based_routing(self, task: EdgeTask, agents: List[Agent], model: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based routing for fast decisions"""
        rules = model['rules']
        
        # Find matching rule
        for rule_name, rule_config in rules.items():
            if rule_name in task.data.get('requirements', []):
                required_type = rule_config['agent_type']
                min_capability = rule_config['min_capability']
                
                # Find best agent matching rule
                matching_agents = [
                    a for a in agents 
                    if a.type == required_type and 
                    a.capabilities.get(task.type, 0) >= min_capability
                ]
                
                if matching_agents:
                    best_agent = min(matching_agents, key=lambda a: a.current_load)
                    return {
                        'assigned_agent': best_agent.id,
                        'routing_strategy': f'rule_based_{rule_name}',
                        'confidence': 0.8
                    }
        
        # Fallback to load balancing
        best_agent = min(agents, key=lambda a: a.current_load)
        return {
            'assigned_agent': best_agent.id,
            'routing_strategy': 'fallback_load_balance',
            'confidence': 0.6
        }
    
    def _ml_based_routing(self, task: EdgeTask, agents: List[Agent], model: Dict[str, Any]) -> Dict[str, Any]:
        """ML-based routing (simplified for edge deployment)"""
        # Simplified ML scoring
        scored_agents = []
        
        for agent in agents:
            # Feature vector: [capability, load, type_match]
            capability = agent.capabilities.get(task.type, 0.5)
            load_factor = 1.0 - agent.current_load
            type_match = 1.0 if agent.type in task.data.get('preferred_types', []) else 0.5
            
            # Simple weighted score
            score = (capability * 0.5) + (load_factor * 0.3) + (type_match * 0.2)
            scored_agents.append((agent, score))
        
        best_agent = max(scored_agents, key=lambda x: x[1])[0]
        
        return {
            'assigned_agent': best_agent.id,
            'routing_strategy': 'ml_weighted_scoring',
            'confidence': 0.75
        }
    
    def _generate_cache_key(self, task: EdgeTask, agents: List[Agent]) -> str:
        """Generate cache key for decision"""
        agent_signature = hash(tuple(sorted([a.id for a in agents])))
        task_signature = hash((task.type, task.priority.value, str(sorted(task.data.items()))))
        return f"{task_signature}_{agent_signature}"
    
    def _is_decision_valid(self, decision: Dict[str, Any]) -> bool:
        """Check if cached decision is still valid"""
        # Simple validity check - in production, would check agent availability, etc.
        return decision.get('timestamp', 0) > (time.time() - 60)  # Valid for 1 minute
    
    def _cache_decision(self, key: str, decision: Dict[str, Any]):
        """Cache decision with LRU eviction"""
        decision['timestamp'] = time.time()
        
        if len(self.decision_cache) >= self.cache_max_size:
            # Remove oldest entry
            oldest_key = min(self.decision_cache.keys(), 
                           key=lambda k: self.decision_cache[k].get('timestamp', 0))
            del self.decision_cache[oldest_key]
        
        self.decision_cache[key] = decision
    
    def _fallback_decision(self, task: EdgeTask, agents: List[Agent]) -> Dict[str, Any]:
        """Fallback decision when primary routing fails"""
        if agents:
            # Simple fallback: least loaded agent
            best_agent = min(agents, key=lambda a: a.current_load)
            return {
                'assigned_agent': best_agent.id,
                'routing_strategy': 'emergency_fallback',
                'confidence': 0.3,
                'fallback': True
            }
        else:
            return {
                'assigned_agent': None,
                'routing_strategy': 'no_agents_available',
                'confidence': 0.0,
                'error': 'No agents available'
            }
    
    def _record_performance_metric(self, priority: TaskPriority, processing_time: float, cache_hit: bool):
        """Record performance metrics for monitoring"""
        metric = {
            'priority': priority.value,
            'processing_time_ms': processing_time,
            'cache_hit': cache_hit,
            'timestamp': time.time()
        }
        
        self.performance_metrics[priority].append(metric)
        
        # Keep only last 1000 metrics per priority
        if len(self.performance_metrics[priority]) > 1000:
            self.performance_metrics[priority] = self.performance_metrics[priority][-1000:]
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        stats = {}
        
        for priority, metrics in self.performance_metrics.items():
            if metrics:
                processing_times = [m['processing_time_ms'] for m in metrics]
                cache_hits = [m['cache_hit'] for m in metrics]
                
                stats[priority.value] = {
                    'avg_processing_time_ms': np.mean(processing_times),
                    'max_processing_time_ms': np.max(processing_times),
                    'min_processing_time_ms': np.min(processing_times),
                    'cache_hit_rate': np.mean(cache_hits),
                    'total_decisions': len(metrics),
                    'target_time_ms': self.response_targets.get(priority, 500)
                }
        
        return stats

# Edge Vision Processor
class EdgeVisionProcessor:
    """Real-time computer vision processing at the edge"""
    
    def __init__(self):
        self.models = self._load_vision_models()
        self.frame_buffer = deque(maxlen=3)  # Minimal latency buffer
        self.processing_stats = defaultdict(int)
    
    def _load_vision_models(self) -> Dict[str, Any]:
        """Load lightweight vision models for edge deployment"""
        return {
            'quality_inspection': {
                'type': 'lightweight_cnn',
                'input_size': (224, 224),
                'classes': ['defect', 'normal'],
                'threshold': 0.8
            },
            'object_detection': {
                'type': 'yolo_tiny',
                'input_size': (416, 416),
                'classes': ['part', 'tool', 'defect'],
                'confidence_threshold': 0.5
            },
            'safety_monitoring': {
                'type': 'safety_classifier',
                'input_size': (320, 240),
                'classes': ['safe', 'unsafe', 'emergency'],
                'threshold': 0.9
            }
        }
    
    async def process_vision_stream(self, frame_data: bytes, processing_type: str) -> Dict[str, Any]:
        """Process vision stream with real-time constraints"""
        start_time = time.perf_counter_ns()
        
        try:
            # Add frame to buffer
            frame_info = {
                'data': frame_data,
                'timestamp': time.time(),
                'processing_type': processing_type
            }
            
            self.frame_buffer.append(frame_info)
            
            # Process latest frame
            if processing_type == 'quality_inspection':
                result = await self._quality_inspection_inference(frame_data)
            elif processing_type == 'object_detection':
                result = await self._object_detection_inference(frame_data)
            elif processing_type == 'safety_monitoring':
                result = await self._safety_monitoring_inference(frame_data)
            else:
                raise ValueError(f"Unknown processing type: {processing_type}")
            
            processing_time = (time.perf_counter_ns() - start_time) / 1_000_000
            
            # Record stats
            self.processing_stats[processing_type] += 1
            
            result['processing_time_ms'] = processing_time
            result['frame_buffer_size'] = len(self.frame_buffer)
            
            return result
            
        except Exception as e:
            processing_time = (time.perf_counter_ns() - start_time) / 1_000_000
            logger.error(f"Vision processing error: {e}, time: {processing_time:.2f}ms")
            
            return {
                'success': False,
                'error': str(e),
                'processing_time_ms': processing_time
            }
    
    async def _quality_inspection_inference(self, frame_data: bytes) -> Dict[str, Any]:
        """Simulate quality inspection inference"""
        # Simulate processing time
        await asyncio.sleep(0.005)  # 5ms processing time
        
        # Simulate defect detection
        defect_probability = np.random.random()
        
        if defect_probability > 0.9:  # 10% defect rate
            return {
                'success': True,
                'defect_detected': True,
                'defect_type': 'surface_scratch',
                'confidence': defect_probability,
                'action_required': 'reject_part'
            }
        else:
            return {
                'success': True,
                'defect_detected': False,
                'quality_score': defect_probability,
                'action_required': 'continue_processing'
            }
    
    async def _object_detection_inference(self, frame_data: bytes) -> Dict[str, Any]:
        """Simulate object detection inference"""
        # Simulate processing time
        await asyncio.sleep(0.008)  # 8ms processing time
        
        # Simulate object detection
        detected_objects = []
        
        # Random number of objects (0-3)
        num_objects = np.random.randint(0, 4)
        
        for i in range(num_objects):
            obj = {
                'class': np.random.choice(['part', 'tool', 'defect']),
                'confidence': np.random.uniform(0.5, 0.95),
                'bbox': [
                    np.random.randint(0, 200),  # x
                    np.random.randint(0, 200),  # y
                    np.random.randint(50, 150), # width
                    np.random.randint(50, 150)  # height
                ]
            }
            detected_objects.append(obj)
        
        return {
            'success': True,
            'objects_detected': detected_objects,
            'object_count': len(detected_objects)
        }
    
    async def _safety_monitoring_inference(self, frame_data: bytes) -> Dict[str, Any]:
        """Simulate safety monitoring inference"""
        # Simulate processing time
        await asyncio.sleep(0.003)  # 3ms processing time
        
        # Simulate safety assessment
        safety_score = np.random.random()
        
        if safety_score < 0.1:  # 10% chance of safety issue
            return {
                'success': True,
                'safety_violation': True,
                'violation_type': 'person_in_danger_zone',
                'severity': 'high',
                'action_required': 'emergency_stop',
                'confidence': 1.0 - safety_score
            }
        else:
            return {
                'success': True,
                'safety_violation': False,
                'safety_score': safety_score,
                'action_required': 'continue_monitoring'
            }
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """Get vision processing statistics"""
        return {
            'total_frames_processed': sum(self.processing_stats.values()),
            'processing_breakdown': dict(self.processing_stats),
            'buffer_utilization': len(self.frame_buffer) / self.frame_buffer.maxlen,
            'models_loaded': list(self.models.keys())
        }

# Edge Node Manager
class EdgeNodeManager:
    """Manage edge nodes and their capabilities"""

    def __init__(self):
        self.nodes: Dict[str, EdgeNodeInfo] = {}
        self.heartbeat_timeout = 30  # seconds
        self.performance_history = defaultdict(list)

    async def register_edge_node(self, node_info: EdgeNodeInfo) -> bool:
        """Register a new edge node"""
        try:
            self.nodes[node_info.node_id] = node_info

            # Start heartbeat monitoring
            asyncio.create_task(self._monitor_node_heartbeat(node_info.node_id))

            logger.info(f"Edge node {node_info.node_id} registered successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to register edge node {node_info.node_id}: {e}")
            return False

    async def update_node_status(self, node_id: str, status: EdgeNodeStatus,
                               metrics: Dict[str, float] = None) -> bool:
        """Update edge node status and metrics"""
        if node_id not in self.nodes:
            return False

        node = self.nodes[node_id]
        node.status = status
        node.last_heartbeat = datetime.now(timezone.utc)

        if metrics:
            node.performance_metrics.update(metrics)

            # Record performance history
            self.performance_history[node_id].append({
                'timestamp': time.time(),
                'metrics': metrics.copy()
            })

            # Keep only last 1000 entries
            if len(self.performance_history[node_id]) > 1000:
                self.performance_history[node_id] = self.performance_history[node_id][-1000:]

        return True

    async def get_available_nodes(self, required_capabilities: List[str] = None) -> List[EdgeNodeInfo]:
        """Get available edge nodes with optional capability filtering"""
        available_nodes = []

        for node in self.nodes.values():
            if node.status == EdgeNodeStatus.ONLINE:
                # Check heartbeat
                time_since_heartbeat = (datetime.now(timezone.utc) - node.last_heartbeat).total_seconds()
                if time_since_heartbeat <= self.heartbeat_timeout:

                    # Check capabilities if required
                    if required_capabilities:
                        if all(cap in node.capabilities for cap in required_capabilities):
                            available_nodes.append(node)
                    else:
                        available_nodes.append(node)

        return available_nodes

    async def _monitor_node_heartbeat(self, node_id: str):
        """Monitor node heartbeat and update status"""
        while node_id in self.nodes:
            try:
                node = self.nodes[node_id]
                time_since_heartbeat = (datetime.now(timezone.utc) - node.last_heartbeat).total_seconds()

                if time_since_heartbeat > self.heartbeat_timeout:
                    if node.status == EdgeNodeStatus.ONLINE:
                        node.status = EdgeNodeStatus.OFFLINE
                        logger.warning(f"Edge node {node_id} marked as offline due to heartbeat timeout")

                await asyncio.sleep(10)  # Check every 10 seconds

            except Exception as e:
                logger.error(f"Error monitoring heartbeat for node {node_id}: {e}")
                await asyncio.sleep(10)

    def get_node_performance_stats(self, node_id: str) -> Dict[str, Any]:
        """Get performance statistics for a node"""
        if node_id not in self.performance_history:
            return {}

        history = self.performance_history[node_id]
        if not history:
            return {}

        # Calculate statistics
        recent_metrics = history[-100:]  # Last 100 entries

        stats = {}
        for metric_name in ['cpu_usage', 'memory_usage', 'processing_time_ms']:
            values = [entry['metrics'].get(metric_name, 0) for entry in recent_metrics if metric_name in entry['metrics']]
            if values:
                stats[metric_name] = {
                    'avg': np.mean(values),
                    'max': np.max(values),
                    'min': np.min(values),
                    'current': values[-1] if values else 0
                }

        return stats

# Autonomous Operation Manager
class AutonomousOperationManager:
    """Manage autonomous operation during cloud disconnection"""

    def __init__(self):
        self.cloud_connected = True
        self.autonomous_mode = False
        self.local_decision_cache = {}
        self.offline_task_queue = deque()
        self.sync_pending = deque()
        self.last_cloud_sync = datetime.now(timezone.utc)

    async def check_cloud_connectivity(self) -> bool:
        """Check connectivity to cloud services"""
        try:
            # Simulate cloud connectivity check
            # In real implementation, would ping cloud services
            await asyncio.sleep(0.001)  # Simulate network check

            # Simulate occasional disconnection for testing
            if np.random.random() < 0.05:  # 5% chance of disconnection
                return False

            return True

        except Exception as e:
            logger.error(f"Cloud connectivity check failed: {e}")
            return False

    async def enable_autonomous_mode(self):
        """Enable autonomous operation mode"""
        self.autonomous_mode = True
        self.cloud_connected = False

        logger.warning("Autonomous mode enabled - operating without cloud connectivity")

        # Start autonomous operation tasks
        asyncio.create_task(self._autonomous_decision_loop())
        asyncio.create_task(self._periodic_cloud_sync_attempt())

    async def disable_autonomous_mode(self):
        """Disable autonomous mode and sync with cloud"""
        self.autonomous_mode = False
        self.cloud_connected = True

        logger.info("Autonomous mode disabled - cloud connectivity restored")

        # Sync pending data with cloud
        await self._sync_with_cloud()

    async def make_autonomous_decision(self, request: DecisionRequest) -> DecisionResult:
        """Make decision autonomously using local models"""
        start_time = time.perf_counter_ns()

        try:
            # Check local cache first
            cache_key = f"{request.type.value}_{hash(str(request.input_data))}"
            if cache_key in self.local_decision_cache:
                cached_result = self.local_decision_cache[cache_key]
                processing_time = (time.perf_counter_ns() - start_time) / 1_000_000

                return DecisionResult(
                    request_id=request.id,
                    decision=cached_result['decision'],
                    confidence=cached_result['confidence'] * 0.9,  # Slightly lower confidence for cached
                    processing_time_ms=processing_time,
                    model_used='local_cache',
                    fallback_used=True
                )

            # Make decision using local models
            if request.type == DecisionType.TASK_ROUTING:
                decision = await self._local_task_routing_decision(request)
            elif request.type == DecisionType.SAFETY_RESPONSE:
                decision = await self._local_safety_decision(request)
            elif request.type == DecisionType.RESOURCE_ALLOCATION:
                decision = await self._local_resource_decision(request)
            else:
                decision = await self._fallback_decision(request)

            processing_time = (time.perf_counter_ns() - start_time) / 1_000_000

            # Cache decision
            self.local_decision_cache[cache_key] = {
                'decision': decision,
                'confidence': 0.7,  # Lower confidence for autonomous decisions
                'timestamp': time.time()
            }

            # Add to sync queue
            self.sync_pending.append({
                'type': 'decision',
                'request': asdict(request),
                'result': decision,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })

            return DecisionResult(
                request_id=request.id,
                decision=decision,
                confidence=0.7,
                processing_time_ms=processing_time,
                model_used='local_autonomous',
                fallback_used=True
            )

        except Exception as e:
            processing_time = (time.perf_counter_ns() - start_time) / 1_000_000
            logger.error(f"Autonomous decision error: {e}")

            return DecisionResult(
                request_id=request.id,
                decision={'error': str(e)},
                confidence=0.0,
                processing_time_ms=processing_time,
                model_used='error_fallback',
                fallback_used=True
            )

    async def _local_task_routing_decision(self, request: DecisionRequest) -> Dict[str, Any]:
        """Make local task routing decision"""
        # Simple rule-based routing
        task_data = request.input_data

        if task_data.get('safety_critical', False):
            return {
                'routing_strategy': 'safety_first',
                'assigned_agent': 'safety_certified_agent',
                'priority_boost': True
            }
        elif task_data.get('precision_required', False):
            return {
                'routing_strategy': 'precision_first',
                'assigned_agent': 'high_precision_robot',
                'quality_checks': True
            }
        else:
            return {
                'routing_strategy': 'load_balance',
                'assigned_agent': 'least_loaded_agent',
                'standard_processing': True
            }

    async def _local_safety_decision(self, request: DecisionRequest) -> Dict[str, Any]:
        """Make local safety decision"""
        safety_data = request.input_data

        # Conservative safety decisions
        if safety_data.get('emergency_detected', False):
            return {
                'action': 'emergency_stop_all',
                'severity': 'critical',
                'immediate': True
            }
        elif safety_data.get('hazard_detected', False):
            return {
                'action': 'pause_operations',
                'severity': 'high',
                'investigation_required': True
            }
        else:
            return {
                'action': 'continue_monitoring',
                'severity': 'low',
                'normal_operation': True
            }

    async def _local_resource_decision(self, request: DecisionRequest) -> Dict[str, Any]:
        """Make local resource allocation decision"""
        # Simple resource allocation
        return {
            'allocation_strategy': 'conservative',
            'resource_limits': {
                'cpu': 0.8,
                'memory': 0.7,
                'network': 0.6
            },
            'priority_queue': True
        }

    async def _fallback_decision(self, request: DecisionRequest) -> Dict[str, Any]:
        """Fallback decision for unknown request types"""
        return {
            'decision_type': 'fallback',
            'action': 'maintain_status_quo',
            'confidence': 0.3,
            'requires_manual_review': True
        }

    async def _autonomous_decision_loop(self):
        """Process autonomous decisions from queue"""
        while self.autonomous_mode:
            try:
                if self.offline_task_queue:
                    task = self.offline_task_queue.popleft()
                    # Process task autonomously
                    logger.info(f"Processing autonomous task: {task.get('id', 'unknown')}")

                await asyncio.sleep(0.1)  # Process every 100ms

            except Exception as e:
                logger.error(f"Error in autonomous decision loop: {e}")
                await asyncio.sleep(1)

    async def _periodic_cloud_sync_attempt(self):
        """Periodically attempt to reconnect to cloud"""
        while self.autonomous_mode:
            try:
                if await self.check_cloud_connectivity():
                    await self.disable_autonomous_mode()
                    break

                await asyncio.sleep(30)  # Try every 30 seconds

            except Exception as e:
                logger.error(f"Error in cloud sync attempt: {e}")
                await asyncio.sleep(30)

    async def _sync_with_cloud(self):
        """Sync pending data with cloud"""
        try:
            sync_count = len(self.sync_pending)

            # In real implementation, would send data to cloud
            logger.info(f"Syncing {sync_count} pending items with cloud")

            # Clear sync queue
            self.sync_pending.clear()
            self.last_cloud_sync = datetime.now(timezone.utc)

        except Exception as e:
            logger.error(f"Error syncing with cloud: {e}")

# Global instances
task_router = RealTimeTaskRouter()
vision_processor = EdgeVisionProcessor()
edge_node_manager = EdgeNodeManager()
autonomous_manager = AutonomousOperationManager()
edge_nodes: Dict[str, EdgeNodeInfo] = {}
active_agents: Dict[str, Agent] = {}

# Pydantic models for API
class EdgeTaskRequest(BaseModel):
    type: str
    priority: TaskPriority
    data: Dict[str, Any]
    deadline: Optional[str] = None  # ISO format
    requires_cloud: bool = False

class AgentRequest(BaseModel):
    id: str
    type: str
    capabilities: Dict[str, float]
    current_load: float = 0.0
    status: str = "available"

class EdgeNodeRequest(BaseModel):
    node_id: str
    facility_id: str
    capabilities: List[str]
    current_load: float = 0.0

class DecisionRequestModel(BaseModel):
    type: DecisionType
    priority: TaskPriority
    input_data: Dict[str, Any]
    context: Dict[str, Any] = {}
    deadline_ms: int = 1000

class VisionProcessingRequest(BaseModel):
    processing_type: str
    frame_data: str  # Base64 encoded

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Edge Computing Architecture",
        "version": "1.0.0",
        "description": "Real-time decision making with sub-10ms latency and autonomous operation",
        "features": [
            "sub_10ms_decision_making",
            "real_time_computer_vision",
            "autonomous_operation",
            "edge_node_management",
            "cloud_synchronization"
        ],
        "status": {
            "autonomous_mode": autonomous_manager.autonomous_mode,
            "cloud_connected": autonomous_manager.cloud_connected,
            "active_nodes": len(edge_node_manager.nodes),
            "active_agents": len(active_agents)
        }
    }

@app.get("/health")
async def health_check():
    # Check cloud connectivity
    cloud_status = await autonomous_manager.check_cloud_connectivity()

    return {
        "status": "healthy",
        "service": "edge-computing",
        "components": {
            "task_router": "operational",
            "vision_processor": "operational",
            "edge_node_manager": "operational",
            "autonomous_manager": "operational"
        },
        "connectivity": {
            "cloud_connected": cloud_status,
            "autonomous_mode": autonomous_manager.autonomous_mode,
            "last_cloud_sync": autonomous_manager.last_cloud_sync.isoformat()
        },
        "performance": {
            "active_nodes": len(edge_node_manager.nodes),
            "active_agents": len(active_agents),
            "cache_size": len(task_router.decision_cache)
        }
    }

@app.post("/api/v1/agents/register")
async def register_agent(agent_request: AgentRequest):
    """Register an agent with the edge computing system"""
    try:
        agent = Agent(
            id=agent_request.id,
            type=agent_request.type,
            capabilities=agent_request.capabilities,
            current_load=agent_request.current_load,
            status=agent_request.status,
            last_heartbeat=datetime.now(timezone.utc)
        )

        active_agents[agent.id] = agent

        return {
            "success": True,
            "message": f"Agent {agent.id} registered successfully",
            "agent_id": agent.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/agents")
async def list_agents():
    """List all active agents"""
    try:
        return {
            "agents": [asdict(agent) for agent in active_agents.values()],
            "total_count": len(active_agents)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/nodes/register")
async def register_edge_node(node_request: EdgeNodeRequest):
    """Register an edge node"""
    try:
        node_info = EdgeNodeInfo(
            node_id=node_request.node_id,
            facility_id=node_request.facility_id,
            status=EdgeNodeStatus.ONLINE,
            capabilities=node_request.capabilities,
            current_load=node_request.current_load,
            last_heartbeat=datetime.now(timezone.utc),
            performance_metrics={}
        )

        success = await edge_node_manager.register_edge_node(node_info)

        if success:
            return {
                "success": True,
                "message": f"Edge node {node_request.node_id} registered successfully",
                "node_id": node_request.node_id
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to register edge node")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/nodes")
async def list_edge_nodes():
    """List all edge nodes"""
    try:
        return {
            "nodes": [asdict(node) for node in edge_node_manager.nodes.values()],
            "total_count": len(edge_node_manager.nodes)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/nodes/{node_id}")
async def get_edge_node_details(node_id: str):
    """Get detailed information about an edge node"""
    try:
        if node_id not in edge_node_manager.nodes:
            raise HTTPException(status_code=404, detail="Edge node not found")

        node = edge_node_manager.nodes[node_id]
        performance_stats = edge_node_manager.get_node_performance_stats(node_id)

        return {
            "node": asdict(node),
            "performance_stats": performance_stats
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/tasks/route")
async def route_task(task_request: EdgeTaskRequest):
    """Route a task using real-time decision making"""
    try:
        # Convert request to EdgeTask
        deadline = None
        if task_request.deadline:
            deadline = datetime.fromisoformat(task_request.deadline.replace('Z', '+00:00'))

        task = EdgeTask(
            id=str(uuid.uuid4()),
            type=task_request.type,
            priority=task_request.priority,
            data=task_request.data,
            created_at=datetime.now(timezone.utc),
            deadline=deadline,
            requires_cloud=task_request.requires_cloud
        )

        # Get available agents
        available_agents = list(active_agents.values())

        if not available_agents:
            raise HTTPException(status_code=400, detail="No agents available")

        # Route task
        routing_result = await task_router.route_task_realtime(task, available_agents)

        return {
            "task_id": task.id,
            "routing_result": routing_result,
            "processing_time_ms": routing_result.get('processing_time_ms', 0)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/decisions/make")
async def make_decision(decision_request: DecisionRequestModel):
    """Make a real-time decision"""
    try:
        request = DecisionRequest(
            id=str(uuid.uuid4()),
            type=decision_request.type,
            priority=decision_request.priority,
            input_data=decision_request.input_data,
            context=decision_request.context,
            created_at=datetime.now(timezone.utc),
            deadline_ms=decision_request.deadline_ms
        )

        # Check if we should use autonomous mode
        if autonomous_manager.autonomous_mode or not autonomous_manager.cloud_connected:
            result = await autonomous_manager.make_autonomous_decision(request)
        else:
            # Use cloud-connected decision making (simplified for demo)
            start_time = time.perf_counter_ns()

            # Simulate cloud decision making
            await asyncio.sleep(0.01)  # 10ms cloud latency

            processing_time = (time.perf_counter_ns() - start_time) / 1_000_000

            result = DecisionResult(
                request_id=request.id,
                decision={'cloud_decision': 'optimal_choice'},
                confidence=0.95,
                processing_time_ms=processing_time,
                model_used='cloud_ml_model',
                fallback_used=False
            )

        return {
            "request_id": request.id,
            "result": asdict(result)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vision/process")
async def process_vision(vision_request: VisionProcessingRequest):
    """Process vision data in real-time"""
    try:
        import base64

        # Decode frame data
        frame_data = base64.b64decode(vision_request.frame_data)

        # Process vision
        result = await vision_processor.process_vision_stream(
            frame_data, vision_request.processing_type
        )

        return {
            "processing_type": vision_request.processing_type,
            "result": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/performance/routing")
async def get_routing_performance():
    """Get task routing performance statistics"""
    try:
        return {
            "routing_performance": task_router.get_performance_stats(),
            "cache_stats": {
                "cache_size": len(task_router.decision_cache),
                "max_cache_size": task_router.cache_max_size,
                "cache_utilization": len(task_router.decision_cache) / task_router.cache_max_size
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/performance/vision")
async def get_vision_performance():
    """Get vision processing performance statistics"""
    try:
        return {
            "vision_performance": vision_processor.get_processing_stats()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/autonomous/enable")
async def enable_autonomous_mode():
    """Enable autonomous operation mode"""
    try:
        await autonomous_manager.enable_autonomous_mode()

        return {
            "success": True,
            "message": "Autonomous mode enabled",
            "autonomous_mode": autonomous_manager.autonomous_mode
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/autonomous/disable")
async def disable_autonomous_mode():
    """Disable autonomous operation mode"""
    try:
        await autonomous_manager.disable_autonomous_mode()

        return {
            "success": True,
            "message": "Autonomous mode disabled",
            "autonomous_mode": autonomous_manager.autonomous_mode
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/autonomous/status")
async def get_autonomous_status():
    """Get autonomous operation status"""
    try:
        return {
            "autonomous_mode": autonomous_manager.autonomous_mode,
            "cloud_connected": autonomous_manager.cloud_connected,
            "last_cloud_sync": autonomous_manager.last_cloud_sync.isoformat(),
            "pending_sync_items": len(autonomous_manager.sync_pending),
            "offline_task_queue": len(autonomous_manager.offline_task_queue),
            "local_cache_size": len(autonomous_manager.local_decision_cache)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/nodes/{node_id}/heartbeat")
async def update_node_heartbeat(node_id: str, metrics: Dict[str, float] = None):
    """Update edge node heartbeat and metrics"""
    try:
        if metrics is None:
            metrics = {}

        success = await edge_node_manager.update_node_status(
            node_id, EdgeNodeStatus.ONLINE, metrics
        )

        if success:
            return {
                "success": True,
                "message": f"Heartbeat updated for node {node_id}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail="Edge node not found")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time edge monitoring
@app.websocket("/ws/edge")
async def edge_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time edge monitoring"""
    await websocket.accept()

    try:
        while True:
            # Send edge status updates
            edge_update = {
                "type": "edge_status_update",
                "data": {
                    "autonomous_mode": autonomous_manager.autonomous_mode,
                    "cloud_connected": autonomous_manager.cloud_connected,
                    "active_nodes": len(edge_node_manager.nodes),
                    "active_agents": len(active_agents),
                    "cache_utilization": len(task_router.decision_cache) / task_router.cache_max_size,
                    "performance_stats": task_router.get_performance_stats()
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            await websocket.send_json(edge_update)
            await asyncio.sleep(1)  # Send updates every second

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8006)
