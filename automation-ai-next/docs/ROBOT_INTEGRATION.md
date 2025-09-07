# Robot Abstraction Protocol (RAP) Integration

This document describes the integration between the Next.js frontend and the Robot Abstraction Protocol (RAP) service for universal robot control.

## Overview

The Robot Abstraction Protocol (RAP) provides a universal interface for controlling diverse robot platforms including:

- **Universal Robots** (UR series)
- **ABB** (Industrial robots)
- **KUKA** (Industrial robots)
- **Fanuc** (Industrial robots)
- **Boston Dynamics** (Spot, mobile robots)
- **Custom** (Custom robot implementations)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI   │    │   RAP Service   │    │   Robot Fleet   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Robot Cards │ │◄──►│ │ Universal   │ │◄──►│ │ Universal   │ │
│ │             │ │    │ │ Interface   │ │    │ │ Robots      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Fleet       │ │◄──►│ │ Brand       │ │◄──►│ │ ABB Robots  │ │
│ │ Overview    │ │    │ │ Adapters    │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Control     │ │◄──►│ │ Command     │ │◄──►│ │ KUKA Robots │ │
│ │ Panel       │ │    │ │ Translation │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Components

### 1. Robot Management Pages

#### `/robots` - Main Robot Fleet Page
- **Fleet Overview Tab**: High-level fleet metrics and controls
- **Robot Management Tab**: Individual robot cards and controls
- **Search & Filtering**: Filter by status, brand, capabilities
- **Bulk Operations**: Connect/disconnect, home, emergency stop multiple robots

#### `/robots/[id]` - Individual Robot Control
- **Real-time Status**: Position, battery, error codes
- **Movement Controls**: Position control, home, pick/place operations
- **System Controls**: Calibration, maintenance, configuration

### 2. Core Components

#### `RobotCard`
```jsx
<RobotCard
  robot={robotData}
  selected={isSelected}
  onSelect={handleSelect}
  onViewDetails={handleViewDetails}
/>
```

Features:
- Real-time status indicators
- Brand-specific icons and styling
- Quick action buttons (connect, home, e-stop)
- Battery level and position display
- Error code visualization

#### `FleetOverview`
```jsx
<FleetOverview />
```

Features:
- Fleet-wide metrics (total, online, offline, maintenance)
- Performance analytics
- Bulk fleet operations
- Status distribution charts

#### `RobotControlPanel`
```jsx
<RobotControlPanel
  robotId={robotId}
  onClose={handleClose}
/>
```

Features:
- Real-time robot status
- Movement controls with speed adjustment
- Position input with coordinate system
- Pick/place object controls
- Calibration and maintenance functions

## API Integration

### Robot API Client (`lib/api/robots.js`)

The API client provides methods for all robot operations:

```javascript
import { robotsApi } from '@/lib/api/robots'

// Robot management
const robots = await robotsApi.getAll()
const robot = await robotsApi.getById(id)
const status = await robotsApi.getStatus(id)

// Connection management
await robotsApi.connect(id)
await robotsApi.disconnect(id)

// Movement commands
await robotsApi.moveToPosition(id, position, options)
await robotsApi.moveHome(id)
await robotsApi.emergencyStop(id)

// Object manipulation
await robotsApi.pickObject(id, objectParams)
await robotsApi.placeObject(id, placeParams)

// Fleet operations
await robotsApi.bulkConnect(robotIds)
await robotsApi.bulkEmergencyStop(robotIds)
```

### React Hooks

#### `useRobots(params)`
```javascript
const { robots, isLoading, error, mutate } = useRobots({
  status: 'online',
  brand: 'universal_robots'
})
```

#### `useRobot(id)`
```javascript
const { robot, isLoading, error, mutate } = useRobot(robotId)
```

#### `useRobotStatus(id)`
```javascript
const { status, isLoading, error, mutate } = useRobotStatus(robotId)
```

#### `useRobotOperations()`
```javascript
const {
  loading,
  connectRobot,
  moveToPosition,
  emergencyStop
} = useRobotOperations()
```

#### `useFleet()`
```javascript
const {
  overview,
  status,
  bulkConnect,
  bulkEmergencyStop
} = useFleet()
```

## TypeScript Types

### Core Types (`types/robot.ts`)

```typescript
enum RobotBrand {
  UNIVERSAL_ROBOTS = 'universal_robots',
  ABB = 'abb',
  KUKA = 'kuka',
  FANUC = 'fanuc',
  BOSTON_DYNAMICS = 'boston_dynamics',
  CUSTOM = 'custom'
}

enum RobotStatus {
  IDLE = 'idle',
  MOVING = 'moving',
  WORKING = 'working',
  ERROR = 'error',
  EMERGENCY_STOP = 'emergency_stop',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline'
}

interface Position {
  x: number
  y: number
  z: number
  rx?: number
  ry?: number
  rz?: number
}

interface RobotConfig {
  robot_id: string
  brand: RobotBrand
  model: string
  ip_address: string
  port?: number
  protocol?: string
  credentials?: Record<string, any>
}

interface RAPCommand {
  command_id: string
  command_type: CommandType
  parameters: Record<string, any>
  priority?: number
  timeout?: number
  safety_critical?: boolean
}
```

