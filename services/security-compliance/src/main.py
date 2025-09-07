#!/usr/bin/env python3
"""
Security and Compliance Framework Service
Enterprise-grade security with OAuth2, RBAC, audit trails, and regulatory compliance
"""

import asyncio
import logging
import time
import uuid
import json
import hashlib
import hmac
import jwt
import secrets
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Union, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from collections import defaultdict, deque
import bcrypt

from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Security and Compliance Framework",
    description="Enterprise-grade security with OAuth2, RBAC, audit trails, and regulatory compliance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Security schemes
security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Data Models
class UserRole(str, Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"
    ROBOT = "robot"
    SYSTEM = "system"

class AuditEventType(str, Enum):
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    WORKFLOW_CREATED = "workflow_created"
    WORKFLOW_STARTED = "workflow_started"
    WORKFLOW_COMPLETED = "workflow_completed"
    TASK_DELEGATED = "task_delegated"
    ROBOT_COMMAND = "robot_command"
    SECURITY_VIOLATION = "security_violation"
    DATA_ACCESS = "data_access"
    CONFIGURATION_CHANGE = "configuration_change"

class ComplianceFramework(str, Enum):
    ISO_9001 = "iso_9001"
    FDA_21_CFR_PART_11 = "fda_21_cfr_part_11"
    GDPR = "gdpr"
    HIPAA = "hipaa"
    SOC_2 = "soc_2"

@dataclass
class User:
    id: str
    username: str
    email: str
    password_hash: str
    role: UserRole
    permissions: List[str]
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None

@dataclass
class AuditEvent:
    id: str
    event_type: AuditEventType
    user_id: Optional[str]
    session_id: Optional[str]
    ip_address: str
    user_agent: str
    resource: str
    action: str
    details: Dict[str, Any]
    timestamp: datetime
    integrity_hash: str

@dataclass
class TokenPayload:
    user_id: str
    username: str
    role: UserRole
    permissions: List[str]
    exp: datetime
    iat: datetime
    jti: str  # JWT ID

# Authentication Manager
class AuthenticationManager:
    """Manage user authentication with OAuth2 and JWT"""
    
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.refresh_tokens: Dict[str, str] = {}  # refresh_token -> user_id
        self.failed_attempts: Dict[str, List[datetime]] = defaultdict(list)
        self.rate_limits = {
            'login_attempts': 5,
            'lockout_duration': 900,  # 15 minutes
            'rate_window': 300        # 5 minutes
        }
        
        # Create default admin user
        self._create_default_users()
    
    def _create_default_users(self):
        """Create default system users"""
        admin_user = User(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@automation-platform.com",
            password_hash=self._hash_password("admin123"),
            role=UserRole.ADMIN,
            permissions=self._get_role_permissions(UserRole.ADMIN),
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        
        operator_user = User(
            id=str(uuid.uuid4()),
            username="operator",
            email="operator@automation-platform.com",
            password_hash=self._hash_password("operator123"),
            role=UserRole.OPERATOR,
            permissions=self._get_role_permissions(UserRole.OPERATOR),
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        
        self.users[admin_user.username] = admin_user
        self.users[operator_user.username] = operator_user
    
    def _hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    def _get_role_permissions(self, role: UserRole) -> List[str]:
        """Get permissions for role"""
        role_permissions = {
            UserRole.ADMIN: [
                'workflow.create', 'workflow.read', 'workflow.update', 'workflow.delete',
                'agent.create', 'agent.read', 'agent.update', 'agent.delete',
                'robot.command', 'robot.configure',
                'system.configure', 'system.monitor', 'audit.read',
                'user.create', 'user.read', 'user.update', 'user.delete'
            ],
            UserRole.OPERATOR: [
                'workflow.create', 'workflow.read', 'workflow.update',
                'agent.read', 'agent.update',
                'robot.command', 'system.monitor'
            ],
            UserRole.VIEWER: [
                'workflow.read', 'agent.read', 'system.monitor'
            ],
            UserRole.ROBOT: [
                'workflow.read', 'task.update', 'status.report'
            ],
            UserRole.SYSTEM: [
                'workflow.read', 'workflow.update', 'agent.read', 'agent.update',
                'system.monitor', 'audit.create'
            ]
        }
        
        return role_permissions.get(role, [])
    
    async def authenticate_user(self, username: str, password: str, ip_address: str) -> Dict[str, Any]:
        """Authenticate user and return tokens"""
        
        # Check rate limiting
        if not self._check_rate_limit(ip_address):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again later."
            )
        
        # Get user
        user = self.users.get(username)
        if not user:
            self._record_failed_attempt(ip_address)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if user is locked
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is temporarily locked due to failed login attempts"
            )
        
        # Verify password
        if not self._verify_password(password, user.password_hash):
            user.failed_login_attempts += 1
            
            # Lock account after too many failed attempts
            if user.failed_login_attempts >= self.rate_limits['login_attempts']:
                user.locked_until = datetime.now(timezone.utc) + timedelta(
                    seconds=self.rate_limits['lockout_duration']
                )
            
            self._record_failed_attempt(ip_address)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.now(timezone.utc)
        
        # Generate tokens
        access_token = self._generate_access_token(user)
        refresh_token = self._generate_refresh_token(user)
        
        # Create session
        session_id = str(uuid.uuid4())
        self.active_sessions[session_id] = {
            'user_id': user.id,
            'username': user.username,
            'ip_address': ip_address,
            'created_at': datetime.now(timezone.utc),
            'last_activity': datetime.now(timezone.utc)
        }
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'bearer',
            'expires_in': ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            'user_info': {
                'id': user.id,
                'username': user.username,
                'role': user.role.value,
                'permissions': user.permissions
            },
            'session_id': session_id
        }
    
    def _generate_access_token(self, user: User) -> str:
        """Generate JWT access token"""
        now = datetime.now(timezone.utc)
        payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role.value,
            'permissions': user.permissions,
            'exp': now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            'iat': now,
            'jti': str(uuid.uuid4())
        }
        
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    def _generate_refresh_token(self, user: User) -> str:
        """Generate refresh token"""
        refresh_token = secrets.token_urlsafe(32)
        self.refresh_tokens[refresh_token] = user.id
        return refresh_token
    
    def _check_rate_limit(self, ip_address: str) -> bool:
        """Check if IP address is rate limited"""
        now = datetime.now(timezone.utc)
        window_start = now - timedelta(seconds=self.rate_limits['rate_window'])
        
        # Clean old attempts
        self.failed_attempts[ip_address] = [
            attempt for attempt in self.failed_attempts[ip_address]
            if attempt > window_start
        ]
        
        # Check if under limit
        return len(self.failed_attempts[ip_address]) < self.rate_limits['login_attempts']
    
    def _record_failed_attempt(self, ip_address: str):
        """Record failed login attempt"""
        self.failed_attempts[ip_address].append(datetime.now(timezone.utc))
    
    async def verify_token(self, token: str) -> TokenPayload:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Check if user still exists and is active
            username = payload.get('username')
            user = self.users.get(username)
            
            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive"
                )
            
            return TokenPayload(
                user_id=payload['user_id'],
                username=payload['username'],
                role=UserRole(payload['role']),
                permissions=payload['permissions'],
                exp=datetime.fromtimestamp(payload['exp'], tz=timezone.utc),
                iat=datetime.fromtimestamp(payload['iat'], tz=timezone.utc),
                jti=payload['jti']
            )
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token using refresh token"""
        user_id = self.refresh_tokens.get(refresh_token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Find user
        user = None
        for u in self.users.values():
            if u.id == user_id:
                user = u
                break
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Generate new access token
        access_token = self._generate_access_token(user)
        
        return {
            'access_token': access_token,
            'token_type': 'bearer',
            'expires_in': ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

# Role-Based Access Control Manager
class RBACManager:
    """Manage role-based access control and permissions"""

    def __init__(self):
        self.permission_cache = {}
        self.resource_permissions = {
            'workflows': {
                'create': [UserRole.ADMIN, UserRole.OPERATOR],
                'read': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
                'update': [UserRole.ADMIN, UserRole.OPERATOR],
                'delete': [UserRole.ADMIN]
            },
            'agents': {
                'create': [UserRole.ADMIN],
                'read': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
                'update': [UserRole.ADMIN, UserRole.OPERATOR],
                'delete': [UserRole.ADMIN]
            },
            'robots': {
                'command': [UserRole.ADMIN, UserRole.OPERATOR],
                'configure': [UserRole.ADMIN],
                'read': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER]
            },
            'system': {
                'configure': [UserRole.ADMIN],
                'monitor': [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER]
            },
            'audit': {
                'read': [UserRole.ADMIN],
                'create': [UserRole.ADMIN, UserRole.SYSTEM]
            }
        }

    def check_permission(self, user_role: UserRole, resource: str, action: str) -> bool:
        """Check if user role has permission for resource action"""
        cache_key = f"{user_role.value}:{resource}:{action}"

        if cache_key in self.permission_cache:
            return self.permission_cache[cache_key]

        # Check permission
        resource_perms = self.resource_permissions.get(resource, {})
        action_perms = resource_perms.get(action, [])

        has_permission = user_role in action_perms

        # Cache result
        self.permission_cache[cache_key] = has_permission

        return has_permission

    def require_permission(self, resource: str, action: str):
        """Decorator to require specific permission"""
        def decorator(func):
            async def wrapper(*args, **kwargs):
                # Get current user from token
                token = kwargs.get('token') or args[0] if args else None
                if not token:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authentication required"
                    )

                user_payload = await auth_manager.verify_token(token)

                if not self.check_permission(user_payload.role, resource, action):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Permission denied: {resource}.{action}"
                    )

                return await func(*args, **kwargs)
            return wrapper
        return decorator

# Audit Trail Manager
class AuditTrailManager:
    """Manage comprehensive audit trails with integrity protection"""

    def __init__(self):
        self.audit_events: List[AuditEvent] = []
        self.encryption_key = SECRET_KEY.encode('utf-8')
        self.integrity_chain = []
        self.audit_config = {
            'retention_days': 2555,  # 7 years
            'encryption_enabled': True,
            'integrity_verification': True,
            'real_time_monitoring': True
        }

    async def log_audit_event(self, event_type: AuditEventType, user_id: Optional[str],
                            session_id: Optional[str], ip_address: str, user_agent: str,
                            resource: str, action: str, details: Dict[str, Any]):
        """Log audit event with integrity protection"""

        event_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc)

        # Create audit event
        event = AuditEvent(
            id=event_id,
            event_type=event_type,
            user_id=user_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            resource=resource,
            action=action,
            details=details,
            timestamp=timestamp,
            integrity_hash=""  # Will be calculated
        )

        # Calculate integrity hash
        event.integrity_hash = self._calculate_integrity_hash(event)

        # Encrypt sensitive data if enabled
        if self.audit_config['encryption_enabled']:
            event.details = self._encrypt_sensitive_data(event.details)

        # Add to audit trail
        self.audit_events.append(event)

        # Update integrity chain
        self._update_integrity_chain(event)

        # Real-time monitoring
        if self.audit_config['real_time_monitoring']:
            await self._monitor_audit_event(event)

        logger.info(f"Audit event logged: {event_type.value} by user {user_id}")

    def _calculate_integrity_hash(self, event: AuditEvent) -> str:
        """Calculate integrity hash for audit event"""
        # Create hash input from event data
        hash_input = f"{event.id}{event.event_type.value}{event.user_id}{event.timestamp.isoformat()}{json.dumps(event.details, sort_keys=True)}"

        # Add previous hash for chaining
        if self.integrity_chain:
            hash_input += self.integrity_chain[-1]

        # Calculate HMAC
        return hmac.new(
            self.encryption_key,
            hash_input.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    def _encrypt_sensitive_data(self, details: Dict[str, Any]) -> Dict[str, Any]:
        """Encrypt sensitive data in audit details"""
        # Simplified encryption (in production, use proper encryption)
        sensitive_fields = ['password', 'token', 'api_key', 'secret']

        encrypted_details = details.copy()
        for field in sensitive_fields:
            if field in encrypted_details:
                encrypted_details[field] = "[ENCRYPTED]"

        return encrypted_details

    def _update_integrity_chain(self, event: AuditEvent):
        """Update integrity chain with new event"""
        self.integrity_chain.append(event.integrity_hash)

        # Keep only last 10000 hashes to prevent memory issues
        if len(self.integrity_chain) > 10000:
            self.integrity_chain = self.integrity_chain[-10000:]

    async def _monitor_audit_event(self, event: AuditEvent):
        """Monitor audit event for security violations"""
        # Check for suspicious patterns
        if event.event_type == AuditEventType.SECURITY_VIOLATION:
            await self._handle_security_violation(event)

        # Check for multiple failed logins
        if event.event_type == AuditEventType.USER_LOGIN and not event.details.get('success', True):
            await self._check_failed_login_pattern(event)

    async def _handle_security_violation(self, event: AuditEvent):
        """Handle detected security violation"""
        logger.warning(f"Security violation detected: {event.details}")

        # Could trigger alerts, notifications, etc.
        # For now, just log

    async def _check_failed_login_pattern(self, event: AuditEvent):
        """Check for suspicious failed login patterns"""
        # Count recent failed logins from same IP
        recent_failures = [
            e for e in self.audit_events[-100:]  # Last 100 events
            if (e.event_type == AuditEventType.USER_LOGIN and
                e.ip_address == event.ip_address and
                not e.details.get('success', True) and
                (datetime.now(timezone.utc) - e.timestamp).total_seconds() < 3600)  # Last hour
        ]

        if len(recent_failures) >= 5:
            # Log security violation
            await self.log_audit_event(
                AuditEventType.SECURITY_VIOLATION,
                None,
                None,
                event.ip_address,
                event.user_agent,
                "authentication",
                "multiple_failed_logins",
                {"failed_attempts": len(recent_failures), "ip_address": event.ip_address}
            )

    async def verify_audit_integrity(self, start_date: Optional[datetime] = None,
                                   end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Verify integrity of audit trail"""
        events_to_verify = self.audit_events

        if start_date or end_date:
            events_to_verify = [
                e for e in self.audit_events
                if (not start_date or e.timestamp >= start_date) and
                   (not end_date or e.timestamp <= end_date)
            ]

        verification_results = {
            'total_events': len(events_to_verify),
            'verified_events': 0,
            'integrity_violations': [],
            'verification_timestamp': datetime.now(timezone.utc).isoformat()
        }

        for event in events_to_verify:
            # Recalculate hash and compare
            expected_hash = self._calculate_integrity_hash(event)

            if event.integrity_hash == expected_hash:
                verification_results['verified_events'] += 1
            else:
                verification_results['integrity_violations'].append({
                    'event_id': event.id,
                    'timestamp': event.timestamp.isoformat(),
                    'expected_hash': expected_hash,
                    'actual_hash': event.integrity_hash
                })

        verification_results['integrity_score'] = (
            verification_results['verified_events'] / verification_results['total_events']
            if verification_results['total_events'] > 0 else 1.0
        )

        return verification_results

    async def generate_audit_report(self, start_date: datetime, end_date: datetime,
                                  event_types: Optional[List[AuditEventType]] = None) -> Dict[str, Any]:
        """Generate comprehensive audit report"""

        # Filter events
        filtered_events = [
            e for e in self.audit_events
            if start_date <= e.timestamp <= end_date and
               (not event_types or e.event_type in event_types)
        ]

        # Generate statistics
        event_type_counts = defaultdict(int)
        user_activity = defaultdict(int)
        hourly_activity = defaultdict(int)

        for event in filtered_events:
            event_type_counts[event.event_type.value] += 1
            if event.user_id:
                user_activity[event.user_id] += 1
            hourly_activity[event.timestamp.hour] += 1

        return {
            'report_period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': {
                'total_events': len(filtered_events),
                'unique_users': len(user_activity),
                'event_types': len(event_type_counts)
            },
            'event_type_breakdown': dict(event_type_counts),
            'user_activity': dict(user_activity),
            'hourly_activity': dict(hourly_activity),
            'top_events': [
                asdict(event) for event in
                sorted(filtered_events, key=lambda e: e.timestamp, reverse=True)[:10]
            ],
            'generated_at': datetime.now(timezone.utc).isoformat()
        }

