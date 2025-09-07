"""
AI Decision Engine - Advanced Multi-Layer Intelligence System
Three-layer architecture: Capability Matching, Multi-Objective Optimization, Reinforcement Learning
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
from datetime import datetime, timezone
import asyncio
import logging
import json
import time
import uuid
import math
import numpy as np
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod
import random
from collections import defaultdict, deque
import sqlite3
import threading
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="AI Decision Engine - Agent Selection Service",
    description="Advanced multi-layer intelligence system for optimal task allocation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums and Models
class AgentType(str, Enum):
    ROBOT = "robot"
    HUMAN = "human"
    AI_SYSTEM = "ai_system"
    HYBRID = "hybrid"

class TaskPriority(str, Enum):
    SAFETY_CRITICAL = "safety_critical"
    QUALITY_CRITICAL = "quality_critical"
    EFFICIENCY_CRITICAL = "efficiency_critical"
    STANDARD = "standard"

class TaskType(str, Enum):
    PRECISION_ASSEMBLY = "precision_assembly"
    HEAVY_LIFTING = "heavy_lifting"
    QUALITY_INSPECTION = "quality_inspection"
    DATA_ANALYSIS = "data_analysis"
    CREATIVE_PROBLEM_SOLVING = "creative_problem_solving"
    REPETITIVE_TASKS = "repetitive_tasks"
    PATTERN_RECOGNITION = "pattern_recognition"
    NATURAL_LANGUAGE = "natural_language"
    VISUAL_INSPECTION = "visual_inspection"
    OPTIMIZATION = "optimization"

class AgentStatus(str, Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

# Data Models
@dataclass
class Agent:
    agent_id: str
    name: str
    agent_type: AgentType
    status: AgentStatus
    capabilities: Dict[str, float]  # task_type -> proficiency (0.0-1.0)
    current_load: float = 0.0  # 0.0-1.0
    location: str = "default"
    last_performance: Dict[str, float] = None
    fatigue_level: float = 0.0  # 0.0-1.0
    energy_efficiency: float = 1.0  # 0.0-1.0
    cost_per_hour: float = 0.0
    safety_rating: float = 1.0  # 0.0-1.0

@dataclass
class Task:
    task_id: str
    task_type: TaskType
    priority: TaskPriority
    complexity: float  # 0.0-1.0
    estimated_duration: int  # minutes
    quality_requirements: float  # 0.0-1.0
    safety_requirements: float  # 0.0-1.0
    deadline: Optional[datetime] = None
    dependencies: List[str] = None
    location: str = "default"
    parameters: Dict[str, Any] = None

@dataclass
class Assignment:
    assignment_id: str
    task_id: str
    agent_id: str
    confidence_score: float
    estimated_completion_time: int
    quality_prediction: float
    cost_estimate: float
    safety_score: float
    energy_efficiency: float
    created_at: datetime

# Layer 1: Capability Matching Engine
class CapabilityMatrix:
    """Multi-Agent Capability Matrix with dynamic assessment"""
    
    def __init__(self):
        # Base capability profiles for different agent types
        self.base_capabilities = {
            AgentType.ROBOT: {
                TaskType.PRECISION_ASSEMBLY: 0.95,
                TaskType.HEAVY_LIFTING: 0.90,
                TaskType.REPETITIVE_TASKS: 0.98,
                TaskType.CREATIVE_PROBLEM_SOLVING: 0.10,
                TaskType.QUALITY_INSPECTION: 0.85,
                TaskType.VISUAL_INSPECTION: 0.80,
                TaskType.DATA_ANALYSIS: 0.30,
                TaskType.PATTERN_RECOGNITION: 0.70,
                TaskType.NATURAL_LANGUAGE: 0.20,
                TaskType.OPTIMIZATION: 0.60
            },
            AgentType.HUMAN: {
                TaskType.PRECISION_ASSEMBLY: 0.70,
                TaskType.HEAVY_LIFTING: 0.30,
                TaskType.REPETITIVE_TASKS: 0.40,
                TaskType.CREATIVE_PROBLEM_SOLVING: 0.95,
                TaskType.QUALITY_INSPECTION: 0.90,
                TaskType.VISUAL_INSPECTION: 0.95,
                TaskType.DATA_ANALYSIS: 0.75,
                TaskType.PATTERN_RECOGNITION: 0.85,
                TaskType.NATURAL_LANGUAGE: 0.90,
                TaskType.OPTIMIZATION: 0.80
            },
            AgentType.AI_SYSTEM: {
                TaskType.DATA_ANALYSIS: 0.95,
                TaskType.PATTERN_RECOGNITION: 0.90,
                TaskType.OPTIMIZATION: 0.85,
                TaskType.NATURAL_LANGUAGE: 0.80,
                TaskType.VISUAL_INSPECTION: 0.75,
                TaskType.PRECISION_ASSEMBLY: 0.20,
                TaskType.HEAVY_LIFTING: 0.05,
                TaskType.REPETITIVE_TASKS: 0.85,
                TaskType.CREATIVE_PROBLEM_SOLVING: 0.60,
                TaskType.QUALITY_INSPECTION: 0.70
            }
        }
        
        self.performance_history = defaultdict(lambda: defaultdict(list))
        self.environmental_factors = {}
    
    def get_base_capability(self, agent: Agent, task_type: TaskType) -> float:
        """Get base capability score for agent-task combination"""
        if task_type.value in agent.capabilities:
            return agent.capabilities[task_type.value]
        
        # Fallback to type-based capability
        return self.base_capabilities.get(agent.agent_type, {}).get(task_type, 0.0)
    
    def assess_real_time_capability(self, agent: Agent, task: Task) -> float:
        """Dynamic capability assessment considering current conditions"""
        base_capability = self.get_base_capability(agent, task.task_type)
        
        # Factor in current conditions
        fatigue_factor = self.calculate_fatigue_factor(agent)
        load_factor = self.calculate_load_factor(agent)
        recent_performance = self.get_recent_performance_trend(agent, task.task_type)
        complexity_adjustment = self.calculate_complexity_adjustment(agent, task)
        
        # Combine all factors
        adjusted_capability = (
            base_capability * 
            fatigue_factor * 
            load_factor * 
            recent_performance * 
            complexity_adjustment
        )
        
        return min(max(adjusted_capability, 0.0), 1.0)  # Clamp between 0 and 1
    
    def calculate_fatigue_factor(self, agent: Agent) -> float:
        """Calculate fatigue impact on capability"""
        if agent.agent_type == AgentType.ROBOT:
            return 1.0  # Robots don't get fatigued
        
        # Human fatigue affects performance
        return max(0.3, 1.0 - agent.fatigue_level * 0.7)
    
    def calculate_load_factor(self, agent: Agent) -> float:
        """Calculate current workload impact on capability"""
        if agent.current_load >= 0.9:
            return 0.5  # Heavily loaded
        elif agent.current_load >= 0.7:
            return 0.8  # Moderately loaded
        else:
            return 1.0  # Lightly loaded
    
    def get_recent_performance_trend(self, agent: Agent, task_type: TaskType) -> float:
        """Get recent performance trend for agent on task type"""
        history = self.performance_history[agent.agent_id][task_type.value]
        
        if not history:
            return 1.0  # No history, assume baseline
        
        # Use last 5 performances
        recent = history[-5:]
        if len(recent) < 2:
            return 1.0
        
        # Calculate trend (improving vs declining)
        trend = np.polyfit(range(len(recent)), recent, 1)[0]
        
        # Convert trend to multiplier (0.8 to 1.2)
        return max(0.8, min(1.2, 1.0 + trend))
    
    def calculate_complexity_adjustment(self, agent: Agent, task: Task) -> float:
        """Adjust capability based on task complexity"""
        if task.complexity <= 0.3:
            return 1.0  # Simple tasks
        elif task.complexity <= 0.7:
            return 0.9  # Moderate complexity
        else:
            return 0.8  # High complexity

# Layer 2: Multi-Objective Optimization Engine
class OptimizationCriteria:
    """Multi-objective optimization with configurable weights"""
    
    def __init__(self):
        self.objectives = {
            'speed': {'weight': 0.25, 'maximize': False},  # Minimize completion time
            'quality': {'weight': 0.30, 'maximize': True},  # Maximize quality
            'cost': {'weight': 0.20, 'maximize': False},  # Minimize cost
            'safety': {'weight': 0.15, 'maximize': True},  # Maximize safety
            'energy_efficiency': {'weight': 0.10, 'maximize': True}  # Maximize efficiency
        }
    
    def calculate_completion_time(self, agent: Agent, task: Task) -> float:
        """Estimate task completion time"""
        base_time = task.estimated_duration
        capability = self.capability_matrix.assess_real_time_capability(agent, task)
        
        # Higher capability = faster completion
        adjusted_time = base_time / max(capability, 0.1)
        
        # Factor in current load
        load_multiplier = 1.0 + agent.current_load * 0.5
        
        return adjusted_time * load_multiplier
    
    def calculate_quality_score(self, agent: Agent, task: Task) -> float:
        """Predict quality outcome"""
        capability = self.capability_matrix.assess_real_time_capability(agent, task)
        
        # Quality is directly related to capability
        base_quality = capability
        
        # Adjust for task requirements
        if task.quality_requirements > capability:
            quality_penalty = (task.quality_requirements - capability) * 0.5
            base_quality -= quality_penalty
        
        return max(0.0, min(1.0, base_quality))
    
    def calculate_resource_cost(self, agent: Agent, task: Task) -> float:
        """Calculate resource cost for assignment"""
        completion_time_hours = self.calculate_completion_time(agent, task) / 60.0
        return agent.cost_per_hour * completion_time_hours
    
    def calculate_safety_score(self, agent: Agent, task: Task) -> float:
        """Calculate safety score for assignment"""
        agent_safety = agent.safety_rating
        task_safety_req = task.safety_requirements
        
        # Safety score is minimum of agent rating and task requirements
        return min(agent_safety, 1.0 - (task_safety_req - agent_safety) * 0.3)
    
    def calculate_energy_usage(self, agent: Agent, task: Task) -> float:
        """Calculate energy efficiency score"""
        return agent.energy_efficiency
    
    def calculate_composite_score(self, agent: Agent, task: Task) -> float:
        """Calculate weighted composite score for assignment"""
        scores = {}
        
        # Calculate individual objective scores
        completion_time = self.calculate_completion_time(agent, task)
        scores['speed'] = 1.0 / (1.0 + completion_time / 60.0)  # Normalize and invert
        scores['quality'] = self.calculate_quality_score(agent, task)
        scores['cost'] = 1.0 / (1.0 + self.calculate_resource_cost(agent, task) / 100.0)  # Normalize and invert
        scores['safety'] = self.calculate_safety_score(agent, task)
        scores['energy_efficiency'] = self.calculate_energy_usage(agent, task)
        
        # Calculate weighted sum
        composite_score = 0.0
        for objective, config in self.objectives.items():
            weight = config['weight']
            score = scores[objective]
            
            if not config['maximize']:
                score = 1.0 - score  # Invert for minimization objectives
            
            composite_score += weight * score
        
        return composite_score
    
    def optimize_assignment(self, task: Task, available_agents: List[Agent]) -> Optional[Assignment]:
        """Find optimal agent assignment for task"""
        if not available_agents:
            return None
        
        best_agent = None
        best_score = float('-inf')
        
        for agent in available_agents:
            if agent.status != AgentStatus.AVAILABLE:
                continue
            
            score = self.calculate_composite_score(agent, task)
            
            if score > best_score:
                best_score = score
                best_agent = agent
        
        if best_agent is None:
            return None
        
        # Create assignment
        assignment = Assignment(
            assignment_id=str(uuid.uuid4()),
            task_id=task.task_id,
            agent_id=best_agent.agent_id,
            confidence_score=best_score,
            estimated_completion_time=int(self.calculate_completion_time(best_agent, task)),
            quality_prediction=self.calculate_quality_score(best_agent, task),
            cost_estimate=self.calculate_resource_cost(best_agent, task),
            safety_score=self.calculate_safety_score(best_agent, task),
            energy_efficiency=self.calculate_energy_usage(best_agent, task),
            created_at=datetime.now(timezone.utc)
        )
        
        return assignment

# Layer 3: Reinforcement Learning Optimization
class AgentSelectionBandit:
    """Multi-Armed Bandit for agent selection with UCB algorithm"""
    
    def __init__(self):
        self.success_counts = defaultdict(int)
        self.attempt_counts = defaultdict(int)
        self.confidence_intervals = {}
        self.exploration_factor = 2.0
    
    def select_agent_ucb(self, task: Task, available_agents: List[Agent]) -> Agent:
        """Upper Confidence Bound agent selection"""
        total_attempts = sum(self.attempt_counts.values())
        
        if total_attempts == 0:
            return random.choice(available_agents)
        
        ucb_scores = {}
        
        for agent in available_agents:
            agent_key = f"{agent.agent_id}_{task.task_type.value}"
            
            if self.attempt_counts[agent_key] == 0:
                return agent  # Explore unselected agents first
            
            success_rate = self.success_counts[agent_key] / self.attempt_counts[agent_key]
            exploration_term = math.sqrt(
                self.exploration_factor * math.log(total_attempts) / self.attempt_counts[agent_key]
            )
            
            ucb_scores[agent.agent_id] = success_rate + exploration_term
        
        best_agent_id = max(ucb_scores.keys(), key=lambda k: ucb_scores[k])
        return next(agent for agent in available_agents if agent.agent_id == best_agent_id)
    
    def update_performance(self, agent_id: str, task_type: TaskType, success: bool):
        """Update performance statistics"""
        agent_key = f"{agent_id}_{task_type.value}"

        self.attempt_counts[agent_key] += 1
        if success:
            self.success_counts[agent_key] += 1

class TaskAllocationQLearning:
    """Q-Learning for task allocation optimization"""

    def __init__(self):
        self.q_table = {}  # State-action value table
        self.learning_rate = 0.1
        self.discount_factor = 0.95
        self.epsilon = 0.1  # Exploration rate
        self.state_history = deque(maxlen=1000)

    def get_state_representation(self, agents: List[Agent], task_queue: List[Task], current_time: datetime) -> tuple:
        """Convert current situation to state vector"""
        # Workload distribution
        workload_dist = [agent.current_load for agent in agents]
        workload_avg = np.mean(workload_dist) if workload_dist else 0.0
        workload_std = np.std(workload_dist) if len(workload_dist) > 1 else 0.0

        # Agent availability
        available_count = sum(1 for agent in agents if agent.status == AgentStatus.AVAILABLE)
        total_agents = len(agents)
        availability_ratio = available_count / max(total_agents, 1)

        # Task urgency
        urgent_tasks = sum(1 for task in task_queue if task.priority in [TaskPriority.SAFETY_CRITICAL, TaskPriority.QUALITY_CRITICAL])
        urgency_ratio = urgent_tasks / max(len(task_queue), 1)

        # Time context
        hour_of_day = current_time.hour
        time_context = self.encode_time_context(hour_of_day)

        # Performance trend
        recent_performance = self.get_recent_performance_trend()

        state = (
            round(workload_avg, 2),
            round(workload_std, 2),
            round(availability_ratio, 2),
            round(urgency_ratio, 2),
            time_context,
            round(recent_performance, 2)
        )

        return state

    def encode_time_context(self, hour: int) -> str:
        """Encode time of day into context categories"""
        if 6 <= hour < 14:
            return "morning_shift"
        elif 14 <= hour < 22:
            return "afternoon_shift"
        else:
            return "night_shift"

    def get_recent_performance_trend(self) -> float:
        """Calculate recent performance trend"""
        if len(self.state_history) < 5:
            return 0.5  # Neutral

        recent_rewards = [state['reward'] for state in list(self.state_history)[-5:]]
        return np.mean(recent_rewards)

    def select_action(self, state: tuple, available_actions: List[str]) -> str:
        """Select action using epsilon-greedy policy"""
        if random.random() < self.epsilon:
            return random.choice(available_actions)  # Explore

        # Exploit: choose best known action
        if state not in self.q_table:
            return random.choice(available_actions)

        state_actions = self.q_table[state]
        available_q_values = {action: state_actions.get(action, 0.0) for action in available_actions}

        return max(available_q_values.keys(), key=lambda k: available_q_values[k])

    def update_q_values(self, state: tuple, action: str, reward: float, next_state: tuple):
        """Update Q-values based on task completion outcomes"""
        if state not in self.q_table:
            self.q_table[state] = {}
        if action not in self.q_table[state]:
            self.q_table[state][action] = 0.0

        # Get best next action value
        best_next_value = 0.0
        if next_state in self.q_table:
            best_next_value = max(self.q_table[next_state].values(), default=0.0)

        # Q-learning update rule
        current_q = self.q_table[state][action]
        new_q = current_q + self.learning_rate * (
            reward + self.discount_factor * best_next_value - current_q
        )

        self.q_table[state][action] = new_q

        # Store state history
        self.state_history.append({
            'state': state,
            'action': action,
            'reward': reward,
            'timestamp': datetime.now(timezone.utc)
        })

# Advanced Decision Making Features
class ContextualTaskDecomposer:
    """Context-aware task decomposition for complex tasks"""

    def __init__(self):
        self.complexity_threshold = 0.7
        self.decomposition_strategies = {
            'sequential': self.sequential_decomposition,
            'parallel': self.parallel_decomposition,
            'hierarchical': self.hierarchical_decomposition
        }

    def analyze_task_complexity(self, task: Task) -> float:
        """Analyze task complexity score"""
        complexity_factors = [
            task.complexity,
            len(task.dependencies or []) * 0.1,
            task.quality_requirements,
            task.safety_requirements
        ]

        return min(np.mean(complexity_factors), 1.0)

    def decompose_complex_task(self, task: Task, available_agents: List[Agent]) -> List[Task]:
        """Break down complex tasks based on current context"""
        complexity_score = self.analyze_task_complexity(task)

        if complexity_score < self.complexity_threshold:
            return [task]  # Simple task, no decomposition needed

        # Select decomposition strategy
        strategy = self.select_decomposition_strategy(task, available_agents)

        # Apply decomposition
        subtasks = self.decomposition_strategies[strategy](task, available_agents)

        return subtasks

    def select_decomposition_strategy(self, task: Task, available_agents: List[Agent]) -> str:
        """Select optimal decomposition strategy"""
        agent_types = set(agent.agent_type for agent in available_agents)

        if len(agent_types) > 1 and task.task_type in [TaskType.PRECISION_ASSEMBLY, TaskType.QUALITY_INSPECTION]:
            return 'parallel'  # Multi-agent parallel execution
        elif task.complexity > 0.8:
            return 'hierarchical'  # Complex hierarchical breakdown
        else:
            return 'sequential'  # Sequential execution

    def sequential_decomposition(self, task: Task, available_agents: List[Agent]) -> List[Task]:
        """Sequential task decomposition"""
        subtasks = []
        base_duration = task.estimated_duration // 3

        for i in range(3):
            subtask = Task(
                task_id=f"{task.task_id}_seq_{i+1}",
                task_type=task.task_type,
                priority=task.priority,
                complexity=task.complexity * 0.6,  # Reduced complexity
                estimated_duration=base_duration,
                quality_requirements=task.quality_requirements,
                safety_requirements=task.safety_requirements,
                deadline=task.deadline,
                dependencies=[f"{task.task_id}_seq_{i}"] if i > 0 else [],
                location=task.location,
                parameters=task.parameters
            )
            subtasks.append(subtask)

        return subtasks

    def parallel_decomposition(self, task: Task, available_agents: List[Agent]) -> List[Task]:
        """Parallel task decomposition"""
        subtasks = []
        num_subtasks = min(len(available_agents), 3)
        base_duration = task.estimated_duration // 2  # Parallel execution is faster

        for i in range(num_subtasks):
            subtask = Task(
                task_id=f"{task.task_id}_par_{i+1}",
                task_type=task.task_type,
                priority=task.priority,
                complexity=task.complexity * 0.7,
                estimated_duration=base_duration,
                quality_requirements=task.quality_requirements,
                safety_requirements=task.safety_requirements,
                deadline=task.deadline,
                dependencies=[],  # No dependencies for parallel tasks
                location=task.location,
                parameters=task.parameters
            )
            subtasks.append(subtask)

        return subtasks

    def hierarchical_decomposition(self, task: Task, available_agents: List[Agent]) -> List[Task]:
        """Hierarchical task decomposition"""
        subtasks = []

        # Create planning subtask
        planning_task = Task(
            task_id=f"{task.task_id}_plan",
            task_type=TaskType.OPTIMIZATION,
            priority=task.priority,
            complexity=0.3,
            estimated_duration=task.estimated_duration // 10,
            quality_requirements=task.quality_requirements,
            safety_requirements=task.safety_requirements,
            deadline=task.deadline,
            dependencies=[],
            location=task.location,
            parameters=task.parameters
        )
        subtasks.append(planning_task)

        # Create execution subtasks
        for i in range(2):
            exec_task = Task(
                task_id=f"{task.task_id}_exec_{i+1}",
                task_type=task.task_type,
                priority=task.priority,
                complexity=task.complexity * 0.8,
                estimated_duration=task.estimated_duration // 3,
                quality_requirements=task.quality_requirements,
                safety_requirements=task.safety_requirements,
                deadline=task.deadline,
                dependencies=[planning_task.task_id],
                location=task.location,
                parameters=task.parameters
            )
            subtasks.append(exec_task)

        return subtasks

class PredictiveFailurePrevention:
    """Predictive failure prevention system"""

    def __init__(self):
        self.failure_thresholds = {
            'robot_mechanical': 0.7,
            'human_fatigue': 0.8,
            'ai_performance_degradation': 0.6
        }
        self.failure_history = defaultdict(list)

    def predict_failure_probability(self, agent: Agent, task: Task, time_horizon: str = '1_hour') -> float:
        """Predict probability of failure for agent performing task"""

        # Base failure probability based on agent type and task
        base_failure_prob = self.get_base_failure_probability(agent, task)

        # Adjust for current conditions
        fatigue_factor = agent.fatigue_level if agent.agent_type == AgentType.HUMAN else 0.0
        load_factor = agent.current_load
        complexity_factor = task.complexity

        # Calculate adjusted failure probability
        adjusted_prob = base_failure_prob + (
            fatigue_factor * 0.3 +
            load_factor * 0.2 +
            complexity_factor * 0.2
        )

        return min(max(adjusted_prob, 0.0), 1.0)

    def get_base_failure_probability(self, agent: Agent, task: Task) -> float:
        """Get base failure probability for agent-task combination"""
        failure_rates = {
            AgentType.ROBOT: 0.05,  # 5% base failure rate
            AgentType.HUMAN: 0.10,  # 10% base failure rate
            AgentType.AI_SYSTEM: 0.03  # 3% base failure rate
        }

        return failure_rates.get(agent.agent_type, 0.05)

    def adjust_assignment_for_failure_risk(self, assignments: List[Assignment], agents: List[Agent], tasks: List[Task]) -> List[Assignment]:
        """Modify assignments to minimize failure risk"""
        adjusted_assignments = []

        for assignment in assignments:
            agent = next((a for a in agents if a.agent_id == assignment.agent_id), None)
            task = next((t for t in tasks if t.task_id == assignment.task_id), None)

            if not agent or not task:
                continue

            failure_prob = self.predict_failure_probability(agent, task)

            if failure_prob > self.failure_thresholds.get(f"{agent.agent_type.value}_failure", 0.7):
                # High failure risk - try to find alternative
                alternative_assignment = self.find_alternative_assignment(assignment, agents, tasks)
                if alternative_assignment:
                    adjusted_assignments.append(alternative_assignment)
                else:
                    # No alternative found, keep original but flag as high risk
                    assignment.confidence_score *= 0.5  # Reduce confidence
                    adjusted_assignments.append(assignment)
            else:
                adjusted_assignments.append(assignment)

        return adjusted_assignments

    def find_alternative_assignment(self, original_assignment: Assignment, agents: List[Agent], tasks: List[Task]) -> Optional[Assignment]:
        """Find alternative agent for high-risk assignment"""
        task = next((t for t in tasks if t.task_id == original_assignment.task_id), None)
        if not task:
            return None

        # Find agents with lower failure risk
        alternative_agents = []
        for agent in agents:
            if agent.agent_id != original_assignment.agent_id and agent.status == AgentStatus.AVAILABLE:
                failure_prob = self.predict_failure_probability(agent, task)
                if failure_prob < 0.5:  # Lower risk threshold
                    alternative_agents.append((agent, failure_prob))

        if not alternative_agents:
            return None

        # Select agent with lowest failure probability
        best_agent = min(alternative_agents, key=lambda x: x[1])[0]

        # Create new assignment
        return Assignment(
            assignment_id=str(uuid.uuid4()),
            task_id=task.task_id,
            agent_id=best_agent.agent_id,
            confidence_score=original_assignment.confidence_score * 0.8,  # Slightly lower confidence
            estimated_completion_time=original_assignment.estimated_completion_time,
            quality_prediction=original_assignment.quality_prediction,
            cost_estimate=original_assignment.cost_estimate,
            safety_score=original_assignment.safety_score,
            energy_efficiency=original_assignment.energy_efficiency,
            created_at=datetime.now(timezone.utc)
        )

# Genetic Algorithm Optimizer for Complex Multi-Agent Scenarios
class GeneticAlgorithmOptimizer:
    """Advanced genetic algorithm for complex multi-agent task assignment optimization"""

    def __init__(self, population_size=50, generations=100, mutation_rate=0.1, crossover_rate=0.8):
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.fitness_history = []

    def create_individual(self, tasks: List[Task], agents: List[Agent]) -> Dict[str, str]:
        """Create a random assignment individual (chromosome)"""
        individual = {}
        available_agents = [a.agent_id for a in agents if a.status == AgentStatus.AVAILABLE]

        for task in tasks:
            if available_agents:
                individual[task.task_id] = random.choice(available_agents)

        return individual

    def calculate_fitness(self, individual: Dict[str, str], tasks: List[Task], agents: List[Agent],
                         optimization_engine) -> float:
        """Calculate fitness score for an assignment individual"""
        total_fitness = 0.0
        agent_workloads = defaultdict(float)

        for task_id, agent_id in individual.items():
            task = next((t for t in tasks if t.task_id == task_id), None)
            agent = next((a for a in agents if a.agent_id == agent_id), None)

            if task and agent:
                # Calculate assignment quality using existing optimization engine
                assignment_score = optimization_engine.calculate_assignment_score(agent, task)

                # Apply workload balancing penalty
                agent_workloads[agent_id] += task.estimated_duration
                workload_penalty = min(agent_workloads[agent_id] / 480, 1.0)  # 8-hour workday

                # Combine scores
                fitness_contribution = assignment_score * (1.0 - workload_penalty * 0.3)
                total_fitness += fitness_contribution

        # Add diversity bonus for balanced workload distribution
        workload_variance = np.var(list(agent_workloads.values())) if agent_workloads else 0
        diversity_bonus = max(0, 1.0 - workload_variance / 10000)  # Normalize variance

        return total_fitness + diversity_bonus

    def crossover(self, parent1: Dict[str, str], parent2: Dict[str, str]) -> Tuple[Dict[str, str], Dict[str, str]]:
        """Single-point crossover between two parents"""
        if random.random() > self.crossover_rate:
            return parent1.copy(), parent2.copy()

        tasks = list(parent1.keys())
        if len(tasks) < 2:
            return parent1.copy(), parent2.copy()

        crossover_point = random.randint(1, len(tasks) - 1)

        child1 = {}
        child2 = {}

        for i, task_id in enumerate(tasks):
            if i < crossover_point:
                child1[task_id] = parent1[task_id]
                child2[task_id] = parent2[task_id]
            else:
                child1[task_id] = parent2[task_id]
                child2[task_id] = parent1[task_id]

        return child1, child2

    def mutate(self, individual: Dict[str, str], agents: List[Agent]) -> Dict[str, str]:
        """Mutate an individual by randomly reassigning some tasks"""
        mutated = individual.copy()
        available_agents = [a.agent_id for a in agents if a.status == AgentStatus.AVAILABLE]

        for task_id in mutated:
            if random.random() < self.mutation_rate and available_agents:
                mutated[task_id] = random.choice(available_agents)

        return mutated

    def optimize_assignments(self, tasks: List[Task], agents: List[Agent],
                           optimization_engine) -> Dict[str, str]:
        """Run genetic algorithm optimization"""
        if not tasks or not agents:
            return {}

        # Initialize population
        population = []
        for _ in range(self.population_size):
            individual = self.create_individual(tasks, agents)
            population.append(individual)

        best_fitness = float('-inf')
        best_individual = None

        for generation in range(self.generations):
            # Calculate fitness for all individuals
            fitness_scores = []
            for individual in population:
                fitness = self.calculate_fitness(individual, tasks, agents, optimization_engine)
                fitness_scores.append(fitness)

                if fitness > best_fitness:
                    best_fitness = fitness
                    best_individual = individual.copy()

            self.fitness_history.append(best_fitness)

            # Selection (tournament selection)
            new_population = []
            for _ in range(self.population_size // 2):
                # Tournament selection for parents
                parent1 = self.tournament_selection(population, fitness_scores)
                parent2 = self.tournament_selection(population, fitness_scores)

                # Crossover
                child1, child2 = self.crossover(parent1, parent2)

                # Mutation
                child1 = self.mutate(child1, agents)
                child2 = self.mutate(child2, agents)

                new_population.extend([child1, child2])

            population = new_population

        return best_individual or {}

    def tournament_selection(self, population: List[Dict[str, str]],
                           fitness_scores: List[float], tournament_size: int = 3) -> Dict[str, str]:
        """Tournament selection for parent selection"""
        tournament_indices = random.sample(range(len(population)),
                                         min(tournament_size, len(population)))
        best_index = max(tournament_indices, key=lambda i: fitness_scores[i])
        return population[best_index].copy()

# Simulation Engine for What-If Analysis
class SimulationEngine:
    """Advanced simulation engine for scenario planning and what-if analysis"""

    def __init__(self):
        self.simulation_history = []
        self.scenario_templates = {
            'high_load': {'task_multiplier': 3.0, 'agent_availability': 0.7},
            'agent_failure': {'agent_availability': 0.5, 'task_multiplier': 1.0},
            'rush_orders': {'priority_shift': 'high', 'deadline_pressure': 0.5},
            'maintenance_window': {'agent_availability': 0.3, 'duration_multiplier': 1.5}
        }

    def create_scenario(self, base_tasks: List[Task], base_agents: List[Agent],
                       scenario_type: str = 'normal', custom_params: Dict = None) -> Tuple[List[Task], List[Agent]]:
        """Create a simulation scenario with modified tasks and agents"""
        scenario_params = self.scenario_templates.get(scenario_type, {})
        if custom_params:
            scenario_params.update(custom_params)

        # Modify tasks based on scenario
        modified_tasks = []
        for task in base_tasks:
            new_task = Task(
                task_id=f"sim_{task.task_id}",
                task_type=task.task_type,
                priority=task.priority,
                requirements=task.requirements,
                estimated_duration=int(task.estimated_duration * scenario_params.get('duration_multiplier', 1.0)),
                deadline=task.deadline,
                complexity=task.complexity,
                location=task.location
            )

            # Apply priority shifts
            if scenario_params.get('priority_shift') == 'high':
                if new_task.priority == TaskPriority.STANDARD:
                    new_task.priority = TaskPriority.EFFICIENCY_CRITICAL

            modified_tasks.append(new_task)

        # Multiply tasks if needed
        task_multiplier = scenario_params.get('task_multiplier', 1.0)
        if task_multiplier > 1.0:
            additional_tasks = []
            for i in range(int(task_multiplier) - 1):
                for task in modified_tasks:
                    additional_task = Task(
                        task_id=f"{task.task_id}_copy_{i}",
                        task_type=task.task_type,
                        priority=task.priority,
                        requirements=task.requirements,
                        estimated_duration=task.estimated_duration,
                        deadline=task.deadline,
                        complexity=task.complexity,
                        location=task.location
                    )
                    additional_tasks.append(additional_task)
            modified_tasks.extend(additional_tasks)

        # Modify agents based on scenario
        modified_agents = []
        agent_availability = scenario_params.get('agent_availability', 1.0)

        for agent in base_agents:
            new_agent = Agent(
                agent_id=f"sim_{agent.agent_id}",
                name=f"Sim_{agent.name}",
                agent_type=agent.agent_type,
                capabilities=agent.capabilities.copy(),
                status=agent.status,
                location=agent.location,
                cost_per_hour=agent.cost_per_hour,
                current_load=agent.current_load,
                fatigue_level=agent.fatigue_level,
                energy_efficiency=agent.energy_efficiency
            )

            # Randomly make some agents unavailable based on availability factor
            if random.random() > agent_availability:
                new_agent.status = AgentStatus.MAINTENANCE

            modified_agents.append(new_agent)

        return modified_tasks, modified_agents

    def run_simulation(self, base_tasks: List[Task], base_agents: List[Agent],
                      ai_engine, scenario_type: str = 'normal',
                      custom_params: Dict = None) -> Dict[str, Any]:
        """Run a complete simulation scenario"""
        start_time = time.time()

        # Create scenario
        sim_tasks, sim_agents = self.create_scenario(base_tasks, base_agents, scenario_type, custom_params)

        # Run assignments
        assignments = []
        total_cost = 0.0
        total_duration = 0
        successful_assignments = 0

        for task in sim_tasks:
            try:
                # Use AI engine to find optimal assignment
                assignment = ai_engine.find_optimal_assignment(task, sim_agents)
                if assignment:
                    assignments.append(assignment)
                    total_cost += assignment.cost_estimate
                    total_duration += assignment.estimated_completion_time.timestamp() - time.time()
                    successful_assignments += 1

                    # Update agent workload
                    assigned_agent = next((a for a in sim_agents if a.agent_id == assignment.agent_id), None)
                    if assigned_agent:
                        assigned_agent.current_load += 0.1  # Simulate workload increase
            except Exception as e:
                logger.warning(f"Simulation assignment failed for task {task.task_id}: {e}")

        # Calculate metrics
        assignment_success_rate = successful_assignments / len(sim_tasks) if sim_tasks else 0
        average_cost = total_cost / successful_assignments if successful_assignments else 0
        simulation_time = time.time() - start_time

        # Agent utilization
        agent_utilization = {}
        for agent in sim_agents:
            assigned_tasks = [a for a in assignments if a.agent_id == agent.agent_id]
            utilization = len(assigned_tasks) / len(sim_tasks) if sim_tasks else 0
            agent_utilization[agent.agent_id] = utilization

        simulation_result = {
            'scenario_type': scenario_type,
            'scenario_params': custom_params or {},
            'total_tasks': len(sim_tasks),
            'total_agents': len(sim_agents),
            'successful_assignments': successful_assignments,
            'assignment_success_rate': assignment_success_rate,
            'total_cost': total_cost,
            'average_cost_per_task': average_cost,
            'simulation_time_seconds': simulation_time,
            'agent_utilization': agent_utilization,
            'assignments': [asdict(a) for a in assignments],
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        self.simulation_history.append(simulation_result)
        return simulation_result

# Integration Service for Robot and IoT Systems
class SystemIntegrationService:
    """Service for integrating with external robot and IoT systems"""

    def __init__(self):
        self.robot_service_url = "http://localhost:8002"
        self.iot_service_url = "http://localhost:8001"
        self.integration_cache = {}
        self.last_sync_time = {}
        self.executor = ThreadPoolExecutor(max_workers=5)

    async def sync_robot_agents(self) -> List[Agent]:
        """Sync robot agents from robot abstraction service"""
        try:
            response = requests.get(f"{self.robot_service_url}/api/v1/robots", timeout=5)
            if response.status_code == 200:
                robot_data = response.json()
                agents = []

                for robot in robot_data.get('robots', []):
                    # Convert robot to agent format
                    agent = Agent(
                        agent_id=robot['robot_id'],
                        name=robot.get('name', robot['robot_id']),
                        agent_type=AgentType.ROBOT,
                        capabilities=self._convert_robot_capabilities(robot.get('capabilities', {})),
                        status=self._convert_robot_status(robot.get('status', 'idle')),
                        location=robot.get('location', 'unknown'),
                        cost_per_hour=robot.get('cost_per_hour', 50.0),
                        current_load=robot.get('current_workload', 0.0),
                        energy_efficiency=robot.get('energy_efficiency', 0.9)
                    )
                    agents.append(agent)

                self.integration_cache['robots'] = agents
                self.last_sync_time['robots'] = datetime.now(timezone.utc)
                logger.info(f"Synced {len(agents)} robot agents")
                return agents
        except Exception as e:
            logger.error(f"Failed to sync robot agents: {e}")

        return self.integration_cache.get('robots', [])

    async def sync_iot_agents(self) -> List[Agent]:
        """Sync IoT device agents from IoT service"""
        try:
            response = requests.get(f"{self.iot_service_url}/api/v1/devices", timeout=5)
            if response.status_code == 200:
                device_data = response.json()
                agents = []

                for device in device_data.get('devices', []):
                    # Convert IoT device to agent format
                    agent = Agent(
                        agent_id=f"iot_{device['device_id']}",
                        name=device.get('name', device['device_id']),
                        agent_type=AgentType.AI_SYSTEM,
                        capabilities=self._convert_iot_capabilities(device.get('capabilities', [])),
                        status=self._convert_device_status(device.get('status', 'online')),
                        location=device.get('location', 'edge'),
                        cost_per_hour=device.get('cost_per_hour', 10.0),
                        current_load=device.get('cpu_usage', 0.0) / 100.0,
                        energy_efficiency=0.95  # IoT devices are generally efficient
                    )
                    agents.append(agent)

                self.integration_cache['iot'] = agents
                self.last_sync_time['iot'] = datetime.now(timezone.utc)
                logger.info(f"Synced {len(agents)} IoT agents")
                return agents
        except Exception as e:
            logger.error(f"Failed to sync IoT agents: {e}")

        return self.integration_cache.get('iot', [])

    def _convert_robot_capabilities(self, robot_capabilities: Dict) -> Dict[str, float]:
        """Convert robot capabilities to agent capability format"""
        capabilities = {}

        # Movement capabilities
        if 'movement' in robot_capabilities:
            capabilities['precision_assembly'] = 0.9
            capabilities['material_handling'] = 0.95

        # Sensor capabilities
        if 'sensors' in robot_capabilities:
            sensors = robot_capabilities['sensors']
            if sensors.get('force_feedback'):
                capabilities['precision_assembly'] = 0.95
            if sensors.get('vision_system'):
                capabilities['quality_inspection'] = 0.9
            if sensors.get('collision_detection'):
                capabilities['safety_operations'] = 0.95

        # Specialized tools
        if 'specialized_tools' in robot_capabilities:
            tools = robot_capabilities['specialized_tools']
            if tools.get('gripper_types'):
                capabilities['material_handling'] = 0.9
            if tools.get('welding_capability'):
                capabilities['welding'] = 0.95
            if tools.get('painting_capability'):
                capabilities['painting'] = 0.9

        return capabilities

    def _convert_iot_capabilities(self, device_capabilities: List[str]) -> Dict[str, float]:
        """Convert IoT device capabilities to agent capability format"""
        capabilities = {}

        for capability in device_capabilities:
            if 'sensor' in capability.lower():
                capabilities['monitoring'] = 0.95
                capabilities['data_collection'] = 0.9
            elif 'processing' in capability.lower():
                capabilities['data_analysis'] = 0.85
                capabilities['pattern_recognition'] = 0.8
            elif 'communication' in capability.lower():
                capabilities['coordination'] = 0.9
            elif 'control' in capability.lower():
                capabilities['process_control'] = 0.85

        return capabilities

    def _convert_robot_status(self, robot_status: str) -> AgentStatus:
        """Convert robot status to agent status"""
        status_mapping = {
            'idle': AgentStatus.AVAILABLE,
            'running': AgentStatus.BUSY,
            'error': AgentStatus.OFFLINE,
            'maintenance': AgentStatus.MAINTENANCE,
            'emergency_stop': AgentStatus.OFFLINE
        }
        return status_mapping.get(robot_status, AgentStatus.OFFLINE)

    def _convert_device_status(self, device_status: str) -> AgentStatus:
        """Convert IoT device status to agent status"""
        status_mapping = {
            'online': AgentStatus.AVAILABLE,
            'busy': AgentStatus.BUSY,
            'offline': AgentStatus.OFFLINE,
            'maintenance': AgentStatus.MAINTENANCE
        }
        return status_mapping.get(device_status, AgentStatus.OFFLINE)

    async def send_task_to_robot(self, robot_id: str, task_data: Dict) -> bool:
        """Send task assignment to robot service"""
        try:
            response = requests.post(
                f"{self.robot_service_url}/api/v1/fleet/tasks",
                json={
                    'robot_id': robot_id,
                    'task_type': task_data.get('task_type', 'generic'),
                    'priority': task_data.get('priority', 'normal'),
                    'estimated_duration': task_data.get('estimated_duration', 60),
                    'commands': task_data.get('commands', [])
                },
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Failed to send task to robot {robot_id}: {e}")
            return False

    async def send_task_to_iot(self, device_id: str, task_data: Dict) -> bool:
        """Send task assignment to IoT service"""
        try:
            # Remove 'iot_' prefix if present
            clean_device_id = device_id.replace('iot_', '')

            response = requests.post(
                f"{self.iot_service_url}/api/v1/devices/{clean_device_id}/tasks",
                json={
                    'task_type': task_data.get('task_type', 'monitoring'),
                    'parameters': task_data.get('parameters', {}),
                    'duration': task_data.get('estimated_duration', 60)
                },
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Failed to send task to IoT device {device_id}: {e}")
            return False

# Advanced Analytics Engine
class AdvancedAnalyticsEngine:
    """Advanced analytics for performance tracking and optimization insights"""

    def __init__(self):
        self.performance_data = []
        self.ml_models = {}
        self.scaler = StandardScaler()
        self.prediction_cache = {}

    def record_performance_data(self, assignment: Assignment, completion_data: Dict):
        """Record performance data for analytics"""
        performance_record = {
            'assignment_id': assignment.assignment_id,
            'agent_id': assignment.agent_id,
            'agent_type': assignment.agent_type,
            'task_type': assignment.task_type,
            'task_priority': assignment.task_priority,
            'predicted_duration': assignment.estimated_completion_time.timestamp() - assignment.created_at.timestamp(),
            'actual_duration': completion_data.get('actual_duration', 0),
            'predicted_quality': assignment.quality_prediction,
            'actual_quality': completion_data.get('quality_score', 0),
            'cost_estimate': assignment.cost_estimate,
            'success': completion_data.get('success', False),
            'timestamp': datetime.now(timezone.utc).timestamp()
        }

        self.performance_data.append(performance_record)

        # Retrain models periodically
        if len(self.performance_data) % 50 == 0:
            self._retrain_models()

    def _retrain_models(self):
        """Retrain ML models with latest performance data"""
        if len(self.performance_data) < 20:
            return

        try:
            df = pd.DataFrame(self.performance_data)

            # Prepare features
            feature_columns = ['agent_type', 'task_type', 'task_priority', 'predicted_duration', 'cost_estimate']

            # Encode categorical variables
            df_encoded = pd.get_dummies(df[feature_columns])

            # Train duration prediction model
            if 'actual_duration' in df.columns:
                X = df_encoded
                y_duration = df['actual_duration']

                self.ml_models['duration_predictor'] = RandomForestRegressor(n_estimators=50, random_state=42)
                self.ml_models['duration_predictor'].fit(X, y_duration)

            # Train quality prediction model
            if 'actual_quality' in df.columns:
                y_quality = df['actual_quality']

                self.ml_models['quality_predictor'] = RandomForestRegressor(n_estimators=50, random_state=42)
                self.ml_models['quality_predictor'].fit(X, y_quality)

            logger.info("ML models retrained with latest performance data")

        except Exception as e:
            logger.error(f"Failed to retrain ML models: {e}")

    def predict_assignment_outcome(self, assignment: Assignment) -> Dict[str, float]:
        """Predict assignment outcome using ML models"""
        try:
            # Prepare features
            features = {
                'agent_type': assignment.agent_type,
                'task_type': assignment.task_type,
                'task_priority': assignment.task_priority,
                'predicted_duration': assignment.estimated_completion_time.timestamp() - assignment.created_at.timestamp(),
                'cost_estimate': assignment.cost_estimate
            }

            # Create feature vector (simplified)
            feature_vector = [
                hash(features['agent_type']) % 100,
                hash(features['task_type']) % 100,
                hash(features['task_priority']) % 100,
                features['predicted_duration'],
                features['cost_estimate']
            ]

            predictions = {}

            # Duration prediction
            if 'duration_predictor' in self.ml_models:
                duration_pred = self.ml_models['duration_predictor'].predict([feature_vector])[0]
                predictions['predicted_duration'] = max(duration_pred, 0)

            # Quality prediction
            if 'quality_predictor' in self.ml_models:
                quality_pred = self.ml_models['quality_predictor'].predict([feature_vector])[0]
                predictions['predicted_quality'] = max(min(quality_pred, 1.0), 0.0)

            return predictions

        except Exception as e:
            logger.error(f"Failed to predict assignment outcome: {e}")
            return {}

    def generate_optimization_insights(self) -> Dict[str, Any]:
        """Generate insights for optimization improvement"""
        if len(self.performance_data) < 10:
            return {"message": "Insufficient data for insights"}

        df = pd.DataFrame(self.performance_data)

        insights = {
            'total_assignments': len(df),
            'success_rate': df['success'].mean() if 'success' in df else 0,
            'average_duration_accuracy': 0,
            'average_quality_accuracy': 0,
            'best_performing_agents': {},
            'task_type_performance': {},
            'recommendations': []
        }

        # Duration accuracy
        if 'actual_duration' in df.columns and 'predicted_duration' in df.columns:
            duration_errors = abs(df['actual_duration'] - df['predicted_duration']) / df['predicted_duration']
            insights['average_duration_accuracy'] = 1.0 - duration_errors.mean()

        # Quality accuracy
        if 'actual_quality' in df.columns and 'predicted_quality' in df.columns:
            quality_errors = abs(df['actual_quality'] - df['predicted_quality'])
            insights['average_quality_accuracy'] = 1.0 - quality_errors.mean()

        # Best performing agents
        if 'success' in df.columns:
            agent_performance = df.groupby('agent_id')['success'].agg(['mean', 'count']).reset_index()
            agent_performance = agent_performance[agent_performance['count'] >= 3]  # Minimum assignments
            if not agent_performance.empty:
                best_agents = agent_performance.nlargest(5, 'mean')
                insights['best_performing_agents'] = best_agents.to_dict('records')

        # Task type performance
        if 'success' in df.columns:
            task_performance = df.groupby('task_type')['success'].agg(['mean', 'count']).reset_index()
            insights['task_type_performance'] = task_performance.to_dict('records')

        # Generate recommendations
        recommendations = []
        if insights['success_rate'] < 0.8:
            recommendations.append("Consider adjusting optimization weights to improve success rate")
        if insights['average_duration_accuracy'] < 0.7:
            recommendations.append("Duration predictions need improvement - consider more training data")
        if insights['average_quality_accuracy'] < 0.7:
            recommendations.append("Quality predictions need improvement - review capability assessments")

        insights['recommendations'] = recommendations

        return insights

# Main AI Decision Engine
class AIDecisionEngine:
    """Main AI Decision Engine integrating all three layers"""

    def __init__(self):
        # Layer 1: Capability Matching
        self.capability_matrix = CapabilityMatrix()

        # Layer 2: Multi-Objective Optimization
        self.optimization_engine = OptimizationCriteria()
        self.optimization_engine.capability_matrix = self.capability_matrix

        # Layer 3: Reinforcement Learning
        self.bandit_selector = AgentSelectionBandit()
        self.q_learning = TaskAllocationQLearning()

        # Advanced Features
        self.task_decomposer = ContextualTaskDecomposer()
        self.failure_prevention = PredictiveFailurePrevention()

        # Enterprise Features
        self.genetic_optimizer = GeneticAlgorithmOptimizer()
        self.simulation_engine = SimulationEngine()
        self.integration_service = SystemIntegrationService()
        self.analytics_engine = AdvancedAnalyticsEngine()

        # System State
        self.agents: Dict[str, Agent] = {}
        self.tasks: Dict[str, Task] = {}
        self.assignments: Dict[str, Assignment] = {}
        self.assignment_history: List[Assignment] = []
        self.active_websockets: List[WebSocket] = []

        # Performance tracking
        self.performance_metrics = {
            'total_assignments': 0,
            'successful_assignments': 0,
            'average_completion_time': 0.0,
            'average_quality_score': 0.0,
            'cost_efficiency': 0.0,
            'ml_prediction_accuracy': 0.0,
            'system_integration_status': 'active'
        }

    async def register_agent(self, agent: Agent) -> bool:
        """Register a new agent with the system"""
        try:
            self.agents[agent.agent_id] = agent
            logger.info(f"Registered agent: {agent.agent_id} ({agent.agent_type.value})")
            await self.broadcast_agent_update(agent)
            return True
        except Exception as e:
            logger.error(f"Failed to register agent {agent.agent_id}: {e}")
            return False

    async def submit_task(self, task: Task) -> str:
        """Submit a new task for assignment"""
        try:
            # Check if task needs decomposition
            if task.complexity > 0.7:
                subtasks = self.task_decomposer.decompose_complex_task(task, list(self.agents.values()))

                if len(subtasks) > 1:
                    # Store subtasks
                    for subtask in subtasks:
                        self.tasks[subtask.task_id] = subtask

                    logger.info(f"Decomposed task {task.task_id} into {len(subtasks)} subtasks")
                    return f"Task decomposed into {len(subtasks)} subtasks"

            # Store original task
            self.tasks[task.task_id] = task

            # Attempt immediate assignment
            assignment = await self.assign_task(task)

            if assignment:
                return f"Task assigned to agent {assignment.agent_id}"
            else:
                return "Task queued - no suitable agent available"

        except Exception as e:
            logger.error(f"Failed to submit task {task.task_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def assign_task(self, task: Task) -> Optional[Assignment]:
        """Assign task to optimal agent using multi-layer intelligence"""
        available_agents = [
            agent for agent in self.agents.values()
            if agent.status == AgentStatus.AVAILABLE and agent.current_load < 0.9
        ]

        if not available_agents:
            return None

        # Layer 1: Filter agents by capability
        capable_agents = []
        for agent in available_agents:
            capability = self.capability_matrix.assess_real_time_capability(agent, task)
            if capability >= 0.3:  # Minimum capability threshold
                capable_agents.append(agent)

        if not capable_agents:
            return None

        # Layer 2: Multi-objective optimization
        optimization_assignment = self.optimization_engine.optimize_assignment(task, capable_agents)

        # Layer 3: Reinforcement learning selection
        current_state = self.q_learning.get_state_representation(
            list(self.agents.values()),
            list(self.tasks.values()),
            datetime.now(timezone.utc)
        )

        # Combine optimization and learning
        if optimization_assignment and random.random() > self.q_learning.epsilon:
            # Use optimization result
            selected_assignment = optimization_assignment
        else:
            # Use bandit selection for exploration
            selected_agent = self.bandit_selector.select_agent_ucb(task, capable_agents)
            selected_assignment = self.optimization_engine.optimize_assignment(task, [selected_agent])

        if not selected_assignment:
            return None

        # Apply failure prevention
        assignments_to_check = [selected_assignment]
        adjusted_assignments = self.failure_prevention.adjust_assignment_for_failure_risk(
            assignments_to_check, capable_agents, [task]
        )

        if adjusted_assignments:
            final_assignment = adjusted_assignments[0]

            # Update agent status
            assigned_agent = self.agents[final_assignment.agent_id]
            assigned_agent.status = AgentStatus.BUSY
            assigned_agent.current_load = min(assigned_agent.current_load + 0.3, 1.0)

            # Store assignment
            self.assignments[final_assignment.assignment_id] = final_assignment
            self.assignment_history.append(final_assignment)

            # Update performance metrics
            self.performance_metrics['total_assignments'] += 1

            # Broadcast update
            await self.broadcast_assignment_update(final_assignment)

            logger.info(f"Assigned task {task.task_id} to agent {final_assignment.agent_id}")
            return final_assignment

        return None

    async def complete_assignment(self, assignment_id: str, success: bool, quality_score: float = 0.0, actual_duration: int = 0):
        """Mark assignment as complete and update learning systems"""
        if assignment_id not in self.assignments:
            raise HTTPException(status_code=404, detail="Assignment not found")

        assignment = self.assignments[assignment_id]
        agent = self.agents[assignment.agent_id]
        task = self.tasks[assignment.task_id]

        # Update agent status
        agent.status = AgentStatus.AVAILABLE
        agent.current_load = max(agent.current_load - 0.3, 0.0)

        # Update performance history
        task_type = task.task_type
        self.capability_matrix.performance_history[agent.agent_id][task_type.value].append(quality_score)

        # Update bandit learning
        self.bandit_selector.update_performance(agent.agent_id, task_type, success)

        # Calculate reward for Q-learning
        reward = self.calculate_reward(assignment, success, quality_score, actual_duration)

        # Update Q-learning
        current_state = self.q_learning.get_state_representation(
            list(self.agents.values()),
            list(self.tasks.values()),
            datetime.now(timezone.utc)
        )

        action = f"assign_{agent.agent_id}_{task_type.value}"
        self.q_learning.update_q_values(current_state, action, reward, current_state)

        # Update performance metrics
        if success:
            self.performance_metrics['successful_assignments'] += 1

        # Update averages
        total = self.performance_metrics['total_assignments']
        if total > 0:
            self.performance_metrics['average_quality_score'] = (
                (self.performance_metrics['average_quality_score'] * (total - 1) + quality_score) / total
            )

            if actual_duration > 0:
                self.performance_metrics['average_completion_time'] = (
                    (self.performance_metrics['average_completion_time'] * (total - 1) + actual_duration) / total
                )

        # Clean up completed assignment
        del self.assignments[assignment_id]

        # Broadcast update
        await self.broadcast_agent_update(agent)

        logger.info(f"Completed assignment {assignment_id} - Success: {success}, Quality: {quality_score}")

    def calculate_reward(self, assignment: Assignment, success: bool, quality_score: float, actual_duration: int) -> float:
        """Calculate reward for reinforcement learning"""
        if not success:
            return -1.0  # Penalty for failure

        # Base reward for success
        reward = 1.0

        # Quality bonus/penalty
        quality_bonus = (quality_score - 0.5) * 2.0  # -1.0 to 1.0
        reward += quality_bonus * 0.5

        # Time efficiency bonus/penalty
        if actual_duration > 0:
            time_efficiency = assignment.estimated_completion_time / max(actual_duration, 1)
            time_bonus = (time_efficiency - 1.0) * 0.5  # Bonus for faster completion
            reward += time_bonus * 0.3

        # Safety bonus
        safety_bonus = (assignment.safety_score - 0.5) * 0.2
        reward += safety_bonus

        return max(-2.0, min(2.0, reward))  # Clamp reward between -2 and 2

    async def broadcast_agent_update(self, agent: Agent):
        """Broadcast agent status update to connected clients"""
        if not self.active_websockets:
            return

        update_message = {
            "type": "agent_update",
            "agent": asdict(agent),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        await self.broadcast_message(update_message)

    async def broadcast_assignment_update(self, assignment: Assignment):
        """Broadcast assignment update to connected clients"""
        if not self.active_websockets:
            return

        update_message = {
            "type": "assignment_update",
            "assignment": asdict(assignment),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        await self.broadcast_message(update_message)

    async def broadcast_message(self, message: dict):
        """Broadcast message to all connected WebSocket clients"""
        disconnected_clients = []

        for websocket in self.active_websockets:
            try:
                await websocket.send_json(message)
            except:
                disconnected_clients.append(websocket)

        # Remove disconnected clients
        for client in disconnected_clients:
            self.active_websockets.remove(client)

    def get_performance_stats(self) -> dict:
        """Get comprehensive performance statistics"""
        total_assignments = self.performance_metrics['total_assignments']
        success_rate = 0.0

        if total_assignments > 0:
            success_rate = (self.performance_metrics['successful_assignments'] / total_assignments) * 100

        return {
            **self.performance_metrics,
            'success_rate': success_rate,
            'active_agents': len([a for a in self.agents.values() if a.status == AgentStatus.AVAILABLE]),
            'busy_agents': len([a for a in self.agents.values() if a.status == AgentStatus.BUSY]),
            'pending_assignments': len(self.assignments),
            'q_table_size': len(self.q_learning.q_table),
            'bandit_exploration_rate': self.bandit_selector.exploration_factor
        }

# Global AI Decision Engine instance
ai_engine = AIDecisionEngine()

# API Models for requests/responses
class AgentRegistration(BaseModel):
    agent_id: str
    name: str
    agent_type: AgentType
    capabilities: Dict[str, float]
    cost_per_hour: float = 0.0
    location: str = "default"

class TaskSubmission(BaseModel):
    task_id: str
    task_type: TaskType
    priority: TaskPriority
    complexity: float = Field(..., ge=0.0, le=1.0)
    estimated_duration: int = Field(..., gt=0)
    quality_requirements: float = Field(default=0.5, ge=0.0, le=1.0)
    safety_requirements: float = Field(default=0.5, ge=0.0, le=1.0)
    deadline: Optional[datetime] = None
    location: str = "default"
    parameters: Optional[Dict[str, Any]] = None

class AssignmentCompletion(BaseModel):
    success: bool
    quality_score: float = Field(..., ge=0.0, le=1.0)
    actual_duration: int = Field(..., gt=0)

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "AI Decision Engine - Agent Selection Service",
        "version": "1.0.0",
        "description": "Advanced multi-layer intelligence system for optimal task allocation",
        "layers": [
            "Capability Matching Engine",
            "Multi-Objective Optimization Engine",
            "Reinforcement Learning Optimization"
        ],
        "registered_agents": len(ai_engine.agents),
        "total_assignments": ai_engine.performance_metrics['total_assignments']
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-decision-engine",
        "active_agents": len(ai_engine.agents),
        "pending_assignments": len(ai_engine.assignments)
    }

# Agent Management Endpoints
@app.post("/api/v1/agents/register")
async def register_agent(agent_data: AgentRegistration):
    """Register a new agent with the AI Decision Engine"""
    agent = Agent(
        agent_id=agent_data.agent_id,
        name=agent_data.name,
        agent_type=agent_data.agent_type,
        status=AgentStatus.AVAILABLE,
        capabilities=agent_data.capabilities,
        cost_per_hour=agent_data.cost_per_hour,
        location=agent_data.location,
        last_performance={}
    )

    success = await ai_engine.register_agent(agent)

    if success:
        return {
            "success": True,
            "message": f"Agent {agent_data.agent_id} registered successfully",
            "agent": asdict(agent)
        }
    else:
        raise HTTPException(status_code=400, detail="Failed to register agent")

@app.get("/api/v1/agents")
async def list_agents():
    """List all registered agents"""
    agents = [asdict(agent) for agent in ai_engine.agents.values()]
    return {
        "agents": agents,
        "total_count": len(agents),
        "available_count": len([a for a in ai_engine.agents.values() if a.status == AgentStatus.AVAILABLE])
    }

@app.get("/api/v1/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get detailed information about a specific agent"""
    if agent_id not in ai_engine.agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent = ai_engine.agents[agent_id]

    # Get performance history
    performance_history = ai_engine.capability_matrix.performance_history[agent_id]

    # Get recent assignments
    recent_assignments = [
        asdict(assignment) for assignment in ai_engine.assignment_history[-10:]
        if assignment.agent_id == agent_id
    ]

    return {
        "agent": asdict(agent),
        "performance_history": dict(performance_history),
        "recent_assignments": recent_assignments
    }

