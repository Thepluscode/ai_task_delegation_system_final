#!/usr/bin/env python3
"""
Edge AI Engine for Real-time Decision Making
Provides sub-10ms response times for safety-critical applications
"""

import asyncio
import json
import logging
import time
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import threading
from concurrent.futures import ThreadPoolExecutor

# ML and AI imports (with fallbacks for testing)
try:
    import torch
    import torch.nn as nn
    import onnxruntime as ort
    from sklearn.preprocessing import StandardScaler
    import joblib
    ML_AVAILABLE = True
except ImportError:
    # Fallback for testing without ML dependencies
    ML_AVAILABLE = False
    torch = None
    ort = None
    StandardScaler = None
    joblib = None

# Communication imports (with fallbacks for testing)
try:
    import websockets
    import paho.mqtt.client as mqtt
    import grpc
    from concurrent import futures
    COMM_AVAILABLE = True
except ImportError:
    # Fallback for testing without communication dependencies
    COMM_AVAILABLE = False
    websockets = None
    mqtt = None
    grpc = None
    futures = None

logger = logging.getLogger(__name__)

class EdgeDecisionType(str, Enum):
    SAFETY_CRITICAL = "safety_critical"
    PERFORMANCE_OPTIMIZATION = "performance_optimization"
    RESOURCE_ALLOCATION = "resource_allocation"
    COORDINATION = "coordination"

@dataclass
class EdgeNode:
    node_id: str
    location: Dict[str, float]
    capabilities: List[str]
    current_load: float
    max_capacity: int
    connected_devices: List[str]
    last_heartbeat: datetime
    status: str = "active"

