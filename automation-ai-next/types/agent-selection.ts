/**
 * Agent Selection Service TypeScript Types
 * Multi-objective optimization for intelligent task delegation
 */

// Core Enums
export enum AgentType {
  ROBOT = "robot",
  HUMAN = "human",
  AI_SYSTEM = "ai_system",
  HYBRID = "hybrid"
}

export enum TaskPriority {
  SAFETY_CRITICAL = "safety_critical",
  QUALITY_CRITICAL = "quality_critical",
  EFFICIENCY_CRITICAL = "efficiency_critical",
  STANDARD = "standard"
}

export enum AgentStatus {
  AVAILABLE = "available",
  BUSY = "busy",
  MAINTENANCE = "maintenance",
  OFFLINE = "offline",
  IDLE = "idle"
}

// Agent Capability Types
export interface AgentCapability {
  capability_type: string
  proficiency_level: number  // 0.0 to 1.0
  confidence: number         // 0.0 to 1.0
  last_assessed: string      // ISO datetime string
}

export interface Agent {
  agent_id: string
  agent_type: AgentType
  name: string
  capabilities: Record<string, AgentCapability>
  current_status: AgentStatus
  location?: string
  cost_per_hour: number
  energy_consumption: number  // kW/h
  safety_rating: number      // 0.0 to 1.0
  current_workload: number   // 0.0 to 1.0
}

// Task Types
export interface TaskRequirement {
  requirement_type: string
  minimum_proficiency: number
  weight: number  // Importance weight 0.0 to 1.0
}

export interface Task {
  task_id: string
  task_type: string
  priority: TaskPriority
  requirements: TaskRequirement[]
  estimated_duration: number  // minutes
  deadline?: string           // ISO datetime string
  complexity_score: number    // 0.0 to 1.0
  safety_critical: boolean
  location?: string
}

// Optimization Types
export interface OptimizationObjective {
  name: string
  weight: number
  maximize: boolean
}

export interface OptimizationScores {
  speed: number
  quality: number
  cost: number
  safety: number
  energy: number
}

export interface TaskAssignment {
  task_id: string
  assigned_agent_id: string
  confidence_score: number
  estimated_completion_time: string  // ISO datetime string
  optimization_scores: OptimizationScores
  reasoning: string
  assignment_timestamp: string       // ISO datetime string
}

// Performance Tracking Types
export interface AgentPerformanceMetrics {
  total_assignments: number
  average_confidence: number
  success_rate: number
  average_completion_time: number
  efficiency_rating?: number
  quality_rating?: number
  cost_effectiveness?: number
}

export interface PerformanceHistory {
  agent_id: string
  assignments: TaskAssignment[]
  metrics: AgentPerformanceMetrics
  trends: PerformanceTrend[]
}

export interface PerformanceTrend {
  metric: string
  values: number[]
  timestamps: string[]
  trend_direction: 'improving' | 'stable' | 'declining'
  confidence: number
}

// Capability Matrix Types
export interface CapabilityMatrix {
  [agentType: string]: {
    [capability: string]: number
  }
}

export interface CapabilityAnalysis {
  agent_id: string
  task_id: string
  required_capabilities: string[]
  agent_capabilities: string[]
  capability_match_score: number
  missing_capabilities: string[]
  strength_areas: string[]
  recommendations: string[]
}

// Assignment Request/Response Types
export interface AssignmentRequest {
  task: Task
  available_agents: Agent[]
  optimization_preferences?: Partial<Record<keyof OptimizationScores, number>>
  constraints?: AssignmentConstraints
}

export interface AssignmentConstraints {
  max_cost?: number
  min_quality?: number
  max_duration?: number
  required_location?: string
  excluded_agents?: string[]
  preferred_agent_types?: AgentType[]
}

export interface AssignmentResponse {
  assignment: TaskAssignment
  alternatives: TaskAssignment[]
  analysis: AssignmentAnalysis
  recommendations: string[]
}

export interface AssignmentAnalysis {
  total_agents_evaluated: number
  capable_agents: number
  optimization_breakdown: OptimizationBreakdown
  risk_assessment: RiskAssessment
  efficiency_analysis: EfficiencyAnalysis
}

