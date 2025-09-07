// services/RAPRobotService.ts - Enhanced service with RAP integration
import axios from 'axios';

// API Configuration
const RAP_API_BASE = 'http://localhost:8002'; // Robot Abstraction Protocol Service
const ENHANCED_API_BASE = 'http://localhost:8001'; // Enhanced Robot Control Service

// Robot brand-specific types
export enum RobotBrand {
  UNIVERSAL_ROBOTS = 'universal_robots',
  ABB = 'abb',
  KUKA = 'kuka',
  FANUC = 'fanuc',
  BOSTON_DYNAMICS = 'boston_dynamics',
  CUSTOM = 'custom'
}

export enum RobotStatus {
  IDLE = 'idle',
  MOVING = 'moving',
  WORKING = 'working',
  ERROR = 'error',
  EMERGENCY_STOP = 'emergency_stop',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline'
}

export enum CommandType {
  MOVE_TO_POSITION = 'move_to_position',
  PICK_OBJECT = 'pick_object',
  PLACE_OBJECT = 'place_object',
  EXECUTE_WORKFLOW = 'execute_workflow',
  GET_STATUS = 'get_status',
  EMERGENCY_STOP = 'emergency_stop',
  HOME_POSITION = 'home_position',
  CALIBRATE = 'calibrate'
}

export interface Position {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

export interface RobotConfig {
  robot_id: string;
  brand: RobotBrand;
  model: string;
  ip_address: string;
  port?: number;
  protocol?: string;
  credentials?: Record<string, any>;
}

export interface RAPCommand {
  command_id: string;
  command_type: CommandType;
  robot_id: string;
  parameters: Record<string, any>;
  priority?: number;
  timeout?: number;
  safety_critical?: boolean;
}

export interface MoveCommand {
  coordinates: number[];
  speed: number;
  precision: 'rough' | 'fine' | 'ultra_fine';
  relative: boolean;
}

export interface PickCommand {
  coordinates: number[];
  grip_force: number;
  object_type: 'fragile' | 'standard' | 'heavy';
  approach_height: number;
}

export interface RobotCapabilities {
  movement: Record<string, any>;
  sensors: Record<string, boolean>;
  specialized_tools: Record<string, any>;
  communication_protocols: string[];
  max_payload: number;
  reach_radius: number;
  degrees_of_freedom: number;
  precision_rating: number;
}

export interface FleetOverview {
  total_robots: number;
  online_robots: number;
  offline_robots: number;
  idle_robots: number;
  working_robots: number;
  error_robots: number;
  maintenance_robots: number;
  fleet_efficiency: number;
  total_uptime: number;
}

// Fixed BrandSpecificFeatures interface to include all robot brands
export interface BrandSpecificFeatures {
  [RobotBrand.UNIVERSAL_ROBOTS]: {
    urscript_support: boolean;
    force_control: boolean;
    safety_functions: string[];
    tool_control: boolean;
  };
  [RobotBrand.ABB]: {
    rapid_programming: boolean;
    multi_move: boolean;
    path_planning: boolean;
    work_objects: boolean;
  };
  [RobotBrand.KUKA]: {
    krl_integration: boolean;
    seven_dof_control: boolean;
    safety_monitoring: boolean;
    advanced_programming: boolean;
  };
  [RobotBrand.FANUC]: {
    ladder_logic: boolean;
    teach_pendant: boolean;
    precision_machining: boolean;
    cnc_integration: boolean;
  };
  [RobotBrand.BOSTON_DYNAMICS]: {
    mobile_navigation: boolean;
    terrain_adaptation: boolean;
    object_manipulation: boolean;
    computer_vision: boolean;
  };
  [RobotBrand.CUSTOM]: {
    api_support: boolean;
    custom_protocols: boolean;
    configurable_commands: boolean;
    plugin_architecture: boolean;
  };
}

class RAPRobotService {
  private websocket: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // WebSocket connection for real-time updates
  public connectWebSocket() {
    this.websocket = new WebSocket(`ws://localhost:8002/ws/robots`);
    
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners('robot_update', data);
    };

    this.websocket.onopen = () => {
      console.log('Connected to RAP WebSocket');
    };

    this.websocket.onclose = () => {
      console.log('Disconnected from RAP WebSocket');
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
  public async registerRobot(robotConfig: RobotConfig) {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/register`, robotConfig);
      return response.data;
    } catch (error) {
      console.error('Failed to register robot:', error);
      throw error;
    }
  }

  // Get all robots with filtering
  public async getAllRobots(filters?: {
    status?: RobotStatus;
    brand?: RobotBrand;
    capabilities?: string[];
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.brand) params.append('brand', filters.brand);
      if (filters?.capabilities) {
        filters.capabilities.forEach(cap => params.append('capabilities', cap));
      }

      const response = await axios.get(`${RAP_API_BASE}/api/v1/robots?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get robots:', error);
      throw error;
    }
  }

