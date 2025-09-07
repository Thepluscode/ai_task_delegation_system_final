"""Main FastAPI application for the Cloud API."""
import logging
import os
from fastapi import FastAPI, Request, status, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, AsyncGenerator
import uvicorn
from dotenv import load_dotenv

from ai_automation_platform.core import security
from ai_automation_platform.cloud.workflow_state_management.manager import WorkflowStateManager
from ai_automation_platform.cloud.api.routes import workflows
from ai_automation_platform.cloud.api.dependencies import set_workflow_manager, get_workflow_manager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application lifecycle events."""
    from ai_automation_platform.cloud.database.database import init_db, close_db
    
    # Startup: Initialize resources
    try:
        # Initialize database
        logger.info("Initializing database...")
        await init_db()
        
        # Initialize workflow manager
        workflow_manager = WorkflowStateManager()
        await workflow_manager.initialize()
        set_workflow_manager(workflow_manager)
        logger.info("Application startup: Initialized workflow manager and database")
        
        yield
        
    except Exception as e:
        logger.error(f"Error during application startup: {str(e)}", exc_info=True)
        raise
        
    finally:
        # Shutdown: Clean up resources
        logger.info("Application shutdown: Cleaning up resources...")
        try:
            if 'workflow_manager' in locals():
                await workflow_manager.close()
                logger.info("Cleaned up workflow manager")
            
            await close_db()
            logger.info("Closed database connections")
            
        except Exception as e:
            logger.error(f"Error during application shutdown: {str(e)}", exc_info=True)
            raise

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    workflow_manager: WorkflowStateManager = Depends(get_workflow_manager)
) -> Dict[str, Any]:
    """Dependency to get the current user from the token."""
    try:
        # Verify the token and get the user
        user = await security.get_current_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="AI Automation Platform - Cloud API",
        description="Cloud API for the AI Automation Platform",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add security middleware
    app.add_middleware(security.RateLimitMiddleware)
    
    # Include routers
    app.include_router(
        workflows.router,
        prefix="/api/v1/workflows",
        tags=["workflows"]
        # Temporarily disable authentication for testing
        # dependencies=[Depends(get_current_user)]
    )
    
    # Add health check endpoint
    @app.get("/health", tags=["health"])
    async def health_check():
        """Health check endpoint."""
        return {"status": "ok"}
    
    # Global exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()},
        )
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    
    return app

# Create the application instance
app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "ai_automation_platform.cloud.api.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True,
        log_level="info"
    )
