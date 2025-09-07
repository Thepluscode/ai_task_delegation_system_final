#!/usr/bin/env python3
"""
Test Suite for Agent Coordination System
Tests multi-agent management, hierarchical coordination, and conflict resolution
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'enhanced-robot-control-service'))

from agent_coordination import (
    AgentManager, MultiAgentCoordinator, Agent, CoordinationTask,
    AgentType, AgentStatus, CoordinationPattern
)

class TestAgentCoordination:
    """Test suite for Agent Coordination functionality"""
    
    @pytest.fixture
    async def agent_manager(self):
        """Create AgentManager instance for testing"""
        manager = AgentManager()
        return manager
    
    @pytest.fixture
    def sample_agent(self):
        """Create sample agent for testing"""
        return Agent(
            agent_id="test_agent_001",
            agent_type=AgentType.WORKER,
            capabilities=["navigation", "manipulation", "vision"],
            current_load=0.3,
            max_capacity=100.0,
            status=AgentStatus.IDLE,
            location={"x": 1.0, "y": 2.0, "z": 0.0},
            performance_metrics={
                "task_success_rate": 0.95,
                "response_time": 50.0,
                "error_rate": 0.02
            }
        )
    
    @pytest.fixture
    def supervisor_agent(self):
        """Create supervisor agent for testing"""
        return Agent(
            agent_id="supervisor_001",
            agent_type=AgentType.SUPERVISOR,
            capabilities=["coordination", "planning", "monitoring"],
            current_load=0.2,
            max_capacity=100.0,
            status=AgentStatus.IDLE,
            performance_metrics={
                "coordination_score": 0.9,
                "task_success_rate": 0.98
            }
        )
    
    @pytest.fixture
    def coordination_task(self):
        """Create coordination task for testing"""
        return CoordinationTask(
            task_id="task_001",
            task_type="collaborative_navigation",
            priority=5,
            required_agents=3,
            required_capabilities=["navigation", "coordination"],
            coordination_pattern=CoordinationPattern.HIERARCHICAL,
            estimated_duration=120.0
        )

    @pytest.mark.asyncio
    async def test_agent_registration(self, agent_manager, sample_agent):
        """Test agent registration in coordination system"""
        success = await agent_manager.register_agent(sample_agent)
        
        assert success == True
        assert sample_agent.agent_id in agent_manager.agents
        assert agent_manager.agents[sample_agent.agent_id] == sample_agent
        assert sample_agent.coordination_group is not None
        assert sample_agent.agent_id in agent_manager.coordination_graph.nodes

    @pytest.mark.asyncio
    async def test_hierarchical_relationship_establishment(self, agent_manager, supervisor_agent, sample_agent):
        """Test establishment of hierarchical relationships"""
        # Register supervisor first
        await agent_manager.register_agent(supervisor_agent)
        
        # Register worker agent
        await agent_manager.register_agent(sample_agent)
        
        # Supervisor should have subordinates
        assert len(supervisor_agent.subordinates) > 0
        
        # Worker should have supervisor
        if sample_agent.supervisor_id:
            assert sample_agent.supervisor_id == supervisor_agent.agent_id

    @pytest.mark.asyncio
    async def test_coordination_group_assignment(self, agent_manager):
        """Test automatic coordination group assignment"""
        # Create agents with similar capabilities
        agent1 = Agent("agent1", AgentType.WORKER, ["navigation", "vision"])
        agent2 = Agent("agent2", AgentType.WORKER, ["navigation", "vision"])
        agent3 = Agent("agent3", AgentType.WORKER, ["manipulation", "precision"])
        
        await agent_manager.register_agent(agent1)
        await agent_manager.register_agent(agent2)
        await agent_manager.register_agent(agent3)
        
        # Agents with similar capabilities should be in same group
        assert agent1.coordination_group == agent2.coordination_group
        # Agent with different capabilities should be in different group
        assert agent1.coordination_group != agent3.coordination_group

    @pytest.mark.asyncio
    async def test_task_assignment_hierarchical(self, agent_manager, supervisor_agent, coordination_task):
        """Test hierarchical task assignment"""
        # Register supervisor and workers
        await agent_manager.register_agent(supervisor_agent)
        
        workers = []
        for i in range(3):
            worker = Agent(
                f"worker_{i}",
                AgentType.WORKER,
                ["navigation", "coordination"],
                current_load=0.2
            )
            workers.append(worker)
            await agent_manager.register_agent(worker)
        
        # Assign hierarchical task
        coordination_task.coordination_pattern = CoordinationPattern.HIERARCHICAL
        result = await agent_manager.assign_task(coordination_task)
        
        assert result["success"] == True
        assert len(coordination_task.assigned_agents) == coordination_task.required_agents
        assert coordination_task.task_id in agent_manager.active_tasks

    @pytest.mark.asyncio
    async def test_task_assignment_consensus(self, agent_manager, coordination_task):
        """Test consensus-based task assignment"""
        # Register agents suitable for consensus
        agents = []
        for i in range(4):
            agent = Agent(
                f"consensus_agent_{i}",
                AgentType.WORKER,
                ["navigation", "coordination"],
                current_load=0.3,
                performance_metrics={
                    "consensus_participation": 0.8,
                    "communication_reliability": 0.9
                }
            )
            agents.append(agent)
            await agent_manager.register_agent(agent)
        
        # Assign consensus task
        coordination_task.coordination_pattern = CoordinationPattern.CONSENSUS
        coordination_task.required_agents = 3
        result = await agent_manager.assign_task(coordination_task)
        
        assert result["success"] == True
        assert result["coordination_pattern"] == "consensus"

    @pytest.mark.asyncio
    async def test_task_assignment_auction(self, agent_manager, coordination_task):
        """Test auction-based task assignment"""
        # Register agents with different performance levels
        high_performer = Agent(
            "high_performer",
            AgentType.WORKER,
            ["navigation", "coordination"],
            current_load=0.1,
            performance_metrics={"task_success_rate": 0.98}
        )
        
        medium_performer = Agent(
            "medium_performer",
            AgentType.WORKER,
            ["navigation", "coordination"],
            current_load=0.5,
            performance_metrics={"task_success_rate": 0.85}
        )
        
        await agent_manager.register_agent(high_performer)
        await agent_manager.register_agent(medium_performer)
        
        # Assign auction task
        coordination_task.coordination_pattern = CoordinationPattern.AUCTION
        coordination_task.required_agents = 1
        result = await agent_manager.assign_task(coordination_task)
        
        assert result["success"] == True
        # High performer should be selected in auction
        assert high_performer.agent_id in coordination_task.assigned_agents

    @pytest.mark.asyncio
    async def test_agent_load_balancing(self, agent_manager):
        """Test agent load balancing functionality"""
        # Create agents with different loads
        overloaded_agent = Agent(
            "overloaded",
            AgentType.WORKER,
            ["navigation"],
            current_load=0.9,
            current_tasks=["task1", "task2", "task3"]
        )
        
        underloaded_agent = Agent(
            "underloaded",
            AgentType.WORKER,
            ["navigation"],
            current_load=0.1,
            current_tasks=[]
        )
        
        await agent_manager.register_agent(overloaded_agent)
        await agent_manager.register_agent(underloaded_agent)
        
        # Add mock task to active tasks
        mock_task = CoordinationTask(
            "task1", "navigation", 5, 1, ["navigation"],
            CoordinationPattern.HIERARCHICAL, estimated_duration=60.0
        )
        mock_task.assigned_agents = [overloaded_agent.agent_id]
        agent_manager.active_tasks["task1"] = mock_task
        
        # Run optimization
        await agent_manager._optimize_agent_allocation()
        
        # Load should be more balanced
        assert overloaded_agent.current_load < 0.9 or underloaded_agent.current_load > 0.1

    @pytest.mark.asyncio
    async def test_agent_health_monitoring(self, agent_manager, sample_agent):
        """Test agent health monitoring"""
        await agent_manager.register_agent(sample_agent)
        
        # Simulate healthy agent
        sample_agent.last_heartbeat = datetime.utcnow()
        await agent_manager._update_agent_statuses()
        assert sample_agent.status != AgentStatus.OFFLINE
        
        # Simulate unhealthy agent
        sample_agent.last_heartbeat = datetime.utcnow() - timedelta(minutes=10)
        await agent_manager._update_agent_statuses()
        assert sample_agent.status == AgentStatus.OFFLINE

    @pytest.mark.asyncio
    async def test_conflict_detection_and_resolution(self, agent_manager):
        """Test conflict detection and resolution"""
        # Create agents that might conflict
        agent1 = Agent(
            "agent1",
            AgentType.WORKER,
            ["navigation"],
            location={"x": 1.0, "y": 1.0, "z": 0.0},
            current_tasks=["physical_task"]
        )
        
        agent2 = Agent(
            "agent2",
            AgentType.WORKER,
            ["navigation"],
            location={"x": 1.0, "y": 1.0, "z": 0.0},
            current_tasks=["physical_task"]
        )
        
        await agent_manager.register_agent(agent1)
        await agent_manager.register_agent(agent2)
        
        # Add conflicting tasks
        task1 = CoordinationTask(
            "physical_task", "physical_coordination", 5, 1, ["navigation"],
            CoordinationPattern.HIERARCHICAL
        )
        task1.assigned_agents = [agent1.agent_id]
        agent_manager.active_tasks["physical_task"] = task1
        
        # Run conflict resolution
        conflicts_resolved = await agent_manager._resolve_conflicts()
        
        # Should detect and attempt to resolve conflicts
        assert isinstance(conflicts_resolved, int)

    @pytest.mark.asyncio
    async def test_agent_failure_handling(self, agent_manager, coordination_task):
        """Test handling of agent failures during task execution"""
        # Register agents
        working_agent = Agent("working", AgentType.WORKER, ["navigation"], status=AgentStatus.IDLE)
        failing_agent = Agent("failing", AgentType.WORKER, ["navigation"], status=AgentStatus.ERROR)
        replacement_agent = Agent("replacement", AgentType.WORKER, ["navigation"], status=AgentStatus.IDLE)
        
        await agent_manager.register_agent(working_agent)
        await agent_manager.register_agent(failing_agent)
        await agent_manager.register_agent(replacement_agent)
        
        # Assign task to working and failing agents
        coordination_task.assigned_agents = [working_agent.agent_id, failing_agent.agent_id]
        coordination_task.status = "executing"
        agent_manager.active_tasks[coordination_task.task_id] = coordination_task
        
        # Monitor task execution (should handle failure)
        await agent_manager._monitor_task_execution(coordination_task)
        
        # Failing agent should be replaced if possible
        if replacement_agent.agent_id in coordination_task.assigned_agents:
            assert failing_agent.agent_id not in coordination_task.assigned_agents

    @pytest.mark.asyncio
    async def test_performance_metrics_tracking(self, agent_manager, sample_agent):
        """Test performance metrics tracking"""
        await agent_manager.register_agent(sample_agent)
        
        initial_history_length = len(agent_manager.performance_history.get(sample_agent.agent_id, []))
        
        # Update performance metrics
        updates = await agent_manager._update_performance_metrics()
        
        assert updates > 0
        assert sample_agent.agent_id in agent_manager.performance_history
        final_history_length = len(agent_manager.performance_history[sample_agent.agent_id])
        assert final_history_length > initial_history_length

    @pytest.mark.asyncio
    async def test_coordination_patterns_setup(self, agent_manager):
        """Test setup of different coordination patterns"""
        # Test hierarchical setup
        supervisor = Agent("sup", AgentType.SUPERVISOR, ["coordination"])
        worker1 = Agent("w1", AgentType.WORKER, ["navigation"])
        worker2 = Agent("w2", AgentType.WORKER, ["navigation"])
        
        agents = [supervisor, worker1, worker2]
        task = CoordinationTask(
            "test", "test", 5, 3, ["navigation"],
            CoordinationPattern.HIERARCHICAL
        )
        
        hierarchical_setup = await agent_manager._setup_hierarchical_coordination(task, agents)
        
        assert hierarchical_setup["pattern"] == "hierarchical"
        assert "supervisor" in hierarchical_setup
        assert "workers" in hierarchical_setup
        assert hierarchical_setup["supervisor"] == supervisor.agent_id
        
        # Test consensus setup
        consensus_setup = await agent_manager._setup_consensus_coordination(task, agents)
        
        assert consensus_setup["pattern"] == "consensus"
        assert "participants" in consensus_setup
        assert "consensus_threshold" in consensus_setup
        
        # Test P2P setup
        p2p_setup = await agent_manager._setup_p2p_coordination(task, agents)
        
        assert p2p_setup["pattern"] == "peer_to_peer"
        assert "peers" in p2p_setup

    @pytest.mark.asyncio
    async def test_task_queue_processing(self, agent_manager):
        """Test task queue processing"""
        # Add agents
        for i in range(3):
            agent = Agent(f"agent_{i}", AgentType.WORKER, ["navigation"])
            await agent_manager.register_agent(agent)
        
        # Add tasks to queue
        for i in range(2):
            task = CoordinationTask(
                f"queued_task_{i}", "navigation", 5, 1, ["navigation"],
                CoordinationPattern.HIERARCHICAL
            )
            agent_manager.task_queue.append(task)
        
        # Process queue
        tasks_processed = await agent_manager._process_task_queue()
        
        assert tasks_processed >= 0
        # Some tasks should be processed if agents are available
        if len(agent_manager.agents) >= 1:
            assert len(agent_manager.task_queue) <= 2

    @pytest.mark.asyncio
    async def test_concurrent_coordination(self, agent_manager):
        """Test concurrent coordination operations"""
        # Register multiple agents
        agents = []
        for i in range(5):
            agent = Agent(f"concurrent_agent_{i}", AgentType.WORKER, ["navigation"])
            agents.append(agent)
            await agent_manager.register_agent(agent)
        
        # Run coordination multiple times concurrently
        coordination_tasks = []
        for _ in range(3):
            task = agent_manager.coordinate_agents()
            coordination_tasks.append(task)
        
        results = await asyncio.gather(*coordination_tasks)
        
        # All coordination rounds should complete
        assert len(results) == 3
        assert all(isinstance(result, dict) for result in results)

    @pytest.mark.asyncio
    async def test_multi_agent_coordinator(self):
        """Test MultiAgentCoordinator functionality"""
        coordinator = MultiAgentCoordinator()
        
        # Add multiple agent managers
        manager1 = AgentManager()
        manager2 = AgentManager()
        
        coordinator.agent_managers["region1"] = manager1
        coordinator.agent_managers["region2"] = manager2
        
        # Test cross-manager coordination
        results = await coordinator.coordinate_across_managers()
        
        assert isinstance(results, dict)
        assert "region1" in results
        assert "region2" in results

    @pytest.mark.asyncio
    async def test_agent_capability_matching(self, agent_manager):
        """Test agent selection based on capability matching"""
        # Create agents with different capabilities
        nav_agent = Agent("nav", AgentType.WORKER, ["navigation"])
        manip_agent = Agent("manip", AgentType.WORKER, ["manipulation"])
        multi_agent = Agent("multi", AgentType.WORKER, ["navigation", "manipulation"])
        
        await agent_manager.register_agent(nav_agent)
        await agent_manager.register_agent(manip_agent)
        await agent_manager.register_agent(multi_agent)
        
        # Create task requiring both capabilities
        task = CoordinationTask(
            "complex_task", "complex", 5, 1, ["navigation", "manipulation"],
            CoordinationPattern.HIERARCHICAL
        )
        
        suitable_agents = await agent_manager._find_suitable_agents(task)
        
        # Only multi_agent should be suitable
        assert len(suitable_agents) == 1
        assert suitable_agents[0].agent_id == multi_agent.agent_id

    @pytest.mark.asyncio
    async def test_coordination_efficiency_metrics(self, agent_manager):
        """Test coordination efficiency measurement"""
        # Register agents and assign tasks
        for i in range(3):
            agent = Agent(f"efficiency_agent_{i}", AgentType.WORKER, ["navigation"])
            await agent_manager.register_agent(agent)
        
        # Measure coordination performance
        start_time = time.time()
        coordination_result = await agent_manager.coordinate_agents()
        coordination_time = time.time() - start_time
        
        # Coordination should be efficient
        assert coordination_time < 1.0, f"Coordination took {coordination_time:.2f}s, expected <1s"
        assert isinstance(coordination_result, dict)
        assert "tasks_processed" in coordination_result
        assert "agents_coordinated" in coordination_result

if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
