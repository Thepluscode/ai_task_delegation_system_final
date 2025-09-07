#!/usr/bin/env python3
"""
Advanced Agent Coordination System
Multi-agent coordination with hierarchical management and real-time communication
"""

import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import threading
from concurrent.futures import ThreadPoolExecutor
import networkx as nx

logger = logging.getLogger(__name__)

class AgentType(str, Enum):
    SUPERVISOR = "supervisor"
    WORKER = "worker"
    SPECIALIST = "specialist"
    COORDINATOR = "coordinator"
    MONITOR = "monitor"

class AgentStatus(str, Enum):
    IDLE = "idle"
    BUSY = "busy"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    OFFLINE = "offline"

class CoordinationPattern(str, Enum):
    HIERARCHICAL = "hierarchical"
    PEER_TO_PEER = "peer_to_peer"
    CONSENSUS = "consensus"
    AUCTION = "auction"
    SWARM = "swarm"

@dataclass
class Agent:
    agent_id: str
    agent_type: AgentType
    capabilities: List[str]
    current_load: float = 0.0
    max_capacity: float = 100.0
    status: AgentStatus = AgentStatus.IDLE
    location: Optional[Dict[str, float]] = None
    last_heartbeat: datetime = field(default_factory=datetime.utcnow)
    performance_metrics: Dict[str, float] = field(default_factory=dict)
    current_tasks: List[str] = field(default_factory=list)
    coordination_group: Optional[str] = None
    supervisor_id: Optional[str] = None
    subordinates: List[str] = field(default_factory=list)

@dataclass
class CoordinationTask:
    task_id: str
    task_type: str
    priority: int
    required_agents: int
    required_capabilities: List[str]
    coordination_pattern: CoordinationPattern
    deadline: Optional[datetime] = None
    assigned_agents: List[str] = field(default_factory=list)
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.utcnow)
    dependencies: List[str] = field(default_factory=list)
    estimated_duration: float = 0.0

