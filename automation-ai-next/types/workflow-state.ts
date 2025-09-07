/**
 * Workflow State Management TypeScript Types
 * Hierarchical state machine with event sourcing for complex workflows
 */

// Core Enums
export enum WorkflowState {
  PENDING = "pending",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

export enum WorkflowSubState {
  INITIALIZING = "initializing",
  EXECUTING = "executing",
  WAITING = "waiting",
  SYNCHRONIZING = "synchronizing",
  FINALIZING = "finalizing"
}

export enum EventType {
  WORKFLOW_CREATED = "workflow_created",
  WORKFLOW_STARTED = "workflow_started",
  WORKFLOW_PAUSED = "workflow_paused",
  WORKFLOW_RESUMED = "workflow_resumed",
  WORKFLOW_COMPLETED = "workflow_completed",
  WORKFLOW_FAILED = "workflow_failed",
  STEP_ASSIGNED = "step_assigned",
  STEP_STARTED = "step_started",
  STEP_COMPLETED = "step_completed",
  STEP_FAILED = "step_failed",
  STATE_TRANSITION = "state_transition",
  AGENT_ASSIGNED = "agent_assigned",
  AGENT_RELEASED = "agent_released"
}

export enum StepType {
  SEQUENTIAL = "sequential",
  PARALLEL = "parallel",
  CONDITIONAL = "conditional",
  LOOP = "loop",
  SYNCHRONIZATION = "synchronization"
}

export enum StepStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped",
  CANCELLED = "cancelled"
}

// Core Data Types
export interface WorkflowStep {
  step_id: string
  step_name: string
  step_type: StepType
  parameters: Record<string, any>
  dependencies: string[]  // Step IDs this step depends on
  assigned_agent_id?: string
  status: StepStatus
  started_at?: string     // ISO datetime string
  completed_at?: string   // ISO datetime string
  result?: Record<string, any>
  error_message?: string
}

export interface WorkflowDefinition {
  workflow_id: string
  name: string
  description: string
  steps: WorkflowStep[]
  global_parameters: Record<string, any>
  timeout?: number        // seconds
  retry_policy?: Record<string, any>
}

export interface WorkflowEvent {
  event_id: string
  workflow_id: string
  event_type: EventType
  event_data: Record<string, any>
  sequence_number: number
  timestamp: string       // ISO datetime string
  causation_id?: string   // What caused this event
  correlation_id?: string // Related events
}

export interface WorkflowStateSnapshot {
  workflow_id: string
  current_state: WorkflowState
  current_substate?: WorkflowSubState
  step_states: Record<string, StepStatus>  // step_id -> status
  assigned_agents: Record<string, string>  // step_id -> agent_id
  global_context: Record<string, any>
  created_at: string      // ISO datetime string
  updated_at: string      // ISO datetime string
  snapshot_sequence: number
}

export interface StateTransition {
  from_state: WorkflowState
  to_state: WorkflowState
  event: EventType
  conditions?: Record<string, any>
  actions?: string[]
}

// Extended Workflow Information
export interface WorkflowInfo {
  workflow_id: string
  definition: WorkflowDefinition
  current_state: WorkflowStateSnapshot
  events: WorkflowEvent[]
  metrics: WorkflowMetrics
  execution_timeline: ExecutionTimelineEntry[]
}

export interface WorkflowMetrics {
  total_steps: number
  completed_steps: number
  failed_steps: number
  pending_steps: number
  running_steps: number
  total_execution_time: number  // seconds
  average_step_time: number     // seconds
  success_rate: number          // percentage
  efficiency_score: number      // 0-100
}

export interface ExecutionTimelineEntry {
  timestamp: string
  event_type: EventType
  step_id?: string
  agent_id?: string
  description: string
  duration?: number  // seconds
}

// Workflow Management Types
export interface WorkflowTemplate {
  template_id: string
  name: string
  description: string
  category: string
  step_templates: StepTemplate[]
  default_parameters: Record<string, any>
  estimated_duration: number  // seconds
  complexity_score: number    // 1-10
  required_capabilities: string[]
}

export interface StepTemplate {
  template_id: string
  name: string
  description: string
  step_type: StepType
  parameter_schema: Record<string, ParameterDefinition>
  required_capabilities: string[]
  estimated_duration: number  // seconds
  retry_policy?: RetryPolicy
}

export interface ParameterDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  default_value?: any
  description: string
  validation_rules?: ValidationRule[]
}

export interface ValidationRule {
  rule_type: 'min' | 'max' | 'pattern' | 'enum' | 'custom'
  value: any
  error_message: string
}

export interface RetryPolicy {
  max_attempts: number
  retry_delay: number      // seconds
  backoff_multiplier: number
  retry_conditions: string[]
}

// Event Sourcing Types
export interface EventStream {
  workflow_id: string
  events: WorkflowEvent[]
  total_events: number
  last_sequence_number: number
  stream_version: number
}

export interface EventProjection {
  projection_id: string
  name: string
  description: string
  event_types: EventType[]
  projection_data: Record<string, any>
  last_processed_sequence: number
  updated_at: string
}

