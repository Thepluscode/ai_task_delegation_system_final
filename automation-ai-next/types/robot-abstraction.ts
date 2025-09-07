/**
 * Robot Abstraction Protocol (RAP) TypeScript Types
 * Universal interface for controlling diverse robot platforms
 */

// Core Enums
export enum RobotBrand {
  UNIVERSAL_ROBOTS = "universal_robots",
  ABB = "abb",
  KUKA = "kuka",
  FANUC = "fanuc",
  BOSTON_DYNAMICS = "boston_dynamics",
  CUSTOM = "custom"
}

export enum CommandType {
  MOVE_TO_POSITION = "move_to_position",
  PICK_OBJECT = "pick_object",
  PLACE_OBJECT = "place_object",
  EXECUTE_WORKFLOW = "execute_workflow",
  GET_STATUS = "get_status",
  EMERGENCY_STOP = "emergency_stop",
  HOME_POSITION = "home_position",
  CALIBRATE = "calibrate"
}

export enum PrecisionLevel {
  ROUGH = "rough",
  FINE = "fine",
  ULTRA_FINE = "ultra_fine"
}

export enum ObjectType {
  FRAGILE = "fragile",
  STANDARD = "standard",
  HEAVY = "heavy"
}

export enum CommunicationProtocol {
  ETHERNET_IP = "ethernet_ip",
  MODBUS_TCP = "modbus_tcp",
  OPCUA = "opcua",
  ROS = "ros",
  GRPC = "grpc",
  WEBSOCKET = "websocket",
  RTDE = "rtde",
  RWS = "rws"
}

// Removed duplicate CommandType enum

export enum RobotStatus {
  IDLE = "idle",
  MOVING = "moving",
  WORKING = "working",
  ERROR = "error",
  EMERGENCY_STOP = "emergency_stop",
  MAINTENANCE = "maintenance",
  OFFLINE = "offline"
}

// Core Data Types
export interface Position {
  x: number
  y: number
  z: number
  rx?: number  // Rotation around X-axis
  ry?: number  // Rotation around Y-axis
  rz?: number  // Rotation around Z-axis
}

export interface Coordinates {
  x: number
  y: number
  z: number
  rx?: number
  ry?: number
  rz?: number
}

export interface MoveCommand {
  coordinates: number[]  // [x, y, z, rx, ry, rz]
  speed: number  // percentage 0.1-100.0
  precision: PrecisionLevel
  relative?: boolean
}

export interface PickCommand {
  coordinates: number[]  // [x, y, z, rx, ry, rz]
  grip_force: number  // percentage 0.1-100.0
  object_type: ObjectType
  approach_height?: number  // mm above object
}

export interface RobotCapabilities {
  movement: {
    reach_radius?: number
    precision?: number
    max_speed?: number
    acceleration?: number
  }
  sensors: {
    force_feedback?: boolean
    vision_system?: boolean
    collision_detection?: boolean
    joint_torque_sensing?: boolean
  }
  specialized_tools: {
    gripper_types?: string[]
    welding_capability?: boolean
    painting_capability?: boolean
    assembly_capability?: boolean
  }
  communication_protocols: CommunicationProtocol[]
  max_payload: number  // kg
  reach_radius: number  // mm
  degrees_of_freedom: number
  precision_rating: number  // mm
}

export interface RobotConfig {
  robot_id: string
  brand: RobotBrand
  model: string
  ip_address: string
  port?: number
  protocol?: string  // tcp, modbus, ethernet_ip, etc.
  credentials?: Record<string, any>
  custom_config?: Record<string, any>
}

export interface RAPCommand {
  command_id: string
  command_type: CommandType
  parameters: Record<string, any>
  priority?: number  // 1=normal, 2=high, 3=emergency
  timeout?: number   // seconds
  safety_critical?: boolean
}