@app.put("/api/v1/agents/{agent_id}/status")
async def update_agent_status(agent_id: str, status: AgentStatus):
    """Update agent status"""
    if agent_id not in ai_engine.agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent = ai_engine.agents[agent_id]
    agent.status = status

    await ai_engine.broadcast_agent_update(agent)

    return {
        "success": True,
        "agent_id": agent_id,
        "new_status": status.value
    }

# Task Management Endpoints
@app.post("/api/v1/tasks/submit")
async def submit_task(task_data: TaskSubmission):
    """Submit a new task for intelligent assignment"""
    task = Task(
        task_id=task_data.task_id,
        task_type=task_data.task_type,
        priority=task_data.priority,
        complexity=task_data.complexity,
        estimated_duration=task_data.estimated_duration,
        quality_requirements=task_data.quality_requirements,
        safety_requirements=task_data.safety_requirements,
        deadline=task_data.deadline,
        location=task_data.location,
        parameters=task_data.parameters or {}
    )

    result = await ai_engine.submit_task(task)

    return {
        "success": True,
        "task_id": task_data.task_id,
        "result": result
    }

@app.get("/api/v1/tasks")
async def list_tasks():
    """List all tasks in the system"""
    tasks = [asdict(task) for task in ai_engine.tasks.values()]
    return {
        "tasks": tasks,
        "total_count": len(tasks)
    }

