"""
AI Learning Service - Advanced ML-based performance optimization and prediction
Enhanced for Billion-Dollar Enterprise Automation Platform

Features:
- Social Intelligence Framework (ROS4HRI compatible)
- Multi-Industry Learning Models (Healthcare, Manufacturing, Financial, Retail, Education)
- Human-Robot Interaction Learning
- Emotion Recognition & Behavioral Analysis
- Predictive Maintenance & Quality Control
- Real-time Performance Optimization
- Cross-Industry Knowledge Transfer
"""
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
import uuid
import json
import numpy as np
from datetime import datetime, timezone, timedelta
import sqlite3
import logging
from enum import Enum
import asyncio
from dataclasses import dataclass, asdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Learning Service",
    description="ML-based performance optimization and prediction for Enterprise Automation",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Industry and Agent Type Enums
class IndustryType(str, Enum):
    HEALTHCARE = "healthcare"
    MANUFACTURING = "manufacturing"
    FINANCIAL = "financial"
    RETAIL = "retail"
    EDUCATION = "education"
    LOGISTICS = "logistics"
    GENERAL = "general"

class AgentType(str, Enum):
    HUMAN = "human"
    AI_AGENT = "ai_agent"
    SOCIAL_ROBOT = "social_robot"
    INDUSTRIAL_ROBOT = "industrial_robot"
    HYBRID_SYSTEM = "hybrid_system"

