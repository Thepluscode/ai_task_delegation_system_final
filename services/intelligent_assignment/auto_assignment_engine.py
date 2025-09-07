"""
Intelligent Auto-Assignment Engine
Automatically assigns tasks to optimal agents using multi-objective optimization
"""

import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import json

from ..core.models import Task, Agent, Assignment
from ..core.database import DatabaseManager
from ..optimization.genetic_optimizer import GeneticOptimizer
from ..ml.performance_predictor import PerformancePredictor

@dataclass
class OptimizationWeights:
    """Industry-specific optimization weights"""
    speed: float = 0.2
    quality: float = 0.2
    cost: float = 0.2
    safety: float = 0.2
    energy: float = 0.2

@dataclass
class IndustryConfig:
    """Industry-specific configuration"""
    name: str
    weights: OptimizationWeights
    priority_factors: Dict[str, float]
    constraints: Dict[str, any]

class IntelligentAutoAssignmentEngine:
    """Advanced automation engine for optimal task assignment"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.genetic_optimizer = GeneticOptimizer()
        self.performance_predictor = PerformancePredictor()
        self.logger = logging.getLogger(__name__)
        
        # Industry-specific configurations
        self.industry_configs = self._initialize_industry_configs()
        
        # ML models for prediction
        self.assignment_model = None
        self.performance_model = None
        self.scaler = StandardScaler()
        
        # Real-time metrics
        self.agent_performance_cache = {}
        self.workload_cache = {}
        
    def _initialize_industry_configs(self) -> Dict[str, IndustryConfig]:
        """Initialize industry-specific optimization configurations"""
        return {
            "manufacturing": IndustryConfig(
                name="Manufacturing",
                weights=OptimizationWeights(speed=0.3, quality=0.25, cost=0.2, safety=0.2, energy=0.05),
                priority_factors={"precision": 1.5, "speed": 1.3, "reliability": 1.4},
                constraints={"max_workload": 0.85, "safety_threshold": 0.9}
            ),
            "healthcare": IndustryConfig(
                name="Healthcare",
                weights=OptimizationWeights(speed=0.15, quality=0.4, cost=0.1, safety=0.3, energy=0.05),
                priority_factors={"accuracy": 2.0, "safety": 1.8, "compliance": 1.6},
                constraints={"max_workload": 0.75, "safety_threshold": 0.95}
            ),
            "finance": IndustryConfig(
                name="Finance",
                weights=OptimizationWeights(speed=0.35, quality=0.3, cost=0.15, safety=0.15, energy=0.05),
                priority_factors={"speed": 1.8, "accuracy": 1.7, "security": 1.9},
                constraints={"max_workload": 0.9, "safety_threshold": 0.85}
            ),
            "retail": IndustryConfig(
                name="Retail",
                weights=OptimizationWeights(speed=0.25, quality=0.2, cost=0.3, safety=0.15, energy=0.1),
                priority_factors={"customer_satisfaction": 1.6, "cost_efficiency": 1.4, "speed": 1.3},
                constraints={"max_workload": 0.8, "safety_threshold": 0.8}
            ),
            "iot": IndustryConfig(
                name="IoT",
                weights=OptimizationWeights(speed=0.3, quality=0.2, cost=0.15, safety=0.2, energy=0.15),
                priority_factors={"real_time": 1.9, "reliability": 1.5, "energy_efficiency": 1.3},
                constraints={"max_workload": 0.95, "safety_threshold": 0.85}
            ),
            "social_media": IndustryConfig(
                name="Social Media",
                weights=OptimizationWeights(speed=0.4, quality=0.25, cost=0.2, safety=0.1, energy=0.05),
                priority_factors={"response_time": 1.8, "content_quality": 1.4, "scalability": 1.6},
                constraints={"max_workload": 0.9, "safety_threshold": 0.75}
            )
        }
    
    async def auto_assign_task(self, task: Task, industry: str = "manufacturing") -> Optional[Assignment]:
        """
        Automatically assign task to the best agent using intelligent optimization
        """
        try:
            self.logger.info(f"Starting auto-assignment for task {task.task_id} in {industry}")
            
            # Get industry configuration
            config = self.industry_configs.get(industry, self.industry_configs["manufacturing"])
            
            # Get available agents
            available_agents = await self._get_available_agents(task.location)
            if not available_agents:
                self.logger.warning("No available agents found")
                return None
            
            # Update real-time metrics
            await self._update_real_time_metrics(available_agents)
            
            # Calculate optimal assignment
            optimal_agent, confidence_score = await self._calculate_optimal_assignment(
                task, available_agents, config
            )
            
            if optimal_agent:
                # Create assignment
                assignment = Assignment(
                    assignment_id=f"auto_{task.task_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    task_id=task.task_id,
                    agent_id=optimal_agent.agent_id,
                    assigned_at=datetime.now(),
                    confidence_score=confidence_score,
                    assignment_method="intelligent_auto",
                    optimization_weights=config.weights.__dict__,
                    industry_context=industry
                )
                
                # Store assignment
                await self.db_manager.store_assignment(assignment)
                
                # Update agent workload
                await self._update_agent_workload(optimal_agent.agent_id, task)
                
                self.logger.info(f"Task {task.task_id} assigned to {optimal_agent.agent_id} with {confidence_score:.2%} confidence")
                return assignment
                
        except Exception as e:
            self.logger.error(f"Error in auto-assignment: {str(e)}")
            return None
    
    async def _get_available_agents(self, location: str) -> List[Agent]:
        """Get available agents for the specified location"""
        agents = await self.db_manager.get_agents_by_location(location)
        return [agent for agent in agents if agent.status == "AVAILABLE" and agent.current_workload < 0.95]
    
    async def _update_real_time_metrics(self, agents: List[Agent]):
        """Update real-time performance metrics for agents"""
        for agent in agents:
            # Get recent performance data
            recent_tasks = await self.db_manager.get_agent_recent_tasks(agent.agent_id, hours=24)
            
            # Calculate performance metrics
            if recent_tasks:
                completion_rate = sum(1 for task in recent_tasks if task.status == "COMPLETED") / len(recent_tasks)
                avg_quality = np.mean([task.quality_score for task in recent_tasks if task.quality_score])
                avg_duration = np.mean([task.actual_duration for task in recent_tasks if task.actual_duration])
                
                self.agent_performance_cache[agent.agent_id] = {
                    "completion_rate": completion_rate,
                    "avg_quality": avg_quality,
                    "avg_duration": avg_duration,
                    "last_updated": datetime.now()
                }
    
    async def _calculate_optimal_assignment(self, task: Task, agents: List[Agent], config: IndustryConfig) -> Tuple[Optional[Agent], float]:
        """Calculate optimal agent assignment using multi-objective optimization"""
        
        best_agent = None
        best_score = -1
        
        for agent in agents:
            # Calculate multi-objective score
            score = await self._calculate_agent_score(task, agent, config)
            
            if score > best_score:
                best_score = score
                best_agent = agent
        
        # Use genetic optimization for complex scenarios
        if len(agents) > 10 and task.complexity > 0.7:
            optimized_agent, optimized_score = await self._genetic_optimization(task, agents, config)
            if optimized_score > best_score:
                best_agent = optimized_agent
                best_score = optimized_score
        
        return best_agent, best_score
    
    async def _calculate_agent_score(self, task: Task, agent: Agent, config: IndustryConfig) -> float:
        """Calculate agent suitability score for the task"""
        
        # Base capability matching
        capability_score = self._calculate_capability_match(task, agent)
        
        # Performance history
        performance_score = self._calculate_performance_score(agent)
        
        # Workload consideration
        workload_score = 1.0 - agent.current_workload
        
        # Industry-specific factors
        industry_score = self._calculate_industry_specific_score(task, agent, config)
        
        # Weighted combination
        weights = config.weights
        total_score = (
            capability_score * weights.quality +
            performance_score * weights.speed +
            workload_score * weights.cost +
            industry_score * weights.safety +
            (1.0 - agent.energy_consumption) * weights.energy
        )
        
        return min(total_score, 1.0)
    
    def _calculate_capability_match(self, task: Task, agent: Agent) -> float:
        """Calculate how well agent capabilities match task requirements"""
        task_requirements = set(task.required_capabilities or [])
        agent_capabilities = set(agent.capabilities or [])
        
        if not task_requirements:
            return 0.8  # Default score if no specific requirements
        
        match_ratio = len(task_requirements.intersection(agent_capabilities)) / len(task_requirements)
        return match_ratio
    
    def _calculate_performance_score(self, agent: Agent) -> float:
        """Calculate agent performance score based on historical data"""
        performance_data = self.agent_performance_cache.get(agent.agent_id)
        
        if not performance_data:
            return 0.5  # Default score for new agents
        
        # Weighted performance calculation
        completion_weight = 0.4
        quality_weight = 0.4
        efficiency_weight = 0.2
        
        score = (
            performance_data["completion_rate"] * completion_weight +
            (performance_data["avg_quality"] or 0.5) * quality_weight +
            (1.0 / max(performance_data["avg_duration"], 1)) * efficiency_weight
        )
        
        return min(score, 1.0)
    
    def _calculate_industry_specific_score(self, task: Task, agent: Agent, config: IndustryConfig) -> float:
        """Calculate industry-specific suitability score"""
        score = 0.5  # Base score
        
        # Apply industry-specific priority factors
        for factor, weight in config.priority_factors.items():
            if factor in (agent.capabilities or []):
                score += 0.1 * weight
        
        # Check constraints
        if agent.current_workload > config.constraints["max_workload"]:
            score *= 0.5  # Penalty for high workload
        
        if hasattr(agent, 'safety_rating') and agent.safety_rating < config.constraints["safety_threshold"]:
            score *= 0.3  # Heavy penalty for safety issues
        
        return min(score, 1.0)
    
    async def _genetic_optimization(self, task: Task, agents: List[Agent], config: IndustryConfig) -> Tuple[Optional[Agent], float]:
        """Use genetic algorithm for complex optimization scenarios"""
        try:
            # Prepare optimization parameters
            objectives = [
                lambda agent: self._calculate_capability_match(task, agent),
                lambda agent: self._calculate_performance_score(agent),
                lambda agent: 1.0 - agent.current_workload,
                lambda agent: getattr(agent, 'safety_rating', 0.8),
                lambda agent: 1.0 - agent.energy_consumption
            ]
            
            # Run genetic optimization
            optimal_agent_id = await self.genetic_optimizer.optimize_assignment(
                task, agents, objectives, config.weights.__dict__
            )
            
            optimal_agent = next((agent for agent in agents if agent.agent_id == optimal_agent_id), None)
            
            if optimal_agent:
                score = await self._calculate_agent_score(task, optimal_agent, config)
                return optimal_agent, score
            
        except Exception as e:
            self.logger.error(f"Genetic optimization failed: {str(e)}")
        
        return None, 0.0
    
    async def _update_agent_workload(self, agent_id: str, task: Task):
        """Update agent workload after assignment"""
        try:
            # Calculate workload increase based on task complexity and duration
            workload_increase = task.complexity * (task.estimated_duration / 480)  # 8-hour workday
            
            await self.db_manager.update_agent_workload(agent_id, workload_increase)
            
        except Exception as e:
            self.logger.error(f"Error updating agent workload: {str(e)}")
    
    async def start_continuous_optimization(self):
        """Start continuous optimization process"""
        self.logger.info("Starting continuous optimization process")
        
        while True:
            try:
                # Check for pending tasks
                pending_tasks = await self.db_manager.get_pending_tasks()
                
                for task in pending_tasks:
                    # Determine industry context
                    industry = self._determine_task_industry(task)
                    
                    # Auto-assign task
                    assignment = await self.auto_assign_task(task, industry)
                    
                    if assignment:
                        self.logger.info(f"Auto-assigned task {task.task_id} to {assignment.agent_id}")
                
                # Wait before next optimization cycle
                await asyncio.sleep(30)  # 30-second intervals
                
            except Exception as e:
                self.logger.error(f"Error in continuous optimization: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error
    
    def _determine_task_industry(self, task: Task) -> str:
        """Determine industry context from task characteristics"""
        task_type = task.task_type.lower()
        
        industry_keywords = {
            "manufacturing": ["assembly", "precision", "material_handling", "quality_inspection"],
            "healthcare": ["patient", "medical", "diagnosis", "treatment", "care"],
            "finance": ["trading", "analysis", "risk", "compliance", "audit"],
            "retail": ["customer", "inventory", "sales", "service", "support"],
            "iot": ["sensor", "device", "monitoring", "data_collection", "automation"],
            "social_media": ["content", "moderation", "engagement", "social", "community"]
        }
        
        for industry, keywords in industry_keywords.items():
            if any(keyword in task_type for keyword in keywords):
                return industry
        
        return "manufacturing"  # Default industry
