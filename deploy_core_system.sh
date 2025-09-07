#!/bin/bash

echo "🚀 AI Task Delegation System - Core System Deployment"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if virtual environment is active
check_venv() {
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        print_status "Virtual environment active: $VIRTUAL_ENV"
    else
        print_warning "Virtual environment not detected. Activating..."
        source venv/bin/activate || {
            print_error "Failed to activate virtual environment"
            exit 1
        }
    fi
}

# Install comprehensive dependencies
install_dependencies() {
    print_step "Installing comprehensive dependencies for core system..."
    
    pip install --upgrade pip
    
    # Core dependencies
    pip install fastapi uvicorn pydantic
    
    # Database and storage
    pip install sqlalchemy alembic psycopg2-binary redis
    
    # Machine learning and computation
    pip install numpy scipy scikit-learn pandas
    
    # Networking and communication
    pip install requests aiohttp websockets
    
    # Utilities
    pip install python-multipart python-dateutil
    
    # Development and testing
    pip install pytest pytest-asyncio black flake8
    
    print_status "Dependencies installed successfully"
}

# Create comprehensive directory structure
setup_directories() {
    print_step "Setting up comprehensive directory structure..."
    
    # Core services
    mkdir -p services/agent-selection-service/src
    mkdir -p services/robot-abstraction-service/src
    mkdir -p services/workflow-state-service/src
    mkdir -p services/edge-computing-service/src
    mkdir -p services/learning-service/src
    mkdir -p services/banking-adapter/src
    mkdir -p services/dashboard-api/src
    
    # Shared libraries
    mkdir -p shared/models
    mkdir -p shared/utils
    mkdir -p shared/database
    
    # Configuration
    mkdir -p config/dev
    mkdir -p config/prod
    mkdir -p config/edge
    
    # Documentation
    mkdir -p docs/api
    mkdir -p docs/deployment
    mkdir -p docs/user-guides
    
    # Tests
    mkdir -p tests/unit
    mkdir -p tests/integration
    mkdir -p tests/performance
    
    # Logs and data
    mkdir -p logs
    mkdir -p data/cache
    mkdir -p data/models
    
    print_status "Directory structure created"
}

