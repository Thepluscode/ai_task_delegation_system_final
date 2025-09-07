#!/bin/bash

echo "📊 AI Task Delegation System - Comprehensive Status Dashboard"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${CYAN}$1${NC}"
    echo "$(printf '=%.0s' {1..60})"
}

print_service() {
    local service=$1
    local status=$2
    local port=$3
    local details=$4
    
    if [ "$status" = "HEALTHY" ]; then
        echo -e "${GREEN}✅ $service${NC} (Port $port) - $details"
    elif [ "$status" = "UNHEALTHY" ]; then
        echo -e "${RED}❌ $service${NC} (Port $port) - $details"
    else
        echo -e "${YELLOW}⚠️  $service${NC} (Port $port) - $details"
    fi
}

print_metric() {
    local label=$1
    local value=$2
    local unit=$3
    echo -e "${BLUE}📈 $label:${NC} $value $unit"
}

# Check if service is running
check_service_status() {
    local port=$1
    local endpoint=${2:-"/health"}
    
    if curl -s -f "http://localhost:$port$endpoint" > /dev/null 2>&1; then
        echo "HEALTHY"
    else
        echo "UNHEALTHY"
    fi
}

# Get service details
get_service_details() {
    local port=$1
    local endpoint=${2:-"/"}
    
    local response=$(curl -s "http://localhost:$port$endpoint" 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'service' in data and 'version' in data:
        print(f\"{data['service']} v{data['version']}\")
    elif 'message' in data:
        print(data['message'])
    else:
        print('Service responding')
except:
    print('Service responding')
" 2>/dev/null || echo "Service responding"
    else
        echo "Not responding"
    fi
}

# Main status check
main() {
    clear
    
    print_header "🚀 AI TASK DELEGATION SYSTEM STATUS"
    echo ""
    
    # System Overview
    print_header "🖥️  SYSTEM OVERVIEW"
    echo -e "${BLUE}Timestamp:${NC} $(date)"
    echo -e "${BLUE}Hostname:${NC} $(hostname)"
    echo -e "${BLUE}Uptime:${NC} $(uptime | awk '{print $3,$4}' | sed 's/,//')"
    echo -e "${BLUE}Load Average:${NC} $(uptime | awk -F'load average:' '{print $2}')"
    echo ""
    
    # Core Services Status
    print_header "🔧 CORE SERVICES STATUS"
    
    # Agent Selection Service
    status=$(check_service_status 8001)
    details=$(get_service_details 8001)
    print_service "Agent Selection Service" "$status" "8001" "$details"
    
    # Robot Abstraction Service
    status=$(check_service_status 8002)
    details=$(get_service_details 8002)
    print_service "Robot Abstraction Service" "$status" "8002" "$details"
    
    # Workflow State Service
    status=$(check_service_status 8003)
    details=$(get_service_details 8003)
    print_service "Workflow State Service" "$status" "8003" "$details"
    
    # Learning Service
    status=$(check_service_status 8004)
    details=$(get_service_details 8004)
    print_service "Learning Service" "$status" "8004" "$details"
    
    # Banking Adapter
    status=$(check_service_status 8006)
    details=$(get_service_details 8006)
    print_service "Banking Adapter" "$status" "8006" "$details"
    
    # Dashboard API
    status=$(check_service_status 8007)
    details=$(get_service_details 8007)
    print_service "Dashboard API" "$status" "8007" "$details"
    
    # Edge Computing Service
    status=$(check_service_status 8008)
    details=$(get_service_details 8008)
    print_service "Edge Computing Service" "$status" "8008" "$details"
    
    echo ""
    
    # Process Information
    print_header "🔍 PROCESS INFORMATION"
    
    echo -e "${BLUE}Python Processes:${NC}"
    ps aux | grep -E "(main\.py|dashboard_api\.py|banking_learning_service)" | grep -v grep | while read line; do
        echo "  $line"
    done
    
    echo ""
    echo -e "${BLUE}Service PIDs:${NC}"
    if [ -d "logs" ]; then
        for pidfile in logs/*.pid; do
            if [ -f "$pidfile" ]; then
                service_name=$(basename "$pidfile" .pid)
                pid=$(cat "$pidfile")
                if kill -0 "$pid" 2>/dev/null; then
                    echo -e "  ${GREEN}$service_name: $pid (running)${NC}"
                else
                    echo -e "  ${RED}$service_name: $pid (not running)${NC}"
                fi
            fi
        done
    else
        echo "  No PID files found (logs directory missing)"
    fi
    
    echo ""
    
    # Network Status
    print_header "🌐 NETWORK STATUS"
    
    echo -e "${BLUE}Port Status:${NC}"
    for port in 8001 8002 8003 8004 8006 8007 8008; do
        if netstat -ln 2>/dev/null | grep ":$port " > /dev/null; then
            echo -e "  ${GREEN}Port $port: LISTENING${NC}"
        else
            echo -e "  ${RED}Port $port: NOT LISTENING${NC}"
        fi
    done
    
    echo ""
    
    # Resource Usage
    print_header "📊 RESOURCE USAGE"
    
    # Memory usage
    memory_info=$(free -h | grep '^Mem:')
    total_mem=$(echo $memory_info | awk '{print $2}')
    used_mem=$(echo $memory_info | awk '{print $3}')
    free_mem=$(echo $memory_info | awk '{print $4}')
    
    print_metric "Memory Total" "$total_mem" ""
    print_metric "Memory Used" "$used_mem" ""
    print_metric "Memory Free" "$free_mem" ""
    
    # CPU usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    print_metric "CPU Usage" "$cpu_usage%" ""
    
    # Disk usage
    disk_usage=$(df -h . | tail -1 | awk '{print $5}')
    print_metric "Disk Usage" "$disk_usage" ""
    
    echo ""
    
    # Log Information
    print_header "📝 LOG INFORMATION"
    
    if [ -d "logs" ]; then
        echo -e "${BLUE}Recent Log Files:${NC}"
        ls -la logs/ | tail -n +2 | while read line; do
            echo "  $line"
        done
        
        echo ""
        echo -e "${BLUE}Log File Sizes:${NC}"
        du -h logs/* 2>/dev/null | while read size file; do
            echo "  $size - $(basename $file)"
        done
    else
        echo "  No logs directory found"
    fi
    
    echo ""
    
    # Frontend Status
    print_header "🎨 FRONTEND STATUS"
    
    if [ -d "automation-ai-next" ]; then
        echo -e "${GREEN}✅ Frontend directory found${NC}"
        
        if [ -f "automation-ai-next/package.json" ]; then
            echo -e "${GREEN}✅ package.json found${NC}"
            
            # Check if Next.js is running
            if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Frontend running on http://localhost:3000${NC}"
            else
                echo -e "${YELLOW}⚠️  Frontend not running on port 3000${NC}"
                echo -e "${BLUE}💡 To start: cd automation-ai-next && npm run dev${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  package.json not found${NC}"
        fi
    else
        echo -e "${RED}❌ Frontend directory not found${NC}"
    fi
    
    echo ""
    
    # Quick Actions
    print_header "⚡ QUICK ACTIONS"
    echo -e "${BLUE}Available Commands:${NC}"
    echo "  ./start_core_services.sh    - Start all services"
    echo "  ./stop_core_services.sh     - Stop all services"
    echo "  ./check_services_health.sh  - Health check only"
    echo "  tail -f logs/*.log          - View live logs"
    echo "  docker-compose up -d        - Start with Docker"
    echo ""
    
    # Summary
    print_header "📋 SUMMARY"
    
    healthy_services=0
    total_services=7
    
    for port in 8001 8002 8003 8004 8006 8007 8008; do
        if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
            ((healthy_services++))
        fi
    done
    
    echo -e "${BLUE}Services Health:${NC} $healthy_services/$total_services healthy"
    
    if [ $healthy_services -eq $total_services ]; then
        echo -e "${GREEN}🎉 All services are running perfectly!${NC}"
        echo -e "${GREEN}🌐 Dashboard: http://localhost:3000${NC}"
    elif [ $healthy_services -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Some services need attention${NC}"
        echo -e "${BLUE}💡 Run ./check_services_health.sh for details${NC}"
    else
        echo -e "${RED}❌ No services are running${NC}"
        echo -e "${BLUE}💡 Run ./start_core_services.sh to start${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}🔄 Auto-refresh: watch -n 30 ./system_status.sh${NC}"
}

# Run main function
main
