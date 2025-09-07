"""
Enterprise API Gateway - Unified Entry Point for All Services
Provides routing, load balancing, security, and monitoring
"""
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import httpx
import asyncio
import time
import uuid
import json
import logging
from datetime import datetime, timezone
import sqlite3
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer(auto_error=False)

class ServiceRegistry:
    """Service registry for managing backend services"""
    
    def __init__(self):
        self.services = {
            "auth-service": {
                "url": "http://localhost:8001",
                "health_endpoint": "/health",
                "routes": ["/api/v1/auth/*"],
                "description": "Enterprise Authentication & Authorization"
            },
            "monitoring-service": {
                "url": "http://localhost:8003",
                "health_endpoint": "/health",
                "routes": ["/api/v1/monitoring/*"],
                "description": "Real-Time Task Monitoring & Anomaly Detection"
            },
            "main-platform": {
                "url": "http://localhost:8080",
                "health_endpoint": "/health",
                "routes": ["/api/v1/delegate", "/api/v1/status", "/api/v1/agents"],
                "description": "Main Enterprise Automation Platform"
            },
            "intelligent-automation": {
                "url": "http://localhost:8012",
                "health_endpoint": "/health",
                "routes": ["/api/v1/automation/*", "/api/v1/workflows/*", "/api/v1/intelligent-assignment/*"],
                "description": "Intelligent Auto-Assignment & Workflow Orchestration"
            },
            "learning-service": {
                "url": "http://localhost:8004", 
                "health_endpoint": "/health",
                "routes": ["/api/v1/learning/*"],
                "description": "AI Learning & Performance Optimization"
            },
            "trading-service": {
                "url": "http://localhost:8005",
                "health_endpoint": "/health", 
                "routes": ["/api/v1/trading/*"],
                "description": "High-Frequency Trading & Multi-Asset"
            },
            "market-signals": {
                "url": "http://localhost:8006",
                "health_endpoint": "/health",
                "routes": ["/api/v1/market/*"],
                "description": "AI Market Analysis & Signals"
            },
            "banking-service": {
                "url": "http://localhost:8008",
                "health_endpoint": "/health",
                "routes": ["/api/v1/banking/*"],
                "description": "Banking & Loan Processing"
            },
            "healthcare-adapter": {
                "url": "http://localhost:8009",
                "health_endpoint": "/health",
                "routes": ["/api/v1/healthcare/*"],
                "description": "HIPAA-Compliant Healthcare Routing"
            },
            "retail-adapter": {
                "url": "http://localhost:8010",
                "health_endpoint": "/health",
                "routes": ["/api/v1/retail/*"],
                "description": "E-commerce Task Delegation"
            },
            "iot-integration": {
                "url": "http://localhost:8011",
                "health_endpoint": "/health",
                "routes": ["/api/v1/iot/*"],
                "description": "IoT & Smart Device Management"
            },
            "database-service": {
                "url": "http://localhost:8002",
                "health_endpoint": "/health",
                "routes": ["/api/v1/database/*"],
                "description": "Enterprise Database Management"
            }
        }
        self.service_health = {}
        self.request_counts = {}
        self.response_times = {}
        
    async def check_service_health(self, service_name: str) -> bool:
        """Check if a service is healthy"""
        try:
            service = self.services.get(service_name)
            if not service:
                return False
                
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service['url']}{service['health_endpoint']}")
                healthy = response.status_code == 200
                self.service_health[service_name] = {
                    "healthy": healthy,
                    "last_check": datetime.now(timezone.utc).isoformat(),
                    "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else 0
                }
                return healthy
        except Exception as e:
            logger.warning(f"Health check failed for {service_name}: {e}")
            self.service_health[service_name] = {
                "healthy": False,
                "last_check": datetime.now(timezone.utc).isoformat(),
                "error": str(e)
            }
            return False
    
    async def get_healthy_service_url(self, service_name: str) -> Optional[str]:
        """Get URL for a healthy service instance"""
        if await self.check_service_health(service_name):
            return self.services[service_name]["url"]
        return None
    
    def find_service_for_path(self, path: str) -> Optional[str]:
        """Find which service should handle a given path"""
        for service_name, config in self.services.items():
            for route in config["routes"]:
                if route.endswith("*"):
                    # Wildcard matching
                    prefix = route[:-1]
                    if path.startswith(prefix):
                        return service_name
                elif path == route or path.startswith(route + "/"):
                    return service_name
        return None

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = {}
        self.limits = {
            "default": {"requests": 100, "window": 60},  # 100 requests per minute
            "trading": {"requests": 1000, "window": 60},  # Higher limit for trading
            "learning": {"requests": 200, "window": 60}
        }
    
    def is_allowed(self, client_id: str, service_type: str = "default") -> bool:
        """Check if request is within rate limits"""
        now = time.time()
        limit_config = self.limits.get(service_type, self.limits["default"])
        
        if client_id not in self.requests:
            self.requests[client_id] = []
        
        # Clean old requests outside the window
        window_start = now - limit_config["window"]
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id] 
            if req_time > window_start
        ]
        
        # Check if under limit
        if len(self.requests[client_id]) < limit_config["requests"]:
            self.requests[client_id].append(now)
            return True
        
        return False

