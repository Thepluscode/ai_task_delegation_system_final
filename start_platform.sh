#!/bin/bash

echo "🚀 Starting Complete Enterprise Automation Platform"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_DIR="Library/Mobile Documents/com~apple~CloudDocs/ai_task_delegation_system_final"
LOG_DIR="logs"
PID_DIR="pids"

# Service configuration (name:port:path)
declare -A SERVICES=(
    ["workflow-state-service"]="8003:services/workflow-state-service/src/main.py"
    ["robot-abstraction-protocol"]="8004:services/robot-abstraction-protocol/src/main.py"
    ["ai-task-delegation"]="8005:services/ai-task-delegation/src/main.py"
    ["edge-computing"]="8006:services/edge-computing/src/main.py"
    ["security-compliance"]="8007:services/security-compliance/src/main.py"
    ["monitoring-analytics"]="8008:services/monitoring-analytics/src/main.py"
)

# Create necessary directories
create_directories() {
    echo -e "${BLUE}📁 Creating directories...${NC}"
    mkdir -p "$LOG_DIR"
    mkdir -p "$PID_DIR"
    mkdir -p "config"
    echo -e "${GREEN}✅ Directories created${NC}"
}

# Check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Start a service
start_service() {
    local service_name=$1
    local port=$2
    local service_path=$3
    
    echo -n "Starting $service_name on port $port... "
    
    # Check if port is available
    if ! check_port $port; then
        echo -e "${YELLOW}⚠️  Port $port already in use${NC}"
        return 1
    fi
    
    # Check if service file exists
    if [ ! -f "$service_path" ]; then
        echo -e "${RED}❌ Service file not found: $service_path${NC}"
        return 1
    fi
    
    # Start the service
    cd "$(dirname "$service_path")"
    nohup python "$(basename "$service_path")" > "../../../$LOG_DIR/${service_name}.log" 2>&1 &
    local pid=$!
    echo $pid > "../../../$PID_DIR/${service_name}.pid"
    cd - > /dev/null
    
    # Wait a moment and check if service started successfully
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ Started (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to start${NC}"
        return 1
    fi
}

# Check service health
check_service_health() {
    local service_name=$1
    local port=$2
    
    echo -n "Checking $service_name health... "
    
    # Wait for service to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Healthy${NC}"
            return 0
        fi
        sleep 1
        ((attempt++))
    done
    
    echo -e "${RED}❌ Unhealthy${NC}"
    return 1
}

# Stop all services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    if [ -d "$PID_DIR" ]; then
        for pidfile in "$PID_DIR"/*.pid; do
            if [ -f "$pidfile" ]; then
                local service_name=$(basename "$pidfile" .pid)
                local pid=$(cat "$pidfile")
                
                echo -n "Stopping $service_name (PID: $pid)... "
                
                if kill -0 "$pid" 2>/dev/null; then
                    kill "$pid"
                    sleep 2
                    
                    # Force kill if still running
                    if kill -0 "$pid" 2>/dev/null; then
                        kill -9 "$pid"
                        echo -e "${YELLOW}⚠️  Force killed${NC}"
                    else
                        echo -e "${GREEN}✅ Stopped${NC}"
                    fi
                else
                    echo -e "${GRAY}⚪ Not running${NC}"
                fi
                
                rm -f "$pidfile"
            fi
        done
    fi
}

# Start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting frontend dashboard...${NC}"
    
    cd "automation-ai-next"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start frontend in background
    echo -n "Starting Next.js frontend on port 3000... "
    nohup npm run dev > "../$LOG_DIR/frontend.log" 2>&1 &
    local pid=$!
    echo $pid > "../$PID_DIR/frontend.pid"
    
    cd - > /dev/null
    
    sleep 3
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ Started (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to start${NC}"
        return 1
    fi
}

# Main startup sequence
main() {
    echo -e "${CYAN}🔧 Platform Startup Sequence${NC}"
    echo "=========================="
    
    # Handle command line arguments
    case "${1:-start}" in
        "stop")
            stop_services
            exit 0
            ;;
        "restart")
            stop_services
            sleep 2
            ;;
        "status")
            echo -e "${BLUE}📊 Service Status:${NC}"
            for service in "${!SERVICES[@]}"; do
                IFS=':' read -r port path <<< "${SERVICES[$service]}"
                check_service_health "$service" "$port"
            done
            exit 0
            ;;
    esac
    
    # Create directories
    create_directories
    
    # Start backend services
    echo -e "${BLUE}🔧 Starting backend services...${NC}"
    echo "=============================="
    
    local started_services=0
    local total_services=${#SERVICES[@]}
    
    for service in "${!SERVICES[@]}"; do
        IFS=':' read -r port path <<< "${SERVICES[$service]}"
        if start_service "$service" "$port" "$path"; then
            ((started_services++))
        fi
    done
    
    echo ""
    echo -e "${BLUE}🏥 Health checks...${NC}"
    echo "=================="
    
    local healthy_services=0
    for service in "${!SERVICES[@]}"; do
        IFS=':' read -r port path <<< "${SERVICES[$service]}"
        if check_service_health "$service" "$port"; then
            ((healthy_services++))
        fi
    done
    
    # Start frontend
    echo ""
    start_frontend
    
    # Summary
    echo ""
    echo -e "${CYAN}📋 Startup Summary${NC}"
    echo "=================="
    echo -e "${BLUE}Backend Services:${NC} $healthy_services/$total_services healthy"
    echo -e "${BLUE}Frontend:${NC} Running on http://localhost:3000"
    echo ""
    
    if [ $healthy_services -eq $total_services ]; then
        echo -e "${GREEN}🎉 Platform started successfully!${NC}"
        echo ""
        echo -e "${CYAN}🌐 Access Points:${NC}"
        echo "- 🎨 Main Dashboard: http://localhost:3000"
        echo "- 📊 Monitoring: http://localhost:3000/monitoring"
        echo "- 📈 Analytics: http://localhost:3000/analytics"
        echo "- 🤖 Robot Control: http://localhost:3000/robots/control"
        echo "- 🔄 Workflow Designer: http://localhost:3000/workflows/designer"
        echo "- ⚙️ System Admin: http://localhost:3000/admin"
        echo ""
        echo -e "${CYAN}🔧 Management Commands:${NC}"
        echo "- ./start_platform.sh stop     - Stop all services"
        echo "- ./start_platform.sh restart  - Restart all services"
        echo "- ./start_platform.sh status   - Check service status"
        echo "- ./test_complete_platform.sh  - Run integration tests"
        echo ""
        echo -e "${PURPLE}🚀 Your Enterprise Automation Platform is ready!${NC}"
    else
        echo -e "${YELLOW}⚠️  Platform started with issues${NC}"
        echo -e "${YELLOW}🔧 Check logs in $LOG_DIR/ directory${NC}"
        echo -e "${YELLOW}💡 Run './start_platform.sh status' to check service health${NC}"
    fi
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}🛑 Shutting down platform...${NC}"; stop_services; exit 0' INT

# Run main function
main "$@"
