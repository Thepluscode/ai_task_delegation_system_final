// Workflow State Management Service TypeScript Types

export enum WorkflowState {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum WorkflowSubState {
  INITIALIZING = 'initializing',
  EXECUTING = 'executing',
  WAITING = 'waiting',
  SYNCHRONIZING = 'synchronizing',
  FINALIZING = 'finalizing',
}

export enum EventType {
  WORKFLOW_CREATED = 'workflow_created',
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_PAUSED = 'workflow_paused',
  WORKFLOW_RESUMED = 'workflow_resumed',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  STEP_ASSIGNED = 'step_assigned',
  STEP_STARTED = 'step_started',
  STEP_COMPLETED = 'step_completed',
  STEP_FAILED = 'step_failed',
  STATE_TRANSITION = 'state_transition',
  AGENT_ASSIGNED = 'agent_assigned',
  AGENT_RELEASED = 'agent_released',
}

export enum StepType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  LOOP = 'loop',
  SYNCHRONIZATION = 'synchronization',
}

export interface WorkflowStep {
  step_id: string
  step_name: string
  step_type: StepType
  parameters: Record<string, any>
  dependencies: string[] // Step IDs this step depends on
  assigned_agent_id?: string
  status: string
  started_at?: string
  completed_at?: string
  result?: Record<string, any>
  error_message?: string
}

export interface WorkflowDefinition {
  workflow_id: string
  name: string
  description: string
  steps: WorkflowStep[]
  global_parameters: Record<string, any>
  timeout?: number // seconds
  retry_policy?: Record<string, any>
}

export interface WorkflowEvent {
  event_id: string
  workflow_id: string
  event_type: EventType
  event_data: Record<string, any>
  sequence_number: number
  timestamp: string
  causation_id?: string // What caused this event
  correlation_id?: string // Related events
}

export interface WorkflowStateSnapshot {
  workflow_id: string
  current_state: WorkflowState
  current_substate?: WorkflowSubState
  step_states: Record<string, string> // step_id -> status
  assigned_agents: Record<string, string> // step_id -> agent_id
  global_context: Record<string, any>
  created_at: string
  updated_at: string
  snapshot_sequence: number
}

export interface StateTransition {
  from_state: string
  to_state: string
  event: EventType
  conditions?: Record<string, any>
  actions?: string[]
}

// Extended types for UI components
export interface WorkflowCard {
  id: string
  name: string
  description: string
  state: WorkflowState
  substate?: WorkflowSubState
  progress: number // 0-100
  total_steps: number
  completed_steps: number
  failed_steps: number
  assigned_agents: string[]
  created_at: string
  updated_at: string
  estimated_completion?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface WorkflowExecution {
  workflow_id: string
  execution_id: string
  state: WorkflowStateSnapshot
  definition: WorkflowDefinition
  events: WorkflowEvent[]
  metrics: {
    duration: number
    steps_completed: number
    steps_failed: number
    agents_involved: number
    efficiency_score: number
  }
  timeline: Array<{
    timestamp: string
    event: EventType
    description: string
    step_id?: string
    agent_id?: string
  }>
}

export interface StepExecution {
  step_id: string
  step_name: string
  step_type: StepType
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  assigned_agent_id?: string
  agent_name?: string
  started_at?: string
  completed_at?: string
  duration?: number
  result?: Record<string, any>
  error_message?: string
  dependencies: string[]
  dependents: string[]
  progress: number
  estimated_completion?: string
}

// Workflow Builder Types
export interface WorkflowTemplate {
  template_id: string
  name: string
  description: string
  category: string
  tags: string[]
  steps: WorkflowStep[]
  parameters: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'object'
    required: boolean
    default_value?: any
    description: string
  }>
  estimated_duration: number
  complexity: 'simple' | 'medium' | 'complex'
  agent_requirements: string[]
}

