"""
Advanced Analytics & Predictive Intelligence Engine
Real-time analytics, forecasting, and optimization for automation platform
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
from scipy import stats

logger = logging.getLogger(__name__)

class MetricType(Enum):
    EFFICIENCY = "efficiency"
    COST = "cost"
    QUALITY = "quality"
    THROUGHPUT = "throughput"
    UTILIZATION = "utilization"
    DOWNTIME = "downtime"
    ENERGY = "energy"
    SAFETY = "safety"

class PredictionHorizon(Enum):
    HOUR = "1h"
    DAY = "24h"
    WEEK = "7d"
    MONTH = "30d"
    QUARTER = "90d"

@dataclass
class MetricData:
    timestamp: datetime
    metric_type: MetricType
    value: float
    resource_id: Optional[str] = None
    workflow_id: Optional[str] = None
    location: Optional[str] = None
    metadata: Dict[str, Any] = None

@dataclass
class Prediction:
    metric_type: MetricType
    horizon: PredictionHorizon
    predicted_value: float
    confidence_interval: Tuple[float, float]
    confidence_score: float
    factors: List[str]
    timestamp: datetime
    
@dataclass
class Anomaly:
    timestamp: datetime
    metric_type: MetricType
    actual_value: float
    expected_value: float
    severity: float  # 0.0 to 1.0
    description: str
    resource_id: Optional[str] = None

@dataclass
class Optimization:
    target_metric: MetricType
    current_value: float
    optimized_value: float
    improvement_percentage: float
    recommendations: List[str]
    estimated_savings: float
    implementation_effort: str  # "low", "medium", "high"

class PredictiveAnalyticsEngine:
    """
    Advanced analytics engine for predictive insights and optimization
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.anomaly_detectors = {}
        self.historical_data = {}
        self.load_models()
        
    def load_models(self):
        """Load or initialize ML models for different metrics"""
        for metric_type in MetricType:
            try:
                self.models[metric_type] = joblib.load(f'model_{metric_type.value}.pkl')
                self.scalers[metric_type] = joblib.load(f'scaler_{metric_type.value}.pkl')
                self.anomaly_detectors[metric_type] = joblib.load(f'anomaly_{metric_type.value}.pkl')
                logger.info(f"Loaded models for {metric_type.value}")
            except FileNotFoundError:
                # Initialize new models
                self.models[metric_type] = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                self.scalers[metric_type] = StandardScaler()
                self.anomaly_detectors[metric_type] = IsolationForest(
                    contamination=0.1,
                    random_state=42
                )
                logger.info(f"Initialized new models for {metric_type.value}")
    
    async def ingest_metric(self, metric: MetricData):
        """Ingest new metric data for analysis"""
        metric_type = metric.metric_type
        
        if metric_type not in self.historical_data:
            self.historical_data[metric_type] = []
        
        self.historical_data[metric_type].append(metric)
        
        # Keep only recent data (last 90 days)
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=90)
        self.historical_data[metric_type] = [
            m for m in self.historical_data[metric_type] 
            if m.timestamp > cutoff_date
        ]
        
        # Check for anomalies
        anomaly = await self.detect_anomaly(metric)
        if anomaly:
            logger.warning(f"Anomaly detected: {anomaly.description}")
            await self.handle_anomaly(anomaly)
    
    def prepare_features(self, data: List[MetricData], target_timestamp: datetime) -> np.ndarray:
        """Prepare features for ML models"""
        if len(data) < 10:
            return np.array([]).reshape(0, -1)
        
        df = pd.DataFrame([
            {
                'timestamp': m.timestamp,
                'value': m.value,
                'hour': m.timestamp.hour,
                'day_of_week': m.timestamp.weekday(),
                'day_of_month': m.timestamp.day,
                'month': m.timestamp.month,
                'is_weekend': m.timestamp.weekday() >= 5,
                'resource_id': m.resource_id or 'unknown'
            }
            for m in data
        ])
        
        # Sort by timestamp
        df = df.sort_values('timestamp')
        
        # Create time-based features
        df['value_lag_1'] = df['value'].shift(1)
        df['value_lag_24'] = df['value'].shift(24) if len(df) > 24 else df['value']
        df['value_rolling_mean_7'] = df['value'].rolling(window=7, min_periods=1).mean()
        df['value_rolling_std_7'] = df['value'].rolling(window=7, min_periods=1).std()
        df['trend'] = df['value'].diff()
        
        # Time until target
        df['hours_to_target'] = (target_timestamp - df['timestamp']).dt.total_seconds() / 3600
        
        # Select features for model
        feature_columns = [
            'hour', 'day_of_week', 'day_of_month', 'month', 'is_weekend',
            'value_lag_1', 'value_lag_24', 'value_rolling_mean_7', 'value_rolling_std_7',
            'trend', 'hours_to_target'
        ]
        
        # Fill NaN values
        df = df.fillna(method='ffill').fillna(0)
        
        return df[feature_columns].values
    
    async def predict_metric(self, metric_type: MetricType, horizon: PredictionHorizon, 
                           resource_id: Optional[str] = None) -> Optional[Prediction]:
        """Generate prediction for a specific metric"""
        if metric_type not in self.historical_data:
            return None
        
        data = self.historical_data[metric_type]
        if resource_id:
            data = [m for m in data if m.resource_id == resource_id]
        
        if len(data) < 20:  # Need minimum data for prediction
            return None
        
        # Calculate target timestamp
        horizon_hours = {
            PredictionHorizon.HOUR: 1,
            PredictionHorizon.DAY: 24,
            PredictionHorizon.WEEK: 168,
            PredictionHorizon.MONTH: 720,
            PredictionHorizon.QUARTER: 2160
        }
        
        target_timestamp = datetime.now(timezone.utc) + timedelta(hours=horizon_hours[horizon])
        
        # Prepare features
        features = self.prepare_features(data, target_timestamp)
        if features.shape[0] == 0:
            return None
        
        # Use the last row as prediction input
        X = features[-1:].reshape(1, -1)
        
        try:
            # Scale features
            X_scaled = self.scalers[metric_type].transform(X)
            
            # Make prediction
            predicted_value = self.models[metric_type].predict(X_scaled)[0]
            
            # Calculate confidence interval (simplified)
            recent_values = [m.value for m in data[-20:]]
            std_dev = np.std(recent_values)
            confidence_interval = (
                predicted_value - 1.96 * std_dev,
                predicted_value + 1.96 * std_dev
            )
            
            # Calculate confidence score based on model performance
            confidence_score = min(0.95, max(0.5, 1.0 - std_dev / np.mean(recent_values)))
            
            # Identify key factors
            factors = self.identify_prediction_factors(metric_type, data)
            
            return Prediction(
                metric_type=metric_type,
                horizon=horizon,
                predicted_value=predicted_value,
                confidence_interval=confidence_interval,
                confidence_score=confidence_score,
                factors=factors,
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            logger.error(f"Error making prediction for {metric_type.value}: {e}")
            return None
    
    def identify_prediction_factors(self, metric_type: MetricType, data: List[MetricData]) -> List[str]:
        """Identify key factors influencing the prediction"""
        factors = []
        
        if len(data) < 10:
            return factors
        
        recent_data = data[-24:]  # Last 24 data points
        values = [m.value for m in recent_data]
        
        # Trend analysis
        if len(values) > 1:
            trend = np.polyfit(range(len(values)), values, 1)[0]
            if abs(trend) > 0.01:
                direction = "increasing" if trend > 0 else "decreasing"
                factors.append(f"Recent {direction} trend")
        
        # Seasonality
        hours = [m.timestamp.hour for m in recent_data]
        if len(set(hours)) > 1:
            hour_avg = {}
            for m in data[-168:]:  # Last week
                hour = m.timestamp.hour
                if hour not in hour_avg:
                    hour_avg[hour] = []
                hour_avg[hour].append(m.value)
            
            current_hour = datetime.now(timezone.utc).hour
            if current_hour in hour_avg and len(hour_avg[current_hour]) > 1:
                factors.append(f"Time of day pattern (hour {current_hour})")
        
        # Weekend effect
        weekdays = [m.timestamp.weekday() for m in recent_data]
        if any(day >= 5 for day in weekdays):
            factors.append("Weekend effect")
        
        # Resource-specific patterns
        resource_ids = [m.resource_id for m in recent_data if m.resource_id]
        if len(set(resource_ids)) > 1:
            factors.append("Multi-resource pattern")
        
        return factors[:5]  # Return top 5 factors
    
    async def detect_anomaly(self, metric: MetricData) -> Optional[Anomaly]:
        """Detect anomalies in real-time metric data"""
        metric_type = metric.metric_type
        
        if metric_type not in self.historical_data:
            return None
        
        data = self.historical_data[metric_type]
        if len(data) < 30:  # Need baseline data
            return None
        
        # Get recent baseline
        baseline_data = [m.value for m in data[-30:] if m.resource_id == metric.resource_id]
        if len(baseline_data) < 10:
            baseline_data = [m.value for m in data[-30:]]
        
        if len(baseline_data) < 10:
            return None
        
        # Statistical anomaly detection
        mean_val = np.mean(baseline_data)
        std_val = np.std(baseline_data)
        z_score = abs(metric.value - mean_val) / std_val if std_val > 0 else 0
        
        # ML-based anomaly detection
        try:
            features = np.array([[metric.value]])
            anomaly_score = self.anomaly_detectors[metric_type].decision_function(features)[0]
            is_anomaly = self.anomaly_detectors[metric_type].predict(features)[0] == -1
        except:
            is_anomaly = False
            anomaly_score = 0
        
        # Determine if it's an anomaly
        if z_score > 3 or is_anomaly:
            severity = min(1.0, max(0.0, (z_score - 2) / 3))
            
            description = f"{metric_type.value} value {metric.value:.2f} is "
            if metric.value > mean_val:
                description += f"significantly higher than expected ({mean_val:.2f})"
            else:
                description += f"significantly lower than expected ({mean_val:.2f})"
            
            return Anomaly(
                timestamp=metric.timestamp,
                metric_type=metric_type,
                actual_value=metric.value,
                expected_value=mean_val,
                severity=severity,
                description=description,
                resource_id=metric.resource_id
            )
        
        return None
    
    async def handle_anomaly(self, anomaly: Anomaly):
        """Handle detected anomaly"""
        # Log the anomaly
        logger.warning(f"Anomaly detected: {anomaly.description}")
        
        # Store anomaly for analysis
        # In a real implementation, this would trigger alerts, notifications, etc.
        pass
    
    async def generate_optimization_recommendations(self, target_metric: MetricType, 
                                                  resource_id: Optional[str] = None) -> List[Optimization]:
        """Generate optimization recommendations"""
        optimizations = []
        
        if target_metric not in self.historical_data:
            return optimizations
        
        data = self.historical_data[target_metric]
        if resource_id:
            data = [m for m in data if m.resource_id == resource_id]
        
        if len(data) < 50:
            return optimizations
        
        current_value = np.mean([m.value for m in data[-10:]])
        best_value = np.max([m.value for m in data]) if target_metric in [MetricType.EFFICIENCY, MetricType.THROUGHPUT] else np.min([m.value for m in data])
        
        if target_metric == MetricType.EFFICIENCY:
            recommendations = [
                "Optimize task scheduling to reduce idle time",
                "Implement predictive maintenance to prevent downtime",
                "Balance workload across resources",
                "Automate repetitive tasks with robots"
            ]
            improvement = (best_value - current_value) / current_value * 100
            estimated_savings = improvement * 1000  # Simplified calculation
            
        elif target_metric == MetricType.COST:
            recommendations = [
                "Optimize energy consumption during off-peak hours",
                "Reduce material waste through better planning",
                "Implement just-in-time inventory management",
                "Automate high-cost manual processes"
            ]
            improvement = (current_value - best_value) / current_value * 100
            estimated_savings = improvement * 5000  # Simplified calculation
            
        else:
            recommendations = ["Analyze historical patterns for optimization opportunities"]
            improvement = 5.0
            estimated_savings = 1000
        
        optimization = Optimization(
            target_metric=target_metric,
            current_value=current_value,
            optimized_value=best_value,
            improvement_percentage=improvement,
            recommendations=recommendations,
            estimated_savings=estimated_savings,
            implementation_effort="medium"
        )
        
        optimizations.append(optimization)
        return optimizations
    
    async def get_real_time_insights(self) -> Dict[str, Any]:
        """Generate real-time insights dashboard data"""
        insights = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'metrics_summary': {},
            'predictions': {},
            'anomalies': [],
            'optimizations': []
        }
        
        # Generate summary for each metric type
        for metric_type in MetricType:
            if metric_type in self.historical_data and self.historical_data[metric_type]:
                recent_data = self.historical_data[metric_type][-24:]
                current_value = np.mean([m.value for m in recent_data])
                trend = "stable"
                
                if len(recent_data) > 1:
                    values = [m.value for m in recent_data]
                    slope = np.polyfit(range(len(values)), values, 1)[0]
                    if slope > 0.01:
                        trend = "increasing"
                    elif slope < -0.01:
                        trend = "decreasing"
                
                insights['metrics_summary'][metric_type.value] = {
                    'current_value': current_value,
                    'trend': trend,
                    'data_points': len(recent_data)
                }
        
        # Generate predictions
        for metric_type in [MetricType.EFFICIENCY, MetricType.COST, MetricType.THROUGHPUT]:
            prediction = await self.predict_metric(metric_type, PredictionHorizon.DAY)
            if prediction:
                insights['predictions'][metric_type.value] = asdict(prediction)
        
        # Get recent anomalies (simplified - in real implementation, store anomalies)
        # insights['anomalies'] would be populated from stored anomaly data
        
        # Generate optimization recommendations
        for metric_type in [MetricType.EFFICIENCY, MetricType.COST]:
            optimizations = await self.generate_optimization_recommendations(metric_type)
            insights['optimizations'].extend([asdict(opt) for opt in optimizations])
        
        return insights
    
    async def retrain_models(self):
        """Retrain ML models with latest data"""
        for metric_type in MetricType:
            if metric_type not in self.historical_data or len(self.historical_data[metric_type]) < 100:
                continue
            
            try:
                data = self.historical_data[metric_type]
                
                # Prepare training data
                features_list = []
                targets = []
                
                for i in range(24, len(data)):  # Need 24 previous points for features
                    target_timestamp = data[i].timestamp
                    historical_subset = data[:i]
                    features = self.prepare_features(historical_subset, target_timestamp)
                    
                    if features.shape[0] > 0:
                        features_list.append(features[-1])
                        targets.append(data[i].value)
                
                if len(features_list) < 50:
                    continue
                
                X = np.array(features_list)
                y = np.array(targets)
                
                # Scale features
                X_scaled = self.scalers[metric_type].fit_transform(X)
                
                # Train prediction model
                self.models[metric_type].fit(X_scaled, y)
                
                # Train anomaly detection model
                self.anomaly_detectors[metric_type].fit(X_scaled)
                
                # Save models
                joblib.dump(self.models[metric_type], f'model_{metric_type.value}.pkl')
                joblib.dump(self.scalers[metric_type], f'scaler_{metric_type.value}.pkl')
                joblib.dump(self.anomaly_detectors[metric_type], f'anomaly_{metric_type.value}.pkl')
                
                logger.info(f"Retrained models for {metric_type.value} with {len(X)} samples")
                
            except Exception as e:
                logger.error(f"Error retraining models for {metric_type.value}: {e}")

# Global analytics engine instance
analytics_engine = PredictiveAnalyticsEngine()
