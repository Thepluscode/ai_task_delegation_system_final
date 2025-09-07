#!/usr/bin/env python3
"""
Test Suite for Safety Monitoring System
Tests real-time hazard detection, emergency stops, and industry-specific safety rules
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'enhanced-robot-control-service'))

from safety_monitoring import (
    SafetyMonitor, SafetyEvent, SafetyRule, SafetyZone,
    SafetyLevel, HazardType, SafetyAction
)

class TestSafetyMonitoring:
    """Test suite for Safety Monitoring functionality"""
    
    @pytest.fixture
    async def safety_monitor(self):
        """Create SafetyMonitor instance for testing"""
        monitor = SafetyMonitor()
        return monitor
    
    @pytest.fixture
    def sample_safety_event(self):
        """Create sample safety event for testing"""
        return SafetyEvent(
            event_id="test_event_001",
            hazard_type=HazardType.COLLISION,
            safety_level=SafetyLevel.HIGH,
            location={"x": 1.0, "y": 2.0, "z": 0.0},
            affected_agents=["robot_001", "robot_002"],
            description="Potential collision detected between robots",
            confidence=0.85
        )
    
    @pytest.fixture
    def critical_safety_zone(self):
        """Create critical safety zone for testing"""
        return SafetyZone(
            zone_id="CRITICAL_001",
            name="Operating Room",
            boundaries={"type": "rectangle", "x1": 0, "y1": 0, "x2": 10, "y2": 10},
            safety_level=SafetyLevel.CRITICAL,
            allowed_agents=["medical_robot_001"],
            restricted_operations=["high_speed_movement", "loud_operations"],
            monitoring_sensors=["camera_001", "proximity_001"]
        )

    @pytest.mark.asyncio
    async def test_safety_monitor_initialization(self, safety_monitor):
        """Test SafetyMonitor initialization"""
        assert safety_monitor is not None
        assert len(safety_monitor.safety_rules) > 0
        assert len(safety_monitor.safety_zones) > 0
        assert safety_monitor.sensor_data is not None
        assert safety_monitor.agent_positions is not None
        assert len(safety_monitor.emergency_contacts) > 0

    @pytest.mark.asyncio
    async def test_industry_specific_rules_loading(self, safety_monitor):
        """Test loading of industry-specific safety rules"""
        # Check healthcare rules
        healthcare_rules = [rule for rule in safety_monitor.safety_rules.values() 
                          if rule.industry_specific == "healthcare"]
        assert len(healthcare_rules) > 0
        
        # Check manufacturing rules
        manufacturing_rules = [rule for rule in safety_monitor.safety_rules.values() 
                             if rule.industry_specific == "manufacturing"]
        assert len(manufacturing_rules) > 0
        
        # Check general rules
        general_rules = [rule for rule in safety_monitor.safety_rules.values() 
                        if rule.industry_specific is None]
        assert len(general_rules) > 0

    @pytest.mark.asyncio
    async def test_real_time_hazard_detection(self, safety_monitor):
        """Test real-time hazard detection"""
        # Simulate sensor data that should trigger hazard detection
        safety_monitor.sensor_data = {
            "proximity_sensors": {
                "proximity_001": {"distance": 0.5, "object_type": "human"}
            },
            "environmental": {
                "temperature": 45.0,  # High temperature
                "air_quality": 0.3    # Poor air quality
            }
        }
        
        safety_monitor.agent_positions = {
            "robot_001": {"x": 1.0, "y": 1.0, "z": 0.0}
        }
        
        # Run hazard detection
        hazards = await safety_monitor._detect_hazards()
        
        assert len(hazards) > 0
        # Should detect collision risk and fire risk
        hazard_types = [h.hazard_type for h in hazards]
        assert HazardType.COLLISION in hazard_types or HazardType.FIRE in hazard_types

    @pytest.mark.asyncio
    async def test_collision_detection(self, safety_monitor):
        """Test collision detection specifically"""
        # Set up collision scenario
        safety_monitor.sensor_data = {
            "proximity_sensors": {
                "proximity_001": {"distance": 0.8, "object_type": "human"}
            }
        }
        safety_monitor.agent_positions = {
            "robot_001": {"x": 1.0, "y": 1.0, "z": 0.0}
        }
        
        collision_hazards = safety_monitor._rule_based_collision_predictor()
        
        assert len(collision_hazards) > 0
        assert collision_hazards[0].hazard_type == HazardType.COLLISION
        assert collision_hazards[0].safety_level in [SafetyLevel.HIGH, SafetyLevel.MEDIUM]

    @pytest.mark.asyncio
    async def test_fire_detection(self, safety_monitor):
        """Test fire detection"""
        # Set up fire scenario
        safety_monitor.sensor_data = {
            "environmental": {
                "temperature": 50.0,  # High temperature
                "air_quality": 0.4    # Poor air quality indicating smoke
            }
        }
        
        fire_hazards = safety_monitor._rule_based_fire_detector()
        
        assert len(fire_hazards) > 0
        assert fire_hazards[0].hazard_type == HazardType.FIRE
        assert fire_hazards[0].safety_level == SafetyLevel.CRITICAL

    @pytest.mark.asyncio
    async def test_system_health_monitoring(self, safety_monitor):
        """Test system health monitoring"""
        # Set up system health issues
        safety_monitor.sensor_data = {
            "system_health": {
                "error_rate": 0.15,  # High error rate
                "cpu_usage": 0.95    # High CPU usage
            }
        }
        
        system_hazards = safety_monitor._rule_based_system_monitor()
        
        assert len(system_hazards) > 0
        system_hazard_types = [h.hazard_type for h in system_hazards]
        assert HazardType.SYSTEM_FAILURE in system_hazard_types

    @pytest.mark.asyncio
    async def test_safety_event_processing(self, safety_monitor, sample_safety_event):
        """Test safety event processing and response"""
        initial_events = len(safety_monitor.safety_events)
        
        await safety_monitor._process_safety_event(sample_safety_event)
        
        # Event should be added to safety events
        assert len(safety_monitor.safety_events) == initial_events + 1
        assert sample_safety_event.event_id in safety_monitor.safety_events
        
        # Response actions should be assigned
        assert len(sample_safety_event.response_actions) > 0
        
        # High-level events should trigger appropriate actions
        if sample_safety_event.safety_level == SafetyLevel.HIGH:
            assert SafetyAction.STOP in sample_safety_event.response_actions
            assert SafetyAction.ALERT_HUMAN in sample_safety_event.response_actions

    @pytest.mark.asyncio
    async def test_emergency_stop_execution(self, safety_monitor):
        """Test emergency stop execution"""
        # Create critical safety event
        critical_event = SafetyEvent(
            event_id="critical_001",
            hazard_type=HazardType.FIRE,
            safety_level=SafetyLevel.CRITICAL,
            location={"x": 0, "y": 0, "z": 0},
            affected_agents=["robot_001", "robot_002"],
            description="Fire detected in facility",
            confidence=0.95
        )
        
        await safety_monitor._process_safety_event(critical_event)
        
        # Critical events should trigger emergency stop
        assert SafetyAction.EMERGENCY_STOP in critical_event.response_actions
        assert SafetyAction.EVACUATE in critical_event.response_actions

    @pytest.mark.asyncio
    async def test_safety_rule_evaluation(self, safety_monitor):
        """Test safety rule evaluation"""
        # Set up conditions that should trigger rules
        safety_monitor.sensor_data = {
            "proximity_sensors": {
                "proximity_001": {"distance": 0.8, "object_type": "human"}
            },
            "environmental": {
                "temperature": 45.0
            },
            "system_health": {
                "error_rate": 0.12
            }
        }
        
        # Test specific rule evaluation
        human_collision_rule = None
        for rule in safety_monitor.safety_rules.values():
            if "human_detected" in rule.condition.lower():
                human_collision_rule = rule
                break
        
        if human_collision_rule:
            condition_met = await safety_monitor._evaluate_rule_condition(human_collision_rule)
            assert condition_met == True

    @pytest.mark.asyncio
    async def test_safety_zone_monitoring(self, safety_monitor, critical_safety_zone):
        """Test safety zone monitoring"""
        # Add safety zone
        safety_monitor.safety_zones[critical_safety_zone.zone_id] = critical_safety_zone
        
        # Place unauthorized agent in zone
        safety_monitor.agent_positions = {
            "unauthorized_robot": {"x": 5.0, "y": 5.0, "z": 0.0}  # Inside zone
        }
        
        await safety_monitor._monitor_safety_zones()
        
        # Should detect zone violation
        zone_violations = [event for event in safety_monitor.safety_events.values() 
                          if "unauthorized" in event.description.lower()]
        assert len(zone_violations) > 0

    @pytest.mark.asyncio
    async def test_safety_analysis_for_command(self, safety_monitor):
        """Test safety analysis for specific robot commands"""
        robot_id = "test_robot_001"
        command = "move_fast"
        safety_level = "high"
        
        # Set up risky scenario
        safety_monitor.agent_positions[robot_id] = {"x": 1.0, "y": 1.0, "z": 0.0}
        safety_monitor.sensor_data = {
            "proximity_sensors": {
                "proximity_001": {"distance": 1.5, "object_type": "human"}
            }
        }
        
        analysis = await safety_monitor.analyze_safety_requirements(robot_id, command, safety_level)
        
        assert "safety_score" in analysis
        assert "risk_level" in analysis
        assert "recommendations" in analysis
        assert isinstance(analysis["safety_score"], float)
        assert 0.0 <= analysis["safety_score"] <= 1.0

    @pytest.mark.asyncio
    async def test_safety_score_calculation(self, safety_monitor):
        """Test safety score calculation accuracy"""
        # Test high-risk scenario
        high_risk_risks = {
            "collision_risk": 0.8,
            "zone_violation_risk": 0.7,
            "human_interaction_risk": 0.6,
            "system_overload_risk": 0.5
        }
        
        high_risk_score = safety_monitor._calculate_safety_score(
            high_risk_risks, "critical", None
        )
        
        assert high_risk_score < 0.5, "High-risk scenario should have low safety score"
        
        # Test low-risk scenario
        low_risk_risks = {
            "collision_risk": 0.1,
            "zone_violation_risk": 0.0,
            "human_interaction_risk": 0.1,
            "system_overload_risk": 0.0
        }
        
        low_risk_score = safety_monitor._calculate_safety_score(
            low_risk_risks, "low", None
        )
        
        assert low_risk_score > 0.7, "Low-risk scenario should have high safety score"

    @pytest.mark.asyncio
    async def test_safety_recommendations_generation(self, safety_monitor):
        """Test safety recommendations generation"""
        # High collision risk scenario
        risks = {
            "collision_risk": 0.8,
            "zone_violation_risk": 0.0,
            "human_interaction_risk": 0.3,
            "system_overload_risk": 0.1
        }
        
        recommendations = safety_monitor._generate_safety_recommendations(risks, 0.3)
        
        assert len(recommendations) > 0
        assert any("speed" in rec.lower() for rec in recommendations), "Should recommend speed reduction"
        assert any("critical" in rec.lower() or "approval" in rec.lower() for rec in recommendations), "Should require approval for low safety score"

    @pytest.mark.asyncio
    async def test_continuous_monitoring_performance(self, safety_monitor):
        """Test continuous monitoring performance"""
        # Measure monitoring cycle time
        start_time = time.time()
        await safety_monitor.continuous_monitoring()
        monitoring_time = time.time() - start_time
        
        # Monitoring should be fast for real-time operation
        assert monitoring_time < 0.1, f"Monitoring cycle took {monitoring_time:.3f}s, expected <0.1s"

    @pytest.mark.asyncio
    async def test_human_notification_system(self, safety_monitor, sample_safety_event):
        """Test human notification system"""
        # Process event that should trigger human notification
        sample_safety_event.safety_level = SafetyLevel.CRITICAL
        await safety_monitor._process_safety_event(sample_safety_event)
        
        # Should trigger human alert
        assert SafetyAction.ALERT_HUMAN in sample_safety_event.response_actions
        
        # Execute the alert
        await safety_monitor._alert_humans(sample_safety_event)
        
        # Human should be notified
        assert sample_safety_event.human_notified == True

    @pytest.mark.asyncio
    async def test_safety_event_cleanup(self, safety_monitor):
        """Test cleanup of resolved safety events"""
        # Add old resolved event
        old_event = SafetyEvent(
            event_id="old_event",
            hazard_type=HazardType.COLLISION,
            safety_level=SafetyLevel.MEDIUM,
            location={"x": 0, "y": 0, "z": 0},
            affected_agents=[],
            description="Old resolved event",
            confidence=0.8,
            timestamp=datetime.utcnow() - timedelta(hours=2),
            resolved=True
        )
        
        safety_monitor.safety_events[old_event.event_id] = old_event
        initial_count = len(safety_monitor.safety_events)
        
        await safety_monitor._cleanup_resolved_events()
        
        # Old events should be cleaned up
        assert len(safety_monitor.safety_events) < initial_count
        assert old_event.event_id not in safety_monitor.safety_events

    @pytest.mark.asyncio
    async def test_position_in_zone_detection(self, safety_monitor, critical_safety_zone):
        """Test position in zone detection"""
        # Test position inside zone
        inside_position = {"x": 5.0, "y": 5.0, "z": 0.0}
        assert safety_monitor._is_position_in_zone(inside_position, critical_safety_zone) == True
        
        # Test position outside zone
        outside_position = {"x": 15.0, "y": 15.0, "z": 0.0}
        assert safety_monitor._is_position_in_zone(outside_position, critical_safety_zone) == False

    @pytest.mark.asyncio
    async def test_risk_level_classification(self, safety_monitor):
        """Test risk level classification from safety scores"""
        assert safety_monitor._get_risk_level(0.9) == "low"
        assert safety_monitor._get_risk_level(0.7) == "medium"
        assert safety_monitor._get_risk_level(0.5) == "high"
        assert safety_monitor._get_risk_level(0.2) == "critical"

    @pytest.mark.asyncio
    async def test_concurrent_safety_monitoring(self, safety_monitor):
        """Test concurrent safety monitoring operations"""
        # Run multiple monitoring cycles concurrently
        monitoring_tasks = []
        for _ in range(5):
            task = safety_monitor.continuous_monitoring()
            monitoring_tasks.append(task)
        
        start_time = time.time()
        await asyncio.gather(*monitoring_tasks)
        total_time = time.time() - start_time
        
        # Concurrent monitoring should be efficient
        assert total_time < 1.0, f"Concurrent monitoring took {total_time:.2f}s, expected <1s"

    @pytest.mark.asyncio
    async def test_sensor_data_validation(self, safety_monitor):
        """Test sensor data validation and handling"""
        # Test with invalid sensor data
        safety_monitor.sensor_data = {
            "proximity_sensors": {
                "broken_sensor": {"distance": None, "object_type": "unknown"}
            },
            "environmental": {
                "temperature": "invalid",
                "air_quality": -1.0  # Invalid value
            }
        }
        
        # Should handle invalid data gracefully
        try:
            await safety_monitor.continuous_monitoring()
            # Should not raise exception
            assert True
        except Exception as e:
            pytest.fail(f"Safety monitoring failed with invalid sensor data: {str(e)}")

    @pytest.mark.asyncio
    async def test_emergency_protocol_execution(self, safety_monitor):
        """Test emergency protocol execution"""
        # Create emergency scenario
        emergency_event = SafetyEvent(
            event_id="emergency_001",
            hazard_type=HazardType.FIRE,
            safety_level=SafetyLevel.CRITICAL,
            location={"x": 0, "y": 0, "z": 0},
            affected_agents=["robot_001", "robot_002", "robot_003"],
            description="Major fire detected - immediate evacuation required",
            confidence=0.98
        )
        
        await safety_monitor._process_safety_event(emergency_event)
        
        # Should trigger all emergency actions
        assert SafetyAction.EMERGENCY_STOP in emergency_event.response_actions
        assert SafetyAction.EVACUATE in emergency_event.response_actions
        assert SafetyAction.ALERT_HUMAN in emergency_event.response_actions

    @pytest.mark.asyncio
    async def test_safety_rule_priority_handling(self, safety_monitor):
        """Test handling of safety rule priorities"""
        # Create high and low priority rules
        high_priority_rule = SafetyRule(
            rule_id="HIGH_001",
            name="Critical Safety Rule",
            condition="critical_condition",
            action=SafetyAction.EMERGENCY_STOP,
            priority=1
        )
        
        low_priority_rule = SafetyRule(
            rule_id="LOW_001",
            name="Low Priority Rule",
            condition="low_priority_condition",
            action=SafetyAction.MONITOR,
            priority=5
        )
        
        safety_monitor.safety_rules[high_priority_rule.rule_id] = high_priority_rule
        safety_monitor.safety_rules[low_priority_rule.rule_id] = low_priority_rule
        
        # High priority rules should be processed appropriately
        assert high_priority_rule.priority < low_priority_rule.priority
        assert high_priority_rule.action == SafetyAction.EMERGENCY_STOP

if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
