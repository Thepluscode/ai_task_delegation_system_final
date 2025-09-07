"""
Intelligent Automation Service
Provides intelligent auto-assignment, workflow orchestration, and ML-based optimization
"""

import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import asyncio
import logging
from datetime import datetime
import json

# Import our intelligent automation components
from services.intelligent_assignment.auto_assignment_engine import IntelligentAutoAssignmentEngine
from services.automation.workflow_orchestrator import WorkflowOrchestrator, AutomatedWorkflow
from services.ml.performance_predictor import PerformancePredictor
from services.core.database import DatabaseManager
from services.core.models import Task, Agent, Assignment

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Intelligent Automation Service",
    description="AI-powered task assignment and workflow orchestration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
db_manager = DatabaseManager()
assignment_engine = IntelligentAutoAssignmentEngine(db_manager)
workflow_orchestrator = WorkflowOrchestrator(db_manager)
performance_predictor = PerformancePredictor(db_manager)

# Pydantic models for API
class TaskSubmissionRequest(BaseModel):
    task_id: str
    task_type: str
    priority: str = "MEDIUM"
    complexity: float = Field(ge=0.0, le=1.0)
    estimated_duration: int = Field(gt=0)
    quality_requirements: float = Field(ge=0.0, le=1.0)
    safety_requirements: float = Field(ge=0.0, le=1.0)
    location: str = "default"
    industry: str = "manufacturing"
    auto_assign: bool = True
    deadline: Optional[datetime] = None
    parameters: Optional[Dict] = None

class WorkflowCreationRequest(BaseModel):
    name: str
    industry: str = "manufacturing"
    priority: str = "MEDIUM"
    steps: List[Dict]
    auto_assignment: bool = True
    load_balancing: bool = True

class AgentPerformancePredictionRequest(BaseModel):
    task_id: str
    agent_ids: List[str]

class AutoAssignmentConfigRequest(BaseModel):
    industry: str
    optimization_weights: Dict[str, float]
    constraints: Dict[str, Any]

# API Endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "intelligent-automation",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "assignment_engine": "active",
            "workflow_orchestrator": "active",
            "performance_predictor": "active"
        }
    }

@app.post("/api/v1/automation/submit-task")
async def submit_task_for_automation(request: TaskSubmissionRequest, background_tasks: BackgroundTasks):
    """Submit a task for intelligent auto-assignment"""
    try:
        # Create task object
        task = Task(
            task_id=request.task_id,
            task_type=request.task_type,
            priority=request.priority,
            complexity=request.complexity,
            estimated_duration=request.estimated_duration,
            quality_requirements=request.quality_requirements,
            safety_requirements=request.safety_requirements,
            location=request.location,
            deadline=request.deadline,
            parameters=request.parameters,
            status="PENDING",
            created_at=datetime.now()
        )
        
        if request.auto_assign:
            # Auto-assign using intelligent engine
            assignment = await assignment_engine.auto_assign_task(task, request.industry)
            
            if assignment:
                return {
                    "status": "success",
                    "message": "Task automatically assigned",
                    "task_id": task.task_id,
                    "assignment": {
                        "assignment_id": assignment.assignment_id,
                        "agent_id": assignment.agent_id,
                        "confidence_score": assignment.confidence_score,
                        "assignment_method": assignment.assignment_method
                    }
                }
            else:
                # Add to queue for later processing
                await workflow_orchestrator.submit_task_for_automation(task)
                return {
                    "status": "queued",
                    "message": "Task queued for assignment",
                    "task_id": task.task_id
                }
        else:
            # Add to queue without auto-assignment
            await workflow_orchestrator.submit_task_for_automation(task)
            return {
                "status": "queued",
                "message": "Task submitted to queue",
                "task_id": task.task_id
            }
            
    except Exception as e:
        logger.error(f"Error submitting task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/automation/predict-performance")
