"""
Centralized Database Service
Enterprise-grade database management for all platform services
"""

import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, Depends, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import uuid
import asyncio
import json
import logging
from datetime import datetime, timezone

from core.config import config, service_config
try:
    from core.database import db_manager, get_db_session
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy import text, select, insert, update, delete
    from models.base import Base
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False
    db_manager = None
    get_db_session = None

# SQLite fallback
from core.sqlite_fallback import sqlite_fallback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Centralized Database Service",
    description="Enterprise database management and unified data access",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class DatabaseQuery(BaseModel):
    query: str = Field(..., description="SQL query to execute")
    parameters: Optional[Dict[str, Any]] = Field(default={}, description="Query parameters")
    db_schema: Optional[str] = Field(None, description="Database schema")

class DatabaseInsert(BaseModel):
    table: str = Field(..., description="Table name")
    data: Dict[str, Any] = Field(..., description="Data to insert")
    db_schema: Optional[str] = Field(None, description="Database schema")

class DatabaseUpdate(BaseModel):
    table: str = Field(..., description="Table name")
    data: Dict[str, Any] = Field(..., description="Data to update")
    where: Dict[str, Any] = Field(..., description="WHERE conditions")
    db_schema: Optional[str] = Field(None, description="Database schema")

class DatabaseDelete(BaseModel):
    table: str = Field(..., description="Table name")
    where: Dict[str, Any] = Field(..., description="WHERE conditions")
    db_schema: Optional[str] = Field(None, description="Database schema")

class CacheOperation(BaseModel):
    key: str = Field(..., description="Cache key")
    value: Optional[str] = Field(None, description="Cache value")
    expire: Optional[int] = Field(3600, description="Expiration time in seconds")

class BackupRequest(BaseModel):
    schemas: Optional[List[str]] = Field(None, description="Schemas to backup (all if None)")
    include_data: bool = Field(True, description="Include data in backup")
    compression: bool = Field(True, description="Compress backup file")

# Security: API Key validation
async def validate_api_key(x_api_key: str = Header(...)):
    """Validate API key from requesting service"""
    # In production, implement proper API key validation
    # For now, accept any key for demo purposes
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    return x_api_key

async def validate_service(x_service_name: str = Header(...)):
    """Validate requesting service"""
    if x_service_name not in config.ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")
    return x_service_name

@app.on_event("startup")
async def startup_event():
    """Initialize database connections on startup"""
    try:
        if POSTGRES_AVAILABLE and db_manager:
            await db_manager.initialize()
            logger.info("Database service started with PostgreSQL")
        else:
            await sqlite_fallback.initialize()
            logger.info("Database service started with SQLite fallback")
    except Exception as e:
        logger.error(f"Failed to start database service: {e}")
        # Try SQLite fallback
        try:
            await sqlite_fallback.initialize()
            logger.info("Fallback to SQLite successful")
        except Exception as fallback_error:
            logger.error(f"SQLite fallback also failed: {fallback_error}")
            raise

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    if POSTGRES_AVAILABLE and db_manager:
        await db_manager.close()
    await sqlite_fallback.close()
    logger.info("Database service shut down")

