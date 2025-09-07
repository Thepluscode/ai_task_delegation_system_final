"""
Advanced Security & Compliance Framework
Comprehensive security, access control, and compliance management system
"""

import asyncio
import json
import logging
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
from enum import Enum
import jwt
import bcrypt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import re
import ipaddress

logger = logging.getLogger(__name__)

class SecurityLevel(Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"

class ComplianceFramework(Enum):
    SOC2 = "soc2"
    ISO27001 = "iso27001"
    GDPR = "gdpr"
    HIPAA = "hipaa"
    SOX = "sox"
    PCI_DSS = "pci_dss"
    NIST = "nist"
    ISO26262 = "iso26262"
    AS9100 = "as9100"
    HACCP = "haccp"

class UserRole(Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    OPERATOR = "operator"
    VIEWER = "viewer"
    AUDITOR = "auditor"
    GUEST = "guest"

class Permission(Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    EXECUTE = "execute"
    ADMIN = "admin"
    AUDIT = "audit"

@dataclass
class User:
    user_id: str
    username: str
    email: str
    roles: List[UserRole]
    permissions: List[Permission]
    security_clearance: SecurityLevel
    mfa_enabled: bool
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    account_locked: bool = False
    password_hash: Optional[str] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)

@dataclass
class AuditLog:
    log_id: str
    user_id: str
    action: str
    resource: str
    timestamp: datetime
    ip_address: str
    user_agent: str
    success: bool
    details: Dict[str, Any]
    compliance_frameworks: List[ComplianceFramework]

@dataclass
class SecurityPolicy:
    policy_id: str
    name: str
    description: str
    rules: List[Dict[str, Any]]
    compliance_frameworks: List[ComplianceFramework]
    enabled: bool = True
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)

class EncryptionManager:
    """Advanced encryption and key management"""
    
    def __init__(self, master_key: Optional[str] = None):
        if master_key:
            self.master_key = master_key.encode()
        else:
            self.master_key = Fernet.generate_key()
        
        self.fernet = Fernet(self.master_key)
        self.key_rotation_interval = timedelta(days=90)
        self.encryption_keys = {}
    
    def encrypt_data(self, data: str, key_id: Optional[str] = None) -> str:
        """Encrypt sensitive data"""
        if key_id and key_id in self.encryption_keys:
            fernet = Fernet(self.encryption_keys[key_id])
        else:
            fernet = self.fernet
        
        encrypted_data = fernet.encrypt(data.encode())
        return base64.b64encode(encrypted_data).decode()
    
    def decrypt_data(self, encrypted_data: str, key_id: Optional[str] = None) -> str:
        """Decrypt sensitive data"""
        if key_id and key_id in self.encryption_keys:
            fernet = Fernet(self.encryption_keys[key_id])
        else:
            fernet = self.fernet
        
        decoded_data = base64.b64decode(encrypted_data.encode())
        decrypted_data = fernet.decrypt(decoded_data)
        return decrypted_data.decode()
    
    def generate_key(self, key_id: str) -> str:
        """Generate new encryption key"""
        new_key = Fernet.generate_key()
        self.encryption_keys[key_id] = new_key
        return base64.b64encode(new_key).decode()
    
    def rotate_keys(self):
        """Rotate encryption keys"""
        # Implementation for key rotation
        logger.info("Rotating encryption keys")

class AuthenticationManager:
    """Multi-factor authentication and user management"""
    
    def __init__(self, encryption_manager: EncryptionManager):
        self.encryption_manager = encryption_manager
        self.users = {}
        self.sessions = {}
        self.jwt_secret = secrets.token_urlsafe(32)
        self.session_timeout = timedelta(hours=8)
        self.max_failed_attempts = 5
        self.lockout_duration = timedelta(minutes=30)
    
    async def create_user(self, username: str, email: str, password: str, 
                         roles: List[UserRole], security_clearance: SecurityLevel) -> User:
        """Create new user with secure password hashing"""
        user_id = secrets.token_urlsafe(16)
        
        # Hash password with bcrypt
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Determine permissions based on roles
        permissions = self._get_permissions_for_roles(roles)
        
        user = User(
            user_id=user_id,
            username=username,
            email=email,
            roles=roles,
            permissions=permissions,
            security_clearance=security_clearance,
            mfa_enabled=False,
            password_hash=password_hash
        )
        
        self.users[user_id] = user
        logger.info(f"Created user: {username} with roles: {[r.value for r in roles]}")
        
        return user
    
    def _get_permissions_for_roles(self, roles: List[UserRole]) -> List[Permission]:
        """Map roles to permissions"""
        permission_mapping = {
            UserRole.SUPER_ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.EXECUTE, Permission.ADMIN, Permission.AUDIT],
            UserRole.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.EXECUTE, Permission.ADMIN],
            UserRole.MANAGER: [Permission.READ, Permission.WRITE, Permission.EXECUTE],
            UserRole.OPERATOR: [Permission.READ, Permission.WRITE],
            UserRole.VIEWER: [Permission.READ],
            UserRole.AUDITOR: [Permission.READ, Permission.AUDIT],
            UserRole.GUEST: [Permission.READ]
        }
        
        all_permissions = set()
        for role in roles:
            all_permissions.update(permission_mapping.get(role, []))
        
        return list(all_permissions)
    
    async def authenticate_user(self, username: str, password: str, ip_address: str, 
                              user_agent: str, mfa_token: Optional[str] = None) -> Optional[str]:
        """Authenticate user with optional MFA"""
        user = self._find_user_by_username(username)
        if not user:
            await self._log_security_event("login_failed", username, ip_address, user_agent, 
                                          {"reason": "user_not_found"})
            return None
        
        # Check if account is locked
        if user.account_locked:
            await self._log_security_event("login_failed", username, ip_address, user_agent, 
                                          {"reason": "account_locked"})
            return None
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            user.failed_login_attempts += 1
            
            # Lock account after max failed attempts
            if user.failed_login_attempts >= self.max_failed_attempts:
                user.account_locked = True
                await self._log_security_event("account_locked", username, ip_address, user_agent, 
                                              {"failed_attempts": user.failed_login_attempts})
            
            await self._log_security_event("login_failed", username, ip_address, user_agent, 
                                          {"reason": "invalid_password", "attempts": user.failed_login_attempts})
            return None
        
        # Verify MFA if enabled
        if user.mfa_enabled and not self._verify_mfa_token(user, mfa_token):
            await self._log_security_event("login_failed", username, ip_address, user_agent, 
                                          {"reason": "invalid_mfa"})
            return None
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.last_login = datetime.now(timezone.utc)
        
        # Generate JWT token
        token = self._generate_jwt_token(user)
        
        # Create session
        session_id = secrets.token_urlsafe(32)
        self.sessions[session_id] = {
            'user_id': user.user_id,
            'token': token,
            'created_at': datetime.now(timezone.utc),
            'ip_address': ip_address,
            'user_agent': user_agent
        }
        
        await self._log_security_event("login_success", username, ip_address, user_agent, 
                                      {"session_id": session_id})
        
        return token
    
    def _find_user_by_username(self, username: str) -> Optional[User]:
        """Find user by username"""
        for user in self.users.values():
            if user.username == username:
                return user
        return None
    
    def _verify_mfa_token(self, user: User, mfa_token: Optional[str]) -> bool:
        """Verify MFA token (simplified implementation)"""
        if not mfa_token:
            return False
        # In real implementation, this would verify TOTP, SMS, or hardware token
        return len(mfa_token) == 6 and mfa_token.isdigit()
    
    def _generate_jwt_token(self, user: User) -> str:
        """Generate JWT token for authenticated user"""
        payload = {
            'user_id': user.user_id,
            'username': user.username,
            'roles': [role.value for role in user.roles],
            'permissions': [perm.value for perm in user.permissions],
            'security_clearance': user.security_clearance.value,
            'exp': datetime.utcnow() + self.session_timeout,
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')
    
    async def _log_security_event(self, action: str, username: str, ip_address: str, 
                                user_agent: str, details: Dict[str, Any]):
        """Log security events for audit trail"""
        # Implementation would log to secure audit system
        logger.info(f"Security event: {action} for user {username} from {ip_address}")

class AccessControlManager:
    """Role-based access control (RBAC) manager"""
    
    def __init__(self):
        self.resource_permissions = {}
        self.role_hierarchies = {
            UserRole.SUPER_ADMIN: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],
            UserRole.ADMIN: [UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],
            UserRole.MANAGER: [UserRole.OPERATOR, UserRole.VIEWER],
            UserRole.OPERATOR: [UserRole.VIEWER],
            UserRole.AUDITOR: [UserRole.VIEWER]
        }
    
    def define_resource_permissions(self, resource: str, required_permissions: List[Permission], 
                                  min_security_clearance: SecurityLevel):
        """Define permissions required for a resource"""
        self.resource_permissions[resource] = {
            'permissions': required_permissions,
            'min_security_clearance': min_security_clearance
        }
    
    def check_access(self, user: User, resource: str, action: Permission) -> bool:
        """Check if user has access to perform action on resource"""
        if resource not in self.resource_permissions:
            return False
        
        resource_config = self.resource_permissions[resource]
        
        # Check security clearance
        clearance_levels = {
            SecurityLevel.PUBLIC: 0,
            SecurityLevel.INTERNAL: 1,
            SecurityLevel.CONFIDENTIAL: 2,
            SecurityLevel.RESTRICTED: 3,
            SecurityLevel.TOP_SECRET: 4
        }
        
        user_clearance_level = clearance_levels.get(user.security_clearance, 0)
        required_clearance_level = clearance_levels.get(resource_config['min_security_clearance'], 0)
        
        if user_clearance_level < required_clearance_level:
            return False
        
        # Check permissions
        if action not in user.permissions:
            return False
        
        # Check if action is in required permissions for resource
        if action not in resource_config['permissions']:
            return True  # Action not restricted for this resource
        
        return True
    
    def get_effective_roles(self, user_roles: List[UserRole]) -> Set[UserRole]:
        """Get all effective roles including inherited ones"""
        effective_roles = set(user_roles)
        
        for role in user_roles:
            if role in self.role_hierarchies:
                effective_roles.update(self.role_hierarchies[role])
        
        return effective_roles

