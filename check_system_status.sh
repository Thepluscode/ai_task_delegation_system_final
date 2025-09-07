#!/bin/bash

echo "🎯 Final AI Task Delegation System Status:"
echo "=========================================="
echo ""

# Check main demo service
echo "🌐 Main Demo Service (Port 8080):"
if curl -s http://localhost:8080/health >/dev/null 2>&1; then
    echo "   ✅ Active - Enterprise Automation Platform"
else
    echo "   ❌ Not active"
fi
echo ""

# Check individual services
echo "🔧 Microservices Status:"

# Port 8005 - Trading Task Delegation
echo "Port 8005 (Trading):"
if curl -s http://localhost:8005/health >/dev/null 2>&1; then
    echo "   ✅ Active - Trading Task Delegation Service"
else
    echo "   ❌ Not active"
fi

# Port 8006 - Market Signals (changed to 8007)
echo "Port 8007 (Market Signals):"
if curl -s http://localhost:8007/health >/dev/null 2>&1; then
    echo "   ✅ Active - Market Signals & Analysis Service"
else
    echo "   ❌ Not active"
fi

# Port 8008 - Banking Learning Adapter
echo "Port 8008 (Banking):"
if curl -s http://localhost:8008/health >/dev/null 2>&1; then
    echo "   ✅ Active - Banking Learning Service Adapter V2"
else
    echo "   ❌ Not active"
fi

# Check other potential ports
for port in 8001 8002 8003 8004 8006 8009; do
    echo "Port $port:"
    if lsof -i :$port >/dev/null 2>&1; then
        echo "   ✅ Active (Unknown service)"
    else
        echo "   ❌ Not active"
    fi
done

echo ""
echo "📊 Service Summary:"
echo "=================="

# Count active services
active_count=0

if curl -s http://localhost:8080/health >/dev/null 2>&1; then
    ((active_count++))
    echo "✅ Main Platform (8080) - Enterprise Automation Platform"
fi

if curl -s http://localhost:8005/health >/dev/null 2>&1; then
    ((active_count++))
    echo "✅ Trading Service (8005) - HFT & Multi-Asset Trading"
fi

if curl -s http://localhost:8007/health >/dev/null 2>&1; then
    ((active_count++))
    echo "✅ Market Signals (8007) - AI Market Analysis"
fi

if curl -s http://localhost:8008/health >/dev/null 2>&1; then
    ((active_count++))
    echo "✅ Banking Service (8008) - Loan Processing & Risk Assessment"
fi

echo ""
echo "🏆 Total Active Services: $active_count"
echo ""

if [ $active_count -ge 3 ]; then
    echo "🎉 System Status: EXCELLENT - Multi-domain platform operational!"
    echo "🚀 Your Enterprise Automation Platform is ready for production!"
elif [ $active_count -ge 2 ]; then
    echo "✅ System Status: GOOD - Core services operational"
elif [ $active_count -ge 1 ]; then
    echo "⚠️  System Status: PARTIAL - Some services running"
else
    echo "❌ System Status: DOWN - No services detected"
fi

echo ""
echo "🌐 Access Points:"
echo "================"
echo "📊 Main Dashboard: http://localhost:8080"
echo "📖 API Documentation: http://localhost:8080/docs"
echo "🏥 Health Check: http://localhost:8080/health"
echo "💰 Trading API: http://localhost:8005"
echo "📈 Market Signals: http://localhost:8007"
echo "🏦 Banking API: http://localhost:8008"
echo ""
echo "🎯 Platform Capabilities:"
echo "========================"
echo "🏭 Industrial Automation (Robot control, workflow orchestration)"
echo "💰 Financial Trading (HFT algorithms, multi-asset trading)"
echo "📈 Market Intelligence (AI analysis, buy/sell signals)"
echo "🏦 Banking Services (Loan processing, risk assessment)"
echo "🏥 Healthcare AI (Medical analysis, diagnostics)"
echo "🔒 Cybersecurity (Threat detection, compliance)"
echo ""
