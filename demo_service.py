#!/usr/bin/env python3
"""
Simplified Demo Service for Enterprise Automation Platform
Runs all services in a single process for demonstration
"""

import asyncio
import json
import random
import time
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import HTMLResponse
    from pydantic import BaseModel, Field
    import uvicorn
except ImportError:
    print("Installing required packages...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn[standard]"])
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import HTMLResponse
    from pydantic import BaseModel, Field
    import uvicorn

# Pydantic models for request validation
class TaskComplexity(BaseModel):
    technical: Optional[float] = Field(0.5, ge=0, le=1, description="Technical complexity (0-1)")
    temporal: Optional[float] = Field(0.5, ge=0, le=1, description="Time complexity (0-1)")
    resource: Optional[float] = Field(0.5, ge=0, le=1, description="Resource complexity (0-1)")
    coordination: Optional[float] = Field(0.5, ge=0, le=1, description="Coordination complexity (0-1)")
    risk: Optional[float] = Field(0.5, ge=0, le=1, description="Risk level (0-1)")
    cognitive: Optional[float] = Field(0.5, ge=0, le=1, description="Cognitive complexity (0-1)")

class TaskRequirements(BaseModel):
    precision: Optional[str] = Field("medium", description="Required precision level")
    speed: Optional[str] = Field("medium", description="Required speed level")
    safety: Optional[str] = Field("normal", description="Safety requirements")
    quality: Optional[str] = Field("standard", description="Quality requirements")

class TaskDelegationRequest(BaseModel):
    type: str = Field(..., description="Type of task (e.g., assembly, inspection, welding)")
    complexity: Optional[TaskComplexity] = Field(default_factory=TaskComplexity, description="Task complexity metrics")
    requirements: Optional[TaskRequirements] = Field(default_factory=TaskRequirements, description="Task requirements")
    deadline: Optional[str] = Field(None, description="Task deadline (ISO format)")
    priority: Optional[str] = Field("normal", description="Task priority level")

class WorkflowRequest(BaseModel):
    name: str = Field(..., description="Workflow name")
    description: Optional[str] = Field("", description="Workflow description")
    steps: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Workflow steps")

class RobotCommand(BaseModel):
    command: str = Field(..., description="Command to execute")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Command parameters")
    timestamp: Optional[str] = Field(None, description="Command timestamp")

class LoginRequest(BaseModel):
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")

class DecisionRequest(BaseModel):
    type: str = Field(..., description="Decision type")
    priority: Optional[str] = Field("normal", description="Decision priority")
    input_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Input data for decision")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Decision context")
    deadline_ms: Optional[int] = Field(100, description="Decision deadline in milliseconds")

# Create FastAPI app
app = FastAPI(
    title="Enterprise Automation Platform - Demo",
    description="Simplified demo of the complete automation platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo data storage
demo_data = {
    "workflows": [],
    "robots": [
        {
            "id": "ur5e_001",
            "name": "UR5e Assembly Robot",
            "type": "Universal Robots UR5e",
            "status": "online",
            "position": {"x": 100, "y": 200, "z": 300, "rx": 0, "ry": 0, "rz": 0},
            "capabilities": ["pick_and_place", "assembly", "welding"]
        },
        {
            "id": "abb_irb120_001",
            "name": "ABB IRB120 Precision Robot",
            "type": "ABB IRB 1200",
            "status": "online",
            "position": {"x": 150, "y": 250, "z": 350, "rx": 10, "ry": 5, "rz": 0},
            "capabilities": ["precision_assembly", "quality_inspection"]
        }
    ],
    "agents": [
        {
            "id": "human_operator_001",
            "type": "human",
            "name": "Senior Operator",
            "capabilities": {"supervision": 0.95, "quality_control": 0.9, "troubleshooting": 0.85},
            "status": "available"
        },
        {
            "id": "ai_vision_001",
            "type": "ai_system",
            "name": "Vision AI System",
            "capabilities": {"visual_inspection": 0.92, "defect_detection": 0.88, "measurement": 0.85},
            "status": "available"
        }
    ],
    "tasks": [],
    "metrics": {
        "system_health": 95,
        "active_workflows": 3,
        "completed_tasks": 127,
        "robot_utilization": 78,
        "efficiency_score": 92
    }
}

# Health endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "workflow-state-service": "healthy",
            "robot-abstraction-protocol": "healthy",
            "ai-task-delegation": "healthy",
            "edge-computing": "healthy",
            "security-compliance": "healthy",
            "monitoring-analytics": "healthy",
            "trading-task-delegation": "healthy",
            "market-signals-analysis": "healthy",
            "banking-learning-adapter": "healthy"
        }
    }

# Workflow State Service Endpoints (Port 8003)
@app.get("/api/v1/workflows")
async def get_workflows():
    return {"workflows": demo_data["workflows"]}

@app.post("/api/v1/workflows")
async def create_workflow(workflow: WorkflowRequest):
    """Create a new workflow with proper validation."""
    workflow_data = {
        "id": str(uuid.uuid4()),
        "name": workflow.name,
        "description": workflow.description,
        "steps": workflow.steps,
        "created_at": datetime.now().isoformat(),
        "status": "created",
        "created_by": "demo_user"
    }
    demo_data["workflows"].append(workflow_data)
    return workflow_data

@app.get("/api/v1/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    workflow = next((w for w in demo_data["workflows"] if w["id"] == workflow_id), None)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@app.post("/api/v1/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, execution_data: dict = None):
    workflow = next((w for w in demo_data["workflows"] if w["id"] == workflow_id), None)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    execution = {
        "id": str(uuid.uuid4()),
        "workflow_id": workflow_id,
        "status": "running",
        "started_at": datetime.now().isoformat(),
        "progress": 0
    }
    return execution

# Robot Abstraction Protocol Endpoints (Port 8004)
@app.get("/api/v1/robots")
async def get_robots():
    return {"robots": demo_data["robots"]}

@app.get("/api/v1/robots/{robot_id}")
async def get_robot(robot_id: str):
    robot = next((r for r in demo_data["robots"] if r["id"] == robot_id), None)
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    return robot

@app.get("/api/v1/robots/{robot_id}/status")
async def get_robot_status(robot_id: str):
    robot = next((r for r in demo_data["robots"] if r["id"] == robot_id), None)
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    
    return {
        "robot_id": robot_id,
        "status": robot["status"],
        "position": robot["position"],
        "mode": "auto",
        "speed": 75,
        "payload": 2.5,
        "cpu_usage": 45,
        "battery": 98,
        "last_update": datetime.now().isoformat(),
        "safety_violations": []
    }

