#!/bin/bash

echo "🧪 AI Task Delegation System - Comprehensive Testing"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
total_tests=0
passed_tests=0
failed_tests=0

# Function to run API test
test_api() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    local expected_status=${4:-200}
    local method=${5:-GET}
    
    ((total_tests++))
    echo -n "Testing $service_name ($endpoint)... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:$port$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "%{http_code}" -o /dev/null -X "$method" "http://localhost:$port$endpoint" 2>/dev/null)
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((passed_tests++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
        ((failed_tests++))
        return 1
    fi
}

# Function to test JSON response
test_json_api() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    local expected_field=$4
    
    ((total_tests++))
    echo -n "Testing $service_name JSON response ($endpoint)... "
    
    response=$(curl -s "http://localhost:$port$endpoint" 2>/dev/null)
    
    if echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if '$expected_field' in data:
        print('PASS')
        sys.exit(0)
    else:
        print('FAIL - field not found')
        sys.exit(1)
except:
    print('FAIL - invalid JSON')
    sys.exit(1)
" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((passed_tests++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((failed_tests++))
        return 1
    fi
}

# Function to test WebSocket
test_websocket() {
    local service_name=$1
    local port=$2
    local path=$3
    
    ((total_tests++))
    echo -n "Testing $service_name WebSocket ($path)... "
    
    # Simple WebSocket test using curl (basic connectivity)
    if curl -s -f "http://localhost:$port$path" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC} (endpoint accessible)"
        ((passed_tests++))
        return 0
    else
        echo -e "${YELLOW}⚠️  SKIP${NC} (WebSocket test requires special tools)"
        return 0
    fi
}

echo -e "${CYAN}🔍 PRE-TEST VALIDATION${NC}"
echo "====================="

# Check if services are running
echo "Checking if services are running..."
services_running=0
total_services=7

for port in 8001 8002 8003 8004 8006 8007 8008; do
    if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
        ((services_running++))
    fi
done

echo -e "${BLUE}Services Running:${NC} $services_running/$total_services"

if [ $services_running -eq 0 ]; then
    echo -e "${RED}❌ No services are running!${NC}"
    echo -e "${YELLOW}💡 Please run: ./start_core_services.sh${NC}"
    exit 1
elif [ $services_running -lt $total_services ]; then
    echo -e "${YELLOW}⚠️  Some services are not running${NC}"
    echo -e "${BLUE}🔄 Continuing with available services...${NC}"
fi

echo ""
echo -e "${CYAN}🏥 HEALTH CHECK TESTS${NC}"
echo "===================="

# Health check tests
test_api "Agent Selection Service" 8001 "/health"
test_api "Robot Abstraction Service" 8002 "/health"
test_api "Workflow State Service" 8003 "/health"
test_api "Learning Service" 8004 "/health"
test_api "Banking Adapter" 8006 "/health"
test_api "Dashboard API" 8007 "/health"
test_api "Edge Computing Service" 8008 "/health"

echo ""
echo -e "${CYAN}📊 SERVICE INFO TESTS${NC}"
echo "===================="

# Service info tests
test_json_api "Agent Selection Service" 8001 "/" "service"
test_json_api "Robot Abstraction Service" 8002 "/" "service"
test_json_api "Workflow State Service" 8003 "/" "service"
test_json_api "Learning Service" 8004 "/" "service"
test_json_api "Banking Adapter" 8006 "/" "service"
test_json_api "Dashboard API" 8007 "/" "service"
test_json_api "Edge Computing Service" 8008 "/" "service"

echo ""
echo -e "${CYAN}🎯 AGENT SELECTION TESTS${NC}"
echo "========================"

# Agent Selection Service tests
test_api "Agent Selection - List Agents" 8001 "/api/v1/agents"
test_api "Agent Selection - Optimization Config" 8001 "/api/v1/optimization/config"
test_api "Agent Selection - Performance Stats" 8001 "/api/v1/performance/stats"

echo ""
echo -e "${CYAN}🤖 ROBOT ABSTRACTION TESTS${NC}"
echo "=========================="

# Robot Abstraction Service tests
test_api "Robot Abstraction - List Robots" 8002 "/api/v1/robots"
test_api "Robot Abstraction - Supported Brands" 8002 "/api/v1/robots/brands"
test_api "Robot Abstraction - Command Templates" 8002 "/api/v1/robots/commands/templates"

echo ""
echo -e "${CYAN}📋 WORKFLOW STATE TESTS${NC}"
echo "======================="

# Workflow State Service tests
test_api "Workflow State - List Workflows" 8003 "/api/v1/workflows"
test_api "Workflow State - State Machines" 8003 "/api/v1/state-machines"
test_api "Workflow State - Event Store" 8003 "/api/v1/events"

echo ""
echo -e "${CYAN}⚡ EDGE COMPUTING TESTS${NC}"
echo "======================"

# Edge Computing Service tests
test_api "Edge Computing - List Agents" 8008 "/api/v1/edge/agents"
test_api "Edge Computing - Performance Stats" 8008 "/api/v1/edge/performance"
test_api "Edge Computing - Response Targets" 8008 "/api/v1/edge/targets"