# Create shared models
create_shared_models() {
    print_step "Creating shared models and utilities..."
    
    cat > shared/models/__init__.py << 'EOF'
# File: shared/models/__init__.py

"""
Shared models for AI Task Delegation System
"""
from .base_models import *
from .task_models import *
from .agent_models import *
from .workflow_models import *
EOF

    cat > shared/models/base_models.py << 'EOF'
# File: shared/models/base_models.py

"""
Base models used across all services
"""
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime
import uuid

class ServiceResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime

class HealthStatus(BaseModel):
    service: str
    status: str
    version: str
    uptime: Optional[str] = None
    dependencies: Optional[Dict[str, str]] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total_count: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool
EOF

    cat > shared/models/task_models.py << 'EOF'
# File: shared/models/task_models.py

"""
Task-related models shared across services
"""
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime

class TaskPriority(str, Enum):
    SAFETY_CRITICAL = "safety_critical"
    QUALITY_CRITICAL = "quality_critical"
    EFFICIENCY_CRITICAL = "efficiency_critical"
    STANDARD = "standard"

class TaskStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(str, Enum):
    ASSEMBLY = "assembly"
    INSPECTION = "inspection"
    PACKAGING = "packaging"
    TRANSPORT = "transport"
    QUALITY_CONTROL = "quality_control"
    MAINTENANCE = "maintenance"
    CUSTOM = "custom"

class Task(BaseModel):
    task_id: str
    task_type: TaskType
    priority: TaskPriority
    status: TaskStatus = TaskStatus.PENDING
    parameters: Dict[str, Any] = {}
    estimated_duration: Optional[int] = None  # minutes
    deadline: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    assigned_agent_id: Optional[str] = None
EOF

    cat > shared/models/agent_models.py << 'EOF'
# File: shared/models/agent_models.py

"""
Agent-related models shared across services
"""
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime

class AgentType(str, Enum):
    ROBOT = "robot"
    HUMAN = "human"
    AI_SYSTEM = "ai_system"
    HYBRID = "hybrid"

class AgentStatus(str, Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

class RobotBrand(str, Enum):
    UNIVERSAL_ROBOTS = "universal_robots"
    ABB = "abb"
    KUKA = "kuka"
    FANUC = "fanuc"
    BOSTON_DYNAMICS = "boston_dynamics"
    CUSTOM = "custom"

class Agent(BaseModel):
    agent_id: str
    agent_type: AgentType
    name: str
    status: AgentStatus = AgentStatus.AVAILABLE
    capabilities: Dict[str, float] = {}
    location: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime
    last_seen: Optional[datetime] = None
EOF

    print_status "Shared models created"
}

# Create configuration files
create_config_files() {
    print_step "Creating configuration files..."
    
    cat > config/dev/services.yaml << 'EOF'
# File: config/dev/services.yaml

# Development Configuration for AI Task Delegation System
services:
  agent_selection:
    host: "0.0.0.0"
    port: 8001
    workers: 1
    
  robot_abstraction:
    host: "0.0.0.0"
    port: 8002
    workers: 1
    
  workflow_state:
    host: "0.0.0.0"
    port: 8003
    workers: 1
    
  learning_service:
    host: "0.0.0.0"
    port: 8004
    workers: 1
    
  banking_adapter:
    host: "0.0.0.0"
    port: 8006
    workers: 1
    
  dashboard_api:
    host: "0.0.0.0"
    port: 8007
    workers: 1
    
  edge_computing:
    host: "0.0.0.0"
    port: 8008
    workers: 1

database:
  url: "postgresql://localhost:5432/ai_task_delegation"
  pool_size: 5
  echo: true

redis:
  url: "redis://localhost:6379"
  db: 0

logging:
  level: "INFO"
  format: "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
EOF

    print_status "Configuration files created"
}

# Create service management scripts
create_service_scripts() {
    print_step "Creating service management scripts..."

    cat > start_core_services.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting AI Task Delegation Core Services"
echo "============================================"

# Activate virtual environment
source venv/bin/activate

# Function to start service in background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3

    echo "Starting $service_name on port $port..."
    nohup python $service_path > logs/${service_name}.log 2>&1 &
    echo $! > logs/${service_name}.pid
    echo "$service_name started (PID: $(cat logs/${service_name}.pid))"
}

# Create logs directory
mkdir -p logs

# Start all core services
echo "🔧 Starting Core Services..."

# Agent Selection Service (Port 8001)
if [ -f "services/agent-selection-service/src/main.py" ]; then
    start_service "agent-selection" "services/agent-selection-service/src/main.py" 8001
else
    echo "⚠️  Agent Selection Service not found"
fi

# Robot Abstraction Service (Port 8002)
if [ -f "services/robot-abstraction-service/src/main.py" ]; then
    start_service "robot-abstraction" "services/robot-abstraction-service/src/main.py" 8002
else
    echo "⚠️  Robot Abstraction Service not found"
fi

# Workflow State Service (Port 8003)
if [ -f "services/workflow-state-service/src/main.py" ]; then
    start_service "workflow-state" "services/workflow-state-service/src/main.py" 8003
else
    echo "⚠️  Workflow State Service not found"
fi

# Learning Service (Port 8004)
if [ -f "services/learning-service/src/main.py" ]; then
    start_service "learning-service" "services/learning-service/src/main.py" 8004
else
    echo "⚠️  Learning Service not found"
fi

# Banking Adapter (Port 8006)
if [ -f "services/banking-adapter/src/banking_learning_service_v2.py" ]; then
    start_service "banking-adapter" "services/banking-adapter/src/banking_learning_service_v2.py" 8006
else
    echo "⚠️  Banking Adapter not found"
fi

# Dashboard API (Port 8007)
if [ -f "services/dashboard-api/src/dashboard_api.py" ]; then
    start_service "dashboard-api" "services/dashboard-api/src/dashboard_api.py" 8007
else
    echo "⚠️  Dashboard API not found"
fi

# Edge Computing Service (Port 8008)
if [ -f "services/edge-computing-service/src/main.py" ]; then
    start_service "edge-computing" "services/edge-computing-service/src/main.py" 8008
else
    echo "⚠️  Edge Computing Service not found"
fi

echo ""
echo "🎯 Core Services Status:"
echo "======================="
echo "Agent Selection:    http://localhost:8001"
echo "Robot Abstraction:  http://localhost:8002"
echo "Workflow State:     http://localhost:8003"
echo "Learning Service:   http://localhost:8004"
echo "Banking Adapter:    http://localhost:8006"
echo "Dashboard API:      http://localhost:8007"
echo "Edge Computing:     http://localhost:8008"
echo ""
echo "📊 Frontend Dashboard: http://localhost:3000"
echo ""
echo "✅ All services started successfully!"
echo "📝 Check logs/ directory for service logs"
echo "🔍 Use 'ps aux | grep python' to see running processes"
EOF

    chmod +x start_core_services.sh
    print_status "Service management scripts created"
}

