// utils/mockData.ts
import { RobotBrand, RobotStatus } from '../services/RAPRobotService';

export const mockRobots = [
  {
    robot_id: 'UR5e_001',
    brand: RobotBrand.UNIVERSAL_ROBOTS,
    model: 'UR5e',
    status: RobotStatus.IDLE,
    position: { x: 125.5, y: 200.3, z: 50.0 },
    battery_level: 85,
    capabilities: ['6dof_movement', 'force_control', 'vision'],
    connection_status: 'connected' as const,
    last_command: 'move_to_position',
    performance_metrics: {
      efficiency: 92.5,
      uptime: 98.2,
      tasks_completed: 47,
      error_rate: 0.8
    },
    brand_features: {
      urscript_support: true,
      force_control: true,
      safety_functions: ['protective_stop', 'safeguard_stop'],
      tool_control: true
    }
  },
  {
    robot_id: 'ABB_IRB120_001',
    brand: RobotBrand.ABB,
    model: 'IRB120',
    status: RobotStatus.WORKING,
    position: { x: 300.2, y: 150.7, z: 75.5 },
    battery_level: 92,
    capabilities: ['precision_movement', 'pick_place', 'welding'],
    connection_status: 'connected' as const,
    last_command: 'pick_object',
    performance_metrics: {
      efficiency: 89.1,
      uptime: 96.8,
      tasks_completed: 63,
      error_rate: 1.2
    },
    brand_features: {
      rapid_programming: true,
      multi_move: true,
      path_planning: true,
      work_objects: true
    }
  },
  {
    robot_id: 'KUKA_KR6_001',
    brand: RobotBrand.KUKA,
    model: 'KR6 R900',
    status: RobotStatus.MOVING,
    position: { x: 75.8, y: 320.1, z: 120.3 },
    battery_level: 78,
    capabilities: ['7dof_movement', 'heavy_lifting', 'precision'],
    connection_status: 'connected' as const,
    last_command: 'move_home',
    performance_metrics: {
      efficiency: 87.3,
      uptime: 94.5,
      tasks_completed: 38,
      error_rate: 2.1
    },
    brand_features: {
      krl_integration: true,
      seven_dof_control: true,
      safety_monitoring: true,
      advanced_programming: true
    }
  },
  {
    robot_id: 'FANUC_M20iD_001',
    brand: RobotBrand.FANUC,
    model: 'M-20iD/25',
    status: RobotStatus.MAINTENANCE,
    position: { x: 450.0, y: 100.0, z: 200.0 },
    battery_level: 45,
    capabilities: ['cnc_integration', 'material_handling', 'assembly'],
    connection_status: 'disconnected' as const,
    last_command: 'calibrate',
    performance_metrics: {
      efficiency: 0.0,
      uptime: 85.2,
      tasks_completed: 152,
      error_rate: 0.5
    },
    brand_features: {
      ladder_logic: true,
      teach_pendant: true,
      precision_machining: true,
      cnc_integration: true
    }
  },
  {
    robot_id: 'SPOT_001',
    brand: RobotBrand.BOSTON_DYNAMICS,
    model: 'Spot',
    status: RobotStatus.IDLE,
    position: { x: 500.5, y: 250.8, z: 0.0 },
    battery_level: 67,
    capabilities: ['mobile_navigation', 'inspection', 'manipulation'],
    connection_status: 'connected' as const,
    last_command: 'navigate_to',
    performance_metrics: {
      efficiency: 91.7,
      uptime: 89.3,
      tasks_completed: 23,
      error_rate: 1.8
    },
    brand_features: {
      mobile_navigation: true,
      terrain_adaptation: true,
      object_manipulation: true,
      computer_vision: true
    }
  }
];

export const mockFleetOverview = {
  total_robots: 5,
  online_robots: 4,
  offline_robots: 1,
  idle_robots: 2,
  working_robots: 1,
  error_robots: 0,
  maintenance_robots: 1,
  fleet_efficiency: 88.4,
  total_uptime: 92.8
};

export const mockEdgeStatus = {
  edge_nodes_active: 3,
  total_edge_capacity: 100,
  current_edge_load: 0.45,
  edge_ai_models_loaded: 12,
  performance_metrics: {
    avg_decision_time_ms: 8.5,
    sub_10ms_decisions_percent: 92.3,
    edge_uptime_percent: 98.7
  }
};

