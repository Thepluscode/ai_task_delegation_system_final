"""
Simplified Centralized Database Service
SQLite-based database management for all platform services
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import sqlite3
import json
import logging
import os
import uuid
from datetime import datetime

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

# Configuration
ALLOWED_SERVICES = [
    "auth-service", "monitoring-service", "learning-service",
    "trading-service", "market-signals-service", "banking-service",
    "healthcare-service", "retail-service", "iot-service", "main-platform"
]

SERVICE_SCHEMAS = {
    "auth-service": "auth",
    "monitoring-service": "monitoring",
    "learning-service": "learning",
    "trading-service": "trading",
    "market-signals-service": "market",
    "banking-service": "banking",
    "healthcare-service": "healthcare",
    "retail-service": "retail",
    "iot-service": "iot",
    "main-platform": "platform"
}

# Pydantic models
class DatabaseQuery(BaseModel):
    query: str = Field(..., description="SQL query to execute")
    parameters: Optional[Dict[str, Any]] = Field(default={}, description="Query parameters")

class DatabaseInsert(BaseModel):
    table: str = Field(..., description="Table name")
    data: Dict[str, Any] = Field(..., description="Data to insert")

class DatabaseUpdate(BaseModel):
    table: str = Field(..., description="Table name")
    data: Dict[str, Any] = Field(..., description="Data to update")
    where: Dict[str, Any] = Field(..., description="WHERE conditions")

class DatabaseDelete(BaseModel):
    table: str = Field(..., description="Table name")
    where: Dict[str, Any] = Field(..., description="WHERE conditions")

class CacheOperation(BaseModel):
    key: str = Field(..., description="Cache key")
    value: Optional[str] = Field(None, description="Cache value")
    expire: Optional[int] = Field(3600, description="Expiration time in seconds")

# Database and cache management
class DatabaseManager:
    def __init__(self):
        self.db_path = "data/centralized_database.db"
        self.cache = {}
        self.query_stats = {"total_queries": 0, "slow_queries": 0}
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database"""
        os.makedirs("data", exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        
        # Create tables for each service
        self._create_auth_tables(conn)
        self._create_monitoring_tables(conn)
        self._create_learning_tables(conn)
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    
    def _create_auth_tables(self, conn):
        """Create auth service tables"""
        conn.execute('''
            CREATE TABLE IF NOT EXISTS auth_users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                department TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                email_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    def _create_monitoring_tables(self, conn):
        """Create monitoring service tables"""
        conn.execute('''
            CREATE TABLE IF NOT EXISTS monitoring_task_monitors (
                id TEXT PRIMARY KEY,
                delegation_id TEXT UNIQUE NOT NULL,
                task_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                task_type TEXT,
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'monitoring',
                current_progress REAL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    def _create_learning_tables(self, conn):
        """Create learning service tables"""
        conn.execute('''
            CREATE TABLE IF NOT EXISTS learning_agent_performance (
                id TEXT PRIMARY KEY,
                agent_id TEXT NOT NULL,
                task_type TEXT NOT NULL,
                performance_score REAL NOT NULL,
                completion_time REAL,
                quality_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    def get_table_name(self, service_name: str, table: str) -> str:
        """Get full table name for service"""
        schema = SERVICE_SCHEMAS.get(service_name, "unknown")
        return f"{schema}_{table}"
    
    def execute_query(self, query: str, params: Dict = None) -> Dict:
        """Execute SQL query"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            if params:
                # Convert named parameters
                import re
                param_names = re.findall(r':(\w+)', query)
                sqlite_query = query
                sqlite_params = []
                
                for param_name in param_names:
                    sqlite_query = sqlite_query.replace(f':{param_name}', '?', 1)
                    sqlite_params.append(params.get(param_name))
                
                cursor.execute(sqlite_query, sqlite_params)
            else:
                cursor.execute(query)
            
            if query.strip().upper().startswith(('SELECT', 'WITH')):
                rows = cursor.fetchall()
                data = [dict(row) for row in rows]
            else:
                data = {"affected_rows": cursor.rowcount}
                conn.commit()
            
            conn.close()
            self.query_stats["total_queries"] += 1
            
            return {"success": True, "data": data}
            
        except Exception as e:
            logger.error(f"Query error: {e}")
            return {"success": False, "error": str(e)}
    
    def insert_data(self, service_name: str, table: str, data: Dict) -> Dict:
        """Insert data into table"""
        try:
            table_name = self.get_table_name(service_name, table)
            
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            
            columns = list(data.keys())
            placeholders = ['?' for _ in columns]
            values = list(data.values())
            
            query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(query, values)
            conn.commit()
            
            # Get inserted row
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (data['id'],))
            row = cursor.fetchone()
            inserted_data = dict(row) if row else None
            
            conn.close()
            return {"success": True, "inserted_data": inserted_data}
            
        except Exception as e:
            logger.error(f"Insert error: {e}")
            return {"success": False, "error": str(e)}
    
    def update_data(self, service_name: str, table: str, data: Dict, where: Dict) -> Dict:
        """Update data in table"""
        try:
            table_name = self.get_table_name(service_name, table)
            
            set_clauses = [f"{col} = ?" for col in data.keys()]
            where_clauses = [f"{col} = ?" for col in where.keys()]
            
            query = f"UPDATE {table_name} SET {', '.join(set_clauses)} WHERE {' AND '.join(where_clauses)}"
            values = list(data.values()) + list(where.values())
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(query, values)
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            return {"success": True, "affected_rows": affected_rows}
            
        except Exception as e:
            logger.error(f"Update error: {e}")
            return {"success": False, "error": str(e)}
    
    def delete_data(self, service_name: str, table: str, where: Dict) -> Dict:
        """Delete data from table"""
        try:
            table_name = self.get_table_name(service_name, table)
            
            where_clauses = [f"{col} = ?" for col in where.keys()]
            query = f"DELETE FROM {table_name} WHERE {' AND '.join(where_clauses)}"
            values = list(where.values())
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(query, values)
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            return {"success": True, "affected_rows": affected_rows}
            
        except Exception as e:
            logger.error(f"Delete error: {e}")
            return {"success": False, "error": str(e)}
    
    # Cache operations
    def cache_set(self, key: str, value: str, expire: int = 3600) -> bool:
        self.cache[key] = {"value": value, "expires_at": datetime.now().timestamp() + expire}
        return True
    
    def cache_get(self, key: str) -> Optional[str]:
        if key in self.cache:
            item = self.cache[key]
            if datetime.now().timestamp() < item["expires_at"]:
                return item["value"]
            else:
                del self.cache[key]
        return None
    
    def cache_delete(self, key: str) -> bool:
        return self.cache.pop(key, None) is not None

# Global database manager
db = DatabaseManager()

# Security validation
async def validate_service(x_service_name: str = Header(...)):
    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")
    return x_service_name

async def validate_api_key(x_api_key: str = Header(...)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    return x_api_key

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Centralized Database Service",
        "status": "running",
        "version": "1.0.0",
        "database_type": "SQLite",
        "capabilities": ["unified_data_access", "caching", "multi_service_support"],
        "supported_services": list(ALLOWED_SERVICES),
        "schemas": list(SERVICE_SCHEMAS.values())
    }

@app.get("/health")
async def health_check():
    try:
        conn = sqlite3.connect(db.db_path)
        conn.execute("SELECT 1")
        conn.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "database-service",
        "version": "1.0.0",
        "database_type": "SQLite",
        "database_status": db_status,
        "cache_size": len(db.cache),
        "query_stats": db.query_stats
    }

@app.post("/api/v1/database/query")
async def execute_query(
    query_request: DatabaseQuery,
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Execute SQL query"""

    # Validate service
    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    try:
        result = db.execute_query(query_request.query, query_request.parameters)

        if result["success"]:
            return {
                "success": True,
                "data": result["data"],
                "query": query_request.query,
                "service": x_service_name,
                "backend": "SQLite"
            }
        else:
            raise HTTPException(status_code=500, detail=result["error"])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Query execution error for {x_service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/database/insert")
async def insert_data(
    insert_request: DatabaseInsert,
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Insert data into table"""

    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    try:
        result = db.insert_data(x_service_name, insert_request.table, insert_request.data)

        if result["success"]:
            return {
                "success": True,
                "inserted_data": result["inserted_data"],
                "table": db.get_table_name(x_service_name, insert_request.table),
                "service": x_service_name,
                "backend": "SQLite"
            }
        else:
            raise HTTPException(status_code=500, detail=result["error"])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Insert error for {x_service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/database/update")
async def update_data(
    update_request: DatabaseUpdate,
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Update data in table"""

    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    try:
        result = db.update_data(x_service_name, update_request.table, update_request.data, update_request.where)

        if result["success"]:
            return {
                "success": True,
                "affected_rows": result["affected_rows"],
                "table": db.get_table_name(x_service_name, update_request.table),
                "service": x_service_name,
                "backend": "SQLite"
            }
        else:
            raise HTTPException(status_code=500, detail=result["error"])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update error for {x_service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/database/delete")
async def delete_data(
    delete_request: DatabaseDelete,
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Delete data from table"""

    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    try:
        result = db.delete_data(x_service_name, delete_request.table, delete_request.where)

        if result["success"]:
            return {
                "success": True,
                "affected_rows": result["affected_rows"],
                "table": db.get_table_name(x_service_name, delete_request.table),
                "service": x_service_name,
                "backend": "SQLite"
            }
        else:
            raise HTTPException(status_code=500, detail=result["error"])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete error for {x_service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Cache endpoints
@app.post("/api/v1/cache/set")
async def cache_set(
    cache_request: CacheOperation,
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Set cache value"""

    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    try:
        prefixed_key = f"{x_service_name}:{cache_request.key}"
        success = db.cache_set(prefixed_key, cache_request.value, cache_request.expire)

        return {
            "success": success,
            "key": cache_request.key,
            "service": x_service_name,
            "expires_in": cache_request.expire,
            "backend": "Memory"
        }

    except Exception as e:
        logger.error(f"Cache set error for {x_service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/cache/get/{key}")
async def cache_get(
    key: str,
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Get cache value"""

    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    try:
        prefixed_key = f"{x_service_name}:{key}"
        value = db.cache_get(prefixed_key)

        return {
            "success": value is not None,
            "key": key,
            "value": value,
            "service": x_service_name,
            "backend": "Memory"
        }

    except Exception as e:
        logger.error(f"Cache get error for {x_service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/cache/delete/{key}")
async def cache_delete(
    key: str,
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Delete cache value"""

    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    try:
        prefixed_key = f"{x_service_name}:{key}"
        success = db.cache_delete(prefixed_key)

        return {
            "success": success,
            "key": key,
            "service": x_service_name,
            "backend": "Memory"
        }

    except Exception as e:
        logger.error(f"Cache delete error for {x_service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/database/schemas")
async def get_schemas(
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Get available database schemas"""

    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    return {
        "schemas": list(SERVICE_SCHEMAS.values()),
        "service_schema": SERVICE_SCHEMAS.get(x_service_name),
        "service": x_service_name,
        "backend": "SQLite"
    }

@app.get("/api/v1/database/stats")
async def get_database_stats(
    x_service_name: str = Header(...),
    x_api_key: str = Header(...)
):
    """Get database performance statistics"""

    if x_service_name not in ALLOWED_SERVICES:
        raise HTTPException(status_code=403, detail=f"Service '{x_service_name}' not allowed")

    try:
        db_size = os.path.getsize(db.db_path) / 1024 if os.path.exists(db.db_path) else 0

        return {
            "database_info": {
                "type": "SQLite",
                "path": db.db_path,
                "size_kb": round(db_size, 1)
            },
            "query_statistics": db.query_stats,
            "cache_info": {
                "size": len(db.cache),
                "type": "Memory"
            },
            "service": x_service_name,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Get stats error for {x_service_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Centralized Database Service v1.0.0 (SQLite)")
    uvicorn.run(app, host="0.0.0.0", port=8002)