@app.get("/api/v1/tasks/{task_id}")
async def get_task(task_id: str):
    """Get detailed information about a specific task"""
    if task_id not in ai_engine.tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    task = ai_engine.tasks[task_id]

    # Find assignment if exists
    assignment = None
    for assign in ai_engine.assignments.values():
        if assign.task_id == task_id:
            assignment = asdict(assign)
            break

    return {
        "task": asdict(task),
        "assignment": assignment
    }

# Assignment Management Endpoints
@app.get("/api/v1/assignments")
async def list_assignments():
    """List all active assignments"""
    assignments = [asdict(assignment) for assignment in ai_engine.assignments.values()]
    return {
        "assignments": assignments,
        "total_count": len(assignments)
    }

@app.post("/api/v1/assignments/{assignment_id}/complete")
async def complete_assignment(assignment_id: str, completion_data: AssignmentCompletion):
    """Mark assignment as complete and update learning systems"""
    await ai_engine.complete_assignment(
        assignment_id=assignment_id,
        success=completion_data.success,
        quality_score=completion_data.quality_score,
        actual_duration=completion_data.actual_duration
    )

    return {
        "success": True,
        "assignment_id": assignment_id,
        "message": "Assignment completed and learning systems updated"
    }

@app.get("/api/v1/assignments/history")
async def get_assignment_history(limit: int = 100):
    """Get assignment history"""
    history = ai_engine.assignment_history[-limit:] if ai_engine.assignment_history else []

    return {
        "assignments": [asdict(assignment) for assignment in history],
        "total_count": len(ai_engine.assignment_history)
    }

