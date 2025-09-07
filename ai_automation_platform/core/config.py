import os
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, Field, field_validator, ConfigDict
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore',  # Ignore extra fields in the .env file
        validate_default=True
    )
    
    # Application
    PROJECT_NAME: str = "AI Automation Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server Configuration
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        elif isinstance(v, str) and v.startswith("[") and v.endswith("]"):
            import json
            return json.loads(v)
        raise ValueError(v)
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./ai_automation.db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 3600
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Cache
    CACHE_BACKEND: str = "redis"
    CACHE_TTL: int = 300
    
    # Database Pool
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    DB_POOL_PRE_PING: bool = True
    
    # Rate Limiting
    RATE_LIMIT: str = "100/minute"
    
    # Circuit Breaker
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 5
    CIRCUIT_BREAKER_RECOVERY_TIMEOUT: int = 60  # seconds
    
    # Retry
    MAX_RETRIES: int = 3
    RETRY_BACKOFF_FACTOR: float = 0.3
    
    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 8001
    METRICS_PATH: str = "/metrics"
    
    # OpenTelemetry
    ENABLE_TRACING: bool = True
    TRACING_SERVICE_NAME: str = "ai-automation"
    TRACING_AGENT_HOST: str = "localhost"
    TRACING_AGENT_PORT: int = 6831
    
    # Encryption
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "your-32-byte-encryption-key-here")

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