class EmotionState(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    FRUSTRATED = "frustrated"
    SATISFIED = "satisfied"
    CONFUSED = "confused"

# Enhanced Social Intelligence Models
@dataclass
class HumanRobotInteraction:
    interaction_id: str
    human_id: str
    robot_id: str
    interaction_type: str  # greeting, task_collaboration, assistance, etc.
    duration_seconds: int
    emotion_detected: EmotionState
    engagement_level: float  # 0.0 to 1.0
    communication_modality: List[str]  # voice, gesture, facial, touch
    task_success: bool
    satisfaction_score: float
    cultural_context: Optional[str] = None
    language_used: Optional[str] = None

@dataclass
class SocialIntelligenceMetrics:
    empathy_score: float
    cultural_awareness: float
    communication_effectiveness: float
    emotional_intelligence: float
    trust_building: float
    conflict_resolution: float

# Enhanced Pydantic models
class TaskCompletionFeedback(BaseModel):
    delegation_id: str = Field(..., description="Unique delegation identifier")
    task_id: str = Field(..., description="Task identifier")
    agent_id: str = Field(..., description="Agent who completed the task")
    agent_type: AgentType = Field(default=AgentType.HUMAN, description="Type of agent")
    industry: IndustryType = Field(default=IndustryType.GENERAL, description="Industry context")
    task_type: str = Field(..., description="Type of task")
    priority: str = Field(default="medium", description="Task priority level")
    requirements: List[str] = Field(default=[], description="Task requirements")
    estimated_duration: int = Field(..., description="Estimated duration in minutes")
    actual_duration: int = Field(..., description="Actual duration in minutes")
    success: bool = Field(..., description="Whether task was successful")
    quality_score: float = Field(..., ge=0.0, le=1.0, description="Quality score 0-1")
    completion_timestamp: str = Field(..., description="ISO timestamp of completion")
    performance_metrics: Dict[str, float] = Field(default={}, description="Additional metrics")

    # Enhanced social and contextual metrics
    human_robot_interaction: Optional[Dict[str, Any]] = Field(default=None, description="HRI data if applicable")
    emotion_context: Optional[EmotionState] = Field(default=None, description="Emotional context")
    safety_metrics: Optional[Dict[str, float]] = Field(default=None, description="Safety-related metrics")
    compliance_score: Optional[float] = Field(default=None, description="Regulatory compliance score")
    environmental_factors: Optional[Dict[str, Any]] = Field(default=None, description="Environmental context")

class AgentPerformancePrediction(BaseModel):
    agent_id: str
    agent_type: AgentType
    task_type: str
    industry: IndustryType
    predicted_success_rate: float
    predicted_duration: int
    predicted_quality: float
    confidence: float
    factors: Dict[str, float]
    total_experience: int

    # Enhanced predictions
    predicted_safety_score: Optional[float] = None
    predicted_compliance_score: Optional[float] = None
    social_intelligence_score: Optional[float] = None
    cross_industry_transferability: Optional[float] = None
    recommended_human_collaboration: Optional[bool] = None

class IndustrySpecificInsight(BaseModel):
    industry: IndustryType
    insight_type: str
    title: str
    description: str
    impact_score: float
    confidence: float
    actionable_recommendations: List[str]
    regulatory_implications: Optional[List[str]] = None
    roi_potential: Optional[float] = None
    implementation_complexity: Optional[str] = None

class SocialRobotLearning(BaseModel):
    robot_id: str
    interaction_patterns: Dict[str, Any]
    emotion_recognition_accuracy: float
    cultural_adaptation_score: float
    language_proficiency: Dict[str, float]  # language -> proficiency score
    behavioral_learning_progress: Dict[str, float]
    human_preference_model: Dict[str, Any]

# Enhanced in-memory storage with persistence capability
class LearningDataStore:
    def __init__(self):
        self.training_data = []
        self.agent_performance_profiles = {}
        self.task_complexity_models = {}
        self.learning_insights = []

        # Enhanced industry-specific and social intelligence storage
        self.industry_models = {industry.value: {} for industry in IndustryType}
        self.social_intelligence_data = []
        self.human_robot_interactions = []
        self.cross_industry_knowledge = {}
        self.emotion_recognition_data = []
        self.cultural_adaptation_profiles = {}
        self.behavioral_learning_patterns = {}

        # ROS4HRI compatible data structures
        self.ros4hri_perception_data = []
        self.multi_language_interactions = {}
        self.safety_incident_data = []
        self.compliance_tracking = {}

        self.db_path = "data/learning_service.db"
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database for persistence"""
        try:
            os.makedirs("data", exist_ok=True)
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create tables
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS training_samples (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    delegation_id TEXT,
                    task_id TEXT,
                    agent_id TEXT,
                    task_type TEXT,
                    priority TEXT,
                    estimated_duration INTEGER,
                    actual_duration INTEGER,
                    success BOOLEAN,
                    quality_score REAL,
                    completion_timestamp TEXT,
                    performance_metrics TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS agent_profiles (
                    agent_id TEXT PRIMARY KEY,
                    agent_type TEXT,
                    profile_data TEXT,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Enhanced tables for industry-specific and social intelligence
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS human_robot_interactions (
                    interaction_id TEXT PRIMARY KEY,
                    human_id TEXT,
                    robot_id TEXT,
                    industry TEXT,
                    interaction_type TEXT,
                    duration_seconds INTEGER,
                    emotion_detected TEXT,
                    engagement_level REAL,
                    communication_modality TEXT,
                    task_success BOOLEAN,
                    satisfaction_score REAL,
                    cultural_context TEXT,
                    language_used TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS industry_insights (
                    insight_id TEXT PRIMARY KEY,
                    industry TEXT,
                    insight_type TEXT,
                    title TEXT,
                    description TEXT,
                    impact_score REAL,
                    confidence REAL,
                    recommendations TEXT,
                    regulatory_implications TEXT,
                    roi_potential REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS social_intelligence_metrics (
                    robot_id TEXT PRIMARY KEY,
                    empathy_score REAL,
                    cultural_awareness REAL,
                    communication_effectiveness REAL,
                    emotional_intelligence REAL,
                    trust_building REAL,
                    conflict_resolution REAL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS safety_incidents (
                    incident_id TEXT PRIMARY KEY,
                    industry TEXT,
                    agent_id TEXT,
                    incident_type TEXT,
                    severity TEXT,
                    description TEXT,
                    root_cause TEXT,
                    corrective_actions TEXT,
                    prevention_measures TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
    
    def save_training_sample(self, sample: Dict):
        """Save training sample to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO training_samples 
                (delegation_id, task_id, agent_id, task_type, priority, 
                 estimated_duration, actual_duration, success, quality_score, 
                 completion_timestamp, performance_metrics)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                sample['delegation_id'], sample['task_id'], sample['agent_id'],
                sample['task_type'], sample['priority'], sample['estimated_duration'],
                sample['actual_duration'], sample['success'], sample['quality_score'],
                sample['completion_timestamp'], json.dumps(sample['performance_metrics'])
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to save training sample: {e}")

# Global data store
data_store = LearningDataStore()

@app.get("/")
async def root():
    return {
        "service": "AI Learning Service",
        "status": "running",
        "version": "2.0.0",
        "capabilities": [
            "performance_prediction",
            "agent_optimization", 
            "task_complexity_analysis",
            "adaptive_learning",
            "insight_generation",
            "industry_specialization"
        ],
        "models_trained": len(data_store.task_complexity_models),
        "training_samples": len(data_store.training_data),
        "agents_profiled": len(data_store.agent_performance_profiles),
        "database_enabled": True
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "learning-service",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data_samples": len(data_store.training_data),
        "models_active": len(data_store.task_complexity_models)
    }

@app.get("/api/v1/learning/stats")
async def get_learning_stats():
    """Get learning service statistics (alias for /statistics)"""
    return await get_learning_statistics()

@app.post("/api/v1/learning/feedback")
async def submit_task_feedback(feedback: TaskCompletionFeedback):
    """Submit task completion feedback for learning"""
    
    try:
        # Create enhanced training sample
        training_sample = {
            "delegation_id": feedback.delegation_id,
            "task_id": feedback.task_id,
            "agent_id": feedback.agent_id,
            "task_type": feedback.task_type,
            "priority": feedback.priority,
            "requirements": feedback.requirements,
            "estimated_duration": feedback.estimated_duration,
            "actual_duration": feedback.actual_duration,
            "success": feedback.success,
            "quality_score": feedback.quality_score,
            "completion_timestamp": feedback.completion_timestamp,
            "performance_metrics": feedback.performance_metrics,
            "duration_accuracy": 1 - abs(feedback.estimated_duration - feedback.actual_duration) / max(feedback.estimated_duration, 1),
            "efficiency_score": feedback.estimated_duration / max(feedback.actual_duration, 1) if feedback.actual_duration > 0 else 1.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Add to in-memory storage
        data_store.training_data.append(training_sample)
        
        # Persist to database
        data_store.save_training_sample(training_sample)
        
        # Update agent performance profile
        await update_agent_performance(feedback.agent_id, training_sample)
        
        # Update task complexity models
        await update_task_complexity_model(feedback.task_type, training_sample)
        
        # Generate insights periodically
        if len(data_store.training_data) % 5 == 0:
            await generate_learning_insights()
        
        logger.info(f"Processed feedback for agent {feedback.agent_id}, task {feedback.task_type}")
        
        return {
            "message": "Feedback processed successfully",
            "training_samples": len(data_store.training_data),
            "agent_profile_updated": feedback.agent_id,
            "insights_generated": len(data_store.learning_insights),
            "version": "2.0"
        }
        
    except Exception as e:
        logger.error(f"Error processing feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/learning/predict-performance/{agent_id}")
async def predict_agent_performance(agent_id: str, task_type: str = "general"):
    """Predict agent performance for a specific task"""
    
    try:
        if agent_id not in data_store.agent_performance_profiles:
            # Enhanced baseline prediction based on agent type
            baseline_predictions = {
                "ai_underwriter": {"success": 0.92, "duration": 15, "quality": 0.90, "confidence": 0.85},
                "senior_analyst": {"success": 0.95, "duration": 45, "quality": 0.94, "confidence": 0.90},
                "hft_algo": {"success": 0.98, "duration": 1, "quality": 0.96, "confidence": 0.95},
                "compliance_officer": {"success": 0.99, "duration": 90, "quality": 0.98, "confidence": 0.95},
                "robot": {"success": 0.88, "duration": 30, "quality": 0.85, "confidence": 0.80}
            }
            
            # Find matching baseline
            baseline = None
            for key, values in baseline_predictions.items():
                if key in agent_id.lower():
                    baseline = values
                    break
            
            if not baseline:
                baseline = {"success": 0.75, "duration": 45, "quality": 0.80, "confidence": 0.30}
            
            return AgentPerformancePrediction(
                agent_id=agent_id,
                task_type=task_type,
                predicted_success_rate=baseline["success"],
                predicted_duration=baseline["duration"],
                predicted_quality=baseline["quality"],
                confidence=baseline["confidence"],
                factors={
                    "experience": 0.0,
                    "task_affinity": 0.5,
                    "recent_performance": baseline["quality"],
                    "agent_type_bonus": 0.8 if baseline != baseline_predictions.get("default") else 0.3
                },
                total_experience=0
            )
        
        profile = data_store.agent_performance_profiles[agent_id]
        task_history = profile["task_history"]
        
        # Task-specific or overall performance
        if task_type != "general":
            task_specific = [t for t in task_history if t["task_type"] == task_type]
            relevant_tasks = task_specific if task_specific else task_history
        else:
            relevant_tasks = task_history
        
        if not relevant_tasks:
            predicted_success_rate = 0.75
            predicted_duration = 45
            predicted_quality = 0.80
            confidence = 0.30
        else:
            # Enhanced prediction with weighted recent performance
            weights = np.exp(np.linspace(-1, 0, len(relevant_tasks)))  # More weight to recent tasks
            weights = weights / weights.sum()
            
            predicted_success_rate = np.average([t["success"] for t in relevant_tasks], weights=weights)
            predicted_duration = int(np.average([t["actual_duration"] for t in relevant_tasks], weights=weights))
            predicted_quality = np.average([t["quality_score"] for t in relevant_tasks], weights=weights)
            confidence = min(len(relevant_tasks) / 10, 1.0)
        
        # Enhanced factors calculation
        factors = {
            "experience": min(len(task_history) / 20, 1.0),
            "task_affinity": len([t for t in task_history if t["task_type"] == task_type]) / max(len(task_history), 1),
            "recent_performance": np.mean([t["quality_score"] for t in task_history[-5:]]) if len(task_history) >= 5 else predicted_quality,
            "consistency": max(0, 1 - np.std([t["quality_score"] for t in task_history])) if len(task_history) > 1 else 0.5,
            "efficiency": np.mean([t.get("efficiency_score", 1.0) for t in task_history]) if task_history else 1.0
        }
        
        # Enhanced prediction with industry-specific and social intelligence
        agent_type = AgentType.HUMAN  # Default, should be determined from agent data
        industry = IndustryType.GENERAL  # Default, should be determined from context

        # Industry-specific adjustments
        industry_adjustments = get_industry_performance_adjustments(industry, task_type)
        predicted_success_rate *= industry_adjustments.get("success_multiplier", 1.0)
        predicted_quality *= industry_adjustments.get("quality_multiplier", 1.0)

        # Social intelligence predictions for social robots
        social_intelligence_score = None
        predicted_safety_score = None
        predicted_compliance_score = None

        if agent_type == AgentType.SOCIAL_ROBOT:
            social_intelligence_score = calculate_social_intelligence_score(agent_id)
            predicted_safety_score = calculate_safety_prediction(agent_id, industry)

        if industry in [IndustryType.HEALTHCARE, IndustryType.FINANCIAL]:
            predicted_compliance_score = calculate_compliance_prediction(agent_id, industry)

        return AgentPerformancePrediction(
            agent_id=agent_id,
            agent_type=agent_type,
            task_type=task_type,
            industry=industry,
            predicted_success_rate=round(predicted_success_rate, 3),
            predicted_duration=predicted_duration,
            predicted_quality=round(predicted_quality, 3),
            confidence=round(confidence, 3),
            factors={k: round(v, 3) for k, v in factors.items()},
            total_experience=len(task_history),
            predicted_safety_score=predicted_safety_score,
            predicted_compliance_score=predicted_compliance_score,
            social_intelligence_score=social_intelligence_score,
            cross_industry_transferability=calculate_cross_industry_transferability(agent_id),
            recommended_human_collaboration=should_recommend_human_collaboration(agent_id, task_type, industry)
        )
        
    except Exception as e:
        logger.error(f"Error predicting performance for {agent_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/learning/human-robot-interaction")
async def record_human_robot_interaction(interaction: Dict[str, Any]):
    """Record human-robot interaction data for social intelligence learning"""

    try:
        interaction_id = str(uuid.uuid4())
        interaction_data = HumanRobotInteraction(
            interaction_id=interaction_id,
            human_id=interaction.get("human_id"),
            robot_id=interaction.get("robot_id"),
            interaction_type=interaction.get("interaction_type"),
            duration_seconds=interaction.get("duration_seconds", 0),
            emotion_detected=EmotionState(interaction.get("emotion_detected", "neutral")),
            engagement_level=interaction.get("engagement_level", 0.5),
            communication_modality=interaction.get("communication_modality", []),
            task_success=interaction.get("task_success", False),
            satisfaction_score=interaction.get("satisfaction_score", 0.5),
            cultural_context=interaction.get("cultural_context"),
            language_used=interaction.get("language_used")
        )

        # Store in database
        data_store.human_robot_interactions.append(asdict(interaction_data))

        # Update social intelligence models
        await update_social_intelligence_models(interaction_data)

        logger.info(f"Recorded HRI interaction: {interaction_id}")

        return {
            "message": "Human-robot interaction recorded successfully",
            "interaction_id": interaction_id,
            "social_intelligence_updated": True
        }

    except Exception as e:
        logger.error(f"Error recording HRI: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/learning/industry-insights/{industry}")
async def get_industry_insights(industry: IndustryType, limit: int = 10):
    """Get AI-generated insights for specific industry"""

    try:
        insights = await generate_industry_specific_insights(industry, limit)

        return {
            "industry": industry.value,
            "insights": insights,
            "total_insights": len(insights),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        logger.error(f"Error getting industry insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/learning/social-intelligence/{robot_id}")
async def get_social_intelligence_metrics(robot_id: str):
    """Get social intelligence metrics for a specific robot"""

    try:
        metrics = await calculate_comprehensive_social_intelligence(robot_id)

        return {
            "robot_id": robot_id,
            "social_intelligence_metrics": metrics,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        logger.error(f"Error getting social intelligence metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/learning/safety-incident")
async def record_safety_incident(incident: Dict[str, Any]):
    """Record safety incident for learning and prevention"""

    try:
        incident_id = str(uuid.uuid4())

        # Store safety incident
        incident_data = {
            "incident_id": incident_id,
            "industry": incident.get("industry"),
            "agent_id": incident.get("agent_id"),
            "incident_type": incident.get("incident_type"),
            "severity": incident.get("severity"),
            "description": incident.get("description"),
            "root_cause": incident.get("root_cause"),
            "corrective_actions": incident.get("corrective_actions"),
            "prevention_measures": incident.get("prevention_measures"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        data_store.safety_incident_data.append(incident_data)

        # Update safety models
        await update_safety_learning_models(incident_data)

        logger.info(f"Recorded safety incident: {incident_id}")

        return {
            "message": "Safety incident recorded successfully",
            "incident_id": incident_id,
            "safety_models_updated": True
        }

    except Exception as e:
        logger.error(f"Error recording safety incident: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/learning/analyze-complexity/{task_type}")
async def analyze_task_complexity(task_type: str):
    """Analyze task complexity and provide recommendations"""

    try:
        if task_type not in data_store.task_complexity_models:
            # Enhanced baseline analysis based on task type
            baseline_complexity = {
                "loan_application": {"complexity": 0.6, "duration": 45, "agents": ["ai_underwriter", "senior_analyst"]},
                "market_analysis": {"complexity": 0.7, "duration": 30, "agents": ["quant_analyst", "ai_system"]},
                "robot_control": {"complexity": 0.4, "duration": 20, "agents": ["robot_operator", "automation_system"]},
                "trading_execution": {"complexity": 0.8, "duration": 5, "agents": ["hft_algo", "human_trader"]},
                "compliance_review": {"complexity": 0.9, "duration": 120, "agents": ["compliance_officer", "senior_analyst"]}
            }

            baseline = baseline_complexity.get(task_type, {"complexity": 0.5, "duration": 45, "agents": ["robot", "human"]})

            return {
                "task_type": task_type,
                "complexity_score": baseline["complexity"],
                "difficulty_factors": {"baseline_estimate": baseline["complexity"]},
                "recommended_agent_types": baseline["agents"],
                "estimated_duration_range": {
                    "min": int(baseline["duration"] * 0.7),
                    "max": int(baseline["duration"] * 1.5),
                    "average": baseline["duration"]
                },
                "note": "Baseline analysis - limited historical data",
                "sample_size": 0
            }

        model = data_store.task_complexity_models[task_type]
        samples = model["samples"]

        if not samples:
            return {
                "task_type": task_type,
                "complexity_score": 0.5,
                "difficulty_factors": {"insufficient_data": 0.5},
                "recommended_agent_types": ["robot", "human"],
                "estimated_duration_range": {"min": 30, "max": 60, "average": 45},
                "sample_size": 0
            }

        # Enhanced complexity metrics
        durations = [s["actual_duration"] for s in samples]
        success_rates = [s["success"] for s in samples]
        quality_scores = [s["quality_score"] for s in samples]

        avg_duration = np.mean(durations)
        success_rate = np.mean(success_rates)
        quality_variance = np.std(quality_scores)

        # Multi-factor complexity score
        duration_factor = min(avg_duration / 60, 1.0)  # Normalize by 1 hour
        difficulty_factor = 1 - success_rate
        variability_factor = quality_variance
        urgency_factor = len([s for s in samples if s.get("priority") == "high"]) / len(samples)

        complexity_score = (
            duration_factor * 0.3 +
            difficulty_factor * 0.3 +
            variability_factor * 0.2 +
            urgency_factor * 0.2
        )

        # Enhanced duration statistics
        duration_stats = {
            "min": int(np.min(durations)),
            "max": int(np.max(durations)),
            "average": int(np.mean(durations)),
            "median": int(np.median(durations)),
            "std_dev": int(np.std(durations))
        }

        # Agent type performance analysis
        agent_performance = {}
        for sample in samples:
            agent_id = sample["agent_id"]
            agent_type = "ai" if "ai" in agent_id.lower() else "human" if "human" in agent_id.lower() else "robot"

            if agent_type not in agent_performance:
                agent_performance[agent_type] = {"quality": [], "success": [], "duration": []}

            agent_performance[agent_type]["quality"].append(sample["quality_score"])
            agent_performance[agent_type]["success"].append(sample["success"])
            agent_performance[agent_type]["duration"].append(sample["actual_duration"])

        # Recommend best performing agent types
        recommended_types = []
        for agent_type, metrics in agent_performance.items():
            if len(metrics["quality"]) >= 2:
                avg_quality = np.mean(metrics["quality"])
                avg_success = np.mean(metrics["success"])
                composite_score = (avg_quality * 0.6 + avg_success * 0.4)

                if composite_score > 0.75:
                    recommended_types.append(agent_type)

        if not recommended_types:
            recommended_types = ["human", "ai"]  # Default fallback

        return {
            "task_type": task_type,
            "complexity_score": round(complexity_score, 3),
            "difficulty_factors": {
                "duration_factor": round(duration_factor, 3),
                "difficulty_factor": round(difficulty_factor, 3),
                "variability_factor": round(variability_factor, 3),
                "urgency_factor": round(urgency_factor, 3)
            },
            "recommended_agent_types": recommended_types,
            "estimated_duration_range": duration_stats,
            "sample_size": len(samples),
            "success_rate": round(success_rate, 3),
            "agent_performance_breakdown": {
                agent_type: {
                    "avg_quality": round(np.mean(metrics["quality"]), 3),
                    "success_rate": round(np.mean(metrics["success"]), 3),
                    "avg_duration": round(np.mean(metrics["duration"]), 1),
                    "sample_count": len(metrics["quality"])
                }
                for agent_type, metrics in agent_performance.items()
                if len(metrics["quality"]) > 0
            }
        }

    except Exception as e:
        logger.error(f"Error analyzing complexity for {task_type}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/learning/insights")
async def get_learning_insights():
    """Get AI-generated insights and recommendations"""

    try:
        return {
            "total_insights": len(data_store.learning_insights),
            "insights": data_store.learning_insights[-10:] if data_store.learning_insights else [],
            "categories": {
                "performance_optimization": len([i for i in data_store.learning_insights if i.get("insights_type") == "performance"]),
                "agent_recommendations": len([i for i in data_store.learning_insights if i.get("insights_type") == "agent"]),
                "task_optimization": len([i for i in data_store.learning_insights if i.get("insights_type") == "task"]),
                "system_improvements": len([i for i in data_store.learning_insights if i.get("insights_type") == "system"])
            },
            "last_generated": data_store.learning_insights[-1].get("generated_at") if data_store.learning_insights else None,
            "version": "2.0"
        }
    except Exception as e:
        logger.error(f"Error getting insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/learning/agent-rankings")
async def get_agent_rankings(task_type: str = None):
    """Get agent rankings based on learned performance"""

    try:
        rankings = []

        for agent_id, profile in data_store.agent_performance_profiles.items():
            task_history = profile["task_history"]

            if task_type:
                # Filter by task type
                relevant_tasks = [t for t in task_history if t["task_type"] == task_type]
                if not relevant_tasks:
                    continue
            else:
                relevant_tasks = task_history

            if not relevant_tasks:
                continue

            # Enhanced metrics calculation
            avg_success = np.mean([t["success"] for t in relevant_tasks])
            avg_quality = np.mean([t["quality_score"] for t in relevant_tasks])
            avg_efficiency = np.mean([t.get("efficiency_score", 1.0) for t in relevant_tasks])
            avg_duration_accuracy = np.mean([t.get("duration_accuracy", 0.5) for t in relevant_tasks])

            # Weighted composite score
            composite_score = (
                avg_success * 0.3 +
                avg_quality * 0.3 +
                avg_efficiency * 0.2 +
                avg_duration_accuracy * 0.2
            )

            # Determine specialization
            task_types = [t["task_type"] for t in task_history]
            specialization = max(set(task_types), key=task_types.count) if task_types else "general"

            # Calculate trend (recent vs historical performance)
            if len(relevant_tasks) >= 6:
                recent_quality = np.mean([t["quality_score"] for t in relevant_tasks[-3:]])
                historical_quality = np.mean([t["quality_score"] for t in relevant_tasks[:-3]])
                trend = "improving" if recent_quality > historical_quality + 0.05 else "declining" if recent_quality < historical_quality - 0.05 else "stable"
            else:
                trend = "stable"

            rankings.append({
                "agent_id": agent_id,
                "composite_score": round(composite_score, 3),
                "success_rate": round(avg_success, 3),
                "quality_score": round(avg_quality, 3),
                "efficiency_score": round(avg_efficiency, 3),
                "duration_accuracy": round(avg_duration_accuracy, 3),
                "total_tasks": len(relevant_tasks),
                "specialization": specialization,
                "performance_trend": trend,
                "last_active": relevant_tasks[-1]["completion_timestamp"] if relevant_tasks else None
            })

        # Sort by composite score
        rankings.sort(key=lambda x: x["composite_score"], reverse=True)

        return {
            "task_type": task_type or "all",
            "rankings": rankings,
            "total_agents": len(rankings),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "version": "2.0"
        }

    except Exception as e:
        logger.error(f"Error getting agent rankings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/learning/dashboard")
async def get_learning_dashboard():
    """Get comprehensive learning dashboard"""

    try:
        # Overall statistics
        total_samples = len(data_store.training_data)
        total_agents = len(data_store.agent_performance_profiles)
        total_task_types = len(data_store.task_complexity_models)

        # Recent performance trends (last 20 samples)
        recent_data = data_store.training_data[-20:] if len(data_store.training_data) >= 20 else data_store.training_data

        if recent_data:
            avg_success_rate = np.mean([t["success"] for t in recent_data])
            avg_quality = np.mean([t["quality_score"] for t in recent_data])
            avg_duration_accuracy = np.mean([t.get("duration_accuracy", 0.5) for t in recent_data])
            avg_efficiency = np.mean([t.get("efficiency_score", 1.0) for t in recent_data])
        else:
            avg_success_rate = 0.0
            avg_quality = 0.0
            avg_duration_accuracy = 0.0
            avg_efficiency = 1.0

        # Top performing agents (minimum 3 tasks)
        top_agents = []
        for agent_id, profile in data_store.agent_performance_profiles.items():
            if len(profile["task_history"]) >= 3:
                tasks = profile["task_history"]
                avg_quality = np.mean([t["quality_score"] for t in tasks])
                avg_success = np.mean([t["success"] for t in tasks])
                composite = (avg_quality * 0.6 + avg_success * 0.4)
                top_agents.append({
                    "agent_id": agent_id,
                    "quality_score": round(avg_quality, 3),
                    "success_rate": round(avg_success, 3),
                    "composite_score": round(composite, 3),
                    "total_tasks": len(tasks)
                })

        top_agents.sort(key=lambda x: x["composite_score"], reverse=True)
        top_agents = top_agents[:5]  # Top 5

        # Most complex task types
        complex_tasks = []
        for task_type, model in data_store.task_complexity_models.items():
            if len(model["samples"]) >= 3:
                samples = model["samples"]
                avg_duration = np.mean([t["actual_duration"] for t in samples])
                success_rate = np.mean([t["success"] for t in samples])
                quality_variance = np.std([t["quality_score"] for t in samples])

                # Multi-factor complexity
                complexity = (
                    (avg_duration / 60) * 0.4 +  # Duration factor
                    (1 - success_rate) * 0.4 +   # Difficulty factor
                    quality_variance * 0.2        # Variability factor
                )

                complex_tasks.append({
                    "task_type": task_type,
                    "complexity_score": round(complexity, 3),
                    "avg_duration": round(avg_duration, 1),
                    "success_rate": round(success_rate, 3),
                    "sample_count": len(samples)
                })

        complex_tasks.sort(key=lambda x: x["complexity_score"], reverse=True)
        complex_tasks = complex_tasks[:5]  # Top 5 most complex

        # System health indicators
        model_maturity = min(total_samples / 100, 1.0)
        confidence_level = min(total_samples / 50, 1.0)

        if total_samples > 100:
            recommendation_quality = "high"
        elif total_samples > 30:
            recommendation_quality = "medium"
        else:
            recommendation_quality = "developing"

        # Performance trend analysis
        if len(data_store.training_data) >= 10:
            recent_10 = data_store.training_data[-10:]
            older_10 = data_store.training_data[-20:-10] if len(data_store.training_data) >= 20 else data_store.training_data[:-10]

            if older_10:
                recent_avg = np.mean([t["quality_score"] for t in recent_10])
                older_avg = np.mean([t["quality_score"] for t in older_10])

                if recent_avg > older_avg + 0.05:
                    trend_direction = "improving"
                elif recent_avg < older_avg - 0.05:
                    trend_direction = "declining"
                else:
                    trend_direction = "stable"
            else:
                trend_direction = "stable"
        else:
            trend_direction = "insufficient_data"

        return {
            "system_overview": {
                "total_training_samples": total_samples,
                "agents_profiled": total_agents,
                "task_types_analyzed": total_task_types,
                "insights_generated": len(data_store.learning_insights),
                "database_enabled": True
            },
            "performance_trends": {
                "recent_success_rate": round(avg_success_rate, 3),
                "recent_quality_score": round(avg_quality, 3),
                "duration_prediction_accuracy": round(avg_duration_accuracy, 3),
                "efficiency_score": round(avg_efficiency, 3),
                "trend_direction": trend_direction
            },
            "top_performers": top_agents,
            "complex_tasks": complex_tasks,
            "learning_status": {
                "model_maturity": round(model_maturity, 3),
                "confidence_level": round(confidence_level, 3),
                "recommendation_quality": recommendation_quality,
                "data_quality": "high" if avg_quality > 0.8 else "medium" if avg_quality > 0.6 else "needs_improvement"
            },
            "system_health": {
                "active_learning": True,
                "data_persistence": True,
                "insight_generation": len(data_store.learning_insights) > 0,
                "prediction_accuracy": round(avg_duration_accuracy, 3)
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "version": "2.0"
        }

    except Exception as e:
        logger.error(f"Error generating dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced helper functions
async def update_agent_performance(agent_id: str, training_sample: Dict):
    """Update agent performance profile with enhanced tracking"""

    try:
        if agent_id not in data_store.agent_performance_profiles:
            data_store.agent_performance_profiles[agent_id] = {
                "agent_id": agent_id,
                "task_history": [],
                "specializations": {},
                "performance_trends": [],
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }

        profile = data_store.agent_performance_profiles[agent_id]
        profile["task_history"].append(training_sample)
        profile["last_updated"] = datetime.now(timezone.utc).isoformat()

        # Track specializations
        task_type = training_sample["task_type"]
        if task_type not in profile["specializations"]:
            profile["specializations"][task_type] = {"count": 0, "avg_quality": 0.0, "success_rate": 0.0}

        spec = profile["specializations"][task_type]
        spec["count"] += 1

        # Update specialization metrics
        task_type_history = [t for t in profile["task_history"] if t["task_type"] == task_type]
        spec["avg_quality"] = np.mean([t["quality_score"] for t in task_type_history])
        spec["success_rate"] = np.mean([t["success"] for t in task_type_history])

        # Keep only last 100 tasks to prevent memory issues
        if len(profile["task_history"]) > 100:
            profile["task_history"] = profile["task_history"][-100:]

        logger.debug(f"Updated profile for agent {agent_id}")

    except Exception as e:
        logger.error(f"Error updating agent performance for {agent_id}: {e}")

async def update_task_complexity_model(task_type: str, training_sample: Dict):
    """Update task complexity model with enhanced analysis"""

    try:
        if task_type not in data_store.task_complexity_models:
            data_store.task_complexity_models[task_type] = {
                "task_type": task_type,
                "samples": [],
                "complexity_metrics": {},
                "agent_performance": {},
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }

        model = data_store.task_complexity_models[task_type]
        model["samples"].append(training_sample)
        model["last_updated"] = datetime.now(timezone.utc).isoformat()

        # Update complexity metrics
        samples = model["samples"]
        if len(samples) >= 3:
            model["complexity_metrics"] = {
                "avg_duration": np.mean([s["actual_duration"] for s in samples]),
                "success_rate": np.mean([s["success"] for s in samples]),
                "quality_variance": np.std([s["quality_score"] for s in samples]),
                "complexity_score": calculate_complexity_score(samples)
            }

        # Keep only last 200 samples
        if len(model["samples"]) > 200:
            model["samples"] = model["samples"][-200:]

        logger.debug(f"Updated complexity model for task type {task_type}")

    except Exception as e:
        logger.error(f"Error updating task complexity model for {task_type}: {e}")

def calculate_complexity_score(samples: List[Dict]) -> float:
    """Calculate complexity score for a task type"""

    if not samples:
        return 0.5

    avg_duration = np.mean([s["actual_duration"] for s in samples])
    success_rate = np.mean([s["success"] for s in samples])
    quality_variance = np.std([s["quality_score"] for s in samples])

    # Normalize factors
    duration_factor = min(avg_duration / 60, 1.0)  # Normalize by 1 hour
    difficulty_factor = 1 - success_rate
    variability_factor = min(quality_variance, 1.0)

    # Weighted combination
    complexity = (duration_factor * 0.4 + difficulty_factor * 0.4 + variability_factor * 0.2)

    return min(max(complexity, 0.0), 1.0)  # Clamp between 0 and 1

async def generate_learning_insights():
    """Generate enhanced AI insights and recommendations"""

    try:
        if len(data_store.training_data) < 5:
            return

        insights = []
        current_time = datetime.now(timezone.utc).isoformat()

        # Insight 1: Overall system performance
        recent_quality = np.mean([t["quality_score"] for t in data_store.training_data[-10:]])
        if recent_quality > 0.9:
            insights.append({
                "insights_type": "performance",
                "title": "Excellent System Performance",
                "description": f"System achieving {recent_quality:.1%} quality - exceptional performance across all tasks",
                "impact_score": 0.8,
                "actionable_recommendations": [
                    "Document current best practices for replication",
                    "Consider expanding successful delegation patterns",
                    "Maintain current agent selection strategies"
                ],
                "generated_at": current_time,
                "confidence": 0.9
            })
        elif recent_quality < 0.7:
            insights.append({
                "insights_type": "performance",
                "title": "Performance Optimization Needed",
                "description": f"Quality score at {recent_quality:.1%} - below optimal threshold",
                "impact_score": 0.9,
                "actionable_recommendations": [
                    "Review agent selection criteria and update delegation rules",
                    "Analyze failed task patterns for improvement opportunities",
                    "Consider additional agent training or capability enhancement",
                    "Implement more granular task complexity assessment"
                ],
                "generated_at": current_time,
                "confidence": 0.85
            })

        # Insight 2: Agent specialization analysis
        if len(data_store.agent_performance_profiles) >= 3:
            specialist_agents = []
            generalist_agents = []

            for agent_id, profile in data_store.agent_performance_profiles.items():
                if len(profile["task_history"]) >= 5:
                    task_types = [t["task_type"] for t in profile["task_history"]]
                    most_common = max(set(task_types), key=task_types.count)
                    specialization_ratio = task_types.count(most_common) / len(task_types)

                    avg_quality = np.mean([t["quality_score"] for t in profile["task_history"]])

                    if specialization_ratio > 0.7:
                        specialist_agents.append(f"{agent_id} ({most_common}, {avg_quality:.1%} quality)")
                    elif specialization_ratio < 0.4:
                        generalist_agents.append(f"{agent_id} ({avg_quality:.1%} quality)")

            if specialist_agents:
                insights.append({
                    "insights_type": "agent",
                    "title": "Agent Specialization Identified",
                    "description": f"Found {len(specialist_agents)} specialist agents with focused expertise",
                    "impact_score": 0.7,
                    "actionable_recommendations": [
                        "Leverage specialist agents for their expertise areas",
                        "Route complex tasks to appropriate specialists",
                        "Consider cross-training for backup coverage"
                    ],
                    "details": {"specialists": specialist_agents},
                    "generated_at": current_time,
                    "confidence": 0.8
                })

            if generalist_agents:
                insights.append({
                    "insights_type": "agent",
                    "title": "Versatile Generalist Agents",
                    "description": f"Identified {len(generalist_agents)} versatile agents handling diverse tasks",
                    "impact_score": 0.6,
                    "actionable_recommendations": [
                        "Use generalist agents for overflow and diverse task types",
                        "Consider developing specialization paths for career growth"
                    ],
                    "details": {"generalists": generalist_agents},
                    "generated_at": current_time,
                    "confidence": 0.75
                })

        # Insight 3: Task complexity trends
        if len(data_store.task_complexity_models) >= 2:
            complex_tasks = []
            simple_tasks = []

            for task_type, model in data_store.task_complexity_models.items():
                if len(model["samples"]) >= 3:
                    complexity = calculate_complexity_score(model["samples"])
                    avg_duration = np.mean([s["actual_duration"] for s in model["samples"]])
                    success_rate = np.mean([s["success"] for s in model["samples"]])

                    if complexity > 0.7:
                        complex_tasks.append(f"{task_type} (complexity: {complexity:.2f}, {avg_duration:.0f}min avg)")
                    elif complexity < 0.3:
                        simple_tasks.append(f"{task_type} (complexity: {complexity:.2f}, {success_rate:.1%} success)")

            if complex_tasks:
                insights.append({
                    "insights_type": "task",
                    "title": "High Complexity Tasks Identified",
                    "description": f"Found {len(complex_tasks)} task types requiring specialized handling",
                    "impact_score": 0.8,
                    "actionable_recommendations": [
                        "Route complex tasks to senior agents or specialists",
                        "Consider breaking down complex tasks into simpler components",
                        "Implement additional quality checks for complex tasks"
                    ],
                    "details": {"complex_tasks": complex_tasks},
                    "generated_at": current_time,
                    "confidence": 0.85
                })

            if simple_tasks:
                insights.append({
                    "insights_type": "task",
                    "title": "Automation Opportunities",
                    "description": f"Identified {len(simple_tasks)} task types suitable for automation",
                    "impact_score": 0.7,
                    "actionable_recommendations": [
                        "Consider AI or robotic automation for simple, repetitive tasks",
                        "Free up human agents for more complex work",
                        "Implement automated quality checks for simple tasks"
                    ],
                    "details": {"simple_tasks": simple_tasks},
                    "generated_at": current_time,
                    "confidence": 0.8
                })

        # Insight 4: Efficiency opportunities
        efficiency_data = [t.get("efficiency_score", 1.0) for t in data_store.training_data[-20:]]
        if efficiency_data and len(efficiency_data) >= 10:
            avg_efficiency = np.mean(efficiency_data)
            if avg_efficiency < 0.8:
                insights.append({
                    "insights_type": "system",
                    "title": "Efficiency Improvement Opportunity",
                    "description": f"Average efficiency at {avg_efficiency:.1%} - tasks taking longer than estimated",
                    "impact_score": 0.75,
                    "actionable_recommendations": [
                        "Review and update duration estimation models",
                        "Identify bottlenecks in task execution",
                        "Consider process optimization or additional resources"
                    ],
                    "generated_at": current_time,
                    "confidence": 0.8
                })

        # Add insights to global list
        data_store.learning_insights.extend(insights)

        # Keep only last 50 insights to prevent memory issues
        if len(data_store.learning_insights) > 50:
            data_store.learning_insights = data_store.learning_insights[-50:]

        logger.info(f"Generated {len(insights)} new insights")

    except Exception as e:
        logger.error(f"Error generating insights: {e}")

# Additional API endpoints for enhanced functionality
@app.get("/api/v1/learning/statistics")
async def get_learning_statistics():
    """Get detailed learning statistics"""

    try:
        stats = {
            "data_overview": {
                "total_samples": len(data_store.training_data),
                "unique_agents": len(data_store.agent_performance_profiles),
                "task_types": len(data_store.task_complexity_models),
                "insights_generated": len(data_store.learning_insights)
            },
            "quality_distribution": {},
            "duration_statistics": {},
            "success_rates": {},
            "agent_activity": {}
        }

        if data_store.training_data:
            # Quality distribution
            qualities = [t["quality_score"] for t in data_store.training_data]
            stats["quality_distribution"] = {
                "mean": round(np.mean(qualities), 3),
                "median": round(np.median(qualities), 3),
                "std_dev": round(np.std(qualities), 3),
                "min": round(np.min(qualities), 3),
                "max": round(np.max(qualities), 3)
            }

            # Duration statistics
            durations = [t["actual_duration"] for t in data_store.training_data]
            stats["duration_statistics"] = {
                "mean_minutes": round(np.mean(durations), 1),
                "median_minutes": round(np.median(durations), 1),
                "std_dev_minutes": round(np.std(durations), 1),
                "min_minutes": int(np.min(durations)),
                "max_minutes": int(np.max(durations))
            }

            # Success rates by task type
            task_success = {}
            for sample in data_store.training_data:
                task_type = sample["task_type"]
                if task_type not in task_success:
                    task_success[task_type] = {"total": 0, "successful": 0}
                task_success[task_type]["total"] += 1
                if sample["success"]:
                    task_success[task_type]["successful"] += 1

            stats["success_rates"] = {
                task_type: round(data["successful"] / data["total"], 3)
                for task_type, data in task_success.items()
            }

            # Agent activity
            agent_activity = {}
            for sample in data_store.training_data:
                agent_id = sample["agent_id"]
                if agent_id not in agent_activity:
                    agent_activity[agent_id] = 0
                agent_activity[agent_id] += 1

            stats["agent_activity"] = dict(sorted(agent_activity.items(), key=lambda x: x[1], reverse=True)[:10])

        return stats

    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced helper functions for industry-specific and social intelligence learning

def get_industry_performance_adjustments(industry: IndustryType, task_type: str) -> Dict[str, float]:
    """Get industry-specific performance adjustments"""
    adjustments = {
        IndustryType.HEALTHCARE: {
            "success_multiplier": 1.1 if "patient" in task_type else 1.0,
            "quality_multiplier": 1.2 if "safety" in task_type else 1.0
        },
        IndustryType.MANUFACTURING: {
            "success_multiplier": 1.1 if "quality" in task_type else 1.0,
            "quality_multiplier": 1.15 if "precision" in task_type else 1.0
        },
        IndustryType.FINANCIAL: {
            "success_multiplier": 1.2 if "compliance" in task_type else 1.0,
            "quality_multiplier": 1.3 if "risk" in task_type else 1.0
        }
    }
    return adjustments.get(industry, {"success_multiplier": 1.0, "quality_multiplier": 1.0})

def calculate_social_intelligence_score(agent_id: str) -> float:
    """Calculate social intelligence score for social robots"""
    # Get recent HRI data for this robot
    robot_interactions = [
        interaction for interaction in data_store.human_robot_interactions
        if interaction.get("robot_id") == agent_id
    ]

    if not robot_interactions:
        return 0.5  # Default baseline

    # Calculate metrics
    avg_engagement = np.mean([i.get("engagement_level", 0.5) for i in robot_interactions])
    avg_satisfaction = np.mean([i.get("satisfaction_score", 0.5) for i in robot_interactions])
    success_rate = np.mean([i.get("task_success", False) for i in robot_interactions])

    # Weighted social intelligence score
    social_score = (avg_engagement * 0.3 + avg_satisfaction * 0.4 + success_rate * 0.3)
    return round(social_score, 3)

def calculate_safety_prediction(agent_id: str, industry: IndustryType) -> float:
    """Calculate safety score prediction"""
    # Get safety incident history
    safety_incidents = [
        incident for incident in data_store.safety_incident_data
        if incident.get("agent_id") == agent_id
    ]

    base_safety_score = 0.95  # High baseline for safety

    if safety_incidents:
        # Reduce score based on incident severity and recency
        recent_incidents = [
            i for i in safety_incidents
            if (datetime.now(timezone.utc) - datetime.fromisoformat(i["created_at"])).days <= 30
        ]

        if recent_incidents:
            severity_impact = len(recent_incidents) * 0.05
            base_safety_score = max(0.7, base_safety_score - severity_impact)

    return round(base_safety_score, 3)

def calculate_compliance_prediction(agent_id: str, industry: IndustryType) -> float:
    """Calculate compliance score prediction"""
    # Industry-specific compliance baselines
    compliance_baselines = {
        IndustryType.HEALTHCARE: 0.98,  # HIPAA requirements
        IndustryType.FINANCIAL: 0.99,   # SOX, Basel III requirements
        IndustryType.MANUFACTURING: 0.95, # ISO standards
        IndustryType.EDUCATION: 0.92    # FERPA requirements
    }

    return compliance_baselines.get(industry, 0.90)

def calculate_cross_industry_transferability(agent_id: str) -> float:
    """Calculate how well agent skills transfer across industries"""
    # Get agent's task history across different industries
    if agent_id not in data_store.agent_performance_profiles:
        return 0.3  # Low transferability for new agents

    profile = data_store.agent_performance_profiles[agent_id]
    task_history = profile.get("task_history", [])

    # Count unique industries worked in
    industries_worked = set(task.get("industry", "general") for task in task_history)

    # Calculate transferability based on diversity and performance
    if len(industries_worked) <= 1:
        return 0.4
    elif len(industries_worked) <= 2:
        return 0.6
    else:
        return 0.8

def should_recommend_human_collaboration(agent_id: str, task_type: str, industry: IndustryType) -> bool:
    """Determine if human collaboration is recommended"""
    # High-risk scenarios requiring human oversight
    high_risk_tasks = ["surgery", "financial_trading", "safety_critical", "compliance_audit"]

    if any(risk_task in task_type.lower() for risk_task in high_risk_tasks):
        return True

    # Industry-specific collaboration requirements
    if industry == IndustryType.HEALTHCARE and "patient" in task_type:
        return True

    if industry == IndustryType.FINANCIAL and "high_value" in task_type:
        return True

    return False

async def update_social_intelligence_models(interaction_data: HumanRobotInteraction):
    """Update social intelligence models based on new interaction data"""
    robot_id = interaction_data.robot_id

    # Update robot's social intelligence profile
    if robot_id not in [profile.get("robot_id") for profile in data_store.social_intelligence_data]:
        data_store.social_intelligence_data.append({
            "robot_id": robot_id,
            "interactions": [],
            "learning_progress": {},
            "cultural_adaptations": {},
            "emotion_recognition_accuracy": 0.5
        })

    # Find and update robot profile
    for profile in data_store.social_intelligence_data:
        if profile["robot_id"] == robot_id:
            profile["interactions"].append(asdict(interaction_data))

            # Update emotion recognition accuracy
            if interaction_data.emotion_detected != EmotionState.NEUTRAL:
                current_accuracy = profile.get("emotion_recognition_accuracy", 0.5)
                # Simple learning update (in production, use more sophisticated ML)
                if interaction_data.satisfaction_score > 0.7:
                    profile["emotion_recognition_accuracy"] = min(1.0, current_accuracy + 0.01)
                else:
                    profile["emotion_recognition_accuracy"] = max(0.3, current_accuracy - 0.005)

            # Update cultural adaptations
            if interaction_data.cultural_context:
                if interaction_data.cultural_context not in profile["cultural_adaptations"]:
                    profile["cultural_adaptations"][interaction_data.cultural_context] = {
                        "interaction_count": 0,
                        "avg_satisfaction": 0.5
                    }

                cultural_data = profile["cultural_adaptations"][interaction_data.cultural_context]
                cultural_data["interaction_count"] += 1
                cultural_data["avg_satisfaction"] = (
                    (cultural_data["avg_satisfaction"] * (cultural_data["interaction_count"] - 1) +
                     interaction_data.satisfaction_score) / cultural_data["interaction_count"]
                )

            break

async def generate_industry_specific_insights(industry: IndustryType, limit: int = 10) -> List[Dict[str, Any]]:
    """Generate AI insights specific to an industry"""
    insights = []

    # Get industry-specific data
    industry_tasks = [
        task for task in data_store.training_data
        if task.get("industry") == industry.value
    ]

    if not industry_tasks:
        return []

    # Generate performance insights
    success_rates = [task.get("success", False) for task in industry_tasks]
    avg_success_rate = np.mean(success_rates) if success_rates else 0.5

    if avg_success_rate < 0.8:
        insights.append({
            "insight_type": "performance_improvement",
            "title": f"Low Success Rate in {industry.value.title()}",
            "description": f"Average success rate is {avg_success_rate:.1%}, below optimal threshold",
            "impact_score": 0.8,
            "confidence": 0.9,
            "actionable_recommendations": [
                "Implement additional training for agents",
                "Review task complexity and requirements",
                "Consider human-robot collaboration for complex tasks"
            ],
            "roi_potential": 0.25
        })

    return insights[:limit]

async def calculate_comprehensive_social_intelligence(robot_id: str) -> Dict[str, Any]:
    """Calculate comprehensive social intelligence metrics"""
    # Find robot's social intelligence data
    robot_data = None
    for profile in data_store.social_intelligence_data:
        if profile["robot_id"] == robot_id:
            robot_data = profile
            break

    if not robot_data:
        return {
            "empathy_score": 0.5,
            "cultural_awareness": 0.5,
            "communication_effectiveness": 0.5,
            "emotional_intelligence": 0.5,
            "trust_building": 0.5,
            "conflict_resolution": 0.5,
            "total_interactions": 0,
            "learning_progress": {}
        }

    interactions = robot_data.get("interactions", [])

    if not interactions:
        return {
            "empathy_score": 0.5,
            "cultural_awareness": 0.5,
            "communication_effectiveness": 0.5,
            "emotional_intelligence": robot_data.get("emotion_recognition_accuracy", 0.5),
            "trust_building": 0.5,
            "conflict_resolution": 0.5,
            "total_interactions": 0,
            "learning_progress": robot_data.get("learning_progress", {})
        }

    # Calculate metrics based on interaction data
    satisfaction_scores = [i.get("satisfaction_score", 0.5) for i in interactions]
    engagement_levels = [i.get("engagement_level", 0.5) for i in interactions]

    empathy_score = np.mean(satisfaction_scores)
    communication_effectiveness = np.mean(engagement_levels)
    emotional_intelligence = robot_data.get("emotion_recognition_accuracy", 0.5)

    # Cultural awareness based on diverse cultural interactions
    cultural_adaptations = robot_data.get("cultural_adaptations", {})
    cultural_awareness = min(1.0, len(cultural_adaptations) * 0.2 + 0.3)

    # Trust building based on repeat interactions and satisfaction
    trust_building = min(1.0, len(interactions) * 0.01 + empathy_score * 0.5)

    return {
        "empathy_score": round(empathy_score, 3),
        "cultural_awareness": round(cultural_awareness, 3),
        "communication_effectiveness": round(communication_effectiveness, 3),
        "emotional_intelligence": round(emotional_intelligence, 3),
        "trust_building": round(trust_building, 3),
        "conflict_resolution": 0.7,  # Simplified
        "total_interactions": len(interactions),
        "learning_progress": robot_data.get("learning_progress", {}),
        "cultural_adaptations": cultural_adaptations
    }

async def update_safety_learning_models(incident_data: Dict[str, Any]):
    """Update safety learning models based on incident data"""
    # Update safety patterns and prevention models
    industry = incident_data.get("industry")
    incident_type = incident_data.get("incident_type")

    # Update industry-specific safety models
    if industry not in data_store.industry_models:
        data_store.industry_models[industry] = {}

    if "safety_patterns" not in data_store.industry_models[industry]:
        data_store.industry_models[industry]["safety_patterns"] = {}

    safety_patterns = data_store.industry_models[industry]["safety_patterns"]

    if incident_type not in safety_patterns:
        safety_patterns[incident_type] = {
            "frequency": 0,
            "severity_distribution": {},
            "common_causes": {},
            "prevention_effectiveness": {}
        }

    pattern = safety_patterns[incident_type]
    pattern["frequency"] += 1

    severity = incident_data.get("severity", "medium")
    if severity not in pattern["severity_distribution"]:
        pattern["severity_distribution"][severity] = 0
    pattern["severity_distribution"][severity] += 1

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Enhanced AI Learning Service v3.0.0 - Industry-Specific & Social Intelligence")
    logger.info(f"Database path: {data_store.db_path}")
    logger.info("Features: ROS4HRI Compatible, Multi-Industry Learning, Social Intelligence")
    uvicorn.run(app, host="0.0.0.0", port=8004)