class ComplianceManager:
    """Industry-specific compliance management"""
    
    def __init__(self):
        self.compliance_policies = {}
        self.audit_logs = []
        self.compliance_checks = {}
    
    def register_compliance_framework(self, framework: ComplianceFramework, policies: List[SecurityPolicy]):
        """Register compliance framework with associated policies"""
        self.compliance_policies[framework] = policies
        logger.info(f"Registered compliance framework: {framework.value}")
    
    async def perform_compliance_check(self, framework: ComplianceFramework) -> Dict[str, Any]:
        """Perform compliance check for specific framework"""
        if framework not in self.compliance_policies:
            return {"status": "error", "message": "Framework not registered"}
        
        policies = self.compliance_policies[framework]
        results = {
            "framework": framework.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_policies": len(policies),
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        for policy in policies:
            check_result = await self._check_policy_compliance(policy)
            results["details"].append(check_result)
            
            if check_result["status"] == "passed":
                results["passed"] += 1
            else:
                results["failed"] += 1
        
        results["compliance_score"] = (results["passed"] / results["total_policies"]) * 100
        
        return results
    
    async def _check_policy_compliance(self, policy: SecurityPolicy) -> Dict[str, Any]:
        """Check compliance for individual policy"""
        # Simplified compliance checking logic
        # Real implementation would have specific checks for each policy type
        
        return {
            "policy_id": policy.policy_id,
            "policy_name": policy.name,
            "status": "passed",  # or "failed"
            "details": "Policy compliance verified",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def generate_compliance_report(self, framework: ComplianceFramework, 
                                 start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate compliance report for audit purposes"""
        relevant_logs = [
            log for log in self.audit_logs
            if start_date <= log.timestamp <= end_date
            and framework in log.compliance_frameworks
        ]
        
        return {
            "framework": framework.value,
            "report_period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "total_events": len(relevant_logs),
            "security_events": len([log for log in relevant_logs if "security" in log.action]),
            "access_events": len([log for log in relevant_logs if "access" in log.action]),
            "compliance_violations": len([log for log in relevant_logs if not log.success]),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

class SecurityFramework:
    """Main security framework orchestrator"""
    
    def __init__(self):
        self.encryption_manager = EncryptionManager()
        self.auth_manager = AuthenticationManager(self.encryption_manager)
        self.access_control = AccessControlManager()
        self.compliance_manager = ComplianceManager()
        self.intrusion_detection = IntrusionDetectionSystem()
        
        # Initialize default security policies
        self._initialize_default_policies()
    
    def _initialize_default_policies(self):
        """Initialize default security policies"""
        # Password policy
        password_policy = SecurityPolicy(
            policy_id="password_001",
            name="Strong Password Policy",
            description="Enforce strong password requirements",
            rules=[
                {"min_length": 12},
                {"require_uppercase": True},
                {"require_lowercase": True},
                {"require_numbers": True},
                {"require_special_chars": True},
                {"password_history": 12}
            ],
            compliance_frameworks=[ComplianceFramework.SOC2, ComplianceFramework.ISO27001]
        )
        
        # Session management policy
        session_policy = SecurityPolicy(
            policy_id="session_001",
            name="Session Management Policy",
            description="Secure session management requirements",
            rules=[
                {"session_timeout": 480},  # 8 hours
                {"idle_timeout": 30},      # 30 minutes
                {"concurrent_sessions": 3},
                {"secure_cookies": True}
            ],
            compliance_frameworks=[ComplianceFramework.SOC2, ComplianceFramework.GDPR]
        )
        
        # Register policies with compliance manager
        self.compliance_manager.register_compliance_framework(
            ComplianceFramework.SOC2, 
            [password_policy, session_policy]
        )

class IntrusionDetectionSystem:
    """Network intrusion detection and prevention"""
    
    def __init__(self):
        self.suspicious_ips = set()
        self.rate_limits = {}
        self.threat_patterns = []
        
    async def analyze_request(self, ip_address: str, user_agent: str, 
                            endpoint: str, payload: Optional[str] = None) -> Dict[str, Any]:
        """Analyze incoming request for security threats"""
        threats_detected = []
        risk_score = 0
        
        # Check IP reputation
        if self._is_suspicious_ip(ip_address):
            threats_detected.append("suspicious_ip")
            risk_score += 30
        
        # Check rate limiting
        if self._check_rate_limit(ip_address):
            threats_detected.append("rate_limit_exceeded")
            risk_score += 20
        
        # Check for SQL injection patterns
        if payload and self._detect_sql_injection(payload):
            threats_detected.append("sql_injection")
            risk_score += 50
        
        # Check for XSS patterns
        if payload and self._detect_xss(payload):
            threats_detected.append("xss_attempt")
            risk_score += 40
        
        return {
            "ip_address": ip_address,
            "risk_score": risk_score,
            "threats_detected": threats_detected,
            "action": "block" if risk_score >= 50 else "allow",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _is_suspicious_ip(self, ip_address: str) -> bool:
        """Check if IP address is in suspicious list"""
        return ip_address in self.suspicious_ips
    
    def _check_rate_limit(self, ip_address: str) -> bool:
        """Check if IP has exceeded rate limits"""
        current_time = datetime.now()
        if ip_address not in self.rate_limits:
            self.rate_limits[ip_address] = []
        
        # Remove old requests (older than 1 minute)
        self.rate_limits[ip_address] = [
            timestamp for timestamp in self.rate_limits[ip_address]
            if current_time - timestamp < timedelta(minutes=1)
        ]
        
        # Add current request
        self.rate_limits[ip_address].append(current_time)
        
        # Check if rate limit exceeded (100 requests per minute)
        return len(self.rate_limits[ip_address]) > 100
    
    def _detect_sql_injection(self, payload: str) -> bool:
        """Detect SQL injection patterns"""
        sql_patterns = [
            r"(\bunion\b.*\bselect\b)",
            r"(\bselect\b.*\bfrom\b)",
            r"(\binsert\b.*\binto\b)",
            r"(\bdelete\b.*\bfrom\b)",
            r"(\bdrop\b.*\btable\b)",
            r"(\bor\b.*=.*)",
            r"(\band\b.*=.*)",
            r"(--)",
            r"(\/\*.*\*\/)"
        ]
        
        payload_lower = payload.lower()
        for pattern in sql_patterns:
            if re.search(pattern, payload_lower):
                return True
        return False
    
    def _detect_xss(self, payload: str) -> bool:
        """Detect XSS patterns"""
        xss_patterns = [
            r"<script.*?>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe.*?>",
            r"<object.*?>",
            r"<embed.*?>"
        ]
        
        for pattern in xss_patterns:
            if re.search(pattern, payload, re.IGNORECASE):
                return True
        return False

# Global security framework instance
security_framework = SecurityFramework()