@app.post("/api/v1/robots/{robot_id}/command")
async def send_robot_command(robot_id: str, command: RobotCommand):
    """Send a command to a specific robot."""
    robot = next((r for r in demo_data["robots"] if r["id"] == robot_id), None)
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    # Simulate command execution
    execution_time = 0.1 + (len(str(command.parameters)) * 0.01)  # Simulate processing time

    return {
        "command_id": str(uuid.uuid4()),
        "robot_id": robot_id,
        "command": command.command,
        "parameters": command.parameters,
        "status": "executed",
        "execution_time_ms": execution_time * 1000,
        "timestamp": command.timestamp or datetime.now().isoformat(),
        "result": f"Command '{command.command}' executed successfully on {robot['name']}"
    }

@app.get("/api/v1/capabilities")
async def get_capabilities():
    return {
        "robot_types": ["Universal Robots", "ABB", "KUKA", "Fanuc", "Boston Dynamics"],
        "supported_commands": ["move_to_position", "pick_object", "place_object", "start", "stop", "pause"],
        "safety_features": ["emergency_stop", "collision_detection", "workspace_monitoring"]
    }

# AI Task Delegation Endpoints (Port 8005)
@app.get("/api/v1/agents")
async def get_agents():
    return {"agents": demo_data["agents"]}

@app.post("/api/v1/agents/register")
async def register_agent(agent: dict):
    agent["id"] = agent.get("id", str(uuid.uuid4()))
    agent["registered_at"] = datetime.now().isoformat()
    demo_data["agents"].append(agent)
    return agent

@app.post("/api/v1/tasks/delegate")
async def delegate_task(task: TaskDelegationRequest):
    """
    Delegate a task to the most suitable agent using AI-powered selection.

    This endpoint analyzes task complexity and requirements to select the optimal agent
    from the available pool of humans, robots, and AI systems.
    """
    # Extract task data
    task_type = task.type
    complexity = task.complexity
    requirements = task.requirements

    # Calculate overall complexity score
    complexity_score = (
        complexity.technical * 0.25 +
        complexity.temporal * 0.15 +
        complexity.resource * 0.15 +
        complexity.coordination * 0.20 +
        complexity.risk * 0.15 +
        complexity.cognitive * 0.10
    )

    # Find best agent based on task type and complexity
    best_agent = None
    best_score = 0
    reasoning_factors = []

    for agent in demo_data["agents"]:
        if agent.get("status", "available") == "available":
            # Calculate capability match
            capability_score = 0
            capability_count = 0

            for capability, score in agent["capabilities"].items():
                if task_type in capability or capability in task_type:
                    capability_score += score
                    capability_count += 1
                    reasoning_factors.append(f"{capability}: {score:.2f}")

            # Average capability score
            if capability_count > 0:
                capability_score = capability_score / capability_count
            else:
                capability_score = 0.5  # Default score for unknown capabilities

            # Adjust score based on agent type and task requirements
            type_bonus = 0
            if agent["type"] == "robot" and requirements.precision == "high":
                type_bonus = 0.1
                reasoning_factors.append("Robot precision bonus: +0.1")
            elif agent["type"] == "human" and complexity_score > 0.7:
                type_bonus = 0.15
                reasoning_factors.append("Human complexity handling bonus: +0.15")
            elif agent["type"] == "ai_system" and task_type in ["inspection", "quality_control"]:
                type_bonus = 0.12
                reasoning_factors.append("AI vision system bonus: +0.12")

            final_score = capability_score + type_bonus

            if final_score > best_score:
                best_score = final_score
                best_agent = agent

    # Generate detailed reasoning
    reasoning = f"Selected {best_agent['type'] if best_agent else 'no agent'} with {best_score:.3f} score. "
    if reasoning_factors:
        reasoning += "Factors: " + ", ".join(reasoning_factors[:3])

    delegation_result = {
        "task_id": str(uuid.uuid4()),
        "task_type": task_type,
        "assigned_agent": best_agent["id"] if best_agent else None,
        "agent_name": best_agent["name"] if best_agent else None,
        "agent_type": best_agent["type"] if best_agent else None,
        "confidence": best_score,
        "complexity_analysis": {
            "overall_score": complexity_score,
            "technical": complexity.technical,
            "temporal": complexity.temporal,
            "resource": complexity.resource,
            "coordination": complexity.coordination,
            "risk": complexity.risk,
            "cognitive": complexity.cognitive
        },
        "requirements": {
            "precision": requirements.precision,
            "speed": requirements.speed,
            "safety": requirements.safety,
            "quality": requirements.quality
        },
        "delegation_time": datetime.now().isoformat(),
        "reasoning": reasoning,
        "estimated_completion_time": 300 + int(complexity_score * 600),  # Base 5 min + complexity
        "priority": task.priority
    }

    return delegation_result

@app.get("/api/v1/performance")
async def get_performance():
    return {
        "delegation_stats": {
            "total_delegations": 156,
            "success_rate": 0.94,
            "avg_response_time_ms": 45,
            "agent_utilization": 0.78
        },
        "agent_performance": [
            {"agent_id": "human_operator_001", "success_rate": 0.96, "avg_completion_time": 1200},
            {"agent_id": "ai_vision_001", "success_rate": 0.92, "avg_completion_time": 300}
        ]
    }

