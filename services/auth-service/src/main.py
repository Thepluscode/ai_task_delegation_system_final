"""
Enterprise Authentication Service - JWT, RBAC, and User Management
Provides secure authentication and authorization for the entire platform
"""
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, EmailStr
from typing import Dict, List, Optional, Any
import jwt
import bcrypt
import uuid
import sqlite3
import logging
from datetime import datetime, timezone, timedelta
import secrets
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import email service
try:
    from email_service import email_service
except ImportError:
    # Fallback if email service not available
    email_service = None
    logger.warning("Email service not available - emails will be logged only")

# Security configuration
SECRET_KEY = "your-super-secret-key-change-in-production"  # Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Security schemes
security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(
    title="Enterprise Authentication Service",
    description="JWT-based authentication and RBAC for Enterprise Automation Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., max_length=100)
    role: str = Field(default="user", description="User role")
    department: Optional[str] = Field(None, description="User department")

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    full_name: str
    role: str
    department: Optional[str]
    is_active: bool
    created_at: str
    last_login: Optional[str]

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class APIKeyCreate(BaseModel):
    name: str = Field(..., description="API key name/description")
    permissions: List[str] = Field(default=[], description="API key permissions")
    expires_days: Optional[int] = Field(30, description="Expiration in days")

class APIKeyResponse(BaseModel):
    key_id: str
    name: str
    api_key: str
    permissions: List[str]
    created_at: str
    expires_at: Optional[str]
    is_active: bool

class RolePermissions(BaseModel):
    role: str
    permissions: List[str]

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class EmailVerificationRequest(BaseModel):
    token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)

class UserSession(BaseModel):
    session_id: str
    user_id: str
    created_at: str
    last_activity: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    is_active: bool

class EmailConfigRequest(BaseModel):
    smtp_host: str = Field(..., description="SMTP server hostname")
    smtp_port: int = Field(587, description="SMTP server port")
    smtp_username: str = Field(..., description="SMTP username")
    smtp_password: str = Field(..., description="SMTP password")
    smtp_use_tls: bool = Field(True, description="Use TLS encryption")
    from_name: Optional[str] = Field("Enterprise Authentication", description="From name for emails")

class TestEmailRequest(BaseModel):
    to_email: str = Field(..., description="Email address to send test email to")
    email_type: str = Field("welcome", description="Type of email to test")