export interface CommandResult {
  command_id: string
  success: boolean
  result_data?: Record<string, any>
  error_message?: string
  execution_time: number
  timestamp: string  // ISO datetime string
}

export interface RobotStatusResponse {
  robot_id: string
  status: RobotStatus
  current_position?: Position
  battery_level?: number
  error_codes?: string[]
  capabilities?: string[]
  last_updated: string  // ISO datetime string
}

// Extended Robot Information
export interface RobotInfo {
  robot_id: string
  brand: RobotBrand
  model: string
  name: string
  description?: string
  capabilities: string[]
  specifications: RobotSpecifications
  connection_info: ConnectionInfo
  safety_features: SafetyFeatures
  maintenance_info: MaintenanceInfo
}

export interface RobotSpecifications {
  degrees_of_freedom: number
  payload_capacity: number  // kg
  reach: number            // mm
  repeatability: number    // mm
  max_speed: number        // mm/s
  operating_temperature: {
    min: number
    max: number
  }
  power_consumption: number  // watts
  weight: number            // kg
}

export interface ConnectionInfo {
  ip_address: string
  port: number
  protocol: string
  connection_status: 'connected' | 'disconnected' | 'error'
  last_connected: string
  connection_quality: number  // 0-100%
}

export interface SafetyFeatures {
  emergency_stop: boolean
  collision_detection: boolean
  force_limiting: boolean
  safety_zones: boolean
  collaborative_mode: boolean
  safety_rating: string  // e.g., "PLd", "SIL2"
}

export interface MaintenanceInfo {
  last_maintenance: string
  next_maintenance: string
  operating_hours: number
  maintenance_alerts: MaintenanceAlert[]
  health_score: number  // 0-100%
}

export interface MaintenanceAlert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  component: string
  timestamp: string
  acknowledged: boolean
}

// Command Templates and Workflows
export interface CommandTemplate {
  template_id: string
  name: string
  description: string
  command_type: CommandType
  parameter_schema: Record<string, ParameterDefinition>
  compatible_brands: RobotBrand[]
  safety_requirements: string[]
}

export interface ParameterDefinition {
  type: 'number' | 'string' | 'boolean' | 'position' | 'object'
  required: boolean
  default_value?: any
  min_value?: number
  max_value?: number
  description: string
  validation_rules?: string[]
}

export interface Workflow {
  workflow_id: string
  name: string
  description: string
  steps: WorkflowStep[]
  estimated_duration: number  // seconds
  safety_critical: boolean
  compatible_robots: string[]
}

export interface WorkflowStep {
  step_id: string
  command_template_id: string
  parameters: Record<string, any>
  wait_for_completion: boolean
  timeout: number
  error_handling: 'stop' | 'continue' | 'retry'
  retry_count?: number
}

// Performance and Analytics
export interface RobotPerformanceMetrics {
  robot_id: string
  uptime_percentage: number
  average_cycle_time: number
  commands_executed_today: number
  success_rate: number
  error_rate: number
  efficiency_score: number
  utilization_rate: number
  performance_trends: PerformanceTrend[]
}

export interface PerformanceTrend {
  metric: string
  values: number[]
  timestamps: string[]
  trend_direction: 'improving' | 'stable' | 'declining'
  confidence: number
}

export interface SystemAnalytics {
  total_robots: number
  active_robots: number
  total_commands_today: number
  average_response_time: number
  system_efficiency: number
  brand_distribution: Record<RobotBrand, number>
  status_distribution: Record<RobotStatus, number>
  capability_coverage: Record<string, number>
}

// Real-time Monitoring
export interface RobotTelemetry {
  robot_id: string
  timestamp: string
  position: Position
  joint_angles?: number[]
  velocities?: number[]
  forces?: number[]
  temperatures?: number[]
  power_consumption: number
  status_flags: Record<string, boolean>
}

export interface SystemAlert {
  alert_id: string
  robot_id: string
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  type: 'safety' | 'performance' | 'maintenance' | 'communication'
  message: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
  actions_taken?: string[]
}

