#!/usr/bin/env python3
"""
Monitoring and Analytics System
Comprehensive monitoring with APM, performance analytics, and predictive insights
"""

import asyncio
import logging
import time
import uuid
import json
import statistics
import threading
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Union, Tuple
from dataclasses import dataclass, asdict, field
from enum import Enum
from collections import defaultdict, deque
import numpy as np
import psutil

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Monitoring and Analytics System",
    description="Comprehensive monitoring with APM, performance analytics, and predictive insights",
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
class MetricType(str, Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ServiceStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

@dataclass
class Metric:
    name: str
    type: MetricType
    value: float
    timestamp: datetime
    labels: Dict[str, str] = field(default_factory=dict)
    unit: str = ""

@dataclass
class Alert:
    id: str
    name: str
    severity: AlertSeverity
    message: str
    service: str
    metric: str
    threshold: float
    current_value: float
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
    acknowledged: bool = False

@dataclass
class ServiceHealth:
    service_name: str
    status: ServiceStatus
    response_time_ms: float
    error_rate: float
    throughput: float
    last_check: datetime
    uptime_percentage: float
    dependencies: List[str] = field(default_factory=list)

@dataclass
class PerformanceMetrics:
    service: str
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, float]
    response_time_p50: float
    response_time_p95: float
    response_time_p99: float
    error_rate: float
    throughput: float