@app.get("/")
async def root():
    return {
        "service": "Centralized Database Service",
        "status": "running",
        "version": "1.0.0",
        "capabilities": [
            "postgresql_management",
            "redis_caching",
            "connection_pooling",
            "query_monitoring",
            "schema_management",
            "backup_restore",
            "performance_analytics"
        ],
        "supported_schemas": service_config.get_all_schemas(),
        "database_url": config.POSTGRES_HOST + ":" + str(config.POSTGRES_PORT)
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    if POSTGRES_AVAILABLE and db_manager:
        health = await db_manager.health_check()
        connection_info = await db_manager.get_connection_info()
        query_stats = await db_manager.get_query_stats()
    else:
        health = await sqlite_fallback.health_check()
        connection_info = await sqlite_fallback.get_connection_info()
        query_stats = await sqlite_fallback.get_query_stats()

    return {
        "status": "healthy" if health["database"] == "healthy" else "degraded",
        "service": "database-service",
        "version": "1.0.0",
        "database_type": "PostgreSQL" if POSTGRES_AVAILABLE and db_manager else "SQLite",
        "health_details": health,
        "connection_info": connection_info,
        "query_statistics": query_stats
    }

@app.post("/api/v1/database/query")
async def execute_query(
    query_request: DatabaseQuery,
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key)
):
    """Execute SQL query"""

    try:
        # Validate schema access
        if query_request.db_schema:
            service_config_data = service_config.get_service_config(service_name)
            if service_config_data and query_request.db_schema != service_config_data.get("schema"):
                raise HTTPException(
                    status_code=403,
                    detail=f"Service '{service_name}' cannot access schema '{query_request.db_schema}'"
                )

        # Execute query using appropriate backend
        if POSTGRES_AVAILABLE and db_manager:
            async with db_manager.get_session() as session:
                result = await session.execute(text(query_request.query), query_request.parameters)
                await session.commit()

                if result.returns_rows:
                    rows = result.fetchall()
                    columns = result.keys()
                    data = [dict(zip(columns, row)) for row in rows]
                else:
                    data = {"affected_rows": result.rowcount}
        else:
            # Use SQLite fallback
            result = await sqlite_fallback.execute_query(query_request.query, query_request.parameters)
            if result["success"]:
                data = result["data"]
            else:
                raise Exception(result["error"])

        return {
            "success": True,
            "data": data,
            "query": query_request.query,
            "service": service_name,
            "backend": "PostgreSQL" if POSTGRES_AVAILABLE and db_manager else "SQLite"
        }

    except Exception as e:
        logger.error(f"Query execution error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/database/insert")
async def insert_data(
    insert_request: DatabaseInsert,
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key)
):
    """Insert data into table"""

    try:
        # Get schema
        schema = insert_request.db_schema or service_config.get_service_config(service_name).get("schema")
        if not schema:
            raise HTTPException(status_code=400, detail="Schema not specified")

        # Execute insert using appropriate backend
        if POSTGRES_AVAILABLE and db_manager:
            table_name = f"{schema}.{insert_request.table}"

            async with db_manager.get_session() as session:
                columns = list(insert_request.data.keys())
                placeholders = [f":{col}" for col in columns]

                query = f"""
                    INSERT INTO {table_name} ({', '.join(columns)})
                    VALUES ({', '.join(placeholders)})
                    RETURNING *
                """

                result = await session.execute(text(query), insert_request.data)
                await session.commit()

                row = result.fetchone()
                if row:
                    columns = result.keys()
                    inserted_data = dict(zip(columns, row))
                else:
                    inserted_data = None
        else:
            # Use SQLite fallback
            result = await sqlite_fallback.insert_data(schema, insert_request.table, insert_request.data)
            if result["success"]:
                inserted_data = result["inserted_data"]
                table_name = f"{schema}_{insert_request.table}"
            else:
                raise Exception(result["error"])

        return {
            "success": True,
            "inserted_data": inserted_data,
            "table": table_name,
            "service": service_name,
            "backend": "PostgreSQL" if POSTGRES_AVAILABLE and db_manager else "SQLite"
        }

    except Exception as e:
        logger.error(f"Insert error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/database/update")
async def update_data(
    update_request: DatabaseUpdate,
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key),
    session: AsyncSession = Depends(get_db_session)
):
    """Update data in table"""
    
    try:
        # Build table name with schema
        schema = update_request.schema or service_config.get_service_config(service_name).get("schema")
        if not schema:
            raise HTTPException(status_code=400, detail="Schema not specified")
        
        table_name = f"{schema}.{update_request.table}"
        
        # Build update query
        set_clauses = [f"{col} = :{col}" for col in update_request.data.keys()]
        where_clauses = [f"{col} = :where_{col}" for col in update_request.where.keys()]
        
        query = f"""
            UPDATE {table_name}
            SET {', '.join(set_clauses)}
            WHERE {' AND '.join(where_clauses)}
        """
        
        # Combine parameters
        parameters = {**update_request.data}
        parameters.update({f"where_{k}": v for k, v in update_request.where.items()})
        
        result = await session.execute(text(query), parameters)
        await session.commit()
        
        return {
            "success": True,
            "affected_rows": result.rowcount,
            "table": table_name,
            "service": service_name
        }
        
    except Exception as e:
        logger.error(f"Update error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/database/delete")
