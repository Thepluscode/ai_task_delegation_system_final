import base64
import hashlib
import hmac
import json
import os
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union

from cryptography.fernet import Fernet, InvalidToken
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from .config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    scopes={
        "admin": "Admin operations",
        "user": "Regular user operations",
        "read": "Read-only access",
    },
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    scopes: List[str] = []

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    scopes: List[str] = []

class UserInDB(User):
    hashed_password: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)

def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

async def get_current_user(
    security_scopes: SecurityScopes, token: str = Depends(oauth2_scheme)
) -> UserInDB:
    """Get the current user from the JWT token."""
    if security_scopes.scopes:
        authenticate_value = f"Bearer scope='{' '.join(security_scopes.scopes)}'"
    else:
        authenticate_value = "Bearer"
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = TokenData(scopes=token_scopes, username=username)
    except (JWTError, ValidationError):
        raise credentials_exception
    
    # In a real app, you would get the user from a database here
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )
    
    return user

def get_user(username: str) -> Optional[UserInDB]:
    """Get a user by username."""
    # In a real app, this would query a database
    if username == "admin":
        return UserInDB(
            username="admin",
            hashed_password=get_password_hash("admin"),
            scopes=["admin"],
        )
    return None

# Data encryption
class DataEncryption:
    """Class for encrypting and decrypting sensitive data."""
    
    def __init__(self, key: str = None):
        """Initialize with a key or use the one from settings."""
        self.key = key or settings.ENCRYPTION_KEY
        # Ensure the key is the correct length for Fernet (32 bytes)
        key_bytes = self.key.encode()
        key_hash = hashlib.sha256(key_bytes).digest()
        self.fernet = Fernet(base64.urlsafe_b64encode(key_hash[:32]))
    
    def encrypt(self, data: Union[dict, list, str, bytes]) -> str:
        """Encrypt data."""
        if isinstance(data, (dict, list)):
            data_bytes = json.dumps(data).encode()
        elif isinstance(data, str):
            data_bytes = data.encode()
        else:
            data_bytes = data
        
        return self.fernet.encrypt(data_bytes).decode()
    
    def decrypt(self, encrypted_data: str) -> Union[dict, list, str]:
        """Decrypt data."""
        try:
            decrypted_bytes = self.fernet.decrypt(encrypted_data.encode())
            # Try to parse as JSON first
            try:
                return json.loads(decrypted_bytes)
            except json.JSONDecodeError:
                return decrypted_bytes.decode()
        except (InvalidToken, Exception) as e:
            raise ValueError(f"Failed to decrypt data: {e}")

# Rate limiting middleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to handle rate limiting."""
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and metrics
        if request.url.path in ["/health", "/ready", "/metrics"]:
            return await call_next(request)
            
        # Apply rate limiting
        response = await call_next(request)
        
        # Add rate limit headers
        rate_limit = request.scope.get("rate_limit")
        if rate_limit:
            response.headers["X-RateLimit-Limit"] = str(rate_limit.limit)
            response.headers["X-RateLimit-Remaining"] = str(rate_limit.remaining)
            
            if rate_limit.reset_at:
                response.headers["X-RateLimit-Reset"] = str(rate_limit.reset_at)
        
        return response

def setup_security(app: FastAPI) -> None:
    """Set up security middleware and dependencies."""
    # Initialize rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Add rate limiting middleware
    app.add_middleware(
        SlowAPIMiddleware,
        key_func=get_remote_address,
        default_limits=[settings.RATE_LIMIT],
    )
    
    # Add rate limit headers middleware
    app.add_middleware(RateLimitMiddleware)
    
    # Add CORS middleware
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add security headers middleware
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response
