// Agent Selection Service TypeScript Types

export enum AgentType {
  ROBOT = 'robot',
  HUMAN = 'human',
  AI_SYSTEM = 'ai_system',
  HYBRID = 'hybrid',
}

export enum TaskPriority {
  SAFETY_CRITICAL = 'safety_critical',
  QUALITY_CRITICAL = 'quality_critical',
  EFFICIENCY_CRITICAL = 'efficiency_critical',
  STANDARD = 'standard',
}

export interface AgentCapability {
  capability_type: string
  proficiency_level: number // 0.0 to 1.0
  confidence: number // 0.0 to 1.0
  last_assessed: string
}

export interface Agent {
  agent_id: string
  agent_type: AgentType
  name: string
  capabilities: Record<string, AgentCapability>
  current_status: 'available' | 'busy' | 'maintenance' | 'offline'
  location?: string
  cost_per_hour: number
  energy_consumption: number // kW/h
  safety_rating: number // 0.0 to 1.0
  current_workload: number // 0.0 to 1.0
}

export interface TaskRequirement {
  requirement_type: string
  minimum_proficiency: number
  weight: number // Importance weight 0.0 to 1.0
}

export interface Task {
  task_id: string
  task_type: string
  priority: TaskPriority
  requirements: TaskRequirement[]
  estimated_duration: number // minutes
  deadline?: string
  complexity_score: number // 0.0 to 1.0
  safety_critical: boolean
  location?: string
}

export interface OptimizationObjective {
  name: string
  weight: number
  maximize: boolean
}

export interface TaskAssignment {
  task_id: string
  assigned_agent_id: string
  confidence_score: number
  estimated_completion_time: string
  optimization_scores: Record<string, number>
  reasoning: string
  assignment_timestamp: string
}

// Extended types for UI components
export interface AgentCard {
  id: string
  name: string
  type: AgentType
  status: Agent['current_status']
  capabilities: string[]
  workload: number
  cost_per_hour: number
  safety_rating: number
  location?: string
  last_active: string
}

export interface TaskCard {
  id: string
  title: string
  type: string
  priority: TaskPriority
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
  estimated_duration: number
  complexity: number
  safety_critical: boolean
  requirements: TaskRequirement[]
  assigned_agent?: string
  created_at: string
  deadline?: string
}

export interface AssignmentResult {
  assignment: TaskAssignment
  alternative_agents?: Array<{
    agent_id: string
    confidence_score: number
    reasoning: string
  }>
  optimization_details: {
    total_agents_evaluated: number
    capable_agents: number
    optimization_time_ms: number
  }
}

export interface AgentPerformance {
  agent_id: string
  total_assignments: number
  average_confidence: number
  success_rate: number
  average_completion_time: number
  recent_assignments: TaskAssignment[]
  performance_trend: Array<{
    date: string
    success_rate: number
    average_confidence: number
  }>
}

export interface CapabilityMatrix {
  [agentType: string]: Record<string, number>
}

export interface OptimizationConfig {
  objectives: Record<string, OptimizationObjective>
  weights_sum: number
  last_updated: string
}

// Fleet management types
export interface FleetOverview {
  total_agents: number
  available_agents: number
  busy_agents: number
  offline_agents: number
  maintenance_agents: number
  pending_tasks: number
  active_assignments: number
  completed_tasks_today: number
  average_utilization: number
  fleet_efficiency: number
}

export interface AgentUtilization {
  agent_id: string
  agent_name: string
  current_workload: number
  tasks_completed_today: number
  average_task_duration: number
  efficiency_score: number
  cost_effectiveness: number
}

// Task delegation types
export interface DelegationRequest {
  task: Task
  preferred_agent_types?: AgentType[]
  exclude_agents?: string[]
  optimization_preferences?: {
    prioritize_speed?: boolean
    prioritize_quality?: boolean
    prioritize_cost?: boolean
    prioritize_safety?: boolean
  }
  deadline_strict?: boolean
}

export interface DelegationResponse {
  success: boolean
  assignment?: TaskAssignment
  alternatives?: Array<{
    agent_id: string
    confidence_score: number
    estimated_completion: string
    reasoning: string
  }>
  error_message?: string
  recommendations?: string[]
}

// Analytics and reporting types
export interface TaskAnalytics {
  total_tasks: number
  completed_tasks: number
  failed_tasks: number
  average_completion_time: number
  success_rate: number
  cost_efficiency: number
  agent_utilization: Record<string, number>
  task_distribution: Record<TaskPriority, number>
  capability_demand: Record<string, number>
}

export interface AgentAnalytics {
  agent_id: string
  performance_score: number
  reliability_score: number
  efficiency_score: number
  cost_effectiveness: number
  specializations: string[]
  improvement_areas: string[]
  recommended_training: string[]
}

// Real-time monitoring types
export interface SystemStatus {
  service_health: 'healthy' | 'degraded' | 'down'
  active_assignments: number
  queue_length: number
  average_response_time: number
  error_rate: number
  last_updated: string
}

export interface AlertConfig {
  id: string
  name: string
  condition: string
  threshold: number
  enabled: boolean
  notification_channels: string[]
}

export interface SystemAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
  related_agent?: string
  related_task?: string
}

// Configuration types
export interface ServiceConfig {
  optimization_objectives: Record<string, OptimizationObjective>
  capability_matrix: CapabilityMatrix
  performance_thresholds: {
    minimum_confidence: number
    maximum_response_time: number
    minimum_success_rate: number
  }
  alert_settings: AlertConfig[]
  integration_settings: {
    robot_service_url: string
    workflow_service_url: string
    notification_service_url: string
  }
}

// Search and filtering types
export interface AgentFilter {
  types?: AgentType[]
  statuses?: Agent['current_status'][]
  capabilities?: string[]
  min_safety_rating?: number
  max_cost_per_hour?: number
  locations?: string[]
  min_workload?: number
  max_workload?: number
}

export interface TaskFilter {
  priorities?: TaskPriority[]
  statuses?: TaskCard['status'][]
  types?: string[]
  safety_critical?: boolean
  min_complexity?: number
  max_complexity?: number
  date_range?: {
    start: string
    end: string
  }
}

// Bulk operations types
export interface BulkAgentOperation {
  operation: 'activate' | 'deactivate' | 'maintenance' | 'update_status'
  agent_ids: string[]
  parameters?: Record<string, any>
}

export interface BulkTaskOperation {
  operation: 'assign' | 'reassign' | 'cancel' | 'prioritize'
  task_ids: string[]
  parameters?: Record<string, any>
}