# Database management
class AuthDatabase:
    def __init__(self):
        self.db_path = "data/auth_service.db"
        self._init_database()
    
    def _init_database(self):
        """Initialize authentication database"""
        try:
            os.makedirs("data", exist_ok=True)
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'user',
                    department TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    email_verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    failed_login_attempts INTEGER DEFAULT 0,
                    locked_until TIMESTAMP,
                    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # API Keys table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS api_keys (
                    key_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    api_key_hash TEXT UNIQUE NOT NULL,
                    permissions TEXT,
                    created_by TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    last_used TIMESTAMP,
                    usage_count INTEGER DEFAULT 0,
                    FOREIGN KEY (created_by) REFERENCES users (user_id)
                )
            ''')
            
            # Refresh tokens table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    token_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    token_hash TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_revoked BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            ''')
            
            # Audit log table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS auth_audit_log (
                    log_id TEXT PRIMARY KEY,
                    user_id TEXT,
                    action TEXT NOT NULL,
                    resource TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    success BOOLEAN,
                    details TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Password reset tokens table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    token_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    token_hash TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    used_at TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            ''')

            # Email verification tokens table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS email_verification_tokens (
                    token_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    token_hash TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    used_at TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            ''')

            # User sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_sessions (
                    session_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ip_address TEXT,
                    user_agent TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    expires_at TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            ''')

            # Password history table (for password policy enforcement)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS password_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            ''')
            
            conn.commit()
            conn.close()
            
            # Create default admin user if none exists
            self._create_default_admin()
            
            logger.info("Authentication database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
    
    def _create_default_admin(self):
        """Create default admin user if none exists"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
            admin_count = cursor.fetchone()[0]
            
            if admin_count == 0:
                admin_id = str(uuid.uuid4())
                password_hash = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                cursor.execute('''
                    INSERT INTO users (user_id, username, email, password_hash, full_name, role, department)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (admin_id, "admin", "admin@enterprise.com", password_hash, 
                      "System Administrator", "admin", "IT"))
                
                conn.commit()
                logger.info("Default admin user created: admin/admin123")
            
            conn.close()
        except Exception as e:
            logger.error(f"Failed to create default admin: {e}")

# Global database instance
auth_db = AuthDatabase()

# Role-based permissions
ROLE_PERMISSIONS = {
    "admin": [
        "user:create", "user:read", "user:update", "user:delete",
        "api_key:create", "api_key:read", "api_key:delete",
        "system:monitor", "system:configure",
        "trading:execute", "trading:view", "trading:configure",
        "banking:process", "banking:view", "banking:configure",
        "healthcare:access", "healthcare:configure",
        "retail:manage", "retail:view",
        "iot:control", "iot:monitor", "iot:configure",
        "learning:train", "learning:view", "learning:configure"
    ],
    "manager": [
        "user:read", "user:update",
        "api_key:read",
        "system:monitor",
        "trading:execute", "trading:view",
        "banking:process", "banking:view",
        "healthcare:access",
        "retail:manage", "retail:view",
        "iot:monitor",
        "learning:view"
    ],
    "analyst": [
        "trading:view", "banking:view", "healthcare:access",
        "retail:view", "iot:monitor", "learning:view"
    ],
    "operator": [
        "trading:execute", "iot:control", "retail:manage"
    ],
    "user": [
        "trading:view", "banking:view", "retail:view", "iot:monitor"
    ]
}

# Authentication functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(user_id: str) -> str:
    """Create refresh token and store in database"""
    token_id = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    token_data = {
        "token_id": token_id,
        "user_id": user_id,
        "exp": expire,
        "type": "refresh"
    }
    
    refresh_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    
    # Store in database
    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (token_id, user_id, token_hash, expire))
        
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to store refresh token: {e}")
    
    return refresh_token

def verify_token(token: str) -> Optional[Dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

def get_user_permissions(role: str) -> List[str]:
    """Get permissions for a user role"""
    return ROLE_PERMISSIONS.get(role, [])

def check_permission(user_role: str, required_permission: str) -> bool:
    """Check if user role has required permission"""
    user_permissions = get_user_permissions(user_role)
    return required_permission in user_permissions

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Enterprise Authentication Service",
        "status": "running",
        "version": "1.0.0",
        "capabilities": [
            "jwt_authentication",
            "role_based_access_control",
            "user_management",
            "api_key_management",
            "audit_logging"
        ],
        "supported_roles": list(ROLE_PERMISSIONS.keys()),
        "token_expiry": f"{ACCESS_TOKEN_EXPIRE_MINUTES} minutes"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth-service", "version": "1.0.0"}

@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Check if username or email already exists
        cursor.execute("SELECT username, email FROM users WHERE username = ? OR email = ?",
                      (user_data.username, user_data.email))
        existing = cursor.fetchone()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Username or email already registered"
            )

        # Create new user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(user_data.password)

        cursor.execute('''
            INSERT INTO users (user_id, username, email, password_hash, full_name, role, department)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, user_data.username, user_data.email, password_hash,
              user_data.full_name, user_data.role, user_data.department))

        conn.commit()

        # Get created user
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        user_row = cursor.fetchone()

        # Generate email verification token
        verification_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(verification_token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)  # 24 hour expiry

        # Store verification token
        cursor.execute('''
            INSERT INTO email_verification_tokens (token_id, user_id, token_hash, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (str(uuid.uuid4()), user_id, token_hash, expires_at))

        conn.commit()
        conn.close()

        # Send verification email
        if email_service:
            try:
                email_sent = await email_service.send_email_verification(
                    email=user_data.email,
                    user_name=user_data.full_name,
                    username=user_data.username,
                    verification_token=verification_token
                )
                if email_sent:
                    logger.info(f"Verification email sent to: {user_data.email}")
                else:
                    logger.warning(f"Failed to send verification email to: {user_data.email}")
            except Exception as e:
                logger.error(f"Error sending verification email: {e}")
        else:
            logger.info(f"User registered: {user_data.username} (Email service not available)")

        # Log registration
        await log_auth_event(user_id, "user_registered", "users", True,
                           f"New user registered: {user_data.username}")

        user_response = UserResponse(
            user_id=user_row[0],
            username=user_row[1],
            email=user_row[2],
            full_name=user_row[4],
            role=user_row[5],
            department=user_row[6],
            is_active=bool(user_row[7]),
            created_at=user_row[9],  # Adjusted for new schema
            last_login=user_row[10]  # Adjusted for new schema
        )

        # Include verification token in development mode
        if not email_service or not email_service.config.SMTP_USERNAME:
            # Add verification token to response for testing
            user_response_dict = user_response.dict()
            user_response_dict["verification_token"] = verification_token
            return user_response_dict

        return user_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login_user(user_credentials: UserLogin):
    """Authenticate user and return JWT tokens"""

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Get user by username
        cursor.execute("SELECT * FROM users WHERE username = ? AND is_active = TRUE",
                      (user_credentials.username,))
        user_row = cursor.fetchone()

        if not user_row:
            await log_auth_event(None, "login_failed", "auth", False,
                               f"Login attempt with invalid username: {user_credentials.username}")
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password"
            )

        # Check if account is locked
        if user_row[11]:  # locked_until
            locked_until = datetime.fromisoformat(user_row[11])
            if datetime.now(timezone.utc) < locked_until:
                raise HTTPException(
                    status_code=423,
                    detail="Account temporarily locked due to failed login attempts"
                )

        # Verify password
        if not verify_password(user_credentials.password, user_row[3]):
            # Increment failed attempts
            failed_attempts = user_row[10] + 1
            locked_until = None

            if failed_attempts >= 5:  # Lock after 5 failed attempts
                locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)

            cursor.execute('''
                UPDATE users SET failed_login_attempts = ?, locked_until = ?
                WHERE user_id = ?
            ''', (failed_attempts, locked_until, user_row[0]))
            conn.commit()

            await log_auth_event(user_row[0], "login_failed", "auth", False,
                               f"Invalid password for user: {user_credentials.username}")

            raise HTTPException(
                status_code=401,
                detail="Invalid username or password"
            )

        # Reset failed attempts and update last login
        cursor.execute('''
            UPDATE users SET failed_login_attempts = 0, locked_until = NULL,
                           last_login = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (user_row[0],))
        conn.commit()
        conn.close()

        # Create tokens
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_row[0], "username": user_row[1], "role": user_row[5]},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(user_row[0])

        # Log successful login
        await log_auth_event(user_row[0], "login_success", "auth", True,
                           f"User logged in: {user_credentials.username}")

        user_response = UserResponse(
            user_id=user_row[0],
            username=user_row[1],
            email=user_row[2],
            full_name=user_row[4],
            role=user_row[5],
            department=user_row[6],
            is_active=bool(user_row[7]),
            created_at=user_row[9],  # Adjusted for new schema
            last_login=datetime.now(timezone.utc).isoformat()
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/api/v1/auth/refresh")
async def refresh_access_token(refresh_token: str):
    """Refresh access token using refresh token"""

    try:
        # Verify refresh token
        payload = verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        # Check if refresh token exists and is not revoked
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT rt.*, u.username, u.role FROM refresh_tokens rt
            JOIN users u ON rt.user_id = u.user_id
            WHERE rt.token_hash = ? AND rt.is_revoked = FALSE AND rt.expires_at > CURRENT_TIMESTAMP
        ''', (token_hash,))

        token_row = cursor.fetchone()
        if not token_row:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

        user_id = token_row[1]
        username = token_row[6]
        role = token_row[7]

        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id, "username": username, "role": role},
            expires_delta=access_token_expires
        )

        conn.close()

        await log_auth_event(user_id, "token_refreshed", "auth", True,
                           f"Access token refreshed for user: {username}")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(status_code=500, detail="Token refresh failed")

@app.post("/api/v1/auth/logout")
async def logout_user(refresh_token: str):
    """Logout user and revoke refresh token"""

    try:
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Revoke refresh token
        cursor.execute('''
            UPDATE refresh_tokens SET is_revoked = TRUE
            WHERE token_hash = ?
        ''', (token_hash,))

        conn.commit()
        conn.close()

        return {"message": "Logged out successfully"}

    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")

@app.get("/api/v1/auth/verify")
async def verify_token_endpoint(token: str = Depends(oauth2_scheme)):
    """Verify JWT token and return user info"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    # Get current user info
    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE user_id = ? AND is_active = TRUE", (user_id,))
        user_row = cursor.fetchone()
        conn.close()

        if not user_row:
            raise HTTPException(status_code=401, detail="User not found or inactive")

        return {
            "valid": True,
            "user": {
                "user_id": user_row[0],
                "username": user_row[1],
                "email": user_row[2],
                "role": user_row[5],
                "permissions": get_user_permissions(user_row[5])
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=500, detail="Token verification failed")

@app.post("/api/v1/auth/api-keys", response_model=APIKeyResponse)
async def create_api_key(api_key_data: APIKeyCreate, token: str = Depends(oauth2_scheme)):
    """Create a new API key"""

    # Verify user token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    user_role = payload.get("role")

    # Check permission
    if not check_permission(user_role, "api_key:create"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    try:
        # Generate API key
        key_id = str(uuid.uuid4())
        api_key = f"ak_{secrets.token_urlsafe(32)}"
        api_key_hash = hashlib.sha256(api_key.encode()).hexdigest()

        # Calculate expiration
        expires_at = None
        if api_key_data.expires_days:
            expires_at = datetime.now(timezone.utc) + timedelta(days=api_key_data.expires_days)

        # Store in database
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO api_keys (key_id, name, api_key_hash, permissions, created_by, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (key_id, api_key_data.name, api_key_hash,
              ",".join(api_key_data.permissions), user_id, expires_at))

        conn.commit()
        conn.close()

        await log_auth_event(user_id, "api_key_created", "api_keys", True,
                           f"API key created: {api_key_data.name}")

        return APIKeyResponse(
            key_id=key_id,
            name=api_key_data.name,
            api_key=api_key,  # Only returned once!
            permissions=api_key_data.permissions,
            created_at=datetime.now(timezone.utc).isoformat(),
            expires_at=expires_at.isoformat() if expires_at else None,
            is_active=True
        )

    except Exception as e:
        logger.error(f"API key creation error: {e}")
        raise HTTPException(status_code=500, detail="API key creation failed")

@app.get("/api/v1/auth/api-keys")
async def list_api_keys(token: str = Depends(oauth2_scheme)):
    """List user's API keys"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    user_role = payload.get("role")

    if not check_permission(user_role, "api_key:read"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT key_id, name, permissions, created_at, expires_at, is_active, last_used, usage_count
            FROM api_keys WHERE created_by = ? ORDER BY created_at DESC
        ''', (user_id,))

        api_keys = []
        for row in cursor.fetchall():
            api_keys.append({
                "key_id": row[0],
                "name": row[1],
                "permissions": row[2].split(",") if row[2] else [],
                "created_at": row[3],
                "expires_at": row[4],
                "is_active": bool(row[5]),
                "last_used": row[6],
                "usage_count": row[7]
            })

        conn.close()
        return {"api_keys": api_keys}

    except Exception as e:
        logger.error(f"API key listing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to list API keys")

@app.delete("/api/v1/auth/api-keys/{key_id}")
async def revoke_api_key(key_id: str, token: str = Depends(oauth2_scheme)):
    """Revoke an API key"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    user_role = payload.get("role")

    if not check_permission(user_role, "api_key:delete"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Check if API key belongs to user (or user is admin)
        if user_role != "admin":
            cursor.execute("SELECT created_by FROM api_keys WHERE key_id = ?", (key_id,))
            result = cursor.fetchone()
            if not result or result[0] != user_id:
                raise HTTPException(status_code=404, detail="API key not found")

        # Deactivate API key
        cursor.execute("UPDATE api_keys SET is_active = FALSE WHERE key_id = ?", (key_id,))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="API key not found")

        conn.commit()
        conn.close()

        await log_auth_event(user_id, "api_key_revoked", "api_keys", True,
                           f"API key revoked: {key_id}")

        return {"message": "API key revoked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API key revocation error: {e}")
        raise HTTPException(status_code=500, detail="API key revocation failed")

# Enhanced Authentication Endpoints

@app.post("/api/v1/auth/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """Initiate password reset process"""

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Check if user exists
        cursor.execute("SELECT user_id, username FROM users WHERE email = ? AND is_active = TRUE",
                      (request.email,))
        user_row = cursor.fetchone()

        if not user_row:
            # Don't reveal if email exists for security
            return {"message": "If the email exists, a password reset link has been sent"}

        user_id, username = user_row

        # Generate reset token
        token_id = str(uuid.uuid4())
        reset_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)  # 1 hour expiry

        # Store reset token
        cursor.execute('''
            INSERT INTO password_reset_tokens (token_id, user_id, token_hash, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (token_id, user_id, token_hash, expires_at))

        conn.commit()
        conn.close()

        # Send password reset email
        if email_service:
            try:
                email_sent = await email_service.send_password_reset_email(
                    email=request.email,
                    user_name=username,
                    reset_token=reset_token
                )
                if email_sent:
                    logger.info(f"Password reset email sent to: {request.email}")
                else:
                    logger.warning(f"Failed to send password reset email to: {request.email}")
            except Exception as e:
                logger.error(f"Error sending password reset email: {e}")
        else:
            logger.info(f"Password reset requested for user: {username} (Email service not available)")

        await log_auth_event(user_id, "password_reset_requested", "auth", True,
                           f"Password reset requested for: {request.email}")

        # In development, return token for testing
        response = {
            "message": "If the email exists, a password reset link has been sent",
            "expires_in": "1 hour"
        }

        # Only include token in development mode
        if not email_service or not email_service.config.SMTP_USERNAME:
            response["reset_token"] = reset_token  # For testing only

        return response

    except Exception as e:
        logger.error(f"Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Password reset failed")

@app.post("/api/v1/auth/reset-password")
async def reset_password(request: PasswordResetConfirm):
    """Confirm password reset with token"""

    try:
        token_hash = hashlib.sha256(request.token.encode()).hexdigest()

        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Verify reset token
        cursor.execute('''
            SELECT prt.user_id, u.username FROM password_reset_tokens prt
            JOIN users u ON prt.user_id = u.user_id
            WHERE prt.token_hash = ? AND prt.used = FALSE AND prt.expires_at > CURRENT_TIMESTAMP
        ''', (token_hash,))

        token_row = cursor.fetchone()
        if not token_row:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        user_id, username = token_row

        # Hash new password
        new_password_hash = hash_password(request.new_password)

        # Update user password
        cursor.execute('''
            UPDATE users
            SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP,
                failed_login_attempts = 0, locked_until = NULL
            WHERE user_id = ?
        ''', (new_password_hash, user_id))

        # Mark token as used
        cursor.execute('''
            UPDATE password_reset_tokens
            SET used = TRUE, used_at = CURRENT_TIMESTAMP
            WHERE token_hash = ?
        ''', (token_hash,))

        # Store password in history
        cursor.execute('''
            INSERT INTO password_history (user_id, password_hash)
            VALUES (?, ?)
        ''', (user_id, new_password_hash))

        conn.commit()
        conn.close()

        await log_auth_event(user_id, "password_reset_completed", "auth", True,
                           f"Password reset completed for: {username}")

        return {"message": "Password reset successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset confirmation error: {e}")
        raise HTTPException(status_code=500, detail="Password reset failed")

@app.post("/api/v1/auth/verify-email")
async def verify_email(request: EmailVerificationRequest):
    """Verify user email with token"""

    try:
        token_hash = hashlib.sha256(request.token.encode()).hexdigest()

        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Verify email token
        cursor.execute('''
            SELECT evt.user_id, u.username FROM email_verification_tokens evt
            JOIN users u ON evt.user_id = u.user_id
            WHERE evt.token_hash = ? AND evt.used = FALSE AND evt.expires_at > CURRENT_TIMESTAMP
        ''', (token_hash,))

        token_row = cursor.fetchone()
        if not token_row:
            raise HTTPException(status_code=400, detail="Invalid or expired verification token")

        user_id, username = token_row

        # Mark email as verified
        cursor.execute('''
            UPDATE users SET email_verified = TRUE WHERE user_id = ?
        ''', (user_id,))

        # Mark token as used
        cursor.execute('''
            UPDATE email_verification_tokens
            SET used = TRUE, used_at = CURRENT_TIMESTAMP
            WHERE token_hash = ?
        ''', (token_hash,))

        # Get user details for welcome email
        cursor.execute("SELECT email, full_name FROM users WHERE user_id = ?", (user_id,))
        user_details = cursor.fetchone()

        conn.commit()
        conn.close()

        # Send welcome email
        if email_service and user_details:
            try:
                email_sent = await email_service.send_welcome_email(
                    email=user_details[0],
                    user_name=user_details[1]
                )
                if email_sent:
                    logger.info(f"Welcome email sent to: {user_details[0]}")
            except Exception as e:
                logger.error(f"Error sending welcome email: {e}")

        await log_auth_event(user_id, "email_verified", "auth", True,
                           f"Email verified for: {username}")

        return {"message": "Email verified successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        raise HTTPException(status_code=500, detail="Email verification failed")

@app.put("/api/v1/auth/profile")
async def update_profile(request: UpdateProfileRequest, token: str = Depends(oauth2_scheme)):
    """Update user profile"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Build update query dynamically
        updates = []
        values = []

        if request.full_name is not None:
            updates.append("full_name = ?")
            values.append(request.full_name)

        if request.department is not None:
            updates.append("department = ?")
            values.append(request.department)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        values.append(user_id)

        cursor.execute(f'''
            UPDATE users SET {", ".join(updates)}
            WHERE user_id = ?
        ''', values)

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        # Get updated user
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        user_row = cursor.fetchone()

        conn.commit()
        conn.close()

        await log_auth_event(user_id, "profile_updated", "users", True,
                           f"Profile updated for user: {user_row[1]}")

        return UserResponse(
            user_id=user_row[0],
            username=user_row[1],
            email=user_row[2],
            full_name=user_row[4],
            role=user_row[5],
            department=user_row[6],
            is_active=bool(user_row[7]),
            created_at=user_row[9],
            last_login=user_row[10]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Profile update failed")

@app.post("/api/v1/auth/change-password")
async def change_password(request: ChangePasswordRequest, token: str = Depends(oauth2_scheme)):
    """Change user password"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Get current user
        cursor.execute("SELECT password_hash, username FROM users WHERE user_id = ?", (user_id,))
        user_row = cursor.fetchone()

        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")

        current_hash, username = user_row

        # Verify current password
        if not verify_password(request.current_password, current_hash):
            await log_auth_event(user_id, "password_change_failed", "auth", False,
                               f"Invalid current password for: {username}")
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        # Check password history (prevent reuse of last 5 passwords)
        cursor.execute('''
            SELECT password_hash FROM password_history
            WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
        ''', (user_id,))

        recent_passwords = [row[0] for row in cursor.fetchall()]
        for old_hash in recent_passwords:
            if verify_password(request.new_password, old_hash):
                raise HTTPException(
                    status_code=400,
                    detail="Cannot reuse one of your last 5 passwords"
                )

        # Hash new password
        new_password_hash = hash_password(request.new_password)

        # Update password
        cursor.execute('''
            UPDATE users
            SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (new_password_hash, user_id))

        # Store in password history
        cursor.execute('''
            INSERT INTO password_history (user_id, password_hash)
            VALUES (?, ?)
        ''', (user_id, new_password_hash))

        conn.commit()
        conn.close()

        await log_auth_event(user_id, "password_changed", "auth", True,
                           f"Password changed for: {username}")

        return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {e}")
        raise HTTPException(status_code=500, detail="Password change failed")

@app.get("/api/v1/auth/sessions")
async def get_user_sessions(token: str = Depends(oauth2_scheme)):
    """Get user's active sessions"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT session_id, created_at, last_activity, ip_address, user_agent, is_active
            FROM user_sessions
            WHERE user_id = ? AND is_active = TRUE
            ORDER BY last_activity DESC
        ''', (user_id,))

        sessions = []
        for row in cursor.fetchall():
            sessions.append(UserSession(
                session_id=row[0],
                user_id=user_id,
                created_at=row[1],
                last_activity=row[2],
                ip_address=row[3],
                user_agent=row[4],
                is_active=bool(row[5])
            ))

        conn.close()

        return {"sessions": sessions, "total_sessions": len(sessions)}

    except Exception as e:
        logger.error(f"Get sessions error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get sessions")

@app.post("/api/v1/auth/email/configure")
async def configure_email(config: EmailConfigRequest, token: str = Depends(oauth2_scheme)):
    """Configure SMTP settings (Admin only)"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Check if user is admin
    user_id = payload.get("sub")
    role = payload.get("role")

    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        if email_service:
            email_service.configure_smtp(
                host=config.smtp_host,
                port=config.smtp_port,
                username=config.smtp_username,
                password=config.smtp_password,
                use_tls=config.smtp_use_tls
            )

            if config.from_name:
                email_service.config.FROM_NAME = config.from_name

            await log_auth_event(user_id, "email_configured", "admin", True,
                               f"SMTP configuration updated by admin")

            return {"message": "Email configuration updated successfully"}
        else:
            raise HTTPException(status_code=503, detail="Email service not available")

    except Exception as e:
        logger.error(f"Email configuration error: {e}")
        raise HTTPException(status_code=500, detail="Email configuration failed")

@app.post("/api/v1/auth/email/test")
async def test_email(request: TestEmailRequest, token: str = Depends(oauth2_scheme)):
    """Send test email (Admin only)"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Check if user is admin
    user_id = payload.get("sub")
    role = payload.get("role")

    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        if not email_service:
            raise HTTPException(status_code=503, detail="Email service not available")

        # Send test email based on type
        if request.email_type == "welcome":
            success = await email_service.send_welcome_email(
                email=request.to_email,
                user_name="Test User"
            )
        elif request.email_type == "password_reset":
            success = await email_service.send_password_reset_email(
                email=request.to_email,
                user_name="Test User",
                reset_token="test_token_123"
            )
        elif request.email_type == "email_verification":
            success = await email_service.send_email_verification(
                email=request.to_email,
                user_name="Test User",
                username="testuser",
                verification_token="test_verification_123"
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid email type")

        await log_auth_event(user_id, "test_email_sent", "admin", success,
                           f"Test {request.email_type} email sent to {request.to_email}")

        if success:
            return {"message": f"Test {request.email_type} email sent successfully"}
        else:
            return {"message": f"Test {request.email_type} email failed to send"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Test email error: {e}")
        raise HTTPException(status_code=500, detail="Test email failed")

@app.get("/api/v1/auth/stats")
async def get_auth_stats():
    """Get authentication service statistics"""

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        # Get total users
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]

        # Get active users (users who logged in within last 24 hours)
        cursor.execute("""
            SELECT COUNT(DISTINCT user_id) FROM user_sessions
            WHERE created_at > datetime('now', '-1 day')
        """)
        active_users = cursor.fetchone()[0]

        # Get today's logins
        cursor.execute("""
            SELECT COUNT(*) FROM user_sessions
            WHERE created_at > datetime('now', 'start of day')
        """)
        today_logins = cursor.fetchone()[0]

        # Get recent login attempts (last 10)
        cursor.execute("""
            SELECT u.email, s.created_at, s.ip_address, 'success' as status
            FROM user_sessions s
            JOIN users u ON s.user_id = u.user_id
            ORDER BY s.created_at DESC
            LIMIT 10
        """)
        recent_logins = []
        for row in cursor.fetchall():
            recent_logins.append({
                "key": str(len(recent_logins) + 1),
                "user": row[0],
                "timestamp": row[1],
                "ip": row[2] or "Unknown",
                "status": row[3],
                "location": "Unknown"  # Would need GeoIP service for real location
            })

        conn.close()

        return {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "todayLogins": today_logins,
            "failedAttempts": 0,  # Would need to track failed attempts
            "tokenValidation": 99.7,  # Mock value
            "sessionDuration": 45,  # Mock value in minutes
            "recentLogins": recent_logins
        }

    except Exception as e:
        logger.error(f"Error getting auth stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get auth stats")

@app.get("/api/v1/auth/email/status")
async def get_email_status(token: str = Depends(oauth2_scheme)):
    """Get email service status (Admin only)"""

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Check if user is admin
    role = payload.get("role")

    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        if email_service:
            queue_status = email_service.get_queue_status()

            return {
                "email_service_available": True,
                "smtp_configured": bool(email_service.config.SMTP_USERNAME),
                "smtp_host": email_service.config.SMTP_HOST,
                "smtp_port": email_service.config.SMTP_PORT,
                "from_email": email_service.config.FROM_EMAIL,
                "from_name": email_service.config.FROM_NAME,
                "queue_status": queue_status
            }
        else:
            return {
                "email_service_available": False,
                "smtp_configured": False,
                "message": "Email service not available"
            }

    except Exception as e:
        logger.error(f"Email status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get email status")

# Helper function for audit logging
async def log_auth_event(user_id: Optional[str], action: str, resource: str,
                        success: bool, details: str, ip_address: str = None,
                        user_agent: str = None):
    """Log authentication events for audit trail"""

    try:
        conn = sqlite3.connect(auth_db.db_path)
        cursor = conn.cursor()

        log_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO auth_audit_log (log_id, user_id, action, resource, ip_address,
                                      user_agent, success, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (log_id, user_id, action, resource, ip_address, user_agent, success, details))

        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Audit logging error: {e}")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Enhanced Enterprise Authentication Service v2.0.0")
    uvicorn.run(app, host="0.0.0.0", port=8001)
