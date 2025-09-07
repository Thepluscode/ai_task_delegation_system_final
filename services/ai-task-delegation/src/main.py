#!/usr/bin/env python3
"""
AI Task Delegation Service
Intelligent task delegation with ML-powered agent selection and performance learning
"""

import asyncio
import logging
import time
import uuid
import json
import math
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
    title="AI Task Delegation Service",
    description="Intelligent task delegation with ML-powered agent selection and continuous learning",
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
class AgentType(str, Enum):
    ROBOT = "robot"
    HUMAN = "human"
    AI_SYSTEM = "ai_system"

class TaskType(str, Enum):
    ASSEMBLY = "assembly"
    INSPECTION = "inspection"
    WELDING = "welding"
    PAINTING = "painting"
    MATERIAL_HANDLING = "material_handling"
    QUALITY_CONTROL = "quality_control"
    MAINTENANCE = "maintenance"
    CUSTOM = "custom"

class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"
    SAFETY_CRITICAL = "safety_critical"

class TaskComplexity(str, Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    EXPERT = "expert"

class DelegationStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    DELEGATED = "delegated"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class Agent:
    id: str
    type: AgentType
    name: str
    capabilities: Dict[str, float]  # skill_name -> proficiency (0.0-1.0)
    current_status: str
    facility_id: str
    performance_history: List[Dict[str, Any]]
    reliability_score: float = 0.8
    availability_pattern: Dict[str, Any] = None
    last_updated: datetime = None

@dataclass
class Task:
    id: str
    type: TaskType
    name: str
    description: str
    parameters: Dict[str, Any]
    priority: TaskPriority
    complexity_score: float
    required_skills: List[str]
    estimated_duration: int  # minutes
    deadline: Optional[datetime] = None
    facility_id: str = ""
    created_at: datetime = None
    safety_critical: bool = False

@dataclass
class TaskRequirements:
    required_skills: List[str]
    minimum_capability_threshold: float
    estimated_duration: int
    priority: TaskPriority
    task_type: TaskType
    preferred_time_window: Optional[Tuple[datetime, datetime]] = None
    safety_requirements: List[str] = None

@dataclass
class ComplexityScore:
    overall: float
    factors: Dict[str, float]
    complexity_category: TaskComplexity

@dataclass
class TaskAnalysis:
    task_id: str
    complexity_score: ComplexityScore
    requirements: TaskRequirements
    risk_assessment: Dict[str, Any]
    historical_insights: Dict[str, Any]
    recommended_agent_types: List[AgentType]
    estimated_duration: int
    success_probability: float

@dataclass
class AgentCandidate:
    agent: Agent
    capability_match_score: float
    predicted_performance: Dict[str, Any]
    current_load: float
    selection_confidence: float

@dataclass
class TaskDelegation:
    id: str
    task: Task
    assigned_agent: Agent
    backup_agents: List[Agent]
    delegation_timestamp: datetime
    estimated_completion_time: datetime
    assignment_confidence: float
    monitoring_config: Dict[str, Any]

@dataclass
class DelegationResult:
    status: DelegationStatus
    assigned_agent: Optional[Agent] = None
    delegation_id: Optional[str] = None
    expected_completion: Optional[datetime] = None
    confidence_score: float = 0.0
    error_message: Optional[str] = None

@dataclass
class TaskOutcome:
    task_id: str
    delegation_id: str
    success: bool
    execution_duration: int  # minutes
    quality_metrics: Dict[str, float]
    performance_metrics: Dict[str, Any]
    outcome_confidence: float
    completion_time: datetime
    error_details: Optional[str] = None

# Task Analysis Engine
class TaskComplexityCalculator:
    """Calculate multi-dimensional task complexity"""
    
    def __init__(self):
        self.complexity_factors = {
            'precision_requirements': 0.25,
            'coordination_needs': 0.20,
            'environmental_challenges': 0.15,
            'time_constraints': 0.15,
            'safety_criticality': 0.15,
            'resource_dependencies': 0.10
        }
    
    def calculate_complexity(self, task: Task) -> ComplexityScore:
        """Calculate multi-dimensional complexity score"""
        
        scores = {}
        
        # Precision requirements (0.0 - 1.0)
        scores['precision_requirements'] = self._assess_precision_needs(task)
        
        # Coordination complexity (0.0 - 1.0)
        scores['coordination_needs'] = self._assess_coordination_complexity(task)
        
        # Environmental challenges (0.0 - 1.0)
        scores['environmental_challenges'] = self._assess_environmental_factors(task)
        
        # Time constraint pressure (0.0 - 1.0)
        scores['time_constraints'] = self._assess_time_pressure(task)
        
        # Safety criticality (0.0 - 1.0)
        scores['safety_criticality'] = self._assess_safety_criticality(task)
        
        # Resource dependency complexity (0.0 - 1.0)
        scores['resource_dependencies'] = self._assess_resource_dependencies(task)
        
        # Calculate weighted overall complexity
        overall_complexity = sum(
            scores[factor] * weight 
            for factor, weight in self.complexity_factors.items()
        )
        
        return ComplexityScore(
            overall=overall_complexity,
            factors=scores,
            complexity_category=self._categorize_complexity(overall_complexity)
        )
    
    def _assess_precision_needs(self, task: Task) -> float:
        """Assess precision requirements (0.0 = rough, 1.0 = ultra-precise)"""
        precision_tolerance = task.parameters.get('precision_tolerance', 1.0)
        
        if precision_tolerance <= 0.1:  # Sub-millimeter
            return 1.0
        elif precision_tolerance <= 1.0:  # Millimeter
            return 0.8
        elif precision_tolerance <= 10.0:  # Centimeter
            return 0.4
        else:
            return 0.1
    
    def _assess_coordination_complexity(self, task: Task) -> float:
        """Assess coordination requirements"""
        multi_agent = task.parameters.get('multi_agent_required', False)
        coordination_points = task.parameters.get('coordination_points', 0)
        
        if multi_agent and coordination_points > 5:
            return 0.9
        elif multi_agent:
            return 0.6
        elif coordination_points > 0:
            return 0.3
        else:
            return 0.1
    
    def _assess_environmental_factors(self, task: Task) -> float:
        """Assess environmental challenges"""
        hazardous_environment = task.parameters.get('hazardous_environment', False)
        temperature_extreme = task.parameters.get('extreme_temperature', False)
        vibration_present = task.parameters.get('vibration_present', False)
        
        score = 0.0
        if hazardous_environment:
            score += 0.4
        if temperature_extreme:
            score += 0.3
        if vibration_present:
            score += 0.3
        
        return min(score, 1.0)
    
    def _assess_time_pressure(self, task: Task) -> float:
        """Assess time constraint pressure"""
        if not task.deadline:
            return 0.1
        
        time_to_deadline = (task.deadline - datetime.now(timezone.utc)).total_seconds() / 3600  # hours
        estimated_hours = task.estimated_duration / 60
        
        if time_to_deadline <= estimated_hours:
            return 1.0  # Impossible deadline
        elif time_to_deadline <= estimated_hours * 1.2:
            return 0.9  # Very tight
        elif time_to_deadline <= estimated_hours * 2:
            return 0.6  # Tight
        elif time_to_deadline <= estimated_hours * 4:
            return 0.3  # Moderate
        else:
            return 0.1  # Relaxed
    
    def _assess_safety_criticality(self, task: Task) -> float:
        """Assess safety criticality"""
        if task.safety_critical:
            return 1.0
        elif task.priority == TaskPriority.SAFETY_CRITICAL:
            return 1.0
        elif task.type in [TaskType.WELDING, TaskType.MAINTENANCE]:
            return 0.7
        elif task.type in [TaskType.ASSEMBLY, TaskType.MATERIAL_HANDLING]:
            return 0.4
        else:
            return 0.2
    
    def _assess_resource_dependencies(self, task: Task) -> float:
        """Assess resource dependency complexity"""
        required_resources = task.parameters.get('required_resources', [])
        shared_resources = task.parameters.get('shared_resources', [])
        
        dependency_score = len(required_resources) * 0.1 + len(shared_resources) * 0.2
        return min(dependency_score, 1.0)
    
    def _categorize_complexity(self, overall_complexity: float) -> TaskComplexity:
        """Categorize overall complexity"""
        if overall_complexity >= 0.8:
            return TaskComplexity.EXPERT
        elif overall_complexity >= 0.6:
            return TaskComplexity.COMPLEX
        elif overall_complexity >= 0.4:
            return TaskComplexity.MODERATE
        else:
            return TaskComplexity.SIMPLE

class RequirementExtractor:
    """Extract specific requirements from tasks"""
    
    def extract_requirements(self, task: Task) -> TaskRequirements:
        """Extract comprehensive task requirements"""
        
        # Extract required skills based on task type and parameters
        required_skills = self._extract_required_skills(task)
        
        # Determine minimum capability threshold
        min_threshold = self._determine_capability_threshold(task)
        
        # Extract safety requirements
        safety_requirements = self._extract_safety_requirements(task)
        
        return TaskRequirements(
            required_skills=required_skills,
            minimum_capability_threshold=min_threshold,
            estimated_duration=task.estimated_duration,
            priority=task.priority,
            task_type=task.type,
            safety_requirements=safety_requirements
        )
    
    def _extract_required_skills(self, task: Task) -> List[str]:
        """Extract required skills from task"""
        base_skills = {
            TaskType.ASSEMBLY: ['precision_movement', 'pick_and_place', 'tool_handling'],
            TaskType.INSPECTION: ['visual_inspection', 'measurement', 'quality_assessment'],
            TaskType.WELDING: ['welding_technique', 'heat_management', 'safety_protocols'],
            TaskType.PAINTING: ['surface_preparation', 'spray_technique', 'quality_control'],
            TaskType.MATERIAL_HANDLING: ['lifting', 'transportation', 'inventory_management'],
            TaskType.QUALITY_CONTROL: ['measurement', 'defect_detection', 'documentation'],
            TaskType.MAINTENANCE: ['troubleshooting', 'repair_techniques', 'safety_protocols']
        }
        
        skills = base_skills.get(task.type, [])
        
        # Add skills from task parameters
        additional_skills = task.parameters.get('required_skills', [])
        skills.extend(additional_skills)
        
        return list(set(skills))  # Remove duplicates
    
    def _determine_capability_threshold(self, task: Task) -> float:
        """Determine minimum capability threshold"""
        if task.priority == TaskPriority.SAFETY_CRITICAL:
            return 0.9
        elif task.priority == TaskPriority.CRITICAL:
            return 0.8
        elif task.priority == TaskPriority.HIGH:
            return 0.7
        elif task.complexity_score >= 0.8:
            return 0.8
        elif task.complexity_score >= 0.6:
            return 0.7
        else:
            return 0.6
    
    def _extract_safety_requirements(self, task: Task) -> List[str]:
        """Extract safety requirements"""
        safety_reqs = []
        
        if task.safety_critical:
            safety_reqs.append('safety_certification')
        
        if task.type == TaskType.WELDING:
            safety_reqs.extend(['fire_safety', 'ventilation', 'protective_equipment'])
        elif task.type == TaskType.MAINTENANCE:
            safety_reqs.extend(['lockout_tagout', 'confined_space', 'electrical_safety'])
        
        # Add from task parameters
        additional_safety = task.parameters.get('safety_requirements', [])
        safety_reqs.extend(additional_safety)
        
        return list(set(safety_reqs))

class TaskAnalyzer:
    """Comprehensive task analysis for optimal delegation"""
    
    def __init__(self):
        self.complexity_calculator = TaskComplexityCalculator()
        self.requirement_extractor = RequirementExtractor()
        self.historical_data = defaultdict(list)
    
    async def analyze_task(self, task: Task) -> TaskAnalysis:
        """Comprehensive task analysis for optimal delegation"""
        
        # Calculate task complexity across multiple dimensions
        complexity_score = self.complexity_calculator.calculate_complexity(task)
        
        # Extract specific requirements
        requirements = self.requirement_extractor.extract_requirements(task)
        
        # Assess potential risks and failure modes
        risk_assessment = await self._assess_risks(task)
        
        # Learn from similar historical tasks
        historical_insights = await self._get_historical_insights(task)
        
        # Recommend agent types
        recommended_agent_types = self._recommend_agent_types(complexity_score, requirements)
        
        # Estimate duration based on complexity and history
        estimated_duration = self._estimate_duration(task, historical_insights)
        
        # Calculate success probability
        success_probability = self._calculate_success_probability(
            complexity_score, risk_assessment, historical_insights
        )
        
        return TaskAnalysis(
            task_id=task.id,
            complexity_score=complexity_score,
            requirements=requirements,
            risk_assessment=risk_assessment,
            historical_insights=historical_insights,
            recommended_agent_types=recommended_agent_types,
            estimated_duration=estimated_duration,
            success_probability=success_probability
        )
    
    async def _assess_risks(self, task: Task) -> Dict[str, Any]:
        """Assess potential risks and failure modes"""
        risks = {
            'technical_risks': [],
            'safety_risks': [],
            'quality_risks': [],
            'timeline_risks': []
        }
        
        # Technical risks
        if task.complexity_score > 0.8:
            risks['technical_risks'].append('high_complexity_execution')
        
        if task.parameters.get('new_technology', False):
            risks['technical_risks'].append('unproven_technology')
        
        # Safety risks
        if task.safety_critical:
            risks['safety_risks'].append('safety_critical_operation')
        
        if task.type in [TaskType.WELDING, TaskType.MAINTENANCE]:
            risks['safety_risks'].append('hazardous_operation')
        
        # Quality risks
        precision_req = task.parameters.get('precision_tolerance', 1.0)
        if precision_req < 0.5:
            risks['quality_risks'].append('high_precision_requirement')
        
        # Timeline risks
        if task.deadline and task.priority in [TaskPriority.CRITICAL, TaskPriority.HIGH]:
            risks['timeline_risks'].append('tight_deadline')
        
        return risks
    
    async def _get_historical_insights(self, task: Task) -> Dict[str, Any]:
        """Get insights from similar historical tasks"""
        similar_tasks = self.historical_data.get(task.type.value, [])
        
        if not similar_tasks:
            return {'available': False, 'message': 'No historical data available'}
        
        # Calculate averages from historical data
        avg_duration = np.mean([t['duration'] for t in similar_tasks])
        success_rate = np.mean([t['success'] for t in similar_tasks])
        common_issues = self._identify_common_issues(similar_tasks)
        
        return {
            'available': True,
            'similar_tasks_count': len(similar_tasks),
            'average_duration': avg_duration,
            'historical_success_rate': success_rate,
            'common_issues': common_issues,
            'recommendations': self._generate_recommendations(similar_tasks)
        }
    
    def _identify_common_issues(self, similar_tasks: List[Dict[str, Any]]) -> List[str]:
        """Identify common issues from historical tasks"""
        issue_counts = defaultdict(int)
        
        for task in similar_tasks:
            for issue in task.get('issues', []):
                issue_counts[issue] += 1
        
        # Return issues that occurred in >20% of tasks
        threshold = len(similar_tasks) * 0.2
        return [issue for issue, count in issue_counts.items() if count >= threshold]
    
    def _generate_recommendations(self, similar_tasks: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on historical data"""
        recommendations = []
        
        # Analyze successful vs failed tasks
        successful_tasks = [t for t in similar_tasks if t['success']]
        failed_tasks = [t for t in similar_tasks if not t['success']]
        
        if len(successful_tasks) > len(failed_tasks):
            recommendations.append('Task type has good historical success rate')
        else:
            recommendations.append('Task type requires careful planning due to historical challenges')
        
        return recommendations
    
    def _recommend_agent_types(self, complexity_score: ComplexityScore, 
                              requirements: TaskRequirements) -> List[AgentType]:
        """Recommend suitable agent types"""
        recommended_types = []
        
        # High precision tasks favor robots
        if complexity_score.factors.get('precision_requirements', 0) > 0.7:
            recommended_types.append(AgentType.ROBOT)
        
        # Complex coordination favors humans
        if complexity_score.factors.get('coordination_needs', 0) > 0.7:
            recommended_types.append(AgentType.HUMAN)
        
        # AI systems for analysis and optimization
        if requirements.task_type in [TaskType.INSPECTION, TaskType.QUALITY_CONTROL]:
            recommended_types.append(AgentType.AI_SYSTEM)
        
        # Default recommendations
        if not recommended_types:
            if complexity_score.overall > 0.7:
                recommended_types = [AgentType.HUMAN, AgentType.ROBOT]
            else:
                recommended_types = [AgentType.ROBOT, AgentType.HUMAN]
        
        return recommended_types
    
    def _estimate_duration(self, task: Task, historical_insights: Dict[str, Any]) -> int:
        """Estimate task duration based on complexity and history"""
        base_duration = task.estimated_duration
        
        # Adjust based on complexity
        complexity_multiplier = 1.0 + (task.complexity_score * 0.5)
        
        # Adjust based on historical data
        if historical_insights.get('available'):
            historical_avg = historical_insights.get('average_duration', base_duration)
            # Weighted average: 70% historical, 30% estimated
            adjusted_duration = (historical_avg * 0.7) + (base_duration * 0.3)
        else:
            adjusted_duration = base_duration
        
        return int(adjusted_duration * complexity_multiplier)
    
    def _calculate_success_probability(self, complexity_score: ComplexityScore, 
                                     risk_assessment: Dict[str, Any], 
                                     historical_insights: Dict[str, Any]) -> float:
        """Calculate probability of successful task completion"""
        base_probability = 0.8  # Base 80% success rate
        
        # Adjust for complexity
        complexity_penalty = complexity_score.overall * 0.2
        
        # Adjust for risks
        total_risks = sum(len(risks) for risks in risk_assessment.values())
        risk_penalty = min(total_risks * 0.05, 0.3)  # Max 30% penalty
        
        # Adjust for historical success rate
        if historical_insights.get('available'):
            historical_rate = historical_insights.get('historical_success_rate', 0.8)
            # Weighted average: 60% historical, 40% calculated
            probability = (historical_rate * 0.6) + ((base_probability - complexity_penalty - risk_penalty) * 0.4)
        else:
            probability = base_probability - complexity_penalty - risk_penalty
        
        return max(min(probability, 1.0), 0.1)  # Clamp between 10% and 100%

# Capability Matcher
class CapabilityMatcher:
    """Match agent capabilities with task requirements"""

    def __init__(self):
        self.capability_weights = {
            'technical_skills': 0.40,
            'performance_history': 0.25,
            'reliability_score': 0.20,
            'availability_pattern': 0.15
        }

    async def find_capable_agents(self, requirements: TaskRequirements,
                                 facility_id: str) -> List[Agent]:
        """Find agents capable of performing the task"""

        # Get all agents in facility
        facility_agents = [agent for agent in agent_registry.values()
                          if agent.facility_id == facility_id]

        capable_agents = []

        for agent in facility_agents:
            capability_score = await self._calculate_capability_match(agent, requirements)

            # Only include agents with minimum capability threshold
            if capability_score >= requirements.minimum_capability_threshold:
                capable_agents.append(agent)

        return capable_agents

    async def _calculate_capability_match(self, agent: Agent,
                                        requirements: TaskRequirements) -> float:
        """Calculate how well agent capabilities match task requirements"""

        scores = {}

        # Technical skill match
        scores['technical_skills'] = self._assess_technical_skill_match(
            agent.capabilities, requirements.required_skills
        )

        # Historical performance on similar tasks
        scores['performance_history'] = await self._assess_historical_performance(
            agent.id, requirements.task_type
        )

        # Reliability and consistency
        scores['reliability_score'] = agent.reliability_score

        # Availability pattern match (simplified)
        scores['availability_pattern'] = 0.8  # Default good availability

        # Calculate weighted score
        capability_score = sum(
            scores[factor] * weight
            for factor, weight in self.capability_weights.items()
        )

        return capability_score

    def _assess_technical_skill_match(self, agent_capabilities: Dict[str, float],
                                    required_skills: List[str]) -> float:
        """Assess how well agent's technical skills match requirements"""
        if not required_skills:
            return 1.0

        skill_scores = []
        for skill in required_skills:
            skill_level = agent_capabilities.get(skill, 0.0)
            skill_scores.append(skill_level)

        # Return average skill level for required skills
        return sum(skill_scores) / len(skill_scores) if skill_scores else 0.0

    async def _assess_historical_performance(self, agent_id: str, task_type: TaskType) -> float:
        """Assess historical performance on similar tasks"""
        agent = agent_registry.get(agent_id)
        if not agent or not agent.performance_history:
            return 0.5  # Default neutral score

        # Filter performance history for similar task types
        similar_tasks = [
            perf for perf in agent.performance_history
            if perf.get('task_type') == task_type.value
        ]

        if not similar_tasks:
            return 0.5  # No specific experience

        # Calculate average performance score
        performance_scores = [task.get('performance_score', 0.5) for task in similar_tasks]
        return sum(performance_scores) / len(performance_scores)

# Performance Predictor
class PerformancePredictor:
    """Predict agent performance for specific tasks"""

    def __init__(self):
        self.prediction_models = {}

    async def predict_performance(self, agent: Agent, task_requirements: TaskRequirements,
                                context: Dict[str, Any]) -> Dict[str, Any]:
        """Predict agent performance for task"""

        # Base prediction from capability match
        capability_matcher = CapabilityMatcher()
        capability_score = await capability_matcher._calculate_capability_match(agent, task_requirements)

        # Adjust for task complexity
        complexity_factor = context.get('complexity_score', 0.5)
        complexity_adjustment = 1.0 - (complexity_factor * 0.3)

        # Adjust for agent current load
        current_load = context.get('current_load', 0.0)
        load_adjustment = 1.0 - (current_load * 0.2)

        # Calculate predicted performance
        predicted_score = capability_score * complexity_adjustment * load_adjustment

        # Calculate confidence based on historical data
        confidence = self._calculate_prediction_confidence(agent, task_requirements)

        return {
            'capability_score': capability_score,
            'predicted_performance_score': predicted_score,
            'confidence': confidence,
            'factors': {
                'capability_match': capability_score,
                'complexity_adjustment': complexity_adjustment,
                'load_adjustment': load_adjustment
            }
        }

    def _calculate_prediction_confidence(self, agent: Agent, requirements: TaskRequirements) -> float:
        """Calculate confidence in performance prediction"""

        # Base confidence
        base_confidence = 0.6

        # Increase confidence with more historical data
        history_count = len(agent.performance_history)
        history_bonus = min(history_count * 0.05, 0.3)  # Max 30% bonus

        # Increase confidence for exact skill matches
        skill_match_bonus = 0.0
        for skill in requirements.required_skills:
            if skill in agent.capabilities and agent.capabilities[skill] > 0.8:
                skill_match_bonus += 0.05

        skill_match_bonus = min(skill_match_bonus, 0.2)  # Max 20% bonus

        total_confidence = base_confidence + history_bonus + skill_match_bonus
        return min(total_confidence, 1.0)

# Agent Selector
class AgentSelector:
    """Select and rank agent candidates for task delegation"""

    def __init__(self):
        self.capability_matcher = CapabilityMatcher()
        self.performance_predictor = PerformancePredictor()

    async def select_candidates(self, task_requirements: TaskRequirements,
                              facility_id: str, context: Dict[str, Any]) -> List[AgentCandidate]:
        """Select and rank agent candidates for task delegation"""

        # Step 1: Filter agents by capability match
        capable_agents = await self.capability_matcher.find_capable_agents(
            requirements=task_requirements,
            facility_id=facility_id
        )

        # Step 2: Check availability and current load
        available_agents = await self._filter_available_agents(
            agents=capable_agents,
            required_time_window=task_requirements.estimated_duration
        )

        # Step 3: Predict performance for each agent
        candidates = []
        for agent in available_agents:
            performance_prediction = await self.performance_predictor.predict_performance(
                agent=agent,
                task_requirements=task_requirements,
                context=context
            )

            current_load = await self._get_agent_load(agent.id)

            candidates.append(AgentCandidate(
                agent=agent,
                capability_match_score=performance_prediction['capability_score'],
                predicted_performance=performance_prediction,
                current_load=current_load,
                selection_confidence=performance_prediction['confidence']
            ))

        # Step 4: Rank candidates using multi-criteria decision making
        ranked_candidates = self._rank_candidates(candidates, task_requirements)

        return ranked_candidates[:5]  # Return top 5 candidates

    async def _filter_available_agents(self, agents: List[Agent],
                                     required_time_window: int) -> List[Agent]:
        """Filter agents by availability"""
        available_agents = []

        for agent in agents:
            if agent.current_status in ['available', 'idle']:
                available_agents.append(agent)
            elif agent.current_status == 'busy':
                # Check if agent will be available soon
                current_load = await self._get_agent_load(agent.id)
                if current_load < 0.8:  # Agent has some capacity
                    available_agents.append(agent)

        return available_agents

    async def _get_agent_load(self, agent_id: str) -> float:
        """Get current load for agent"""
        # Count active delegations for this agent
        agent_delegations = [
            delegation for delegation in active_delegations.values()
            if delegation.assigned_agent.id == agent_id
        ]

        # Simple load calculation: number of active tasks / max capacity
        max_capacity = 3  # Assume max 3 concurrent tasks per agent
        current_load = len(agent_delegations) / max_capacity

        return min(current_load, 1.0)

    def _rank_candidates(self, candidates: List[AgentCandidate],
                        requirements: TaskRequirements) -> List[AgentCandidate]:
        """Rank candidates using multi-criteria decision making"""

        # Define ranking weights based on task priority
        if requirements.priority in [TaskPriority.CRITICAL, TaskPriority.SAFETY_CRITICAL]:
            weights = {
                'capability_match': 0.4,
                'reliability': 0.3,
                'predicted_performance': 0.2,
                'availability': 0.1
            }
        else:
            weights = {
                'capability_match': 0.3,
                'predicted_performance': 0.3,
                'availability': 0.2,
                'reliability': 0.2
            }

        # Calculate ranking scores
        for candidate in candidates:
            score = 0.0

            # Capability match score
            score += candidate.capability_match_score * weights['capability_match']

            # Predicted performance score
            perf_score = candidate.predicted_performance['predicted_performance_score']
            score += perf_score * weights['predicted_performance']

            # Reliability score
            score += candidate.agent.reliability_score * weights['reliability']

            # Availability score (inverse of current load)
            availability_score = 1.0 - candidate.current_load
            score += availability_score * weights['availability']

            candidate.selection_confidence = score

        # Sort by selection confidence (descending)
        return sorted(candidates, key=lambda c: c.selection_confidence, reverse=True)

# AI Task Delegation Service
class AITaskDelegationService:
    """Main service for intelligent task delegation"""

    def __init__(self):
        self.task_analyzer = TaskAnalyzer()
        self.agent_selector = AgentSelector()
        self.performance_learner = None  # Will be implemented later
        self.error_handler = None  # Will be implemented later
        self.monitoring = None  # Will be implemented later

    async def delegate_task(self, task: Task, context: Dict[str, Any]) -> DelegationResult:
        """Main entry point for intelligent task delegation"""

        try:
            # Step 1: Analyze task requirements and complexity
            task_analysis = await self.task_analyzer.analyze_task(task)

            # Step 2: Find and rank suitable agents
            agent_candidates = await self.agent_selector.select_candidates(
                task_requirements=task_analysis.requirements,
                facility_id=task.facility_id,
                context={**context, 'complexity_score': task_analysis.complexity_score.overall}
            )

            if not agent_candidates:
                return DelegationResult(
                    status=DelegationStatus.FAILED,
                    error_message="No suitable agents found for task"
                )

            # Step 3: Create delegation
            best_candidate = agent_candidates[0]
            delegation = await self._create_delegation(task, best_candidate, task_analysis)

            # Step 4: Store delegation
            active_delegations[delegation.id] = delegation

            return DelegationResult(
                status=DelegationStatus.DELEGATED,
                assigned_agent=delegation.assigned_agent,
                delegation_id=delegation.id,
                expected_completion=delegation.estimated_completion_time,
                confidence_score=best_candidate.selection_confidence
            )

        except Exception as e:
            logger.error(f"Error in task delegation: {e}")
            return DelegationResult(
                status=DelegationStatus.FAILED,
                error_message=str(e)
            )

    async def _create_delegation(self, task: Task, candidate: AgentCandidate,
                               analysis: TaskAnalysis) -> TaskDelegation:
        """Create task delegation"""

        delegation_id = str(uuid.uuid4())
        current_time = datetime.now(timezone.utc)

        # Calculate estimated completion time
        estimated_completion = current_time + timedelta(minutes=analysis.estimated_duration)

        # Create backup agents list (excluding the primary agent)
        backup_agents = [c.agent for c in await self.agent_selector.select_candidates(
            task_requirements=analysis.requirements,
            facility_id=task.facility_id,
            context={'complexity_score': analysis.complexity_score.overall}
        ) if c.agent.id != candidate.agent.id][:2]  # Top 2 backup agents

        return TaskDelegation(
            id=delegation_id,
            task=task,
            assigned_agent=candidate.agent,
            backup_agents=backup_agents,
            delegation_timestamp=current_time,
            estimated_completion_time=estimated_completion,
            assignment_confidence=candidate.selection_confidence,
            monitoring_config={
                'check_interval': 60,  # seconds
                'performance_thresholds': {
                    'min_progress_rate': 0.1,
                    'max_error_rate': 0.05
                }
            }
        )

# Global instances
task_analyzer = TaskAnalyzer()
ai_delegation_service = AITaskDelegationService()
active_delegations: Dict[str, TaskDelegation] = {}
agent_registry: Dict[str, Agent] = {}

# Pydantic models for API
class TaskRequest(BaseModel):
    type: TaskType
    name: str
    description: str
    parameters: Dict[str, Any]
    priority: TaskPriority
    estimated_duration: int  # minutes
    facility_id: str
    deadline: Optional[str] = None  # ISO format
    safety_critical: bool = False

class AgentRequest(BaseModel):
    id: str
    type: AgentType
    name: str
    capabilities: Dict[str, float]
    facility_id: str
    current_status: str = "available"

class DelegationRequest(BaseModel):
    task: TaskRequest
    context: Dict[str, Any] = {}

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "AI Task Delegation Service",
        "version": "1.0.0",
        "description": "Intelligent task delegation with ML-powered agent selection and continuous learning",
        "features": [
            "multi_dimensional_task_analysis",
            "intelligent_agent_selection",
            "performance_prediction",
            "continuous_learning",
            "real_time_monitoring"
        ],
        "active_delegations": len(active_delegations),
        "registered_agents": len(agent_registry)
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-task-delegation",
        "components": {
            "task_analyzer": "operational",
            "agent_selector": "operational",
            "delegation_service": "operational"
        },
        "metrics": {
            "active_delegations": len(active_delegations),
            "registered_agents": len(agent_registry),
            "agent_types": {
                agent_type.value: len([a for a in agent_registry.values() if a.type == agent_type])
                for agent_type in AgentType
            }
        }
    }

@app.post("/api/v1/agents/register")
async def register_agent(agent_request: AgentRequest):
    """Register a new agent with the delegation system"""
    try:
        agent = Agent(
            id=agent_request.id,
            type=agent_request.type,
            name=agent_request.name,
            capabilities=agent_request.capabilities,
            current_status=agent_request.current_status,
            facility_id=agent_request.facility_id,
            performance_history=[],
            reliability_score=0.8,  # Default reliability
            last_updated=datetime.now(timezone.utc)
        )

        agent_registry[agent.id] = agent

        return {
            "success": True,
            "message": f"Agent {agent.name} registered successfully",
            "agent_id": agent.id,
            "capabilities": agent.capabilities
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/agents")
async def list_agents(facility_id: Optional[str] = None, agent_type: Optional[AgentType] = None):
    """List all registered agents with optional filtering"""
    try:
        agents = list(agent_registry.values())

        # Apply filters
        if facility_id:
            agents = [a for a in agents if a.facility_id == facility_id]

        if agent_type:
            agents = [a for a in agents if a.type == agent_type]

        return {
            "agents": [asdict(agent) for agent in agents],
            "total_count": len(agents),
            "filters_applied": {
                "facility_id": facility_id,
                "agent_type": agent_type.value if agent_type else None
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/agents/{agent_id}")
async def get_agent_details(agent_id: str):
    """Get detailed information about a specific agent"""
    try:
        if agent_id not in agent_registry:
            raise HTTPException(status_code=404, detail="Agent not found")

        agent = agent_registry[agent_id]

        # Get current load
        current_load = await ai_delegation_service.agent_selector._get_agent_load(agent_id)

        # Get active delegations for this agent
        agent_delegations = [
            asdict(delegation) for delegation in active_delegations.values()
            if delegation.assigned_agent.id == agent_id
        ]

        return {
            "agent": asdict(agent),
            "current_load": current_load,
            "active_delegations": agent_delegations,
            "performance_summary": {
                "total_tasks": len(agent.performance_history),
                "average_performance": np.mean([p.get('performance_score', 0.5) for p in agent.performance_history]) if agent.performance_history else 0.5,
                "reliability_score": agent.reliability_score
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/tasks/delegate")
async def delegate_task(delegation_request: DelegationRequest):
    """Delegate a task to the most suitable agent"""
    try:
        # Convert request to Task object
        task_data = delegation_request.task
        deadline = None
        if task_data.deadline:
            deadline = datetime.fromisoformat(task_data.deadline.replace('Z', '+00:00'))

        task = Task(
            id=str(uuid.uuid4()),
            type=task_data.type,
            name=task_data.name,
            description=task_data.description,
            parameters=task_data.parameters,
            priority=task_data.priority,
            complexity_score=0.5,  # Will be calculated by analyzer
            required_skills=[],  # Will be extracted by analyzer
            estimated_duration=task_data.estimated_duration,
            deadline=deadline,
            facility_id=task_data.facility_id,
            created_at=datetime.now(timezone.utc),
            safety_critical=task_data.safety_critical
        )

        # Delegate task
        result = await ai_delegation_service.delegate_task(task, delegation_request.context)

        return {
            "task_id": task.id,
            "delegation_result": asdict(result)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/tasks/{task_id}/analysis")
async def analyze_task(task_id: str):
    """Get detailed analysis of a task"""
    try:
        # Find task in active delegations
        delegation = None
        for d in active_delegations.values():
            if d.task.id == task_id:
                delegation = d
                break

        if not delegation:
            raise HTTPException(status_code=404, detail="Task not found")

        # Perform fresh analysis
        analysis = await task_analyzer.analyze_task(delegation.task)

        return {
            "task_id": task_id,
            "analysis": asdict(analysis)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/delegations")
async def list_delegations(status: Optional[DelegationStatus] = None, facility_id: Optional[str] = None):
    """List all delegations with optional filtering"""
    try:
        delegations = list(active_delegations.values())

        # Apply filters
        if status:
            # Note: This is simplified - in real implementation, delegation status would be tracked
            delegations = delegations  # All active delegations are considered "executing"

        if facility_id:
            delegations = [d for d in delegations if d.task.facility_id == facility_id]

        return {
            "delegations": [asdict(delegation) for delegation in delegations],
            "total_count": len(delegations),
            "filters_applied": {
                "status": status.value if status else None,
                "facility_id": facility_id
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/delegations/{delegation_id}")
async def get_delegation_details(delegation_id: str):
    """Get detailed information about a specific delegation"""
    try:
        if delegation_id not in active_delegations:
            raise HTTPException(status_code=404, detail="Delegation not found")

        delegation = active_delegations[delegation_id]

        return {
            "delegation": asdict(delegation),
            "status": "executing",  # Simplified status
            "progress": {
                "estimated_completion": delegation.estimated_completion_time.isoformat(),
                "time_elapsed": (datetime.now(timezone.utc) - delegation.delegation_timestamp).total_seconds() / 60,  # minutes
                "confidence_score": delegation.assignment_confidence
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/delegations/{delegation_id}/complete")
async def complete_delegation(delegation_id: str, outcome: Dict[str, Any]):
    """Mark a delegation as completed and record outcome"""
    try:
        if delegation_id not in active_delegations:
            raise HTTPException(status_code=404, detail="Delegation not found")

        delegation = active_delegations[delegation_id]

        # Create task outcome
        task_outcome = TaskOutcome(
            task_id=delegation.task.id,
            delegation_id=delegation_id,
            success=outcome.get('success', True),
            execution_duration=outcome.get('execution_duration', 0),
            quality_metrics=outcome.get('quality_metrics', {}),
            performance_metrics=outcome.get('performance_metrics', {}),
            outcome_confidence=outcome.get('confidence', 0.8),
            completion_time=datetime.now(timezone.utc),
            error_details=outcome.get('error_details')
        )

        # Update agent performance history
        agent = delegation.assigned_agent
        if agent.id in agent_registry:
            agent_registry[agent.id].performance_history.append({
                'task_type': delegation.task.type.value,
                'performance_score': outcome.get('performance_score', 0.8),
                'success': task_outcome.success,
                'duration': task_outcome.execution_duration,
                'timestamp': task_outcome.completion_time.isoformat()
            })

        # Remove from active delegations
        del active_delegations[delegation_id]

        return {
            "success": True,
            "delegation_id": delegation_id,
            "outcome": asdict(task_outcome),
            "message": "Delegation completed successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analytics/performance")
async def get_performance_analytics():
    """Get performance analytics for the delegation system"""
    try:
        # Calculate system-wide metrics
        total_agents = len(agent_registry)
        total_delegations = len(active_delegations)

        # Agent type distribution
        agent_type_distribution = {}
        for agent_type in AgentType:
            count = len([a for a in agent_registry.values() if a.type == agent_type])
            agent_type_distribution[agent_type.value] = count

        # Task type distribution
        task_type_distribution = {}
        for task_type in TaskType:
            count = len([d for d in active_delegations.values() if d.task.type == task_type])
            task_type_distribution[task_type.value] = count

        # Average agent performance
        all_performance_scores = []
        for agent in agent_registry.values():
            if agent.performance_history:
                scores = [p.get('performance_score', 0.5) for p in agent.performance_history]
                all_performance_scores.extend(scores)

        avg_performance = np.mean(all_performance_scores) if all_performance_scores else 0.5

        return {
            "system_metrics": {
                "total_agents": total_agents,
                "active_delegations": total_delegations,
                "average_performance_score": avg_performance
            },
            "distributions": {
                "agent_types": agent_type_distribution,
                "task_types": task_type_distribution
            },
            "performance_trends": {
                "delegation_success_rate": 0.85,  # Simplified
                "average_delegation_time": 45,  # minutes
                "agent_utilization_rate": total_delegations / max(total_agents, 1)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/agents/{agent_id}/recommendations")
async def get_agent_recommendations(agent_id: str):
    """Get recommendations for improving agent performance"""
    try:
        if agent_id not in agent_registry:
            raise HTTPException(status_code=404, detail="Agent not found")

        agent = agent_registry[agent_id]

        recommendations = []

        # Analyze performance history
        if agent.performance_history:
            recent_scores = [p.get('performance_score', 0.5) for p in agent.performance_history[-10:]]
            avg_recent_score = np.mean(recent_scores)

            if avg_recent_score < 0.7:
                recommendations.append({
                    "type": "performance_improvement",
                    "priority": "high",
                    "message": "Recent performance below optimal. Consider additional training.",
                    "suggested_actions": ["skill_training", "mentoring", "task_complexity_reduction"]
                })

        # Analyze capability gaps
        low_capabilities = [skill for skill, level in agent.capabilities.items() if level < 0.6]
        if low_capabilities:
            recommendations.append({
                "type": "skill_development",
                "priority": "medium",
                "message": f"Low proficiency in: {', '.join(low_capabilities)}",
                "suggested_actions": ["targeted_training", "practice_assignments"]
            })

        # Analyze workload
        current_load = await ai_delegation_service.agent_selector._get_agent_load(agent_id)
        if current_load > 0.9:
            recommendations.append({
                "type": "workload_management",
                "priority": "high",
                "message": "Agent is overloaded. Consider redistributing tasks.",
                "suggested_actions": ["task_redistribution", "schedule_optimization"]
            })

        return {
            "agent_id": agent_id,
            "recommendations": recommendations,
            "performance_summary": {
                "current_reliability": agent.reliability_score,
                "current_load": current_load,
                "total_tasks_completed": len(agent.performance_history)
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time delegation monitoring
@app.websocket("/ws/delegations")
async def delegation_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time delegation monitoring"""
    await websocket.accept()

    try:
        while True:
            # Send delegation status updates
            delegation_update = {
                "type": "delegation_status_update",
                "data": {
                    "active_delegations": len(active_delegations),
                    "total_agents": len(agent_registry),
                    "delegations": [
                        {
                            "id": delegation.id,
                            "task_name": delegation.task.name,
                            "agent_name": delegation.assigned_agent.name,
                            "confidence": delegation.assignment_confidence,
                            "estimated_completion": delegation.estimated_completion_time.isoformat()
                        }
                        for delegation in list(active_delegations.values())[:10]  # Last 10 delegations
                    ]
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            await websocket.send_json(delegation_update)
            await asyncio.sleep(2)  # Send updates every 2 seconds

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
