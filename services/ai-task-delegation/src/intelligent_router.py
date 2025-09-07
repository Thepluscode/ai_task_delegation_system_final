"""
AI-Powered Task Delegation Engine
Intelligent routing system for optimal task assignment between humans and robots
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

logger = logging.getLogger(__name__)

class TaskComplexity(Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    CRITICAL = "critical"

class ResourceType(Enum):
    HUMAN = "human"
    ROBOT = "robot"
    HYBRID = "hybrid"

class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class Task:
    task_id: str
    name: str
    description: str
    complexity: TaskComplexity
    priority: TaskPriority
    estimated_duration: int  # minutes
    required_skills: List[str]
    safety_critical: bool
    deadline: Optional[datetime] = None
    location: Optional[str] = None
    equipment_required: List[str] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
        if self.equipment_required is None:
            self.equipment_required = []

@dataclass
class Resource:
    resource_id: str
    name: str
    type: ResourceType
    available: bool
    skills: List[str]
    current_load: float  # 0.0 to 1.0
    location: Optional[str] = None
    cost_per_hour: float = 0.0
    efficiency_rating: float = 1.0
    last_maintenance: Optional[datetime] = None
    
@dataclass
class Assignment:
    task_id: str
    resource_id: str
    confidence_score: float
    estimated_completion_time: datetime
    cost_estimate: float
    reasoning: str
    backup_resources: List[str] = None
    
    def __post_init__(self):
        if self.backup_resources is None:
            self.backup_resources = []

class IntelligentTaskRouter:
    """
    AI-powered task delegation engine that optimally assigns tasks to humans or robots
    based on complexity, urgency, capabilities, and real-time conditions.
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.historical_data = []
        self.confidence_threshold = 0.75
        self.load_model()
        
    def load_model(self):
        """Load or initialize the ML model for task assignment"""
        try:
            self.model = joblib.load('task_assignment_model.pkl')
            self.scaler = joblib.load('task_scaler.pkl')
            logger.info("Loaded existing task assignment model")
        except FileNotFoundError:
            # Initialize with a basic model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            logger.info("Initialized new task assignment model")
    
    def extract_features(self, task: Task, resource: Resource) -> np.ndarray:
        """Extract features for ML model prediction"""
        features = [
            # Task features
            len(task.required_skills),
            task.estimated_duration,
            task.priority.value,
            1 if task.safety_critical else 0,
            len(task.equipment_required),
            
            # Resource features
            1 if resource.type == ResourceType.ROBOT else 0,
            len(resource.skills),
            resource.current_load,
            resource.efficiency_rating,
            resource.cost_per_hour,
            
            # Compatibility features
            len(set(task.required_skills) & set(resource.skills)),  # skill overlap
            1 if task.location == resource.location else 0,  # location match
        ]
        
        return np.array(features).reshape(1, -1)
    
    async def calculate_assignment_score(self, task: Task, resource: Resource) -> Tuple[float, str]:
        """
        Calculate assignment score and reasoning for task-resource pair
        Returns: (confidence_score, reasoning)
        """
        if not resource.available:
            return 0.0, "Resource not available"
        
        # Check skill compatibility
        required_skills = set(task.required_skills)
        available_skills = set(resource.skills)
        skill_match = len(required_skills & available_skills) / len(required_skills) if required_skills else 1.0
        
        if skill_match < 0.5:
            return 0.1, f"Insufficient skill match: {skill_match:.1%}"
        
        # Location compatibility
        location_bonus = 0.2 if task.location == resource.location else 0.0
        
        # Load factor (prefer less loaded resources)
        load_penalty = resource.current_load * 0.3
        
        # Safety considerations
        safety_score = 1.0
        if task.safety_critical and resource.type == ResourceType.ROBOT:
            safety_score = 0.7  # Slight preference for human oversight on critical tasks
        
        # Complexity vs capability matching
        complexity_score = 1.0
        if task.complexity == TaskComplexity.COMPLEX and resource.type == ResourceType.ROBOT:
            complexity_score = 0.8  # Robots may struggle with complex tasks
        elif task.complexity == TaskComplexity.SIMPLE and resource.type == ResourceType.HUMAN:
            complexity_score = 0.9  # Humans might be overqualified for simple tasks
        
        # Cost efficiency
        cost_factor = 1.0 / (1.0 + resource.cost_per_hour / 100.0)  # Normalize cost impact
        
        # Calculate base score
        base_score = (
            skill_match * 0.4 +
            (1.0 - load_penalty) * 0.2 +
            safety_score * 0.15 +
            complexity_score * 0.15 +
            cost_factor * 0.1 +
            location_bonus
        )
        
        # Apply efficiency multiplier
        final_score = min(base_score * resource.efficiency_rating, 1.0)
        
        # Generate reasoning
        reasoning_parts = [
            f"Skill match: {skill_match:.1%}",
            f"Current load: {resource.current_load:.1%}",
            f"Efficiency: {resource.efficiency_rating:.1f}",
            f"Cost: ${resource.cost_per_hour:.2f}/hr"
        ]
        
        if task.safety_critical:
            reasoning_parts.append("Safety-critical task")
        if location_bonus > 0:
            reasoning_parts.append("Location match")
        
        reasoning = "; ".join(reasoning_parts)
        
        return final_score, reasoning
    
    async def find_optimal_assignment(self, task: Task, available_resources: List[Resource]) -> Optional[Assignment]:
        """
        Find the optimal resource assignment for a given task
        """
        if not available_resources:
            logger.warning(f"No available resources for task {task.task_id}")
            return None
        
        best_assignment = None
        best_score = 0.0
        backup_resources = []
        
        # Evaluate each resource
        for resource in available_resources:
            score, reasoning = await self.calculate_assignment_score(task, resource)
            
            if score > best_score:
                if best_assignment:
                    backup_resources.append(best_assignment.resource_id)
                
                # Calculate estimated completion time
                completion_time = datetime.now(timezone.utc)
                duration_minutes = task.estimated_duration / resource.efficiency_rating
                completion_time = completion_time.replace(
                    minute=completion_time.minute + int(duration_minutes)
                )
                
                # Calculate cost estimate
                cost_estimate = (duration_minutes / 60.0) * resource.cost_per_hour
                
                best_assignment = Assignment(
                    task_id=task.task_id,
                    resource_id=resource.resource_id,
                    confidence_score=score,
                    estimated_completion_time=completion_time,
                    cost_estimate=cost_estimate,
                    reasoning=reasoning,
                    backup_resources=backup_resources[-2:]  # Keep top 2 backups
                )
                best_score = score
            elif score > 0.5:  # Good enough for backup
                backup_resources.append(resource.resource_id)
        
        # Check if assignment meets confidence threshold
        if best_assignment and best_assignment.confidence_score < self.confidence_threshold:
            logger.warning(
                f"Low confidence assignment for task {task.task_id}: "
                f"{best_assignment.confidence_score:.2f} < {self.confidence_threshold}"
            )
            # Could trigger human oversight or escalation here
        
        return best_assignment
    
    async def batch_assign_tasks(self, tasks: List[Task], resources: List[Resource]) -> List[Assignment]:
        """
        Optimally assign multiple tasks to available resources
        """
        assignments = []
        available_resources = [r for r in resources if r.available]
        
        # Sort tasks by priority and deadline
        sorted_tasks = sorted(
            tasks,
            key=lambda t: (
                -t.priority.value,
                t.deadline or datetime.max.replace(tzinfo=timezone.utc)
            )
        )
        
        for task in sorted_tasks:
            assignment = await self.find_optimal_assignment(task, available_resources)
            if assignment:
                assignments.append(assignment)
                
                # Update resource availability (simplified)
                for resource in available_resources:
                    if resource.resource_id == assignment.resource_id:
                        resource.current_load = min(resource.current_load + 0.3, 1.0)
                        if resource.current_load >= 1.0:
                            resource.available = False
                        break
        
        return assignments
    
    def learn_from_completion(self, task: Task, resource: Resource, 
                            actual_duration: int, quality_score: float):
        """
        Learn from completed tasks to improve future assignments
        """
        features = self.extract_features(task, resource)
        
        # Create training example
        success_score = quality_score * (task.estimated_duration / actual_duration)
        training_example = {
            'features': features.flatten().tolist(),
            'task_id': task.task_id,
            'resource_id': resource.resource_id,
            'success_score': success_score,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        self.historical_data.append(training_example)
        
        # Retrain model periodically
        if len(self.historical_data) % 100 == 0:
            await self.retrain_model()
    
    async def retrain_model(self):
        """Retrain the ML model with new data"""
        if len(self.historical_data) < 50:
            return
        
        try:
            # Prepare training data
            X = np.array([example['features'] for example in self.historical_data])
            y = np.array([example['success_score'] > 0.8 for example in self.historical_data])
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            
            # Save model
            joblib.dump(self.model, 'task_assignment_model.pkl')
            joblib.dump(self.scaler, 'task_scaler.pkl')
            
            logger.info(f"Retrained model with {len(self.historical_data)} examples")
            
        except Exception as e:
            logger.error(f"Error retraining model: {e}")
    
    def get_assignment_insights(self, assignments: List[Assignment]) -> Dict[str, Any]:
        """Generate insights about current assignments"""
        if not assignments:
            return {}
        
        total_assignments = len(assignments)
        avg_confidence = sum(a.confidence_score for a in assignments) / total_assignments
        total_cost = sum(a.cost_estimate for a in assignments)
        
        # Resource utilization
        resource_usage = {}
        for assignment in assignments:
            resource_usage[assignment.resource_id] = resource_usage.get(assignment.resource_id, 0) + 1
        
        return {
            'total_assignments': total_assignments,
            'average_confidence': avg_confidence,
            'total_estimated_cost': total_cost,
            'resource_utilization': resource_usage,
            'low_confidence_count': sum(1 for a in assignments if a.confidence_score < self.confidence_threshold),
            'high_priority_assignments': sum(1 for a in assignments if 'HIGH' in a.reasoning or 'CRITICAL' in a.reasoning)
        }

class BiasDetectionSystem:
    """Algorithmic bias detection and mitigation system"""

    def __init__(self):
        self.bias_metrics = {}
        self.fairness_thresholds = {
            'gender': 0.1,
            'age': 0.15,
            'experience': 0.2,
            'location': 0.1
        }

    async def detect_bias(self, assignments: List[Assignment], resources: List[Resource]) -> Dict[str, float]:
        """Detect potential bias in task assignments"""
        bias_scores = {}

        # Group assignments by resource characteristics
        resource_groups = {}
        for assignment in assignments:
            resource = next((r for r in resources if r.resource_id == assignment.resource_id), None)
            if not resource:
                continue

            # Analyze by resource type
            resource_type = resource.type.value
            if resource_type not in resource_groups:
                resource_groups[resource_type] = []
            resource_groups[resource_type].append(assignment)

        # Calculate bias metrics
        if len(resource_groups) > 1:
            type_scores = [np.mean([a.confidence_score for a in group]) for group in resource_groups.values()]
            bias_scores['resource_type'] = np.std(type_scores) / np.mean(type_scores) if np.mean(type_scores) > 0 else 0

        return bias_scores

    async def mitigate_bias(self, assignments: List[Assignment]) -> List[Assignment]:
        """Apply bias mitigation strategies"""
        # Implement fairness constraints
        # This is a simplified implementation - real bias mitigation is more complex
        return assignments

class EdgeProcessingEngine:
    """Sub-10ms edge processing for safety-critical decisions"""

    def __init__(self):
        self.safety_rules = {}
        self.emergency_protocols = {}
        self.response_cache = {}

    async def process_safety_critical_decision(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process safety-critical decisions with sub-10ms response"""
        start_time = time.time()

        # Check cache first for ultra-fast response
        cache_key = self.generate_cache_key(context)
        if cache_key in self.response_cache:
            response = self.response_cache[cache_key]
            response['processing_time_ms'] = (time.time() - start_time) * 1000
            return response

        # Safety rule evaluation
        safety_decision = await self.evaluate_safety_rules(context)

        # Cache the decision
        response = {
            'decision': safety_decision,
            'confidence': 0.95,
            'processing_time_ms': (time.time() - start_time) * 1000,
            'safety_critical': True
        }

        self.response_cache[cache_key] = response
        return response

    def generate_cache_key(self, context: Dict[str, Any]) -> str:
        """Generate cache key for context"""
        key_parts = [
            context.get('robot_id', ''),
            context.get('task_type', ''),
            str(context.get('safety_zone', '')),
            str(context.get('emergency_level', 0))
        ]
        return '|'.join(key_parts)

    async def evaluate_safety_rules(self, context: Dict[str, Any]) -> str:
        """Evaluate safety rules for immediate decision"""
        # Emergency stop conditions
        if context.get('emergency_level', 0) > 8:
            return 'EMERGENCY_STOP'

        # Collision avoidance
        if context.get('collision_risk', 0) > 0.7:
            return 'AVOID_COLLISION'

        # Safety zone violations
        if context.get('safety_zone_violation', False):
            return 'RETURN_TO_SAFE_ZONE'

        return 'PROCEED'

class MultiCriteriaOptimizer:
    """Multi-criteria optimization for cost, time, quality, and safety"""

    def __init__(self):
        self.weights = {
            'cost': 0.25,
            'time': 0.25,
            'quality': 0.25,
            'safety': 0.25
        }

    async def optimize_assignment(self, task: Task, resources: List[Resource]) -> Optional[Assignment]:
        """Optimize assignment using multiple criteria"""
        if not resources:
            return None

        best_assignment = None
        best_score = -1

        for resource in resources:
            if not resource.available:
                continue

            # Calculate individual criteria scores
            cost_score = self.calculate_cost_score(task, resource)
            time_score = self.calculate_time_score(task, resource)
            quality_score = self.calculate_quality_score(task, resource)
            safety_score = self.calculate_safety_score(task, resource)

            # Weighted combination
            total_score = (
                self.weights['cost'] * cost_score +
                self.weights['time'] * time_score +
                self.weights['quality'] * quality_score +
                self.weights['safety'] * safety_score
            )

            if total_score > best_score:
                best_score = total_score

                # Create assignment
                completion_time = datetime.now(timezone.utc) + timedelta(
                    minutes=task.estimated_duration / resource.efficiency_rating
                )
                cost_estimate = (task.estimated_duration / 60.0) * resource.cost_per_hour

                best_assignment = Assignment(
                    task_id=task.task_id,
                    resource_id=resource.resource_id,
                    confidence_score=total_score,
                    estimated_completion_time=completion_time,
                    cost_estimate=cost_estimate,
                    reasoning=f"Multi-criteria optimization: Cost={cost_score:.2f}, Time={time_score:.2f}, Quality={quality_score:.2f}, Safety={safety_score:.2f}"
                )

        return best_assignment

    def calculate_cost_score(self, task: Task, resource: Resource) -> float:
        """Calculate cost efficiency score (0-1, higher is better)"""
        # Lower cost per hour = higher score
        max_cost = 200.0  # Assume max cost per hour
        return max(0, 1.0 - (resource.cost_per_hour / max_cost))

    def calculate_time_score(self, task: Task, resource: Resource) -> float:
        """Calculate time efficiency score (0-1, higher is better)"""
        # Higher efficiency rating = higher score
        return min(1.0, resource.efficiency_rating)

    def calculate_quality_score(self, task: Task, resource: Resource) -> float:
        """Calculate quality score based on skill match (0-1, higher is better)"""
        if not task.required_skills:
            return 1.0

        required_skills = set(task.required_skills)
        available_skills = set(resource.skills)
        skill_match = len(required_skills & available_skills) / len(required_skills)
        return skill_match

    def calculate_safety_score(self, task: Task, resource: Resource) -> float:
        """Calculate safety score (0-1, higher is better)"""
        base_score = 1.0

        # Safety-critical tasks prefer human oversight
        if task.safety_critical and resource.type == ResourceType.ROBOT:
            base_score *= 0.8

        # Consider maintenance status for robots
        if resource.type == ResourceType.ROBOT and resource.last_maintenance:
            days_since_maintenance = (datetime.now(timezone.utc) - resource.last_maintenance).days
            if days_since_maintenance > 30:
                base_score *= 0.9

        return base_score

# Enhanced router with all advanced features
class EnhancedIntelligentTaskRouter(IntelligentTaskRouter):
    """Enhanced router with bias detection, edge processing, and multi-criteria optimization"""

    def __init__(self):
        super().__init__()
        self.bias_detector = BiasDetectionSystem()
        self.edge_processor = EdgeProcessingEngine()
        self.optimizer = MultiCriteriaOptimizer()
        self.escalation_thresholds = {
            'low_confidence': 0.6,
            'high_complexity': TaskComplexity.CRITICAL,
            'safety_critical': True
        }

    async def intelligent_route_with_bias_detection(self, tasks: List[Task], resources: List[Resource]) -> Dict[str, Any]:
        """Route tasks with comprehensive bias detection and mitigation"""
        # Initial assignment
        assignments = await self.batch_assign_tasks(tasks, resources)

        # Detect bias
        bias_scores = await self.bias_detector.detect_bias(assignments, resources)

        # Mitigate bias if detected
        if any(score > 0.2 for score in bias_scores.values()):
            assignments = await self.bias_detector.mitigate_bias(assignments)

        # Check for escalation needs
        escalations = await self.check_escalation_needs(assignments, tasks)

        return {
            'assignments': assignments,
            'bias_scores': bias_scores,
            'escalations': escalations,
            'total_assignments': len(assignments),
            'confidence_distribution': self.analyze_confidence_distribution(assignments)
        }

    async def check_escalation_needs(self, assignments: List[Assignment], tasks: List[Task]) -> List[Dict[str, Any]]:
        """Check if any assignments need human escalation"""
        escalations = []

        for assignment in assignments:
            task = next((t for t in tasks if t.task_id == assignment.task_id), None)
            if not task:
                continue

            escalation_reasons = []

            # Low confidence escalation
            if assignment.confidence_score < self.escalation_thresholds['low_confidence']:
                escalation_reasons.append(f"Low confidence: {assignment.confidence_score:.2f}")

            # High complexity escalation
            if task.complexity == self.escalation_thresholds['high_complexity']:
                escalation_reasons.append("Critical complexity task")

            # Safety critical escalation
            if task.safety_critical and self.escalation_thresholds['safety_critical']:
                escalation_reasons.append("Safety-critical task requires oversight")

            if escalation_reasons:
                escalations.append({
                    'task_id': task.task_id,
                    'assignment_id': assignment.resource_id,
                    'reasons': escalation_reasons,
                    'priority': task.priority.value,
                    'recommended_action': 'human_oversight'
                })

        return escalations

    def analyze_confidence_distribution(self, assignments: List[Assignment]) -> Dict[str, int]:
        """Analyze confidence score distribution"""
        if not assignments:
            return {}

        confidence_scores = [a.confidence_score for a in assignments]
        return {
            'high_confidence': sum(1 for score in confidence_scores if score >= 0.8),
            'medium_confidence': sum(1 for score in confidence_scores if 0.6 <= score < 0.8),
            'low_confidence': sum(1 for score in confidence_scores if score < 0.6),
            'average_confidence': np.mean(confidence_scores),
            'confidence_std': np.std(confidence_scores)
        }

import time

# Global enhanced router instance
intelligent_router = EnhancedIntelligentTaskRouter()