# Application Performance Monitoring (APM)
class APMCollector:
    """Collect and analyze application performance metrics"""
    
    def __init__(self):
        self.metrics: Dict[str, List[Metric]] = defaultdict(list)
        self.service_health: Dict[str, ServiceHealth] = {}
        self.performance_history: Dict[str, List[PerformanceMetrics]] = defaultdict(list)
        self.collection_interval = 30  # seconds
        self.retention_hours = 24
        self.services = [
            "workflow-state-service",
            "ai-task-delegation",
            "robot-abstraction-protocol",
            "edge-computing",
            "security-compliance"
        ]
        
        # Start background collection
        asyncio.create_task(self._start_collection_loop())
    
    async def _start_collection_loop(self):
        """Start the metrics collection loop"""
        while True:
            try:
                await self._collect_system_metrics()
                await self._collect_service_metrics()
                await self._cleanup_old_metrics()
                await asyncio.sleep(self.collection_interval)
            except Exception as e:
                logger.error(f"Error in metrics collection: {e}")
                await asyncio.sleep(self.collection_interval)
    
    async def _collect_system_metrics(self):
        """Collect system-level metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            self._add_metric("system.cpu.usage", MetricType.GAUGE, cpu_percent, {"unit": "percent"})
            
            # Memory metrics
            memory = psutil.virtual_memory()
            self._add_metric("system.memory.usage", MetricType.GAUGE, memory.percent, {"unit": "percent"})
            self._add_metric("system.memory.available", MetricType.GAUGE, memory.available / (1024**3), {"unit": "GB"})
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            self._add_metric("system.disk.usage", MetricType.GAUGE, disk_percent, {"unit": "percent"})
            
            # Network metrics
            network = psutil.net_io_counters()
            self._add_metric("system.network.bytes_sent", MetricType.COUNTER, network.bytes_sent, {"unit": "bytes"})
            self._add_metric("system.network.bytes_recv", MetricType.COUNTER, network.bytes_recv, {"unit": "bytes"})
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
    
    async def _collect_service_metrics(self):
        """Collect service-specific metrics"""
        for service in self.services:
            try:
                health = await self._check_service_health(service)
                self.service_health[service] = health
                
                # Convert health to metrics
                self._add_metric(f"service.{service}.response_time", MetricType.GAUGE, 
                               health.response_time_ms, {"service": service, "unit": "ms"})
                self._add_metric(f"service.{service}.error_rate", MetricType.GAUGE, 
                               health.error_rate, {"service": service, "unit": "percent"})
                self._add_metric(f"service.{service}.throughput", MetricType.GAUGE, 
                               health.throughput, {"service": service, "unit": "rps"})
                
                # Collect performance metrics
                perf_metrics = await self._collect_service_performance(service)
                if perf_metrics:
                    self.performance_history[service].append(perf_metrics)
                    
                    # Keep only recent history
                    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.retention_hours)
                    self.performance_history[service] = [
                        m for m in self.performance_history[service] 
                        if m.timestamp >= cutoff_time
                    ]
                
            except Exception as e:
                logger.error(f"Error collecting metrics for service {service}: {e}")
    
    async def _check_service_health(self, service: str) -> ServiceHealth:
        """Check health of a specific service"""
        service_ports = {
            "workflow-state-service": 8003,
            "robot-abstraction-protocol": 8004,
            "ai-task-delegation": 8005,
            "edge-computing": 8006,
            "security-compliance": 8007,
            "monitoring-analytics": 8008
        }
        
        port = service_ports.get(service, 8000)
        
        try:
            import aiohttp
            start_time = time.perf_counter()
            
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
                async with session.get(f"http://localhost:{port}/health") as response:
                    response_time = (time.perf_counter() - start_time) * 1000
                    
                    if response.status == 200:
                        status = ServiceStatus.HEALTHY
                        error_rate = 0.0
                    else:
                        status = ServiceStatus.DEGRADED
                        error_rate = 10.0
                    
                    return ServiceHealth(
                        service_name=service,
                        status=status,
                        response_time_ms=response_time,
                        error_rate=error_rate,
                        throughput=10.0,  # Simulated
                        last_check=datetime.now(timezone.utc),
                        uptime_percentage=99.5,  # Simulated
                        dependencies=[]
                    )
                    
        except Exception as e:
            logger.error(f"Health check failed for {service}: {e}")
            return ServiceHealth(
                service_name=service,
                status=ServiceStatus.UNHEALTHY,
                response_time_ms=0.0,
                error_rate=100.0,
                throughput=0.0,
                last_check=datetime.now(timezone.utc),
                uptime_percentage=0.0,
                dependencies=[]
            )
    
    async def _collect_service_performance(self, service: str) -> Optional[PerformanceMetrics]:
        """Collect detailed performance metrics for a service"""
        try:
            # Simulate service-specific performance data
            # In production, this would collect real metrics from the service
            
            return PerformanceMetrics(
                service=service,
                timestamp=datetime.now(timezone.utc),
                cpu_usage=np.random.uniform(10, 80),
                memory_usage=np.random.uniform(20, 70),
                disk_usage=np.random.uniform(5, 50),
                network_io={
                    "bytes_in": np.random.uniform(1000, 10000),
                    "bytes_out": np.random.uniform(500, 5000)
                },
                response_time_p50=np.random.uniform(10, 100),
                response_time_p95=np.random.uniform(50, 200),
                response_time_p99=np.random.uniform(100, 500),
                error_rate=np.random.uniform(0, 5),
                throughput=np.random.uniform(10, 100)
            )
            
        except Exception as e:
            logger.error(f"Error collecting performance metrics for {service}: {e}")
            return None
    
    def _add_metric(self, name: str, metric_type: MetricType, value: float, labels: Dict[str, str]):
        """Add a metric to the collection"""
        metric = Metric(
            name=name,
            type=metric_type,
            value=value,
            timestamp=datetime.now(timezone.utc),
            labels=labels,
            unit=labels.get("unit", "")
        )
        
        self.metrics[name].append(metric)
        
        # Keep only recent metrics
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.retention_hours)
        self.metrics[name] = [m for m in self.metrics[name] if m.timestamp >= cutoff_time]
    
    async def _cleanup_old_metrics(self):
        """Clean up old metrics to prevent memory issues"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.retention_hours)
        
        for metric_name in list(self.metrics.keys()):
            self.metrics[metric_name] = [
                m for m in self.metrics[metric_name] 
                if m.timestamp >= cutoff_time
            ]
            
            # Remove empty metric lists
            if not self.metrics[metric_name]:
                del self.metrics[metric_name]
    
    def get_metric_summary(self, metric_name: str, time_range_hours: int = 1) -> Dict[str, Any]:
        """Get summary statistics for a metric"""
        if metric_name not in self.metrics:
            return {"error": "Metric not found"}
        
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=time_range_hours)
        recent_metrics = [m for m in self.metrics[metric_name] if m.timestamp >= cutoff_time]
        
        if not recent_metrics:
            return {"error": "No recent data"}
        
        values = [m.value for m in recent_metrics]
        
        return {
            "metric_name": metric_name,
            "time_range_hours": time_range_hours,
            "data_points": len(values),
            "current_value": values[-1] if values else 0,
            "min_value": min(values),
            "max_value": max(values),
            "avg_value": statistics.mean(values),
            "median_value": statistics.median(values),
            "std_dev": statistics.stdev(values) if len(values) > 1 else 0,
            "last_updated": recent_metrics[-1].timestamp.isoformat() if recent_metrics else None
        }
    
    def get_service_overview(self) -> Dict[str, Any]:
        """Get overview of all services"""
        overview = {
            "total_services": len(self.services),
            "healthy_services": 0,
            "degraded_services": 0,
            "unhealthy_services": 0,
            "services": {}
        }
        
        for service, health in self.service_health.items():
            overview["services"][service] = asdict(health)
            
            if health.status == ServiceStatus.HEALTHY:
                overview["healthy_services"] += 1
            elif health.status == ServiceStatus.DEGRADED:
                overview["degraded_services"] += 1
            else:
                overview["unhealthy_services"] += 1
        
        return overview

