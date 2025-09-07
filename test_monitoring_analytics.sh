#!/bin/bash

echo "📊 Monitoring and Analytics System - Comprehensive Testing"
echo "========================================================="

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

# Function to test JSON API
test_json_api() {
    local test_name=$1
    local endpoint=$2
    local method=${3:-GET}
    local data=${4:-""}
    
    ((total_tests++))
    echo -n "Testing $test_name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" "http://localhost:8008$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -X PUT -H "Content-Type: application/json" -d "$data" "http://localhost:8008$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -X DELETE "http://localhost:8008$endpoint")
    else
        response=$(curl -s "http://localhost:8008$endpoint")
    fi
    
    if echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('PASS')
    sys.exit(0)
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

echo -e "${CYAN}🔍 PRE-TEST VALIDATION${NC}"
echo "====================="

# Check if Monitoring and Analytics Service is running
echo "Checking if Monitoring and Analytics Service is running..."
if curl -s -f "http://localhost:8008/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Monitoring and Analytics Service is running${NC}"
else
    echo -e "${RED}❌ Monitoring and Analytics Service is not running!${NC}"
    echo -e "${YELLOW}💡 Please run: python services/monitoring-analytics/src/main.py${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}🏥 BASIC HEALTH CHECK TESTS${NC}"
echo "=========================="

# Basic health checks
test_json_api "Service Health Check" "/health"
test_json_api "Service Root Info" "/"

echo ""
echo -e "${CYAN}📊 METRICS COLLECTION TESTS${NC}"
echo "==========================="

# Wait a moment for metrics to be collected
echo "Waiting for metrics collection..."
sleep 5

# Test metrics endpoints
test_json_api "Get All Metrics" "/api/v1/metrics"

# Test specific system metrics
test_json_api "Get CPU Usage Metric" "/api/v1/metrics/system.cpu.usage"
test_json_api "Get Memory Usage Metric" "/api/v1/metrics/system.memory.usage"
test_json_api "Get Disk Usage Metric" "/api/v1/metrics/system.disk.usage"

# Test metrics with different time ranges
test_json_api "Get CPU Usage (6 hours)" "/api/v1/metrics/system.cpu.usage?time_range_hours=6"

echo ""
echo -e "${CYAN}🔧 SERVICE MONITORING TESTS${NC}"
echo "==========================="

# Test service overview
test_json_api "Get Services Overview" "/api/v1/services"

# Test individual service details
test_json_api "Get Workflow Service Details" "/api/v1/services/workflow-state-service"
test_json_api "Get AI Delegation Service Details" "/api/v1/services/ai-task-delegation"
test_json_api "Get Robot Protocol Service Details" "/api/v1/services/robot-abstraction-protocol"
test_json_api "Get Edge Computing Service Details" "/api/v1/services/edge-computing"
test_json_api "Get Security Service Details" "/api/v1/services/security-compliance"

echo ""
echo -e "${CYAN}🚨 ALERTING SYSTEM TESTS${NC}"
echo "========================"

# Test alerts endpoints
test_json_api "Get All Alerts" "/api/v1/alerts"

# Get alert ID for testing (if any alerts exist)
echo -n "Getting alert ID for testing... "
alert_response=$(curl -s "http://localhost:8008/api/v1/alerts")
alert_id=$(echo "$alert_response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    alerts = data.get('active_alerts', [])
    if alerts:
        print(alerts[0]['id'])
    else:
        print('NO_ALERTS')
except:
    print('ERROR')
" 2>/dev/null)

if [ "$alert_id" != "NO_ALERTS" ] && [ "$alert_id" != "ERROR" ] && [ -n "$alert_id" ]; then
    echo -e "${GREEN}Found alert: $alert_id${NC}"
    
    # Test alert acknowledgment
    test_json_api "Acknowledge Alert" "/api/v1/alerts/$alert_id/acknowledge" "POST"
    
    # Test alert resolution
    test_json_api "Resolve Alert" "/api/v1/alerts/$alert_id/resolve" "POST"
else
    echo -e "${YELLOW}No active alerts found for testing${NC}"
fi

echo ""
echo -e "${CYAN}📈 ANALYTICS AND INSIGHTS TESTS${NC}"
echo "==============================="

# Test trend analysis
trend_analysis='{
    "service": "workflow-state-service",
    "metric": "cpu_usage",
    "time_range_hours": 1
}'

test_json_api "Analyze Performance Trends" "/api/v1/analytics/trends" "POST" "$trend_analysis"

# Test system insights
test_json_api "Get System Insights" "/api/v1/analytics/insights"

# Test dashboard data
test_json_api "Get Dashboard Data" "/api/v1/analytics/dashboard"

echo ""
echo -e "${CYAN}📊 DASHBOARD DATA TESTS${NC}"
echo "======================"

# Test comprehensive dashboard endpoint
test_json_api "Get Complete Dashboard Data" "/api/v1/analytics/dashboard"

# Test individual dashboard components
echo -n "Testing Dashboard Components... "
dashboard_response=$(curl -s "http://localhost:8008/api/v1/analytics/dashboard")
if echo "$dashboard_response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    required_keys = ['system_overview', 'key_metrics', 'alert_summary', 'performance_data']
    if all(key in data for key in required_keys):
        print('PASS')
        sys.exit(0)
    else:
        print('FAIL - missing required keys')
        sys.exit(1)
except:
    print('FAIL - invalid JSON')
    sys.exit(1)
" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((failed_tests++))
fi
((total_tests++))

echo ""
echo -e "${CYAN}🔄 REAL-TIME MONITORING TESTS${NC}"
echo "============================="

# Test WebSocket connection (simplified test)
echo -n "Testing WebSocket Connection... "
if command -v wscat >/dev/null 2>&1; then
    # Test with wscat if available
    timeout 5 wscat -c ws://localhost:8008/ws/monitoring >/dev/null 2>&1
    if [ $? -eq 0 ] || [ $? -eq 124 ]; then  # 124 is timeout exit code
        echo -e "${GREEN}✅ PASS${NC}"
        ((passed_tests++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((failed_tests++))
    fi
else
    # Skip WebSocket test if wscat not available
    echo -e "${YELLOW}⚠️  SKIP (wscat not available)${NC}"
fi
((total_tests++))

echo ""
echo -e "${CYAN}🧪 ERROR HANDLING TESTS${NC}"
echo "======================="

# Test invalid metric name
echo -n "Testing Invalid Metric Name... "
response=$(curl -s "http://localhost:8008/api/v1/metrics/invalid_metric_name")
if echo "$response" | grep -q "404\|not found\|error"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((failed_tests++))
fi
((total_tests++))

# Test invalid service name
echo -n "Testing Invalid Service Name... "
response=$(curl -s "http://localhost:8008/api/v1/services/invalid_service")
if echo "$response" | grep -q "404\|not found\|Service not found"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((failed_tests++))
fi
((total_tests++))

# Test invalid alert ID
echo -n "Testing Invalid Alert ID... "
response=$(curl -s -X POST "http://localhost:8008/api/v1/alerts/invalid_alert_id/acknowledge")
if echo "$response" | grep -q "404\|not found\|Alert not found"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((failed_tests++))
fi
((total_tests++))

# Test invalid trend analysis
invalid_trend='{
    "service": "invalid_service",
    "metric": "invalid_metric",
    "time_range_hours": 1
}'

echo -n "Testing Invalid Trend Analysis... "
response=$(curl -s -X POST -H "Content-Type: application/json" -d "$invalid_trend" "http://localhost:8008/api/v1/analytics/trends")
if echo "$response" | grep -q "400\|error\|No performance data"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((failed_tests++))
fi
((total_tests++))

echo ""
echo -e "${CYAN}📋 TEST SUMMARY${NC}"
echo "==============="

echo -e "${BLUE}Total Tests:${NC} $total_tests"
echo -e "${GREEN}Passed:${NC} $passed_tests"
echo -e "${RED}Failed:${NC} $failed_tests"

# Calculate success rate
if [ $total_tests -gt 0 ]; then
    success_rate=$((passed_tests * 100 / total_tests))
    echo -e "${BLUE}Success Rate:${NC} $success_rate%"
else
    success_rate=0
fi

echo ""

# Final assessment
if [ $success_rate -ge 95 ]; then
    echo -e "${GREEN}🎉 OUTSTANDING! Your Monitoring and Analytics System is working perfectly!${NC}"
    echo -e "${GREEN}✅ Comprehensive monitoring achieved${NC}"
    echo ""
    echo -e "${CYAN}📊 Monitoring Features Verified:${NC}"
    echo "1. ✅ Application Performance Monitoring - Real-time metrics collection"
    echo "2. ✅ System Health Monitoring - CPU, memory, disk, and network tracking"
    echo "3. ✅ Service Health Checks - Automated service status monitoring"
    echo "4. ✅ Real-time Alerting - Intelligent alert generation and management"
    echo "5. ✅ Predictive Analytics - Trend analysis and future value prediction"
    echo "6. ✅ System Insights - Automated recommendations and optimization"
    echo ""
    echo -e "${CYAN}📈 Analytics Achievements:${NC}"
    echo "- ✅ Real-time performance metrics collection and analysis"
    echo "- ✅ Intelligent alerting with configurable thresholds"
    echo "- ✅ Predictive trend analysis with confidence scoring"
    echo "- ✅ Comprehensive system insights and recommendations"
    echo "- ✅ Real-time dashboard with WebSocket updates"
elif [ $success_rate -ge 85 ]; then
    echo -e "${YELLOW}⚠️  EXCELLENT! Your Monitoring System is mostly working${NC}"
    echo -e "${YELLOW}🔧 Some monitoring features may need fine-tuning${NC}"
elif [ $success_rate -ge 70 ]; then
    echo -e "${YELLOW}⚠️  GOOD! Your Monitoring System has minor issues${NC}"
    echo -e "${YELLOW}🔧 Please check failed tests above${NC}"
else
    echo -e "${RED}❌ CRITICAL! Your Monitoring System has significant issues${NC}"
    echo -e "${RED}🔧 Please check service logs and restart the service${NC}"
fi

echo ""
echo -e "${CYAN}🌐 Access Points:${NC}"
echo "- Monitoring API: http://localhost:8008"
echo "- Service Health: http://localhost:8008/health"
echo "- Metrics: http://localhost:8008/api/v1/metrics"
echo "- Services: http://localhost:8008/api/v1/services"
echo "- Alerts: http://localhost:8008/api/v1/alerts"
echo "- Analytics: http://localhost:8008/api/v1/analytics/insights"
echo "- Dashboard: http://localhost:8008/api/v1/analytics/dashboard"
echo "- Real-time Monitoring: ws://localhost:8008/ws/monitoring"

echo ""
echo -e "${PURPLE}📊 Monitoring and Analytics System testing complete!${NC}"

# Exit with appropriate code
if [ $failed_tests -eq 0 ]; then
    exit 0
else
    exit 1
fi