class APIGatewayMetrics:
    """Metrics collection for API Gateway"""
    
    def __init__(self):
        self.db_path = "data/gateway_metrics.db"
        self._init_database()
        
    def _init_database(self):
        """Initialize metrics database"""
        try:
            os.makedirs("data", exist_ok=True)
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS request_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    request_id TEXT,
                    client_id TEXT,
                    service_name TEXT,
                    method TEXT,
                    path TEXT,
                    status_code INTEGER,
                    response_time REAL,
                    request_size INTEGER,
                    response_size INTEGER,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Gateway metrics database initialized")
        except Exception as e:
            logger.error(f"Failed to initialize metrics database: {e}")
    
    def record_request(self, request_id: str, client_id: str, service_name: str,
                      method: str, path: str, status_code: int, response_time: float,
                      request_size: int = 0, response_size: int = 0):
        """Record request metrics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO request_metrics 
                (request_id, client_id, service_name, method, path, status_code, 
                 response_time, request_size, response_size)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (request_id, client_id, service_name, method, path, status_code,
                  response_time, request_size, response_size))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to record metrics: {e}")

# Global instances
service_registry = ServiceRegistry()
rate_limiter = RateLimiter()
metrics = APIGatewayMetrics()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting API Gateway...")
    
    # Initial health checks
    for service_name in service_registry.services.keys():
        await service_registry.check_service_health(service_name)
    
    yield
    
    # Shutdown
    logger.info("Shutting down API Gateway...")

app = FastAPI(
    title="Enterprise API Gateway",
    description="Unified entry point for Enterprise Automation Platform",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class GatewayStatus(BaseModel):
    gateway_status: str
    total_services: int
    healthy_services: int
    service_health: Dict[str, Any]
    uptime: str
    version: str

class ProxyRequest(BaseModel):
    method: str
    path: str
    headers: Dict[str, str] = {}
    body: Optional[Any] = None

def get_client_id(request: Request) -> str:
    """Extract client identifier from request"""
    # Try to get from API key, then IP address
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return f"api_key_{api_key[:8]}"
    
    client_ip = request.client.host if request.client else "unknown"
    return f"ip_{client_ip}"

async def authenticate_request(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[str]:
    """Authenticate request using Auth Service"""
    if not credentials:
        return "anonymous"

    try:
        # Verify token with auth service
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                "http://localhost:8001/api/v1/auth/verify",
                headers={"Authorization": f"Bearer {credentials.credentials}"}
            )

            if response.status_code == 200:
                user_data = response.json()
                return user_data.get("user", {}).get("username", "authenticated_user")
            else:
                return "anonymous"
    except Exception as e:
        logger.warning(f"Auth verification failed: {e}")
        return "anonymous"

@app.get("/")
async def root():
    """API Gateway information"""
    return {
        "service": "Enterprise API Gateway",
        "status": "running",
        "version": "1.0.0",
        "description": "Unified entry point for Enterprise Automation Platform",
        "capabilities": [
            "service_routing",
            "load_balancing", 
            "rate_limiting",
            "health_monitoring",
            "metrics_collection",
            "request_logging"
        ],
        "registered_services": len(service_registry.services),
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    """Gateway health check"""
    return {"status": "healthy", "service": "api-gateway", "version": "1.0.0"}

@app.get("/gateway/status")
async def gateway_status() -> GatewayStatus:
    """Comprehensive gateway and service status"""
    
    # Check all service health
    health_tasks = [
        service_registry.check_service_health(service_name)
        for service_name in service_registry.services.keys()
    ]
    
    health_results = await asyncio.gather(*health_tasks, return_exceptions=True)
    healthy_count = sum(1 for result in health_results if result is True)
    
    return GatewayStatus(
        gateway_status="healthy",
        total_services=len(service_registry.services),
        healthy_services=healthy_count,
        service_health=service_registry.service_health,
        uptime="running",
        version="1.0.0"
    )

@app.get("/gateway/services")
async def list_services():
    """List all registered services"""
    return {
        "services": {
            name: {
                "url": config["url"],
                "description": config["description"],
                "routes": config["routes"],
                "health": service_registry.service_health.get(name, {"healthy": False})
            }
            for name, config in service_registry.services.items()
        },
        "total_services": len(service_registry.services)
    }

@app.get("/gateway/metrics")
async def gateway_metrics():
    """Get gateway performance metrics"""
    try:
        conn = sqlite3.connect(metrics.db_path)
        cursor = conn.cursor()

        # Get recent metrics
        cursor.execute('''
            SELECT service_name, COUNT(*) as request_count,
                   AVG(response_time) as avg_response_time,
                   AVG(status_code) as avg_status_code
            FROM request_metrics
            WHERE timestamp > datetime('now', '-1 hour')
            GROUP BY service_name
        ''')

        service_metrics = {}
        for row in cursor.fetchall():
            service_metrics[row[0]] = {
                "request_count": row[1],
                "avg_response_time": round(row[2], 3),
                "avg_status_code": round(row[3], 1)
            }

        # Get total metrics
        cursor.execute('''
            SELECT COUNT(*) as total_requests,
                   AVG(response_time) as avg_response_time
            FROM request_metrics
            WHERE timestamp > datetime('now', '-1 hour')
        ''')

        total_row = cursor.fetchone()
        conn.close()

        return {
            "time_window": "last_hour",
            "total_requests": total_row[0] if total_row else 0,
            "avg_response_time": round(total_row[1], 3) if total_row and total_row[1] else 0,
            "service_metrics": service_metrics,
            "healthy_services": len([s for s in service_registry.service_health.values() if s.get("healthy", False)]),
            "total_services": len(service_registry.services)
        }

    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return {"error": "Failed to retrieve metrics"}

# Main proxy endpoint - handles all service routing
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_request(
    path: str,
    request: Request,
    user: str = Depends(authenticate_request)
):
    """Main proxy endpoint that routes requests to appropriate services"""

    start_time = time.time()
    request_id = str(uuid.uuid4())
    client_id = get_client_id(request)
    full_path = f"/api/{path}"

    try:
        # Rate limiting
        service_type = "trading" if "trading" in path else "learning" if "learning" in path else "default"
        if not rate_limiter.is_allowed(client_id, service_type):
            return JSONResponse(
                status_code=429,
                content={"error": "Rate limit exceeded", "retry_after": 60}
            )

        # Find target service
        service_name = service_registry.find_service_for_path(full_path)
        if not service_name:
            return JSONResponse(
                status_code=404,
                content={"error": f"No service found for path: {full_path}"}
            )

        # Get healthy service URL
        service_url = await service_registry.get_healthy_service_url(service_name)
        if not service_url:
            return JSONResponse(
                status_code=503,
                content={"error": f"Service {service_name} is unavailable"}
            )

        # Prepare request
        target_url = f"{service_url}{full_path}"
        headers = dict(request.headers)

        # Remove hop-by-hop headers
        headers.pop("host", None)
        headers.pop("content-length", None)

        # Add gateway headers
        headers["X-Gateway-Request-ID"] = request_id
        headers["X-Gateway-Client-ID"] = client_id
        headers["X-Forwarded-For"] = request.client.host if request.client else "unknown"

        # Add database service specific headers if needed
        if service_name == "database-service":
            headers["x-service-name"] = "api-gateway"
            headers["x-api-key"] = "gateway-api-key-2024"

        # Get request body
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()

        # Make request to backend service
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=request.query_params
            )

        # Calculate metrics
        response_time = time.time() - start_time
        request_size = len(body) if body else 0
        response_size = len(response.content)

        # Record metrics
        metrics.record_request(
            request_id=request_id,
            client_id=client_id,
            service_name=service_name,
            method=request.method,
            path=full_path,
            status_code=response.status_code,
            response_time=response_time,
            request_size=request_size,
            response_size=response_size
        )

        # Log request
        logger.info(f"Proxied {request.method} {full_path} -> {service_name} "
                   f"({response.status_code}) in {response_time:.3f}s")

        # Return response
        response_headers = dict(response.headers)
        response_headers["X-Gateway-Service"] = service_name
        response_headers["X-Gateway-Request-ID"] = request_id
        response_headers["X-Gateway-Response-Time"] = str(response_time)

        return JSONResponse(
            status_code=response.status_code,
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
            headers=response_headers
        )

    except httpx.TimeoutException:
        response_time = time.time() - start_time
        metrics.record_request(request_id, client_id, service_name or "unknown",
                             request.method, full_path, 504, response_time)

        return JSONResponse(
            status_code=504,
            content={"error": "Gateway timeout", "request_id": request_id}
        )

    except Exception as e:
        response_time = time.time() - start_time
        metrics.record_request(request_id, client_id, service_name or "unknown",
                             request.method, full_path, 500, response_time)

        logger.error(f"Proxy error for {full_path}: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal gateway error", "request_id": request_id}
        )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Enterprise API Gateway v1.0.0")
    uvicorn.run(app, host="0.0.0.0", port=8000)
