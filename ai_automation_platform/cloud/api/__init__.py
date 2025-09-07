"""
API module for the AI Automation Platform.

This module contains the FastAPI application and all API routes.
"""

# Import the main FastAPI app
from .main import app

# Import all routers to ensure they are registered
from .routes import workflows  # noqa: F401

__all__ = ["app"]
