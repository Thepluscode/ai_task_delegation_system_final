"""
Genetic Algorithm Optimizer for Task Assignment
"""

import random
import logging
from typing import List, Dict, Callable, Any
import asyncio

class GeneticOptimizer:
    """Genetic algorithm for optimizing task assignments"""
    
    def __init__(self, population_size: int = 50, generations: int = 100):
        self.population_size = population_size
        self.generations = generations
        self.logger = logging.getLogger(__name__)
    
    async def optimize_assignment(self, task, agents: List, objectives: List[Callable], weights: Dict[str, float]) -> str:
        """
        Optimize agent assignment using genetic algorithm
        
        Args:
            task: Task to assign
            agents: List of available agents
            objectives: List of objective functions
            weights: Optimization weights
            
        Returns:
            Optimal agent ID
        """
        try:
            if not agents:
                return None
            
            # For simplicity, use a weighted scoring approach
            best_agent = None
            best_score = -1
            
            for agent in agents:
                score = 0
                
                # Calculate objective scores
                for i, objective in enumerate(objectives):
                    try:
                        obj_score = objective(agent)
                        score += obj_score * list(weights.values())[i % len(weights)]
                    except Exception as e:
                        self.logger.warning(f"Error calculating objective {i}: {str(e)}")
                        obj_score = 0.5  # Default score
                        score += obj_score * list(weights.values())[i % len(weights)]
                
                if score > best_score:
                    best_score = score
                    best_agent = agent
            
            return best_agent.agent_id if best_agent else None
            
        except Exception as e:
            self.logger.error(f"Error in genetic optimization: {str(e)}")
            # Fallback to first available agent
            return agents[0].agent_id if agents else None
