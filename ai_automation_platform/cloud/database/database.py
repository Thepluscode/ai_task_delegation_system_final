"""Database connection and session management."""
import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

from ai_automation_platform.core.config import settings

# Create database engine
DATABASE_URL = settings.DATABASE_URL or "sqlite+aiosqlite:///./workflows.db"

# For SQLite, we need to set check_same_thread to False
if DATABASE_URL.startswith("sqlite"):
    engine = create_async_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=NullPool,
        echo=settings.DEBUG
    )
else:
    engine = create_async_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_recycle=settings.DB_POOL_RECYCLE,
        echo=settings.DEBUG
    )

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()

async def init_db() -> None:
    """Initialize the database by creating tables."""
    from ai_automation_platform.cloud.database import models
    from ai_automation_platform.cloud.database.base import Base
    
    async with engine.begin() as conn:
        # Drop all tables for development (be careful with this in production!)
        if settings.ENVIRONMENT == "development":
            await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

async def close_db() -> None:
    """Close the database connection."""
    if engine:
        await engine.dispose()
