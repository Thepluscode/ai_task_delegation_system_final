// Edge Computing Service TypeScript Types

export enum TaskPriority {
  SAFETY_CRITICAL = 'safety_critical',      // 1ms target
  QUALITY_CRITICAL = 'quality_critical',    // 10ms target
  EFFICIENCY_CRITICAL = 'efficiency_critical', // 100ms target
  STANDARD = 'standard',                     // 500ms target
}

export enum EdgeDecisionType {
  CACHED = 'cached',
  LIGHTWEIGHT_MODEL = 'lightweight_model',
  RULE_BASED = 'rule_based',
  CLOUD_FALLBACK = 'cloud_fallback',
}

export interface EdgeTask {
  task_id: string
  priority: TaskPriority
  task_type: string
  parameters: Record<string, any>
  timeout_ms: number
  require_response: boolean
}

export interface EdgeDecision {
  task_id: string
  decision_type: EdgeDecisionType
  assigned_agent_id: string
  confidence: number
  processing_time_ms: number
  reasoning: string
  timestamp: string
  cached?: boolean
}

export interface AgentCapability {
  agent_id: string
  task_type: string
  proficiency: number
  response_time_ms: number
  last_updated: string
}

export interface LocalAgent {
  agent_id: string
  agent_type: string
  capabilities: Record<string, number>
  current_load: number
  status: string
  location: string
}

// Performance and Monitoring Types
export interface PerformanceStats {
  avg_response_time: number
  max_response_time: number
  min_response_time: number
  target_met_percentage: number
  total_requests: number
}

export interface EdgePerformanceMetrics {
  [priority: string]: PerformanceStats
}

export interface ResponseTimeTarget {
  [TaskPriority.SAFETY_CRITICAL]: 1      // 1ms
  [TaskPriority.QUALITY_CRITICAL]: 10    // 10ms
  [TaskPriority.EFFICIENCY_CRITICAL]: 100 // 100ms
  [TaskPriority.STANDARD]: 500           // 500ms
}

// Real-time Monitoring Types
export interface EdgeSystemStatus {
  service_status: 'online' | 'offline' | 'degraded'
  cloud_connectivity: boolean
  local_agents_count: number
  cache_hit_rate: number
  avg_response_time: number
  requests_per_second: number
  error_rate: number
  uptime_seconds: number
}

export interface EdgeDecisionMetrics {
  total_decisions: number
  decisions_by_type: Record<EdgeDecisionType, number>
  decisions_by_priority: Record<TaskPriority, number>
  cache_performance: {
    hit_rate: number
    miss_rate: number
    eviction_rate: number
    size: number
    max_size: number
  }
  model_performance: {
    inference_time_ms: number
    accuracy: number
    confidence_avg: number
  }
  rule_engine_performance: {
    execution_time_ms: number
    rules_triggered: number
    success_rate: number
  }
}

// Edge Computing Configuration
export interface EdgeConfig {
  cache_size: number
  performance_targets: ResponseTimeTarget
  model_settings: {
    feature_weights: Record<string, number>
    confidence_threshold: number
    retrain_interval: number
  }
  rule_engine_settings: {
    safety_load_threshold: number
    capability_threshold: number
    load_balancing_enabled: boolean
  }
  cloud_fallback: {
    enabled: boolean
    timeout_ms: number
    retry_attempts: number
  }
}

// Real-time Task Processing
export interface TaskProcessingRequest {
  task: EdgeTask
  available_agents: LocalAgent[]
  force_local?: boolean
  bypass_cache?: boolean
}

export interface TaskProcessingResponse {
  decision: EdgeDecision
  alternatives: EdgeDecision[]
  processing_metadata: {
    cache_used: boolean
    model_used: boolean
    rules_applied: string[]
    cloud_attempted: boolean
    fallback_used: boolean
  }
}

// Agent Management
export interface AgentRegistration {
  agent: LocalAgent
  capabilities: AgentCapability[]
  initial_load: number
}

export interface AgentLoadUpdate {
  agent_id: string
  current_load: number
  status: string
  timestamp: string
}

export interface AgentPerformanceHistory {
  agent_id: string
  task_type: string
  performance_data: Array<{
    timestamp: string
    response_time_ms: number
    success: boolean
    confidence: number
  }>
  statistics: {
    avg_response_time: number
    success_rate: number
    avg_confidence: number
    total_tasks: number
  }
}

// Cache Management
export interface CacheEntry {
  key: string
  value: EdgeDecision
  created_at: string
  last_accessed: string
  access_count: number
  ttl_seconds: number
}

export interface CacheStatistics {
  total_entries: number
  hit_rate: number
  miss_rate: number
  eviction_count: number
  memory_usage_mb: number
  oldest_entry_age_seconds: number
  most_accessed_key: string
}

// Offline Operation
export interface OfflineCapabilities {
  local_db_enabled: boolean
  cached_decisions_count: number
  local_model_available: boolean
  rule_engine_active: boolean
  estimated_offline_duration: number
  last_cloud_sync: string
}

export interface OfflineDecisionLog {
  decisions: EdgeDecision[]
  sync_status: 'pending' | 'synced' | 'failed'
  created_offline: boolean
  sync_attempts: number
  last_sync_attempt: string
}

