"""
Base Database Models
Unified data models for all enterprise services
"""

from datetime import datetime
from typing import Optional, Any, Dict
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class TimestampMixin:
    """Mixin for timestamp fields"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class UUIDMixin:
    """Mixin for UUID primary key"""
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)


# Authentication Service Models
class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}
    
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    department = Column(String(100))
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime(timezone=True))
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True))
    password_changed_at = Column(DateTime(timezone=True), server_default=func.now())


class UserSession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_sessions"
    __table_args__ = {"schema": "auth"}
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())


class APIKey(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "api_keys"
    __table_args__ = {"schema": "auth"}
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False)
    permissions = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True))
    last_used = Column(DateTime(timezone=True))


class PasswordResetToken(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "password_reset_tokens"
    __table_args__ = {"schema": "auth"}
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    used_at = Column(DateTime(timezone=True))


class EmailVerificationToken(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "email_verification_tokens"
    __table_args__ = {"schema": "auth"}
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    used_at = Column(DateTime(timezone=True))


class PasswordHistory(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "password_history"
    __table_args__ = {"schema": "auth"}
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)


class AuthAuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "auth_audit_log"
    __table_args__ = {"schema": "auth"}
    
    user_id = Column(UUID(as_uuid=True), index=True)
    action = Column(String(50), nullable=False, index=True)
    resource = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    success = Column(Boolean, nullable=False)
    details = Column(Text)


# Monitoring Service Models
class TaskMonitor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "task_monitors"
    __table_args__ = {"schema": "monitoring"}
    
    delegation_id = Column(String(100), unique=True, nullable=False, index=True)
    task_id = Column(String(100), nullable=False)
    agent_id = Column(String(100), nullable=False)
    task_type = Column(String(50))
    priority = Column(String(20), default="medium")
    estimated_completion = Column(DateTime(timezone=True))
    status = Column(String(20), default="monitoring")
    current_progress = Column(Float, default=0.0)
    last_update = Column(DateTime(timezone=True))
    stopped_at = Column(DateTime(timezone=True))


class ProgressHistory(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "progress_history"
    __table_args__ = {"schema": "monitoring"}
    
    delegation_id = Column(String(100), nullable=False, index=True)
    progress_percentage = Column(Float, nullable=False)
    quality_metrics = Column(JSON)
    performance_indicators = Column(JSON)
    timestamp = Column(DateTime(timezone=True), nullable=False)


class Anomaly(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "anomalies"
    __table_args__ = {"schema": "monitoring"}
    
    delegation_id = Column(String(100), nullable=False, index=True)
    anomaly_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    detected_at = Column(DateTime(timezone=True), nullable=False)
    metrics = Column(JSON)
    suggested_actions = Column(JSON)


class Alert(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "alerts"
    __table_args__ = {"schema": "monitoring"}
    
    delegation_id = Column(String(100), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime(timezone=True))
    acknowledged_by = Column(UUID(as_uuid=True))


# Learning Service Models
class AgentPerformance(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "agent_performance"
    __table_args__ = {"schema": "learning"}
    
    agent_id = Column(String(100), nullable=False, index=True)
    task_type = Column(String(50), nullable=False)
    performance_score = Column(Float, nullable=False)
    completion_time = Column(Float)
    quality_score = Column(Float)
    efficiency_score = Column(Float)
    task_complexity = Column(Float)
    success_rate = Column(Float)
    metadata = Column(JSON)


class TaskFeedback(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "task_feedback"
    __table_args__ = {"schema": "learning"}
    
    task_id = Column(String(100), nullable=False, index=True)
    agent_id = Column(String(100), nullable=False)
    feedback_score = Column(Float, nullable=False)
    feedback_text = Column(Text)
    feedback_type = Column(String(20))
    provided_by = Column(UUID(as_uuid=True))


class LearningModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "learning_models"
    __table_args__ = {"schema": "learning"}
    
    model_name = Column(String(100), nullable=False, unique=True)
    model_type = Column(String(50), nullable=False)
    version = Column(String(20), nullable=False)
    parameters = Column(JSON)
    performance_metrics = Column(JSON)
    is_active = Column(Boolean, default=True)
    training_data_size = Column(Integer)
    last_trained = Column(DateTime(timezone=True))


class Prediction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "predictions"
    __table_args__ = {"schema": "learning"}
    
    model_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    input_data = Column(JSON, nullable=False)
    prediction_result = Column(JSON, nullable=False)
    confidence_score = Column(Float)
    actual_result = Column(JSON)
    accuracy_score = Column(Float)
