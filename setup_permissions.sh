#!/bin/bash

echo "🔧 AI Task Delegation System - Setting Up Permissions"
echo "====================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔐 Setting executable permissions for all scripts...${NC}"

# Make all shell scripts executable
chmod +x deploy_core_system.sh
chmod +x start_core_services.sh
chmod +x stop_core_services.sh
chmod +x check_services_health.sh
chmod +x system_status.sh
chmod +x validate_system.sh
chmod +x test_core_system.sh
chmod +x setup_permissions.sh

echo -e "${GREEN}✅ All scripts are now executable${NC}"

echo ""
echo -e "${CYAN}📋 Available Scripts:${NC}"
echo "===================="
echo -e "${BLUE}🚀 deploy_core_system.sh${NC}     - Complete system deployment"
echo -e "${BLUE}▶️  start_core_services.sh${NC}    - Start all backend services"
echo -e "${BLUE}⏹️  stop_core_services.sh${NC}     - Stop all backend services"
echo -e "${BLUE}🏥 check_services_health.sh${NC}  - Quick health check"
echo -e "${BLUE}📊 system_status.sh${NC}          - Comprehensive system status"
echo -e "${BLUE}🔍 validate_system.sh${NC}        - Validate system structure"
echo -e "${BLUE}🧪 test_core_system.sh${NC}       - Test all services"

echo ""
echo -e "${CYAN}🎯 Quick Start Guide:${NC}"
echo "===================="
echo "1. Deploy the system:"
echo "   ./deploy_core_system.sh"
echo ""
echo "2. Start all services:"
echo "   ./start_core_services.sh"
echo ""
echo "3. Start the frontend:"
echo "   cd automation-ai-next"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "4. Validate everything:"
echo "   ./validate_system.sh"
echo "   ./test_core_system.sh"
echo ""
echo "5. Monitor the system:"
echo "   ./system_status.sh"

echo ""
echo -e "${GREEN}🎉 Your AI Task Delegation System is ready for deployment!${NC}"
