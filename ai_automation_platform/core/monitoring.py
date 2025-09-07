import time
from contextlib import asynccontextmanager
from datetime import datetime
from functools import wraps
from typing import Any, Callable, Dict, Optional, TypeVar, cast

from fastapi import Request, Response
from opentelemetry import trace
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.metrics import get_meter_provider, set_meter_provider
from opentelemetry.sdk.metrics import Counter, MeterProvider
from opentelemetry.sdk.metrics.export import ConsoleMetricExporter, PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.trace.status import Status, StatusCode
from prometheus_client import start_http_server
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from .config import settings

T = TypeVar('T', bound=Callable[..., Any])

# Initialize metrics
def init_metrics(service_name: str = None):
    """Initialize the metrics provider and return a meter."""
    resource = Resource.create({
        SERVICE_NAME: service_name or "ai-automation-platform",
    })
    
    # Set up Prometheus reader
    prometheus_reader = PrometheusMetricReader()
    
    # Set up the metric provider
    provider = MeterProvider(
        resource=resource,
        metric_readers=[prometheus_reader],
    )
    
    set_meter_provider(provider)
    
    # Start Prometheus metrics server
    start_http_server(port=settings.METRICS_PORT, addr="0.0.0.0")
    
    return provider.get_meter(service_name or "ai_automation")

# Initialize tracing
def init_tracing(service_name: str = None):
    """Initialize OpenTelemetry tracing."""
    if not settings.ENABLE_TRACING:
        return None
    
    resource = Resource.create({
        SERVICE_NAME: service_name or settings.TRACING_SERVICE_NAME,
    })
    
    # Configure the tracer provider
    tracer_provider = TracerProvider(resource=resource)
    
    # Add console exporter for development
    if settings.ENVIRONMENT == "development":
        console_exporter = ConsoleSpanExporter()
        span_processor = BatchSpanProcessor(console_exporter)
        tracer_provider.add_span_processor(span_processor)
    
    # Set the global tracer provider
    trace.set_tracer_provider(tracer_provider)
    
    return trace.get_tracer(service_name or "ai_automation")

# Metrics collection
class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware to collect HTTP request metrics."""
    
    def __init__(self, app: ASGIApp, meter):
        super().__init__(app)
        self.meter = meter
        self.requests = self.meter.create_counter(
            "http_requests_total",
            description="Total number of HTTP requests",
            unit="1",
        )
        self.request_duration = self.meter.create_histogram(
            "http_request_duration_seconds",
            description="HTTP request duration in seconds",
            unit="s",
        )
        self.errors = self.meter.create_counter(
            "http_errors_total",
            description="Total number of HTTP errors",
            unit="1",
        )
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Record metrics
        self.requests.add(1, {
            "method": request.method,
            "endpoint": request.url.path,
            "status_code": response.status_code,
        })
        
        self.request_duration.record(process_time, {
            "method": request.method,
            "endpoint": request.url.path,
            "status_code": response.status_code,
        })
        
        if response.status_code >= 400:
            self.errors.add(1, {
                "method": request.method,
                "endpoint": request.url.path,
                "status_code": response.status_code,
            })
        
        return response

# Task metrics
class TaskMetrics:
    """Class to track task-related metrics."""
    
    def __init__(self, meter):
        self.meter = meter
        self.task_started = self.meter.create_counter(
            "tasks_started_total",
            description="Total number of tasks started",
            unit="1",
        )
        self.task_completed = self.meter.create_counter(
            "tasks_completed_total",
            description="Total number of tasks completed",
            unit="1",
        )
        self.task_failed = self.meter.create_counter(
            "tasks_failed_total",
            description="Total number of failed tasks",
            unit="1",
        )
        self.task_duration = self.meter.create_histogram(
            "task_duration_seconds",
            description="Task duration in seconds",
            unit="s",
        )
    
    def task_started_inc(self, task_type: str):
        """Increment the task started counter."""
        self.task_started.add(1, {"task_type": task_type})
    
    def task_completed_inc(self, task_type: str, status: str):
        """Increment the task completed counter."""
        self.task_completed.add(1, {"task_type": task_type, "status": status})
    
    def task_failed_inc(self, task_type: str, error_type: str):
        """Increment the task failed counter."""
        self.task_failed.add(1, {"task_type": task_type, "error_type": error_type})
    
    @asynccontextmanager
    async def track_duration(self, task_type: str):
        """Context manager to track task duration."""
        start_time = time.time()
        try:
            yield
            duration = time.time() - start_time
            self.task_duration.record(duration, {"task_type": task_type})
        except Exception as e:
            self.task_failed_inc(task_type, error_type=type(e).__name__)
            raise

# Tracing utilities
def trace_function(name: str = None):
    """Decorator to add tracing to a function."""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            tracer = trace.get_tracer(__name__)
            func_name = name or func.__name__
            
            with tracer.start_as_current_span(func_name) as span:
                try:
                    span.set_attribute("function", func_name)
                    span.set_attribute("start_time", datetime.utcnow().isoformat())
                    
                    result = await func(*args, **kwargs)
                    
                    span.set_status(Status(StatusCode.OK))
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    raise
                finally:
                    span.set_attribute("end_time", datetime.utcnow().isoformat())
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            tracer = trace.get_tracer(__name__)
            func_name = name or func.__name__
            
            with tracer.start_as_current_span(func_name) as span:
                try:
                    span.set_attribute("function", func_name)
                    span.set_attribute("start_time", datetime.utcnow().isoformat())
                    
                    result = func(*args, **kwargs)
                    
                    span.set_status(Status(StatusCode.OK))
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    raise
                finally:
                    span.set_attribute("end_time", datetime.utcnow().isoformat())
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator

# Health check endpoint
def create_health_router():
    """Create a FastAPI router with health check endpoints."""
    from fastapi import APIRouter, status
    from fastapi.responses import JSONResponse
    
    router = APIRouter()
    
    @router.get("/health")
    async def health_check():
        """Basic health check endpoint."""
        return {"status": "ok"}
    
    @router.get("/ready")
    async def readiness_check():
        """Readiness check endpoint."""
        # Add any additional checks here (database connection, etc.)
        return {"status": "ready"}
    
    @router.get("/metrics")
    async def metrics():
        """Prometheus metrics endpoint."""
        # This is handled by the Prometheus client library
        pass
    
    return router