// API Request/Response Types
export interface ConnectRobotRequest {
  robot_config: RobotConfig
}

export interface ConnectRobotResponse {
  success: boolean
  robot_id: string
  connection_status: string
  capabilities: string[]
  message?: string
}

export interface ExecuteCommandRequest {
  robot_id: string
  command: RAPCommand
}

export interface ExecuteCommandResponse {
  result: CommandResult
  robot_status: RobotStatusResponse
}

export interface ExecuteWorkflowRequest {
  robot_id: string
  workflow: Workflow
  parameters?: Record<string, any>
}

export interface ExecuteWorkflowResponse {
  workflow_id: string
  execution_id: string
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled'
  current_step: number
  total_steps: number
  results: CommandResult[]
  estimated_completion: string
}

// Dashboard and UI Types
export interface RobotDashboardData {
  robots: RobotInfo[]
  system_analytics: SystemAnalytics
  recent_commands: CommandResult[]
  active_workflows: ExecuteWorkflowResponse[]
  system_alerts: SystemAlert[]
  performance_summary: {
    total_uptime: number
    commands_per_hour: number
    average_success_rate: number
    system_health_score: number
  }
}

export interface RobotControlPanelState {
  selected_robot: string | null
  current_command: Partial<RAPCommand>
  command_history: CommandResult[]
  real_time_status: RobotStatusResponse | null
  telemetry_data: RobotTelemetry[]
  connection_status: 'connected' | 'disconnected' | 'connecting'
}

// Configuration and Settings
export interface RAPServiceConfig {
  service_name: string
  version: string
  supported_brands: RobotBrand[]
  default_timeout: number
  max_concurrent_commands: number
  telemetry_interval: number
  safety_settings: SafetySettings
}

export interface SafetySettings {
  emergency_stop_enabled: boolean
  collision_detection_sensitivity: number
  force_limits: Record<string, number>
  safety_zones: SafetyZone[]
  require_confirmation_for_critical: boolean
}

export interface SafetyZone {
  zone_id: string
  name: string
  boundaries: Position[]
  restrictions: string[]
  warning_distance: number
}

// WebSocket Types for Real-time Updates
export interface WebSocketMessage {
  type: 'status_update' | 'telemetry' | 'command_result' | 'alert' | 'workflow_update'
  robot_id: string
  data: any
  timestamp: string
}

export interface StatusUpdateMessage extends WebSocketMessage {
  type: 'status_update'
  data: RobotStatusResponse
}

export interface TelemetryMessage extends WebSocketMessage {
  type: 'telemetry'
  data: RobotTelemetry
}

export interface CommandResultMessage extends WebSocketMessage {
  type: 'command_result'
  data: CommandResult
}

export interface AlertMessage extends WebSocketMessage {
  type: 'alert'
  data: SystemAlert
}

// Utility Types
export type RobotID = string
export type CommandID = string
export type WorkflowID = string
export type AlertID = string

// Form Types for UI
export interface RobotRegistrationForm {
  brand: RobotBrand
  model: string
  name: string
  ip_address: string
  port: number
  protocol: string
  description?: string
}

export interface CommandForm {
  command_type: CommandType
  parameters: Record<string, any>
  priority: number
  timeout: number
  safety_critical: boolean
}

export interface WorkflowForm {
  name: string
  description: string
  steps: Omit<WorkflowStep, 'step_id'>[]
  safety_critical: boolean
}

// Error Types
export interface RAPError {
  error_code: string
  error_message: string
  robot_id?: string
  command_id?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recovery_suggestions?: string[]
}

// Export commonly used unions
export type RobotCommand = RAPCommand
export type RobotResult = CommandResult
export type RobotState = RobotStatusResponse
export type AnyRobotMessage = StatusUpdateMessage | TelemetryMessage | CommandResultMessage | AlertMessage