# Create monitoring and health check scripts
create_monitoring_scripts() {
    print_step "Creating monitoring and health check scripts..."

    cat > check_services_health.sh << 'EOF'
#!/bin/bash

echo "🏥 AI Task Delegation System - Health Check"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local endpoint=${3:-"/health"}

    echo -n "Checking $service_name (port $port)... "

    if curl -s -f "http://localhost:$port$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}❌ UNHEALTHY${NC}"
        return 1
    fi
}

# Check all services
echo "🔍 Checking Core Services Health..."
echo ""

healthy_count=0
total_count=7

check_service "Agent Selection" 8001 && ((healthy_count++))
check_service "Robot Abstraction" 8002 && ((healthy_count++))
check_service "Workflow State" 8003 && ((healthy_count++))
check_service "Learning Service" 8004 && ((healthy_count++))
check_service "Banking Adapter" 8006 && ((healthy_count++))
check_service "Dashboard API" 8007 && ((healthy_count++))
check_service "Edge Computing" 8008 && ((healthy_count++))

echo ""
echo "📊 Health Summary: $healthy_count/$total_count services healthy"

if [ $healthy_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 All services are healthy!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some services are unhealthy${NC}"
    exit 1
fi
EOF

    chmod +x check_services_health.sh

    cat > stop_core_services.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping AI Task Delegation Core Services"
echo "============================================"

# Function to stop service
stop_service() {
    local service_name=$1

    if [ -f "logs/${service_name}.pid" ]; then
        local pid=$(cat logs/${service_name}.pid)
        echo "Stopping $service_name (PID: $pid)..."

        if kill $pid 2>/dev/null; then
            echo "✅ $service_name stopped"
            rm -f logs/${service_name}.pid
        else
            echo "⚠️  $service_name was not running or already stopped"
            rm -f logs/${service_name}.pid
        fi
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop all services
stop_service "agent-selection"
stop_service "robot-abstraction"
stop_service "workflow-state"
stop_service "learning-service"
stop_service "banking-adapter"
stop_service "dashboard-api"
stop_service "edge-computing"

echo ""
echo "🔍 Checking for any remaining Python processes..."
remaining=$(ps aux | grep -E "(main\.py|dashboard_api\.py|banking_learning_service)" | grep -v grep | wc -l)

if [ $remaining -gt 0 ]; then
    echo "⚠️  Found $remaining remaining processes:"
    ps aux | grep -E "(main\.py|dashboard_api\.py|banking_learning_service)" | grep -v grep
    echo ""
    echo "💡 You may need to manually kill these processes"
else
    echo "✅ All services stopped successfully"
fi
EOF

    chmod +x stop_core_services.sh
    print_status "Monitoring scripts created"
}

# Create development utilities
create_dev_utilities() {
    print_step "Creating development utilities..."

    cat > requirements.txt << 'EOF'
# Core FastAPI and web framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6

# Database and storage
sqlalchemy==2.0.23
alembic==1.13.0
psycopg2-binary==2.9.9
redis==5.0.1

# Machine learning and computation
numpy==1.25.2
scipy==1.11.4
scikit-learn==1.3.2
pandas==2.1.4

# Networking and communication
requests==2.31.0
aiohttp==3.9.1
websockets==12.0

# Utilities and helpers
python-dateutil==2.8.2
pyyaml==6.0.1
python-dotenv==1.0.0

# Development and testing
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.11.0
flake8==6.1.0

# Monitoring and logging
prometheus-client==0.19.0
structlog==23.2.0
EOF

    cat > docker-compose.yml << 'EOF'
# File: docker-compose.yml

version: '3.8'

services:
  # Core AI Task Delegation Services
  agent-selection:
    build: .
    ports:
      - "8001:8001"
    environment:
      - SERVICE_NAME=agent-selection
    command: python services/agent-selection-service/src/main.py
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  robot-abstraction:
    build: .
    ports:
      - "8002:8002"
    environment:
      - SERVICE_NAME=robot-abstraction
    command: python services/robot-abstraction-service/src/main.py
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  workflow-state:
    build: .
    ports:
      - "8003:8003"
    environment:
      - SERVICE_NAME=workflow-state
    command: python services/workflow-state-service/src/main.py
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  edge-computing:
    build: .
    ports:
      - "8008:8008"
    environment:
      - SERVICE_NAME=edge-computing
    command: python services/edge-computing-service/src/main.py
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  # Supporting Services
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_task_delegation
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
EOF

    print_status "Development utilities created"
}

# Create Dockerfile
create_dockerfile() {
    print_step "Creating Dockerfile..."

    cat > Dockerfile << 'EOF'
# File: Dockerfile

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose ports for all services
EXPOSE 8001 8002 8003 8004 8006 8007 8008

# Default command
CMD ["bash", "start_core_services.sh"]
EOF

    print_status "Dockerfile created"
}

# Main deployment function
main() {
    print_step "Starting AI Task Delegation System Core Deployment"

    # Check virtual environment
    check_venv

    # Install dependencies
    install_dependencies

    # Setup directory structure
    setup_directories

    # Create shared models
    create_shared_models

    # Create configuration files
    create_config_files

    # Create service management scripts
    create_service_scripts

    # Create monitoring scripts
    create_monitoring_scripts

    # Create development utilities
    create_dev_utilities

    # Create Dockerfile
    create_dockerfile

    print_status "Core system deployment completed successfully!"
    echo ""
    echo "🎯 Next Steps:"
    echo "============="
    echo "1. Start services: ./start_core_services.sh"
    echo "2. Check health:   ./check_services_health.sh"
    echo "3. View logs:      tail -f logs/*.log"
    echo "4. Stop services:  ./stop_core_services.sh"
    echo ""
    echo "🐳 Docker Deployment:"
    echo "===================="
    echo "1. Build and start: docker-compose up -d"
    echo "2. View logs:       docker-compose logs -f"
    echo "3. Stop services:   docker-compose down"
    echo ""
    echo "📊 Frontend Dashboard:"
    echo "====================="
    echo "1. Navigate to automation-ai-next/"
    echo "2. Run: npm install && npm run dev"
    echo "3. Open: http://localhost:3000"
    echo ""
    echo "🔧 Service Management:"
    echo "====================="
    echo "- Health check: ./check_services_health.sh"
    echo "- View logs:    tail -f logs/[service-name].log"
    echo "- Stop all:     ./stop_core_services.sh"
    echo ""
    echo "🚀 Your AI Task Delegation System is ready for deployment!"
}

# Run main function
main