export const mockSafetyEvents = [
  {
    event_id: 'SAFE_001',
    hazard_type: 'proximity_warning',
    safety_level: 'medium',
    description: 'Robot approached safety boundary',
    timestamp: new Date().toISOString(),
    resolved: true
  },
  {
    event_id: 'SAFE_002',
    hazard_type: 'collision_avoidance',
    safety_level: 'low',
    description: 'Path replanned to avoid obstacle',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    resolved: true
  }
];

export const mockAgentCoordinationStatus = {
  total_agents: 5,
  active_agents: 4,
  coordination_groups: 2,
  active_tasks: 3,
  pending_tasks: 1,
  recent_coordination: {
    tasks_processed: 15,
    agents_coordinated: 4,
    performance_updates: 8,
    conflicts_resolved: 2
  },
  performance_summary: {
    avg_task_completion_time: 125.7,
    agent_utilization: 0.78,
    coordination_efficiency: 0.91
  }
};

// Enhanced mock robot data for main robot screen
export const mockEnhancedRobots = mockRobots.map((robot, index) => ({
  robot_id: robot.robot_id,
  robot_type: robot.brand,
  status: robot.connection_status === 'connected' ? 'online' : 'offline',
  location: robot.position,
  battery_level: robot.battery_level,
  current_task: robot.last_command,
  edge_node_id: `edge-node-${index + 1}`,
  last_edge_sync: new Date().toISOString(),
  performance_metrics: {
    efficiency: robot.performance_metrics.efficiency,
    uptime_percentage: robot.performance_metrics.uptime,
    tasks_completed: robot.performance_metrics.tasks_completed,
    average_execution_time: 45 + Math.random() * 30
  },
  safety_status: {
    safety_score: 0.85 + Math.random() * 0.15,
    risk_level: robot.status === RobotStatus.ERROR ? 'high' : 'low',
    active_safety_events: robot.status === RobotStatus.ERROR ? 1 : 0
  },
  agent_coordination: {
    coordination_group: `group_${Math.floor(index / 2)}`,
    current_tasks: [robot.last_command],
    coordination_efficiency: 0.85 + Math.random() * 0.1
  },
  manufacturer: robot.brand,
  model: robot.model
}));

// services/OfflineRobotService.ts
export class OfflineRobotService {
  private isOfflineMode = true;
  private mockWebSocketListeners: Map<string, Function[]> = new Map();

  connectWebSocket() {
    if (this.isOfflineMode) {
      console.log('Running in offline mode - WebSocket simulation active');
      // Simulate periodic updates
      setTimeout(() => {
        this.notifyListeners('robot_update', {
          robot_id: 'UR5e_001',
          status: 'online',
          battery_level: 86
        });
      }, 5000);
      return;
    }
  }

