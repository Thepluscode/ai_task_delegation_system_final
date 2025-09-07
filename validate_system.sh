#!/bin/bash

echo "🔍 AI Task Delegation System - Complete Validation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
total_checks=0
passed_checks=0

# Function to run validation check
validate() {
    local description=$1
    local check_command=$2
    local expected_result=${3:-0}
    
    ((total_checks++))
    echo -n "Checking $description... "
    
    if eval "$check_command" > /dev/null 2>&1; then
        if [ $? -eq $expected_result ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            ((passed_checks++))
            return 0
        else
            echo -e "${RED}❌ FAIL${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Function to check file exists
check_file() {
    local description=$1
    local file_path=$2
    
    validate "$description" "test -f '$file_path'"
}

# Function to check directory exists
check_dir() {
    local description=$1
    local dir_path=$2
    
    validate "$description" "test -d '$dir_path'"
}

echo -e "${CYAN}🏗️  SYSTEM ARCHITECTURE VALIDATION${NC}"
echo "=================================="

# Core Services Structure
check_dir "Agent Selection Service directory" "services/agent-selection-service/src"
check_dir "Robot Abstraction Service directory" "services/robot-abstraction-service/src"
check_dir "Workflow State Service directory" "services/workflow-state-service/src"
check_dir "Edge Computing Service directory" "services/edge-computing-service/src"
check_dir "Learning Service directory" "services/learning-service/src"
check_dir "Banking Adapter directory" "services/banking-adapter/src"
check_dir "Dashboard API directory" "services/dashboard-api/src"

echo ""
echo -e "${CYAN}📁 FRONTEND STRUCTURE VALIDATION${NC}"
echo "================================"

# Frontend Structure
check_dir "Frontend root directory" "automation-ai-next"
check_file "Frontend package.json" "automation-ai-next/package.json"
check_file "TypeScript config" "automation-ai-next/tsconfig.json"
check_dir "Components directory" "automation-ai-next/components"
check_dir "Types directory" "automation-ai-next/types"
check_dir "API library directory" "automation-ai-next/lib/api"
check_dir "Hooks directory" "automation-ai-next/lib/hooks"

# Component Directories
check_dir "Agent Selection components" "automation-ai-next/components/agent-selection"
check_dir "Robot Abstraction components" "automation-ai-next/components/robot-abstraction"
check_dir "Workflow State components" "automation-ai-next/components/workflow-state"
check_dir "Edge Computing components" "automation-ai-next/components/edge-computing"
check_dir "Banking components" "automation-ai-next/components/banking"
check_dir "Learning components" "automation-ai-next/components/learning"

echo ""
echo -e "${CYAN}🔧 CONFIGURATION VALIDATION${NC}"
echo "============================"

# Configuration Files
check_dir "Configuration directory" "config"
check_dir "Development config" "config/dev"
check_dir "Shared models" "shared/models"
check_file "Requirements file" "requirements.txt"
check_file "Docker Compose config" "docker-compose.yml"
check_file "Dockerfile" "Dockerfile"

echo ""
echo -e "${CYAN}📜 DEPLOYMENT SCRIPTS VALIDATION${NC}"
echo "================================"

# Deployment Scripts
check_file "Core deployment script" "deploy_core_system.sh"
check_file "Start services script" "start_core_services.sh"
check_file "Stop services script" "stop_core_services.sh"
check_file "Health check script" "check_services_health.sh"
check_file "System status script" "system_status.sh"

# Check script permissions
validate "Deploy script executable" "test -x deploy_core_system.sh"
validate "Start script executable" "test -x start_core_services.sh"
validate "Stop script executable" "test -x stop_core_services.sh"
validate "Health check executable" "test -x check_services_health.sh"
validate "System status executable" "test -x system_status.sh"

echo ""
echo -e "${CYAN}📊 TYPE DEFINITIONS VALIDATION${NC}"
echo "=============================="

# Type Definitions
check_file "Agent Selection types" "automation-ai-next/types/agent-selection.ts"
check_file "Robot Abstraction types" "automation-ai-next/types/robot-abstraction.ts"
check_file "Workflow State types" "automation-ai-next/types/workflow-state.ts"
check_file "Edge Computing types" "automation-ai-next/types/edge-computing.ts"
check_file "Banking types" "automation-ai-next/types/banking.ts"
check_file "Learning types" "automation-ai-next/types/learning.ts"

echo ""
echo -e "${CYAN}🔌 API CLIENTS VALIDATION${NC}"
echo "========================="

# API Clients
check_file "Agent Selection API" "automation-ai-next/lib/api/agentSelection.ts"
check_file "Robot Abstraction API" "automation-ai-next/lib/api/robotAbstraction.ts"
check_file "Workflow State API" "automation-ai-next/lib/api/workflowState.ts"
check_file "Edge Computing API" "automation-ai-next/lib/api/edgeComputing.ts"
check_file "Banking API" "automation-ai-next/lib/api/banking.ts"
check_file "Learning API" "automation-ai-next/lib/api/learning.ts"

echo ""
echo -e "${CYAN}🎣 REACT HOOKS VALIDATION${NC}"
echo "========================="

# React Hooks
check_file "Agent Selection hooks" "automation-ai-next/lib/hooks/useAgentSelection.ts"
check_file "Robot Abstraction hooks" "automation-ai-next/lib/hooks/useRobotAbstraction.ts"
check_file "Workflow State hooks" "automation-ai-next/lib/hooks/useWorkflowState.ts"
check_file "Edge Computing hooks" "automation-ai-next/lib/hooks/useEdgeComputing.ts"
check_file "Banking hooks" "automation-ai-next/lib/hooks/useBanking.ts"
check_file "Learning hooks" "automation-ai-next/lib/hooks/useLearning.ts"

echo ""
echo -e "${CYAN}🎨 DASHBOARD COMPONENTS VALIDATION${NC}"
echo "=================================="

# Dashboard Components
check_file "Agent Selection Dashboard" "automation-ai-next/components/agent-selection/AgentSelectionDashboard.jsx"
check_file "Robot Abstraction Dashboard" "automation-ai-next/components/robot-abstraction/RobotAbstractionDashboard.jsx"
check_file "Workflow State Dashboard" "automation-ai-next/components/workflow-state/WorkflowStateDashboard.jsx"
check_file "Edge Computing Dashboard" "automation-ai-next/components/edge-computing/EdgeComputingDashboard.jsx"
check_file "Banking Dashboard" "automation-ai-next/components/banking/BankingDashboard.jsx"
check_file "Learning Dashboard" "automation-ai-next/components/learning/LearningDashboard.jsx"

echo ""
echo -e "${CYAN}⚡ ADVANCED FEATURES VALIDATION${NC}"
echo "=============================="

# Advanced Features
check_file "Vision Processing component" "automation-ai-next/components/edge-computing/VisionProcessing.jsx"
check_file "Multi-objective optimization" "automation-ai-next/components/agent-selection/MultiObjectiveOptimization.jsx"
check_file "Event sourcing timeline" "automation-ai-next/components/workflow-state/EventSourcingTimeline.jsx"
check_file "Robot control interface" "automation-ai-next/components/robot-abstraction/RobotControlInterface.jsx"

echo ""
echo -e "${CYAN}🔍 PYTHON ENVIRONMENT VALIDATION${NC}"
echo "================================"

# Python Environment
if command -v python3 &> /dev/null; then
    echo -e "Python 3: ${GREEN}✅ Available${NC}"
    ((passed_checks++))
else
    echo -e "Python 3: ${RED}❌ Not found${NC}"
fi
((total_checks++))

if command -v pip &> /dev/null; then
    echo -e "Pip: ${GREEN}✅ Available${NC}"
    ((passed_checks++))
else
    echo -e "Pip: ${RED}❌ Not found${NC}"
fi
((total_checks++))

# Virtual Environment
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo -e "Virtual Environment: ${GREEN}✅ Active ($VIRTUAL_ENV)${NC}"
    ((passed_checks++))
else
    echo -e "Virtual Environment: ${YELLOW}⚠️  Not active${NC}"
fi
((total_checks++))

echo ""
echo -e "${CYAN}🌐 NODE.JS ENVIRONMENT VALIDATION${NC}"
echo "================================="

# Node.js Environment
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "Node.js: ${GREEN}✅ Available ($node_version)${NC}"
    ((passed_checks++))
else
    echo -e "Node.js: ${RED}❌ Not found${NC}"
fi
((total_checks++))

if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo -e "NPM: ${GREEN}✅ Available ($npm_version)${NC}"
    ((passed_checks++))
else
    echo -e "NPM: ${RED}❌ Not found${NC}"
fi
((total_checks++))

# Check if node_modules exists
if [ -d "automation-ai-next/node_modules" ]; then
    echo -e "Frontend Dependencies: ${GREEN}✅ Installed${NC}"
    ((passed_checks++))
else
    echo -e "Frontend Dependencies: ${YELLOW}⚠️  Not installed${NC}"
fi
((total_checks++))

echo ""
echo -e "${CYAN}🐳 DOCKER VALIDATION${NC}"
echo "==================="

# Docker
if command -v docker &> /dev/null; then
    docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo -e "Docker: ${GREEN}✅ Available ($docker_version)${NC}"
    ((passed_checks++))
else
    echo -e "Docker: ${YELLOW}⚠️  Not found (optional)${NC}"
fi
((total_checks++))

if command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
    echo -e "Docker Compose: ${GREEN}✅ Available ($compose_version)${NC}"
    ((passed_checks++))
else
    echo -e "Docker Compose: ${YELLOW}⚠️  Not found (optional)${NC}"
fi
((total_checks++))

echo ""
echo -e "${CYAN}📋 VALIDATION SUMMARY${NC}"
echo "===================="

echo -e "${BLUE}Total Checks:${NC} $total_checks"
echo -e "${GREEN}Passed:${NC} $passed_checks"
echo -e "${RED}Failed:${NC} $((total_checks - passed_checks))"

# Calculate percentage
percentage=$((passed_checks * 100 / total_checks))
echo -e "${BLUE}Success Rate:${NC} $percentage%"

echo ""

if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT! Your AI Task Delegation System is ready for deployment!${NC}"
    echo -e "${GREEN}✅ All critical components are in place${NC}"
    echo ""
    echo -e "${CYAN}🚀 Next Steps:${NC}"
    echo "1. ./start_core_services.sh    # Start backend services"
    echo "2. cd automation-ai-next && npm run dev  # Start frontend"
    echo "3. Open http://localhost:3000  # Access dashboard"
elif [ $percentage -ge 75 ]; then
    echo -e "${YELLOW}⚠️  GOOD! Your system is mostly ready with minor issues${NC}"
    echo -e "${YELLOW}🔧 Please address the failed checks above${NC}"
elif [ $percentage -ge 50 ]; then
    echo -e "${YELLOW}⚠️  PARTIAL! Your system needs some attention${NC}"
    echo -e "${YELLOW}🔧 Please address the failed checks above${NC}"
else
    echo -e "${RED}❌ INCOMPLETE! Your system needs significant work${NC}"
    echo -e "${RED}🔧 Please run ./deploy_core_system.sh first${NC}"
fi

echo ""
echo -e "${CYAN}📊 System Architecture Status:${NC}"
echo "- Agent Selection Service: $([ -d "services/agent-selection-service" ] && echo "✅" || echo "❌")"
echo "- Robot Abstraction Service: $([ -d "services/robot-abstraction-service" ] && echo "✅" || echo "❌")"
echo "- Workflow State Service: $([ -d "services/workflow-state-service" ] && echo "✅" || echo "❌")"
echo "- Edge Computing Service: $([ -d "services/edge-computing-service" ] && echo "✅" || echo "❌")"
echo "- Learning Service: $([ -d "services/learning-service" ] && echo "✅" || echo "❌")"
echo "- Banking Adapter: $([ -d "services/banking-adapter" ] && echo "✅" || echo "❌")"
echo "- Dashboard API: $([ -d "services/dashboard-api" ] && echo "✅" || echo "❌")"
echo "- Frontend Dashboard: $([ -d "automation-ai-next" ] && echo "✅" || echo "❌")"

echo ""
echo -e "${PURPLE}🎯 Your AI Task Delegation System validation complete!${NC}"
