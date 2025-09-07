"""Base model for SQLAlchemy."""
from sqlalchemy.orm import declarative_base

# Create a base class for all models to inherit from
Base = declarative_base()