  // Get robot details with brand-specific information
  public async getRobotDetails(robotId: string) {
    try {
      const response = await axios.get(`${RAP_API_BASE}/api/v1/robots/${robotId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get robot details:', error);
      throw error;
    }
  }

  // Brand-specific command execution
  public async executeRAPCommand(command: RAPCommand) {
    try {
      const response = await axios.post(
        `${RAP_API_BASE}/api/v1/robots/${command.robot_id}/commands`,
        command
      );
      return response.data;
    } catch (error) {
      console.error('Failed to execute RAP command:', error);
      throw error;
    }
  }

  // Movement Controls
  public async moveToPosition(robotId: string, moveParams: MoveCommand) {
    const command: RAPCommand = {
      command_id: `MOVE-${Date.now()}`,
      command_type: CommandType.MOVE_TO_POSITION,
      robot_id: robotId,
      parameters: moveParams,
      safety_critical: true
    };

    return this.executeRAPCommand(command);
  }

  public async moveHome(robotId: string) {
    const command: RAPCommand = {
      command_id: `HOME-${Date.now()}`,
      command_type: CommandType.HOME_POSITION,
      robot_id: robotId,
      parameters: {},
      safety_critical: false
    };

    return this.executeRAPCommand(command);
  }

  // Object Manipulation
  public async pickObject(robotId: string, pickParams: PickCommand) {
    const command: RAPCommand = {
      command_id: `PICK-${Date.now()}`,
      command_type: CommandType.PICK_OBJECT,
      robot_id: robotId,
      parameters: pickParams,
      safety_critical: true
    };

    return this.executeRAPCommand(command);
  }

  public async placeObject(robotId: string, placeParams: {
    coordinates: number[];
    placement_force: number;
    release_condition: string;
  }) {
    const command: RAPCommand = {
      command_id: `PLACE-${Date.now()}`,
      command_type: CommandType.PLACE_OBJECT,
      robot_id: robotId,
      parameters: placeParams,
      safety_critical: true
    };

    return this.executeRAPCommand(command);
  }

  // Brand-specific operations
  public async executeURScript(robotId: string, script: string) {
    try {
      const response = await axios.post(
        `${RAP_API_BASE}/api/v1/robots/${robotId}/urscript`,
        { script }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to execute URScript:', error);
      throw error;
    }
  }

  public async executeRAPID(robotId: string, rapidCode: string) {
    try {
      const response = await axios.post(
        `${RAP_API_BASE}/api/v1/robots/${robotId}/rapid`,
        { code: rapidCode }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to execute RAPID code:', error);
      throw error;
    }
  }

  public async executeKRL(robotId: string, krlCode: string) {
    try {
      const response = await axios.post(
        `${RAP_API_BASE}/api/v1/robots/${robotId}/krl`,
        { code: krlCode }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to execute KRL code:', error);
      throw error;
    }
  }

  // New: FANUC Ladder Logic execution
  public async executeFANUCLadder(robotId: string, ladderCode: string) {
    try {
      const response = await axios.post(
        `${RAP_API_BASE}/api/v1/robots/${robotId}/fanuc-ladder`,
        { code: ladderCode }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to execute FANUC Ladder Logic:', error);
      throw error;
    }
  }

  // New: Custom robot command execution
  public async executeCustomCommand(robotId: string, customCommand: string, parameters: Record<string, any>) {
    try {
      const response = await axios.post(
        `${RAP_API_BASE}/api/v1/robots/${robotId}/custom`,
        { command: customCommand, parameters }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to execute custom command:', error);
      throw error;
    }
  }

  // Fleet Operations
  public async getFleetOverview(): Promise<FleetOverview> {
    try {
      const response = await axios.get(`${RAP_API_BASE}/api/v1/fleet/summary`);
      return response.data;
    } catch (error) {
      console.error('Failed to get fleet overview:', error);
      throw error;
    }
  }

  public async bulkConnect(robotIds: string[]) {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/bulk/connect`, {
        robot_ids: robotIds
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk connect robots:', error);
      throw error;
    }
  }

  public async bulkEmergencyStop(robotIds: string[]) {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/bulk/emergency-stop`, {
        robot_ids: robotIds
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk emergency stop:', error);
      throw error;
    }
  }

  public async bulkHome(robotIds: string[]) {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/bulk/home`, {
        robot_ids: robotIds
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk home robots:', error);
      throw error;
    }
  }

  // Robot capabilities and brand-specific features
  public async getRobotCapabilities(robotId: string): Promise<RobotCapabilities> {
    try {
      const response = await axios.get(`${RAP_API_BASE}/api/v1/robots/${robotId}/capabilities`);
      return response.data.capabilities;
    } catch (error) {
      console.error('Failed to get robot capabilities:', error);
      throw error;
    }
  }

  // Fixed getBrandSpecificFeatures method with proper typing
  public async getBrandSpecificFeatures(brand: RobotBrand): Promise<BrandSpecificFeatures[RobotBrand]> {
    const features: BrandSpecificFeatures = {
      [RobotBrand.UNIVERSAL_ROBOTS]: {
        urscript_support: true,
        force_control: true,
        safety_functions: ['protective_stop', 'safeguard_stop', 'reduced_mode'],
        tool_control: true
      },
      [RobotBrand.ABB]: {
        rapid_programming: true,
        multi_move: true,
        path_planning: true,
        work_objects: true
      },
      [RobotBrand.KUKA]: {
        krl_integration: true,
        seven_dof_control: true,
        safety_monitoring: true,
        advanced_programming: true
      },
      [RobotBrand.FANUC]: {
        ladder_logic: true,
        teach_pendant: true,
        precision_machining: true,
        cnc_integration: true
      },
      [RobotBrand.BOSTON_DYNAMICS]: {
        mobile_navigation: true,
        terrain_adaptation: true,
        object_manipulation: true,
        computer_vision: true
      },
      [RobotBrand.CUSTOM]: {
        api_support: true,
        custom_protocols: true,
        configurable_commands: true,
        plugin_architecture: true
      }
    };

    return features[brand];
  }

  // Performance and analytics
  public async getRobotPerformance(robotId: string, timeRange: string = '24h') {
    try {
      const response = await axios.get(
        `${RAP_API_BASE}/api/v1/robots/${robotId}/performance?range=${timeRange}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get robot performance:', error);
      throw error;
    }
  }

  public async getCommandHistory(robotId: string, limit: number = 50) {
    try {
      const response = await axios.get(
        `${RAP_API_BASE}/api/v1/robots/${robotId}/commands/history?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get command history:', error);
      throw error;
    }
  }

  // Connection management
  public async connectToRobot(robotId: string) {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/${robotId}/connect`);
      return response.data;
    } catch (error) {
      console.error('Failed to connect to robot:', error);
      throw error;
    }
  }

  public async disconnectFromRobot(robotId: string) {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/${robotId}/disconnect`);
      return response.data;
    } catch (error) {
      console.error('Failed to disconnect from robot:', error);
      throw error;
    }
  }

  // Calibration and maintenance
  public async calibrateRobot(robotId: string, calibrationType: string = 'full') {
    const command: RAPCommand = {
      command_id: `CALIB-${Date.now()}`,
      command_type: CommandType.CALIBRATE,
      robot_id: robotId,
      parameters: { type: calibrationType },
      safety_critical: false,
      timeout: 300 // 5 minutes for calibration
    };

    return this.executeRAPCommand(command);
  }

  // Real-time monitoring
  public async startRealTimeMonitoring(robotId: string) {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/${robotId}/monitor/start`);
      return response.data;
    } catch (error) {
      console.error('Failed to start real-time monitoring:', error);
      throw error;
    }
  }

  public async stopRealTimeMonitoring(robotId: string) {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/${robotId}/monitor/stop`);
      return response.data;
    } catch (error) {
      console.error('Failed to stop real-time monitoring:', error);
      throw error;
    }
  }

  // Safety and emergency functions
  public async emergencyStopRobot(robotId: string) {
    const command: RAPCommand = {
      command_id: `ESTOP-${Date.now()}`,
      command_type: CommandType.EMERGENCY_STOP,
      robot_id: robotId,
      parameters: {},
      safety_critical: true,
      priority: 10, // Highest priority
      timeout: 1 // 1 second timeout
    };

    return this.executeRAPCommand(command);
  }

  public async emergencyStopAll() {
    try {
      const response = await axios.post(`${RAP_API_BASE}/api/v1/robots/emergency-stop-all`);
      return response.data;
    } catch (error) {
      console.error('Failed to emergency stop all robots:', error);
      throw error;
    }
  }

  public disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

export default RAPRobotService;