async def predict_agent_performance(request: AgentPerformancePredictionRequest):
    """Predict agent performance for a specific task"""
    try:
        # Get task and agents
        task = await db_manager.get_task(request.task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        predictions = {}
        for agent_id in request.agent_ids:
            agent = await db_manager.get_agent(agent_id)
            if agent:
                performance = await performance_predictor.predict_performance(task, agent)
                predictions[agent_id] = performance
        
        return {
            "status": "success",
            "task_id": request.task_id,
            "predictions": predictions
        }
        
    except Exception as e:
        logger.error(f"Error predicting performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/automation/optimal-agent")
async def find_optimal_agent(task_id: str, industry: str = "manufacturing"):
    """Find the optimal agent for a task using ML prediction"""
    try:
        # Get task
        task = await db_manager.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Get available agents
        available_agents = await db_manager.get_available_agents()
        
        # Find optimal agent
        optimal_agent, confidence = await performance_predictor.predict_optimal_agent(task, available_agents)
        
        if optimal_agent:
            return {
                "status": "success",
                "task_id": task_id,
                "optimal_agent": {
                    "agent_id": optimal_agent.agent_id,
                    "name": optimal_agent.name,
                    "type": optimal_agent.type,
                    "confidence_score": confidence
                }
            }
        else:
            return {
                "status": "no_agent_found",
                "message": "No suitable agent found for the task"
            }
            
    except Exception as e:
        logger.error(f"Error finding optimal agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/workflows/create")
async def create_automated_workflow(request: WorkflowCreationRequest):
    """Create a new automated workflow"""
    try:
        workflow_config = {
            "name": request.name,
            "industry": request.industry,
            "priority": request.priority,
            "steps": request.steps,
            "auto_assignment": request.auto_assignment,
            "load_balancing": request.load_balancing
        }
        
        workflow_id = await workflow_orchestrator.create_automated_workflow(workflow_config)
        
        return {
            "status": "success",
            "message": "Workflow created successfully",
            "workflow_id": workflow_id
        }
        
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/workflows/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    """Get the status of a specific workflow"""
    try:
        workflow = workflow_orchestrator.active_workflows.get(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        tasks = workflow_orchestrator.workflow_tasks.get(workflow_id, [])
        
        return {
            "status": "success",
            "workflow": {
                "workflow_id": workflow.workflow_id,
                "name": workflow.name,
                "status": workflow.status.value,
                "industry": workflow.industry,
                "created_at": workflow.created_at.isoformat(),
                "steps_count": len(workflow.steps),
                "tasks_count": len(tasks)
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/automation/metrics")
async def get_automation_metrics():
    """Get automation system performance metrics"""
    try:
        # Get system metrics
        total_agents = len(await db_manager.get_all_agents())
        available_agents = len(await db_manager.get_available_agents())
        pending_tasks = len(await db_manager.get_pending_tasks())
        active_workflows = len([w for w in workflow_orchestrator.active_workflows.values() 
                              if w.status.value == "RUNNING"])
        
        return {
            "status": "success",
            "metrics": {
                "total_agents": total_agents,
                "available_agents": available_agents,
                "utilization_rate": available_agents / max(total_agents, 1),
                "pending_tasks": pending_tasks,
                "active_workflows": active_workflows,
                "queue_length": len(workflow_orchestrator.task_queue),
                "automation_enabled": workflow_orchestrator.auto_assignment_enabled,
                "load_balancing_enabled": workflow_orchestrator.load_balancing_enabled
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/automation/configure")
async def configure_automation(request: AutoAssignmentConfigRequest):
    """Configure automation settings for specific industry"""
    try:
        # Update industry configuration
        if request.industry in assignment_engine.industry_configs:
            config = assignment_engine.industry_configs[request.industry]
            
            # Update optimization weights
            for key, value in request.optimization_weights.items():
                if hasattr(config.weights, key):
                    setattr(config.weights, key, value)
            
            # Update constraints
            config.constraints.update(request.constraints)
            
            return {
                "status": "success",
                "message": f"Configuration updated for {request.industry}",
                "config": {
                    "weights": config.weights.__dict__,
                    "constraints": config.constraints
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Industry configuration not found")
            
    except Exception as e:
        logger.error(f"Error configuring automation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/automation/start-continuous")
async def start_continuous_automation(background_tasks: BackgroundTasks):
    """Start continuous automation processes"""
    try:
        # Start background automation processes
        background_tasks.add_task(assignment_engine.start_continuous_optimization)
        background_tasks.add_task(workflow_orchestrator.start_orchestrator)
        
        return {
            "status": "success",
            "message": "Continuous automation processes started"
        }
        
    except Exception as e:
        logger.error(f"Error starting continuous automation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/intelligent-assignment/industries")
async def get_supported_industries():
    """Get list of supported industries and their configurations"""
    try:
        industries = {}
        for industry, config in assignment_engine.industry_configs.items():
            industries[industry] = {
                "name": config.name,
                "weights": config.weights.__dict__,
                "priority_factors": config.priority_factors,
                "constraints": config.constraints
            }
        
        return {
            "status": "success",
            "industries": industries
        }
        
    except Exception as e:
        logger.error(f"Error getting industries: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Intelligent Automation Service...")
    
    try:
        # Initialize database
        await db_manager.initialize()
        
        # Train ML models
        await performance_predictor.train_models()
        
        logger.info("Intelligent Automation Service started successfully")
        
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8012)
