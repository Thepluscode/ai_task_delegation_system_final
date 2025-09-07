# Robot Abstraction Protocol (RAP) Integration Guide

This guide explains how to integrate and use the Robot Abstraction Protocol (RAP) service with the Next.js frontend.

## 🤖 Overview

The Robot Abstraction Protocol (RAP) provides a universal interface for controlling diverse robot platforms through a single, consistent API. This integration allows you to manage robots from different manufacturers using the same frontend interface.

### Supported Robot Brands

- **Universal Robots** (UR series) - Collaborative robots with URScript
- **ABB** - Industrial robots with RAPID programming
- **KUKA** - Industrial robots with KRL programming  
- **Fanuc** - Industrial robots with KAREL programming
- **Boston Dynamics** - Mobile robots (Spot) with advanced mobility
- **Custom** - Extensible for custom robot implementations

## 🚀 Quick Start

### 1. Start the RAP Service

First, ensure your RAP service is running:

```bash
# Navigate to your RAP service directory
cd services/robot-abstraction-service

# Install dependencies (if needed)
pip install fastapi uvicorn websockets

# Start the service
python src/main.py
```

The service will start on `http://localhost:8002`

### 2. Configure the Frontend

Update your environment variables:

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the RAP service URLs
NEXT_PUBLIC_RAP_SERVICE_URL="http://localhost:8002"
NEXT_PUBLIC_RAP_API_URL="http://localhost:8002/api/v1"
NEXT_PUBLIC_RAP_WS_URL="ws://localhost:8002"
```

### 3. Start the Frontend

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Navigate to `http://localhost:3000/robots/test` to test the integration.

## 📋 Testing the Integration

### Service Health Check

1. Visit `/robots/test` in your browser
2. Check the "Service Health" card - it should show "Service Online"
3. Verify the "Service Information" shows the correct version and supported brands

### Register a Test Robot

