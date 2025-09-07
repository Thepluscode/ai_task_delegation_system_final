# 📚 **API DOCUMENTATION**
## AI Automation Platform - Complete API Reference

---

## 📋 **OVERVIEW**

The AI Automation Platform provides a comprehensive REST API for managing automation across multiple industries. The API is designed with industry-specific endpoints, social intelligence capabilities, and real-time monitoring.

### **Base URLs**
- **Production**: `https://api.automation-platform.com`
- **Staging**: `https://staging-api.automation-platform.com`
- **Development**: `http://localhost:8000`

### **Authentication**
All API endpoints require authentication using JWT tokens or API keys.

```bash
# JWT Authentication
Authorization: Bearer <jwt_token>

# API Key Authentication
X-API-Key: <api_key>
```

---

## 🎯 **TASK DELEGATION API**

### **POST /api/v1/tasks/delegate**
Delegate a task to the optimal agent using AI-powered selection.

**Request Body:**
```json
{
  "type": "patient_care",
  "industry": "healthcare",
  "priority": "high",
  "complexity": "medium",
  "requirements": ["HIPAA_compliant", "patient_interaction"],
  "estimatedDuration": 45,
  "description": "Assist patient with medication reminder",
  "location": "Room 204",
  "language": "en",
  "culturalContext": "western",
  "requiresHuman": false,
  "requiresCreativity": false,
  "requiresEmpathy": true
}
```

**Response:**
```json
{
  "taskId": "TASK-1703123456789",
  "delegationDecision": {
    "selectedAgent": {
      "id": "SOCIAL-ROBOT-001",
      "type": "social_robot",
      "specialization": "patient_care",
      "availability": 0.92,
      "performance": 0.94
    },
    "confidence": 0.94,
    "reasoning": [
      "Agent specialization matches task requirements",
      "High availability and performance scores",
      "HIPAA compliance verified"
    ],
    "estimatedDuration": 38,
    "riskAssessment": {
      "level": "low",
      "score": 0.15,
      "factors": {
        "complexity": 0.1,
        "industry": 0.05
      }
    }
  },
  "industryContext": {
    "industry": "healthcare",
    "complianceRequirements": ["HIPAA", "Joint Commission"],
    "safetyConsiderations": ["Patient safety protocols", "Infection control"]
  },
  "socialIntelligence": {
    "humanCollaborationRecommended": false,
    "emotionalContext": {
      "emotionalIntelligenceRequired": true,
      "empathyLevel": "high",
      "communicationStyle": "conversational"
    },
    "culturalConsiderations": {
      "languageSupport": "en",
      "culturalContext": "western"
    }
  },
  "status": "delegated",
  "timestamp": "2024-01-20T15:30:45Z"
}
```

### **GET /api/v1/tasks/{taskId}/status**
Get the current status of a delegated task.

**Response:**
```json
{
  "taskId": "TASK-1703123456789",
  "status": "in_progress",
  "progress": 65,
  "currentStep": "Administering medication reminder",
  "estimatedCompletion": "2024-01-20T16:15:00Z",
  "agent": {
    "id": "SOCIAL-ROBOT-001",
    "location": "Room 204",
    "batteryLevel": 0.87
  },
  "qualityMetrics": {
    "accuracy": 0.96,
    "efficiency": 0.92,
    "patientSatisfaction": 4.8
  }
}
```

---

## 🤖 **ROBOT CONTROL API**

### **POST /api/v1/robots/control**
Send control commands to robots with safety validation.

**Request Body:**
```json
{
  "robotId": "SOCIAL-ROBOT-001",
  "command": "navigate_to_location",
  "parameters": {
    "destination": "Room 204",
    "speed": "normal",
    "avoidanceMode": "conservative"
  },
  "industry": "healthcare",
  "safetyOverride": false
}
```

**Response:**
```json
{
  "commandId": "CMD-1703123456789",
  "robotId": "SOCIAL-ROBOT-001",
  "execution": {
    "status": "executing",
    "startTime": "2024-01-20T15:30:45Z",
    "estimatedCompletion": "2024-01-20T15:31:15Z",
    "progress": 0,
    "currentStep": "Initializing navigation"
  },
  "safetyChecks": {
    "emergencyStop": {
      "status": "clear",
      "responseTime": "0.2s"
    },
    "collisionAvoidance": {
      "status": "active",
      "confidence": 0.98
    },
    "humanProximity": {
      "status": "monitoring",
      "humansDetected": 2,
      "safeDistance": true
    }
  },
  "realTimeMonitoring": {
    "enabled": true,
    "sensors": [
      {
        "type": "camera",
        "status": "active",
        "resolution": "4K"
      },
      {
        "type": "lidar",
        "status": "active",
        "range": "10m"
      }
    ]
  }
}
```