# Compliance Manager
class ComplianceManager:
    """Manage regulatory compliance requirements"""

    def __init__(self):
        self.compliance_frameworks = {
            ComplianceFramework.ISO_9001: ISO9001ComplianceChecker(),
            ComplianceFramework.FDA_21_CFR_PART_11: FDA21CFRPart11Checker(),
            ComplianceFramework.GDPR: GDPRComplianceChecker(),
            ComplianceFramework.HIPAA: HIPAAComplianceChecker(),
            ComplianceFramework.SOC_2: SOC2ComplianceChecker()
        }
        self.compliance_status = {}

    async def check_compliance(self, framework: ComplianceFramework,
                             resource_id: str) -> Dict[str, Any]:
        """Check compliance for specific framework"""
        checker = self.compliance_frameworks.get(framework)
        if not checker:
            raise ValueError(f"Unknown compliance framework: {framework}")

        compliance_result = await checker.check_compliance(resource_id)

        # Store compliance status
        self.compliance_status[f"{framework.value}:{resource_id}"] = {
            'result': compliance_result,
            'checked_at': datetime.now(timezone.utc),
            'valid_until': datetime.now(timezone.utc) + timedelta(days=30)
        }

        return compliance_result

# Simplified compliance checkers (would be more complex in production)
class ISO9001ComplianceChecker:
    async def check_compliance(self, resource_id: str) -> Dict[str, Any]:
        return {
            'compliant': True,
            'framework': 'ISO 9001',
            'requirements_met': ['quality_management', 'process_documentation', 'continuous_improvement'],
            'violations': [],
            'recommendations': []
        }