# Performance and Analytics Endpoints
@app.get("/api/v1/performance/stats")
async def get_performance_stats():
    """Get comprehensive performance statistics"""
    return ai_engine.get_performance_stats()

@app.get("/api/v1/optimization/config")
async def get_optimization_config():
    """Get current optimization configuration"""
    return {
        "objectives": ai_engine.optimization_engine.objectives,
        "q_learning_params": {
            "learning_rate": ai_engine.q_learning.learning_rate,
            "discount_factor": ai_engine.q_learning.discount_factor,
            "epsilon": ai_engine.q_learning.epsilon
        },
        "bandit_params": {
            "exploration_factor": ai_engine.bandit_selector.exploration_factor
        }
    }

@app.put("/api/v1/optimization/config")
async def update_optimization_config(config: dict):
    """Update optimization configuration"""
    if "objectives" in config:
        ai_engine.optimization_engine.objectives.update(config["objectives"])

    if "q_learning_params" in config:
        params = config["q_learning_params"]
        if "learning_rate" in params:
            ai_engine.q_learning.learning_rate = params["learning_rate"]
        if "discount_factor" in params:
            ai_engine.q_learning.discount_factor = params["discount_factor"]
        if "epsilon" in params:
            ai_engine.q_learning.epsilon = params["epsilon"]

    if "bandit_params" in config:
        params = config["bandit_params"]
        if "exploration_factor" in params:
            ai_engine.bandit_selector.exploration_factor = params["exploration_factor"]

    return {
        "success": True,
        "message": "Optimization configuration updated"
    }