### **GET /api/v1/robots**
Get status of all robots in the system.

**Response:**
```json
{
  "totalRobots": 47,
  "activeRobots": 42,
  "robotsByType": {
    "social_robots": 12,
    "industrial_robots": 18,
    "logistics_robots": 15,
    "service_robots": 2
  },
  "performanceMetrics": {
    "averageUptime": 0.967,
    "averageBatteryLevel": 0.78,
    "totalTasksCompleted": 2847,
    "averageEfficiency": 0.94
  },
  "recentActivity": [
    {
      "robotId": "SOCIAL-ROBOT-001",
      "activity": "Completed patient interaction",
      "timestamp": "2024-01-20T15:28:00Z",
      "location": "Room 204"
    }
  ]
}
```

---

## 📊 **ANALYTICS API**

### **GET /api/v1/analytics/insights**
Get AI-generated insights and analytics.

**Query Parameters:**
- `industry` (optional): Filter by industry (healthcare, manufacturing, financial, etc.)
- `timeframe` (optional): Time period (1d, 7d, 30d, 90d)
- `metric` (optional): Specific metric to analyze

**Response:**
```json
{
  "summary": {
    "industry": "healthcare",
    "timeframe": "7d",
    "generatedAt": "2024-01-20T15:30:45Z",
    "totalDataPoints": 52847,
    "confidenceLevel": 0.94
  },
  "performanceInsights": {
    "currentPeriod": {
      "efficiency": 0.91,
      "quality": 0.96,
      "accuracy": 0.98,
      "uptime": 0.97
    },
    "trends": {
      "efficiency": {
        "direction": "up",
        "change": 0.05,
        "significance": "high"
      }
    },
    "keyFindings": [
      "Healthcare automation efficiency improved by 5% over 7d",
      "Quality metrics consistently above industry benchmarks"
    ]
  },
  "predictiveAnalytics": {
    "forecasts": {
      "next7Days": {
        "efficiency": 0.93,
        "costSavings": 45000,
        "confidence": 0.87
      }
    },
    "riskPredictions": [
      {
        "type": "equipment_failure",
        "probability": 0.15,
        "impact": "medium",
        "timeframe": "14 days",
        "mitigation": "Schedule preventive maintenance"
      }
    ]
  },
  "optimizationRecommendations": {
    "immediate": [
      {
        "title": "Optimize Task Delegation Algorithm",
        "impact": "high",
        "estimatedSavings": 25000,
        "timeframe": "1 week"
      }
    ]
  }
}
```

### **POST /api/v1/analytics/custom**
Generate custom analytics based on specific queries.

**Request Body:**
```json
{
  "query": {
    "metrics": ["efficiency", "quality", "cost"],
    "filters": {
      "industry": "healthcare",
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-01-20"
      },
      "agentTypes": ["social_robot", "ai_agent"]
    },
    "groupBy": ["day", "agent_type"],
    "aggregations": ["avg", "sum", "count"]
  },
  "visualizations": ["line_chart", "bar_chart", "heatmap"]
}
```

---

## 🏥 **INDUSTRY-SPECIFIC APIS**

### **Healthcare API**

#### **GET /api/v1/healthcare/dashboard**
Get healthcare-specific dashboard data.

**Response:**
```json
{
  "patientFlow": {
    "currentPatients": 156,
    "admissionsToday": 23,
    "dischargesPlanned": 18,
    "averageStayDuration": 4.2
  },
  "robotDeployment": {
    "socialRobots": 8,
    "activeInteractions": 12,
    "patientSatisfaction": 4.6,
    "complianceScore": 0.98
  },
  "safetyMetrics": {
    "incidentsToday": 0,
    "fallDetectionActive": true,
    "emergencyResponseTime": "2.3 minutes"
  },
  "complianceStatus": {
    "hipaaCompliance": 0.99,
    "jointCommissionReady": true,
    "auditTrailComplete": true
  }
}
```

#### **POST /api/v1/healthcare/patient-interaction**
Record patient-robot interaction for learning.

