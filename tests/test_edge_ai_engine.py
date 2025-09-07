#!/usr/bin/env python3
"""
Test Suite for Edge AI Engine
Tests sub-10ms decision making, ML model inference, and edge-cloud routing
"""

import pytest
import asyncio
import time
import numpy as np
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'enhanced-robot-control-service'))

from edge_integration import EdgeAIEngine, EdgeDecisionType, EdgeNode
from device_abstraction import RobotCommand, CommandType

class TestEdgeAIEngine:
    """Test suite for Edge AI Engine functionality"""
    
    @pytest.fixture
    async def edge_engine(self):
        """Create EdgeAIEngine instance for testing"""
        engine = EdgeAIEngine()
        await engine.initialize_models()
        return engine
    
    @pytest.fixture
    def sample_request(self):
        """Sample robot control request for testing"""
        return Mock(
            robot_id="test_robot_001",
            command="move",
            parameters={"target": {"x": 1.0, "y": 2.0}},
            max_latency=10.0,
            safety_level="high",
            priority="medium"
        )
    
    @pytest.fixture
    def sample_analysis(self):
        """Sample analysis data for testing"""
        return {
            "robot_status": {"is_operational": True, "current_load": 0.3},
            "command_complexity": {"level": "medium", "score": 0.5},
            "safety_analysis": {"level": "high", "risk_score": 0.2},
            "resource_requirements": {"cpu_score": 0.4, "memory_score": 0.3}
        }
    
    @pytest.fixture
    def sample_decision_factors(self):
        """Sample decision factors for testing"""
        return {
            "latency_score": 0.8,
            "safety_score": 0.9,
            "complexity_score": 0.4,
            "resource_score": 0.6,
            "availability_score": 0.7
        }

    @pytest.mark.asyncio
    async def test_edge_engine_initialization(self, edge_engine):
        """Test EdgeAIEngine initialization"""
        assert edge_engine is not None
        assert 'safety_classifier' in edge_engine.models
        assert 'task_router' in edge_engine.models
        assert 'performance_predictor' in edge_engine.models
        assert edge_engine.decision_cache is not None
        assert edge_engine.performance_metrics is not None

    @pytest.mark.asyncio
    async def test_sub_10ms_decision_making(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test that edge decisions are made in under 10ms"""
        start_time = time.perf_counter()
        
        decision = await edge_engine.make_execution_decision(
            sample_request, sample_analysis, sample_decision_factors
        )
        
        execution_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
        
        # Verify sub-10ms performance
        assert execution_time < 10.0, f"Decision took {execution_time:.2f}ms, expected <10ms"
        assert decision is not None
        assert 'location' in decision
        assert 'confidence' in decision
        assert 'execution_time_ms' in decision
        assert decision['execution_time_ms'] < 10.0

    @pytest.mark.asyncio
    async def test_safety_critical_routing_to_edge(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test that safety-critical tasks are routed to edge"""
        # Set safety-critical parameters
        sample_request.safety_level = "critical"
        sample_request.max_latency = 5.0
        sample_decision_factors["safety_score"] = 1.0
        sample_decision_factors["latency_score"] = 1.0
        
        decision = await edge_engine.make_execution_decision(
            sample_request, sample_analysis, sample_decision_factors
        )
        
        assert decision['location'] == 'edge', "Safety-critical tasks should be routed to edge"
        assert decision['confidence'] > 0.7, "High confidence expected for safety-critical routing"

    @pytest.mark.asyncio
    async def test_complex_task_routing_to_cloud(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test that complex tasks are routed to cloud"""
        # Set complex task parameters
        sample_analysis["command_complexity"]["level"] = "critical"
        sample_analysis["command_complexity"]["score"] = 0.9
        sample_decision_factors["complexity_score"] = 0.9
        sample_decision_factors["safety_score"] = 0.2  # Low safety requirement
        
        decision = await edge_engine.make_execution_decision(
            sample_request, sample_analysis, sample_decision_factors
        )
        
        # Complex tasks should prefer cloud unless safety overrides
        assert decision['location'] in ['cloud', 'hybrid'], "Complex tasks should prefer cloud or hybrid"

    @pytest.mark.asyncio
    async def test_hybrid_coordination_decision(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test hybrid edge-cloud coordination decision"""
        # Set balanced parameters that should trigger hybrid
        sample_decision_factors["safety_score"] = 0.6
        sample_decision_factors["complexity_score"] = 0.6
        sample_decision_factors["latency_score"] = 0.6
        
        decision = await edge_engine.make_execution_decision(
            sample_request, sample_analysis, sample_decision_factors
        )
        
        assert decision is not None
        assert 'fallback_plan' in decision
        assert 'reasoning' in decision
        assert len(decision['reasoning']) > 0

    @pytest.mark.asyncio
    async def test_decision_caching(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test decision caching for similar requests"""
        # Make first decision
        decision1 = await edge_engine.make_execution_decision(
            sample_request, sample_analysis, sample_decision_factors
        )
        
        # Make second identical decision
        decision2 = await edge_engine.make_execution_decision(
            sample_request, sample_analysis, sample_decision_factors
        )
        
        # Second decision should be faster due to caching
        assert decision1['location'] == decision2['location']
        assert len(edge_engine.decision_cache) > 0

    @pytest.mark.asyncio
    async def test_performance_metrics_tracking(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test performance metrics are properly tracked"""
        initial_metrics = edge_engine.performance_metrics.copy()
        
        # Make several decisions
        for _ in range(5):
            await edge_engine.make_execution_decision(
                sample_request, sample_analysis, sample_decision_factors
            )
        
        # Verify metrics were updated
        assert edge_engine.performance_metrics['total_decisions'] == initial_metrics.get('total_decisions', 0) + 5
        assert 'avg_execution_time' in edge_engine.performance_metrics
        assert 'sub_10ms_decisions' in edge_engine.performance_metrics

    @pytest.mark.asyncio
    async def test_fallback_on_model_failure(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test fallback behavior when ML models fail"""
        # Mock model failure
        with patch.object(edge_engine, '_classify_safety_level', side_effect=Exception("Model failed")):
            decision = await edge_engine.make_execution_decision(
                sample_request, sample_analysis, sample_decision_factors
            )
        
        # Should still return a valid decision using fallback
        assert decision is not None
        assert 'location' in decision
        assert decision.get('fallback_used', False) == True

    @pytest.mark.asyncio
    async def test_feature_extraction(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test feature extraction for ML models"""
        features = edge_engine._extract_decision_features(
            sample_request, sample_analysis, sample_decision_factors
        )
        
        assert isinstance(features, np.ndarray)
        assert features.shape[0] == 1  # Single sample
        assert features.shape[1] >= 10  # At least 10 features
        assert not np.isnan(features).any(), "Features should not contain NaN values"

    @pytest.mark.asyncio
    async def test_safety_classification(self, edge_engine):
        """Test safety level classification"""
        # High safety requirement features
        high_safety_features = np.array([[0.9, 0.9, 0.2, 0.5, 0.8, 0.01, 5, 1.0, 0.3, 0.4, 0.3, 0.1]], dtype=np.float32)
        
        safety_result = await edge_engine._classify_safety_level(high_safety_features)
        
        assert 'safety_score' in safety_result
        assert 'requires_edge' in safety_result
        assert 'confidence' in safety_result
        assert isinstance(safety_result['requires_edge'], bool)

    @pytest.mark.asyncio
    async def test_performance_prediction(self, edge_engine):
        """Test performance prediction for edge vs cloud"""
        sample_features = np.array([[0.5, 0.5, 0.5, 0.5, 0.5, 0.1, 3, 0.5, 0.4, 0.3, 0.3, 0.2]], dtype=np.float32)
        
        performance_result = await edge_engine._predict_performance(sample_features)
        
        assert 'edge_latency_ms' in performance_result
        assert 'cloud_latency_ms' in performance_result
        assert 'edge_accuracy' in performance_result
        assert 'cloud_accuracy' in performance_result
        assert 'performance_advantage' in performance_result
        
        # Latency should be positive
        assert performance_result['edge_latency_ms'] > 0
        assert performance_result['cloud_latency_ms'] > 0

    @pytest.mark.asyncio
    async def test_execution_routing(self, edge_engine):
        """Test execution location routing"""
        sample_features = np.array([[0.8, 0.9, 0.3, 0.5, 0.7, 0.01, 2, 1.0, 0.2, 0.3, 0.2, 0.1]], dtype=np.float32)
        
        routing_result = await edge_engine._route_execution(sample_features)
        
        assert 'recommended_location' in routing_result
        assert routing_result['recommended_location'] in ['edge', 'cloud', 'hybrid']
        assert 'confidence' in routing_result
        assert 'probabilities' in routing_result
        assert 'edge' in routing_result['probabilities']
        assert 'cloud' in routing_result['probabilities']
        assert 'hybrid' in routing_result['probabilities']

    @pytest.mark.asyncio
    async def test_decision_combination_logic(self, edge_engine):
        """Test decision combination from multiple models"""
        safety_result = {'requires_edge': True, 'safety_score': 0.9, 'confidence': 0.8}
        performance_result = {'performance_advantage': 'edge', 'edge_latency_ms': 5.0, 'cloud_latency_ms': 45.0}
        routing_result = {'recommended_location': 'edge', 'confidence': 0.85, 'probabilities': {'edge': 0.8, 'cloud': 0.1, 'hybrid': 0.1}}
        decision_factors = {'latency_score': 0.9, 'safety_score': 0.9, 'complexity_score': 0.3}
        
        combined_decision = edge_engine._combine_decisions(
            safety_result, performance_result, routing_result, decision_factors
        )
        
        assert 'location' in combined_decision
        assert 'confidence' in combined_decision
        assert 'reasoning' in combined_decision
        assert 'fallback_plan' in combined_decision
        assert isinstance(combined_decision['reasoning'], list)
        assert len(combined_decision['reasoning']) > 0

    def test_cache_key_generation(self, edge_engine):
        """Test cache key generation for decision caching"""
        features1 = np.array([[0.1, 0.2, 0.3, 0.4, 0.5]], dtype=np.float32)
        features2 = np.array([[0.1, 0.2, 0.3, 0.4, 0.5]], dtype=np.float32)
        features3 = np.array([[0.2, 0.3, 0.4, 0.5, 0.6]], dtype=np.float32)
        
        key1 = edge_engine._generate_cache_key(features1)
        key2 = edge_engine._generate_cache_key(features2)
        key3 = edge_engine._generate_cache_key(features3)
        
        # Same features should generate same key
        assert key1 == key2
        # Different features should generate different keys
        assert key1 != key3

    @pytest.mark.asyncio
    async def test_concurrent_decision_making(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test concurrent decision making performance"""
        # Create multiple concurrent decision requests
        tasks = []
        for i in range(10):
            task = edge_engine.make_execution_decision(
                sample_request, sample_analysis, sample_decision_factors
            )
            tasks.append(task)
        
        start_time = time.perf_counter()
        results = await asyncio.gather(*tasks)
        total_time = (time.perf_counter() - start_time) * 1000
        
        # All decisions should complete
        assert len(results) == 10
        assert all(result is not None for result in results)
        
        # Average time per decision should still be reasonable
        avg_time_per_decision = total_time / 10
        assert avg_time_per_decision < 20.0, f"Average decision time {avg_time_per_decision:.2f}ms too high"

    @pytest.mark.asyncio
    async def test_rule_based_fallback_models(self, edge_engine):
        """Test rule-based fallback models work correctly"""
        sample_features = np.array([[0.8, 0.9, 0.3, 0.5, 0.7, 0.01, 2, 1.0, 0.2, 0.3, 0.2, 0.1]], dtype=np.float32)
        
        # Test rule-based safety classifier
        safety_result = edge_engine._rule_based_safety_classifier(sample_features)
        assert 'safety_score' in safety_result
        assert 'requires_edge' in safety_result
        
        # Test rule-based performance predictor
        performance_result = edge_engine._rule_based_performance_predictor(sample_features)
        assert 'edge_latency_ms' in performance_result
        assert 'cloud_latency_ms' in performance_result
        
        # Test rule-based task router
        routing_result = edge_engine._rule_based_task_router(sample_features)
        assert 'recommended_location' in routing_result
        assert routing_result['recommended_location'] in ['edge', 'cloud', 'hybrid']

    @pytest.mark.asyncio
    async def test_performance_metrics_accuracy(self, edge_engine, sample_request, sample_analysis, sample_decision_factors):
        """Test accuracy of performance metrics tracking"""
        # Clear existing metrics
        edge_engine.performance_metrics = {
            'total_decisions': 0,
            'avg_execution_time': 0.0,
            'sub_10ms_decisions': 0,
            'edge_decisions': 0,
            'cloud_decisions': 0,
            'hybrid_decisions': 0
        }
        
        # Make decisions and track manually
        manual_times = []
        manual_locations = []
        
        for _ in range(5):
            start_time = time.perf_counter()
            decision = await edge_engine.make_execution_decision(
                sample_request, sample_analysis, sample_decision_factors
            )
            execution_time = (time.perf_counter() - start_time) * 1000
            
            manual_times.append(execution_time)
            manual_locations.append(decision['location'])
        
        # Verify metrics match manual tracking
        assert edge_engine.performance_metrics['total_decisions'] == 5
        
        manual_avg = sum(manual_times) / len(manual_times)
        tracked_avg = edge_engine.performance_metrics['avg_execution_time']
        assert abs(manual_avg - tracked_avg) < 1.0, "Average execution time tracking inaccurate"
        
        manual_sub_10ms = sum(1 for t in manual_times if t < 10.0)
        tracked_sub_10ms = edge_engine.performance_metrics['sub_10ms_decisions']
        assert manual_sub_10ms == tracked_sub_10ms, "Sub-10ms decision tracking inaccurate"

if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