export interface OptimizationBreakdown {
  primary_factors: Array<{
    factor: string
    weight: number
    score: number
    impact: 'high' | 'medium' | 'low'
  }>
  trade_offs: Array<{
    factor1: string
    factor2: string
    description: string
  }>
}

export interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high'
  risk_factors: Array<{
    factor: string
    severity: 'low' | 'medium' | 'high'
    mitigation: string
  }>
  confidence_level: number
}

export interface EfficiencyAnalysis {
  expected_efficiency: number
  efficiency_factors: Array<{
    factor: string
    contribution: number
    description: string
  }>
  improvement_suggestions: string[]
}

// Service Configuration Types
export interface OptimizationConfig {
  objectives: Record<string, OptimizationObjective>
  default_weights: OptimizationScores
  priority_adjustments: Record<TaskPriority, Partial<OptimizationScores>>
  capability_thresholds: Record<string, number>
}

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'offline'
  version: string
  capabilities: string[]
  active_agents: number
  pending_assignments: number
  last_updated: string
}

// Analytics Types
export interface AgentUtilizationMetrics {
  agent_id: string
  agent_type: AgentType
  utilization_percentage: number
  tasks_completed_today: number
  average_task_duration: number
  efficiency_score: number
  quality_score: number
  cost_effectiveness: number
  status: AgentStatus
}

export interface SystemAnalytics {
  total_agents: number
  active_agents: number
  total_assignments_today: number
  average_assignment_time: number
  system_efficiency: number
  cost_savings: number
  quality_metrics: {
    average_quality: number
    quality_consistency: number
    improvement_rate: number
  }
  utilization_metrics: AgentUtilizationMetrics[]
}

export interface TaskTypeAnalysis {
  task_type: string
  total_tasks: number
  average_duration: number
  success_rate: number
  preferred_agent_types: Array<{
    agent_type: AgentType
    success_rate: number
    efficiency: number
  }>
  complexity_distribution: {
    low: number
    medium: number
    high: number
  }
}

// Real-time Updates
export interface AgentStatusUpdate {
  agent_id: string
  previous_status: AgentStatus
  new_status: AgentStatus
  timestamp: string
  reason?: string
}

export interface TaskProgressUpdate {
  task_id: string
  agent_id: string
  progress_percentage: number
  estimated_completion: string
  quality_indicators: Record<string, number>
  issues?: string[]
}

// API Response Types
export interface AgentSelectionAPIResponse<T = any> {
  success: boolean
  data: T
  message?: string
  timestamp: string
  version: string
}

export interface PaginatedAgentResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

// Utility Types
export type OptimizationObjectiveName = keyof OptimizationScores
export type CapabilityType = string
export type AgentID = string
export type TaskID = string

// Form/Input Types for UI
export interface AgentRegistrationForm {
  name: string
  agent_type: AgentType
  capabilities: Array<{
    type: string
    proficiency: number
    confidence: number
  }>
  cost_per_hour: number
  energy_consumption: number
  safety_rating: number
  location?: string
}

export interface TaskCreationForm {
  task_type: string
  priority: TaskPriority
  requirements: Array<{
    type: string
    minimum_proficiency: number
    weight: number
  }>
  estimated_duration: number
  deadline?: string
  complexity_score: number
  safety_critical: boolean
  location?: string
}

export interface OptimizationPreferences {
  speed_weight: number
  quality_weight: number
  cost_weight: number
  safety_weight: number
  energy_weight: number
}

// Dashboard Integration Types
export interface AgentSelectionDashboardData {
  service_status: ServiceStatus
  system_analytics: SystemAnalytics
  recent_assignments: TaskAssignment[]
  agent_utilization: AgentUtilizationMetrics[]
  task_type_analysis: TaskTypeAnalysis[]
  performance_trends: PerformanceTrend[]
  optimization_insights: string[]
}

// Export commonly used type unions
export type AgentOrTask = Agent | Task
export type AssignmentStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
export type OptimizationResult = TaskAssignment & {
  alternatives: TaskAssignment[]
  confidence_level: 'high' | 'medium' | 'low'
}