**Request Body:**
```json
{
  "patientId": "P-12345",
  "robotId": "SOCIAL-ROBOT-001",
  "interactionType": "medication_reminder",
  "duration": 180,
  "emotionDetected": "calm",
  "satisfactionScore": 4.8,
  "complianceAchieved": true,
  "language": "en",
  "culturalContext": "western"
}
```

### **Manufacturing API**

#### **GET /api/v1/manufacturing/dashboard**
Get manufacturing-specific dashboard data.

**Response:**
```json
{
  "productionMetrics": {
    "oee": 0.87,
    "throughput": 2847,
    "qualityRate": 0.96,
    "downtime": 45
  },
  "roboticSystems": {
    "industrialRobots": 18,
    "activeLines": 6,
    "cycleTime": 45.2,
    "accuracy": 0.998
  },
  "qualityControl": {
    "defectRate": 0.02,
    "inspectionAccuracy": 0.99,
    "reworkRate": 0.01
  },
  "predictiveMaintenance": {
    "alertsActive": 3,
    "maintenanceScheduled": 2,
    "equipmentHealth": 0.94
  }
}
```

### **Financial Services API**

#### **GET /api/v1/financial/dashboard**
Get financial services dashboard data.

**Response:**
```json
{
  "tradingMetrics": {
    "tradesExecuted": 15847,
    "averageExecutionTime": "12ms",
    "slippageRate": 0.002,
    "profitLoss": 2850000
  },
  "riskManagement": {
    "var95": 1250000,
    "stressTestResult": "pass",
    "exposureLimit": 0.78,
    "riskScore": 0.23
  },
  "complianceStatus": {
    "soxCompliance": 0.99,
    "mifidCompliance": 0.98,
    "auditReadiness": true
  },
  "algorithmicTrading": {
    "algorithmsActive": 12,
    "successRate": 0.87,
    "marketImpact": 0.003
  }
}
```

---

## 🔔 **REAL-TIME APIS**

### **WebSocket Connections**

#### **Connect to Real-Time Updates**
```javascript
const ws = new WebSocket('wss://api.automation-platform.com/ws');

ws.onopen = function() {
  // Subscribe to specific channels
  ws.send(JSON.stringify({
    action: 'subscribe',
    channels: ['task_updates', 'robot_status', 'alerts']
  }));
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

#### **Real-Time Message Format**
```json
{
  "channel": "task_updates",
  "type": "task_completed",
  "timestamp": "2024-01-20T15:30:45Z",
  "data": {
    "taskId": "TASK-1703123456789",
    "status": "completed",
    "duration": 38,
    "quality": 0.96,
    "agentId": "SOCIAL-ROBOT-001"
  }
}
```

---

## 🔒 **AUTHENTICATION & SECURITY**

### **JWT Token Authentication**

#### **POST /api/v1/auth/login**
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "secure_password",
  "industry": "healthcare"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-123",
    "email": "user@company.com",
    "role": "admin",
    "industry": "healthcare",
    "permissions": ["read", "write", "admin"]
  }
}
```

### **API Rate Limiting**
- **Standard**: 1000 requests per hour
- **Premium**: 10000 requests per hour
- **Enterprise**: Unlimited

### **Error Responses**

#### **Standard Error Format**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "industry",
      "issue": "Must be one of: healthcare, manufacturing, financial, retail, education, logistics"
    },
    "timestamp": "2024-01-20T15:30:45Z",
    "requestId": "req-1703123456789"
  }
}
```

#### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

---

## 📚 **SDK AND LIBRARIES**

### **JavaScript/TypeScript SDK**
```bash
npm install @automation-platform/sdk
```

```javascript
import { AutomationPlatform } from '@automation-platform/sdk';

const client = new AutomationPlatform({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.automation-platform.com'
});

// Delegate a task
const result = await client.tasks.delegate({
  type: 'patient_care',
  industry: 'healthcare',
  priority: 'high'
});
```

### **Python SDK**
```bash
pip install automation-platform-sdk
```

```python
from automation_platform import AutomationClient

client = AutomationClient(
    api_key='your-api-key',
    base_url='https://api.automation-platform.com'
)

# Delegate a task
result = client.tasks.delegate(
    type='patient_care',
    industry='healthcare',
    priority='high'
)
```

---

## 📞 **SUPPORT**

### **API Support**
- **Documentation**: https://docs.automation-platform.com/api
- **Support Email**: api-support@automation-platform.com
- **Developer Forum**: https://developers.automation-platform.com
- **Status Page**: https://status.automation-platform.com

### **Rate Limit Increases**
Contact support for enterprise rate limit increases and custom API requirements.