// Analytics and Reporting
export interface WorkflowAnalytics {
  total_workflows: number
  active_workflows: number
  completed_workflows: number
  failed_workflows: number
  average_completion_time: number
  success_rate: number
  most_common_failures: FailureAnalysis[]
  performance_trends: PerformanceTrend[]
  agent_utilization: AgentUtilization[]
}

export interface FailureAnalysis {
  failure_type: string
  count: number
  percentage: number
  common_steps: string[]
  suggested_improvements: string[]
}

export interface PerformanceTrend {
  metric: string
  time_period: string
  values: number[]
  timestamps: string[]
  trend_direction: 'improving' | 'stable' | 'declining'
}

export interface AgentUtilization {
  agent_id: string
  agent_type: string
  workflows_assigned: number
  steps_completed: number
  average_step_time: number
  success_rate: number
  current_workload: number
  efficiency_rating: number
}

// Real-time Monitoring
export interface WorkflowMonitoringData {
  active_workflows: WorkflowSummary[]
  system_metrics: SystemMetrics
  recent_events: WorkflowEvent[]
  alerts: WorkflowAlert[]
  performance_summary: PerformanceSummary
}

export interface WorkflowSummary {
  workflow_id: string
  name: string
  current_state: WorkflowState
  current_substate?: WorkflowSubState
  progress_percentage: number
  estimated_completion: string
  assigned_agents: string[]
  critical_path_steps: string[]
}

export interface SystemMetrics {
  total_active_workflows: number
  total_pending_workflows: number
  average_workflow_duration: number
  system_throughput: number  // workflows per hour
  resource_utilization: number  // percentage
  error_rate: number  // percentage
}

export interface WorkflowAlert {
  alert_id: string
  workflow_id: string
  alert_type: 'timeout' | 'failure' | 'resource_constraint' | 'dependency_issue'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
}

export interface PerformanceSummary {
  workflows_completed_today: number
  average_completion_time_today: number
  success_rate_today: number
  efficiency_improvement: number  // percentage vs yesterday
  bottleneck_analysis: BottleneckAnalysis[]
}

export interface BottleneckAnalysis {
  step_type: StepType
  average_duration: number
  frequency: number
  impact_score: number
  optimization_suggestions: string[]
}

// API Request/Response Types
export interface CreateWorkflowRequest {
  definition: WorkflowDefinition
  start_immediately?: boolean
  priority?: number
}

export interface CreateWorkflowResponse {
  workflow_id: string
  state: WorkflowStateSnapshot
  message: string
}

export interface WorkflowActionRequest {
  action: 'start' | 'pause' | 'resume' | 'cancel'
  reason?: string
  parameters?: Record<string, any>
}

export interface WorkflowActionResponse {
  success: boolean
  new_state: WorkflowStateSnapshot
  message: string
}

export interface StepActionRequest {
  step_id: string
  action: 'complete' | 'fail' | 'skip' | 'retry'
  result?: Record<string, any>
  error_message?: string
}

export interface StepActionResponse {
  success: boolean
  step_status: StepStatus
  workflow_state: WorkflowStateSnapshot
  message: string
}

export interface AgentAssignmentRequest {
  step_id: string
  agent_id: string
  assignment_reason?: string
}

export interface AgentAssignmentResponse {
  success: boolean
  assignment_id: string
  message: string
}

// Dashboard Integration Types
export interface WorkflowDashboardData {
  active_workflows: WorkflowInfo[]
  workflow_analytics: WorkflowAnalytics
  monitoring_data: WorkflowMonitoringData
  recent_events: WorkflowEvent[]
  system_health: SystemHealth
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical'
  event_store_status: 'healthy' | 'degraded' | 'offline'
  state_machine_status: 'healthy' | 'degraded' | 'offline'
  workflow_engine_status: 'healthy' | 'degraded' | 'offline'
  last_health_check: string
}

// Form Types for UI
export interface WorkflowCreationForm {
  name: string
  description: string
  template_id?: string
  steps: StepCreationForm[]
  global_parameters: Record<string, any>
  timeout?: number
}

export interface StepCreationForm {
  step_name: string
  step_type: StepType
  parameters: Record<string, any>
  dependencies: string[]
  estimated_duration?: number
}

// Utility Types
export type WorkflowID = string
export type StepID = string
export type AgentID = string
export type EventID = string
export type TemplateID = string

// Export commonly used unions
export type WorkflowAction = 'start' | 'pause' | 'resume' | 'cancel'
export type StepAction = 'complete' | 'fail' | 'skip' | 'retry'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type TrendDirection = 'improving' | 'stable' | 'declining'

// Configuration Types
export interface WorkflowEngineConfig {
  max_concurrent_workflows: number
  default_timeout: number
  snapshot_frequency: number
  event_retention_days: number
  performance_monitoring_enabled: boolean
}

export interface EventSourcingConfig {
  batch_size: number
  compression_enabled: boolean
  encryption_enabled: boolean
  backup_frequency: number
  retention_policy: RetentionPolicy
}

export interface RetentionPolicy {
  events_retention_days: number
  snapshots_retention_days: number
  completed_workflows_retention_days: number
  failed_workflows_retention_days: number
}