# Capability Analysis Endpoints
@app.get("/api/v1/capabilities/matrix")
async def get_capability_matrix():
    """Get the current capability matrix"""
    return {
        "base_capabilities": ai_engine.capability_matrix.base_capabilities,
        "performance_history": dict(ai_engine.capability_matrix.performance_history)
    }

@app.post("/api/v1/capabilities/assess")
async def assess_capability(agent_id: str, task_data: TaskSubmission):
    """Assess agent capability for a specific task"""
    if agent_id not in ai_engine.agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent = ai_engine.agents[agent_id]
    task = Task(
        task_id=task_data.task_id,
        task_type=task_data.task_type,
        priority=task_data.priority,
        complexity=task_data.complexity,
        estimated_duration=task_data.estimated_duration,
        quality_requirements=task_data.quality_requirements,
        safety_requirements=task_data.safety_requirements
    )

    capability_score = ai_engine.capability_matrix.assess_real_time_capability(agent, task)

    return {
        "agent_id": agent_id,
        "task_type": task_data.task_type.value,
        "capability_score": capability_score,
        "assessment_factors": {
            "base_capability": ai_engine.capability_matrix.get_base_capability(agent, task.task_type),
            "fatigue_factor": ai_engine.capability_matrix.calculate_fatigue_factor(agent),
            "load_factor": ai_engine.capability_matrix.calculate_load_factor(agent),
            "complexity_adjustment": ai_engine.capability_matrix.calculate_complexity_adjustment(agent, task)
        }
    }