// Performance Optimization
export interface OptimizationSuggestion {
  type: 'cache' | 'model' | 'rules' | 'agents'
  priority: 'high' | 'medium' | 'low'
  description: string
  expected_improvement: string
  implementation_effort: 'low' | 'medium' | 'high'
  estimated_impact: {
    response_time_improvement_ms: number
    accuracy_improvement_percent: number
    resource_usage_change_percent: number
  }
}

export interface PerformanceReport {
  period: {
    start: string
    end: string
    duration_hours: number
  }
  summary: {
    total_requests: number
    avg_response_time: number
    target_compliance_rate: number
    error_rate: number
  }
  by_priority: Record<TaskPriority, PerformanceStats>
  by_decision_type: Record<EdgeDecisionType, PerformanceStats>
  trends: Array<{
    timestamp: string
    response_time: number
    request_count: number
    error_count: number
  }>
  optimization_suggestions: OptimizationSuggestion[]
}

// Real-time Streaming
export interface EdgeStreamEvent {
  event_type: 'decision' | 'performance' | 'agent_update' | 'system_status'
  timestamp: string
  data: any
}

export interface DecisionStreamEvent extends EdgeStreamEvent {
  event_type: 'decision'
  data: {
    decision: EdgeDecision
    processing_metadata: any
  }
}

export interface PerformanceStreamEvent extends EdgeStreamEvent {
  event_type: 'performance'
  data: {
    current_metrics: EdgePerformanceMetrics
    system_status: EdgeSystemStatus
  }
}

export interface AgentUpdateStreamEvent extends EdgeStreamEvent {
  event_type: 'agent_update'
  data: {
    agent_id: string
    update_type: 'load' | 'status' | 'capabilities'
    previous_value: any
    new_value: any
  }
}

// Testing and Simulation
export interface EdgeTestScenario {
  scenario_id: string
  name: string
  description: string
  test_tasks: EdgeTask[]
  expected_agents: LocalAgent[]
  performance_expectations: {
    max_response_time_ms: number
    min_accuracy: number
    target_compliance_rate: number
  }
  network_conditions: {
    cloud_available: boolean
    latency_ms: number
    packet_loss_rate: number
  }
}

export interface EdgeTestResult {
  scenario_id: string
  execution_time: string
  results: {
    decisions: EdgeDecision[]
    performance_metrics: EdgePerformanceMetrics
    compliance_rate: number
    errors: string[]
  }
  comparison: {
    expected_vs_actual: Record<string, any>
    performance_delta: Record<string, number>
    passed: boolean
  }
}

// Bulk Operations
export interface BulkTaskProcessing {
  tasks: EdgeTask[]
  processing_options: {
    parallel_processing: boolean
    max_concurrent: number
    timeout_ms: number
    fail_fast: boolean
  }
}

export interface BulkProcessingResult {
  total_tasks: number
  successful: number
  failed: number
  avg_processing_time: number
  decisions: EdgeDecision[]
  errors: Array<{
    task_id: string
    error: string
  }>
}

// Computer Vision Processing Types
export interface VisionProcessingRequest {
  frame_data: string | ArrayBuffer // Base64 encoded or binary data
  processing_type: 'quality_inspection' | 'safety_monitoring' | 'object_detection'
  timestamp?: string
}

export interface VisionProcessingResult {
  result: VisionResult
  processing_time_ms: number
  timestamp: string
  error?: string
}

export interface VisionResult {
  // Quality Inspection Results
  defect_detected?: boolean
  quality_score?: number
  confidence?: number

  // Safety Monitoring Results
  safety_violation?: boolean
  risk_level?: 'low' | 'medium' | 'high' | 'critical'

  // Object Detection Results
  objects_detected?: Array<{
    type: string
    confidence: number
    bbox: [number, number, number, number] // [x, y, width, height]
  }>

  // Generic result for unknown types
  result?: string
}

export interface VisionStreamMetrics {
  frames_processed: number
  avg_processing_time: number
  frames_per_second: number
  buffer_utilization: number
  error_rate: number
  processing_types: Record<string, number>
}

// Edge Computing Dashboard Types
export interface EdgeDashboardData {
  system_status: EdgeSystemStatus
  performance_metrics: EdgePerformanceMetrics
  recent_decisions: EdgeDecision[]
  active_agents: LocalAgent[]
  cache_statistics: CacheStatistics
  optimization_suggestions: OptimizationSuggestion[]
  vision_metrics?: VisionStreamMetrics
}

export interface EdgeAlerts {
  critical: Array<{
    id: string
    message: string
    timestamp: string
    resolved: boolean
  }>
  warnings: Array<{
    id: string
    message: string
    timestamp: string
    acknowledged: boolean
  }>
  info: Array<{
    id: string
    message: string
    timestamp: string
  }>
}

// Search and Filtering
export interface EdgeDecisionFilter {
  priority?: TaskPriority[]
  decision_type?: EdgeDecisionType[]
  agent_ids?: string[]
  time_range?: {
    start: string
    end: string
  }
  min_confidence?: number
  max_response_time?: number
  cached_only?: boolean
}

export interface EdgeDecisionSearchResult {
  decisions: EdgeDecision[]
  total_count: number
  facets: {
    priorities: Record<TaskPriority, number>
    decision_types: Record<EdgeDecisionType, number>
    agents: Record<string, number>
    response_time_ranges: Array<{
      range: string
      count: number
    }>
  }
}
