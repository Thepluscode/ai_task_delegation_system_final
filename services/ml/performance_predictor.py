"""
ML-based Performance Predictor
Predicts agent performance and optimal task assignments using machine learning
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import asyncio

from ..core.models import Task, Agent, Assignment
from ..core.database import DatabaseManager

class PerformancePredictor:
    """ML-based performance prediction for optimal task assignment"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db_manager = db_manager
        self.logger = logging.getLogger(__name__)
        
        # ML Models
        self.completion_time_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.quality_score_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.success_probability_model = RandomForestRegressor(n_estimators=100, random_state=42)
        
        # Preprocessing
        self.scaler = StandardScaler()
        self.task_type_encoder = LabelEncoder()
        self.agent_type_encoder = LabelEncoder()
        
        # Model status
        self.models_trained = False
        self.last_training = None
        
    async def train_models(self, retrain: bool = False):
        """Train ML models using historical data"""
        try:
            if self.models_trained and not retrain:
                self.logger.info("Models already trained. Use retrain=True to force retraining.")
                return
            
            self.logger.info("Starting ML model training...")
            
            # Get training data
            training_data = await self._prepare_training_data()
            
            if len(training_data) < 100:
                self.logger.warning("Insufficient training data. Using synthetic data.")
                training_data = self._generate_synthetic_training_data()
            
            # Prepare features and targets
            X, y_time, y_quality, y_success = self._prepare_features_and_targets(training_data)
            
            # Split data
            X_train, X_test, y_time_train, y_time_test = train_test_split(X, y_time, test_size=0.2, random_state=42)
            _, _, y_quality_train, y_quality_test = train_test_split(X, y_quality, test_size=0.2, random_state=42)
            _, _, y_success_train, y_success_test = train_test_split(X, y_success, test_size=0.2, random_state=42)
            
            # Train models
            self.completion_time_model.fit(X_train, y_time_train)
            self.quality_score_model.fit(X_train, y_quality_train)
            self.success_probability_model.fit(X_train, y_success_train)
            
            # Evaluate models
            time_score = self.completion_time_model.score(X_test, y_time_test)
            quality_score = self.quality_score_model.score(X_test, y_quality_test)
            success_score = self.success_probability_model.score(X_test, y_success_test)
            
            self.logger.info(f"Model training completed:")
            self.logger.info(f"  Completion Time R²: {time_score:.3f}")
            self.logger.info(f"  Quality Score R²: {quality_score:.3f}")
            self.logger.info(f"  Success Probability R²: {success_score:.3f}")
            
            self.models_trained = True
            self.last_training = datetime.now()
            
            # Save models
            await self._save_models()
            
        except Exception as e:
            self.logger.error(f"Error training models: {str(e)}")
            raise
    
    async def predict_performance(self, task: Task, agent: Agent) -> Dict[str, float]:
        """Predict agent performance for a specific task"""
        try:
            if not self.models_trained:
                await self.train_models()
            
            # Prepare features
            features = self._extract_features(task, agent)
            features_scaled = self.scaler.transform([features])
            
            # Make predictions
            predicted_time = self.completion_time_model.predict(features_scaled)[0]
            predicted_quality = self.quality_score_model.predict(features_scaled)[0]
            predicted_success = self.success_probability_model.predict(features_scaled)[0]
            
            return {
                "predicted_completion_time": max(predicted_time, 1.0),  # Minimum 1 minute
                "predicted_quality_score": np.clip(predicted_quality, 0.0, 1.0),
                "success_probability": np.clip(predicted_success, 0.0, 1.0),
                "confidence": self._calculate_prediction_confidence(features)
            }
            
        except Exception as e:
            self.logger.error(f"Error predicting performance: {str(e)}")
            return {
                "predicted_completion_time": task.estimated_duration or 60,
                "predicted_quality_score": 0.7,
                "success_probability": 0.8,
                "confidence": 0.5
            }
    
    async def predict_optimal_agent(self, task: Task, available_agents: List[Agent]) -> Tuple[Optional[Agent], float]:
        """Predict the optimal agent for a task"""
        try:
            best_agent = None
            best_score = -1
            
            for agent in available_agents:
                performance = await self.predict_performance(task, agent)
                
                # Calculate composite score
                score = self._calculate_composite_score(performance, task, agent)
                
                if score > best_score:
                    best_score = score
                    best_agent = agent
            
            return best_agent, best_score
            
        except Exception as e:
            self.logger.error(f"Error predicting optimal agent: {str(e)}")
            return None, 0.0
    
    def _calculate_composite_score(self, performance: Dict[str, float], task: Task, agent: Agent) -> float:
        """Calculate composite performance score"""
        # Weights based on task priority and requirements
        time_weight = 0.3
        quality_weight = 0.4
        success_weight = 0.2
        confidence_weight = 0.1
        
        # Adjust weights based on task priority
        if task.priority == "CRITICAL":
            success_weight = 0.4
            quality_weight = 0.3
        elif task.priority == "HIGH":
            time_weight = 0.4
            quality_weight = 0.3
        
        # Normalize time score (lower time = higher score)
        time_score = 1.0 / (1.0 + performance["predicted_completion_time"] / task.estimated_duration)
        
        composite_score = (
            time_score * time_weight +
            performance["predicted_quality_score"] * quality_weight +
            performance["success_probability"] * success_weight +
            performance["confidence"] * confidence_weight
        )
        
        # Apply workload penalty
        workload_penalty = agent.current_workload * 0.2
        composite_score *= (1.0 - workload_penalty)
        
        return composite_score
    
    async def _prepare_training_data(self) -> List[Dict]:
        """Prepare training data from historical assignments"""
        if not self.db_manager:
            return []
        
        try:
            # Get completed assignments from last 6 months
            cutoff_date = datetime.now() - timedelta(days=180)
            assignments = await self.db_manager.get_completed_assignments_since(cutoff_date)
            
            training_data = []
            for assignment in assignments:
                task = await self.db_manager.get_task(assignment.task_id)
                agent = await self.db_manager.get_agent(assignment.agent_id)
                
                if task and agent and task.status == "COMPLETED":
                    training_data.append({
                        "task": task,
                        "agent": agent,
                        "assignment": assignment,
                        "actual_duration": task.actual_duration or task.estimated_duration,
                        "quality_score": task.quality_score or 0.7,
                        "success": 1.0 if task.status == "COMPLETED" else 0.0
                    })
            
            return training_data
            
        except Exception as e:
            self.logger.error(f"Error preparing training data: {str(e)}")
            return []
    
    def _generate_synthetic_training_data(self) -> List[Dict]:
        """Generate synthetic training data for initial model training"""
        synthetic_data = []
        
        # Define synthetic agent types and capabilities
        agent_types = ["ROBOT", "HUMAN", "AI_SYSTEM"]
        task_types = ["precision_assembly", "quality_inspection", "material_handling", "data_analysis"]
        
        for i in range(1000):
            # Create synthetic task
            task_type = np.random.choice(task_types)
            complexity = np.random.uniform(0.1, 1.0)
            estimated_duration = np.random.uniform(10, 480)  # 10 minutes to 8 hours
            
            # Create synthetic agent
            agent_type = np.random.choice(agent_types)
            workload = np.random.uniform(0.0, 0.9)
            
            # Simulate performance based on realistic relationships
            if agent_type == "ROBOT":
                base_quality = 0.85 + np.random.normal(0, 0.1)
                time_factor = 0.8 + complexity * 0.4
            elif agent_type == "HUMAN":
                base_quality = 0.75 + np.random.normal(0, 0.15)
                time_factor = 1.0 + complexity * 0.6
            else:  # AI_SYSTEM
                base_quality = 0.9 + np.random.normal(0, 0.05)
                time_factor = 0.6 + complexity * 0.3
            
            actual_duration = estimated_duration * time_factor * (1 + workload * 0.3)
            quality_score = np.clip(base_quality - workload * 0.2, 0.0, 1.0)
            success = 1.0 if np.random.random() > (complexity * workload * 0.3) else 0.0
            
            synthetic_data.append({
                "task_type": task_type,
                "task_complexity": complexity,
                "estimated_duration": estimated_duration,
                "agent_type": agent_type,
                "agent_workload": workload,
                "actual_duration": actual_duration,
                "quality_score": quality_score,
                "success": success
            })
        
        return synthetic_data
    
    def _prepare_features_and_targets(self, training_data: List[Dict]) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Prepare features and target variables for training"""
        features = []
        targets_time = []
        targets_quality = []
        targets_success = []
        
        for data in training_data:
            if isinstance(data, dict) and "task_type" in data:  # Synthetic data
                feature_vector = [
                    data["task_complexity"],
                    data["estimated_duration"],
                    data["agent_workload"],
                    1 if data["task_type"] == "precision_assembly" else 0,
                    1 if data["task_type"] == "quality_inspection" else 0,
                    1 if data["task_type"] == "material_handling" else 0,
                    1 if data["task_type"] == "data_analysis" else 0,
                    1 if data["agent_type"] == "ROBOT" else 0,
                    1 if data["agent_type"] == "HUMAN" else 0,
                    1 if data["agent_type"] == "AI_SYSTEM" else 0
                ]

                features.append(feature_vector)
                targets_time.append(data["actual_duration"])
                targets_quality.append(data["quality_score"])
                targets_success.append(data["success"])
            else:  # Real data
                task = data.get("task")
                agent = data.get("agent")

                if task and agent:
                    feature_vector = self._extract_features(task, agent)
                    features.append(feature_vector)
                    targets_time.append(data["actual_duration"])
                    targets_quality.append(data["quality_score"])
                    targets_success.append(data["success"])
        
        # Convert to numpy arrays and scale features
        X = np.array(features)
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, np.array(targets_time), np.array(targets_quality), np.array(targets_success)
    
    def _extract_features(self, task: Task, agent: Agent) -> List[float]:
        """Extract features from task and agent for ML models"""
        features = [
            task.complexity,
            task.estimated_duration,
            agent.current_workload,
            getattr(agent, 'energy_consumption', 0.5),
            len(agent.capabilities or []),
            1 if task.task_type == "precision_assembly" else 0,
            1 if task.task_type == "quality_inspection" else 0,
            1 if task.task_type == "material_handling" else 0,
            1 if task.task_type == "data_analysis" else 0,
            1 if agent.type == "ROBOT" else 0,
            1 if agent.type == "HUMAN" else 0,
            1 if agent.type == "AI_SYSTEM" else 0,
            1 if task.priority == "CRITICAL" else 0,
            1 if task.priority == "HIGH" else 0,
            task.quality_requirements,
            task.safety_requirements
        ]
        
        return features
    
    def _calculate_prediction_confidence(self, features: List[float]) -> float:
        """Calculate confidence in predictions based on feature similarity to training data"""
        # Simplified confidence calculation
        # In practice, this could use more sophisticated methods like prediction intervals
        base_confidence = 0.8
        
        # Reduce confidence for extreme values
        normalized_features = np.array(features)
        extreme_penalty = np.sum(np.abs(normalized_features) > 2) * 0.1
        
        return max(base_confidence - extreme_penalty, 0.3)
    
    async def _save_models(self):
        """Save trained models to disk"""
        try:
            model_dir = "models/"
            joblib.dump(self.completion_time_model, f"{model_dir}completion_time_model.pkl")
            joblib.dump(self.quality_score_model, f"{model_dir}quality_score_model.pkl")
            joblib.dump(self.success_probability_model, f"{model_dir}success_probability_model.pkl")
            joblib.dump(self.scaler, f"{model_dir}scaler.pkl")
            
            self.logger.info("Models saved successfully")
            
        except Exception as e:
            self.logger.error(f"Error saving models: {str(e)}")
    
    async def load_models(self):
        """Load pre-trained models from disk"""
        try:
            model_dir = "models/"
            self.completion_time_model = joblib.load(f"{model_dir}completion_time_model.pkl")
            self.quality_score_model = joblib.load(f"{model_dir}quality_score_model.pkl")
            self.success_probability_model = joblib.load(f"{model_dir}success_probability_model.pkl")
            self.scaler = joblib.load(f"{model_dir}scaler.pkl")
            
            self.models_trained = True
            self.logger.info("Models loaded successfully")
            
        except Exception as e:
            self.logger.error(f"Error loading models: {str(e)}")
            await self.train_models()  # Train new models if loading fails
