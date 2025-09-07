"""
Database Connection Manager
Handles PostgreSQL connections, connection pooling, and Redis caching
"""

import asyncio
import logging
from typing import Optional, AsyncGenerator, Dict, Any
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy import text, event
from sqlalchemy.engine import Engine
import redis.asyncio as redis
import time
from datetime import datetime, timedelta

from .config import config, service_config
from ..models.base import Base

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Centralized database connection manager"""
    
    def __init__(self):
        self.engine: Optional[Engine] = None
        self.session_factory: Optional[async_sessionmaker] = None
        self.redis_client: Optional[redis.Redis] = None
        self._initialized = False
        self.query_stats = {
            "total_queries": 0,
            "slow_queries": 0,
            "average_query_time": 0.0,
            "last_reset": datetime.now()
        }
    
    async def initialize(self):
        """Initialize database connections"""
        if self._initialized:
            return
        
        try:
            # Create PostgreSQL engine with connection pooling
            self.engine = create_async_engine(
                config.database_url,
                poolclass=QueuePool,
                pool_size=config.POOL_SIZE,
                max_overflow=config.MAX_OVERFLOW,
                pool_timeout=config.POOL_TIMEOUT,
                pool_recycle=config.POOL_RECYCLE,
                echo=config.ENABLE_QUERY_LOGGING,
                future=True
            )
            
            # Create session factory
            self.session_factory = async_sessionmaker(
                bind=self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Initialize Redis connection
            await self._initialize_redis()
            
            # Set up query monitoring
            self._setup_query_monitoring()
            
            # Create database schemas
            await self._create_schemas()
            
            self._initialized = True
            logger.info("Database manager initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize database manager: {e}")
            raise
    
    async def _initialize_redis(self):
        """Initialize Redis connection for caching"""
        try:
            self.redis_client = redis.from_url(
                config.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            
            # Test Redis connection
            await self.redis_client.ping()
            logger.info("Redis connection established")
            
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            self.redis_client = None
    
    def _setup_query_monitoring(self):
        """Set up query performance monitoring"""
        
        @event.listens_for(self.engine.sync_engine, "before_cursor_execute")
        def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            context._query_start_time = time.time()
        
        @event.listens_for(self.engine.sync_engine, "after_cursor_execute")
        def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            total_time = time.time() - context._query_start_time
            
            # Update query statistics
            self.query_stats["total_queries"] += 1
            
            # Track slow queries
            if total_time > config.SLOW_QUERY_THRESHOLD:
                self.query_stats["slow_queries"] += 1
                logger.warning(f"Slow query detected ({total_time:.2f}s): {statement[:100]}...")
            
            # Update average query time
            current_avg = self.query_stats["average_query_time"]
            total_queries = self.query_stats["total_queries"]
            self.query_stats["average_query_time"] = (
                (current_avg * (total_queries - 1) + total_time) / total_queries
            )
    
    async def _create_schemas(self):
        """Create database schemas for all services"""
        try:
            async with self.engine.begin() as conn:
                # Create schemas for each service
                for schema in service_config.get_all_schemas():
                    await conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema}"))
                
                # Create all tables
                await conn.run_sync(Base.metadata.create_all)
            
            logger.info("Database schemas created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create database schemas: {e}")
            raise
    
    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get database session with automatic cleanup"""
        if not self._initialized:
            await self.initialize()
        
        async with self.session_factory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def execute_query(self, query: str, params: Dict[str, Any] = None) -> Any:
        """Execute raw SQL query"""
        async with self.get_session() as session:
            result = await session.execute(text(query), params or {})
            await session.commit()
            return result
    
    async def get_connection_info(self) -> Dict[str, Any]:
        """Get database connection information"""
        try:
            async with self.get_session() as session:
                # Get PostgreSQL version
                result = await session.execute(text("SELECT version()"))
                pg_version = result.scalar()
                
                # Get connection count
                result = await session.execute(text(
                    "SELECT count(*) FROM pg_stat_activity WHERE state = 'active'"
                ))
                active_connections = result.scalar()
                
                # Get database size
                result = await session.execute(text(
                    f"SELECT pg_size_pretty(pg_database_size('{config.POSTGRES_DB}'))"
                ))
                db_size = result.scalar()
                
                return {
                    "postgresql_version": pg_version,
                    "active_connections": active_connections,
                    "database_size": db_size,
                    "pool_size": config.POOL_SIZE,
                    "max_overflow": config.MAX_OVERFLOW,
                    "redis_available": self.redis_client is not None
                }
                
        except Exception as e:
            logger.error(f"Failed to get connection info: {e}")
            return {"error": str(e)}
    
    async def get_query_stats(self) -> Dict[str, Any]:
        """Get query performance statistics"""
        return {
            **self.query_stats,
            "slow_query_percentage": (
                (self.query_stats["slow_queries"] / max(self.query_stats["total_queries"], 1)) * 100
            )
        }
    
    async def reset_query_stats(self):
        """Reset query statistics"""
        self.query_stats = {
            "total_queries": 0,
            "slow_queries": 0,
            "average_query_time": 0.0,
            "last_reset": datetime.now()
        }
    
    # Cache operations
    async def cache_set(self, key: str, value: str, expire: int = 3600) -> bool:
        """Set cache value with expiration"""
        if not self.redis_client:
            return False
        
        try:
            await self.redis_client.setex(key, expire, value)
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def cache_get(self, key: str) -> Optional[str]:
        """Get cache value"""
        if not self.redis_client:
            return None
        
        try:
            return await self.redis_client.get(key)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def cache_delete(self, key: str) -> bool:
        """Delete cache value"""
        if not self.redis_client:
            return False
        
        try:
            result = await self.redis_client.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    async def cache_clear_pattern(self, pattern: str) -> int:
        """Clear cache keys matching pattern"""
        if not self.redis_client:
            return 0
        
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                return await self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
            return 0
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform database health check"""
        health = {
            "database": "unknown",
            "redis": "unknown",
            "timestamp": datetime.now().isoformat()
        }
        
        # Check PostgreSQL
        try:
            async with self.get_session() as session:
                await session.execute(text("SELECT 1"))
                health["database"] = "healthy"
        except Exception as e:
            health["database"] = f"unhealthy: {str(e)}"
        
        # Check Redis
        if self.redis_client:
            try:
                await self.redis_client.ping()
                health["redis"] = "healthy"
            except Exception as e:
                health["redis"] = f"unhealthy: {str(e)}"
        else:
            health["redis"] = "not_configured"
        
        return health
    
    async def close(self):
        """Close all database connections"""
        if self.engine:
            await self.engine.dispose()
        
        if self.redis_client:
            await self.redis_client.close()
        
        self._initialized = False
        logger.info("Database connections closed")


# Global database manager instance
db_manager = DatabaseManager()


# Dependency for FastAPI
async def get_db_session():
    """FastAPI dependency for database session"""
    async with db_manager.get_session() as session:
        yield session