export interface WorkflowBuilder {
  workflow_id: string
  name: string
  description: string
  steps: WorkflowStep[]
  connections: Array<{
    from_step: string
    to_step: string
    condition?: string
  }>
  global_parameters: Record<string, any>
  validation_errors: string[]
  is_valid: boolean
}

// Analytics and Monitoring Types
export interface WorkflowAnalytics {
  total_workflows: number
  active_workflows: number
  completed_workflows: number
  failed_workflows: number
  average_completion_time: number
  success_rate: number
  most_used_templates: Array<{
    template_id: string
    name: string
    usage_count: number
  }>
  agent_utilization: Record<string, number>
  step_failure_rates: Record<string, number>
  performance_trends: Array<{
    date: string
    completed: number
    failed: number
    average_duration: number
  }>
}

export interface WorkflowMetrics {
  workflow_id: string
  execution_time: number
  steps_executed: number
  agents_used: number
  resource_utilization: number
  efficiency_score: number
  bottlenecks: Array<{
    step_id: string
    delay_time: number
    reason: string
  }>
  optimization_suggestions: string[]
}

// Real-time Monitoring Types
export interface WorkflowMonitor {
  workflow_id: string
  current_state: WorkflowState
  active_steps: StepExecution[]
  waiting_steps: StepExecution[]
  completed_steps: StepExecution[]
  failed_steps: StepExecution[]
  agent_assignments: Record<string, string>
  resource_usage: {
    cpu: number
    memory: number
    network: number
  }
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: string
    step_id?: string
  }>
}

// Workflow Orchestration Types
export interface WorkflowOrchestration {
  orchestration_id: string
  name: string
  workflows: Array<{
    workflow_id: string
    dependencies: string[]
    priority: number
    parallel_execution: boolean
  }>
  global_state: 'pending' | 'running' | 'completed' | 'failed'
  coordination_rules: Array<{
    condition: string
    action: string
    target_workflows: string[]
  }>
}

// Event Sourcing Types
export interface EventStream {
  workflow_id: string
  events: WorkflowEvent[]
  snapshots: WorkflowStateSnapshot[]
  current_sequence: number
  last_snapshot_sequence: number
}

export interface EventProjection {
  projection_id: string
  name: string
  event_types: EventType[]
  projection_data: Record<string, any>
  last_processed_sequence: number
  created_at: string
  updated_at: string
}

// Configuration Types
export interface WorkflowServiceConfig {
  event_store_settings: {
    snapshot_frequency: number
    retention_period: number
    compression_enabled: boolean
  }
  execution_settings: {
    max_concurrent_workflows: number
    step_timeout: number
    retry_attempts: number
    backoff_strategy: 'linear' | 'exponential'
  }
  monitoring_settings: {
    metrics_collection: boolean
    alert_thresholds: Record<string, number>
    notification_channels: string[]
  }
}

// Search and Filter Types
export interface WorkflowFilter {
  states?: WorkflowState[]
  substates?: WorkflowSubState[]
  date_range?: {
    start: string
    end: string
  }
  agents?: string[]
  templates?: string[]
  priorities?: string[]
  tags?: string[]
  duration_range?: {
    min: number
    max: number
  }
}

export interface WorkflowSearchResult {
  workflows: WorkflowCard[]
  total_count: number
  facets: {
    states: Record<WorkflowState, number>
    agents: Record<string, number>
    templates: Record<string, number>
    durations: Array<{
      range: string
      count: number
    }>
  }
}

// Bulk Operations Types
export interface BulkWorkflowOperation {
  operation: 'start' | 'pause' | 'resume' | 'cancel' | 'retry'
  workflow_ids: string[]
  parameters?: Record<string, any>
  schedule?: {
    execute_at: string
    repeat?: {
      interval: number
      count?: number
    }
  }
}

export interface BulkOperationResult {
  operation_id: string
  total_workflows: number
  successful: number
  failed: number
  results: Array<{
    workflow_id: string
    success: boolean
    error_message?: string
  }>
  started_at: string
  completed_at: string
}