async def delete_data(
    delete_request: DatabaseDelete,
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key),
    session: AsyncSession = Depends(get_db_session)
):
    """Delete data from table"""

    try:
        # Build table name with schema
        schema = delete_request.schema or service_config.get_service_config(service_name).get("schema")
        if not schema:
            raise HTTPException(status_code=400, detail="Schema not specified")

        table_name = f"{schema}.{delete_request.table}"

        # Build delete query
        where_clauses = [f"{col} = :{col}" for col in delete_request.where.keys()]

        query = f"""
            DELETE FROM {table_name}
            WHERE {' AND '.join(where_clauses)}
        """

        result = await session.execute(text(query), delete_request.where)
        await session.commit()

        return {
            "success": True,
            "affected_rows": result.rowcount,
            "table": table_name,
            "service": service_name
        }

    except Exception as e:
        logger.error(f"Delete error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Cache Management Endpoints
@app.post("/api/v1/cache/set")
async def cache_set(
    cache_request: CacheOperation,
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key)
):
    """Set cache value"""

    try:
        # Prefix key with service name for isolation
        prefixed_key = f"{service_name}:{cache_request.key}"

        if POSTGRES_AVAILABLE and db_manager:
            success = await db_manager.cache_set(
                prefixed_key,
                cache_request.value,
                cache_request.expire
            )
        else:
            success = await sqlite_fallback.cache_set(
                prefixed_key,
                cache_request.value,
                cache_request.expire
            )

        return {
            "success": success,
            "key": cache_request.key,
            "service": service_name,
            "expires_in": cache_request.expire,
            "backend": "Redis" if POSTGRES_AVAILABLE and db_manager else "Memory"
        }

    except Exception as e:
        logger.error(f"Cache set error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/cache/get/{key}")
async def cache_get(
    key: str,
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key)
):
    """Get cache value"""

    try:
        # Prefix key with service name for isolation
        prefixed_key = f"{service_name}:{key}"

        value = await db_manager.cache_get(prefixed_key)

        return {
            "success": value is not None,
            "key": key,
            "value": value,
            "service": service_name
        }

    except Exception as e:
        logger.error(f"Cache get error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/cache/delete/{key}")
async def cache_delete(
    key: str,
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key)
):
    """Delete cache value"""

    try:
        # Prefix key with service name for isolation
        prefixed_key = f"{service_name}:{key}"

        success = await db_manager.cache_delete(prefixed_key)

        return {
            "success": success,
            "key": key,
            "service": service_name
        }

    except Exception as e:
        logger.error(f"Cache delete error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/cache/clear")
async def cache_clear(
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key)
):
    """Clear all cache for service"""

    try:
        pattern = f"{service_name}:*"
        cleared_count = await db_manager.cache_clear_pattern(pattern)

        return {
            "success": True,
            "cleared_keys": cleared_count,
            "service": service_name
        }

    except Exception as e:
        logger.error(f"Cache clear error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Database Management Endpoints
@app.get("/api/v1/database/schemas")
async def get_schemas(
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key)
):
    """Get available database schemas"""

    return {
        "schemas": service_config.get_all_schemas(),
        "service_schema": service_config.get_service_config(service_name).get("schema"),
        "service_tables": service_config.get_service_config(service_name).get("tables", []),
        "service": service_name
    }

@app.get("/api/v1/database/tables/{schema}")
async def get_tables(
    schema: str,
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key),
    session: AsyncSession = Depends(get_db_session)
):
    """Get tables in schema"""

    try:
        # Validate schema access
        service_config_data = service_config.get_service_config(service_name)
        if service_config_data and schema != service_config_data.get("schema"):
            raise HTTPException(
                status_code=403,
                detail=f"Service '{service_name}' cannot access schema '{schema}'"
            )

        query = """
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = :schema
            ORDER BY table_name
        """

        result = await session.execute(text(query), {"schema": schema})
        tables = [{"name": row[0], "type": row[1]} for row in result.fetchall()]

        return {
            "schema": schema,
            "tables": tables,
            "service": service_name
        }

    except Exception as e:
        logger.error(f"Get tables error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/database/stats")
async def get_database_stats(
    service_name: str = Depends(validate_service),
    api_key: str = Depends(validate_api_key)
):
    """Get database performance statistics"""

    try:
        connection_info = await db_manager.get_connection_info()
        query_stats = await db_manager.get_query_stats()

        return {
            "connection_info": connection_info,
            "query_statistics": query_stats,
            "service": service_name,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        logger.error(f"Get stats error for {service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Centralized Database Service v1.0.0")
    uvicorn.run(app, host="0.0.0.0", port=config.SERVICE_PORT)