# Edge Computing Endpoints (Port 8006)
@app.post("/api/v1/decisions/make")
async def make_decision(decision_request: DecisionRequest):
    """
    Make real-time decisions with sub-10ms latency for edge computing scenarios.

    This endpoint simulates the edge computing decision-making process with
    ultra-fast response times for safety-critical and time-sensitive operations.
    """
    start_time = time.time()

    # Simulate fast decision making based on priority
    decision_type = decision_request.type
    priority = decision_request.priority
    input_data = decision_request.input_data
    context = decision_request.context

    # Priority-based decision logic
    if priority == "safety_critical":
        # Ultra-fast safety decision (< 1ms target)
        decision_result = "emergency_stop" if "danger" in str(input_data) else "proceed_with_caution"
        confidence = 0.98
        reasoning = "Safety-critical decision based on immediate threat assessment"
    elif priority == "critical":
        # Fast operational decision (< 10ms target)
        decision_result = "route_to_robot" if input_data.get("robot_required") else "route_to_human"
        confidence = 0.92
        reasoning = "Critical routing decision based on resource availability and task requirements"
    else:
        # Standard decision (< 100ms target)
        decision_result = "optimize_workflow" if "efficiency" in str(context) else "standard_processing"
        confidence = 0.85
        reasoning = "Standard decision based on workflow optimization analysis"

    # Enhanced decision object
    decision = {
        "decision_id": str(uuid.uuid4()),
        "type": decision_type,
        "priority": priority,
        "result": decision_result,
        "confidence": confidence,
        "reasoning": reasoning,
        "input_analysis": {
            "data_points": len(input_data),
            "context_factors": len(context),
            "complexity_score": min(len(str(input_data)) / 100, 1.0)
        },
        "alternatives_considered": [
            {"option": "route_to_human", "score": 0.75},
            {"option": "route_to_robot", "score": 0.85},
            {"option": "hybrid_approach", "score": 0.80}
        ]
    }

    processing_time = (time.time() - start_time) * 1000  # Convert to ms

    return {
        "request_id": str(uuid.uuid4()),
        "decision": decision,
        "processing_time_ms": processing_time,
        "target_time_ms": decision_request.deadline_ms,
        "performance_met": processing_time < decision_request.deadline_ms,
        "timestamp": datetime.now().isoformat(),
        "edge_node_id": "edge_node_001"
    }

@app.get("/api/v1/performance")
async def get_edge_performance():
    return {
        "avg_decision_time_ms": 8.5,
        "decisions_per_second": 1200,
        "cache_hit_rate": 0.85,
        "edge_nodes_online": 3
    }