# WebSocket endpoint for real-time updates
@app.websocket("/ws/agents")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time AI Decision Engine updates"""
    await websocket.accept()
    ai_engine.active_websockets.append(websocket)

    try:
        # Send initial status
        initial_status = {
            "type": "initial_status",
            "agents": [asdict(agent) for agent in ai_engine.agents.values()],
            "assignments": [asdict(assignment) for assignment in ai_engine.assignments.values()],
            "performance_stats": ai_engine.get_performance_stats(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await websocket.send_json(initial_status)

        # Keep connection alive
        while True:
            # Send periodic performance updates
            performance_update = {
                "type": "performance_update",
                "stats": ai_engine.get_performance_stats(),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await websocket.send_json(performance_update)
            await asyncio.sleep(10)  # Send updates every 10 seconds

    except WebSocketDisconnect:
        ai_engine.active_websockets.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in ai_engine.active_websockets:
            ai_engine.active_websockets.remove(websocket)

# Enterprise Features API Endpoints

@app.post("/api/v1/optimization/genetic")
async def run_genetic_optimization(tasks: List[TaskSubmission], max_generations: int = 50):
    """Run genetic algorithm optimization for complex multi-task scenarios"""
    try:
        # Convert task submissions to Task objects
        task_objects = []
        for task_data in tasks:
            # Create basic requirements based on task type and quality/safety requirements
            requirements = [
                TaskRequirement(
                    requirement_type=task_data.task_type.value,
                    minimum_proficiency=task_data.quality_requirements,
                    weight=1.0
                )
            ]

            task = Task(
                task_id=task_data.task_id,
                task_type=task_data.task_type,
                priority=task_data.priority,
                requirements=requirements,
                estimated_duration=task_data.estimated_duration,
                deadline=task_data.deadline,
                complexity=task_data.complexity,
                location=task_data.location
            )
            task_objects.append(task)

        # Get available agents
        available_agents = [agent for agent in ai_engine.agents.values()
                          if agent.status == AgentStatus.AVAILABLE]

        if not available_agents:
            raise HTTPException(status_code=400, detail="No available agents for optimization")

        # Configure genetic algorithm
        ai_engine.genetic_optimizer.generations = max_generations

        # Run optimization
        optimal_assignments = ai_engine.genetic_optimizer.optimize_assignments(
            task_objects, available_agents, ai_engine.optimization_engine
        )

        return {
            "success": True,
            "optimization_method": "genetic_algorithm",
            "generations_run": max_generations,
            "optimal_assignments": optimal_assignments,
            "fitness_history": ai_engine.genetic_optimizer.fitness_history[-10:],  # Last 10 generations
            "total_tasks": len(task_objects),
            "total_agents": len(available_agents)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Genetic optimization failed: {str(e)}")

@app.post("/api/v1/simulation/run")
async def run_simulation(
    scenario_type: str = "normal",
    custom_params: Optional[Dict] = None,
    include_current_tasks: bool = True
):
    """Run simulation for what-if analysis"""
    try:
        # Get base tasks and agents
        base_tasks = list(ai_engine.tasks.values()) if include_current_tasks else []
        base_agents = list(ai_engine.agents.values())

        if not base_agents:
            raise HTTPException(status_code=400, detail="No agents available for simulation")

        # Run simulation
        simulation_result = ai_engine.simulation_engine.run_simulation(
            base_tasks, base_agents, ai_engine, scenario_type, custom_params
        )

        return {
            "success": True,
            "simulation_result": simulation_result,
            "available_scenarios": list(ai_engine.simulation_engine.scenario_templates.keys())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.get("/api/v1/simulation/history")
async def get_simulation_history(limit: int = 10):
    """Get simulation history"""
    history = ai_engine.simulation_engine.simulation_history[-limit:]
    return {
        "simulations": history,
        "total_simulations": len(ai_engine.simulation_engine.simulation_history)
    }

@app.post("/api/v1/integration/sync")
async def sync_external_systems():
    """Sync agents from external robot and IoT systems"""
    try:
        # Sync robot agents
        robot_agents = await ai_engine.integration_service.sync_robot_agents()

        # Sync IoT agents
        iot_agents = await ai_engine.integration_service.sync_iot_agents()

        # Register synced agents
        total_synced = 0
        for agent in robot_agents + iot_agents:
            if await ai_engine.register_agent(agent):
                total_synced += 1

        return {
            "success": True,
            "robot_agents_synced": len(robot_agents),
            "iot_agents_synced": len(iot_agents),
            "total_agents_registered": total_synced,
            "last_sync_times": ai_engine.integration_service.last_sync_time
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"System sync failed: {str(e)}")

@app.get("/api/v1/integration/status")
async def get_integration_status():
    """Get integration status with external systems"""
    return {
        "robot_service_url": ai_engine.integration_service.robot_service_url,
        "iot_service_url": ai_engine.integration_service.iot_service_url,
        "last_sync_times": ai_engine.integration_service.last_sync_time,
        "cached_agents": {
            "robots": len(ai_engine.integration_service.integration_cache.get('robots', [])),
            "iot": len(ai_engine.integration_service.integration_cache.get('iot', []))
        }
    }

@app.get("/api/v1/analytics/insights")
async def get_optimization_insights():
    """Get advanced analytics insights for optimization improvement"""
    try:
        insights = ai_engine.analytics_engine.generate_optimization_insights()
        return {
            "success": True,
            "insights": insights,
            "ml_models_available": list(ai_engine.analytics_engine.ml_models.keys()),
            "total_performance_records": len(ai_engine.analytics_engine.performance_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")

@app.post("/api/v1/analytics/predict")
async def predict_assignment_outcome(assignment_data: dict):
    """Predict assignment outcome using ML models"""
    try:
        # Create assignment object for prediction
        assignment = Assignment(
            assignment_id=assignment_data.get('assignment_id', str(uuid.uuid4())),
            task_id=assignment_data['task_id'],
            agent_id=assignment_data['agent_id'],
            agent_type=assignment_data.get('agent_type', 'unknown'),
            task_type=assignment_data.get('task_type', 'unknown'),
            task_priority=assignment_data.get('task_priority', 'standard'),
            confidence_score=assignment_data.get('confidence_score', 0.5),
            estimated_completion_time=datetime.now(timezone.utc) + timedelta(minutes=assignment_data.get('estimated_duration', 60)),
            quality_prediction=assignment_data.get('quality_prediction', 0.8),
            cost_estimate=assignment_data.get('cost_estimate', 100.0),
            safety_score=assignment_data.get('safety_score', 0.9),
            energy_efficiency=assignment_data.get('energy_efficiency', 0.8),
            created_at=datetime.now(timezone.utc)
        )

        predictions = ai_engine.analytics_engine.predict_assignment_outcome(assignment)

        return {
            "success": True,
            "predictions": predictions,
            "assignment_id": assignment.assignment_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/v1/dashboard/summary")
async def get_dashboard_summary():
    """Get comprehensive dashboard summary for enterprise monitoring"""
    try:
        # System overview
        total_agents = len(ai_engine.agents)
        available_agents = len([a for a in ai_engine.agents.values() if a.status == AgentStatus.AVAILABLE])
        active_assignments = len(ai_engine.assignments)

        # Performance metrics
        performance_stats = ai_engine.get_performance_stats()

        # Recent activity
        recent_assignments = ai_engine.assignment_history[-10:] if ai_engine.assignment_history else []

        # Integration status
        integration_status = {
            "robot_agents": len(ai_engine.integration_service.integration_cache.get('robots', [])),
            "iot_agents": len(ai_engine.integration_service.integration_cache.get('iot', [])),
            "last_sync": ai_engine.integration_service.last_sync_time
        }

        # Analytics insights
        insights = ai_engine.analytics_engine.generate_optimization_insights()

        return {
            "system_overview": {
                "total_agents": total_agents,
                "available_agents": available_agents,
                "active_assignments": active_assignments,
                "system_status": "operational"
            },
            "performance_metrics": performance_stats,
            "recent_assignments": [asdict(a) for a in recent_assignments],
            "integration_status": integration_status,
            "optimization_insights": insights,
            "ml_models_status": {
                "available_models": list(ai_engine.analytics_engine.ml_models.keys()),
                "training_data_points": len(ai_engine.analytics_engine.performance_data)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard summary failed: {str(e)}")

# Startup event to register demo agents
@app.on_event("startup")
async def startup_event():
    """Initialize AI Decision Engine with demo agents"""
    logger.info("AI Decision Engine starting up...")

    # Register demo agents for testing
    demo_agents = [
        Agent(
            agent_id="robot_001",
            name="Precision Assembly Robot",
            agent_type=AgentType.ROBOT,
            status=AgentStatus.AVAILABLE,
            capabilities={
                TaskType.PRECISION_ASSEMBLY.value: 0.95,
                TaskType.REPETITIVE_TASKS.value: 0.98,
                TaskType.QUALITY_INSPECTION.value: 0.85
            },
            cost_per_hour=50.0,
            location="factory_floor_1",
            safety_rating=0.95,
            energy_efficiency=0.90
        ),
        Agent(
            agent_id="human_001",
            name="Senior Technician",
            agent_type=AgentType.HUMAN,
            status=AgentStatus.AVAILABLE,
            capabilities={
                TaskType.CREATIVE_PROBLEM_SOLVING.value: 0.95,
                TaskType.QUALITY_INSPECTION.value: 0.90,
                TaskType.PRECISION_ASSEMBLY.value: 0.70
            },
            cost_per_hour=75.0,
            location="factory_floor_1",
            safety_rating=0.85,
            energy_efficiency=0.70
        ),
        Agent(
            agent_id="ai_system_001",
            name="Data Analysis AI",
            agent_type=AgentType.AI_SYSTEM,
            status=AgentStatus.AVAILABLE,
            capabilities={
                TaskType.DATA_ANALYSIS.value: 0.95,
                TaskType.PATTERN_RECOGNITION.value: 0.90,
                TaskType.OPTIMIZATION.value: 0.85
            },
            cost_per_hour=25.0,
            location="cloud",
            safety_rating=0.99,
            energy_efficiency=0.95
        )
    ]

    for agent in demo_agents:
        await ai_engine.register_agent(agent)
        logger.info(f"Registered demo agent: {agent.agent_id}")

    logger.info(f"AI Decision Engine initialized with {len(ai_engine.agents)} agents")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
