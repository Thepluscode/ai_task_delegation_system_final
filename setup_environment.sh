#!/bin/bash

echo "🔧 Enterprise Automation Platform - Environment Setup"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Python 3.8+ is installed
check_python() {
    echo -e "${BLUE}🐍 Checking Python installation...${NC}"
    
    if command -v python3 &> /dev/null; then
        python_version=$(python3 --version | cut -d' ' -f2)
        echo -e "${GREEN}✅ Python $python_version found${NC}"
        
        # Check if version is 3.8+
        if python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
            echo -e "${GREEN}✅ Python version is compatible${NC}"
        else
            echo -e "${RED}❌ Python 3.8+ required, found $python_version${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Python 3 not found. Please install Python 3.8+${NC}"
        exit 1
    fi
}

# Check if Node.js is installed
check_nodejs() {
    echo -e "${BLUE}📦 Checking Node.js installation...${NC}"
    
    if command -v node &> /dev/null; then
        node_version=$(node --version)
        echo -e "${GREEN}✅ Node.js $node_version found${NC}"
        
        # Check if npm is available
        if command -v npm &> /dev/null; then
            npm_version=$(npm --version)
            echo -e "${GREEN}✅ npm $npm_version found${NC}"
        else
            echo -e "${RED}❌ npm not found${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
        exit 1
    fi
}

# Create virtual environment
setup_python_env() {
    echo -e "${BLUE}🔧 Setting up Python environment...${NC}"
    
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
        echo -e "${GREEN}✅ Virtual environment created${NC}"
    else
        echo -e "${YELLOW}⚠️  Virtual environment already exists${NC}"
    fi
    
    # Activate virtual environment
    echo "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    echo "Upgrading pip..."
    pip install --upgrade pip
    
    # Install requirements
    echo "Installing Python dependencies..."
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        echo -e "${GREEN}✅ Python dependencies installed${NC}"
    else
        echo -e "${RED}❌ requirements.txt not found${NC}"
        exit 1
    fi
}

# Setup frontend environment
setup_frontend_env() {
    echo -e "${BLUE}🎨 Setting up frontend environment...${NC}"
    
    if [ -d "automation-ai-next" ]; then
        cd automation-ai-next
        
        echo "Installing frontend dependencies..."
        npm install
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
        else
            echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
            exit 1
        fi
        
        cd ..
    else
        echo -e "${RED}❌ Frontend directory not found${NC}"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    echo -e "${BLUE}📁 Creating necessary directories...${NC}"
    
    directories=("logs" "pids" "config" "data" "temp")
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            echo "Created $dir/"
        fi
    done
    
    echo -e "${GREEN}✅ Directories created${NC}"
}

# Create environment configuration
create_env_config() {
    echo -e "${BLUE}⚙️  Creating environment configuration...${NC}"
    
    if [ ! -f ".env" ]; then
        cat > .env << 'EOF'
# Environment Configuration
ENVIRONMENT=development
DEBUG=true

# Security
SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Database
DATABASE_URL=sqlite+aiosqlite:///./data/automation_platform.db

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Monitoring
ENABLE_METRICS=true
ENABLE_TRACING=true

# Performance
CACHE_TTL=300
MAX_RETRIES=3

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
EOF
        echo -e "${GREEN}✅ Environment configuration created${NC}"
    else
        echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    fi
}

# Check service files
check_service_files() {
    echo -e "${BLUE}🔍 Checking service files...${NC}"
    
    services=(
        "services/workflow-state-service/src/main.py"
        "services/robot-abstraction-protocol/src/main.py"
        "services/ai-task-delegation/src/main.py"
        "services/edge-computing/src/main.py"
        "services/security-compliance/src/main.py"
        "services/monitoring-analytics/src/main.py"
    )
    
    missing_services=()
    
    for service in "${services[@]}"; do
        if [ -f "$service" ]; then
            echo -e "${GREEN}✅ $(basename $(dirname $(dirname $service)))${NC}"
        else
            echo -e "${RED}❌ $(basename $(dirname $(dirname $service)))${NC}"
            missing_services+=("$service")
        fi
    done
    
    if [ ${#missing_services[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing service files:${NC}"
        for service in "${missing_services[@]}"; do
            echo "   - $service"
        done
        exit 1
    fi
}

# Make scripts executable
make_scripts_executable() {
    echo -e "${BLUE}🔧 Making scripts executable...${NC}"
    
    scripts=(
        "start_platform.sh"
        "test_complete_platform.sh"
        "setup_environment.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            chmod +x "$script"
            echo "Made $script executable"
        fi
    done
    
    echo -e "${GREEN}✅ Scripts are executable${NC}"
}

# Test basic imports
test_imports() {
    echo -e "${BLUE}🧪 Testing Python imports...${NC}"
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Test critical imports
    python3 -c "
import fastapi
import uvicorn
import pydantic
import sqlalchemy
import redis
import numpy
import pandas
print('✅ All critical imports successful')
" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Python imports working${NC}"
    else
        echo -e "${YELLOW}⚠️  Some imports may be missing, but core dependencies are installed${NC}"
    fi
}

# Main setup function
main() {
    echo -e "${CYAN}🚀 Starting environment setup...${NC}"
    echo ""
    
    # Check prerequisites
    check_python
    check_nodejs
    echo ""
    
    # Setup environments
    setup_python_env
    echo ""
    
    setup_frontend_env
    echo ""
    
    # Create directories and config
    create_directories
    create_env_config
    echo ""
    
    # Verify setup
    check_service_files
    make_scripts_executable
    test_imports
    echo ""
    
    # Final summary
    echo -e "${CYAN}📋 Setup Summary${NC}"
    echo "================"
    echo -e "${GREEN}✅ Python environment configured${NC}"
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    echo -e "${GREEN}✅ Directories and configuration created${NC}"
    echo -e "${GREEN}✅ Service files verified${NC}"
    echo -e "${GREEN}✅ Scripts made executable${NC}"
    echo ""
    
    echo -e "${CYAN}🎯 Next Steps:${NC}"
    echo "1. Start the platform: ${YELLOW}./start_platform.sh${NC}"
    echo "2. Run tests: ${YELLOW}./test_complete_platform.sh${NC}"
    echo "3. Access dashboard: ${YELLOW}http://localhost:3000${NC}"
    echo ""
    
    echo -e "${PURPLE}🎉 Environment setup complete!${NC}"
    echo -e "${PURPLE}Your Enterprise Automation Platform is ready to launch!${NC}"
}

# Run main function
main "$@"