# Security & Compliance Endpoints (Port 8007)
@app.post("/api/v1/auth/login")
async def login(credentials: LoginRequest):
    """Authenticate user and return access token."""
    # Simple demo authentication
    if credentials.username == "admin" and credentials.password == "admin123":
        return {
            "access_token": "demo_token_" + str(uuid.uuid4()),
            "token_type": "bearer",
            "expires_in": 3600,
            "user": {
                "username": credentials.username,
                "role": "admin",
                "permissions": ["read", "write", "admin"],
                "login_time": datetime.now().isoformat()
            }
        }
    elif credentials.username == "operator" and credentials.password == "operator123":
        return {
            "access_token": "demo_token_" + str(uuid.uuid4()),
            "token_type": "bearer",
            "expires_in": 3600,
            "user": {
                "username": credentials.username,
                "role": "operator",
                "permissions": ["read", "write"],
                "login_time": datetime.now().isoformat()
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/v1/auth/me")
async def get_current_user():
    return {
        "username": "admin",
        "role": "admin",
        "permissions": ["read", "write", "admin"],
        "last_login": datetime.now().isoformat()
    }

@app.get("/api/v1/users")
async def get_users():
    return {
        "users": [
            {
                "id": "user_001",
                "username": "admin",
                "email": "admin@automation.com",
                "role": "admin",
                "is_active": True,
                "last_login": datetime.now().isoformat()
            },
            {
                "id": "user_002",
                "username": "operator",
                "email": "operator@automation.com",
                "role": "operator",
                "is_active": True,
                "last_login": "2024-01-15T10:30:00"
            }
        ]
    }

# Monitoring & Analytics Endpoints (Port 8008)
@app.get("/api/v1/metrics")
async def get_metrics():
    return {
        "system_metrics": {
            "cpu_usage": 45.2,
            "memory_usage": 62.8,
            "disk_usage": 78.5,
            "network_io": 1250
        },
        "application_metrics": {
            "requests_per_second": 150,
            "response_time_ms": 85,
            "error_rate": 0.02,
            "active_connections": 45
        }
    }

@app.get("/api/v1/services")
async def get_services():
    return {
        "services": {
            "workflow-state-service": {
                "status": "healthy",
                "response_time_ms": 45,
                "uptime_percentage": 99.8,
                "error_rate": 0.01,
                "throughput": 120,
                "last_check": datetime.now().isoformat()
            },
            "robot-abstraction-protocol": {
                "status": "healthy",
                "response_time_ms": 12,
                "uptime_percentage": 99.9,
                "error_rate": 0.005,
                "throughput": 200,
                "last_check": datetime.now().isoformat()
            },
            "ai-task-delegation": {
                "status": "healthy",
                "response_time_ms": 67,
                "uptime_percentage": 99.7,
                "error_rate": 0.015,
                "throughput": 95,
                "last_check": datetime.now().isoformat()
            }
        }
    }

@app.get("/api/v1/analytics/dashboard")
async def get_dashboard():
    return {
        "key_metrics": {
            "system.cpu.usage": {"current_value": 45.2, "trend": "stable"},
            "system.memory.usage": {"current_value": 62.8, "trend": "increasing"},
            "system.disk.usage": {"current_value": 78.5, "trend": "stable"},
            "workflows.active": {"current_value": 3, "trend": "stable"},
            "robots.online": {"current_value": 2, "trend": "stable"}
        },
        "performance_summary": {
            "total_requests": 15420,
            "avg_response_time": 85,
            "success_rate": 0.98,
            "uptime": 0.998
        }
    }

@app.get("/api/v1/analytics/insights")
async def get_insights():
    return {
        "insights": [
            {
                "type": "performance",
                "title": "High Robot Utilization",
                "description": "Robot utilization is at 78%, consider adding more robots for peak hours",
                "severity": "medium",
                "recommendation": "Scale robot fleet during peak hours"
            },
            {
                "type": "efficiency",
                "title": "Workflow Optimization Opportunity",
                "description": "Assembly workflow can be optimized by 15% with parallel processing",
                "severity": "low",
                "recommendation": "Implement parallel task execution"
            }
        ]
    }

# Demo Dashboard
@app.get("/", response_class=HTMLResponse)
async def demo_dashboard():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Enterprise Automation Platform - Demo</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status.healthy { background: #10b981; color: white; }
            .metric { font-size: 24px; font-weight: bold; color: #2563eb; }
            .endpoint { background: #f3f4f6; padding: 8px; margin: 4px 0; border-radius: 4px; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Enterprise Automation Platform - Demo</h1>
                <p>Complete automation platform running on a single service for demonstration</p>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>🏥 System Health</h3>
                    <div class="status healthy">All Services Healthy</div>
                    <p>All 6 microservices are running and responding</p>
                </div>
                
                <div class="card">
                    <h3>🤖 Robot Fleet</h3>
                    <div class="metric">2</div>
                    <p>Robots online and ready</p>
                    <ul>
                        <li>UR5e Assembly Robot</li>
                        <li>ABB IRB120 Precision Robot</li>
                    </ul>
                </div>
                
                <div class="card">
                    <h3>📊 Key Metrics</h3>
                    <p><strong>System Health:</strong> <span class="metric">95%</span></p>
                    <p><strong>Active Workflows:</strong> <span class="metric">3</span></p>
                    <p><strong>Completed Tasks:</strong> <span class="metric">127</span></p>
                    <p><strong>Efficiency Score:</strong> <span class="metric">92%</span></p>
                </div>
                
                <div class="card">
                    <h3>🔗 API Endpoints</h3>
                    <div class="endpoint">GET /health</div>
                    <div class="endpoint">GET /api/v1/robots</div>
                    <div class="endpoint">GET /api/v1/workflows</div>
                    <div class="endpoint">POST /api/v1/tasks/delegate</div>
                    <div class="endpoint">GET /api/v1/metrics</div>
                    <p><a href="/docs" target="_blank">📖 View Full API Documentation</a></p>
                </div>
                
                <div class="card">
                    <h3>🎯 Demo Features</h3>
                    <ul>
                        <li>✅ Workflow Management</li>
                        <li>✅ Robot Control</li>
                        <li>✅ AI Task Delegation</li>
                        <li>✅ Edge Computing</li>
                        <li>✅ Security & Auth</li>
                        <li>✅ Monitoring & Analytics</li>
                    </ul>
                </div>
                
                <div class="card">
                    <h3>🚀 Quick Test</h3>
                    <p>Try these API calls:</p>
                    <div class="endpoint">curl http://localhost:8080/health</div>
                    <div class="endpoint">curl http://localhost:8080/api/v1/robots</div>
                    <div class="endpoint">curl http://localhost:8080/api/v1/metrics</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

# Trading Task Delegation Service Endpoints (Port 8005)
@app.post("/api/v1/trading/delegate-task")
async def delegate_trading_task(request: Dict[str, Any]):
    """Delegate trading task to optimal agent"""

    # Simulate trading task delegation
    task_id = request.get("task_id", str(uuid.uuid4()))
    market_type = request.get("market_type", "forex")
    trade_type = request.get("trade_type", "market_order")
    symbol = request.get("symbol", "EURUSD")
    value_usd = request.get("value_usd", 100000)
    urgency = request.get("urgency", "minute")

    # Select optimal trading agent based on task characteristics
    if urgency == "microsecond":
        agent = "hft_algo_lightning"
        agent_type = "hft_algorithm"
        execution_time_ms = 0.1
        success_rate = 0.98
    elif market_type == "cryptocurrency":
        agent = "crypto_specialist_jane"
        agent_type = "crypto_specialist"
        execution_time_ms = 200
        success_rate = 0.89
    elif market_type == "forex":
        agent = "forex_specialist_david"
        agent_type = "forex_specialist"
        execution_time_ms = 150
        success_rate = 0.91
    elif value_usd > 10000000:  # High-value trades
        agent = "risk_manager_mike"
        agent_type = "risk_manager"
        execution_time_ms = 30000
        success_rate = 0.96
    else:
        agent = "quant_algo_einstein"
        agent_type = "quantitative_algorithm"
        execution_time_ms = 15
        success_rate = 0.92

    return {
        "success": True,
        "delegation": {
            "task_id": task_id,
            "assigned_agent": agent,
            "agent_type": agent_type,
            "market_type": market_type,
            "trade_type": trade_type,
            "symbol": symbol,
            "value_usd": value_usd,
            "urgency": urgency,
            "estimated_execution_time_ms": execution_time_ms,
            "predicted_success_rate": success_rate,
            "predicted_profit_potential": round(0.02 + (value_usd / 10000000) * 0.01, 4),
            "confidence": 0.87,
            "reasoning": f"Selected {agent_type} for {market_type} {trade_type} based on {urgency} urgency and ${value_usd:,.0f} value",
            "delegation_timestamp": datetime.now().isoformat(),
            "version": "2.0 - Trading Optimized"
        },
        "message": f"Trading task {task_id} delegated successfully",
        "execution_ready": True
    }

@app.get("/api/v1/trading/agents")
async def get_trading_agents():
    """Get list of available trading agents"""

    return {
        "agents": [
            {"id": "hft_algo_lightning", "type": "hft_algorithm", "available": True, "latency_ms": 0.1, "success_rate": 0.98},
            {"id": "hft_algo_thunder", "type": "hft_algorithm", "available": True, "latency_ms": 0.2, "success_rate": 0.97},
            {"id": "quant_algo_einstein", "type": "quantitative_algorithm", "available": True, "latency_ms": 5, "success_rate": 0.92},
            {"id": "human_scalper_alex", "type": "human_scalper", "available": True, "latency_ms": 100, "success_rate": 0.85},
            {"id": "swing_trader_sarah", "type": "swing_trader", "available": True, "latency_ms": 1000, "success_rate": 0.83},
            {"id": "market_analyst_john", "type": "market_analyst", "available": True, "latency_ms": 60000, "success_rate": 0.87},
            {"id": "risk_manager_mike", "type": "risk_manager", "available": True, "latency_ms": 30000, "success_rate": 0.96},
            {"id": "crypto_specialist_jane", "type": "crypto_specialist", "available": True, "latency_ms": 200, "success_rate": 0.89},
            {"id": "forex_specialist_david", "type": "forex_specialist", "available": True, "latency_ms": 150, "success_rate": 0.91}
        ],
        "total_count": 9,
        "agent_types": ["hft_algorithm", "quantitative_algorithm", "human_scalper", "swing_trader", "market_analyst", "risk_manager", "crypto_specialist", "forex_specialist"],
        "average_latency_ms": 6728.8
    }

@app.get("/api/v1/trading/markets")
async def get_trading_markets():
    """Get supported trading markets"""

    return {
        "markets": {
            "forex": {
                "name": "Foreign Exchange",
                "trading_hours": "24/5",
                "typical_volatility": "medium",
                "leverage_available": "high",
                "recommended_agents": ["forex_specialist", "hft_algorithm"]
            },
            "stocks": {
                "name": "Stock Market",
                "trading_hours": "market_dependent",
                "typical_volatility": "low_to_medium",
                "leverage_available": "low",
                "recommended_agents": ["market_analyst", "swing_trader"]
            },
            "cryptocurrency": {
                "name": "Cryptocurrency",
                "trading_hours": "24/7",
                "typical_volatility": "high",
                "leverage_available": "medium",
                "recommended_agents": ["crypto_specialist", "quantitative_algorithm"]
            },
            "commodities": {
                "name": "Commodities",
                "trading_hours": "market_dependent",
                "typical_volatility": "medium",
                "leverage_available": "medium",
                "recommended_agents": ["market_analyst", "swing_trader"]
            },
            "derivatives": {
                "name": "Derivatives",
                "trading_hours": "market_dependent",
                "typical_volatility": "high",
                "leverage_available": "very_high",
                "recommended_agents": ["risk_manager", "market_analyst"]
            }
        },
        "total_markets": 5,
        "active_24_7": ["cryptocurrency"],
        "high_frequency_supported": ["forex", "stocks", "cryptocurrency"]
    }

@app.get("/api/v1/trading/performance")
async def get_trading_performance():
    """Get trading performance metrics"""

    return {
        "performance_metrics": {
            "total_trades_delegated": 1247,
            "success_rate": 0.923,
            "average_execution_time_ms": 156,
            "total_profit_generated": 2847392.50,
            "risk_incidents": 3,
            "client_satisfaction": 0.94,
            "hft_trades_percentage": 0.36,
            "algorithmic_trades_percentage": 0.64
        },
        "agent_performance": {
            "hft_algorithms": {
                "trades_executed": 456,
                "success_rate": 0.98,
                "average_latency_ms": 0.15,
                "profit_contribution": 0.35
            },
            "human_traders": {
                "trades_executed": 234,
                "success_rate": 0.89,
                "average_execution_time_ms": 1200,
                "profit_contribution": 0.28
            },
            "quantitative_algorithms": {
                "trades_executed": 557,
                "success_rate": 0.91,
                "average_execution_time_ms": 15,
                "profit_contribution": 0.37
            }
        },
        "market_breakdown": {
            "forex": {"trades": 423, "profit": 1247832.10, "success_rate": 0.91},
            "stocks": {"trades": 298, "profit": 567234.80, "success_rate": 0.87},
            "crypto": {"trades": 356, "profit": 892156.30, "success_rate": 0.89},
            "commodities": {"trades": 123, "profit": 98234.50, "success_rate": 0.83},
            "derivatives": {"trades": 47, "profit": 41934.80, "success_rate": 0.96}
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/trading/feedback")
async def submit_trading_feedback(request: Dict[str, Any]):
    """Submit trading execution feedback"""

    try:
        # Extract feedback data
        task_id = request.get("task_id", "unknown")
        agent_id = request.get("agent_id", "unknown")
        execution_success = request.get("execution_success", True)
        profit_loss = request.get("profit_loss", 0.0)
        execution_quality = request.get("execution_quality", 0.9)
        risk_compliance = request.get("risk_compliance", 0.95)
        client_satisfaction = request.get("client_satisfaction", 0.9)
        estimated_duration_ms = request.get("estimated_duration_ms", 1000)
        actual_duration_ms = request.get("actual_duration_ms", 1000)

        # Calculate composite performance score
        performance_score = (
            execution_quality * 0.3 +
            (1.0 if execution_success else 0.0) * 0.25 +
            risk_compliance * 0.25 +
            client_satisfaction * 0.2
        )

        # Adjust for profitability
        if profit_loss > 0:
            performance_score = min(1.0, performance_score + 0.1)
        elif profit_loss < 0:
            performance_score = max(0.0, performance_score - 0.1)

        return {
            "success": True,
            "feedback_id": str(uuid.uuid4()),
            "task_id": task_id,
            "agent_id": agent_id,
            "performance_score": round(performance_score, 3),
            "profit_loss": profit_loss,
            "execution_time_variance": actual_duration_ms - estimated_duration_ms,
            "profit_impact": "positive" if profit_loss > 0 else "negative" if profit_loss < 0 else "neutral",
            "message": "Trading feedback recorded successfully",
            "timestamp": datetime.now().isoformat(),
            "version": "2.0"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/trading/analytics")
async def get_trading_analytics():
    """Get trading-specific analytics dashboard"""

    return {
        "trading_overview": {
            "total_trades_processed": 1247,
            "active_agents": 9,
            "markets_covered": ["forex", "stocks", "crypto", "derivatives", "commodities"],
            "avg_execution_time": "156ms",
            "version": "2.0"
        },
        "performance_metrics": {
            "success_rate": "92.3%",
            "avg_profit_per_trade": "2.1%",
            "total_volume_24h": "$2.8M",
            "hft_latency": "0.15ms avg",
            "algo_vs_human": {
                "algo_trades": "64% of volume",
                "human_trades": "36% of volume",
                "algo_success": "94.2%",
                "human_success": "89.1%"
            }
        },
        "market_breakdown": {
            "forex": "45% of trades (423 trades, $1.25M profit)",
            "stocks": "25% of trades (298 trades, $567K profit)",
            "crypto": "20% of trades (356 trades, $892K profit)",
            "derivatives": "10% of trades (47 trades, $42K profit)"
        },
        "top_performers": [
            {"agent_id": "hft_algo_lightning", "success_rate": 0.98, "avg_latency_ms": 0.1},
            {"agent_id": "risk_manager_mike", "success_rate": 0.96, "avg_profit": 0.035},
            {"agent_id": "quant_algo_einstein", "success_rate": 0.92, "trades_executed": 557},
            {"agent_id": "forex_specialist_david", "success_rate": 0.91, "market": "forex"},
            {"agent_id": "crypto_specialist_jane", "success_rate": 0.89, "market": "crypto"}
        ],
        "optimization_insights": [
            "HFT algorithms dominate microsecond trades with 98% success",
            "Crypto specialists handle volatile markets with 89% success",
            "Risk managers reduce losses by 40% on high-value trades",
            "24/7 algorithmic coverage maintains consistent performance"
        ],
        "data_source": "live_trading_data",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0"
    }

@app.get("/api/v1/trading/market-status")
async def get_market_status():
    """Get current market status and trading opportunities"""

    current_hour = datetime.now().hour

    return {
        "market_status": {
            "forex": {
                "status": "open" if 0 <= current_hour <= 23 else "limited",
                "volatility": "medium",
                "major_pairs": ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF"],
                "recommended_agents": ["hft_algo_lightning", "forex_specialist_david"],
                "current_spread": "0.8 pips avg"
            },
            "stocks": {
                "status": "open" if 9 <= current_hour <= 16 else "closed",
                "volatility": "low_to_medium",
                "hot_sectors": ["technology", "healthcare", "renewable_energy"],
                "recommended_agents": ["quant_algo_einstein", "swing_trader_sarah", "market_analyst_john"],
                "market_cap_focus": "large_cap_preferred"
            },
            "cryptocurrency": {
                "status": "24/7",
                "volatility": "high",
                "trending": ["BTC", "ETH", "SOL", "ADA", "DOT"],
                "recommended_agents": ["crypto_specialist_jane", "hft_algo_thunder"],
                "market_sentiment": "bullish"
            },
            "commodities": {
                "status": "open" if 6 <= current_hour <= 17 else "limited",
                "volatility": "medium",
                "trending": ["gold", "silver", "crude_oil", "natural_gas"],
                "recommended_agents": ["market_analyst_john", "swing_trader_sarah"],
                "seasonal_factors": "energy_demand_high"
            },
            "derivatives": {
                "status": "open" if 9 <= current_hour <= 16 else "limited",
                "volatility": "very_high",
                "popular_instruments": ["SPX_options", "VIX_futures", "currency_swaps"],
                "recommended_agents": ["risk_manager_mike", "market_analyst_john"],
                "risk_warning": "high_leverage_instruments"
            }
        },
        "delegation_recommendations": {
            "high_frequency": "Use HFT algorithms for < 1ms execution requirements",
            "large_volume": "Route trades >$10M through risk managers for oversight",
            "crypto_volatile": "Prefer crypto specialists for digital asset volatility",
            "off_hours": "Use algorithms for 24/7 coverage and consistency",
            "complex_derivatives": "Human analysts required for complex instruments",
            "risk_management": "Risk managers mandatory for >$5M single trades"
        },
        "market_opportunities": {
            "forex": "EUR/USD showing strong momentum, ideal for scalping",
            "crypto": "Bitcoin consolidation phase, good for swing trading",
            "stocks": "Tech sector rotation creating arbitrage opportunities",
            "commodities": "Gold futures showing seasonal strength"
        },
        "timestamp": datetime.now().isoformat(),
        "version": "2.0"
    }

# Market Signals & Analysis Service Endpoints (Port 8006)
@app.post("/api/v1/signals/analyze")
async def analyze_market_signals(request: Dict[str, Any]):
    """Generate comprehensive market analysis and buy/sell signals"""

    try:
        # Extract request data
        symbol = request.get("symbol", "BTC/USD")
        market_type = request.get("market_type", "crypto")
        timeframe = request.get("timeframe", "1h")

        # Simulate market analysis
        current_price = {
            "BTC/USD": 67500.00,
            "ETH/USD": 3850.00,
            "EUR/USD": 1.0850,
            "AAPL": 185.50,
            "NVDA": 875.30
        }.get(symbol, 100.0)

        # Generate realistic price movement
        price_change = random.uniform(-0.05, 0.05)
        current_price = current_price * (1 + price_change)

        # Technical indicators
        rsi = random.uniform(30, 70)
        macd = random.uniform(-0.3, 0.3)

        # Generate signal based on indicators
        if rsi < 35 and macd > 0:
            signal = "buy"
            confidence = 0.85
            reasoning = "RSI oversold; MACD bullish crossover"
        elif rsi > 65 and macd < 0:
            signal = "sell"
            confidence = 0.82
            reasoning = "RSI overbought; MACD bearish divergence"
        else:
            signal = "hold"
            confidence = 0.65
            reasoning = "Mixed signals; sideways trend"

        # AI prediction
        ai_prediction = {
            "24h": {
                "predicted_price": current_price * (1 + random.uniform(-0.03, 0.05)),
                "confidence": 0.78,
                "price_change_percent": random.uniform(-3, 5)
            }
        }

        # Market sentiment
        sentiment = {
            "overall_sentiment": random.uniform(-0.3, 0.6),
            "sentiment_label": random.choice(["positive", "neutral", "bullish"]),
            "fear_greed_index": random.randint(40, 80)
        }

        return {
            "success": True,
            "analysis": {
                "signal": {
                    "symbol": symbol,
                    "market_type": market_type,
                    "signal": signal,
                    "confidence": confidence,
                    "entry_price": round(current_price * 0.99, 4),
                    "target_price": round(current_price * 1.05, 4),
                    "stop_loss": round(current_price * 0.97, 4),
                    "timeframe": timeframe,
                    "reasoning": reasoning,
                    "risk_reward_ratio": 1.67,
                    "generated_at": datetime.now().isoformat()
                },
                "technical_indicators": {
                    "rsi": round(rsi, 2),
                    "macd": round(macd, 4),
                    "bollinger_position": random.uniform(0.2, 0.8),
                    "moving_average_trend": "bullish" if macd > 0 else "bearish",
                    "volume_trend": "increasing",
                    "support_level": round(current_price * 0.95, 4),
                    "resistance_level": round(current_price * 1.05, 4)
                },
                "ai_prediction": ai_prediction,
                "market_sentiment": sentiment,
                "market_data": {
                    "symbol": symbol,
                    "current_price": round(current_price, 4),
                    "price_change_24h": round(price_change * 100, 2),
                    "volume_24h": random.randint(1000000, 50000000)
                },
                "analysis_timestamp": datetime.now().isoformat(),
                "version": "3.0"
            },
            "message": f"Market analysis completed for {symbol}",
            "version": "3.0"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/signals/trending")
async def get_trending_signals():
    """Get trending buy/sell signals across markets"""

    trending_assets = [
        {"symbol": "BTC/USD", "market": "crypto", "signal": "buy", "confidence": 0.87, "price_change": "+3.2%"},
        {"symbol": "EUR/USD", "market": "forex", "signal": "sell", "confidence": 0.72, "price_change": "-0.8%"},
        {"symbol": "AAPL", "market": "stocks", "signal": "strong_buy", "confidence": 0.91, "price_change": "+2.1%"},
        {"symbol": "ETH/USD", "market": "crypto", "signal": "hold", "confidence": 0.65, "price_change": "+0.5%"},
        {"symbol": "TSLA", "market": "stocks", "signal": "buy", "confidence": 0.78, "price_change": "+1.8%"},
        {"symbol": "NVDA", "market": "stocks", "signal": "strong_buy", "confidence": 0.93, "price_change": "+4.2%"}
    ]

    return {
        "trending_signals": trending_assets,
        "market_overview": {
            "bullish_signals": 4,
            "bearish_signals": 1,
            "neutral_signals": 1,
            "average_confidence": 0.81,
            "total_assets_analyzed": len(trending_assets)
        },
        "generated_at": datetime.now().isoformat(),
        "version": "3.0"
    }

@app.get("/api/v1/signals/portfolio-scanner")
async def scan_portfolio_signals():
    """Scan multiple assets for immediate trading opportunities"""

    opportunities = [
        {
            "symbol": "NVDA",
            "signal": "strong_buy",
            "confidence": 0.93,
            "entry_price": 875.30,
            "target_price": 920.00,
            "stop_loss": 850.00,
            "risk_reward_ratio": 1.8,
            "urgency": "high",
            "reasoning": "AI chip demand surge; RSI oversold; positive earnings outlook",
            "timeframe": "1d"
        },
        {
            "symbol": "SOL/USD",
            "signal": "buy",
            "confidence": 0.84,
            "entry_price": 175.00,
            "target_price": 195.00,
            "stop_loss": 165.00,
            "risk_reward_ratio": 2.0,
            "urgency": "medium",
            "reasoning": "Strong DeFi ecosystem growth; technical breakout pattern",
            "timeframe": "4h"
        },
        {
            "symbol": "EUR/USD",
            "signal": "sell",
            "confidence": 0.76,
            "entry_price": 1.0850,
            "target_price": 1.0750,
            "stop_loss": 1.0900,
            "risk_reward_ratio": 2.0,
            "urgency": "medium",
            "reasoning": "ECB dovish stance; USD strength; technical resistance",
            "timeframe": "1h"
        }
    ]

    return {
        "immediate_opportunities": opportunities,
        "scan_summary": {
            "assets_scanned": 50,
            "opportunities_found": len(opportunities),
            "avg_confidence": 0.84,
            "high_urgency": 1,
            "medium_urgency": 2,
            "low_urgency": 0
        },
        "scan_timestamp": datetime.now().isoformat(),
        "version": "3.0"
    }

@app.get("/api/v1/signals/market-overview")
async def get_market_overview():
    """Get comprehensive market overview with sentiment and trends"""

    return {
        "market_sentiment": {
            "overall": "bullish",
            "fear_greed_index": 72,
            "crypto_sentiment": "very_bullish",
            "forex_sentiment": "neutral",
            "stocks_sentiment": "bullish",
            "commodities_sentiment": "bearish"
        },
        "market_trends": {
            "crypto": {
                "trend": "upward",
                "strength": 0.85,
                "key_drivers": ["institutional_adoption", "etf_inflows", "defi_growth"]
            },
            "stocks": {
                "trend": "upward",
                "strength": 0.72,
                "key_drivers": ["ai_revolution", "earnings_growth", "fed_pause"]
            },
            "forex": {
                "trend": "mixed",
                "strength": 0.45,
                "key_drivers": ["central_bank_divergence", "geopolitical_tensions"]
            }
        },
        "top_movers": {
            "gainers": [
                {"symbol": "NVDA", "change": "+4.2%", "signal": "strong_buy"},
                {"symbol": "BTC/USD", "change": "+3.2%", "signal": "buy"},
                {"symbol": "AAPL", "change": "+2.1%", "signal": "strong_buy"}
            ],
            "losers": [
                {"symbol": "EUR/USD", "change": "-0.8%", "signal": "sell"},
                {"symbol": "GBP/USD", "change": "-0.6%", "signal": "hold"}
            ]
        },
        "analysis_timestamp": datetime.now().isoformat(),
        "version": "3.0"
    }

# Banking Learning Service Adapter V2 Endpoints (Port 8006)
@app.post("/api/v1/banking/delegate-loan")
async def delegate_loan_application(request: Dict[str, Any]):
    """Delegate loan application processing to optimal agent"""

    try:
        # Extract loan application data
        application_id = request.get("application_id", f"LOAN_{random.randint(10000, 99999)}")
        loan_type = request.get("loan_type", "personal_loan")
        loan_amount = float(request.get("loan_amount", 50000))
        credit_score = int(request.get("credit_score", 720))
        debt_to_income = float(request.get("debt_to_income", 0.35))
        documentation_quality = float(request.get("documentation_quality", 0.85))

        # Calculate risk level
        if loan_amount > 1000000:
            risk_level = "regulatory_review"
        elif credit_score < 600 or debt_to_income > 0.5:
            risk_level = "high_risk"
        elif credit_score < 700 or debt_to_income > 0.36:
            risk_level = "medium_risk"
        else:
            risk_level = "low_risk"

        # Calculate complexity score
        complexity = 0.0
        if loan_amount > 500000:
            complexity += 0.3
        elif loan_amount > 100000:
            complexity += 0.2
        else:
            complexity += 0.1

        if credit_score < 600:
            complexity += 0.3
        elif credit_score < 700:
            complexity += 0.2
        else:
            complexity += 0.1

        complexity += (1 - documentation_quality) * 0.2

        type_complexity = {
            "personal_loan": 0.1,
            "auto_loan": 0.2,
            "mortgage_loan": 0.3,
            "business_loan": 0.4,
            "credit_line": 0.2
        }
        complexity += type_complexity.get(loan_type, 0.2)
        complexity = min(complexity, 1.0)

        # Apply banking delegation rules
        assigned_agent = "ai_underwriter_001"
        agent_type = "ai_system"
        reasoning = "Default AI assignment"

        # Regulatory review required (loans > $1M)
        if risk_level == "regulatory_review":
            assigned_agent = "compliance_officer_mike"
            agent_type = "compliance_officer"
            reasoning = f"Regulatory review required for ${loan_amount:,} loan amount"

        # High-value loans (>$500K) need human oversight
        elif loan_amount > 500000:
            assigned_agent = "senior_officer_john"
            agent_type = "senior_analyst"
            reasoning = f"High-value loan (${loan_amount:,}) requires senior analyst oversight"

        # High-risk loans need senior analysts
        elif risk_level == "high_risk":
            assigned_agent = "senior_officer_john"
            agent_type = "senior_analyst"
            reasoning = f"High-risk loan (credit {credit_score}, DTI {debt_to_income:.2f}) needs senior expertise"

        # AI-suitable loans
        elif (risk_level in ["low_risk", "medium_risk"] and
              loan_amount <= 100000 and
              credit_score >= 700 and
              loan_type in ["personal_loan", "auto_loan"] and
              documentation_quality >= 0.8):
            assigned_agent = "ai_underwriter_001"
            agent_type = "ai_system"
            reasoning = f"AI-suitable: ${loan_amount:,}, credit {credit_score}, {loan_type}, quality {documentation_quality:.2f}"

        # Business loans and mortgages always go to human analysts
        elif loan_type in ["business_loan", "mortgage_loan"]:
            assigned_agent = "specialist_sarah"
            agent_type = "specialist"
            reasoning = f"Specialist required for {loan_type} loan type"

        # Default to senior analyst
        else:
            assigned_agent = "senior_officer_john"
            agent_type = "senior_analyst"
            reasoning = f"Complex loan (complexity: {complexity:.2f}) assigned to senior analyst"

        # Calculate processing time based on agent and complexity
        if "ai" in assigned_agent:
            processing_time = 8 if complexity < 0.3 else 15 if complexity < 0.6 else 25
            success_rate = 0.98 if complexity < 0.3 else 0.85 if complexity < 0.6 else 0.70
            confidence = 0.9 if complexity < 0.3 else 0.7 if complexity < 0.6 else 0.4
        elif "senior" in assigned_agent:
            processing_time = int(35 + complexity * 40)
            success_rate = 0.95
            confidence = 0.9
        elif "specialist" in assigned_agent:
            processing_time = int(50 + complexity * 30)
            success_rate = 0.92
            confidence = 0.85
        elif "compliance" in assigned_agent:
            processing_time = int(90 + complexity * 60)
            success_rate = 0.99
            confidence = 0.95
        else:  # junior analyst
            processing_time = int(70 + complexity * 50)
            success_rate = 0.82
            confidence = 0.70

        return {
            "success": True,
            "delegation": {
                "application_id": application_id,
                "assigned_agent": assigned_agent,
                "agent_type": agent_type,
                "risk_level": risk_level,
                "complexity_score": round(complexity, 3),
                "estimated_processing_time": processing_time,
                "predicted_success_rate": success_rate,
                "confidence": confidence,
                "reasoning": reasoning,
                "delegation_timestamp": datetime.now().isoformat(),
                "version": "2.0 - Optimized Rules"
            },
            "message": f"Loan application {application_id} delegated successfully",
            "version": "2.0"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/banking/analytics")
async def get_banking_analytics():
    """Get enhanced banking-specific analytics dashboard"""

    return {
        "banking_overview": {
            "total_loans_processed": 1247,
            "agents_active": 5,
            "loan_types_handled": ["personal_loan", "business_loan", "mortgage_loan", "auto_loan", "credit_line"],
            "version": "2.0"
        },
        "performance_metrics": {
            "average_processing_time": "32 minutes",
            "approval_accuracy": "91.2%",
            "system_efficiency": "optimized",
            "ai_vs_human_performance": {
                "ai_avg_quality": "92.5%",
                "human_avg_quality": "89.8%"
            }
        },
        "agent_rankings": [
            {"agent_id": "ai_underwriter_001", "quality_score": 0.925, "specialization": "simple_loans", "loans_processed": 487},
            {"agent_id": "senior_officer_john", "quality_score": 0.912, "specialization": "complex_loans", "loans_processed": 298},
            {"agent_id": "compliance_officer_mike", "quality_score": 0.965, "specialization": "regulatory_review", "loans_processed": 23},
            {"agent_id": "specialist_sarah", "quality_score": 0.889, "specialization": "mortgages", "loans_processed": 156},
            {"agent_id": "junior_officer_jane", "quality_score": 0.823, "specialization": "standard_loans", "loans_processed": 283}
        ],
        "optimization_insights": [
            "AI handles 487 loans with 92.5% avg quality",
            "Human agents handle complex loans with 89.8% avg quality",
            "V2 rules optimize for loan value, risk, and complexity"
        ],
        "recommendations": [
            "Route personal loans (<$100k, credit >700) to AI system",
            "Route high-value loans (>$500k) to senior analysts",
            "Route business/mortgage loans to specialists",
            "Use compliance officers for regulatory review (>$1M)"
        ],
        "data_source": "integrated_analytics",
        "version": "2.0"
    }

@app.get("/api/v1/banking/rules-explanation")
async def get_delegation_rules():
    """Get detailed explanation of delegation rules"""
    return {
        "delegation_rules": {
            "regulatory_review": {
                "condition": "Loan amount > $1,000,000",
                "agent": "compliance_officer",
                "reasoning": "Legal requirement for large loans"
            },
            "high_value": {
                "condition": "Loan amount > $500,000",
                "agent": "senior_analyst or specialist",
                "reasoning": "Human oversight required for significant financial exposure"
            },
            "high_risk": {
                "condition": "Credit score < 600 OR debt-to-income > 50%",
                "agent": "senior_analyst",
                "reasoning": "Complex risk assessment requires human expertise"
            },
            "ai_suitable": {
                "condition": "Low/Medium risk AND amount ≤ $100k AND credit ≥ 700 AND (personal OR auto) AND documentation ≥ 80%",
                "agent": "ai_underwriter",
                "reasoning": "Straightforward loans perfect for AI efficiency"
            },
            "complex_loan_types": {
                "condition": "Business loans OR mortgage loans",
                "agent": "senior_analyst or specialist",
                "reasoning": "Complex loan types require human judgment"
            }
        },
        "optimization_goals": [
            "Maximize AI efficiency for suitable loans",
            "Ensure human oversight for high-risk/high-value loans",
            "Maintain regulatory compliance",
            "Optimize processing time while maintaining quality"
        ],
        "version": "2.0"
    }

if __name__ == "__main__":
    print("🚀 Starting Enterprise Automation Platform Demo")
    print("=" * 50)
    print("🌐 Dashboard: http://localhost:8080")
    print("📖 API Docs: http://localhost:8080/docs")
    print("🏥 Health Check: http://localhost:8080/health")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")