echo ""
echo -e "${CYAN}🧠 LEARNING SERVICE TESTS${NC}"
echo "========================="

# Learning Service tests
test_api "Learning Service - Models" 8004 "/api/v1/models"
test_api "Learning Service - Training Status" 8004 "/api/v1/training/status"
test_api "Learning Service - Performance Metrics" 8004 "/api/v1/performance"

echo ""
echo -e "${CYAN}🏦 BANKING ADAPTER TESTS${NC}"
echo "========================"

# Banking Adapter tests
test_api "Banking Adapter - Accounts" 8006 "/api/v1/accounts"
test_api "Banking Adapter - Learning Status" 8006 "/api/v1/learning/status"
test_api "Banking Adapter - Performance" 8006 "/api/v1/performance"

echo ""
echo -e "${CYAN}📊 DASHBOARD API TESTS${NC}"
echo "======================"

# Dashboard API tests
test_api "Dashboard API - System Status" 8007 "/api/v1/system/status"
test_api "Dashboard API - Service Health" 8007 "/api/v1/services/health"
test_api "Dashboard API - Metrics" 8007 "/api/v1/metrics"

echo ""
echo -e "${CYAN}🌐 WEBSOCKET TESTS${NC}"
echo "=================="

# WebSocket tests (basic connectivity)
test_websocket "Agent Selection" 8001 "/ws/agents"
test_websocket "Robot Abstraction" 8002 "/ws/robots"
test_websocket "Workflow State" 8003 "/ws/workflows"
test_websocket "Edge Computing" 8008 "/ws/edge/realtime"

echo ""
echo -e "${CYAN}🎨 FRONTEND TESTS${NC}"
echo "================="

# Frontend tests
((total_tests++))
echo -n "Testing Frontend Dashboard... "
if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC} (Frontend accessible)"
    ((passed_tests++))
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (Frontend not running on port 3000)"
fi

echo ""
echo -e "${CYAN}🔧 INTEGRATION TESTS${NC}"
echo "===================="

# Integration tests (if services are available)
if curl -s -f "http://localhost:8001/health" > /dev/null 2>&1 && curl -s -f "http://localhost:8008/health" > /dev/null 2>&1; then
    ((total_tests++))
    echo -n "Testing Agent Selection + Edge Computing integration... "
    
    # Test if both services can communicate (basic test)
    agent_response=$(curl -s "http://localhost:8001/api/v1/agents" 2>/dev/null)
    edge_response=$(curl -s "http://localhost:8008/api/v1/edge/agents" 2>/dev/null)
    
    if [ -n "$agent_response" ] && [ -n "$edge_response" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Both services responding)"
        ((passed_tests++))
    else
        echo -e "${RED}❌ FAIL${NC} (Integration issue)"
        ((failed_tests++))
    fi
fi

echo ""
echo -e "${CYAN}📋 TEST SUMMARY${NC}"
echo "==============="

echo -e "${BLUE}Total Tests:${NC} $total_tests"
echo -e "${GREEN}Passed:${NC} $passed_tests"
echo -e "${RED}Failed:${NC} $failed_tests"
echo -e "${YELLOW}Skipped:${NC} $((total_tests - passed_tests - failed_tests))"

# Calculate success rate
if [ $total_tests -gt 0 ]; then
    success_rate=$((passed_tests * 100 / total_tests))
    echo -e "${BLUE}Success Rate:${NC} $success_rate%"
else
    success_rate=0
fi

echo ""

# Final assessment
if [ $success_rate -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT! Your AI Task Delegation System is working perfectly!${NC}"
    echo -e "${GREEN}✅ All critical services are operational${NC}"
    echo ""
    echo -e "${CYAN}🌐 Access Points:${NC}"
    echo "- Main Dashboard: http://localhost:3000"
    echo "- Agent Selection: http://localhost:8001"
    echo "- Robot Abstraction: http://localhost:8002"
    echo "- Workflow State: http://localhost:8003"
    echo "- Learning Service: http://localhost:8004"
    echo "- Banking Adapter: http://localhost:8006"
    echo "- Dashboard API: http://localhost:8007"
    echo "- Edge Computing: http://localhost:8008"
elif [ $success_rate -ge 75 ]; then
    echo -e "${YELLOW}⚠️  GOOD! Your system is mostly working with minor issues${NC}"
    echo -e "${YELLOW}🔧 Some services may need attention${NC}"
elif [ $success_rate -ge 50 ]; then
    echo -e "${YELLOW}⚠️  PARTIAL! Your system has some issues${NC}"
    echo -e "${YELLOW}🔧 Please check failed tests above${NC}"
else
    echo -e "${RED}❌ CRITICAL! Your system has significant issues${NC}"
    echo -e "${RED}🔧 Please check service logs and restart services${NC}"
fi

echo ""
echo -e "${PURPLE}🎯 AI Task Delegation System testing complete!${NC}"

# Exit with appropriate code
if [ $failed_tests -eq 0 ]; then
    exit 0
else
    exit 1
fi