1. Click "Register Robot" button
2. Fill in the robot details:
   - **Robot ID**: `test-ur5e-001`
   - **Brand**: `Universal Robots`
   - **Model**: `UR5e`
   - **IP Address**: `192.168.1.100` (or your robot's IP)
   - **Port**: `30002` (default for UR)
3. Complete the registration process

### Test Robot Commands

Once registered, you can test various commands:

- **Status**: Get current robot status
- **Home**: Send robot to home position
- **Move**: Move robot to a test position
- **E-Stop**: Emergency stop (use with caution!)

## 🔧 API Integration

### Robot Management

```javascript
import { robotsApi } from '@/lib/api/robots'

// Register a new robot
const robotConfig = {
  robot_id: 'ur5e-001',
  brand: 'universal_robots',
  model: 'UR5e',
  ip_address: '192.168.1.100',
  port: 30002,
  protocol: 'tcp'
}

const result = await robotsApi.register(robotConfig)

// Get all registered robots
const robots = await robotsApi.getAll()

// Get robot status
const status = await robotsApi.getStatus('ur5e-001')
```

### Robot Commands

```javascript
// Move robot to position
await robotsApi.moveToPosition('ur5e-001', {
  x: 0.5,
  y: 0.3,
  z: 0.4,
  rx: 0,
  ry: 0,
  rz: 0
}, 0.5) // speed

// Send robot home
await robotsApi.moveHome('ur5e-001')

// Emergency stop
await robotsApi.emergencyStop('ur5e-001')

// Pick object
await robotsApi.pickObject('ur5e-001', 'object-123', 50.0) // grip force
```

### Real-time Updates

```javascript
import { useRobotWebSocket } from '@/lib/hooks/useWebSocket'

function RobotMonitor({ robotId }) {
  const { robotStatus, isConnected } = useRobotWebSocket(robotId)
  
  return (
    <div>
      <p>Connection: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {robotStatus && (
        <div>
          <p>Status: {robotStatus.status}</p>
          <p>Position: {JSON.stringify(robotStatus.current_position)}</p>
          <p>Battery: {robotStatus.battery_level}%</p>
        </div>
      )}
    </div>
  )
}
```

## 🎛️ Frontend Components

### Robot Fleet Management

Navigate to `/robots` to access the main fleet management interface:

- **Fleet Overview Tab**: High-level metrics and fleet-wide controls
- **Robot Management Tab**: Individual robot cards with controls

### Robot Control Panel

Click on any robot card to open the detailed control panel:

- Real-time status monitoring
- Movement controls with speed adjustment
- Pick/place operations
- Emergency stop functionality
- Calibration tools

### Robot Registration

Use the registration form to add new robots:

- Step-by-step wizard interface
- Brand-specific configuration
- Network connectivity testing
- Automatic port and protocol detection

## 🔌 WebSocket Integration

The frontend automatically connects to robot WebSocket endpoints for real-time updates:

```javascript
// WebSocket URL format
ws://localhost:8002/ws/robots/{robot_id}

// Automatic reconnection with exponential backoff
// Real-time status updates every second
// Error handling and connection state management
```

## 🛠️ Customization

### Adding Custom Robot Brands

1. **Backend**: Add new adapter class in the RAP service
2. **Frontend**: Update the `RobotBrand` enum in `types/robot.ts`
3. **UI**: Add brand-specific icons and configurations

### Custom Commands

```javascript
// Execute custom command
const customCommand = {
  command_id: 'custom-001',
  command_type: 'custom_operation',
  parameters: {
    operation: 'special_task',
    value: 42
  },
  priority: 1,
  timeout: 30
}

await robotsApi.executeCustomCommand('robot-id', customCommand)
```

### Brand-Specific Features

Each robot brand has specific capabilities:

```javascript
// Universal Robots - Force control
await robotsApi.executeCustomCommand('ur5e-001', {
  command_type: 'set_force_mode',
  parameters: {
    task_frame: [0, 0, 0, 0, 0, 0],
    selection_vector: [0, 0, 1, 0, 0, 0],
    wrench: [0, 0, -10, 0, 0, 0],
    type: 2,
    limits: [2, 2, 1.5, 1, 1, 1]
  }
})

// Boston Dynamics - Navigation
await robotsApi.executeCustomCommand('spot-001', {
  command_type: 'navigate_to',
  parameters: {
    destination: { x: 10, y: 5 },
    heading: 45
  }
})
```

## 🚨 Safety Features

### Emergency Stop

- Individual robot emergency stop
- Fleet-wide emergency stop
- Confirmation dialogs for safety-critical operations
- Automatic timeout for emergency commands

### Error Handling

- Connection failure recovery
- Command timeout handling
- Real-time error notifications
- Comprehensive error logging

### Safety Zones

```javascript
// Define safety zones (future feature)
const safetyZone = {
  name: 'Restricted Area',
  type: 'emergency_stop',
  coordinates: [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 2 }
  ],
  robot_ids: ['ur5e-001', 'abb-001']
}
```

## 📊 Monitoring and Analytics

### Fleet Metrics

- Total robots registered
- Online/offline status distribution
- Command execution success rates
- Performance analytics

### Robot Metrics

- Uptime tracking
- Command execution times
- Error frequency
- Battery levels (for mobile robots)

## 🔍 Troubleshooting

### Common Issues

1. **Service Connection Failed**
   - Check if RAP service is running on port 8002
   - Verify network connectivity
   - Check firewall settings

2. **Robot Registration Failed**
   - Verify robot IP address and port
   - Check robot network connectivity
   - Ensure robot is powered on

3. **WebSocket Disconnections**
   - Check network stability
   - Verify WebSocket URL configuration
   - Review browser console for errors

4. **Command Execution Errors**
   - Check robot status and connection
   - Verify command parameters
   - Review robot-specific error codes

### Debug Mode

Enable debug mode for detailed logging:

```bash
NEXT_PUBLIC_DEBUG="true"
```

### Health Checks

Monitor service health:

```bash
# Check RAP service health
curl http://localhost:8002/health

# Check service information
curl http://localhost:8002/
```

## 📚 Additional Resources

- [RAP Service API Documentation](./ROBOT_INTEGRATION.md)
- [Robot Brand Specific Guides](./robot-brands/)
- [Safety Guidelines](./SAFETY.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Contributing

To contribute to the RAP integration:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

This integration is part of the AI Automation Platform and follows the same licensing terms.
