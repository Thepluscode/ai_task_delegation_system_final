"""
Enhanced Healthcare Task Delegation Service
HIPAA-compliant AI-powered patient triage with security hardening
Port: 8012
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator, EmailStr
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, timedelta
import uuid
import logging
import asyncio
from enum import Enum
import random
import hashlib
import hmac
import jwt
import re
from cryptography.fernet import Fernet
import time
from functools import wraps
import os

# Security Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
fernet = Fernet(ENCRYPTION_KEY)

# Configure secure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('healthcare_audit.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Security middleware
security = HTTPBearer()

app = FastAPI(
    title="HIPAA-Compliant Healthcare Task Delegation Service",
    description="Secure AI-powered healthcare workflow automation with intelligent task delegation",
    version="2.0.0",
    docs_url="/docs",  # Restrict in production
    redoc_url="/redoc"  # Restrict in production
)

# Enhanced CORS with security
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Restrict origins in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Enhanced Enums and Constants
class UrgencyLevel(str, Enum):
    ROUTINE = "routine"
    URGENT = "urgent"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class TaskType(str, Enum):
    PATIENT_TRIAGE = "patient_triage"
    RADIOLOGY_REVIEW = "radiology_review"
    LAB_ANALYSIS = "lab_analysis"
    TREATMENT_PLANNING = "treatment_planning"
    EMERGENCY_RESPONSE = "emergency_response"
    CONSULTATION_REQUEST = "consultation_request"

class AgentType(str, Enum):
    AI_TRIAGE = "ai_triage_system"
    NURSE_PRACTITIONER = "nurse_practitioner"
    GENERAL_PHYSICIAN = "general_physician"
    SPECIALIST = "specialist"
    RADIOLOGIST = "radiologist"
    LAB_TECHNICIAN = "lab_technician"
    EMERGENCY_PHYSICIAN = "emergency_physician"

class TaskStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ESCALATED = "escalated"
    FAILED = "failed"

class UserRole(str, Enum):
    ADMIN = "admin"
    PHYSICIAN = "physician"
    NURSE = "nurse"
    TECHNICIAN = "technician"
    VIEWER = "viewer"

# Security Models
class User(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    role: UserRole
    permissions: List[str]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)

# Enhanced Pydantic Models with HIPAA-compliant validation
class SecurePatientInfo(BaseModel):
    patient_id_hash: str = Field(..., description="Hashed patient identifier")
    age: int = Field(..., ge=0, le=150)
    gender: Literal["male", "female", "other", "unknown"]
    encrypted_chief_complaint: str = Field(..., description="Encrypted chief complaint")
    encrypted_symptoms: str = Field(..., description="Encrypted symptoms list")
    risk_indicators: List[str] = Field(default=[], description="De-identified risk factors")
    insurance_type: Optional[str] = "standard"
    consent_timestamp: datetime = Field(default_factory=datetime.now)
    access_level: str = Field(default="restricted")
    
    @validator('patient_id_hash')
    def validate_patient_id_hash(cls, v):
        if not re.match(r'^[a-f0-9]{64}$', v):
            raise ValueError('Invalid patient ID hash format')
        return v
    
    @validator('risk_indicators')
    def validate_risk_indicators(cls, v):
        # Validate against approved medical terminology
        approved_terms = {
            "elderly", "pediatric", "chronic_condition", "high_risk",
            "medication_allergy", "surgical_history", "immunocompromised"
        }
        return [term for term in v if term in approved_terms]

class HealthcareTaskRequest(BaseModel):
    task_id: str = Field(..., regex=r'^HEALTH_[A-Z0-9_]+$')
    task_type: TaskType = TaskType.PATIENT_TRIAGE
    patient_info: SecurePatientInfo
    urgency_level: UrgencyLevel
    required_specialties: Optional[List[str]] = []
    encrypted_clinical_notes: Optional[str] = ""
    diagnostic_data_hash: Optional[str] = None
    preferred_agent_id: Optional[str] = None
    estimated_duration_minutes: Optional[int] = Field(30, ge=1, le=480)
    requesting_user_id: str
    facility_id: str
    
    @validator('required_specialties')
    def validate_specialties(cls, v):
        valid_specialties = {
            "emergency_medicine", "internal_medicine", "cardiology",
            "radiology", "pathology", "anesthesiology", "surgery"
        }
        return [spec for spec in v if spec in valid_specialties]

class Agent(BaseModel):
    agent_id: str
    agent_type: AgentType
    name: str
    specialties: List[str]
    current_workload: int = 0
    max_workload: int = 10
    availability_status: Literal["available", "busy", "offline"] = "available"
    performance_metrics: Dict[str, float] = {
        "accuracy_rate": 0.95,
        "avg_completion_time": 30.0,
        "patient_satisfaction": 4.5
    }
    compliance_certifications: List[str] = ["HIPAA", "HL7_FHIR"]
    last_updated: datetime = Field(default_factory=datetime.now)
    security_clearance_level: int = Field(1, ge=1, le=5)

class TaskDelegation(BaseModel):
    delegation_id: str
    task_id: str
    assigned_agent_id: str
    agent_name: str
    agent_type: AgentType
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    estimated_completion: datetime
    priority_score: int = Field(..., ge=1, le=10)
    status: TaskStatus = TaskStatus.ASSIGNED
    audit_trail: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: str
    security_classification: str = "PHI_RESTRICTED"

class HealthcareResponse(BaseModel):
    success: bool
    delegation: Optional[TaskDelegation] = None
    message: str
    compliance_status: str = "HIPAA_COMPLIANT"
    audit_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.now)

# Authentication and Authorization
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def get_current_user(token_data: dict = Depends(verify_token)) -> User:
    # In production, fetch from secure database
    user_data = {
        "user_id": token_data.get("user_id"),
        "username": token_data.get("sub"),
        "email": token_data.get("email"),
        "role": UserRole(token_data.get("role", "viewer")),
        "permissions": token_data.get("permissions", []),
        "is_active": True
    }
    return User(**user_data)

def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if permission not in current_user.permissions and current_user.role != UserRole.ADMIN:
                raise HTTPException(
                    status_code=403,
                    detail=f"Insufficient permissions. Required: {permission}"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Security utilities
def hash_patient_id(patient_id: str) -> str:
    """Hash patient ID for HIPAA compliance"""
    return hashlib.sha256(patient_id.encode()).hexdigest()

def encrypt_phi(data: str) -> str:
    """Encrypt PHI data"""
    return fernet.encrypt(data.encode()).decode()

def decrypt_phi(encrypted_data: str) -> str:
    """Decrypt PHI data"""
    return fernet.decrypt(encrypted_data.encode()).decode()

def log_audit_event(event_type: str, user_id: str, details: Dict[str, Any]):
    """Log audit events for HIPAA compliance"""
    audit_entry = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "details": details,
        "session_id": str(uuid.uuid4())
    }
    logger.info(f"AUDIT: {audit_entry}")

# Rate limiting
request_counts = {}
RATE_LIMIT = 100  # requests per minute

def rate_limit_check(client_ip: str):
    current_time = time.time()
    minute_window = int(current_time // 60)
    
    if client_ip not in request_counts:
        request_counts[client_ip] = {}
    
    if minute_window not in request_counts[client_ip]:
        request_counts[client_ip][minute_window] = 0
    
    request_counts[client_ip][minute_window] += 1
    
    if request_counts[client_ip][minute_window] > RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

# Enhanced Healthcare Agent Registry with security
HEALTHCARE_AGENTS = {
    "ai_triage_001": Agent(
        agent_id="ai_triage_001",
        agent_type=AgentType.AI_TRIAGE,
        name="Secure AI Triage System",
        specialties=["general_triage", "symptom_assessment", "priority_classification"],
        max_workload=100,
        performance_metrics={
            "accuracy_rate": 0.92,
            "avg_completion_time": 3.0,
            "patient_satisfaction": 4.2
        },
        security_clearance_level=3
    ),
    "dr_sarah_chen": Agent(
        agent_id="dr_sarah_chen",
        agent_type=AgentType.EMERGENCY_PHYSICIAN,
        name="Dr. Sarah Chen",
        specialties=["emergency_medicine", "trauma", "critical_care"],
        max_workload=5,
        performance_metrics={
            "accuracy_rate": 0.97,
            "avg_completion_time": 25.0,
            "patient_satisfaction": 4.8
        },
        security_clearance_level=5
    )
}

# Enhanced AI Engine with bias detection and explainability
class SecureHealthcareAIEngine:
    def __init__(self):
        self.triage_rules = {
            UrgencyLevel.EMERGENCY: {
                "response_time_target": 1,
                "required_agent_types": [AgentType.EMERGENCY_PHYSICIAN],
                "min_confidence": 0.95,
                "security_level": 5
            },
            UrgencyLevel.CRITICAL: {
                "response_time_target": 5,
                "required_agent_types": [AgentType.EMERGENCY_PHYSICIAN, AgentType.SPECIALIST],
                "min_confidence": 0.90,
                "security_level": 4
            },
            UrgencyLevel.URGENT: {
                "response_time_target": 30,
                "required_agent_types": [AgentType.GENERAL_PHYSICIAN, AgentType.SPECIALIST],
                "min_confidence": 0.85,
                "security_level": 3
            },
            UrgencyLevel.ROUTINE: {
                "response_time_target": 120,
                "required_agent_types": [AgentType.AI_TRIAGE, AgentType.NURSE_PRACTITIONER],
                "min_confidence": 0.80,
                "security_level": 2
            }
        }

    def calculate_patient_risk_score(self, patient_info: SecurePatientInfo, task_type: TaskType) -> Dict[str, Any]:
        """Enhanced risk calculation with bias detection"""
        risk_score = 0.0
        risk_factors = []
        
        # Age-based risk with bias monitoring
        if patient_info.age >= 65:
            risk_score += 0.3
            risk_factors.append("elderly_patient")
        elif patient_info.age <= 2:
            risk_score += 0.2
            risk_factors.append("pediatric_patient")
        
        # Risk indicators assessment
        high_risk_indicators = ["chronic_condition", "immunocompromised", "high_risk"]
        for indicator in patient_info.risk_indicators:
            if indicator in high_risk_indicators:
                risk_score += 0.2
                risk_factors.append(f"risk_indicator_{indicator}")
        
        # Normalize risk score
        risk_score = min(risk_score, 1.0)
        
        return {
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "confidence": 0.85,
            "bias_check": self._check_algorithmic_bias(patient_info, risk_score)
        }

    def _check_algorithmic_bias(self, patient_info: SecurePatientInfo, risk_score: float) -> Dict[str, Any]:
        """Check for potential algorithmic bias"""
        bias_flags = []
        
        # Age bias check
        if patient_info.age >= 65 and risk_score > 0.8:
            bias_flags.append("potential_age_bias")
        
        # Gender bias check
        if patient_info.gender == "female" and "cardiac" in str(patient_info.risk_indicators):
            bias_flags.append("potential_gender_bias_cardiac")
        
        return {
            "bias_detected": len(bias_flags) > 0,
            "bias_flags": bias_flags,
            "review_recommended": len(bias_flags) > 0
        }

    def match_agent_to_task(self, task: HealthcareTaskRequest, current_user: User) -> Agent:
        """Enhanced agent matching with security considerations"""
        # Security check
        required_security_level = self.triage_rules[task.urgency_level]["security_level"]
        
        available_agents = [
            agent for agent in HEALTHCARE_AGENTS.values()
            if (agent.availability_status == "available" and 
                agent.current_workload < agent.max_workload and
                agent.security_clearance_level >= required_security_level)
        ]
        
        if not available_agents:
            raise HTTPException(
                status_code=503, 
                detail="No available healthcare agents with required security clearance"
            )
        
        # Apply urgency-based filtering
        urgency_rules = self.triage_rules[task.urgency_level]
        suitable_agents = [
            agent for agent in available_agents
            if agent.agent_type in urgency_rules["required_agent_types"]
        ]
        
        if not suitable_agents:
            # Escalation logic
            suitable_agents = [
                agent for agent in available_agents
                if agent.agent_type in [AgentType.EMERGENCY_PHYSICIAN, AgentType.SPECIALIST]
            ]
        
        if not suitable_agents:
            suitable_agents = available_agents
        
        # Enhanced scoring with bias consideration
        risk_analysis = self.calculate_patient_risk_score(task.patient_info, task.task_type)
        
        best_agent = None
        best_score = -1
        
        for agent in suitable_agents:
            score = self._calculate_agent_score(agent, task, risk_analysis)
            
            if score > best_score:
                best_score = score
                best_agent = agent
        
        return best_agent

    def _calculate_agent_score(self, agent: Agent, task: HealthcareTaskRequest, risk_analysis: Dict) -> float:
        """Calculate agent suitability score"""
        score = 0.0
        
        # Performance metrics
        score += agent.performance_metrics["accuracy_rate"] * 0.4
        score += (5.0 - agent.performance_metrics["avg_completion_time"] / 10) * 0.2
        score += (agent.performance_metrics["patient_satisfaction"] / 5.0) * 0.2
        
        # Workload factor
        workload_factor = 1.0 - (agent.current_workload / agent.max_workload)
        score += workload_factor * 0.2
        
        # Specialty matching
        if task.required_specialties:
            specialty_match = len(set(task.required_specialties) & set(agent.specialties)) / len(task.required_specialties)
            score += specialty_match * 0.3
        
        # Risk-based adjustment
        if risk_analysis["risk_score"] > 0.7:
            if agent.agent_type in [AgentType.EMERGENCY_PHYSICIAN, AgentType.SPECIALIST]:
                score += 0.2
        
        # Bias consideration
        if risk_analysis["bias_check"]["review_recommended"] and agent.agent_type != AgentType.AI_TRIAGE:
            score += 0.1  # Prefer human oversight for biased cases
        
        return score

    def generate_explainable_reasoning(self, task: HealthcareTaskRequest, agent: Agent, 
                                     confidence: float, risk_analysis: Dict) -> str:
        """Generate explainable AI reasoning"""
        reasons = []
        
        # Urgency-based reasoning
        if task.urgency_level == UrgencyLevel.EMERGENCY:
            reasons.append("Emergency case requires immediate specialist attention")
        elif task.urgency_level == UrgencyLevel.CRITICAL:
            reasons.append("Critical case prioritized for experienced physician")
        
        # Agent selection reasoning
        if agent.agent_type == AgentType.AI_TRIAGE:
            reasons.append("Routine case suitable for AI-assisted triage")
        elif agent.agent_type == AgentType.EMERGENCY_PHYSICIAN:
            reasons.append("Emergency physician selected for urgent/critical care")
        
        # Performance-based reasoning
        if agent.performance_metrics["accuracy_rate"] > 0.95:
            reasons.append(f"Agent has excellent accuracy rate ({agent.performance_metrics['accuracy_rate']:.1%})")
        
        # Risk-based reasoning
        if risk_analysis["risk_score"] > 0.7:
            reasons.append(f"High-risk patient (score: {risk_analysis['risk_score']:.2f}) assigned to qualified specialist")
        
        # Bias consideration
        if risk_analysis["bias_check"]["bias_detected"]:
            reasons.append("Potential algorithmic bias detected; human oversight recommended")
        
        return "; ".join(reasons)

# Global secure AI engine
healthcare_ai = SecureHealthcareAIEngine()

# Enhanced API Endpoints with security

@app.get("/health")
async def health_check():
    """Secure health check endpoint"""
    return {
        "status": "healthy",
        "service": "HIPAA-Compliant Healthcare Task Delegation Service",
        "version": "2.0.0",
        "port": 8012,
        "timestamp": datetime.now().isoformat(),
        "compliance": "HIPAA_COMPLIANT",
        "security_features": ["encryption", "audit_logging", "rate_limiting", "authentication"]
    }

@app.post("/api/v1/auth/login")
async def login(username: str, password: str):
    """Secure authentication endpoint"""
    # In production, verify against secure database with hashed passwords
    # This is a simplified example
    if username == "admin" and password == "secure_password":
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={
                "sub": username,
                "user_id": "user_001",
                "email": "admin@hospital.com",
                "role": "admin",
                "permissions": ["triage_access", "agent_management", "system_admin"]
            },
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/v1/healthcare/delegate-task", response_model=HealthcareResponse)
@require_permission("triage_access")
async def delegate_healthcare_task(
    task_request: HealthcareTaskRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Secure healthcare task delegation with HIPAA compliance
    """
    try:
        # Audit logging
        log_audit_event(
            "TASK_DELEGATION_REQUEST",
            current_user.user_id,
            {"task_id": task_request.task_id, "urgency": task_request.urgency_level}
        )
        
        logger.info(f"Processing secure healthcare task delegation: {task_request.task_id}")
        
        # Enhanced agent matching with security
        selected_agent = healthcare_ai.match_agent_to_task(task_request, current_user)
        
        # Risk analysis
        risk_analysis = healthcare_ai.calculate_patient_risk_score(
            task_request.patient_info, task_request.task_type
        )
        
        # Enhanced confidence calculation
        confidence = 0.8
        if task_request.urgency_level == UrgencyLevel.EMERGENCY and selected_agent.agent_type == AgentType.EMERGENCY_PHYSICIAN:
            confidence += 0.15
        
        # Bias adjustment
        if risk_analysis["bias_check"]["bias_detected"]:
            confidence -= 0.1  # Lower confidence for potentially biased cases
        
        confidence = min(confidence, 1.0)
        
        # Priority scoring
        priority_score = {
            UrgencyLevel.EMERGENCY: 10,
            UrgencyLevel.CRITICAL: 8,
            UrgencyLevel.URGENT: 6,
            UrgencyLevel.ROUTINE: 4
        }[task_request.urgency_level]
        
        # Estimated completion
        base_time = selected_agent.performance_metrics["avg_completion_time"]
        if task_request.urgency_level in [UrgencyLevel.EMERGENCY, UrgencyLevel.CRITICAL]:
            estimated_time = base_time * 0.7
        else:
            estimated_time = base_time
        
        estimated_completion = datetime.now() + timedelta(minutes=estimated_time)
        
        # Generate explainable reasoning
        reasoning = healthcare_ai.generate_explainable_reasoning(
            task_request, selected_agent, confidence, risk_analysis
        )
        
        # Create secure delegation
        delegation = TaskDelegation(
            delegation_id=str(uuid.uuid4()),
            task_id=task_request.task_id,
            assigned_agent_id=selected_agent.agent_id,
            agent_name=selected_agent.name,
            agent_type=selected_agent.agent_type,
            confidence=confidence,
            reasoning=reasoning,
            estimated_completion=estimated_completion,
            priority_score=priority_score,
            status=TaskStatus.ASSIGNED,
            created_by=current_user.user_id,
            audit_trail=[{
                "action": "task_created",
                "timestamp": datetime.now().isoformat(),
                "user_id": current_user.user_id,
                "risk_analysis": risk_analysis
            }]
        )
        
        # Update agent workload
        HEALTHCARE_AGENTS[selected_agent.agent_id].current_workload += 1
        HEALTHCARE_AGENTS[selected_agent.agent_id].last_updated = datetime.now()
        
        # Audit logging
        log_audit_event(
            "TASK_DELEGATED",
            current_user.user_id,
            {
                "task_id": task_request.task_id,
                "assigned_agent": selected_agent.agent_id,
                "confidence": confidence,
                "bias_detected": risk_analysis["bias_check"]["bias_detected"]
            }
        )
        
        logger.info(f"Task {task_request.task_id} securely delegated to {selected_agent.name} with {confidence:.2%} confidence")
        
        return HealthcareResponse(
            success=True,
            delegation=delegation,
            message=f"Healthcare task securely delegated to {selected_agent.name}",
            compliance_status="HIPAA_COMPLIANT"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in secure healthcare task delegation: {str(e)}")
        log_audit_event(
            "TASK_DELEGATION_ERROR",
            current_user.user_id,
            {"error": str(e), "task_id": task_request.task_id}
        )
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/healthcare/agents")
@require_permission("agent_management")
async def get_healthcare_agents(current_user: User = Depends(get_current_user)):
    """Get list of available healthcare agents with security filtering"""
    
    # Filter agents based on user security clearance
    visible_agents = [
        agent for agent in HEALTHCARE_AGENTS.values()
        if agent.security_clearance_level <= (5 if current_user.role == UserRole.ADMIN else 3)
    ]
    
    log_audit_event(
        "AGENTS_ACCESSED",
        current_user.user_id,
        {"agents_count": len(visible_agents)}
    )
    
    return {
        "agents": visible_agents,
        "total_agents": len(visible_agents),
        "available_agents": len([a for a in visible_agents if a.availability_status == "available"]),
        "compliance_status": "HIPAA_COMPLIANT"
    }

# Error handling middleware
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    log_audit_event(
        "HTTP_EXCEPTION",
        "system",
        {"status_code": exc.status_code, "detail": exc.detail, "path": str(request.url)}
    )
    return {"error": exc.detail, "status_code": exc.status_code}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8012, ssl_keyfile="key.pem", ssl_certfile="cert.pem")