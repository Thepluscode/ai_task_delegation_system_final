import asyncio
import logging
import signal
import sys
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator, Dict, List, Optional

import uvicorn
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from .core import (
    DatabaseUtils,
    TaskMetrics,
    cache,
    close_cache,
    close_db,
    create_health_router,
    dead_letter_queue,
    get_db,
    init_cache,
    init_db,
    init_metrics,
    init_tracing,
    metrics,
    setup_security,
    trace_function,
)
from .core.config import settings
from .core.error_recovery import dead_letter_queue as dlq
from .core.monitoring import MetricsMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Global variables
app: Optional[FastAPI] = None
task_metrics: Optional[TaskMetrics] = None

# Handle graceful shutdown
async def shutdown_event():
    """Handle application shutdown."""
    logger.info("Shutting down application...")
    
    # Close database connections
    await close_db()
    
    # Close cache connections
    await close_cache()
    
    # Close any other resources
    logger.info("Application shutdown complete")

def handle_exception(exc_type, exc_value, exc_traceback):
    """Handle uncaught exceptions."""
    if issubclass(exc_type, KeyboardInterrupt):
        # Call the default excepthook when keyboard interrupt is received
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    
    logger.critical(
        "Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback)
    )

# Set the exception handler
sys.excepthook = handle_exception

# Signal handlers for graceful shutdown
def handle_shutdown(signum, frame):
    """Handle shutdown signals."""
    logger.info(f"Received signal {signum}, shutting down...")
    if app:
        # This will trigger the shutdown_event handler
        raise SystemExit(0)


# Register signal handlers
signal.signal(signal.SIGTERM, handle_shutdown)
signal.signal(signal.SIGINT, handle_shutdown)

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Handle application startup and shutdown."""
    global task_metrics
    
    # Initialize metrics
    meter = init_metrics(service_name=settings.TRACING_SERVICE_NAME)
    task_metrics = TaskMetrics(meter)
    
    # Initialize tracing
    init_tracing(service_name=settings.TRACING_SERVICE_NAME)
    
    # Initialize database
    await init_db()
    
    # Initialize cache
    await init_cache()
    
    # Add startup tasks
    asyncio.create_task(background_task_cleanup())
    
    # Yield control to the application
    yield
    
    # Clean up resources on shutdown
    await shutdown_event()

# Create FastAPI application
def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    global app
    
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="AI Automation Platform API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add middleware
    app.add_middleware(MetricsMiddleware, meter=metrics)
    
    # Setup security
    setup_security(app)
    
    # Include routers
    app.include_router(create_health_router(), prefix="", tags=["health"])
    
    # Add exception handlers
    add_exception_handlers(app)
    
    # Add startup and shutdown event handlers
    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting up application...")
    
    @app.on_event("shutdown")
    async def shutdown_event_handler():
        await shutdown_event()
    
    # Add a simple root endpoint
    @app.get("/")
    async def root():
        return {"message": "Welcome to the AI Automation Platform"}
    
    # Instrument FastAPI for OpenTelemetry
    if settings.ENABLE_TRACING:
        FastAPIInstrumentor.instrument_app(app)
    
    return app

def add_exception_handlers(app: FastAPI) -> None:
    """Add exception handlers to the FastAPI application."""
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        """Handle HTTP exceptions."""
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=exc.headers,
        )
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle all other exceptions."""
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

# Background tasks
async def background_task_cleanup() -> None:
    """Background task to clean up old data."""
    while True:
        try:
            # Clean up old tasks, cache entries, etc.
            await asyncio.sleep(3600)  # Run every hour
        except asyncio.CancelledError:
            logger.info("Background task cleanup cancelled")
            break
        except Exception as e:
            logger.error(f"Error in background task cleanup: {e}")
            await asyncio.sleep(60)  # Wait a minute before retrying

# Main entry point
if __name__ == "__main__":
    app = create_app()
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=settings.DEBUG,
    )