class EdgeAIEngine:
    """High-performance edge AI engine for real-time decision making"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.decision_cache = {}
        self.performance_metrics = {}
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.initialize_models()
        
    def initialize_models(self):
        """Initialize lightweight AI models for edge processing"""
        if ML_AVAILABLE:
            try:
                # Load pre-trained ONNX models for fast inference
                self.models['safety_classifier'] = ort.InferenceSession(
                    'models/safety_classifier.onnx',
                    providers=['CPUExecutionProvider']
                )

                self.models['task_router'] = ort.InferenceSession(
                    'models/task_router.onnx',
                    providers=['CPUExecutionProvider']
                )

                self.models['performance_predictor'] = ort.InferenceSession(
                    'models/performance_predictor.onnx',
                    providers=['CPUExecutionProvider']
                )

                # Load feature scalers
                self.scalers['safety'] = joblib.load('models/safety_scaler.pkl')
                self.scalers['performance'] = joblib.load('models/performance_scaler.pkl')

                logger.info("Edge AI models loaded successfully")
                return

            except Exception as e:
                logger.warning(f"Could not load AI models: {str(e)}")

        # Initialize fallback rule-based models
        logger.info("Using fallback rule-based models for testing")
        self.initialize_fallback_models()
    
    def initialize_fallback_models(self):
        """Initialize rule-based fallback models"""
        self.models['safety_classifier'] = self._rule_based_safety_classifier
        self.models['task_router'] = self._rule_based_task_router
        self.models['performance_predictor'] = self._rule_based_performance_predictor
        logger.info("Fallback rule-based models initialized")
    
    async def make_execution_decision(
        self, 
        request: Any, 
        analysis: Dict[str, Any], 
        decision_factors: Dict[str, float]
    ) -> Dict[str, Any]:
        """Make real-time execution decision with sub-10ms target"""
        start_time = time.perf_counter()
        
        try:
            # Extract features for ML models
            features = self._extract_decision_features(request, analysis, decision_factors)
            
            # Run parallel inference on multiple models
            tasks = [
                self._classify_safety_level(features),
                self._predict_performance(features),
                self._route_execution(features)
            ]
            
            safety_result, performance_result, routing_result = await asyncio.gather(*tasks)
            
            # Combine results using weighted decision logic
            final_decision = self._combine_decisions(
                safety_result, performance_result, routing_result, decision_factors
            )
            
            # Add execution timing
            execution_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
            final_decision['execution_time_ms'] = execution_time
            
            # Cache decision for similar future requests
            cache_key = self._generate_cache_key(features)
            self.decision_cache[cache_key] = final_decision
            
            # Update performance metrics
            self._update_performance_metrics(execution_time, final_decision)
            
            return final_decision
            
        except Exception as e:
            logger.error(f"Edge decision making failed: {str(e)}")
            # Return safe fallback decision
            return self._safe_fallback_decision(request, analysis)
    
    def _extract_decision_features(
        self, 
        request: Any, 
        analysis: Dict[str, Any], 
        decision_factors: Dict[str, float]
    ) -> np.ndarray:
        """Extract numerical features for ML models"""
        features = [
            decision_factors.get('latency_score', 0.5),
            decision_factors.get('safety_score', 0.5),
            decision_factors.get('complexity_score', 0.5),
            decision_factors.get('resource_score', 0.5),
            decision_factors.get('availability_score', 0.5),
            request.max_latency / 1000.0,  # Normalize to seconds
            len(request.parameters),
            1.0 if request.safety_level == 'critical' else 0.5 if request.safety_level == 'high' else 0.0,
            analysis.get('command_complexity', {}).get('score', 0.5),
            analysis.get('resource_requirements', {}).get('cpu_score', 0.5),
            analysis.get('resource_requirements', {}).get('memory_score', 0.5),
            analysis.get('safety_analysis', {}).get('risk_score', 0.5)
        ]
        
        return np.array(features, dtype=np.float32).reshape(1, -1)
    
    async def _classify_safety_level(self, features: np.ndarray) -> Dict[str, Any]:
        """Classify safety requirements using ML model"""
        try:
            if callable(self.models['safety_classifier']):
                # Rule-based fallback
                return self.models['safety_classifier'](features)

            if ML_AVAILABLE and self.scalers.get('safety'):
                # ML model inference
                scaled_features = self.scalers['safety'].transform(features)
                input_dict = {self.models['safety_classifier'].get_inputs()[0].name: scaled_features}
                output = self.models['safety_classifier'].run(None, input_dict)

                safety_score = float(output[0][0])

                return {
                    'safety_score': safety_score,
                    'requires_edge': safety_score > 0.7,
                    'confidence': min(abs(safety_score - 0.5) * 2, 1.0)
                }
            else:
                # Use rule-based fallback
                return self._rule_based_safety_classifier(features)

        except Exception as e:
            logger.error(f"Safety classification failed: {str(e)}")
            return {'safety_score': 0.5, 'requires_edge': False, 'confidence': 0.0}
    
    async def _predict_performance(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict performance characteristics"""
        try:
            if callable(self.models['performance_predictor']):
                return self.models['performance_predictor'](features)
            
            scaled_features = self.scalers['performance'].transform(features)
            input_dict = {self.models['performance_predictor'].get_inputs()[0].name: scaled_features}
            output = self.models['performance_predictor'].run(None, input_dict)
            
            edge_latency = float(output[0][0])
            cloud_latency = float(output[0][1])
            edge_accuracy = float(output[0][2])
            cloud_accuracy = float(output[0][3])
            
            return {
                'edge_latency_ms': edge_latency,
                'cloud_latency_ms': cloud_latency,
                'edge_accuracy': edge_accuracy,
                'cloud_accuracy': cloud_accuracy,
                'performance_advantage': 'edge' if edge_latency < cloud_latency else 'cloud'
            }
            
        except Exception as e:
            logger.error(f"Performance prediction failed: {str(e)}")
            return {
                'edge_latency_ms': 5.0,
                'cloud_latency_ms': 50.0,
                'edge_accuracy': 0.9,
                'cloud_accuracy': 0.95,
                'performance_advantage': 'edge'
            }
    
    async def _route_execution(self, features: np.ndarray) -> Dict[str, Any]:
        """Determine optimal execution location"""
        try:
            if callable(self.models['task_router']):
                return self.models['task_router'](features)
            
            input_dict = {self.models['task_router'].get_inputs()[0].name: features}
            output = self.models['task_router'].run(None, input_dict)
            
            # Output is probability distribution over [edge, cloud, hybrid]
            probabilities = output[0][0]
            locations = ['edge', 'cloud', 'hybrid']
            best_location = locations[np.argmax(probabilities)]
            confidence = float(np.max(probabilities))
            
            return {
                'recommended_location': best_location,
                'confidence': confidence,
                'probabilities': {
                    'edge': float(probabilities[0]),
                    'cloud': float(probabilities[1]),
                    'hybrid': float(probabilities[2])
                }
            }
            
        except Exception as e:
            logger.error(f"Execution routing failed: {str(e)}")
            return {
                'recommended_location': 'edge',
                'confidence': 0.5,
                'probabilities': {'edge': 0.5, 'cloud': 0.3, 'hybrid': 0.2}
            }
    
    def _combine_decisions(
        self, 
        safety_result: Dict[str, Any], 
        performance_result: Dict[str, Any], 
        routing_result: Dict[str, Any],
        decision_factors: Dict[str, float]
    ) -> Dict[str, Any]:
        """Combine multiple decision inputs into final recommendation"""
        
        # Weight factors
        safety_weight = 0.4
        performance_weight = 0.3
        routing_weight = 0.3
        
        # Calculate weighted scores for each location
        edge_score = (
            (1.0 if safety_result['requires_edge'] else 0.0) * safety_weight +
            (1.0 if performance_result['performance_advantage'] == 'edge' else 0.0) * performance_weight +
            routing_result['probabilities']['edge'] * routing_weight
        )
        
        cloud_score = (
            (0.0 if safety_result['requires_edge'] else 0.5) * safety_weight +
            (1.0 if performance_result['performance_advantage'] == 'cloud' else 0.0) * performance_weight +
            routing_result['probabilities']['cloud'] * routing_weight
        )
        
        hybrid_score = (
            0.3 * safety_weight +  # Hybrid can handle some safety requirements
            0.7 * performance_weight +  # Good performance balance
            routing_result['probabilities']['hybrid'] * routing_weight
        )
        
        # Determine final location
        scores = {'edge': edge_score, 'cloud': cloud_score, 'hybrid': hybrid_score}
        best_location = max(scores, key=scores.get)
        confidence = scores[best_location]
        
        # Generate reasoning
        reasoning = []
        if safety_result['requires_edge']:
            reasoning.append("Safety-critical requirements favor edge execution")
        if performance_result['edge_latency_ms'] < 10:
            reasoning.append("Ultra-low latency achievable on edge")
        if performance_result['performance_advantage'] == 'cloud':
            reasoning.append("Complex processing benefits from cloud resources")
        if best_location == 'hybrid':
            reasoning.append("Hybrid execution balances performance and resource requirements")
        
        # Generate fallback plan
        fallback_plan = {
            'primary_failure': 'cloud' if best_location == 'edge' else 'edge',
            'communication_failure': 'local_cache_and_retry',
            'resource_exhaustion': 'scale_up_or_queue',
            'quality_degradation': 'human_intervention'
        }
        
        return {
            'location': best_location,
            'confidence': confidence,
            'scores': scores,
            'reasoning': reasoning,
            'fallback_plan': fallback_plan,
            'safety_analysis': safety_result,
            'performance_prediction': performance_result,
            'routing_recommendation': routing_result
        }
    
    def _safe_fallback_decision(self, request: Any, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate safe fallback decision when ML models fail"""
        # Conservative approach: prefer edge for safety, cloud for complexity
        if request.safety_level in ['critical', 'high']:
            location = 'edge'
            reasoning = ["Safety-critical task requires edge execution for immediate response"]
        elif analysis.get('command_complexity', {}).get('level') in ['critical', 'complex']:
            location = 'cloud'
            reasoning = ["Complex task requires cloud resources"]
        else:
            location = 'hybrid'
            reasoning = ["Balanced approach for moderate complexity task"]
        
        return {
            'location': location,
            'confidence': 0.7,
            'reasoning': reasoning,
            'fallback_plan': {
                'primary_failure': 'cloud' if location == 'edge' else 'edge',
                'communication_failure': 'local_execution',
                'resource_exhaustion': 'queue_and_retry'
            },
            'fallback_used': True
        }
    
    # Rule-based fallback models
    def _rule_based_safety_classifier(self, features: np.ndarray) -> Dict[str, Any]:
        """Rule-based safety classification"""
        safety_score = features[0][7]  # Safety level feature
        latency_requirement = features[0][5]  # Latency requirement
        
        requires_edge = safety_score > 0.5 or latency_requirement < 0.1
        
        return {
            'safety_score': safety_score,
            'requires_edge': requires_edge,
            'confidence': 0.8 if requires_edge else 0.6
        }
    
    def _rule_based_performance_predictor(self, features: np.ndarray) -> Dict[str, Any]:
        """Rule-based performance prediction"""
        complexity = features[0][8]  # Command complexity
        
        if complexity < 0.3:
            edge_latency, cloud_latency = 3.0, 45.0
            edge_accuracy, cloud_accuracy = 0.92, 0.95
        elif complexity < 0.7:
            edge_latency, cloud_latency = 8.0, 35.0
            edge_accuracy, cloud_accuracy = 0.88, 0.96
        else:
            edge_latency, cloud_latency = 15.0, 25.0
            edge_accuracy, cloud_accuracy = 0.82, 0.98
        
        return {
            'edge_latency_ms': edge_latency,
            'cloud_latency_ms': cloud_latency,
            'edge_accuracy': edge_accuracy,
            'cloud_accuracy': cloud_accuracy,
            'performance_advantage': 'edge' if edge_latency < cloud_latency else 'cloud'
        }
    
    def _rule_based_task_router(self, features: np.ndarray) -> Dict[str, Any]:
        """Rule-based task routing"""
        latency_score = features[0][0]
        safety_score = features[0][1]
        complexity_score = features[0][2]
        
        if latency_score > 0.7 or safety_score > 0.7:
            location = 'edge'
            probabilities = [0.8, 0.1, 0.1]
        elif complexity_score > 0.7:
            location = 'cloud'
            probabilities = [0.1, 0.8, 0.1]
        else:
            location = 'hybrid'
            probabilities = [0.3, 0.3, 0.4]
        
        return {
            'recommended_location': location,
            'confidence': max(probabilities),
            'probabilities': {
                'edge': probabilities[0],
                'cloud': probabilities[1],
                'hybrid': probabilities[2]
            }
        }
    
    def _generate_cache_key(self, features: np.ndarray) -> str:
        """Generate cache key for decision caching"""
        # Round features to reduce cache size
        rounded_features = np.round(features, 2)
        return hash(rounded_features.tobytes())
    
    def _update_performance_metrics(self, execution_time: float, decision: Dict[str, Any]):
        """Update performance tracking metrics"""
        if 'performance_metrics' not in self.__dict__:
            self.performance_metrics = {
                'total_decisions': 0,
                'avg_execution_time': 0.0,
                'sub_10ms_decisions': 0,
                'edge_decisions': 0,
                'cloud_decisions': 0,
                'hybrid_decisions': 0
            }
        
        metrics = self.performance_metrics
        metrics['total_decisions'] += 1
        
        # Update average execution time
        metrics['avg_execution_time'] = (
            (metrics['avg_execution_time'] * (metrics['total_decisions'] - 1) + execution_time) /
            metrics['total_decisions']
        )
        
        # Track sub-10ms performance
        if execution_time < 10.0:
            metrics['sub_10ms_decisions'] += 1
        
        # Track decision distribution
        location = decision.get('location', 'unknown')
        if location in metrics:
            metrics[f'{location}_decisions'] += 1

class DeviceGateway:
    """Gateway for managing edge device communication"""
    
    def __init__(self):
        self.edge_nodes = {}
        self.device_connections = {}
        self.communication_protocols = ['mqtt', 'websocket', 'grpc', 'rest']
        
    async def get_edge_node(self, robot_id: str) -> EdgeNode:
        """Get the edge node responsible for a specific robot"""
        # For now, return a mock edge node
        # In production, this would query the actual edge infrastructure
        return EdgeNode(
            node_id=f"edge-{hash(robot_id) % 100}",
            location={"lat": 37.7749, "lng": -122.4194},
            capabilities=["ai_inference", "device_control", "safety_monitoring"],
            current_load=0.3,
            max_capacity=100,
            connected_devices=[robot_id],
            last_heartbeat=datetime.utcnow()
        )

class EdgeAnalytics:
    """Real-time analytics processing on edge nodes"""
    
    def __init__(self):
        self.analytics_cache = {}
        self.streaming_processors = {}
        
    async def process_real_time_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process streaming data with minimal latency"""
        # Implement real-time analytics processing
        pass
