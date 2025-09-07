"""
AI Task Monitoring Service - Real-time task tracking and anomaly detection
Enhanced for Enterprise Automation Platform
"""
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
import asyncio
import json
import sqlite3
import logging
from datetime import datetime, timezone, timedelta
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Task Monitoring Service",
    description="Real-time task tracking and intelligent anomaly detection",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced Pydantic models
class TaskMonitoringRequest(BaseModel):
    delegation_id: str = Field(..., description="Unique delegation identifier")
    task_id: str = Field(..., description="Task identifier")
    agent_id: str = Field(..., description="Agent performing the task")
    estimated_completion: str = Field(..., description="ISO timestamp of estimated completion")
    priority: str = Field(default="medium", description="Task priority level")
    task_type: Optional[str] = Field(None, description="Type of task being monitored")

class TaskProgress(BaseModel):
    delegation_id: str = Field(..., description="Delegation identifier")
    progress_percentage: float = Field(..., ge=0.0, le=1.0, description="Progress as decimal 0-1")
    quality_metrics: Dict[str, float] = Field(default={}, description="Quality measurements")
    performance_indicators: Dict[str, float] = Field(default={}, description="Performance metrics")
    timestamp: str = Field(..., description="ISO timestamp of progress update")

class TaskAnomaly(BaseModel):
    delegation_id: str
    anomaly_type: str
    severity: str  # "info", "warning", "critical"
    description: str
    detected_at: str
    metrics: Dict[str, float]
    suggested_actions: List[str]

class TaskAlert(BaseModel):
    alert_id: str
    delegation_id: str
    alert_type: str
    message: str
    severity: str
    created_at: str