# Alert Manager
class AlertManager:
    """Manage alerts and notifications"""
    
    def __init__(self, apm_collector: APMCollector):
        self.apm_collector = apm_collector
        self.alerts: List[Alert] = []
        self.alert_rules = self._define_alert_rules()
        self.notification_channels = []
        
        # Start alert evaluation loop
        asyncio.create_task(self._start_alert_evaluation())
    
    def _define_alert_rules(self) -> List[Dict[str, Any]]:
        """Define alert rules"""
        return [
            {
                "name": "High CPU Usage",
                "metric": "system.cpu.usage",
                "threshold": 80.0,
                "operator": ">",
                "severity": AlertSeverity.HIGH,
                "duration_minutes": 5
            },
            {
                "name": "High Memory Usage",
                "metric": "system.memory.usage",
                "threshold": 85.0,
                "operator": ">",
                "severity": AlertSeverity.HIGH,
                "duration_minutes": 5
            },
            {
                "name": "Service Response Time High",
                "metric_pattern": "service.*.response_time",
                "threshold": 1000.0,
                "operator": ">",
                "severity": AlertSeverity.MEDIUM,
                "duration_minutes": 2
            },
            {
                "name": "Service Error Rate High",
                "metric_pattern": "service.*.error_rate",
                "threshold": 5.0,
                "operator": ">",
                "severity": AlertSeverity.CRITICAL,
                "duration_minutes": 1
            }
        ]
    
    async def _start_alert_evaluation(self):
        """Start the alert evaluation loop"""
        while True:
            try:
                await self._evaluate_alerts()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Error in alert evaluation: {e}")
                await asyncio.sleep(60)
    
    async def _evaluate_alerts(self):
        """Evaluate all alert rules"""
        for rule in self.alert_rules:
            try:
                await self._evaluate_rule(rule)
            except Exception as e:
                logger.error(f"Error evaluating rule {rule['name']}: {e}")
    
    async def _evaluate_rule(self, rule: Dict[str, Any]):
        """Evaluate a specific alert rule"""
        metric_name = rule.get("metric")
        metric_pattern = rule.get("metric_pattern")
        
        metrics_to_check = []
        
        if metric_name:
            metrics_to_check = [metric_name]
        elif metric_pattern:
            # Simple pattern matching (in production, use proper regex)
            pattern = metric_pattern.replace("*", "")
            metrics_to_check = [
                name for name in self.apm_collector.metrics.keys()
                if pattern in name
            ]
        
        for metric_name in metrics_to_check:
            await self._check_metric_threshold(metric_name, rule)
    
    async def _check_metric_threshold(self, metric_name: str, rule: Dict[str, Any]):
        """Check if metric exceeds threshold"""
        summary = self.apm_collector.get_metric_summary(metric_name, 0.1)  # Last 6 minutes
        
        if "error" in summary:
            return
        
        current_value = summary["current_value"]
        threshold = rule["threshold"]
        operator = rule["operator"]
        
        threshold_exceeded = False
        if operator == ">":
            threshold_exceeded = current_value > threshold
        elif operator == "<":
            threshold_exceeded = current_value < threshold
        elif operator == ">=":
            threshold_exceeded = current_value >= threshold
        elif operator == "<=":
            threshold_exceeded = current_value <= threshold
        
        if threshold_exceeded:
            await self._trigger_alert(metric_name, rule, current_value)
    
    async def _trigger_alert(self, metric_name: str, rule: Dict[str, Any], current_value: float):
        """Trigger an alert"""
        # Check if alert already exists
        existing_alert = None
        for alert in self.alerts:
            if (alert.metric == metric_name and 
                alert.name == rule["name"] and 
                alert.resolved_at is None):
                existing_alert = alert
                break
        
        if existing_alert:
            return  # Alert already active
        
        # Create new alert
        alert = Alert(
            id=str(uuid.uuid4()),
            name=rule["name"],
            severity=AlertSeverity(rule["severity"]),
            message=f"{rule['name']}: {metric_name} is {current_value:.2f}, threshold is {rule['threshold']}",
            service=metric_name.split(".")[1] if "." in metric_name else "system",
            metric=metric_name,
            threshold=rule["threshold"],
            current_value=current_value,
            triggered_at=datetime.now(timezone.utc)
        )
        
        self.alerts.append(alert)
        logger.warning(f"Alert triggered: {alert.message}")
        
        # Send notifications
        await self._send_notifications(alert)
    
    async def _send_notifications(self, alert: Alert):
        """Send alert notifications"""
        # In production, would send to Slack, email, PagerDuty, etc.
        logger.info(f"Notification sent for alert: {alert.name}")
    
    def get_active_alerts(self) -> List[Alert]:
        """Get all active alerts"""
        return [alert for alert in self.alerts if alert.resolved_at is None]
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get alert summary"""
        active_alerts = self.get_active_alerts()
        
        severity_counts = {severity.value: 0 for severity in AlertSeverity}
        for alert in active_alerts:
            severity_counts[alert.severity.value] += 1
        
        return {
            "total_active_alerts": len(active_alerts),
            "severity_breakdown": severity_counts,
            "recent_alerts": [asdict(alert) for alert in self.alerts[-10:]],  # Last 10 alerts
            "alert_rate_last_hour": len([
                alert for alert in self.alerts
                if (datetime.now(timezone.utc) - alert.triggered_at).total_seconds() < 3600
            ])
        }

# Analytics Engine
class AnalyticsEngine:
    """Advanced analytics and predictive insights"""

    def __init__(self, apm_collector: APMCollector):
        self.apm_collector = apm_collector
        self.prediction_models = {}
        self.anomaly_detection_models = {}
        self.trend_analysis_cache = {}

    async def analyze_performance_trends(self, service: str, metric: str,
                                       time_range_hours: int = 24) -> Dict[str, Any]:
        """Analyze performance trends for a service metric"""
        try:
            # Get historical data
            if service not in self.apm_collector.performance_history:
                return {"error": "No performance data available"}

            history = self.apm_collector.performance_history[service]
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=time_range_hours)
            recent_history = [h for h in history if h.timestamp >= cutoff_time]

            if len(recent_history) < 2:
                return {"error": "Insufficient data for trend analysis"}

            # Extract metric values
            values = []
            timestamps = []

            for record in recent_history:
                if hasattr(record, metric):
                    values.append(getattr(record, metric))
                    timestamps.append(record.timestamp.timestamp())

            if not values:
                return {"error": f"Metric {metric} not found"}

            # Calculate trend
            trend_slope = self._calculate_trend_slope(timestamps, values)
            trend_direction = "increasing" if trend_slope > 0.1 else "decreasing" if trend_slope < -0.1 else "stable"

            # Calculate statistics
            avg_value = statistics.mean(values)
            std_dev = statistics.stdev(values) if len(values) > 1 else 0

            # Detect anomalies
            anomalies = self._detect_anomalies(values, avg_value, std_dev)

            return {
                "service": service,
                "metric": metric,
                "time_range_hours": time_range_hours,
                "data_points": len(values),
                "trend": {
                    "direction": trend_direction,
                    "slope": trend_slope,
                    "confidence": min(len(values) / 100, 1.0)  # More data = higher confidence
                },
                "statistics": {
                    "current_value": values[-1],
                    "average": avg_value,
                    "min": min(values),
                    "max": max(values),
                    "std_deviation": std_dev,
                    "coefficient_of_variation": std_dev / avg_value if avg_value > 0 else 0
                },
                "anomalies": {
                    "count": len(anomalies),
                    "anomaly_rate": len(anomalies) / len(values),
                    "recent_anomalies": anomalies[-5:]  # Last 5 anomalies
                },
                "predictions": await self._predict_future_values(service, metric, values, timestamps)
            }

        except Exception as e:
            logger.error(f"Error in trend analysis: {e}")
            return {"error": str(e)}

    def _calculate_trend_slope(self, timestamps: List[float], values: List[float]) -> float:
        """Calculate trend slope using linear regression"""
        n = len(timestamps)
        if n < 2:
            return 0.0

        # Simple linear regression
        sum_x = sum(timestamps)
        sum_y = sum(values)
        sum_xy = sum(x * y for x, y in zip(timestamps, values))
        sum_x2 = sum(x * x for x in timestamps)

        denominator = n * sum_x2 - sum_x * sum_x
        if denominator == 0:
            return 0.0

        slope = (n * sum_xy - sum_x * sum_y) / denominator
        return slope

    def _detect_anomalies(self, values: List[float], mean: float, std_dev: float) -> List[Dict[str, Any]]:
        """Detect anomalies using statistical methods"""
        anomalies = []
        threshold = 2.0  # 2 standard deviations

        for i, value in enumerate(values):
            z_score = abs(value - mean) / std_dev if std_dev > 0 else 0

            if z_score > threshold:
                anomalies.append({
                    "index": i,
                    "value": value,
                    "z_score": z_score,
                    "deviation": value - mean
                })

        return anomalies

    async def _predict_future_values(self, service: str, metric: str,
                                   values: List[float], timestamps: List[float]) -> Dict[str, Any]:
        """Predict future values using simple forecasting"""
        try:
            if len(values) < 5:
                return {"error": "Insufficient data for prediction"}

            # Simple moving average prediction
            window_size = min(5, len(values))
            recent_values = values[-window_size:]
            predicted_value = statistics.mean(recent_values)

            # Calculate prediction confidence based on recent stability
            recent_std = statistics.stdev(recent_values) if len(recent_values) > 1 else 0
            confidence = max(0.1, 1.0 - (recent_std / predicted_value)) if predicted_value > 0 else 0.1

            # Predict next few time points
            predictions = []
            for i in range(1, 6):  # Next 5 time points
                # Simple trend continuation
                trend_slope = self._calculate_trend_slope(timestamps[-window_size:], recent_values)
                predicted = predicted_value + (trend_slope * i * 3600)  # Assuming hourly intervals

                predictions.append({
                    "time_offset_hours": i,
                    "predicted_value": predicted,
                    "confidence": confidence * (0.9 ** i)  # Decreasing confidence over time
                })

            return {
                "method": "moving_average_with_trend",
                "base_prediction": predicted_value,
                "overall_confidence": confidence,
                "predictions": predictions
            }

        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return {"error": str(e)}

    async def generate_system_insights(self) -> Dict[str, Any]:
        """Generate comprehensive system insights"""
        insights = {
            "system_health_score": 0.0,
            "performance_insights": [],
            "capacity_insights": [],
            "optimization_recommendations": [],
            "risk_assessment": {},
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

        try:
            # Calculate overall system health score
            service_overview = self.apm_collector.get_service_overview()
            total_services = service_overview["total_services"]
            healthy_services = service_overview["healthy_services"]

            if total_services > 0:
                insights["system_health_score"] = (healthy_services / total_services) * 100

            # Performance insights
            for service in self.apm_collector.services:
                if service in self.apm_collector.performance_history:
                    history = self.apm_collector.performance_history[service]
                    if history:
                        latest = history[-1]

                        # High CPU usage insight
                        if latest.cpu_usage > 70:
                            insights["performance_insights"].append({
                                "type": "high_cpu_usage",
                                "service": service,
                                "current_value": latest.cpu_usage,
                                "severity": "medium" if latest.cpu_usage < 85 else "high",
                                "recommendation": "Consider scaling up or optimizing CPU-intensive operations"
                            })

                        # High response time insight
                        if latest.response_time_p95 > 500:
                            insights["performance_insights"].append({
                                "type": "high_response_time",
                                "service": service,
                                "current_value": latest.response_time_p95,
                                "severity": "medium" if latest.response_time_p95 < 1000 else "high",
                                "recommendation": "Investigate slow queries or optimize request processing"
                            })

            # Capacity insights
            system_metrics = self.apm_collector.get_metric_summary("system.cpu.usage", 1)
            if "current_value" in system_metrics:
                cpu_usage = system_metrics["current_value"]
                if cpu_usage > 80:
                    insights["capacity_insights"].append({
                        "type": "cpu_capacity_warning",
                        "current_usage": cpu_usage,
                        "recommendation": "Consider adding more CPU resources or load balancing"
                    })

            memory_metrics = self.apm_collector.get_metric_summary("system.memory.usage", 1)
            if "current_value" in memory_metrics:
                memory_usage = memory_metrics["current_value"]
                if memory_usage > 85:
                    insights["capacity_insights"].append({
                        "type": "memory_capacity_warning",
                        "current_usage": memory_usage,
                        "recommendation": "Consider increasing memory allocation or optimizing memory usage"
                    })

            # Optimization recommendations
            insights["optimization_recommendations"] = [
                {
                    "category": "performance",
                    "recommendation": "Enable response caching for frequently accessed endpoints",
                    "impact": "medium",
                    "effort": "low"
                },
                {
                    "category": "reliability",
                    "recommendation": "Implement circuit breakers for external service calls",
                    "impact": "high",
                    "effort": "medium"
                },
                {
                    "category": "monitoring",
                    "recommendation": "Add custom business metrics tracking",
                    "impact": "medium",
                    "effort": "low"
                }
            ]

            # Risk assessment
            insights["risk_assessment"] = {
                "overall_risk_level": "low",
                "risk_factors": [
                    {
                        "factor": "single_point_of_failure",
                        "risk_level": "medium",
                        "description": "Some services lack redundancy"
                    },
                    {
                        "factor": "resource_utilization",
                        "risk_level": "low",
                        "description": "Resource usage within acceptable limits"
                    }
                ]
            }

        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            insights["error"] = str(e)

        return insights

# Pydantic models for API
class MetricQueryRequest(BaseModel):
    metric_name: str
    time_range_hours: int = 1

class TrendAnalysisRequest(BaseModel):
    service: str
    metric: str
    time_range_hours: int = 24

class AlertAcknowledgeRequest(BaseModel):
    alert_id: str

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Monitoring and Analytics System",
        "version": "1.0.0",
        "description": "Comprehensive monitoring with APM, performance analytics, and predictive insights",
        "features": [
            "application_performance_monitoring",
            "real_time_alerting",
            "predictive_analytics",
            "anomaly_detection",
            "system_insights",
            "trend_analysis"
        ],
        "monitored_services": apm_collector.services,
        "metrics_collected": len(apm_collector.metrics),
        "active_alerts": len(alert_manager.get_active_alerts())
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "monitoring-analytics",
        "components": {
            "apm_collector": "operational",
            "alert_manager": "operational",
            "analytics_engine": "operational"
        },
        "metrics": {
            "total_metrics": len(apm_collector.metrics),
            "monitored_services": len(apm_collector.services),
            "active_alerts": len(alert_manager.get_active_alerts()),
            "collection_interval": apm_collector.collection_interval
        }
    }

# Global instances
apm_collector = APMCollector()
alert_manager = AlertManager(apm_collector)
analytics_engine = AnalyticsEngine(apm_collector)

@app.get("/api/v1/metrics")
async def get_all_metrics():
    """Get all available metrics"""
    try:
        metrics_summary = {}
        for metric_name in apm_collector.metrics.keys():
            summary = apm_collector.get_metric_summary(metric_name, 1)
            metrics_summary[metric_name] = summary

        return {
            "metrics": metrics_summary,
            "total_metrics": len(metrics_summary)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/metrics/{metric_name}")
async def get_metric_details(metric_name: str, time_range_hours: int = 1):
    """Get detailed information about a specific metric"""
    try:
        summary = apm_collector.get_metric_summary(metric_name, time_range_hours)

        if "error" in summary:
            raise HTTPException(status_code=404, detail=summary["error"])

        # Get raw data points
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=time_range_hours)
        raw_data = [
            {
                "timestamp": m.timestamp.isoformat(),
                "value": m.value,
                "labels": m.labels
            }
            for m in apm_collector.metrics.get(metric_name, [])
            if m.timestamp >= cutoff_time
        ]

        return {
            "summary": summary,
            "raw_data": raw_data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/services")
async def get_services_overview():
    """Get overview of all monitored services"""
    try:
        return apm_collector.get_service_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/services/{service_name}")
async def get_service_details(service_name: str):
    """Get detailed information about a specific service"""
    try:
        if service_name not in apm_collector.services:
            raise HTTPException(status_code=404, detail="Service not found")

        # Get service health
        health = apm_collector.service_health.get(service_name)

        # Get performance history
        history = apm_collector.performance_history.get(service_name, [])
        recent_history = history[-24:] if history else []  # Last 24 data points

        # Get service-specific metrics
        service_metrics = {}
        for metric_name in apm_collector.metrics.keys():
            if f"service.{service_name}" in metric_name:
                summary = apm_collector.get_metric_summary(metric_name, 1)
                service_metrics[metric_name] = summary

        return {
            "service_name": service_name,
            "health": asdict(health) if health else None,
            "performance_history": [asdict(p) for p in recent_history],
            "metrics": service_metrics
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/alerts")
async def get_alerts():
    """Get all alerts"""
    try:
        return {
            "active_alerts": [asdict(alert) for alert in alert_manager.get_active_alerts()],
            "alert_summary": alert_manager.get_alert_summary(),
            "alert_rules": alert_manager.alert_rules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert"""
    try:
        # Find alert
        alert = None
        for a in alert_manager.alerts:
            if a.id == alert_id:
                alert = a
                break

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert.acknowledged = True

        return {
            "success": True,
            "alert_id": alert_id,
            "message": "Alert acknowledged"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Resolve an alert"""
    try:
        # Find alert
        alert = None
        for a in alert_manager.alerts:
            if a.id == alert_id:
                alert = a
                break

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert.resolved_at = datetime.now(timezone.utc)

        return {
            "success": True,
            "alert_id": alert_id,
            "message": "Alert resolved"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analytics/trends")
async def analyze_trends(request: TrendAnalysisRequest):
    """Analyze performance trends for a service metric"""
    try:
        analysis = await analytics_engine.analyze_performance_trends(
            request.service, request.metric, request.time_range_hours
        )

        if "error" in analysis:
            raise HTTPException(status_code=400, detail=analysis["error"])

        return analysis

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analytics/insights")
async def get_system_insights():
    """Get comprehensive system insights and recommendations"""
    try:
        return await analytics_engine.generate_system_insights()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analytics/dashboard")
async def get_dashboard_data():
    """Get comprehensive dashboard data"""
    try:
        # System overview
        system_overview = apm_collector.get_service_overview()

        # Key metrics
        key_metrics = {}
        important_metrics = [
            "system.cpu.usage",
            "system.memory.usage",
            "system.disk.usage"
        ]

        for metric in important_metrics:
            summary = apm_collector.get_metric_summary(metric, 1)
            if "error" not in summary:
                key_metrics[metric] = summary

        # Alert summary
        alert_summary = alert_manager.get_alert_summary()

        # Recent performance data
        performance_data = {}
        for service in apm_collector.services:
            history = apm_collector.performance_history.get(service, [])
            if history:
                performance_data[service] = [asdict(h) for h in history[-12:]]  # Last 12 data points

        return {
            "system_overview": system_overview,
            "key_metrics": key_metrics,
            "alert_summary": alert_summary,
            "performance_data": performance_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time monitoring
@app.websocket("/ws/monitoring")
async def monitoring_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time monitoring updates"""
    await websocket.accept()

    try:
        while True:
            # Send monitoring updates
            monitoring_update = {
                "type": "monitoring_update",
                "data": {
                    "system_overview": apm_collector.get_service_overview(),
                    "active_alerts": len(alert_manager.get_active_alerts()),
                    "key_metrics": {
                        "cpu_usage": apm_collector.get_metric_summary("system.cpu.usage", 0.1).get("current_value", 0),
                        "memory_usage": apm_collector.get_metric_summary("system.memory.usage", 0.1).get("current_value", 0),
                        "disk_usage": apm_collector.get_metric_summary("system.disk.usage", 0.1).get("current_value", 0)
                    },
                    "recent_alerts": [asdict(alert) for alert in alert_manager.alerts[-5:]]  # Last 5 alerts
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            await websocket.send_json(monitoring_update)
            await asyncio.sleep(5)  # Send updates every 5 seconds

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Monitoring WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8008)