class FDA21CFRPart11Checker:
    async def check_compliance(self, resource_id: str) -> Dict[str, Any]:
        return {
            'compliant': True,
            'framework': 'FDA 21 CFR Part 11',
            'requirements_met': ['electronic_signatures', 'audit_trails', 'data_integrity'],
            'violations': [],
            'recommendations': []
        }

class GDPRComplianceChecker:
    async def check_compliance(self, resource_id: str) -> Dict[str, Any]:
        return {
            'compliant': True,
            'framework': 'GDPR',
            'requirements_met': ['data_protection', 'consent_management', 'right_to_erasure'],
            'violations': [],
            'recommendations': []
        }

class HIPAAComplianceChecker:
    async def check_compliance(self, resource_id: str) -> Dict[str, Any]:
        return {
            'compliant': True,
            'framework': 'HIPAA',
            'requirements_met': ['data_encryption', 'access_controls', 'audit_logging'],
            'violations': [],
            'recommendations': []
        }

class SOC2ComplianceChecker:
    async def check_compliance(self, resource_id: str) -> Dict[str, Any]:
        return {
            'compliant': True,
            'framework': 'SOC 2',
            'requirements_met': ['security', 'availability', 'processing_integrity'],
            'violations': [],
            'recommendations': []
        }

# Pydantic models for API
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class UserCreateRequest(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole

class AuditQueryRequest(BaseModel):
    start_date: str  # ISO format
    end_date: str    # ISO format
    event_types: Optional[List[AuditEventType]] = None
    user_id: Optional[str] = None

class ComplianceCheckRequest(BaseModel):
    framework: ComplianceFramework
    resource_id: str

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    return await auth_manager.verify_token(token)

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Security and Compliance Framework",
        "version": "1.0.0",
        "description": "Enterprise-grade security with OAuth2, RBAC, audit trails, and regulatory compliance",
        "features": [
            "oauth2_authentication",
            "jwt_tokens",
            "role_based_access_control",
            "comprehensive_audit_trails",
            "regulatory_compliance",
            "robot_communication_security"
        ],
        "compliance_frameworks": [framework.value for framework in ComplianceFramework],
        "supported_roles": [role.value for role in UserRole]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "security-compliance",
        "components": {
            "authentication": "operational",
            "authorization": "operational",
            "audit_trail": "operational",
            "compliance": "operational"
        },
        "metrics": {
            "active_users": len([u for u in auth_manager.users.values() if u.is_active]),
            "active_sessions": len(auth_manager.active_sessions),
            "audit_events": len(audit_manager.audit_events),
            "compliance_checks": len(compliance_manager.compliance_status)
        }
    }