## Real-time Updates

### WebSocket Integration

The frontend connects to the RAP service via WebSocket for real-time updates:

```javascript
// WebSocket hook for real-time robot status
const { isConnected, lastMessage } = useWebSocket('/ws/robots')

useEffect(() => {
  if (lastMessage) {
    const update = JSON.parse(lastMessage.data)
    if (update.type === 'status_update') {
      mutateRobotStatus(update.robot_id)
    }
  }
}, [lastMessage])
```

### Auto-refresh Strategy

- **Robot Status**: Refreshes every 2 seconds
- **Fleet Overview**: Refreshes every 10 seconds
- **Command Results**: Real-time via WebSocket
- **Error States**: Immediate updates via WebSocket

## Safety Features

### Emergency Stop
- **Individual E-Stop**: Immediately stops single robot
- **Fleet E-Stop**: Stops all connected robots
- **Safety Critical Commands**: Marked with `safety_critical: true`
- **Confirmation Dialogs**: Required for destructive operations

### Error Handling
- **Connection Failures**: Automatic retry with exponential backoff
- **Command Timeouts**: Configurable timeout per command type
- **Error Visualization**: Clear error codes and descriptions
- **Alert System**: Real-time error notifications

## Brand-Specific Features

### Universal Robots
- **URScript Integration**: Direct URScript command execution
- **Force Control**: Configurable force/torque limits
- **Safety Functions**: Protective stop, reduced mode
- **Tool Control**: Digital I/O and tool voltage control

### ABB Robots
- **RAPID Programming**: RAPID code generation and execution
- **Multi-Move**: Coordinated multi-robot movements
- **Path Planning**: Advanced trajectory planning
- **Work Objects**: Configurable coordinate systems

### KUKA Robots
- **KRL Integration**: KUKA Robot Language support
- **7-DOF Control**: Advanced 7-axis robot control
- **Safety Monitoring**: Real-time safety zone monitoring
- **Advanced Programming**: Complex motion programming

### Boston Dynamics Spot
- **Mobile Navigation**: Autonomous navigation commands
- **Terrain Adaptation**: Automatic terrain adaptation
- **Object Manipulation**: Arm control for manipulation tasks
- **Computer Vision**: Integrated vision capabilities

## Configuration

### Environment Variables

```env
# RAP Service Configuration
NEXT_PUBLIC_RAP_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_RAP_WS_URL=ws://localhost:8001/ws

# Robot Fleet Configuration
NEXT_PUBLIC_MAX_ROBOTS=50
NEXT_PUBLIC_DEFAULT_COMMAND_TIMEOUT=30
NEXT_PUBLIC_EMERGENCY_STOP_TIMEOUT=5

# Real-time Updates
NEXT_PUBLIC_STATUS_REFRESH_INTERVAL=2000
NEXT_PUBLIC_FLEET_REFRESH_INTERVAL=10000
```

### API Endpoints

The frontend expects the following RAP service endpoints:

- `GET /robots` - List all robots
- `GET /robots/{id}` - Get robot details
- `GET /robots/{id}/status` - Get robot status
- `POST /robots/{id}/connect` - Connect to robot
- `POST /robots/{id}/disconnect` - Disconnect from robot
- `POST /robots/{id}/commands` - Execute robot command
- `GET /robots/fleet/overview` - Get fleet overview
- `POST /robots/bulk/emergency-stop` - Emergency stop all robots

## Testing

### Component Testing
```bash
npm test components/robot/RobotCard.test.jsx
npm test components/robot/FleetOverview.test.jsx
npm test components/robot/RobotControlPanel.test.jsx
```

### API Testing
```bash
npm test lib/api/robots.test.js
npm test lib/hooks/useRobots.test.js
```

### Integration Testing
```bash
npm test tests/integration/robot-control.test.js
npm test tests/integration/fleet-management.test.js
```

## Deployment

### Production Configuration

1. **Environment Setup**:
   ```bash
   cp .env.example .env.production
   # Configure RAP service URLs
   ```

2. **Build and Deploy**:
   ```bash
   npm run build
   npm start
   ```

3. **Health Checks**:
   - Verify RAP service connectivity
   - Test WebSocket connections
   - Validate robot communications

### Monitoring

- **Robot Connectivity**: Monitor connection status
- **Command Success Rate**: Track command execution success
- **Response Times**: Monitor API response times
- **Error Rates**: Track error frequencies by robot brand

## Troubleshooting

### Common Issues

1. **Robot Connection Failures**:
   - Check network connectivity
   - Verify robot IP addresses
   - Validate credentials

2. **Command Execution Errors**:
   - Check robot status
   - Verify command parameters
   - Review safety constraints

3. **WebSocket Disconnections**:
   - Check network stability
   - Verify WebSocket URL
   - Review connection timeouts

### Debug Tools

- **Robot Status Dashboard**: Real-time status monitoring
- **Command History**: Track executed commands
- **Error Logs**: Detailed error information
- **Network Diagnostics**: Connection testing tools
