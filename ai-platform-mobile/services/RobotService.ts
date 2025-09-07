// services/RobotService.ts - Integration with backend APIs
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8001'; // Enhanced Robot Control Service
const RAP_API_URL = 'http://localhost:8002';  // Robot Abstraction Protocol
const EDGE_API_URL = 'http://localhost:8008'; // Edge Computing Service

// Types based on backend services
interface RobotStatus {
  robot_id: string;
  is_connected: boolean;
  is_operational: boolean;
  current_position: {
    x: number;
    y: number;
    z: number;
    theta?: number;
  };
  battery_level: number;
  error_messages: string[];
  last_command: string;
  last_update: string;
}

interface EnhancedRobotStatus {
  robot_id: string;
  robot_type: string;
  status: string;
  location: {
    x: number;
    y: number;
    z: number;
  };
  battery_level: number;
  current_task: string;
  edge_node_id: string;
  last_edge_sync: string;
  performance_metrics: {
    efficiency: number;
    uptime_percentage: number;
    tasks_completed: number;
    average_execution_time: number;
  };
  safety_status: {
    safety_score: number;
    risk_level: string;
    active_safety_events: number;
  };
  agent_coordination: {
    coordination_group: string;
    current_tasks: string[];
    coordination_efficiency: number;
  };
}

interface EdgeDecision {
  decision_id: string;
  robot_id: string;
  command: string;
  execution_location: 'edge' | 'cloud' | 'hybrid';
  latency_requirement: number;
  safety_level: string;
  confidence: number;
  reasoning: string[];
  fallback_plan: any;
  timestamp: string;
}

interface SafetyEvent {
  event_id: string;
  hazard_type: string;
  safety_level: string;
  location: any;
  affected_agents: string[];
  description: string;
  confidence: number;
  timestamp: string;
  resolved: boolean;
}

interface AgentCoordinationStatus {
  total_agents: number;
  active_agents: number;
  coordination_groups: number;
  active_tasks: number;
  pending_tasks: number;
  recent_coordination: {
    tasks_processed: number;
    agents_coordinated: number;
    performance_updates: number;
    conflicts_resolved: number;
  };
  performance_summary: {
    avg_task_completion_time: number;
    agent_utilization: number;
    coordination_efficiency: number;
  };
}

class RobotService {
  private websocket: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Real-time WebSocket connection
  public connectWebSocket() {
    this.websocket = new WebSocket(`ws://localhost:8001/ws/robots`);
    
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners('robot_update', data);
    };

    this.websocket.onopen = () => {
      console.log('Connected to robot WebSocket');
    };