# Database management
class MonitoringDatabase:
    def __init__(self):
        self.db_path = "data/monitoring_service.db"
        self._init_database()
    
    def _init_database(self):
        """Initialize monitoring database"""
        try:
            os.makedirs("data", exist_ok=True)
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Task monitoring table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS task_monitors (
                    delegation_id TEXT PRIMARY KEY,
                    task_id TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    task_type TEXT,
                    priority TEXT,
                    estimated_completion TEXT,
                    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'monitoring',
                    current_progress REAL DEFAULT 0.0,
                    last_update TIMESTAMP,
                    stopped_at TIMESTAMP
                )
            ''')
            
            # Progress history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS progress_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    delegation_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    progress_percentage REAL NOT NULL,
                    quality_metrics TEXT,
                    performance_indicators TEXT,
                    FOREIGN KEY (delegation_id) REFERENCES task_monitors (delegation_id)
                )
            ''')
            
            # Anomalies table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS anomalies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    delegation_id TEXT NOT NULL,
                    anomaly_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    description TEXT NOT NULL,
                    detected_at TEXT NOT NULL,
                    metrics TEXT,
                    suggested_actions TEXT,
                    FOREIGN KEY (delegation_id) REFERENCES task_monitors (delegation_id)
                )
            ''')
            
            # Alerts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS alerts (
                    alert_id TEXT PRIMARY KEY,
                    delegation_id TEXT NOT NULL,
                    alert_type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    acknowledged BOOLEAN DEFAULT FALSE,
                    acknowledged_at TEXT,
                    FOREIGN KEY (delegation_id) REFERENCES task_monitors (delegation_id)
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Monitoring database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")

# Global database instance
monitoring_db = MonitoringDatabase()

# In-memory storage for active monitoring
active_monitors = {}  # delegation_id -> monitor_data
task_progress_history = {}  # delegation_id -> [progress_data]
detected_anomalies = {}  # delegation_id -> [anomalies]
active_alerts = {}  # alert_id -> alert_data

@app.get("/")
async def root():
    return {
        "service": "AI Task Monitoring Service",
        "status": "running",
        "version": "2.0.0",
        "capabilities": [
            "real_time_tracking",
            "anomaly_detection", 
            "predictive_alerts",
            "performance_analytics",
            "health_assessment",
            "dashboard_reporting"
        ],
        "active_monitors": len(active_monitors),
        "database_enabled": True
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "monitoring-service",
        "version": "2.0.0",
        "active_monitors": len(active_monitors),
        "database_status": "connected"
    }

# Notification storage
notifications_db = [
    {
        "id": "notif_001",
        "title": "Workflow completed",
        "message": "Data processing workflow finished successfully",
        "type": "success",
        "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=2)).isoformat(),
        "read": False
    },
    {
        "id": "notif_002",
        "title": "Robot offline",
        "message": "Robot-001 has gone offline",
        "type": "warning",
        "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(),
        "read": False
    },
    {
        "id": "notif_003",
        "title": "AI model trained",
        "message": "Classification model training completed",
        "type": "info",
        "timestamp": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
        "read": True
    }
]

@app.get("/api/v1/notifications")
async def get_notifications():
    """Get all notifications"""
    return {
        "status": "success",
        "data": notifications_db,
        "unread_count": len([n for n in notifications_db if not n["read"]])
    }

@app.post("/api/v1/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark notification as read"""
    for notification in notifications_db:
        if notification["id"] == notification_id:
            notification["read"] = True
            break

    return {"status": "success", "message": "Notification marked as read"}

@app.post("/api/v1/monitoring/start")
async def start_monitoring(request: TaskMonitoringRequest, background_tasks: BackgroundTasks):
    """Start monitoring a delegated task"""
    
    try:
        current_time = datetime.now(timezone.utc)
        
        monitor_data = {
            "delegation_id": request.delegation_id,
            "task_id": request.task_id,
            "agent_id": request.agent_id,
            "task_type": request.task_type,
            "estimated_completion": request.estimated_completion,
            "priority": request.priority,
            "start_time": current_time.isoformat(),
            "status": "monitoring",
            "current_progress": 0.0,
            "last_update": current_time.isoformat()
        }
        
        # Store in memory
        active_monitors[request.delegation_id] = monitor_data
        task_progress_history[request.delegation_id] = []
        detected_anomalies[request.delegation_id] = []
        
        # Store in database
        conn = sqlite3.connect(monitoring_db.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO task_monitors 
            (delegation_id, task_id, agent_id, task_type, priority, estimated_completion, 
             start_time, status, current_progress, last_update)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (request.delegation_id, request.task_id, request.agent_id, request.task_type,
              request.priority, request.estimated_completion, current_time.isoformat(),
              "monitoring", 0.0, current_time.isoformat()))
        
        conn.commit()
        conn.close()
        
        # Start background monitoring task
        background_tasks.add_task(monitor_task_execution, request.delegation_id)
        
        logger.info(f"Started monitoring task {request.delegation_id}")
        
        return {
            "message": f"Started monitoring task {request.delegation_id}",
            "monitor_id": request.delegation_id,
            "monitoring_started": monitor_data["start_time"],
            "version": "2.0"
        }
        
    except Exception as e:
        logger.error(f"Error starting monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/monitoring/progress")
async def update_task_progress(progress: TaskProgress):
    """Update task progress and check for anomalies"""
    
    try:
        if progress.delegation_id not in active_monitors:
            raise HTTPException(status_code=404, detail="Task not being monitored")
        
        # Store progress data
        progress_data = {
            "timestamp": progress.timestamp,
            "progress_percentage": progress.progress_percentage,
            "quality_metrics": progress.quality_metrics,
            "performance_indicators": progress.performance_indicators
        }
        
        task_progress_history[progress.delegation_id].append(progress_data)
        
        # Update monitor data
        active_monitors[progress.delegation_id]["last_update"] = progress.timestamp
        active_monitors[progress.delegation_id]["current_progress"] = progress.progress_percentage
        
        # Store in database
        conn = sqlite3.connect(monitoring_db.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO progress_history 
            (delegation_id, timestamp, progress_percentage, quality_metrics, performance_indicators)
            VALUES (?, ?, ?, ?, ?)
        ''', (progress.delegation_id, progress.timestamp, progress.progress_percentage,
              json.dumps(progress.quality_metrics), json.dumps(progress.performance_indicators)))
        
        # Update monitor status
        cursor.execute('''
            UPDATE task_monitors 
            SET current_progress = ?, last_update = ?
            WHERE delegation_id = ?
        ''', (progress.progress_percentage, progress.timestamp, progress.delegation_id))
        
        conn.commit()
        conn.close()
        
        # Check for anomalies
        anomalies = await detect_anomalies(progress.delegation_id, progress_data)
        
        if anomalies:
            detected_anomalies[progress.delegation_id].extend(anomalies)
            # Create alerts for critical anomalies
            for anomaly in anomalies:
                if anomaly["severity"] == "critical":
                    await create_alert(progress.delegation_id, anomaly)
        
        return {
            "message": "Progress updated successfully",
            "anomalies_detected": len(anomalies),
            "current_progress": progress.progress_percentage,
            "version": "2.0"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/monitoring/status/{delegation_id}")
async def get_monitoring_status(delegation_id: str):
    """Get current monitoring status for a task"""

    try:
        if delegation_id not in active_monitors:
            raise HTTPException(status_code=404, detail="Task not being monitored")

        monitor_data = active_monitors[delegation_id]
        progress_history = task_progress_history.get(delegation_id, [])
        anomalies = detected_anomalies.get(delegation_id, [])

        # Calculate current metrics
        current_progress = monitor_data.get("current_progress", 0.0)

        # Estimate completion based on progress rate
        estimated_completion = calculate_completion_estimate(delegation_id)

        # Assess task health
        health_score = assess_task_health(delegation_id)

        return {
            "delegation_id": delegation_id,
            "monitor_data": monitor_data,
            "current_progress": current_progress,
            "estimated_completion": estimated_completion,
            "health_score": health_score,
            "total_progress_updates": len(progress_history),
            "anomalies_detected": len(anomalies),
            "last_update": monitor_data["last_update"],
            "version": "2.0"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting monitoring status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/monitoring/anomalies/{delegation_id}")
async def get_task_anomalies(delegation_id: str):
    """Get detected anomalies for a specific task"""

    try:
        if delegation_id not in detected_anomalies:
            return {"delegation_id": delegation_id, "anomalies": [], "total_anomalies": 0}

        return {
            "delegation_id": delegation_id,
            "anomalies": detected_anomalies[delegation_id],
            "total_anomalies": len(detected_anomalies[delegation_id]),
            "version": "2.0"
        }

    except Exception as e:
        logger.error(f"Error getting anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/monitoring/dashboard")
async def get_monitoring_dashboard():
    """Get comprehensive monitoring dashboard data"""

    try:
        total_active = len(active_monitors)
        total_anomalies = sum(len(anomalies) for anomalies in detected_anomalies.values())
        critical_alerts = len([alert for alert in active_alerts.values() if alert["severity"] == "critical"])

        # Calculate average health score
        health_scores = [assess_task_health(delegation_id) for delegation_id in active_monitors.keys()]
        avg_health = sum(health_scores) / len(health_scores) if health_scores else 1.0

        # Recent anomalies (last 10)
        all_anomalies = []
        for delegation_id, anomalies in detected_anomalies.items():
            for anomaly in anomalies[-5:]:  # Last 5 per task
                anomaly_with_id = anomaly.copy()
                anomaly_with_id["delegation_id"] = delegation_id
                all_anomalies.append(anomaly_with_id)

        # Sort by detection time
        all_anomalies.sort(key=lambda x: x["detected_at"], reverse=True)

        # Task distribution by priority
        priority_distribution = {}
        for monitor in active_monitors.values():
            priority = monitor.get("priority", "medium")
            priority_distribution[priority] = priority_distribution.get(priority, 0) + 1

        # Task distribution by type
        type_distribution = {}
        for monitor in active_monitors.values():
            task_type = monitor.get("task_type", "unknown")
            type_distribution[task_type] = type_distribution.get(task_type, 0) + 1

        return {
            "dashboard": {
                "total_active_monitors": total_active,
                "total_anomalies_detected": total_anomalies,
                "critical_alerts": critical_alerts,
                "average_health_score": round(avg_health, 3),
                "system_status": "healthy" if avg_health > 0.7 else "degraded" if avg_health > 0.4 else "critical",
                "priority_distribution": priority_distribution,
                "type_distribution": type_distribution
            },
            "active_tasks": [
                {
                    "delegation_id": delegation_id,
                    "task_type": monitor.get("task_type", "unknown"),
                    "agent_id": monitor["agent_id"],
                    "progress": monitor.get("current_progress", 0.0),
                    "health": assess_task_health(delegation_id),
                    "priority": monitor["priority"],
                    "runtime": calculate_runtime(monitor["start_time"]),
                    "status": monitor["status"]
                }
                for delegation_id, monitor in active_monitors.items()
            ],
            "recent_anomalies": all_anomalies[:10],
            "version": "2.0"
        }

    except Exception as e:
        logger.error(f"Error generating dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/monitoring/alerts")
async def get_active_alerts():
    """Get all active alerts"""

    try:
        return {
            "alerts": list(active_alerts.values()),
            "total_alerts": len(active_alerts),
            "critical_count": len([a for a in active_alerts.values() if a["severity"] == "critical"]),
            "warning_count": len([a for a in active_alerts.values() if a["severity"] == "warning"]),
            "version": "2.0"
        }

    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/monitoring/stop/{delegation_id}")
async def stop_monitoring(delegation_id: str):
    """Stop monitoring a task"""

    try:
        if delegation_id not in active_monitors:
            raise HTTPException(status_code=404, detail="Task not being monitored")

        # Archive the monitoring data
        final_data = active_monitors.pop(delegation_id)
        final_data["stopped_at"] = datetime.now(timezone.utc).isoformat()

        # Update database
        conn = sqlite3.connect(monitoring_db.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            UPDATE task_monitors
            SET status = 'stopped', stopped_at = ?
            WHERE delegation_id = ?
        ''', (final_data["stopped_at"], delegation_id))

        conn.commit()
        conn.close()

        # Clean up memory
        task_progress_history.pop(delegation_id, None)
        detected_anomalies.pop(delegation_id, None)

        logger.info(f"Stopped monitoring task {delegation_id}")

        return {
            "message": f"Stopped monitoring task {delegation_id}",
            "final_data": final_data,
            "version": "2.0"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/monitoring/statistics")
async def get_monitoring_statistics():
    """Get comprehensive monitoring statistics"""

    try:
        # Get database statistics
        conn = sqlite3.connect(monitoring_db.db_path)
        cursor = conn.cursor()

        # Total tasks monitored
        cursor.execute("SELECT COUNT(*) FROM task_monitors")
        total_monitored = cursor.fetchone()[0]

        # Completed tasks
        cursor.execute("SELECT COUNT(*) FROM task_monitors WHERE status = 'stopped'")
        completed_tasks = cursor.fetchone()[0]

        # Average completion time
        cursor.execute('''
            SELECT AVG(julianday(stopped_at) - julianday(start_time)) * 24 * 60
            FROM task_monitors WHERE stopped_at IS NOT NULL
        ''')
        avg_completion_minutes = cursor.fetchone()[0] or 0

        # Task type distribution
        cursor.execute('''
            SELECT task_type, COUNT(*)
            FROM task_monitors
            GROUP BY task_type
        ''')
        task_type_stats = dict(cursor.fetchall())

        # Priority distribution
        cursor.execute('''
            SELECT priority, COUNT(*)
            FROM task_monitors
            GROUP BY priority
        ''')
        priority_stats = dict(cursor.fetchall())

        # Anomaly statistics
        cursor.execute("SELECT COUNT(*) FROM anomalies")
        total_anomalies = cursor.fetchone()[0]

        cursor.execute('''
            SELECT severity, COUNT(*)
            FROM anomalies
            GROUP BY severity
        ''')
        anomaly_severity_stats = dict(cursor.fetchall())

        conn.close()

        return {
            "monitoring_overview": {
                "total_tasks_monitored": total_monitored,
                "completed_tasks": completed_tasks,
                "currently_active": len(active_monitors),
                "average_completion_minutes": round(avg_completion_minutes, 1)
            },
            "task_distribution": {
                "by_type": task_type_stats,
                "by_priority": priority_stats
            },
            "anomaly_statistics": {
                "total_anomalies": total_anomalies,
                "by_severity": anomaly_severity_stats
            },
            "system_health": {
                "active_monitors": len(active_monitors),
                "active_alerts": len(active_alerts),
                "database_records": total_monitored
            },
            "version": "2.0"
        }

    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background monitoring and anomaly detection functions
async def monitor_task_execution(delegation_id: str):
    """Background task to continuously monitor task execution"""

    logger.info(f"Starting background monitoring for {delegation_id}")

    while delegation_id in active_monitors:
        try:
            # Simulate getting real-time data (in reality, this would come from agents/sensors)
            await simulate_task_progress(delegation_id)

            # Check for timeout
            await check_task_timeout(delegation_id)

            # Sleep for monitoring interval
            await asyncio.sleep(15)  # Check every 15 seconds

        except Exception as e:
            logger.error(f"Monitoring error for {delegation_id}: {e}")
            await asyncio.sleep(30)  # Wait longer on error

async def simulate_task_progress(delegation_id: str):
    """Simulate realistic task progress (replace with real sensor data)"""

    if delegation_id not in active_monitors:
        return

    monitor = active_monitors[delegation_id]
    current_time = datetime.now(timezone.utc)
    start_time = datetime.fromisoformat(monitor["start_time"].replace('Z', '+00:00'))
    elapsed_minutes = (current_time - start_time).total_seconds() / 60

    # Simulate progress based on elapsed time and task type
    task_type = monitor.get("task_type", "general")

    # Different task types have different completion patterns
    if task_type == "trading_execution":
        estimated_duration = 2  # Very fast
        base_progress = min(elapsed_minutes / estimated_duration, 1.0)
    elif task_type == "loan_application":
        estimated_duration = 15  # Medium speed
        base_progress = min(elapsed_minutes / estimated_duration, 1.0)
    elif task_type == "healthcare_triage":
        estimated_duration = 10  # Fast for emergencies
        base_progress = min(elapsed_minutes / estimated_duration, 1.0)
    elif task_type == "iot_monitoring":
        estimated_duration = 5  # Automated, fast
        base_progress = min(elapsed_minutes / estimated_duration, 1.0)
    else:
        estimated_duration = 30  # Default
        base_progress = min(elapsed_minutes / estimated_duration, 1.0)

    # Add realistic variation based on priority
    priority = monitor.get("priority", "medium")
    if priority == "high":
        variation = random.uniform(-0.02, 0.05)  # Slightly faster
    elif priority == "low":
        variation = random.uniform(-0.05, 0.02)  # Slightly slower
    else:
        variation = random.uniform(-0.03, 0.03)  # Normal variation

    current_progress = max(0, min(1.0, base_progress + variation))

    # Simulate quality metrics based on task type
    if task_type == "trading_execution":
        quality_metrics = {
            "execution_speed": random.uniform(0.95, 0.99),
            "price_accuracy": random.uniform(0.92, 0.98),
            "risk_compliance": random.uniform(0.98, 1.0)
        }
    elif task_type == "loan_application":
        quality_metrics = {
            "accuracy": random.uniform(0.88, 0.95),
            "compliance": random.uniform(0.95, 1.0),
            "processing_speed": random.uniform(0.80, 0.92)
        }
    elif task_type == "healthcare_triage":
        quality_metrics = {
            "diagnostic_accuracy": random.uniform(0.90, 0.98),
            "response_time": random.uniform(0.85, 0.95),
            "patient_safety": random.uniform(0.95, 1.0)
        }
    else:
        quality_metrics = {
            "precision": random.uniform(0.85, 0.98),
            "speed": random.uniform(0.70, 0.95),
            "safety": random.uniform(0.90, 1.0)
        }

    # Simulate performance indicators
    performance_indicators = {
        "cpu_usage": random.uniform(0.20, 0.80),
        "memory_usage": random.uniform(0.15, 0.70),
        "error_rate": random.uniform(0.0, 0.05),
        "network_latency": random.uniform(10, 100)  # milliseconds
    }

    # Create progress update
    progress_data = {
        "timestamp": current_time.isoformat(),
        "progress_percentage": round(current_progress, 3),
        "quality_metrics": quality_metrics,
        "performance_indicators": performance_indicators
    }

    # Store progress
    task_progress_history[delegation_id].append(progress_data)
    active_monitors[delegation_id]["current_progress"] = current_progress
    active_monitors[delegation_id]["last_update"] = current_time.isoformat()

    # Store in database
    try:
        conn = sqlite3.connect(monitoring_db.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO progress_history
            (delegation_id, timestamp, progress_percentage, quality_metrics, performance_indicators)
            VALUES (?, ?, ?, ?, ?)
        ''', (delegation_id, current_time.isoformat(), current_progress,
              json.dumps(quality_metrics), json.dumps(performance_indicators)))

        cursor.execute('''
            UPDATE task_monitors
            SET current_progress = ?, last_update = ?
            WHERE delegation_id = ?
        ''', (current_progress, current_time.isoformat(), delegation_id))

        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error storing progress data: {e}")

async def detect_anomalies(delegation_id: str, progress_data: Dict) -> List[Dict]:
    """Detect anomalies in task execution"""

    anomalies = []
    current_time = datetime.now(timezone.utc).isoformat()

    # Get historical data for comparison
    history = task_progress_history.get(delegation_id, [])
    if len(history) < 2:
        return anomalies  # Need some history to detect anomalies

    # Check for slow progress
    current_progress = progress_data["progress_percentage"]
    if len(history) >= 3:
        recent_progress = [h["progress_percentage"] for h in history[-3:]]
        progress_rate = (recent_progress[-1] - recent_progress[0]) / 3

        if progress_rate < 0.005 and current_progress < 0.8:  # Less than 0.5% progress per update
            anomalies.append({
                "anomaly_type": "slow_progress",
                "severity": "warning",
                "description": f"Task progress is slower than expected: {progress_rate:.3f}% per update",
                "detected_at": current_time,
                "metrics": {"progress_rate": progress_rate, "current_progress": current_progress},
                "suggested_actions": ["check_agent_status", "verify_task_requirements", "consider_intervention"]
            })

    # Check quality degradation
    quality_metrics = progress_data["quality_metrics"]
    for metric_name, value in quality_metrics.items():
        if value < 0.7:  # Below 70% quality threshold
            severity = "critical" if value < 0.5 else "warning"
            anomalies.append({
                "anomaly_type": "quality_degradation",
                "severity": severity,
                "description": f"Quality metric '{metric_name}' below threshold: {value:.3f}",
                "detected_at": current_time,
                "metrics": {metric_name: value},
                "suggested_actions": ["review_agent_performance", "adjust_parameters", "manual_intervention"]
            })

    # Check performance indicators
    performance = progress_data["performance_indicators"]

    # High error rate
    if performance.get("error_rate", 0) > 0.1:  # More than 10% error rate
        anomalies.append({
            "anomaly_type": "high_error_rate",
            "severity": "critical",
            "description": f"High error rate detected: {performance['error_rate']:.3f}",
            "detected_at": current_time,
            "metrics": {"error_rate": performance["error_rate"]},
            "suggested_actions": ["immediate_intervention", "agent_diagnostics", "task_reassignment"]
        })

    # High resource usage
    if performance.get("cpu_usage", 0) > 0.9:  # More than 90% CPU
        anomalies.append({
            "anomaly_type": "high_resource_usage",
            "severity": "warning",
            "description": f"High CPU usage detected: {performance['cpu_usage']:.3f}",
            "detected_at": current_time,
            "metrics": {"cpu_usage": performance["cpu_usage"]},
            "suggested_actions": ["monitor_resources", "optimize_performance", "scale_resources"]
        })

    # Store anomalies in database
    if anomalies:
        try:
            conn = sqlite3.connect(monitoring_db.db_path)
            cursor = conn.cursor()

            for anomaly in anomalies:
                cursor.execute('''
                    INSERT INTO anomalies
                    (delegation_id, anomaly_type, severity, description, detected_at, metrics, suggested_actions)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (delegation_id, anomaly["anomaly_type"], anomaly["severity"],
                      anomaly["description"], anomaly["detected_at"],
                      json.dumps(anomaly["metrics"]), json.dumps(anomaly["suggested_actions"])))

            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error storing anomalies: {e}")

    return anomalies

async def check_task_timeout(delegation_id: str):
    """Check if task is approaching or past estimated completion time"""

    if delegation_id not in active_monitors:
        return

    monitor = active_monitors[delegation_id]
    current_time = datetime.now(timezone.utc)
    estimated_completion = datetime.fromisoformat(monitor["estimated_completion"].replace('Z', '+00:00'))

    time_remaining = (estimated_completion - current_time).total_seconds() / 60  # minutes
    current_progress = monitor.get("current_progress", 0.0)

    # Check if task is at risk of timeout
    if time_remaining < 5 and current_progress < 0.8:  # Less than 5 minutes and less than 80% complete
        anomaly = {
            "anomaly_type": "timeout_risk",
            "severity": "warning",
            "description": f"Task at risk of timeout: {time_remaining:.1f} minutes remaining, {current_progress:.1%} complete",
            "detected_at": current_time.isoformat(),
            "metrics": {"time_remaining": time_remaining, "progress": current_progress},
            "suggested_actions": ["extend_deadline", "add_resources", "prioritize_task"]
        }

        detected_anomalies[delegation_id].append(anomaly)

        # Store in database
        try:
            conn = sqlite3.connect(monitoring_db.db_path)
            cursor = conn.cursor()

            cursor.execute('''
                INSERT INTO anomalies
                (delegation_id, anomaly_type, severity, description, detected_at, metrics, suggested_actions)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (delegation_id, anomaly["anomaly_type"], anomaly["severity"],
                  anomaly["description"], anomaly["detected_at"],
                  json.dumps(anomaly["metrics"]), json.dumps(anomaly["suggested_actions"])))

            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error storing timeout anomaly: {e}")

async def create_alert(delegation_id: str, anomaly: Dict):
    """Create an alert for critical anomalies"""

    alert_id = str(uuid.uuid4())
    alert = {
        "alert_id": alert_id,
        "delegation_id": delegation_id,
        "alert_type": anomaly["anomaly_type"],
        "message": anomaly["description"],
        "severity": anomaly["severity"],
        "created_at": anomaly["detected_at"]
    }

    active_alerts[alert_id] = alert

    # Store in database
    try:
        conn = sqlite3.connect(monitoring_db.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO alerts
            (alert_id, delegation_id, alert_type, message, severity, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (alert_id, delegation_id, alert["alert_type"], alert["message"],
              alert["severity"], alert["created_at"]))

        conn.commit()
        conn.close()

        logger.warning(f"Critical alert created for {delegation_id}: {alert['message']}")
    except Exception as e:
        logger.error(f"Error storing alert: {e}")

def calculate_completion_estimate(delegation_id: str) -> str:
    """Calculate estimated completion time based on current progress"""

    if delegation_id not in active_monitors:
        return "unknown"

    monitor = active_monitors[delegation_id]
    current_progress = monitor.get("current_progress", 0.0)

    if current_progress <= 0:
        return monitor["estimated_completion"]  # Original estimate

    # Calculate based on current progress rate
    start_time = datetime.fromisoformat(monitor["start_time"].replace('Z', '+00:00'))
    current_time = datetime.now(timezone.utc)
    elapsed_time = (current_time - start_time).total_seconds() / 60  # minutes

    if current_progress > 0:
        estimated_total_time = elapsed_time / current_progress
        estimated_completion = start_time + timedelta(minutes=estimated_total_time)
        return estimated_completion.isoformat()

    return monitor["estimated_completion"]

def assess_task_health(delegation_id: str) -> float:
    """Assess overall task health score (0.0 to 1.0)"""

    if delegation_id not in active_monitors:
        return 0.0

    health_score = 1.0

    # Penalize for anomalies
    anomalies = detected_anomalies.get(delegation_id, [])
    critical_anomalies = len([a for a in anomalies if a["severity"] == "critical"])
    warning_anomalies = len([a for a in anomalies if a["severity"] == "warning"])

    health_score -= critical_anomalies * 0.3  # -30% per critical anomaly
    health_score -= warning_anomalies * 0.1   # -10% per warning anomaly

    # Consider progress vs time
    monitor = active_monitors[delegation_id]
    current_progress = monitor.get("current_progress", 0.0)
    start_time = datetime.fromisoformat(monitor["start_time"].replace('Z', '+00:00'))
    elapsed_minutes = (datetime.now(timezone.utc) - start_time).total_seconds() / 60

    # Get task type specific expected duration
    task_type = monitor.get("task_type", "general")
    if task_type == "trading_execution":
        expected_duration = 2
    elif task_type == "loan_application":
        expected_duration = 15
    elif task_type == "healthcare_triage":
        expected_duration = 10
    elif task_type == "iot_monitoring":
        expected_duration = 5
    else:
        expected_duration = 30

    expected_progress = min(elapsed_minutes / expected_duration, 1.0)
    progress_ratio = current_progress / expected_progress if expected_progress > 0 else 1.0

    if progress_ratio < 0.5:  # Significantly behind
        health_score -= 0.4
    elif progress_ratio < 0.8:  # Somewhat behind
        health_score -= 0.2

    return max(0.0, min(1.0, health_score))

def calculate_runtime(start_time_str: str) -> str:
    """Calculate how long a task has been running"""

    start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
    runtime = datetime.now(timezone.utc) - start_time

    total_seconds = int(runtime.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60

    if hours > 0:
        return f"{hours}h {minutes}m"
    elif minutes > 0:
        return f"{minutes}m {seconds}s"
    else:
        return f"{seconds}s"

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting AI Task Monitoring Service v2.0.0")
    logger.info(f"Database path: {monitoring_db.db_path}")
    uvicorn.run(app, host="0.0.0.0", port=8003)