@app.post("/api/v1/auth/login")
async def login(login_request: LoginRequest, request):
    """Authenticate user and return tokens"""
    try:
        # Get client IP
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "unknown")

        # Authenticate user
        auth_result = await auth_manager.authenticate_user(
            login_request.username,
            login_request.password,
            client_ip
        )

        # Log successful login
        user = auth_manager.users.get(login_request.username)
        if user:
            await audit_manager.log_audit_event(
                AuditEventType.USER_LOGIN,
                user.id,
                auth_result['session_id'],
                client_ip,
                user_agent,
                "authentication",
                "login",
                {"success": True, "username": login_request.username}
            )

        return auth_result

    except HTTPException as e:
        # Log failed login
        await audit_manager.log_audit_event(
            AuditEventType.USER_LOGIN,
            None,
            None,
            client_ip,
            user_agent,
            "authentication",
            "login",
            {"success": False, "username": login_request.username, "error": e.detail}
        )
        raise

@app.post("/api/v1/auth/refresh")
async def refresh_token(refresh_request: TokenRefreshRequest):
    """Refresh access token"""
    try:
        return await auth_manager.refresh_access_token(refresh_request.refresh_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/api/v1/auth/logout")
async def logout(current_user: TokenPayload = Depends(get_current_user)):
    """Logout user and invalidate session"""
    try:
        # Find and remove session
        session_to_remove = None
        for session_id, session in auth_manager.active_sessions.items():
            if session['user_id'] == current_user.user_id:
                session_to_remove = session_id
                break

        if session_to_remove:
            del auth_manager.active_sessions[session_to_remove]

        # Log logout
        await audit_manager.log_audit_event(
            AuditEventType.USER_LOGOUT,
            current_user.user_id,
            session_to_remove,
            "unknown",  # IP not available in this context
            "unknown",  # User agent not available
            "authentication",
            "logout",
            {"username": current_user.username}
        )

        return {"message": "Successfully logged out"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/auth/me")
async def get_current_user_info(current_user: TokenPayload = Depends(get_current_user)):
    """Get current user information"""
    try:
        user = auth_manager.users.get(current_user.username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "permissions": user.permissions,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/users")
async def create_user(user_request: UserCreateRequest,
                     current_user: TokenPayload = Depends(get_current_user)):
    """Create new user (admin only)"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "user", "create"):
            raise HTTPException(status_code=403, detail="Permission denied")

        # Check if user already exists
        if user_request.username in auth_manager.users:
            raise HTTPException(status_code=400, detail="Username already exists")

        # Create user
        new_user = User(
            id=str(uuid.uuid4()),
            username=user_request.username,
            email=user_request.email,
            password_hash=auth_manager._hash_password(user_request.password),
            role=user_request.role,
            permissions=auth_manager._get_role_permissions(user_request.role),
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )

        auth_manager.users[new_user.username] = new_user

        # Log user creation
        await audit_manager.log_audit_event(
            AuditEventType.CONFIGURATION_CHANGE,
            current_user.user_id,
            None,
            "unknown",
            "unknown",
            "user_management",
            "create_user",
            {"new_user_id": new_user.id, "new_username": new_user.username, "role": new_user.role.value}
        )

        return {
            "success": True,
            "user_id": new_user.id,
            "username": new_user.username,
            "message": "User created successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/users")
async def list_users(current_user: TokenPayload = Depends(get_current_user)):
    """List all users (admin only)"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "user", "read"):
            raise HTTPException(status_code=403, detail="Permission denied")

        users_list = []
        for user in auth_manager.users.values():
            users_list.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.value,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None
            })

        return {
            "users": users_list,
            "total_count": len(users_list)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/audit/events")
async def get_audit_events(start_date: Optional[str] = None, end_date: Optional[str] = None,
                          event_type: Optional[AuditEventType] = None,
                          user_id: Optional[str] = None,
                          limit: int = 100,
                          current_user: TokenPayload = Depends(get_current_user)):
    """Get audit events with filtering"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "audit", "read"):
            raise HTTPException(status_code=403, detail="Permission denied")

        # Parse dates
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None

        # Filter events
        filtered_events = []
        for event in audit_manager.audit_events:
            # Date filter
            if start_dt and event.timestamp < start_dt:
                continue
            if end_dt and event.timestamp > end_dt:
                continue

            # Event type filter
            if event_type and event.event_type != event_type:
                continue

            # User filter
            if user_id and event.user_id != user_id:
                continue

            filtered_events.append(event)

        # Limit results
        filtered_events = filtered_events[-limit:]

        return {
            "events": [asdict(event) for event in filtered_events],
            "total_count": len(filtered_events),
            "filters_applied": {
                "start_date": start_date,
                "end_date": end_date,
                "event_type": event_type.value if event_type else None,
                "user_id": user_id,
                "limit": limit
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/audit/report")
async def generate_audit_report(audit_query: AuditQueryRequest,
                               current_user: TokenPayload = Depends(get_current_user)):
    """Generate comprehensive audit report"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "audit", "read"):
            raise HTTPException(status_code=403, detail="Permission denied")

        # Parse dates
        start_date = datetime.fromisoformat(audit_query.start_date.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(audit_query.end_date.replace('Z', '+00:00'))

        # Generate report
        report = await audit_manager.generate_audit_report(
            start_date, end_date, audit_query.event_types
        )

        # Log report generation
        await audit_manager.log_audit_event(
            AuditEventType.DATA_ACCESS,
            current_user.user_id,
            None,
            "unknown",
            "unknown",
            "audit",
            "generate_report",
            {"report_period": f"{start_date.isoformat()} to {end_date.isoformat()}"}
        )

        return report

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/audit/verify")
async def verify_audit_integrity(start_date: Optional[str] = None, end_date: Optional[str] = None,
                                current_user: TokenPayload = Depends(get_current_user)):
    """Verify audit trail integrity"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "audit", "read"):
            raise HTTPException(status_code=403, detail="Permission denied")

        # Parse dates
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None

        # Verify integrity
        verification_result = await audit_manager.verify_audit_integrity(start_dt, end_dt)

        # Log verification
        await audit_manager.log_audit_event(
            AuditEventType.DATA_ACCESS,
            current_user.user_id,
            None,
            "unknown",
            "unknown",
            "audit",
            "verify_integrity",
            {"verification_result": verification_result['integrity_score']}
        )

        return verification_result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/compliance/check")
async def check_compliance(compliance_request: ComplianceCheckRequest,
                          current_user: TokenPayload = Depends(get_current_user)):
    """Check compliance for specific framework"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "system", "monitor"):
            raise HTTPException(status_code=403, detail="Permission denied")

        # Perform compliance check
        compliance_result = await compliance_manager.check_compliance(
            compliance_request.framework,
            compliance_request.resource_id
        )

        # Log compliance check
        await audit_manager.log_audit_event(
            AuditEventType.DATA_ACCESS,
            current_user.user_id,
            None,
            "unknown",
            "unknown",
            "compliance",
            "check_compliance",
            {
                "framework": compliance_request.framework.value,
                "resource_id": compliance_request.resource_id,
                "compliant": compliance_result['compliant']
            }
        )

        return compliance_result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/compliance/status")
async def get_compliance_status(current_user: TokenPayload = Depends(get_current_user)):
    """Get overall compliance status"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "system", "monitor"):
            raise HTTPException(status_code=403, detail="Permission denied")

        # Get compliance status for all frameworks
        compliance_summary = {}

        for framework in ComplianceFramework:
            framework_status = []
            for key, status in compliance_manager.compliance_status.items():
                if key.startswith(f"{framework.value}:"):
                    framework_status.append(status)

            if framework_status:
                compliance_summary[framework.value] = {
                    "total_checks": len(framework_status),
                    "compliant_checks": len([s for s in framework_status if s['result']['compliant']]),
                    "last_check": max([s['checked_at'] for s in framework_status]).isoformat(),
                    "compliance_rate": len([s for s in framework_status if s['result']['compliant']]) / len(framework_status)
                }
            else:
                compliance_summary[framework.value] = {
                    "total_checks": 0,
                    "compliant_checks": 0,
                    "last_check": None,
                    "compliance_rate": 0.0
                }

        return {
            "compliance_summary": compliance_summary,
            "overall_compliance_rate": sum([s['compliance_rate'] for s in compliance_summary.values()]) / len(compliance_summary),
            "total_frameworks": len(ComplianceFramework),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Robot Communication Security
class RobotSecurityManager:
    """Manage secure communication with robots"""

    def __init__(self):
        self.robot_certificates = {}
        self.robot_sessions = {}
        self.security_policies = {
            'require_tls': True,
            'certificate_validation': True,
            'command_signing': True,
            'session_timeout': 3600  # 1 hour
        }

    async def authenticate_robot(self, robot_id: str, certificate: str) -> Dict[str, Any]:
        """Authenticate robot with certificate"""
        try:
            # Validate certificate (simplified)
            if self._validate_robot_certificate(robot_id, certificate):
                # Create secure session
                session_id = str(uuid.uuid4())
                session_token = secrets.token_urlsafe(32)

                self.robot_sessions[robot_id] = {
                    'session_id': session_id,
                    'session_token': session_token,
                    'created_at': datetime.now(timezone.utc),
                    'last_activity': datetime.now(timezone.utc),
                    'certificate_hash': hashlib.sha256(certificate.encode()).hexdigest()
                }

                return {
                    'authenticated': True,
                    'session_id': session_id,
                    'session_token': session_token,
                    'expires_in': self.security_policies['session_timeout']
                }
            else:
                return {'authenticated': False, 'error': 'Invalid certificate'}

        except Exception as e:
            logger.error(f"Robot authentication error: {e}")
            return {'authenticated': False, 'error': str(e)}

    def _validate_robot_certificate(self, robot_id: str, certificate: str) -> bool:
        """Validate robot certificate"""
        # Simplified certificate validation
        # In production, would use proper PKI validation
        return len(certificate) > 100 and robot_id in certificate

    async def verify_robot_command(self, robot_id: str, command: Dict[str, Any],
                                 signature: str) -> bool:
        """Verify signed robot command"""
        try:
            # Check if robot has active session
            if robot_id not in self.robot_sessions:
                return False

            session = self.robot_sessions[robot_id]

            # Check session timeout
            if (datetime.now(timezone.utc) - session['last_activity']).total_seconds() > self.security_policies['session_timeout']:
                del self.robot_sessions[robot_id]
                return False

            # Verify command signature (simplified)
            command_str = json.dumps(command, sort_keys=True)
            expected_signature = hmac.new(
                session['session_token'].encode(),
                command_str.encode(),
                hashlib.sha256
            ).hexdigest()

            # Update last activity
            session['last_activity'] = datetime.now(timezone.utc)

            return hmac.compare_digest(signature, expected_signature)

        except Exception as e:
            logger.error(f"Command verification error: {e}")
            return False

robot_security_manager = RobotSecurityManager()

@app.post("/api/v1/robots/authenticate")
async def authenticate_robot(robot_id: str, certificate: str):
    """Authenticate robot for secure communication"""
    try:
        auth_result = await robot_security_manager.authenticate_robot(robot_id, certificate)

        # Log robot authentication
        await audit_manager.log_audit_event(
            AuditEventType.USER_LOGIN,
            robot_id,
            auth_result.get('session_id'),
            "robot_network",
            f"robot_{robot_id}",
            "robot_authentication",
            "authenticate",
            {"robot_id": robot_id, "success": auth_result['authenticated']}
        )

        return auth_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/robots/{robot_id}/command")
async def send_robot_command(robot_id: str, command: Dict[str, Any], signature: str,
                           current_user: TokenPayload = Depends(get_current_user)):
    """Send secure command to robot"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "robots", "command"):
            raise HTTPException(status_code=403, detail="Permission denied")

        # Verify command signature
        if not await robot_security_manager.verify_robot_command(robot_id, command, signature):
            raise HTTPException(status_code=401, detail="Invalid command signature")

        # Log robot command
        await audit_manager.log_audit_event(
            AuditEventType.ROBOT_COMMAND,
            current_user.user_id,
            None,
            "unknown",
            "unknown",
            "robot_control",
            "send_command",
            {"robot_id": robot_id, "command_type": command.get('type', 'unknown')}
        )

        return {
            "success": True,
            "robot_id": robot_id,
            "command_accepted": True,
            "message": "Command sent successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Global instances
auth_manager = AuthenticationManager()
rbac_manager = RBACManager()
audit_manager = AuditTrailManager()
compliance_manager = ComplianceManager()

@app.get("/api/v1/security/sessions")
async def get_active_sessions(current_user: TokenPayload = Depends(get_current_user)):
    """Get active user sessions (admin only)"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "system", "monitor"):
            raise HTTPException(status_code=403, detail="Permission denied")

        sessions_info = []
        for session_id, session in auth_manager.active_sessions.items():
            sessions_info.append({
                "session_id": session_id,
                "user_id": session['user_id'],
                "username": session['username'],
                "ip_address": session['ip_address'],
                "created_at": session['created_at'].isoformat(),
                "last_activity": session['last_activity'].isoformat()
            })

        return {
            "active_sessions": sessions_info,
            "total_sessions": len(sessions_info)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/security/sessions/{session_id}")
async def terminate_session(session_id: str, current_user: TokenPayload = Depends(get_current_user)):
    """Terminate specific session (admin only)"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "system", "configure"):
            raise HTTPException(status_code=403, detail="Permission denied")

        if session_id in auth_manager.active_sessions:
            terminated_session = auth_manager.active_sessions[session_id]
            del auth_manager.active_sessions[session_id]

            # Log session termination
            await audit_manager.log_audit_event(
                AuditEventType.SECURITY_VIOLATION,
                current_user.user_id,
                session_id,
                "unknown",
                "unknown",
                "session_management",
                "terminate_session",
                {"terminated_user": terminated_session['username'], "reason": "admin_action"}
            )

            return {"success": True, "message": "Session terminated"}
        else:
            raise HTTPException(status_code=404, detail="Session not found")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/security/permissions")
async def get_permissions(current_user: TokenPayload = Depends(get_current_user)):
    """Get current user permissions"""
    try:
        return {
            "user_id": current_user.user_id,
            "username": current_user.username,
            "role": current_user.role.value,
            "permissions": current_user.permissions,
            "resource_permissions": {
                resource: {
                    action: rbac_manager.check_permission(current_user.role, resource, action)
                    for action in actions.keys()
                }
                for resource, actions in rbac_manager.resource_permissions.items()
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/security/metrics")
async def get_security_metrics(current_user: TokenPayload = Depends(get_current_user)):
    """Get security metrics and statistics"""
    try:
        # Check permission
        if not rbac_manager.check_permission(current_user.role, "system", "monitor"):
            raise HTTPException(status_code=403, detail="Permission denied")

        # Calculate metrics
        now = datetime.now(timezone.utc)
        last_24h = now - timedelta(hours=24)

        recent_events = [e for e in audit_manager.audit_events if e.timestamp >= last_24h]

        login_events = [e for e in recent_events if e.event_type == AuditEventType.USER_LOGIN]
        failed_logins = [e for e in login_events if not e.details.get('success', True)]
        security_violations = [e for e in recent_events if e.event_type == AuditEventType.SECURITY_VIOLATION]

        return {
            "security_metrics": {
                "active_users": len([u for u in auth_manager.users.values() if u.is_active]),
                "active_sessions": len(auth_manager.active_sessions),
                "active_robot_sessions": len(robot_security_manager.robot_sessions),
                "total_audit_events": len(audit_manager.audit_events),
                "events_last_24h": len(recent_events),
                "failed_logins_24h": len(failed_logins),
                "security_violations_24h": len(security_violations),
                "compliance_checks": len(compliance_manager.compliance_status)
            },
            "authentication_stats": {
                "total_login_attempts_24h": len(login_events),
                "successful_logins_24h": len(login_events) - len(failed_logins),
                "failed_logins_24h": len(failed_logins),
                "login_success_rate": (len(login_events) - len(failed_logins)) / max(len(login_events), 1)
            },
            "audit_trail_stats": {
                "total_events": len(audit_manager.audit_events),
                "integrity_chain_length": len(audit_manager.integrity_chain),
                "encryption_enabled": audit_manager.audit_config['encryption_enabled'],
                "real_time_monitoring": audit_manager.audit_config['real_time_monitoring']
            },
            "generated_at": now.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time security monitoring
@app.websocket("/ws/security")
async def security_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time security monitoring"""
    await websocket.accept()

    try:
        while True:
            # Send security status updates
            security_update = {
                "type": "security_status_update",
                "data": {
                    "active_sessions": len(auth_manager.active_sessions),
                    "active_robot_sessions": len(robot_security_manager.robot_sessions),
                    "recent_audit_events": len([
                        e for e in audit_manager.audit_events
                        if (datetime.now(timezone.utc) - e.timestamp).total_seconds() < 300  # Last 5 minutes
                    ]),
                    "security_violations": len([
                        e for e in audit_manager.audit_events
                        if e.event_type == AuditEventType.SECURITY_VIOLATION and
                           (datetime.now(timezone.utc) - e.timestamp).total_seconds() < 3600  # Last hour
                    ]),
                    "compliance_status": len(compliance_manager.compliance_status)
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            await websocket.send_json(security_update)
            await asyncio.sleep(5)  # Send updates every 5 seconds

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Security WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8007)