  addEventListener(event: string, callback: Function) {
    if (!this.mockWebSocketListeners.has(event)) {
      this.mockWebSocketListeners.set(event, []);
    }
    this.mockWebSocketListeners.get(event)!.push(callback);
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.mockWebSocketListeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  async registerRobot(robotData: any) {
    return { success: true, message: `Robot ${robotData.robot_id} registered` };
  }

  async getEnhancedRobotStatus(robotId: string) {
    const robot = mockEnhancedRobots.find(r => r.robot_id === robotId);
    if (!robot) {
      throw new Error(`Robot ${robotId} not found`);
    }
    return robot;
  }

  async executeEnhancedCommand(robotId: string, command: any) {
    return { 
      success: true, 
      message: `Command ${command.command} executed on ${robotId}`,
      result: { command_id: `CMD-${Date.now()}` }
    };
  }

  async getAutomatedTasks(robotId: string) {
    return { 
      queued_tasks: 2, 
      active_tasks: 1, 
      completed_tasks: mockEnhancedRobots.find(r => r.robot_id === robotId)?.performance_metrics.tasks_completed || 0 
    };
  }

  async getSafetyStatus() {
    return mockSafetyEvents;
  }

  async getAgentCoordinationStatus() {
    return mockAgentCoordinationStatus;
  }

  async emergencyStopRobot(robotId: string) {
    return { success: true, message: `Emergency stop executed on ${robotId}` };
  }

  async emergencyStopAll() {
    const results: Record<string, any> = {};
    mockEnhancedRobots.forEach(robot => {
      results[robot.robot_id] = { success: true };
    });
    return { results };
  }

  async automatePowerManagement(robotId: string, action: string) {
    return { success: true, message: `Power ${action} executed on ${robotId}` };
  }

  async getEdgeStatus() {
    return mockEdgeStatus;
  }

  async getFleetSummary() {
    return {
      total_robots: mockEnhancedRobots.length,
      active_robots: mockEnhancedRobots.filter(r => r.status === 'online').length,
      idle_robots: mockEnhancedRobots.filter(r => r.current_task === 'idle').length,
      error_robots: mockEnhancedRobots.filter(r => r.status === 'error').length,
      maintenance_robots: mockEnhancedRobots.filter(r => r.status === 'maintenance').length,
      average_efficiency: mockEnhancedRobots.reduce((sum, r) => sum + r.performance_metrics.efficiency, 0) / mockEnhancedRobots.length,
      total_uptime: mockEnhancedRobots.reduce((sum, r) => sum + r.performance_metrics.uptime_percentage, 0) / mockEnhancedRobots.length
    };
  }

  async getPerformanceMetrics(robotId: string, days: number = 7) {
    return { 
      efficiency_trend: [85, 87, 89, 91, 88, 92, 90],
      uptime_trend: [95, 96, 94, 98, 97, 99, 96],
      tasks_per_day: [12, 15, 18, 14, 16, 20, 17]
    };
  }

  async getMaintenanceSchedule() {
    return { 
      maintenance_schedule: [
        { robot_id: 'FANUC_M20iD_001', scheduled_date: '2025-01-15', type: 'preventive' }
      ], 
      total_robots_needing_maintenance: 1 
    };
  }

  disconnect() {
    console.log('Offline service disconnected');
  }
}

// services/OfflineRAPService.ts
export class OfflineRAPService {
  private isOfflineMode = true;

  async getAllRobots(filters?: any) {
    let filteredRobots = mockRobots;
    
    if (filters?.brand && filters.brand !== 'all') {
      filteredRobots = filteredRobots.filter(r => r.brand === filters.brand);
    }
    
    if (filters?.status && filters.status !== 'all') {
      filteredRobots = filteredRobots.filter(r => r.status === filters.status);
    }
    
    return { robots: filteredRobots };
  }

  async getFleetOverview() {
    return mockFleetOverview;
  }

  connectWebSocket() {
    console.log('RAP Service running in offline mode - WebSocket simulation');
  }

  disconnect() {
    console.log('RAP offline service disconnected');
  }

  // Mock all command methods
  async connectToRobot(robotId: string) {
    return { success: true, message: `Connected to ${robotId}` };
  }

  async moveHome(robotId: string) {
    return { success: true, message: `${robotId} moving home` };
  }

  async emergencyStopRobot(robotId: string) {
    return { success: true, message: `Emergency stop executed on ${robotId}` };
  }

  async moveToPosition(robotId: string, command: any) {
    return { success: true, message: `Move command sent to ${robotId}` };
  }

  async pickObject(robotId: string, command: any) {
    return { success: true, message: `Pick command sent to ${robotId}` };
  }

  async placeObject(robotId: string, command: any) {
    return { success: true, message: `Place command sent to ${robotId}` };
  }

  async executeURScript(robotId: string, script: string) {
    return { success: true, message: `URScript executed on ${robotId}` };
  }

  async executeRAPID(robotId: string, code: string) {
    return { success: true, message: `RAPID code executed on ${robotId}` };
  }

  async executeKRL(robotId: string, code: string) {
    return { success: true, message: `KRL code executed on ${robotId}` };
  }

  async getBrandSpecificFeatures(brand: any) {
    const robot = mockRobots.find(r => r.brand === brand);
    return robot?.brand_features || {};
  }

  async bulkConnect(robotIds: string[]) {
    return { success: true, message: `Bulk connect executed on ${robotIds.length} robots` };
  }

  async bulkHome(robotIds: string[]) {
    return { success: true, message: `Bulk home executed on ${robotIds.length} robots` };
  }

  async bulkEmergencyStop(robotIds: string[]) {
    return { success: true, message: `Bulk emergency stop executed on ${robotIds.length} robots` };
  }

  addEventListener(event: string, callback: Function) {
    // Mock event listener
  }
}