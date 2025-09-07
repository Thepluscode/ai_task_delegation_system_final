"""
Database Service Configuration
Centralized configuration for enterprise database management
"""

import os
from typing import Optional


class DatabaseConfig:
    """Database configuration settings"""
    """Database configuration settings"""

    def __init__(self):
        # PostgreSQL Configuration
        self.POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
        self.POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
        self.POSTGRES_USER = os.getenv("POSTGRES_USER", "enterprise_user")
        self.POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "enterprise_pass")
        self.POSTGRES_DB = os.getenv("POSTGRES_DB", "enterprise_platform")

        # Connection Pool Settings
        self.POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "20"))
        self.MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "30"))
        self.POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
        self.POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))

        # Redis Configuration (for caching)
        self.REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
        self.REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
        self.REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
        self.REDIS_DB = int(os.getenv("REDIS_DB", "0"))

        # Service Configuration
        self.SERVICE_NAME = "database-service"
        self.SERVICE_VERSION = "1.0.0"
        self.SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8002"))

        # Security
        self.API_KEY_HEADER = "X-API-Key"
        self.ALLOWED_SERVICES = [
            "auth-service",
            "monitoring-service",
            "learning-service",
            "trading-service",
            "market-signals-service",
            "banking-service",
            "healthcare-service",
            "retail-service",
            "iot-service",
            "main-platform"
        ]

        # Backup Configuration
        self.BACKUP_ENABLED = os.getenv("BACKUP_ENABLED", "true").lower() == "true"
        self.BACKUP_SCHEDULE = os.getenv("BACKUP_SCHEDULE", "0 2 * * *")
        self.BACKUP_RETENTION_DAYS = int(os.getenv("BACKUP_RETENTION_DAYS", "30"))
        self.BACKUP_LOCATION = os.getenv("BACKUP_LOCATION", "./backups")

        # Performance Monitoring
        self.SLOW_QUERY_THRESHOLD = float(os.getenv("SLOW_QUERY_THRESHOLD", "1.0"))
        self.ENABLE_QUERY_LOGGING = os.getenv("ENABLE_QUERY_LOGGING", "true").lower() == "true"
    
    @property
    def database_url(self) -> str:
        """Get PostgreSQL database URL"""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def sync_database_url(self) -> str:
        """Get synchronous PostgreSQL database URL for migrations"""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def redis_url(self) -> str:
        """Get Redis URL"""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"



# Global configuration instance
config = DatabaseConfig()


class ServiceConfig:
    """Service-specific database configurations"""
    
    SERVICES = {
        "auth-service": {
            "schema": "auth",
            "tables": ["users", "user_sessions", "api_keys", "password_reset_tokens", 
                      "email_verification_tokens", "password_history", "auth_audit_log"],
            "description": "Authentication and user management"
        },
        "monitoring-service": {
            "schema": "monitoring", 
            "tables": ["task_monitors", "progress_history", "anomalies", "alerts"],
            "description": "Task monitoring and anomaly detection"
        },
        "learning-service": {
            "schema": "learning",
            "tables": ["agent_performance", "task_feedback", "learning_models", "predictions"],
            "description": "AI learning and performance optimization"
        },
        "trading-service": {
            "schema": "trading",
            "tables": ["trades", "positions", "market_data", "trading_strategies", "risk_metrics"],
            "description": "High-frequency trading and market operations"
        },
        "market-signals-service": {
            "schema": "market",
            "tables": ["market_signals", "signal_history", "market_analysis", "predictions"],
            "description": "Market analysis and signal generation"
        },
        "banking-service": {
            "schema": "banking",
            "tables": ["loan_applications", "credit_assessments", "risk_profiles", "decisions"],
            "description": "Banking and loan processing"
        },
        "healthcare-service": {
            "schema": "healthcare",
            "tables": ["patient_data", "medical_routing", "triage_decisions", "compliance_logs"],
            "description": "Healthcare data and HIPAA compliance"
        },
        "retail-service": {
            "schema": "retail",
            "tables": ["customer_interactions", "product_recommendations", "order_processing"],
            "description": "Retail and e-commerce operations"
        },
        "iot-service": {
            "schema": "iot",
            "tables": ["device_data", "sensor_readings", "device_status", "maintenance_logs"],
            "description": "IoT device management and monitoring"
        },
        "main-platform": {
            "schema": "platform",
            "tables": ["tasks", "workflows", "agents", "delegations", "system_metrics"],
            "description": "Main platform orchestration"
        }
    }
    
    @classmethod
    def get_service_config(cls, service_name: str) -> dict:
        """Get configuration for a specific service"""
        return cls.SERVICES.get(service_name, {})
    
    @classmethod
    def get_all_schemas(cls) -> list:
        """Get all database schemas"""
        return [service["schema"] for service in cls.SERVICES.values()]
    
    @classmethod
    def get_service_by_schema(cls, schema: str) -> str:
        """Get service name by schema"""
        for service_name, config in cls.SERVICES.items():
            if config["schema"] == schema:
                return service_name
        return None


# Global service configuration
service_config = ServiceConfig()
