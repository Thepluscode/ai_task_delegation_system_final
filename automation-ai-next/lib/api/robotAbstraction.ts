/**
 * Robot Abstraction Protocol (RAP) API Client
 * Universal interface for controlling diverse robot platforms
 */

import { api } from './client'
import { 
  RobotConfig,
  RAPCommand,
  CommandResult,
  RobotStatusResponse,
  RobotInfo,
  RobotBrand,
  CommandType,
  RobotStatus,
  Position,
  SystemAnalytics,
  RobotPerformanceMetrics,
  Workflow,
  ExecuteWorkflowResponse,
  RobotDashboardData,
  ConnectRobotRequest,
  ConnectRobotResponse,
  ExecuteCommandRequest,
  ExecuteCommandResponse
} from '@/types/robot-abstraction'

// Robot Abstraction Protocol API Client
export const robotAbstractionApi = {
  // Base URL for the service
  baseURL: process.env.NEXT_PUBLIC_ROBOT_ABSTRACTION_URL || 'http://localhost:8002',

  // Service Health and Info
  getHealth: async () => {
    const response = await api.get('/health', { baseURL: robotAbstractionApi.baseURL })
    return response.data
  },

  getServiceInfo: async () => {
    const response = await api.get('/', { baseURL: robotAbstractionApi.baseURL })
    return response.data
  },

  // Robot Management
  registerRobot: async (robotConfig: RobotConfig): Promise<ConnectRobotResponse> => {
    const response = await api.post('/api/v1/robots/register', robotConfig, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  unregisterRobot: async (robotId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/v1/robots/${robotId}`, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  getRobotStatus: async (robotId: string): Promise<RobotStatusResponse> => {
    const response = await api.get(`/api/v1/robots/${robotId}/status`, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  listRobots: async (): Promise<{ robots: any[]; total_count: number }> => {
    const response = await api.get('/api/v1/robots', {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  // Command Execution
  executeCommand: async (robotId: string, command: RAPCommand): Promise<CommandResult> => {
    const response = await api.post(`/api/v1/robots/${robotId}/command`, command, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  // Specific Robot Commands
  moveRobot: async (robotId: string, position: Position, speed: number = 0.5): Promise<CommandResult> => {
    const response = await api.post(`/api/v1/robots/${robotId}/move`, {
      ...position,
      speed
    }, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  pickObject: async (robotId: string, objectId: string, gripForce: number = 50.0): Promise<CommandResult> => {
    const response = await api.post(`/api/v1/robots/${robotId}/pick`, {
      object_id: objectId,
      grip_force: gripForce
    }, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  homeRobot: async (robotId: string): Promise<CommandResult> => {
    const response = await api.post(`/api/v1/robots/${robotId}/home`, {}, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  emergencyStopRobot: async (robotId: string): Promise<CommandResult> => {
    const response = await api.post(`/api/v1/robots/${robotId}/emergency-stop`, {}, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  executeWorkflow: async (robotId: string, workflow: Workflow): Promise<ExecuteWorkflowResponse> => {
    const response = await api.post(`/api/v1/robots/${robotId}/workflow`, workflow, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  emergencyStop: async (robotId: string): Promise<CommandResult> => {
    return robotAbstractionApi.emergencyStopRobot(robotId)
  },

  // Analytics and Performance
  getSystemAnalytics: async (): Promise<SystemAnalytics> => {
    const response = await api.get('/api/v1/analytics/system', {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  getRobotPerformance: async (robotId: string): Promise<RobotPerformanceMetrics> => {
    const response = await api.get(`/api/v1/analytics/robots/${robotId}`, {
      baseURL: robotAbstractionApi.baseURL
    })
    return response.data
  },

  // Utility Functions
  createMoveCommand: (position: Position, speed: number = 0.5): RAPCommand => {
    return {
      command_id: `move_${Date.now()}`,
      command_type: CommandType.MOVE_TO_POSITION,
      parameters: {
        position,
        speed,
        acceleration: 1.2
      },
      priority: 1,
      timeout: 30,
      safety_critical: false
    }
  },

  createPickCommand: (objectId?: string, gripForce: number = 50): RAPCommand => {
    return {
      command_id: `pick_${Date.now()}`,
      command_type: CommandType.PICK_OBJECT,
      parameters: {
        object_id: objectId,
        grip_force: gripForce
      },
      priority: 1,
      timeout: 15,
      safety_critical: false
    }
  },

  createPlaceCommand: (position: Position, objectId?: string): RAPCommand => {
    return {
      command_id: `place_${Date.now()}`,
      command_type: CommandType.PLACE_OBJECT,
      parameters: {
        position,
        object_id: objectId
      },
      priority: 1,
      timeout: 15,
      safety_critical: false
    }
  },

  createHomeCommand: (): RAPCommand => {
    return {
      command_id: `home_${Date.now()}`,
      command_type: CommandType.HOME,
      parameters: {},
      priority: 1,
      timeout: 30,
      safety_critical: false
    }
  },

  // WebSocket Connection for Real-time Updates
  subscribeToRobotUpdates: (robotId: string, callback: (data: any) => void) => {
    if (typeof window === 'undefined') return null

    const wsUrl = `${robotAbstractionApi.baseURL.replace('http', 'ws')}/ws/robots/${robotId}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log(`Robot WebSocket connected for ${robotId}`)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('Robot WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log(`Robot WebSocket disconnected for ${robotId}`)
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        robotAbstractionApi.subscribeToRobotUpdates(robotId, callback)
      }, 5000)
    }

    return ws
  },

  subscribeToAllRobots: (callback: (data: any) => void) => {
    if (typeof window === 'undefined') return null

    const wsUrl = `${robotAbstractionApi.baseURL.replace('http', 'ws')}/ws`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('Robot Abstraction WebSocket connected')
      ws.send(JSON.stringify({ type: 'subscribe', channels: ['robot_status', 'telemetry'] }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('Robot Abstraction WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('Robot Abstraction WebSocket disconnected')
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        robotAbstractionApi.subscribeToAllRobots(callback)
      }, 5000)
    }

    return ws
  },

  // Mock Data Generators for Development
  generateMockRobots: (count: number = 5): RobotInfo[] => {
    const brands = Object.values(RobotBrand)
    const models = {
      [RobotBrand.UNIVERSAL_ROBOTS]: ['UR3e', 'UR5e', 'UR10e', 'UR16e'],
      [RobotBrand.ABB]: ['IRB 1200', 'IRB 2600', 'IRB 4600', 'IRB 6700'],
      [RobotBrand.KUKA]: ['KR 3 R540', 'KR 6 R900', 'KR 10 R1100', 'KR 16 R2010'],
      [RobotBrand.FANUC]: ['LR Mate 200iD', 'M-10iD', 'M-20iD', 'R-2000iC'],
      [RobotBrand.BOSTON_DYNAMICS]: ['Spot', 'Atlas', 'Handle'],
      [RobotBrand.CUSTOM]: ['Custom Robot 1', 'Custom Robot 2']
    }

    return Array.from({ length: count }, (_, i) => {
      const brand = brands[i % brands.length]
      const brandModels = models[brand]
      const model = brandModels[i % brandModels.length]
      
      return {
        robot_id: `robot_${i + 1}`,
        brand,
        model,
        name: `${robotAbstractionApi.formatBrandName(brand)} ${model}`,
        description: `${model} industrial robot for automation tasks`,
        capabilities: robotAbstractionApi.getCapabilitiesForBrand(brand),
        specifications: robotAbstractionApi.generateMockSpecifications(brand),
        connection_info: {
          ip_address: `192.168.1.${100 + i}`,
          port: 502 + i,
          protocol: 'tcp',
          connection_status: i % 4 === 0 ? 'disconnected' : 'connected',
          last_connected: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          connection_quality: 85 + Math.random() * 15
        },
        safety_features: {
          emergency_stop: true,
          collision_detection: brand !== RobotBrand.CUSTOM,
          force_limiting: [RobotBrand.UNIVERSAL_ROBOTS, RobotBrand.KUKA].includes(brand),
          safety_zones: true,
          collaborative_mode: brand === RobotBrand.UNIVERSAL_ROBOTS,
          safety_rating: brand === RobotBrand.UNIVERSAL_ROBOTS ? 'PLd' : 'SIL2'
        },
        maintenance_info: {
          last_maintenance: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
          next_maintenance: new Date(Date.now() + Math.random() * 2592000000).toISOString(),
          operating_hours: Math.floor(Math.random() * 10000),
          maintenance_alerts: [],
          health_score: 85 + Math.random() * 15
        }
      }
    })
  },

  generateMockSpecifications: (brand: RobotBrand) => {
    const specs = {
      [RobotBrand.UNIVERSAL_ROBOTS]: {
        degrees_of_freedom: 6,
        payload_capacity: 5,
        reach: 850,
        repeatability: 0.03,
        max_speed: 1000,
        operating_temperature: { min: 0, max: 50 },
        power_consumption: 200,
        weight: 18.4
      },
      [RobotBrand.ABB]: {
        degrees_of_freedom: 6,
        payload_capacity: 7,
        reach: 900,
        repeatability: 0.02,
        max_speed: 1500,
        operating_temperature: { min: 5, max: 45 },
        power_consumption: 300,
        weight: 25
      },
      [RobotBrand.KUKA]: {
        degrees_of_freedom: 7,
        payload_capacity: 10,
        reach: 1100,
        repeatability: 0.02,
        max_speed: 1200,
        operating_temperature: { min: 5, max: 45 },
        power_consumption: 350,
        weight: 30
      },
      [RobotBrand.FANUC]: {
        degrees_of_freedom: 6,
        payload_capacity: 20,
        reach: 1800,
        repeatability: 0.02,
        max_speed: 1000,
        operating_temperature: { min: 0, max: 45 },
        power_consumption: 400,
        weight: 135
      },
      [RobotBrand.BOSTON_DYNAMICS]: {
        degrees_of_freedom: 12,
        payload_capacity: 14,
        reach: 1000,
        repeatability: 0.1,
        max_speed: 1600,
        operating_temperature: { min: -20, max: 45 },
        power_consumption: 500,
        weight: 32
      },
      [RobotBrand.CUSTOM]: {
        degrees_of_freedom: 6,
        payload_capacity: 5,
        reach: 800,
        repeatability: 0.05,
        max_speed: 800,
        operating_temperature: { min: 10, max: 40 },
        power_consumption: 250,
        weight: 20
      }
    }
    
    return specs[brand]
  },

  getCapabilitiesForBrand: (brand: RobotBrand): string[] => {
    const capabilities = {
      [RobotBrand.UNIVERSAL_ROBOTS]: [
        '6dof_movement', 'force_control', 'tool_control', 'safety_functions', 'collaborative_operation'
      ],
      [RobotBrand.ABB]: [
        '6dof_movement', 'high_payload', 'precise_positioning', 'multi_move', 'path_planning'
      ],
      [RobotBrand.KUKA]: [
        '7dof_movement', 'high_precision', 'force_control', 'safety_monitoring', 'advanced_programming'
      ],
      [RobotBrand.FANUC]: [
        '6dof_movement', 'high_payload', 'industrial_grade', 'vision_integration', 'force_sensing'
      ],
      [RobotBrand.BOSTON_DYNAMICS]: [
        'mobile_navigation', 'autonomous_mapping', 'object_manipulation', 'stairs_climbing', 'outdoor_operation', 'computer_vision'
      ],
      [RobotBrand.CUSTOM]: [
        '6dof_movement', 'custom_control', 'flexible_programming'
      ]
    }
    
    return capabilities[brand] || []
  },

  generateMockSystemAnalytics: (): SystemAnalytics => {
    const mockRobots = robotAbstractionApi.generateMockRobots(8)
    
    const brandDistribution = mockRobots.reduce((acc, robot) => {
      acc[robot.brand] = (acc[robot.brand] || 0) + 1
      return acc
    }, {} as Record<RobotBrand, number>)

    const statusDistribution = {
      [RobotStatus.IDLE]: 3,
      [RobotStatus.MOVING]: 2,
      [RobotStatus.WORKING]: 2,
      [RobotStatus.ERROR]: 1,
      [RobotStatus.EMERGENCY_STOP]: 0,
      [RobotStatus.MAINTENANCE]: 0,
      [RobotStatus.OFFLINE]: 0
    }

    const allCapabilities = mockRobots.flatMap(robot => robot.capabilities)
    const capabilityDistribution = allCapabilities.reduce((acc, capability) => {
      acc[capability] = (acc[capability] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total_robots: mockRobots.length,
      active_robots: mockRobots.filter(r => r.connection_info.connection_status === 'connected').length,
      total_commands_today: 156 + Math.floor(Math.random() * 50),
      average_response_time: 0.15 + Math.random() * 0.1,
      system_efficiency: 0.88 + Math.random() * 0.1,
      brand_distribution: brandDistribution,
      status_distribution: statusDistribution,
      capability_coverage: capabilityDistribution
    }
  },

  // Formatting Utilities
  formatBrandName: (brand: RobotBrand): string => {
    const names = {
      [RobotBrand.UNIVERSAL_ROBOTS]: 'Universal Robots',
      [RobotBrand.ABB]: 'ABB',
      [RobotBrand.KUKA]: 'KUKA',
      [RobotBrand.FANUC]: 'FANUC',
      [RobotBrand.BOSTON_DYNAMICS]: 'Boston Dynamics',
      [RobotBrand.CUSTOM]: 'Custom'
    }
    return names[brand] || brand
  },

  formatCommandType: (commandType: CommandType): string => {
    const names = {
      [CommandType.MOVE_TO_POSITION]: 'Move to Position',
      [CommandType.PICK_OBJECT]: 'Pick Object',
      [CommandType.PLACE_OBJECT]: 'Place Object',
      [CommandType.EXECUTE_WORKFLOW]: 'Execute Workflow',
      [CommandType.EMERGENCY_STOP]: 'Emergency Stop',
      [CommandType.GET_STATUS]: 'Get Status',
      [CommandType.CALIBRATE]: 'Calibrate',
      [CommandType.HOME]: 'Home Position'
    }
    return names[commandType] || commandType
  },

  formatRobotStatus: (status: RobotStatus): string => {
    const names = {
      [RobotStatus.IDLE]: 'Idle',
      [RobotStatus.MOVING]: 'Moving',
      [RobotStatus.WORKING]: 'Working',
      [RobotStatus.ERROR]: 'Error',
      [RobotStatus.EMERGENCY_STOP]: 'Emergency Stop',
      [RobotStatus.MAINTENANCE]: 'Maintenance',
      [RobotStatus.OFFLINE]: 'Offline'
    }
    return names[status] || status
  },

  getBrandColor: (brand: RobotBrand): string => {
    const colors = {
      [RobotBrand.UNIVERSAL_ROBOTS]: '#0066CC',  // Blue
      [RobotBrand.ABB]: '#FF6600',              // Orange
      [RobotBrand.KUKA]: '#FF9900',             // Yellow-Orange
      [RobotBrand.FANUC]: '#FFCC00',            // Yellow
      [RobotBrand.BOSTON_DYNAMICS]: '#00CC66',  // Green
      [RobotBrand.CUSTOM]: '#9966CC'            // Purple
    }
    return colors[brand] || '#6B7280'
  },

  getStatusColor: (status: RobotStatus): string => {
    const colors = {
      [RobotStatus.IDLE]: '#10B981',           // Green
      [RobotStatus.MOVING]: '#3B82F6',         // Blue
      [RobotStatus.WORKING]: '#8B5CF6',        // Purple
      [RobotStatus.ERROR]: '#EF4444',          // Red
      [RobotStatus.EMERGENCY_STOP]: '#DC2626', // Dark Red
      [RobotStatus.MAINTENANCE]: '#F59E0B',    // Orange
      [RobotStatus.OFFLINE]: '#6B7280'         // Gray
    }
    return colors[status] || '#6B7280'
  },

  getCommandTypeIcon: (commandType: CommandType): string => {
    const icons = {
      [CommandType.MOVE_TO_POSITION]: 'ArrowRightIcon',
      [CommandType.PICK_OBJECT]: 'HandRaisedIcon',
      [CommandType.PLACE_OBJECT]: 'HandThumbDownIcon',
      [CommandType.EXECUTE_WORKFLOW]: 'PlayIcon',
      [CommandType.EMERGENCY_STOP]: 'StopIcon',
      [CommandType.GET_STATUS]: 'InformationCircleIcon',
      [CommandType.CALIBRATE]: 'AdjustmentsHorizontalIcon',
      [CommandType.HOME]: 'HomeIcon'
    }
    return icons[commandType] || 'CogIcon'
  },

  // Position Utilities
  formatPosition: (position: Position): string => {
    return `X:${position.x.toFixed(1)} Y:${position.y.toFixed(1)} Z:${position.z.toFixed(1)}`
  },

  calculateDistance: (pos1: Position, pos2: Position): number => {
    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    const dz = pos2.z - pos1.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  },

  // Validation Utilities
  validatePosition: (position: Position): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (typeof position.x !== 'number' || isNaN(position.x)) {
      errors.push('X coordinate must be a valid number')
    }
    if (typeof position.y !== 'number' || isNaN(position.y)) {
      errors.push('Y coordinate must be a valid number')
    }
    if (typeof position.z !== 'number' || isNaN(position.z)) {
      errors.push('Z coordinate must be a valid number')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  validateCommand: (command: RAPCommand): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!command.command_id || command.command_id.trim() === '') {
      errors.push('Command ID is required')
    }
    
    if (!Object.values(CommandType).includes(command.command_type)) {
      errors.push('Invalid command type')
    }
    
    if (command.timeout && command.timeout <= 0) {
      errors.push('Timeout must be positive')
    }
    
    if (command.priority && (command.priority < 1 || command.priority > 3)) {
      errors.push('Priority must be between 1 and 3')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
