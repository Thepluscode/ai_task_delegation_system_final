"""
SQLite Fallback for Database Service
Development/testing fallback when PostgreSQL is not available
"""

import sqlite3
import asyncio
import logging
import json
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


class SQLiteFallbackManager:
    """SQLite fallback for development/testing"""
    
    def __init__(self):
        self.db_path = "data/centralized_database.db"
        self.connections = {}
        self.cache = {}  # Simple in-memory cache
        self._initialized = False
        self.query_stats = {
            "total_queries": 0,
            "slow_queries": 0,
            "average_query_time": 0.0,
            "last_reset": datetime.now()
        }
    
    async def initialize(self):
        """Initialize SQLite databases"""
        if self._initialized:
            return
        
        try:
            # Create data directory
            os.makedirs("data", exist_ok=True)
            
            # Create main database
            conn = sqlite3.connect(self.db_path)
            conn.execute("PRAGMA foreign_keys = ON")
            
            # Create schemas (as separate databases in SQLite)
            await self._create_schemas(conn)
            
            conn.close()
            self._initialized = True
            logger.info("SQLite fallback initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize SQLite fallback: {e}")
            raise
    
    async def _create_schemas(self, conn):
        """Create tables for all schemas"""
        
        # Auth schema tables
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                failed_login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMP,
                password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.execute('''
            CREATE TABLE IF NOT EXISTS auth_user_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                session_token TEXT UNIQUE NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                expires_at TIMESTAMP NOT NULL,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Monitoring schema tables
        conn.execute('''
            CREATE TABLE IF NOT EXISTS monitoring_task_monitors (
                id TEXT PRIMARY KEY,
                delegation_id TEXT UNIQUE NOT NULL,
                task_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                task_type TEXT,
                priority TEXT DEFAULT 'medium',
                estimated_completion TIMESTAMP,
                status TEXT DEFAULT 'monitoring',
                current_progress REAL DEFAULT 0.0,
                last_update TIMESTAMP,
                stopped_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.execute('''
            CREATE TABLE IF NOT EXISTS monitoring_progress_history (
                id TEXT PRIMARY KEY,
                delegation_id TEXT NOT NULL,
                progress_percentage REAL NOT NULL,
                quality_metrics TEXT,
                performance_indicators TEXT,
                timestamp TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Learning schema tables
        conn.execute('''
            CREATE TABLE IF NOT EXISTS learning_agent_performance (
                id TEXT PRIMARY KEY,
                agent_id TEXT NOT NULL,
                task_type TEXT NOT NULL,
                performance_score REAL NOT NULL,
                completion_time REAL,
                quality_score REAL,
                efficiency_score REAL,
                task_complexity REAL,
                success_rate REAL,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create indexes
        conn.execute('CREATE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users(username)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_monitoring_delegation_id ON monitoring_task_monitors(delegation_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_learning_agent_id ON learning_agent_performance(agent_id)')
        
        conn.commit()
    
    def _get_table_name(self, schema: str, table: str) -> str:
        """Convert schema.table to SQLite table name"""
        return f"{schema}_{table}"
    
    async def execute_query(self, query: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute SQL query"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Convert named parameters to SQLite format
            if params:
                # Replace :param with ? and create parameter list
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
            
            # Get results
            if query.strip().upper().startswith(('SELECT', 'WITH')):
                rows = cursor.fetchall()
                data = [dict(row) for row in rows]
            else:
                data = {"affected_rows": cursor.rowcount}
                conn.commit()
            
            conn.close()
            
            # Update stats
            self.query_stats["total_queries"] += 1
            
            return {"success": True, "data": data}
            
        except Exception as e:
            logger.error(f"SQLite query error: {e}")
            return {"success": False, "error": str(e)}
    
    async def insert_data(self, schema: str, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert data into table"""
        try:
            table_name = self._get_table_name(schema, table)
            
            # Generate ID if not provided
            if 'id' not in data:
                import uuid
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
            cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (data['id'],))
            row = cursor.fetchone()
            
            conn.close()
            
            if row:
                conn = sqlite3.connect(self.db_path)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (data['id'],))
                row = cursor.fetchone()
                inserted_data = dict(row) if row else None
                conn.close()
            else:
                inserted_data = None
            
            return {"success": True, "inserted_data": inserted_data}
            
        except Exception as e:
            logger.error(f"SQLite insert error: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_data(self, schema: str, table: str, data: Dict[str, Any], where: Dict[str, Any]) -> Dict[str, Any]:
        """Update data in table"""
        try:
            table_name = self._get_table_name(schema, table)
            
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
            logger.error(f"SQLite update error: {e}")
            return {"success": False, "error": str(e)}
    
    async def delete_data(self, schema: str, table: str, where: Dict[str, Any]) -> Dict[str, Any]:
        """Delete data from table"""
        try:
            table_name = self._get_table_name(schema, table)
            
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
            logger.error(f"SQLite delete error: {e}")
            return {"success": False, "error": str(e)}
    
    # Cache operations (in-memory for SQLite fallback)
    async def cache_set(self, key: str, value: str, expire: int = 3600) -> bool:
        """Set cache value"""
        self.cache[key] = {
            "value": value,
            "expires_at": datetime.now().timestamp() + expire
        }
        return True
    
    async def cache_get(self, key: str) -> Optional[str]:
        """Get cache value"""
        if key in self.cache:
            cache_item = self.cache[key]
            if datetime.now().timestamp() < cache_item["expires_at"]:
                return cache_item["value"]
            else:
                del self.cache[key]
        return None
    
    async def cache_delete(self, key: str) -> bool:
        """Delete cache value"""
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    async def cache_clear_pattern(self, pattern: str) -> int:
        """Clear cache keys matching pattern"""
        import fnmatch
        keys_to_delete = [key for key in self.cache.keys() if fnmatch.fnmatch(key, pattern)]
        for key in keys_to_delete:
            del self.cache[key]
        return len(keys_to_delete)
    
    async def get_connection_info(self) -> Dict[str, Any]:
        """Get database connection information"""
        return {
            "database_type": "SQLite",
            "database_path": self.db_path,
            "database_size": f"{os.path.getsize(self.db_path) / 1024:.1f} KB" if os.path.exists(self.db_path) else "0 KB",
            "cache_size": len(self.cache),
            "fallback_mode": True
        }
    
    async def get_query_stats(self) -> Dict[str, Any]:
        """Get query statistics"""
        return self.query_stats
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("SELECT 1")
            conn.close()
            return {
                "database": "healthy",
                "cache": "healthy",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "database": f"unhealthy: {str(e)}",
                "cache": "healthy",
                "timestamp": datetime.now().isoformat()
            }
    
    async def close(self):
        """Close connections"""
        self.cache.clear()
        self._initialized = False


# Global SQLite fallback instance
sqlite_fallback = SQLiteFallbackManager()