class AgentManager:
    """Advanced agent management with hierarchical coordination"""
    
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.coordination_groups: Dict[str, List[str]] = {}
        self.task_queue: List[CoordinationTask] = []
        self.active_tasks: Dict[str, CoordinationTask] = {}
        self.coordination_graph = nx.DiGraph()
        self.performance_history: Dict[str, List[Dict]] = {}
        self.executor = ThreadPoolExecutor(max_workers=8)
        
    async def register_agent(self, agent: Agent) -> bool:
        """Register a new agent in the coordination system"""
        try:
            self.agents[agent.agent_id] = agent
            self.coordination_graph.add_node(agent.agent_id, **agent.__dict__)
            
            # Auto-assign to coordination group based on capabilities
            group_id = await self._assign_coordination_group(agent)
            agent.coordination_group = group_id
            
            # Establish hierarchical relationships
            await self._establish_hierarchy(agent)
            
            logger.info(f"Agent {agent.agent_id} registered successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register agent {agent.agent_id}: {str(e)}")
            return False
    
    async def coordinate_agents(self) -> Dict[str, Any]:
        """Main coordination loop for multi-agent management"""
        coordination_results = {
            "tasks_processed": 0,
            "agents_coordinated": 0,
            "performance_updates": 0,
            "conflicts_resolved": 0
        }
        
        try:
            # Update agent statuses
            await self._update_agent_statuses()
            
            # Process pending tasks
            tasks_processed = await self._process_task_queue()
            coordination_results["tasks_processed"] = tasks_processed
            
            # Coordinate active tasks
            agents_coordinated = await self._coordinate_active_tasks()
            coordination_results["agents_coordinated"] = agents_coordinated
            
            # Update performance metrics
            performance_updates = await self._update_performance_metrics()
            coordination_results["performance_updates"] = performance_updates
            
            # Resolve conflicts
            conflicts_resolved = await self._resolve_conflicts()
            coordination_results["conflicts_resolved"] = conflicts_resolved
            
            # Optimize agent allocation
            await self._optimize_agent_allocation()
            
            return coordination_results
            
        except Exception as e:
            logger.error(f"Agent coordination failed: {str(e)}")
            return coordination_results
    
    async def assign_task(self, task: CoordinationTask) -> Dict[str, Any]:
        """Assign a coordination task to optimal agents"""
        try:
            # Find suitable agents
            suitable_agents = await self._find_suitable_agents(task)
            
            if len(suitable_agents) < task.required_agents:
                return {
                    "success": False,
                    "reason": "Insufficient suitable agents available",
                    "available_agents": len(suitable_agents),
                    "required_agents": task.required_agents
                }
            
            # Select optimal agents using coordination algorithm
            selected_agents = await self._select_optimal_agents(task, suitable_agents)
            
            # Assign task to selected agents
            task.assigned_agents = [agent.agent_id for agent in selected_agents]
            task.status = "assigned"
            self.active_tasks[task.task_id] = task
            
            # Update agent statuses
            for agent in selected_agents:
                agent.current_tasks.append(task.task_id)
                agent.current_load += task.estimated_duration / agent.max_capacity
                if agent.current_load > 0.8:
                    agent.status = AgentStatus.BUSY
            
            # Establish coordination pattern
            coordination_setup = await self._setup_coordination_pattern(task, selected_agents)
            
            return {
                "success": True,
                "task_id": task.task_id,
                "assigned_agents": task.assigned_agents,
                "coordination_pattern": task.coordination_pattern.value,
                "coordination_setup": coordination_setup,
                "estimated_completion": datetime.utcnow() + timedelta(seconds=task.estimated_duration)
            }
            
        except Exception as e:
            logger.error(f"Task assignment failed: {str(e)}")
            return {"success": False, "reason": str(e)}
    
    async def _find_suitable_agents(self, task: CoordinationTask) -> List[Agent]:
        """Find agents suitable for the given task"""
        suitable_agents = []
        
        for agent in self.agents.values():
            if agent.status in [AgentStatus.OFFLINE, AgentStatus.ERROR, AgentStatus.MAINTENANCE]:
                continue
            
            # Check capability requirements
            if not all(cap in agent.capabilities for cap in task.required_capabilities):
                continue
            
            # Check availability
            if agent.current_load > 0.9:
                continue
            
            # Check location constraints if applicable
            if task.task_type == "physical_coordination" and not agent.location:
                continue
            
            suitable_agents.append(agent)
        
        return suitable_agents
    
    async def _select_optimal_agents(
        self, 
        task: CoordinationTask, 
        suitable_agents: List[Agent]
    ) -> List[Agent]:
        """Select optimal agents using multi-criteria optimization"""
        
        if task.coordination_pattern == CoordinationPattern.HIERARCHICAL:
            return await self._select_hierarchical_agents(task, suitable_agents)
        elif task.coordination_pattern == CoordinationPattern.CONSENSUS:
            return await self._select_consensus_agents(task, suitable_agents)
        elif task.coordination_pattern == CoordinationPattern.AUCTION:
            return await self._select_auction_agents(task, suitable_agents)
        else:
            return await self._select_default_agents(task, suitable_agents)
    
    async def _select_hierarchical_agents(
        self, 
        task: CoordinationTask, 
        suitable_agents: List[Agent]
    ) -> List[Agent]:
        """Select agents for hierarchical coordination"""
        selected_agents = []
        
        # Select supervisor agent
        supervisors = [a for a in suitable_agents if a.agent_type == AgentType.SUPERVISOR]
        if supervisors:
            supervisor = max(supervisors, key=lambda a: a.performance_metrics.get('coordination_score', 0))
            selected_agents.append(supervisor)
        
        # Select worker agents
        workers = [a for a in suitable_agents if a.agent_type == AgentType.WORKER and a not in selected_agents]
        workers_needed = task.required_agents - len(selected_agents)
        
        # Sort workers by performance and availability
        workers.sort(key=lambda a: (
            a.performance_metrics.get('task_success_rate', 0.5),
            -a.current_load,
            a.performance_metrics.get('response_time', 1000)
        ), reverse=True)
        
        selected_agents.extend(workers[:workers_needed])
        
        return selected_agents
    
    async def _select_consensus_agents(
        self, 
        task: CoordinationTask, 
        suitable_agents: List[Agent]
    ) -> List[Agent]:
        """Select agents for consensus-based coordination"""
        # For consensus, select agents with similar capabilities and good communication
        agents_with_scores = []
        
        for agent in suitable_agents:
            score = (
                agent.performance_metrics.get('consensus_participation', 0.5) * 0.4 +
                agent.performance_metrics.get('communication_reliability', 0.5) * 0.3 +
                (1.0 - agent.current_load) * 0.3
            )
            agents_with_scores.append((agent, score))
        
        # Sort by score and select top agents
        agents_with_scores.sort(key=lambda x: x[1], reverse=True)
        return [agent for agent, _ in agents_with_scores[:task.required_agents]]
    
    async def _select_auction_agents(
        self, 
        task: CoordinationTask, 
        suitable_agents: List[Agent]
    ) -> List[Agent]:
        """Select agents using auction-based mechanism"""
        # Simulate auction bidding
        bids = []
        
        for agent in suitable_agents:
            # Calculate bid based on availability, capability, and performance
            bid_value = (
                (1.0 - agent.current_load) * 0.4 +  # Availability
                len([cap for cap in task.required_capabilities if cap in agent.capabilities]) / len(task.required_capabilities) * 0.3 +  # Capability match
                agent.performance_metrics.get('task_success_rate', 0.5) * 0.3  # Performance
            )
            
            bids.append((agent, bid_value))
        
        # Select agents with highest bids
        bids.sort(key=lambda x: x[1], reverse=True)
        return [agent for agent, _ in bids[:task.required_agents]]
    
    async def _select_default_agents(
        self, 
        task: CoordinationTask, 
        suitable_agents: List[Agent]
    ) -> List[Agent]:
        """Default agent selection algorithm"""
        # Simple selection based on load and performance
        agents_with_scores = []
        
        for agent in suitable_agents:
            score = (
                (1.0 - agent.current_load) * 0.5 +
                agent.performance_metrics.get('overall_performance', 0.5) * 0.5
            )
            agents_with_scores.append((agent, score))
        
        agents_with_scores.sort(key=lambda x: x[1], reverse=True)
        return [agent for agent, _ in agents_with_scores[:task.required_agents]]
    
    async def _setup_coordination_pattern(
        self, 
        task: CoordinationTask, 
        agents: List[Agent]
    ) -> Dict[str, Any]:
        """Setup coordination pattern for the assigned agents"""
        
        if task.coordination_pattern == CoordinationPattern.HIERARCHICAL:
            return await self._setup_hierarchical_coordination(task, agents)
        elif task.coordination_pattern == CoordinationPattern.CONSENSUS:
            return await self._setup_consensus_coordination(task, agents)
        elif task.coordination_pattern == CoordinationPattern.PEER_TO_PEER:
            return await self._setup_p2p_coordination(task, agents)
        else:
            return {"pattern": "default", "setup": "basic"}
    
    async def _setup_hierarchical_coordination(
        self, 
        task: CoordinationTask, 
        agents: List[Agent]
    ) -> Dict[str, Any]:
        """Setup hierarchical coordination structure"""
        supervisor = next((a for a in agents if a.agent_type == AgentType.SUPERVISOR), agents[0])
        workers = [a for a in agents if a != supervisor]
        
        # Establish communication channels
        coordination_setup = {
            "pattern": "hierarchical",
            "supervisor": supervisor.agent_id,
            "workers": [w.agent_id for w in workers],
            "communication": {
                "supervisor_to_workers": "broadcast",
                "workers_to_supervisor": "report",
                "worker_to_worker": "peer"
            },
            "decision_making": "supervisor_decides",
            "conflict_resolution": "escalate_to_supervisor"
        }
        
        # Update agent relationships
        for worker in workers:
            worker.supervisor_id = supervisor.agent_id
            if supervisor.agent_id not in worker.subordinates:
                supervisor.subordinates.append(worker.agent_id)
        
        return coordination_setup
    
    async def _setup_consensus_coordination(
        self, 
        task: CoordinationTask, 
        agents: List[Agent]
    ) -> Dict[str, Any]:
        """Setup consensus-based coordination"""
        return {
            "pattern": "consensus",
            "participants": [a.agent_id for a in agents],
            "consensus_threshold": 0.67,  # 2/3 majority
            "voting_mechanism": "weighted_by_expertise",
            "communication": "all_to_all",
            "decision_making": "majority_vote",
            "conflict_resolution": "revote_with_discussion"
        }
    
    async def _setup_p2p_coordination(
        self, 
        task: CoordinationTask, 
        agents: List[Agent]
    ) -> Dict[str, Any]:
        """Setup peer-to-peer coordination"""
        return {
            "pattern": "peer_to_peer",
            "peers": [a.agent_id for a in agents],
            "communication": "direct_messaging",
            "decision_making": "distributed",
            "conflict_resolution": "negotiation",
            "load_balancing": "dynamic"
        }
    
    async def _assign_coordination_group(self, agent: Agent) -> str:
        """Assign agent to appropriate coordination group"""
        # Group agents by similar capabilities
        for group_id, group_agents in self.coordination_groups.items():
            if group_agents:
                sample_agent = self.agents[group_agents[0]]
                capability_overlap = len(set(agent.capabilities) & set(sample_agent.capabilities))
                if capability_overlap >= len(agent.capabilities) * 0.5:
                    self.coordination_groups[group_id].append(agent.agent_id)
                    return group_id
        
        # Create new group if no suitable group found
        new_group_id = f"group_{len(self.coordination_groups)}"
        self.coordination_groups[new_group_id] = [agent.agent_id]
        return new_group_id
    
    async def _establish_hierarchy(self, agent: Agent):
        """Establish hierarchical relationships for the agent"""
        if agent.agent_type == AgentType.SUPERVISOR:
            # Find workers to supervise
            potential_subordinates = [
                a for a in self.agents.values() 
                if a.agent_type == AgentType.WORKER and not a.supervisor_id
                and a.coordination_group == agent.coordination_group
            ]
            
            # Assign up to 5 subordinates per supervisor
            for subordinate in potential_subordinates[:5]:
                subordinate.supervisor_id = agent.agent_id
                agent.subordinates.append(subordinate.agent_id)
                
                # Add edge to coordination graph
                self.coordination_graph.add_edge(agent.agent_id, subordinate.agent_id, 
                                               relationship="supervises")
    
    async def _update_agent_statuses(self):
        """Update status of all agents based on heartbeat and performance"""
        current_time = datetime.utcnow()
        
        for agent in self.agents.values():
            # Check heartbeat timeout
            if current_time - agent.last_heartbeat > timedelta(minutes=5):
                agent.status = AgentStatus.OFFLINE
                continue
            
            # Update status based on load
            if agent.current_load > 0.9:
                agent.status = AgentStatus.BUSY
            elif agent.current_load < 0.1:
                agent.status = AgentStatus.IDLE
            
            # Check for errors in performance metrics
            error_rate = agent.performance_metrics.get('error_rate', 0.0)
            if error_rate > 0.1:  # More than 10% error rate
                agent.status = AgentStatus.ERROR
    
    async def _process_task_queue(self) -> int:
        """Process pending tasks in the queue"""
        tasks_processed = 0
        
        # Sort tasks by priority and deadline
        self.task_queue.sort(key=lambda t: (
            -t.priority,
            t.deadline.timestamp() if t.deadline else float('inf')
        ))
        
        for task in self.task_queue[:]:
            assignment_result = await self.assign_task(task)
            if assignment_result["success"]:
                self.task_queue.remove(task)
                tasks_processed += 1
            elif task.deadline and datetime.utcnow() > task.deadline:
                # Remove expired tasks
                self.task_queue.remove(task)
                logger.warning(f"Task {task.task_id} expired and removed from queue")
        
        return tasks_processed
    
    async def _coordinate_active_tasks(self) -> int:
        """Coordinate agents working on active tasks"""
        agents_coordinated = 0
        
        for task in self.active_tasks.values():
            if task.status == "assigned":
                # Start task execution
                await self._start_task_execution(task)
                task.status = "executing"
            elif task.status == "executing":
                # Monitor and coordinate ongoing execution
                await self._monitor_task_execution(task)
                agents_coordinated += len(task.assigned_agents)
        
        return agents_coordinated
    
    async def _start_task_execution(self, task: CoordinationTask):
        """Initialize task execution with assigned agents"""
        # Send task details to all assigned agents
        for agent_id in task.assigned_agents:
            agent = self.agents[agent_id]
            # In a real implementation, this would send actual commands
            logger.info(f"Starting task {task.task_id} on agent {agent_id}")
    
    async def _monitor_task_execution(self, task: CoordinationTask):
        """Monitor ongoing task execution and coordinate agents"""
        # Check if all agents are still responsive
        responsive_agents = []
        for agent_id in task.assigned_agents:
            agent = self.agents[agent_id]
            if agent.status not in [AgentStatus.OFFLINE, AgentStatus.ERROR]:
                responsive_agents.append(agent_id)
        
        # Handle agent failures
        if len(responsive_agents) < len(task.assigned_agents):
            await self._handle_agent_failures(task, responsive_agents)
    
    async def _handle_agent_failures(self, task: CoordinationTask, responsive_agents: List[str]):
        """Handle agent failures during task execution"""
        failed_agents = set(task.assigned_agents) - set(responsive_agents)
        
        for failed_agent_id in failed_agents:
            logger.warning(f"Agent {failed_agent_id} failed during task {task.task_id}")
            
            # Try to find replacement agent
            replacement = await self._find_replacement_agent(task, failed_agent_id)
            if replacement:
                task.assigned_agents.remove(failed_agent_id)
                task.assigned_agents.append(replacement.agent_id)
                logger.info(f"Replaced failed agent {failed_agent_id} with {replacement.agent_id}")
    
    async def _find_replacement_agent(self, task: CoordinationTask, failed_agent_id: str) -> Optional[Agent]:
        """Find replacement agent for failed agent"""
        failed_agent = self.agents[failed_agent_id]
        
        # Find agents with similar capabilities
        suitable_replacements = []
        for agent in self.agents.values():
            if (agent.agent_id not in task.assigned_agents and
                agent.status == AgentStatus.IDLE and
                all(cap in agent.capabilities for cap in failed_agent.capabilities)):
                suitable_replacements.append(agent)
        
        if suitable_replacements:
            # Select best replacement based on performance
            return max(suitable_replacements, 
                      key=lambda a: a.performance_metrics.get('overall_performance', 0.5))
        
        return None
    
    async def _update_performance_metrics(self) -> int:
        """Update performance metrics for all agents"""
        updates = 0
        
        for agent in self.agents.values():
            # Simulate performance metric updates
            # In a real implementation, this would collect actual metrics
            if agent.agent_id not in self.performance_history:
                self.performance_history[agent.agent_id] = []
            
            current_metrics = {
                'timestamp': datetime.utcnow().isoformat(),
                'task_success_rate': agent.performance_metrics.get('task_success_rate', 0.5),
                'response_time': agent.performance_metrics.get('response_time', 100),
                'error_rate': agent.performance_metrics.get('error_rate', 0.05),
                'coordination_score': agent.performance_metrics.get('coordination_score', 0.7)
            }
            
            self.performance_history[agent.agent_id].append(current_metrics)
            
            # Keep only last 100 entries
            if len(self.performance_history[agent.agent_id]) > 100:
                self.performance_history[agent.agent_id] = self.performance_history[agent.agent_id][-100:]
            
            updates += 1
        
        return updates
    
    async def _resolve_conflicts(self) -> int:
        """Resolve conflicts between agents"""
        conflicts_resolved = 0
        
        # Check for resource conflicts
        resource_conflicts = await self._detect_resource_conflicts()
        for conflict in resource_conflicts:
            await self._resolve_resource_conflict(conflict)
            conflicts_resolved += 1
        
        # Check for coordination conflicts
        coordination_conflicts = await self._detect_coordination_conflicts()
        for conflict in coordination_conflicts:
            await self._resolve_coordination_conflict(conflict)
            conflicts_resolved += 1
        
        return conflicts_resolved
    
    async def _detect_resource_conflicts(self) -> List[Dict[str, Any]]:
        """Detect resource conflicts between agents"""
        conflicts = []
        
        # Check for agents competing for the same resources
        resource_usage = {}
        for agent in self.agents.values():
            for task_id in agent.current_tasks:
                if task_id in self.active_tasks:
                    task = self.active_tasks[task_id]
                    # Simulate resource conflict detection
                    if task.task_type == "physical_coordination":
                        location_key = f"{agent.location}" if agent.location else "unknown"
                        if location_key in resource_usage:
                            conflicts.append({
                                "type": "location_conflict",
                                "agents": [resource_usage[location_key], agent.agent_id],
                                "resource": location_key
                            })
                        else:
                            resource_usage[location_key] = agent.agent_id
        
        return conflicts
    
    async def _detect_coordination_conflicts(self) -> List[Dict[str, Any]]:
        """Detect coordination conflicts between agents"""
        conflicts = []
        
        # Check for conflicting coordination patterns
        for task in self.active_tasks.values():
            if len(task.assigned_agents) > 1:
                # Check if agents have conflicting coordination preferences
                agent_preferences = []
                for agent_id in task.assigned_agents:
                    agent = self.agents[agent_id]
                    preferred_pattern = agent.performance_metrics.get('preferred_coordination', 'hierarchical')
                    agent_preferences.append(preferred_pattern)
                
                if len(set(agent_preferences)) > 1:
                    conflicts.append({
                        "type": "coordination_pattern_conflict",
                        "task_id": task.task_id,
                        "agents": task.assigned_agents,
                        "preferences": agent_preferences
                    })
        
        return conflicts
    
    async def _resolve_resource_conflict(self, conflict: Dict[str, Any]):
        """Resolve resource conflict between agents"""
        if conflict["type"] == "location_conflict":
            # Prioritize based on task priority and agent performance
            agents = [self.agents[agent_id] for agent_id in conflict["agents"]]
            
            # Find tasks for each agent
            agent_tasks = []
            for agent in agents:
                for task_id in agent.current_tasks:
                    if task_id in self.active_tasks:
                        agent_tasks.append((agent, self.active_tasks[task_id]))
            
            if len(agent_tasks) >= 2:
                # Sort by task priority
                agent_tasks.sort(key=lambda x: x[1].priority, reverse=True)
                
                # Lower priority agent should yield
                yielding_agent, yielding_task = agent_tasks[1]
                
                # Reassign or delay the lower priority task
                await self._reassign_or_delay_task(yielding_task, yielding_agent)
    
    async def _resolve_coordination_conflict(self, conflict: Dict[str, Any]):
        """Resolve coordination pattern conflict"""
        if conflict["type"] == "coordination_pattern_conflict":
            task = self.active_tasks[conflict["task_id"]]
            
            # Use the coordination pattern preferred by the majority
            preferences = conflict["preferences"]
            most_common = max(set(preferences), key=preferences.count)
            
            # Update task coordination pattern
            task.coordination_pattern = CoordinationPattern(most_common)
            
            # Re-setup coordination with new pattern
            agents = [self.agents[agent_id] for agent_id in task.assigned_agents]
            await self._setup_coordination_pattern(task, agents)
    
    async def _reassign_or_delay_task(self, task: CoordinationTask, agent: Agent):
        """Reassign task to different agent or delay execution"""
        # Try to find alternative agent
        replacement = await self._find_replacement_agent(task, agent.agent_id)
        
        if replacement:
            # Reassign to replacement agent
            task.assigned_agents.remove(agent.agent_id)
            task.assigned_agents.append(replacement.agent_id)
            agent.current_tasks.remove(task.task_id)
            replacement.current_tasks.append(task.task_id)
        else:
            # Delay task execution
            task.status = "delayed"
            self.task_queue.append(task)
            del self.active_tasks[task.task_id]
            agent.current_tasks.remove(task.task_id)
    
    async def _optimize_agent_allocation(self):
        """Optimize agent allocation across tasks and groups"""
        # Rebalance load across agents
        overloaded_agents = [a for a in self.agents.values() if a.current_load > 0.8]
        underloaded_agents = [a for a in self.agents.values() if a.current_load < 0.3]
        
        for overloaded_agent in overloaded_agents:
            if underloaded_agents:
                # Try to redistribute some tasks
                tasks_to_redistribute = overloaded_agent.current_tasks[:1]  # Redistribute one task
                
                for task_id in tasks_to_redistribute:
                    if task_id in self.active_tasks:
                        task = self.active_tasks[task_id]
                        
                        # Find suitable underloaded agent
                        suitable_agents = [
                            a for a in underloaded_agents 
                            if all(cap in a.capabilities for cap in task.required_capabilities)
                        ]
                        
                        if suitable_agents:
                            target_agent = suitable_agents[0]
                            
                            # Transfer task
                            task.assigned_agents.remove(overloaded_agent.agent_id)
                            task.assigned_agents.append(target_agent.agent_id)
                            overloaded_agent.current_tasks.remove(task_id)
                            target_agent.current_tasks.append(task_id)
                            
                            # Update loads
                            overloaded_agent.current_load -= task.estimated_duration / overloaded_agent.max_capacity
                            target_agent.current_load += task.estimated_duration / target_agent.max_capacity
                            
                            break

class MultiAgentCoordinator:
    """High-level coordinator for multiple agent managers"""
    
    def __init__(self):
        self.agent_managers: Dict[str, AgentManager] = {}
        self.global_task_queue: List[CoordinationTask] = []
        
    async def coordinate_across_managers(self) -> Dict[str, Any]:
        """Coordinate agents across multiple managers"""
        results = {}
        
        for manager_id, manager in self.agent_managers.items():
            manager_results = await manager.coordinate_agents()
            results[manager_id] = manager_results
        
        return results