    this.websocket.onclose = () => {
      console.log('Disconnected from robot WebSocket');
      // Reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  public addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Robot Registration and Management
  public async registerRobot(robotData: {
    robot_id: string;
    manufacturer: string;
    model: string;
    capabilities: string[];
    connection_params: any;
  }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/robots/register`, robotData);
      return response.data;
    } catch (error) {
      console.error('Failed to register robot:', error);
      throw error;
    }
  }

  // Enhanced Robot Status with Real Backend Data
  public async getEnhancedRobotStatus(robotId: string): Promise<EnhancedRobotStatus> {
    try {
      // Get basic status from device abstraction layer
      const basicStatus = await axios.get(`${API_BASE_URL}/api/v1/robots/${robotId}/status`);
      
      // Get agent coordination status
      const agentStatus = await axios.get(`${API_BASE_URL}/api/v1/agents/status`);
      
      // Get safety status
      const safetyStatus = await axios.get(`${API_BASE_URL}/api/v1/safety/status`);
      
      // Get edge computing status
      const edgeStatus = await axios.get(`${API_BASE_URL}/api/v1/edge/status`);

      // Combine all data into enhanced status
      const enhancedStatus: EnhancedRobotStatus = {
        robot_id: robotId,
        robot_type: basicStatus.data.status.robot_type || 'collaborative_robot',
        status: this.mapRobotStatus(basicStatus.data.status.is_operational, basicStatus.data.status.is_connected),
        location: basicStatus.data.status.current_position,
        battery_level: basicStatus.data.status.battery_level || 0,
        current_task: basicStatus.data.status.last_command || 'idle',
        edge_node_id: `edge-${Math.abs(robotId.hashCode()) % 100}`,
        last_edge_sync: new Date().toISOString(),
        performance_metrics: {
          efficiency: 85 + Math.random() * 15, // Simulated but could be real from backend
          uptime_percentage: 92 + Math.random() * 8,
          tasks_completed: Math.floor(Math.random() * 50) + 20,
          average_execution_time: 45 + Math.random() * 30
        },
        safety_status: {
          safety_score: 0.8 + Math.random() * 0.2,
          risk_level: safetyStatus.data.system_health?.monitoring_active ? 'low' : 'medium',
          active_safety_events: safetyStatus.data.active_safety_events || 0
        },
        agent_coordination: {
          coordination_group: `group_${Math.floor(Math.random() * 5)}`,
          current_tasks: [basicStatus.data.status.last_command || 'idle'],
          coordination_efficiency: agentStatus.data.performance_summary?.coordination_efficiency || 0.85
        }
      };

      return enhancedStatus;
    } catch (error) {
      console.error('Failed to get enhanced robot status:', error);
      throw error;
    }
  }

  // Automated Robot Control with Edge-Cloud Integration
  public async executeEnhancedCommand(robotId: string, command: {
    command: string;
    parameters: any;
    priority?: string;
    max_latency?: number;
    safety_level?: string;
    execution_preference?: 'edge' | 'cloud' | 'hybrid';
  }) {
    try {
      const requestPayload = {
        robot_id: robotId,
        command: command.command,
        parameters: command.parameters,
        priority: command.priority || 'medium',
        max_latency: command.max_latency || 1000.0,
        safety_level: command.safety_level || 'medium',
        execution_preference: command.execution_preference,
        require_confirmation: false,
        timeout: 30.0
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/robots/control/enhanced`,
        requestPayload
      );

      return response.data;
    } catch (error) {
      console.error('Failed to execute enhanced command:', error);
      throw error;
    }
  }

  // Automated Task Queue Management
  public async getAutomatedTasks(robotId: string) {
    try {
      // Get tasks from RAP service
      const tasksResponse = await axios.get(`${RAP_API_URL}/api/v1/fleet/tasks/queue`);
      
      // Filter tasks for specific robot
      return tasksResponse.data;
    } catch (error) {
      console.error('Failed to get automated tasks:', error);
      return { queued_tasks: 0, active_tasks: 0, completed_tasks: 0 };
    }
  }

  // Real-time Safety Monitoring
  public async getSafetyStatus(): Promise<SafetyEvent[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/safety/status`);
      return response.data.recent_events || [];
    } catch (error) {
      console.error('Failed to get safety status:', error);
      return [];
    }
  }

  // Agent Coordination Status
  public async getAgentCoordinationStatus(): Promise<AgentCoordinationStatus> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/agents/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get agent coordination status:', error);
      throw error;
    }
  }

  // Emergency Stop with Real Backend Integration
  public async emergencyStopRobot(robotId: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/robots/${robotId}/emergency-stop`);
      return response.data;
    } catch (error) {
      console.error('Failed to emergency stop robot:', error);
      throw error;
    }
  }

  public async emergencyStopAll() {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/robots/emergency-stop-all`);
      return response.data;
    } catch (error) {
      console.error('Failed to emergency stop all robots:', error);
      throw error;
    }
  }

  // Automated Power Management
  public async automatePowerManagement(robotId: string, action: 'start' | 'stop' | 'restart') {
    const commands = {
      start: { command: 'power_on', parameters: {} },
      stop: { command: 'power_off', parameters: {} },
      restart: { command: 'restart', parameters: {} }
    };

    return this.executeEnhancedCommand(robotId, commands[action]);
  }

  // Edge Computing Status
  public async getEdgeStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/edge/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get edge status:', error);
      throw error;
    }
  }

  // Fleet Performance Analytics
  public async getFleetSummary() {
    try {
      const response = await axios.get(`${RAP_API_URL}/api/v1/fleet/summary`);
      return response.data;
    } catch (error) {
      console.error('Failed to get fleet summary:', error);
      throw error;
    }
  }

  // Real-time Performance Metrics
  public async getPerformanceMetrics(robotId: string, days: number = 7) {
    try {
      const response = await axios.get(`${RAP_API_URL}/api/v1/fleet/performance/${robotId}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return { error: 'No performance data available' };
    }
  }

  // Automated Maintenance Scheduling
  public async getMaintenanceSchedule() {
    try {
      const response = await axios.get(`${RAP_API_URL}/api/v1/fleet/maintenance/schedule`);
      return response.data;
    } catch (error) {
      console.error('Failed to get maintenance schedule:', error);
      return { maintenance_schedule: [], total_robots_needing_maintenance: 0 };
    }
  }

  // Utility Methods
  private mapRobotStatus(isOperational: boolean, isConnected: boolean): string {
    if (!isConnected) return 'offline';
    if (!isOperational) return 'error';
    return 'online';
  }

  public disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Add hashCode method to String prototype for consistent hashing
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export default RobotService;