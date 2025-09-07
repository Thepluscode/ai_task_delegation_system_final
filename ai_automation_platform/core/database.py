import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Any, AsyncGenerator, Dict, List, Optional, Type, TypeVar, Union

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine, func, or_
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_scoped_session,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy.sql.expression import select, update

from .config import settings

# Type variables
T = TypeVar("T", bound="BaseModel")

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Create async engine with connection pooling
# For SQLite, use aiosqlite with memory sharing
if SQLALCHEMY_DATABASE_URL.startswith('sqlite'):
    connect_args = {"check_same_thread": False}
    async_engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        echo=settings.DEBUG,
        connect_args=connect_args,
        pool_pre_ping=settings.DB_POOL_PRE_PING,
    )
else:
    # For other databases (PostgreSQL, MySQL, etc.)
    async_engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        echo=settings.DEBUG,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        pool_recycle=settings.DB_POOL_RECYCLE,
        pool_pre_ping=settings.DB_POOL_PRE_PING,
    )

# Create async session factory
async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Create scoped session factory
AsyncScopedSession = async_scoped_session(
    async_session_factory,
    scopefunc=asyncio.current_task,
)

# Base model for all database models
class BaseModel:
    """Base model with common functionality for all database models."""
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    @classmethod
    async def get(cls: Type[T], db: AsyncSession, id: int) -> Optional[T]:
        """Get a record by ID."""
        result = await db.execute(select(cls).filter(cls.id == id))
        return result.scalars().first()
    
    @classmethod
    async def get_multi(
        cls: Type[T],
        db: AsyncSession,
        *, 
        skip: int = 0, 
        limit: int = 100,
        **filters
    ) -> List[T]:
        """Get multiple records with optional filtering."""
        query = select(cls)
        
        # Apply filters
        for key, value in filters.items():
            if hasattr(cls, key):
                if isinstance(value, (list, tuple)):
                    query = query.filter(getattr(cls, key).in_(value))
                else:
                    query = query.filter(getattr(cls, key) == value)
        
        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()
    
    async def save(self, db: AsyncSession) -> None:
        """Save the current record."""
        db.add(self)
        await db.commit()
        await db.refresh(self)
    
    async def delete(self, db: AsyncSession) -> None:
        """Delete the current record."""
        await db.delete(self)
        await db.commit()

# Initialize declarative base
Base = declarative_base(cls=BaseModel)

# Database session dependency
@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Task batching utilities
class BatchProcessor:
    """Utility class for processing tasks in batches."""
    
    def __init__(
        self, 
        batch_size: int = 100,
        max_concurrent: int = 10,
        retry_attempts: int = 3,
        retry_delay: float = 1.0,
    ):
        """Initialize the batch processor.
        
        Args:
            batch_size: Number of items to process in each batch
            max_concurrent: Maximum number of concurrent batches
            retry_attempts: Number of retry attempts for failed items
            retry_delay: Delay between retries in seconds
        """
        self.batch_size = batch_size
        self.max_concurrent = max_concurrent
        self.retry_attempts = retry_attempts
        self.retry_delay = retry_delay
    
    async def process_batch(
        self, 
        items: List[Any], 
        process_func: callable,
        **kwargs
    ) -> List[Any]:
        """Process a batch of items using the provided function.
        
        Args:
            items: List of items to process
            process_func: Function to process each item
            **kwargs: Additional arguments to pass to process_func
            
        Returns:
            List of results
        """
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def process_with_semaphore(item):
            async with semaphore:
                for attempt in range(self.retry_attempts):
                    try:
                        return await process_func(item, **kwargs)
                    except Exception as e:
                        if attempt == self.retry_attempts - 1:
                            raise
                        await asyncio.sleep(self.retry_delay * (attempt + 1))
        
        # Process items in batches
        results = []
        for i in range(0, len(items), self.batch_size):
            batch = items[i:i + self.batch_size]
            batch_results = await asyncio.gather(
                *(process_with_semaphore(item) for item in batch),
                return_exceptions=True
            )
            results.extend(batch_results)
        
        return results

# Database utilities
class DatabaseUtils:
    """Utility class for database operations."""
    
    @staticmethod
    async def bulk_insert(
        db: AsyncSession,
        model: Type[Base],
        data: List[Dict[str, Any]],
        batch_size: int = 1000,
    ) -> None:
        """Bulk insert records into the database.
        
        Args:
            db: Database session
            model: SQLAlchemy model class
            data: List of dictionaries containing record data
            batch_size: Number of records to insert in each batch
        """
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            db.add_all([model(**item) for item in batch])
            await db.commit()
    
    @staticmethod
    async def bulk_update(
        db: AsyncSession,
        model: Type[Base],
        data: List[Dict[str, Any]],
        update_keys: List[str],
        batch_size: int = 1000,
    ) -> None:
        """Bulk update records in the database.
        
        Args:
            db: Database session
            model: SQLAlchemy model class
            data: List of dictionaries containing record data
            update_keys: List of keys to update
            batch_size: Number of records to update in each batch
        """
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            for item in batch:
                id = item.pop("id")
                update_values = {k: v for k, v in item.items() if k in update_keys}
                await db.execute(
                    update(model)
                    .where(model.id == id)
                    .values(**update_values)
                )
            await db.commit()
    
    @staticmethod
    async def execute_in_transaction(
        db: AsyncSession,
        *statements,
        **kwargs
    ) -> Any:
        """Execute multiple statements in a single transaction.
        
        Args:
            db: Database session
            *statements: SQLAlchemy statements to execute
            **kwargs: Additional arguments to pass to execute
            
        Returns:
            Result of the last statement
        """
        result = None
        async with db.begin():
            for stmt in statements:
                result = await db.execute(stmt, **kwargs)
        return result

# Initialize database tables
async def init_db() -> None:
    """Initialize the database by creating all tables."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Clean up database connections
async def close_db() -> None:
    """Close all database connections."""
    await async_engine.dispose()
