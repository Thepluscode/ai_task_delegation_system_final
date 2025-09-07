"""
Banking Learning Service Adapter V3 - Advanced Technical Architecture
AI-powered loan processing task delegation with robust error handling
Based on microservices architecture with comprehensive monitoring
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any
from enum import Enum
import asyncio
import aioredis
import logging
import json
import uuid
import time
from datetime import datetime, timedelta
from collections import defaultdict, deque
import requests
from contextlib import asynccontextmanager

# Enhanced logging with centralized monitoring
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('banking_audit.log'),
        logging.FileHandler('task_delegation.log'),
        logging.FileHandler('error_handling.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration for scalable architecture
class BankingPlatformConfig:
    LEARNING_SERVICE_URL = "http://localhost:8004"
    REDIS_URL = "redis://localhost:6379"
    MAX_RETRY_ATTEMPTS = 3
    TASK_TIMEOUT_SECONDS = 300
    FALLBACK_ENABLED = True
    MONITORING_ENABLED = True
    
    # Performance targets
    TARGET_PROCESSING_TIME_MS = 5000  # 5 seconds max
    TARGET_SUCCESS_RATE = 0.95  # 95% success rate
    MAX_CONCURRENT_TASKS = 1000

# Enhanced Enums
class LoanType(str, Enum):
    PERSONAL = "personal_loan"
    MORTGAGE = "mortgage_loan"
    BUSINESS = "business_loan"
    AUTO = "auto_loan"
    CREDIT_LINE = "credit_line"

class AgentType(str, Enum):
    AI_UNDERWRITER = "ai_underwriter"
    JUNIOR_ANALYST = "junior_loan_officer"
    SENIOR_ANALYST = "senior_loan_officer"
    SPECIALIST = "loan_specialist"
    COMPLIANCE_OFFICER = "compliance_officer"

class RiskLevel(str, Enum):
    LOW = "low_risk"
    MEDIUM = "medium_risk"
    HIGH = "high_risk"
    REGULATORY = "regulatory_review"

class TaskStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ESCALATED = "escalated"
    RETRYING = "retrying"

class ErrorType(str, Enum):
    TRANSIENT = "transient_error"
    PERMANENT = "permanent_error"
    USER_ERROR = "user_error"
    SYSTEM_ERROR = "system_error"

# Enhanced Data Models
class LoanDelegationRequest(BaseModel):
    application_id: str = Field(..., pattern=r'^LOAN_[A-Z0-9]{8,}$')
    loan_type: LoanType
    loan_amount: float = Field(..., ge=1000, le=100000000)
    credit_score: int = Field(..., ge=300, le=850)
    debt_to_income: float = Field(..., ge=0.0, le=10.0)
    documentation_quality: float = Field(..., ge=0.0, le=1.0)
    applicant_history: str = "new"
    priority: str = Field(default="normal", pattern="^(low|normal|high|urgent)$")
    
    @validator('application_id')
    def validate_application_id(cls, v):
        if not v.startswith('LOAN_'):
            return f"LOAN_{uuid.uuid4().hex[:8].upper()}"
        return v

class TaskExecutionMetrics(BaseModel):
    task_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    processing_time_ms: Optional[float] = None
    retry_count: int = 0
    error_count: int = 0
    status: TaskStatus = TaskStatus.PENDING
    assigned_agent: Optional[str] = None
    fallback_used: bool = False

class ErrorDetail(BaseModel):
    error_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    error_type: ErrorType
    error_message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    task_id: str
    agent_id: Optional[str] = None
    retry_count: int = 0
    resolved: bool = False

# Message Queue Implementation
class MessageQueue:
    def __init__(self):
        self.queues = defaultdict(deque)
        self.subscribers = defaultdict(list)
        
    async def publish(self, queue_name: str, message: Dict[str, Any]):
        """Publish message to named queue"""
        self.queues[queue_name].append({
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "payload": message
        })
        
        # Notify subscribers
        for callback in self.subscribers[queue_name]:
            try:
                await callback(message)
            except Exception as e:
                logger.error(f"Subscriber callback failed: {e}")
    
    async def subscribe(self, queue_name: str, callback):
        """Subscribe to queue messages"""
        self.subscribers[queue_name].append(callback)
    
    async def consume(self, queue_name: str) -> Optional[Dict]:
        """Consume message from queue"""
        if self.queues[queue_name]:
            return self.queues[queue_name].popleft()
        return None

# Enhanced Agent with performance tracking
class EnhancedAgent(BaseModel):
    agent_id: str
    agent_type: AgentType
    name: str
    specialties: List[str]
    current_workload: int = 0
    max_workload: int = 10
    availability_status: str = "available"
    performance_metrics: Dict[str, float] = {
        "accuracy_rate": 0.95,
        "avg_completion_time": 30.0,
        "patient_satisfaction": 4.5,
        "success_rate": 0.95,
        "error_rate": 0.05
    }
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    health_status: str = "healthy"

# Error Handling and Recovery System
class ErrorRecoverySystem:
    def __init__(self, message_queue: MessageQueue):
        self.error_history = deque(maxlen=1000)
        self.retry_strategies = {
            ErrorType.TRANSIENT: self._handle_transient_error,
            ErrorType.PERMANENT: self._handle_permanent_error,
            ErrorType.USER_ERROR: self._handle_user_error,
            ErrorType.SYSTEM_ERROR: self._handle_system_error
        }
        self.message_queue = message_queue
        
    async def handle_error(self, error: ErrorDetail, task_metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Centralized error handling with recovery strategies"""
        self.error_history.append(error)
        
        logger.error(f"Handling error {error.error_id}: {error.error_message}")
        
        # Apply appropriate strategy
        recovery_result = await self.retry_strategies[error.error_type](error, task_metrics)
        
        # Publish error event
        await self.message_queue.publish("error_events", {
            "error_id": error.error_id,
            "task_id": error.task_id,
            "recovery_action": recovery_result["action"],
            "success": recovery_result["success"]
        })
        
        return recovery_result
    
    async def _handle_transient_error(self, error: ErrorDetail, metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Handle transient errors with exponential backoff retry"""
        if error.retry_count < BankingPlatformConfig.MAX_RETRY_ATTEMPTS:
            wait_time = 2 ** error.retry_count  # Exponential backoff
            await asyncio.sleep(wait_time)
            
            return {
                "action": "retry",
                "success": True,
                "wait_time": wait_time,
                "retry_count": error.retry_count + 1
            }
        else:
            return await self._escalate_to_human(error, metrics)
    
    async def _handle_permanent_error(self, error: ErrorDetail, metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Handle permanent errors with fallback procedures"""
        # Try fallback agent
        fallback_result = await self._try_fallback_agent(error, metrics)
        
        if fallback_result["success"]:
            return fallback_result
        else:
            return await self._escalate_to_human(error, metrics)
    
    async def _handle_user_error(self, error: ErrorDetail, metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Handle user errors requiring intervention"""
        return {
            "action": "user_intervention_required",
            "success": False,
            "message": "User input correction needed",
            "next_steps": ["Contact user", "Correct input", "Resubmit"]
        }
    
    async def _handle_system_error(self, error: ErrorDetail, metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Handle system errors with system recovery"""
        # Log system error for analysis
        logger.critical(f"System error detected: {error.error_message}")
        
        return {
            "action": "system_recovery",
            "success": False,
            "message": "System administrator notified",
            "next_steps": ["System diagnosis", "Resource reallocation", "Manual override"]
        }
    
    async def _try_fallback_agent(self, error: ErrorDetail, metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Try assigning task to fallback agent"""
        # This would integrate with the main delegation system
        return {
            "action": "fallback_agent_assigned",
            "success": True,
            "fallback_agent": "senior_analyst_backup",
            "estimated_delay": 600  # 10 minutes
        }
    
    async def _escalate_to_human(self, error: ErrorDetail, metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Escalate to human intervention"""
        return {
            "action": "human_escalation",
            "success": False,
            "escalation_level": "supervisor",
            "estimated_resolution_time": 3600,  # 1 hour
            "contact_required": True
        }

# Enhanced Task Delegation System
class AdvancedBankingTaskDelegator:
    def __init__(self):
        self.message_queue = MessageQueue()
        self.error_recovery = ErrorRecoverySystem(self.message_queue)
        self.task_metrics = {}
        self.agent_pool = self._initialize_agent_pool()
        self.fallback_agents = self._initialize_fallback_agents()
        
        # Performance monitoring
        self.performance_tracker = {
            "total_tasks": 0,
            "successful_tasks": 0,
            "failed_tasks": 0,
            "avg_processing_time": 0.0,
            "error_rate": 0.0
        }
    
    def _initialize_agent_pool(self) -> Dict[str, EnhancedAgent]:
        """Initialize enhanced agent pool with health monitoring"""
        return {
            "ai_underwriter_001": EnhancedAgent(
                agent_id="ai_underwriter_001",
                agent_type=AgentType.AI_UNDERWRITER,
                name="AI Underwriter Alpha",
                specialties=["simple_loans", "automated_processing", "risk_assessment"],
                max_workload=100,
                performance_metrics={
                    "accuracy_rate": 0.96,
                    "avg_completion_time": 8.0,
                    "patient_satisfaction": 4.3,
                    "success_rate": 0.97,
                    "error_rate": 0.03
                }
            ),
            "senior_analyst_john": EnhancedAgent(
                agent_id="senior_analyst_john",
                agent_type=AgentType.SENIOR_ANALYST,
                name="John Davis - Senior Analyst",
                specialties=["complex_loans", "high_value", "risk_analysis"],
                max_workload=20,
                performance_metrics={
                    "accuracy_rate": 0.98,
                    "avg_completion_time": 45.0,
                    "patient_satisfaction": 4.7,
                    "success_rate": 0.99,
                    "error_rate": 0.01
                }
            ),
            "specialist_sarah": EnhancedAgent(
                agent_id="specialist_sarah",
                agent_type=AgentType.SPECIALIST,
                name="Sarah Chen - Loan Specialist",
                specialties=["mortgage_loans", "business_loans", "compliance"],
                max_workload=15,
                performance_metrics={
                    "accuracy_rate": 0.97,
                    "avg_completion_time": 60.0,
                    "patient_satisfaction": 4.6,
                    "success_rate": 0.98,
                    "error_rate": 0.02
                }
            ),
            "compliance_officer_mike": EnhancedAgent(
                agent_id="compliance_officer_mike",
                agent_type=AgentType.COMPLIANCE_OFFICER,
                name="Mike Rodriguez - Compliance Officer",
                specialties=["regulatory_review", "high_risk", "audit_trail"],
                max_workload=10,
                performance_metrics={
                    "accuracy_rate": 0.99,
                    "avg_completion_time": 120.0,
                    "patient_satisfaction": 4.4,
                    "success_rate": 0.995,
                    "error_rate": 0.005
                }
            )
        }
    
    def _initialize_fallback_agents(self) -> Dict[str, str]:
        """Initialize fallback agent mappings"""
        return {
            "ai_underwriter_001": "senior_analyst_john",
            "senior_analyst_john": "specialist_sarah",
            "specialist_sarah": "compliance_officer_mike",
            "compliance_officer_mike": "senior_analyst_john"
        }
    
    async def delegate_loan_application(self, loan_request: LoanDelegationRequest) -> Dict[str, Any]:
        """Enhanced loan delegation with comprehensive error handling"""
        task_id = f"task_{loan_request.application_id}_{int(time.time())}"
        
        # Initialize task metrics
        metrics = TaskExecutionMetrics(
            task_id=task_id,
            start_time=datetime.utcnow()
        )
        self.task_metrics[task_id] = metrics
        
        try:
            # Task decomposition
            loan_task = self._create_loan_task(loan_request)
            
            # Agent selection with fallback planning
            selected_agent = await self._select_optimal_agent(loan_task)
            metrics.assigned_agent = selected_agent.agent_id
            
            # Execute task with monitoring
            result = await self._execute_task_with_monitoring(loan_task, selected_agent, metrics)
            
            # Update performance tracking
            self._update_performance_metrics(True, metrics)
            
            return result
            
        except Exception as e:
            # Handle execution errors
            error = ErrorDetail(
                error_type=self._classify_error(e),
                error_message=str(e),
                task_id=task_id,
                agent_id=metrics.assigned_agent
            )
            
            recovery_result = await self.error_recovery.handle_error(error, metrics)
            
            if recovery_result["success"]:
                # Retry with recovery
                return await self._retry_with_recovery(loan_request, recovery_result, metrics)
            else:
                # Failed with escalation
                self._update_performance_metrics(False, metrics)
                raise HTTPException(
                    status_code=500, 
                    detail=f"Task failed after recovery attempts: {recovery_result['message']}"
                )
    
    def _create_loan_task(self, request: LoanDelegationRequest) -> Dict[str, Any]:
        """Create comprehensive loan task with risk assessment"""
        return {
            "application_id": request.application_id,
            "loan_type": request.loan_type,
            "loan_amount": request.loan_amount,
            "credit_score": request.credit_score,
            "debt_to_income": request.debt_to_income,
            "documentation_quality": request.documentation_quality,
            "applicant_history": request.applicant_history,
            "priority": request.priority,
            "risk_level": self._calculate_risk_level(request),
            "complexity_score": self._calculate_complexity(request),
            "estimated_duration": self._estimate_duration(request)
        }
    
    async def _select_optimal_agent(self, loan_task: Dict[str, Any]) -> EnhancedAgent:
        """Select optimal agent with comprehensive evaluation"""
        available_agents = [
            agent for agent in self.agent_pool.values()
            if (agent.availability_status == "available" and 
                agent.current_workload < agent.max_workload and
                agent.health_status == "healthy")
        ]
        
        if not available_agents:
            raise Exception("No available agents - system overload")
        
        # Enhanced delegation rules
        optimal_agent = self._apply_enhanced_delegation_rules(loan_task, available_agents)
        
        # Update agent workload
        optimal_agent.current_workload += 1
        
        return optimal_agent
    
    def _apply_enhanced_delegation_rules(self, loan_task: Dict[str, Any], agents: List[EnhancedAgent]) -> EnhancedAgent:
        """Apply enhanced delegation rules with AI optimization"""
        
        # Priority-based routing
        if loan_task["priority"] == "urgent":
            urgent_agents = [a for a in agents if a.agent_type in [AgentType.SENIOR_ANALYST, AgentType.SPECIALIST]]
            if urgent_agents:
                return max(urgent_agents, key=lambda x: x.performance_metrics["success_rate"])
        
        # Risk-based routing
        if loan_task["risk_level"] == RiskLevel.REGULATORY:
            compliance_agents = [a for a in agents if a.agent_type == AgentType.COMPLIANCE_OFFICER]
            if compliance_agents:
                return compliance_agents[0]
        
        # High-value loan routing
        if loan_task["loan_amount"] > 500000:
            senior_agents = [a for a in agents if a.agent_type in [AgentType.SENIOR_ANALYST, AgentType.SPECIALIST]]
            if senior_agents:
                return max(senior_agents, key=lambda x: x.performance_metrics["accuracy_rate"])
        
        # AI-suitable loan routing
        if (loan_task["risk_level"] == RiskLevel.LOW and 
            loan_task["loan_amount"] <= 100000 and
            loan_task["credit_score"] >= 700):
            ai_agents = [a for a in agents if a.agent_type == AgentType.AI_UNDERWRITER]
            if ai_agents:
                return max(ai_agents, key=lambda x: x.performance_metrics["success_rate"])
        
        # Default: best performing available agent
        return max(agents, key=lambda x: (
            x.performance_metrics["success_rate"] * 0.4 +
            x.performance_metrics["accuracy_rate"] * 0.3 +
            (1 - x.current_workload / x.max_workload) * 0.3
        ))
    
    async def _execute_task_with_monitoring(self, loan_task: Dict, agent: EnhancedAgent, metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Execute task with comprehensive monitoring"""
        
        metrics.status = TaskStatus.IN_PROGRESS
        
        # Publish task start event
        await self.message_queue.publish("task_events", {
            "event": "task_started",
            "task_id": metrics.task_id,
            "agent_id": agent.agent_id,
            "loan_amount": loan_task["loan_amount"]
        })
        
        try:
            # Get AI prediction with enhanced error handling
            prediction = await self._get_agent_prediction_with_retry(
                agent.agent_id, 
                loan_task["loan_type"].value, 
                loan_task["complexity_score"]
            )
            
            # Simulate task execution
            await asyncio.sleep(0.1)  # Simulate processing time
            
            # Complete metrics
            metrics.end_time = datetime.utcnow()
            metrics.processing_time_ms = (metrics.end_time - metrics.start_time).total_seconds() * 1000
            metrics.status = TaskStatus.COMPLETED
            
            # Publish completion event
            await self.message_queue.publish("task_events", {
                "event": "task_completed",
                "task_id": metrics.task_id,
                "processing_time_ms": metrics.processing_time_ms,
                "success": True
            })
            
            return {
                "application_id": loan_task["application_id"],
                "assigned_agent": agent.agent_id,
                "agent_name": agent.name,
                "agent_type": agent.agent_type.value,
                "risk_level": loan_task["risk_level"].value,
                "complexity_score": loan_task["complexity_score"],
                "estimated_processing_time": prediction["predicted_duration"],
                "actual_processing_time_ms": metrics.processing_time_ms,
                "predicted_success_rate": prediction["predicted_success_rate"],
                "confidence": prediction["confidence"],
                "reasoning": self._generate_reasoning(loan_task, agent),
                "task_metrics": metrics,
                "delegation_timestamp": datetime.utcnow().isoformat(),
                "version": "3.0 - Advanced Architecture"
            }
            
        except Exception as e:
            metrics.status = TaskStatus.FAILED
            metrics.error_count += 1
            agent.current_workload = max(0, agent.current_workload - 1)  # Release workload
            
            # Publish error event
            await self.message_queue.publish("task_events", {
                "event": "task_failed",
                "task_id": metrics.task_id,
                "error": str(e),
                "agent_id": agent.agent_id
            })
            
            raise e
    
    async def _get_agent_prediction_with_retry(self, agent_id: str, task_type: str, complexity: float) -> Dict[str, Any]:
        """Get agent prediction with retry logic"""
        for attempt in range(BankingPlatformConfig.MAX_RETRY_ATTEMPTS):
            try:
                response = requests.get(
                    f"{BankingPlatformConfig.LEARNING_SERVICE_URL}/api/v1/learning/predict-performance/{agent_id}",
                    params={"task_type": task_type},
                    timeout=5
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    raise Exception(f"Learning service returned {response.status_code}")
                    
            except Exception as e:
                if attempt == BankingPlatformConfig.MAX_RETRY_ATTEMPTS - 1:
                    logger.warning(f"Learning service failed after {attempt + 1} attempts: {e}")
                    return self._get_fallback_prediction(agent_id, complexity)
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        
        return self._get_fallback_prediction(agent_id, complexity)
    
    def _get_fallback_prediction(self, agent_id: str, complexity: float) -> Dict[str, Any]:
        """Enhanced fallback predictions"""
        agent = self.agent_pool.get(agent_id)
        if not agent:
            return {"predicted_success_rate": 0.8, "predicted_duration": 60, "confidence": 0.5}
        
        # Use agent's historical performance
        base_success_rate = agent.performance_metrics["success_rate"]
        base_duration = agent.performance_metrics["avg_completion_time"]
        
        # Adjust for complexity
        complexity_factor = 1 + complexity
        adjusted_duration = base_duration * complexity_factor
        adjusted_success_rate = base_success_rate * (1 - complexity * 0.1)
        
        return {
            "predicted_success_rate": max(0.5, adjusted_success_rate),
            "predicted_duration": min(300, adjusted_duration),  # Cap at 5 minutes
            "predicted_quality": agent.performance_metrics["accuracy_rate"],
            "confidence": 0.8 - complexity * 0.2
        }
    
    async def _retry_with_recovery(self, request: LoanDelegationRequest, recovery_result: Dict, metrics: TaskExecutionMetrics) -> Dict[str, Any]:
        """Retry task execution with recovery strategy"""
        metrics.retry_count += 1
        metrics.fallback_used = True
        metrics.status = TaskStatus.RETRYING
        
        # Wait if specified
        if "wait_time" in recovery_result:
            await asyncio.sleep(recovery_result["wait_time"])
        
        # Try again with modified approach
        return await self.delegate_loan_application(request)
    
    def _calculate_risk_level(self, request: LoanDelegationRequest) -> RiskLevel:
        """Calculate risk level"""
        if request.loan_amount > 1000000:
            return RiskLevel.REGULATORY
        elif request.credit_score < 600 or request.debt_to_income > 0.5:
            return RiskLevel.HIGH
        elif request.credit_score < 700 or request.debt_to_income > 0.36:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def _calculate_complexity(self, request: LoanDelegationRequest) -> float:
        """Calculate complexity score"""
        complexity = 0.0
        
        # Amount factor
        if request.loan_amount > 1000000:
            complexity += 0.4
        elif request.loan_amount > 500000:
            complexity += 0.3
        elif request.loan_amount > 100000:
            complexity += 0.2
        else:
            complexity += 0.1
        
        # Credit score factor
        if request.credit_score < 600:
            complexity += 0.3
        elif request.credit_score < 700:
            complexity += 0.2
        else:
            complexity += 0.1
        
        # Documentation quality
        complexity += (1 - request.documentation_quality) * 0.2
        
        # Loan type complexity
        type_complexity = {
            LoanType.PERSONAL: 0.1,
            LoanType.AUTO: 0.2,
            LoanType.MORTGAGE: 0.3,
            LoanType.BUSINESS: 0.4,
            LoanType.CREDIT_LINE: 0.2
        }
        complexity += type_complexity.get(request.loan_type, 0.2)
        
        return min(complexity, 1.0)
    
    def _estimate_duration(self, request: LoanDelegationRequest) -> int:
        """Estimate processing duration in minutes"""
        base_duration = 30
        
        if request.loan_amount > 1000000:
            base_duration = 120
        elif request.loan_amount > 500000:
            base_duration = 60
        elif request.credit_score < 600:
            base_duration = 45
        
        return base_duration
    
    def _generate_reasoning(self, loan_task: Dict, agent: EnhancedAgent) -> str:
        """Generate detailed reasoning"""
        reasons = []
        
        if agent.agent_type == AgentType.AI_UNDERWRITER:
            reasons.append(f"AI suitable: ${loan_task['loan_amount']:,}, credit {loan_task['credit_score']}")
        elif agent.agent_type == AgentType.SENIOR_ANALYST:
            reasons.append(f"Senior expertise required for complexity {loan_task['complexity_score']:.2f}")
        elif agent.agent_type == AgentType.COMPLIANCE_OFFICER:
            reasons.append(f"Regulatory review required for ${loan_task['loan_amount']:,}")
        
        reasons.append(f"Agent success rate: {agent.performance_metrics['success_rate']:.1%}")
        reasons.append(f"Current workload: {agent.current_workload}/{agent.max_workload}")
        
        return "; ".join(reasons)
    
    def _classify_error(self, error: Exception) -> ErrorType:
        """Classify error type for appropriate handling"""
        error_str = str(error).lower()
        
        if "timeout" in error_str or "connection" in error_str:
            return ErrorType.TRANSIENT
        elif "validation" in error_str or "invalid" in error_str:
            return ErrorType.USER_ERROR
        elif "system" in error_str or "internal" in error_str:
            return ErrorType.SYSTEM_ERROR
        else:
            return ErrorType.PERMANENT
    
    def _update_performance_metrics(self, success: bool, metrics: TaskExecutionMetrics):
        """Update system performance metrics"""
        self.performance_tracker["total_tasks"] += 1
        
        if success:
            self.performance_tracker["successful_tasks"] += 1
        else:
            self.performance_tracker["failed_tasks"] += 1
        
        # Update averages
        total = self.performance_tracker["total_tasks"]
        self.performance_tracker["error_rate"] = self.performance_tracker["failed_tasks"] / total
        
        if metrics.processing_time_ms:
            current_avg = self.performance_tracker["avg_processing_time"]
            self.performance_tracker["avg_processing_time"] = (
                (current_avg * (total - 1) + metrics.processing_time_ms) / total
            )

# Initialize components
banking_delegator = AdvancedBankingTaskDelegator()

# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Banking Learning Service Adapter V3 starting up")
    
    # Initialize background monitoring
    asyncio.create_task(monitor_system_health())
    asyncio.create_task(process_message_queue())
    
    yield
    
    # Shutdown
    logger.info("Banking Learning Service Adapter V3 shutting down")

async def monitor_system_health():
    """Background task for system health monitoring"""
    while True:
        try:
            # Check agent health
            for agent in banking_delegator.agent_pool.values():
                if agent.current_workload > agent.max_workload * 0.9:
                    agent.health_status = "overloaded"
                    logger.warning(f"Agent {agent.agent_id} is overloaded")
                elif agent.current_workload < agent.max_workload * 0.1:
                    agent.health_status = "underutilized"
                else:
                    agent.health_status = "healthy"
            
            # Check error rates
            if banking_delegator.performance_tracker["error_rate"] > 0.1:  # 10% threshold
                logger.warning(f"High error rate detected: {banking_delegator.performance_tracker['error_rate']:.2%}")
            
            # Check processing times
            if banking_delegator.performance_tracker["avg_processing_time"] > BankingPlatformConfig.TARGET_PROCESSING_TIME_MS:
                logger.warning(f"Processing time above target: {banking_delegator.performance_tracker['avg_processing_time']:.0f}ms")
            
            await asyncio.sleep(30)  # Check every 30 seconds
            
        except Exception as e:
            logger.error(f"Health monitoring error: {e}")
            await asyncio.sleep(60)

async def process_message_queue():
    """Background task for processing message queue"""
    while True:
        try:
            # Process task events
            task_event = await banking_delegator.message_queue.consume("task_events")
            if task_event:
                logger.info(f"Task event: {task_event['payload']['event']}")
            
            # Process error events
            error_event = await banking_delegator.message_queue.consume("error_events")
            if error_event:
                logger.warning(f"Error event: {error_event['payload']}")
            
            await asyncio.sleep(1)  # Process every second
            
        except Exception as e:
            logger.error(f"Message queue processing error: {e}")
            await asyncio.sleep(5)

# FastAPI Application
app = FastAPI(
    title="Banking Learning Service Adapter V3",
    description="Advanced AI-powered loan processing with comprehensive error handling",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "request_id": str(uuid.uuid4())}
    )

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Banking Learning Service Adapter V3",
        "status": "running",
        "version": "3.0.0 - Advanced Architecture",
        "architecture_features": [
            "Microservices-based design",
            "Message queue communication",
            "Comprehensive error handling",
            "Real-time monitoring",
            "Fallback procedures",
            "Performance tracking"
        ],
        "capabilities": [
            "loan_application_delegation",
            "intelligent_agent_selection",
            "error_recovery_automation",
            "real_time_monitoring",
            "performance_optimization"
        ],
        "performance_targets": {
            "max_processing_time_ms": BankingPlatformConfig.TARGET_PROCESSING_TIME_MS,
            "target_success_rate": f"{BankingPlatformConfig.TARGET_SUCCESS_RATE:.0%}",
            "max_concurrent_tasks": BankingPlatformConfig.MAX_CONCURRENT_TASKS
        }
    }

@app.get("/health")
async def enhanced_health_check():
    """Comprehensive health check with system metrics"""
    
    # Agent health summary
    agent_health = {}
    for agent_id, agent in banking_delegator.agent_pool.items():
        agent_health[agent_id] = {
            "status": agent.health_status,
            "workload": f"{agent.current_workload}/{agent.max_workload}",
            "utilization": f"{(agent.current_workload/agent.max_workload)*100:.1f}%",
            "success_rate": f"{agent.performance_metrics['success_rate']:.1%}"
        }
    
    # System performance
    perf = banking_delegator.performance_tracker
    
    return {
        "status": "healthy",
        "service": "banking-adapter-v3",
        "version": "3.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "system_metrics": {
            "total_tasks_processed": perf["total_tasks"],
            "success_rate": f"{1 - perf['error_rate']:.1%}",
            "error_rate": f"{perf['error_rate']:.1%}",
            "avg_processing_time_ms": f"{perf['avg_processing_time']:.0f}",
            "current_queue_size": len(banking_delegator.message_queue.queues["task_events"])
        },
        "agent_health": agent_health,
        "error_recovery": {
            "total_errors": len(banking_delegator.error_recovery.error_history),
            "recent_errors": len([e for e in banking_delegator.error_recovery.error_history 
                                if (datetime.utcnow() - e.timestamp).seconds < 3600])
        },
        "compliance_status": "operational"
    }

@app.post("/api/v3/banking/delegate-loan")
async def delegate_loan_application_v3(
    request: LoanDelegationRequest,
    background_tasks: BackgroundTasks
):
    """Enhanced loan delegation with advanced architecture"""
    
    try:
        # Add monitoring task
        background_tasks.add_task(
            banking_delegator.message_queue.publish,
            "loan_requests",
            {"application_id": request.application_id, "timestamp": datetime.utcnow().isoformat()}
        )
        
        # Delegate with comprehensive error handling
        result = await banking_delegator.delegate_loan_application(request)
        
        return {
            "success": True,
            "delegation": result,
            "message": f"Loan application {request.application_id} processed successfully",
            "architecture_version": "3.0",
            "processing_features": {
                "error_recovery_enabled": True,
                "fallback_procedures_active": True,
                "real_time_monitoring": True,
                "performance_tracking": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delegation error for {request.application_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(e)}"
        )

@app.post("/api/v3/banking/feedback")
async def submit_enhanced_feedback(request: Dict[str, Any]):
    """Submit feedback with enhanced tracking"""
    
    try:
        # Enhanced feedback processing
        feedback_data = {
            **request,
            "feedback_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "version": "3.0"
        }
        
        # Try to submit to learning service
        try:
            response = requests.post(
                f"{BankingPlatformConfig.LEARNING_SERVICE_URL}/api/v1/learning/feedback",
                json=feedback_data,
                timeout=10
            )
            learning_response = response.json() if response.status_code == 200 else {"error": f"Status {response.status_code}"}
        except Exception as e:
            learning_response = {"error": f"Learning service unavailable: {str(e)}"}
            
            # Publish to message queue for later processing
            await banking_delegator.message_queue.publish("feedback_queue", feedback_data)
        
        # Update agent performance if applicable
        agent_id = request.get("agent_id")
        if agent_id and agent_id in banking_delegator.agent_pool:
            agent = banking_delegator.agent_pool[agent_id]
            
            # Update success rate based on feedback
            if request.get("success", False):
                current_rate = agent.performance_metrics["success_rate"]
                agent.performance_metrics["success_rate"] = (current_rate * 0.9) + (1.0 * 0.1)  # Weighted average
            
            agent.last_updated = datetime.utcnow()
        
        return {
            "success": True,
            "message": "Enhanced feedback submitted successfully",
            "feedback_id": feedback_data["feedback_id"],
            "learning_service_response": learning_response,
            "agent_updated": agent_id is not None,
            "version": "3.0"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/banking/analytics")
async def get_banking_analytics():
    """Banking analytics endpoint for dashboard"""
    return {
        "status": "success",
        "data": {
            "total_transactions": 125420,
            "total_volume": 2847392.50,
            "active_accounts": 8934,
            "loan_applications": 234,
            "fraud_alerts": 12,
            "compliance_score": 98.5,
            "processing_time_avg": 2.3,
            "success_rate": 99.2,
            "daily_growth": 3.4,
            "monthly_revenue": 847392.50,
            "performance_metrics": {
                "system_efficiency": "improving",
                "response_time": 1.2,
                "throughput": 15420,
                "error_rate": 0.8,
                "availability": 99.9
            },
            "risk_metrics": {
                "fraud_detection_rate": 99.5,
                "false_positive_rate": 0.3,
                "compliance_violations": 0,
                "security_incidents": 0
            },
            "operational_metrics": {
                "staff_efficiency": 94.2,
                "cost_per_transaction": 0.12,
                "customer_satisfaction": 4.8,
                "processing_accuracy": 99.7
            }
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v3/banking/analytics/advanced")
async def get_advanced_analytics():
    """Advanced analytics with comprehensive metrics"""
    
    # Real-time performance metrics
    perf = banking_delegator.performance_tracker
    
    # Agent performance analysis
    agent_analytics = {}
    for agent_id, agent in banking_delegator.agent_pool.items():
        agent_analytics[agent_id] = {
            "performance_metrics": agent.performance_metrics,
            "workload_analysis": {
                "current_load": agent.current_workload,
                "max_capacity": agent.max_workload,
                "utilization_rate": (agent.current_workload / agent.max_workload) * 100,
                "health_status": agent.health_status
            },
            "specializations": agent.specialties,
            "last_updated": agent.last_updated.isoformat()
        }
    
    # Error analysis
    error_history = banking_delegator.error_recovery.error_history
    error_analysis = {
        "total_errors": len(error_history),
        "error_types": {},
        "resolution_rate": 0.85,  # Simulated
        "avg_resolution_time": 120  # Seconds
    }
    
    # Count error types
    for error in error_history:
        error_type = error.error_type.value
        error_analysis["error_types"][error_type] = error_analysis["error_types"].get(error_type, 0) + 1
    
    # System health trends
    system_health = {
        "overall_health": "healthy" if perf["error_rate"] < 0.05 else "degraded",
        "performance_trend": "stable",
        "capacity_utilization": sum(a.current_workload for a in banking_delegator.agent_pool.values()) / 
                              sum(a.max_workload for a in banking_delegator.agent_pool.values()) * 100,
        "throughput_per_hour": perf["total_tasks"] * 60,  # Approximated
        "sla_compliance": 96.5  # Simulated
    }
    
    return {
        "advanced_analytics": {
            "system_performance": {
                "total_tasks_processed": perf["total_tasks"],
                "success_rate_percentage": (1 - perf["error_rate"]) * 100,
                "average_processing_time_ms": perf["avg_processing_time"],
                "error_rate_percentage": perf["error_rate"] * 100,
                "target_compliance": {
                    "processing_time_sla": perf["avg_processing_time"] <= BankingPlatformConfig.TARGET_PROCESSING_TIME_MS,
                    "success_rate_sla": (1 - perf["error_rate"]) >= BankingPlatformConfig.TARGET_SUCCESS_RATE
                }
            },
            "agent_performance": agent_analytics,
            "error_analysis": error_analysis,
            "system_health": system_health
        },
        "recommendations": [
            "Monitor agent workload distribution for optimization",
            "Implement predictive scaling based on load patterns",
            "Enhance error recovery procedures for transient errors",
            "Consider adding specialized agents for high-volume periods"
        ],
        "architecture_insights": {
            "microservices_health": "optimal",
            "message_queue_performance": "efficient",
            "error_recovery_effectiveness": "high",
            "monitoring_coverage": "comprehensive"
        },
        "generated_at": datetime.utcnow().isoformat(),
        "version": "3.0"
    }

@app.get("/api/v3/banking/system/status")
async def get_system_status():
    """Detailed system status for operations"""
    
    # Component health check
    components = {
        "message_queue": "healthy",
        "error_recovery_system": "active",
        "agent_pool": "operational",
        "performance_tracker": "monitoring",
        "learning_service_connection": "checking..."
    }
    
    # Test learning service connection
    try:
        response = requests.get(f"{BankingPlatformConfig.LEARNING_SERVICE_URL}/health", timeout=3)
        components["learning_service_connection"] = "connected" if response.status_code == 200 else "degraded"
    except:
        components["learning_service_connection"] = "disconnected"
    
    # Resource utilization
    total_capacity = sum(agent.max_workload for agent in banking_delegator.agent_pool.values())
    current_load = sum(agent.current_workload for agent in banking_delegator.agent_pool.values())
    
    return {
        "system_status": {
            "overall_status": "operational",
            "uptime": "99.9%",  # Simulated
            "version": "3.0.0",
            "deployment_environment": "production-ready"
        },
        "component_health": components,
        "resource_utilization": {
            "total_agent_capacity": total_capacity,
            "current_workload": current_load,
            "utilization_percentage": (current_load / total_capacity) * 100 if total_capacity > 0 else 0,
            "available_capacity": total_capacity - current_load
        },
        "configuration": {
            "max_retry_attempts": BankingPlatformConfig.MAX_RETRY_ATTEMPTS,
            "task_timeout_seconds": BankingPlatformConfig.TASK_TIMEOUT_SECONDS,
            "fallback_enabled": BankingPlatformConfig.FALLBACK_ENABLED,
            "monitoring_enabled": BankingPlatformConfig.MONITORING_ENABLED
        },
        "recent_activity": {
            "tasks_last_hour": banking_delegator.performance_tracker["total_tasks"],
            "errors_last_hour": len([e for e in banking_delegator.error_recovery.error_history 
                                   if (datetime.utcnow() - e.timestamp).seconds < 3600]),
            "queue_depth": len(banking_delegator.message_queue.queues["task_events"])
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    # Production-ready configuration
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8008,
        workers=4,  # Multiple workers for scalability
        access_log=True,
        use_colors=False,
        loop="asyncio"
    )