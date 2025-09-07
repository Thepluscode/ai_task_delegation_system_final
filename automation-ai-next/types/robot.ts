// Robot Abstraction Protocol (RAP) TypeScript Types

export enum RobotBrand {
  UNIVERSAL_ROBOTS = 'universal_robots',
  ABB = 'abb',
  KUKA = 'kuka',
  FANUC = 'fanuc',
  BOSTON_DYNAMICS = 'boston_dynamics',
  CUSTOM = 'custom',
}

export enum CommandType {
  MOVE_TO_POSITION = 'move_to_position',
  PICK_OBJECT = 'pick_object',
  PLACE_OBJECT = 'place_object',
  EXECUTE_WORKFLOW = 'execute_workflow',
  EMERGENCY_STOP = 'emergency_stop',
  GET_STATUS = 'get_status',
  CALIBRATE = 'calibrate',
  HOME = 'home',
}

export enum RobotStatus {
  IDLE = 'idle',
  MOVING = 'moving',
  WORKING = 'working',
  ERROR = 'error',
  EMERGENCY_STOP = 'emergency_stop',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
}

export interface Position {
  x: number
  y: number
  z: number
  rx?: number // Rotation around X-axis
  ry?: number // Rotation around Y-axis
  rz?: number // Rotation around Z-axis
}

export interface RobotConfig {
  robot_id: string
  brand: RobotBrand
  model: string
  ip_address: string
  port?: number
  protocol?: string
  credentials?: Record<string, any>
  custom_config?: Record<string, any>
}

export interface RAPCommand {
  command_id: string
  command_type: CommandType
  parameters: Record<string, any>
  priority?: number // 1=normal, 2=high, 3=emergency
  timeout?: number // seconds
  safety_critical?: boolean
}

export interface CommandResult {
  command_id: string
  success: boolean
  result_data?: Record<string, any>
  error_message?: string
  execution_time: number
  timestamp: string
}

export interface RobotStatusResponse {
  robot_id: string
  status: RobotStatus
  current_position?: Position
  battery_level?: number
  error_codes?: string[]
  capabilities?: string[]
  last_updated: string
}

// Extended types for UI components
export interface RobotCard {
  id: string
  name: string
  brand: RobotBrand
  model: string
  status: RobotStatus
  current_position?: Position
  battery_level?: number
  last_seen: string
  capabilities: string[]
  is_connected: boolean
  error_codes?: string[]
}

export interface RobotCommand {
  id: string
  robot_id: string
  command_type: CommandType
  parameters: Record<string, any>
  status: 'pending' | 'executing' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  error_message?: string
  execution_time?: number
}

export interface RobotMetrics {
  robot_id: string
  uptime: number
  commands_executed: number
  success_rate: number
  average_execution_time: number
  error_count: number
  last_maintenance: string
  next_maintenance: string
}

export interface FleetOverview {
  total_robots: number
  online_robots: number
  offline_robots: number
  error_robots: number
  maintenance_robots: number
  active_commands: number
  completed_commands_today: number
  fleet_efficiency: number
}

// Command parameter types for different robot brands
export interface URCommandParams {
  position?: Position
  speed?: number
  acceleration?: number
  blend_radius?: number
  force?: number
  torque?: number
}

export interface ABBCommandParams {
  position?: Position
  speed?: number
  zone?: string
  tool?: string
  work_object?: string
}

export interface KUKACommandParams {
  position?: Position
  velocity?: number
  acceleration?: number
  jerk?: number
  advance?: number
}

export interface SpotCommandParams {
  position?: Position
  heading?: number
  velocity?: number
  object_id?: string
  action?: string
}

// WebSocket message types for real-time updates
export interface RobotWebSocketMessage {
  type: 'status_update' | 'command_result' | 'error' | 'connection_change'
  robot_id: string
  data: any
  timestamp: string
}

// Robot fleet management types
export interface FleetCommand {
  command_id: string
  robot_ids: string[]
  command_type: CommandType
  parameters: Record<string, any>
  coordination_type: 'parallel' | 'sequential' | 'synchronized'
  priority: number
}

export interface RobotGroup {
  id: string
  name: string
  description: string
  robot_ids: string[]
  created_at: string
  updated_at: string
}

// Safety and monitoring types
export interface SafetyZone {
  id: string
  name: string
  type: 'restricted' | 'warning' | 'emergency_stop'
  coordinates: Position[]
  active: boolean
  robot_ids: string[]
}

export interface RobotAlert {
  id: string
  robot_id: string
  type: 'warning' | 'error' | 'maintenance' | 'safety'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  acknowledged: boolean
  resolved: boolean
}

// Calibration and maintenance types
export interface CalibrationData {
  robot_id: string
  calibration_type: 'tool' | 'base' | 'joint' | 'vision'
  parameters: Record<string, any>
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  results?: Record<string, any>
}

export interface MaintenanceSchedule {
  robot_id: string
  maintenance_type: 'preventive' | 'corrective' | 'emergency'
  scheduled_date: string
  estimated_duration: number
  description: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  technician?: string
}

// Robot program and workflow types
export interface RobotProgram {
  id: string
  name: string
  description: string
  robot_brand: RobotBrand
  program_code: string
  parameters: Record<string, any>
  created_at: string
  updated_at: string
  version: number
}

export interface WorkflowStep {
  id: string
  step_number: number
  command_type: CommandType
  parameters: Record<string, any>
  expected_duration: number
  safety_checks: string[]
  error_handling: Record<string, any>
}

export interface RobotWorkflow {
  id: string
  name: string
  description: string
  robot_ids: string[]
  steps: WorkflowStep[]
  status: 'draft' | 'active' | 'paused' | 'completed' | 'error'
  created_at: string
  updated_at: string
}
