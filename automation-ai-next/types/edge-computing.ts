/**
 * Edge Computing Service TypeScript Types
 * Sub-10ms real-time decision engine with autonomous operation
 */

// Core Enums
export enum TaskPriority {
  SAFETY_CRITICAL = "safety_critical",      // 1ms target
  QUALITY_CRITICAL = "quality_critical",    // 10ms target
  EFFICIENCY_CRITICAL = "efficiency_critical", // 100ms target
  STANDARD = "standard"                      // 500ms target
}

export enum EdgeDecisionType {
  CACHED = "cached",
  LIGHTWEIGHT_MODEL = "lightweight_model",
  RULE_BASED = "rule_based",
  CLOUD_FALLBACK = "cloud_fallback"
}

export enum VisionProcessingType {
  QUALITY_INSPECTION = "quality_inspection",
  SAFETY_MONITORING = "safety_monitoring",
  OBJECT_DETECTION = "object_detection",
  DEFECT_DETECTION = "defect_detection",
  MOTION_TRACKING = "motion_tracking"
}

export enum AgentStatus {
  AVAILABLE = "available",
  BUSY = "busy",
  OFFLINE = "offline",
  MAINTENANCE = "maintenance"
}

// Core Data Types
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
  timestamp: string  // ISO datetime string
  cached: boolean
}

export interface AgentCapability {
  agent_id: string
  task_type: string
  proficiency: number
  response_time_ms: number
  last_updated: string  // ISO datetime string
}

export interface LocalAgent {
  agent_id: string
  agent_type: string
  capabilities: Record<string, number>  // task_type -> proficiency
  current_load: number  // 0.0 to 1.0
  status: AgentStatus
  location: string
}

// Computer Vision Types
export interface VisionFrame {
  frame_id: string
  data: ArrayBuffer | Uint8Array
  timestamp: string
  processing_type: VisionProcessingType
  metadata?: Record<string, any>
}

export interface VisionProcessingResult {
  result: VisionAnalysisResult
  processing_time_ms: number
  timestamp: string
  error?: string
}

export interface VisionAnalysisResult {
  // Quality Inspection Results
  defect_detected?: boolean
  quality_score?: number
  confidence?: number

  // Safety Monitoring Results
  safety_violation?: boolean
  risk_level?: 'low' | 'medium' | 'high' | 'critical'

  // Object Detection Results
  objects_detected?: DetectedObject[]

  // General Results
  analysis_type?: string
  metadata?: Record<string, any>
}

export interface DetectedObject {
  type: string
  confidence: number
  bbox: [number, number, number, number]  // [x, y, width, height]
  attributes?: Record<string, any>
}

export interface VisionProcessingStats {
  total_frames_processed: number
  average_processing_time: number
  frames_per_second: number
  buffer_utilization: number
  processing_types: Record<VisionProcessingType, number>
}

// Performance and Monitoring Types
export interface PerformanceStats {
  avg_response_time: number
  max_response_time: number
  min_response_time: number
  target_met_percentage: number
  total_requests: number
}

export interface EdgePerformanceData {
  performance_by_priority: Record<TaskPriority, PerformanceStats>
  overall: OverallStats
  timestamp: string
}

export interface OverallStats {
  cache_size: number
  cloud_available: boolean
  total_agents: number
  available_agents: number
}

export interface CacheStats {
  cache_size: number
  max_size: number
  utilization: number
  access_pattern: string[]
}

// Real-time Monitoring Types
export interface EdgeMonitoringData {
  timestamp: string
  performance: Record<TaskPriority, PerformanceStats>
  agents: AgentLoadInfo[]
  cache_size: number
  cloud_available: boolean
  vision_processing_active?: boolean
  frame_buffer_size?: number
  vision_stats?: VisionProcessingStats
}

export interface AgentLoadInfo {
  agent_id: string
  current_load: number
  status: AgentStatus
}

// Task Routing Types
export interface TaskRouteRequest {
  task: EdgeTask
  preferred_agents?: string[]
  exclude_agents?: string[]
}

export interface TaskRouteResponse {
  decision: EdgeDecision
  alternative_agents?: string[]
  routing_metadata: RoutingMetadata
}

export interface RoutingMetadata {
  cache_hit: boolean
  decision_path: string
  agents_considered: number
  fallback_used: boolean
}

// Agent Management Types
export interface AgentRegistrationRequest {
  agent: LocalAgent
  override_existing?: boolean
}

export interface AgentRegistrationResponse {
  success: boolean
  message: string
  agent_id: string
}

export interface AgentLoadUpdateRequest {
  load: number
}

export interface AgentLoadUpdateResponse {
  success: boolean
  message: string
  new_load: number
}

// Edge Computing Configuration
export interface EdgeComputingConfig {
  cache_size: number
  response_targets: Record<TaskPriority, number>
  enable_cloud_fallback: boolean
  enable_background_simulation: boolean
  performance_monitoring: boolean
}

// Analytics and Insights
export interface EdgeAnalytics {
  total_decisions: number
  cache_hit_rate: number
  average_response_time: number
  target_compliance_rate: number
  agent_utilization: AgentUtilizationStats[]
  decision_type_distribution: DecisionTypeStats[]
  performance_trends: PerformanceTrend[]
}

export interface AgentUtilizationStats {
  agent_id: string
  agent_type: string
  average_load: number
  peak_load: number
  tasks_processed: number
  success_rate: number
  specializations: string[]
}

export interface DecisionTypeStats {
  decision_type: EdgeDecisionType
  count: number
  percentage: number
  avg_response_time: number
  success_rate: number
}

export interface PerformanceTrend {
  metric: string
  time_period: string
  values: number[]
  timestamps: string[]
  trend_direction: 'improving' | 'stable' | 'declining'
}

// Real-time Decision Engine Types
export interface DecisionEngineStatus {
  engine_type: 'rule_based' | 'lightweight_ml' | 'hybrid'
  model_version: string
  last_updated: string
  accuracy_score: number
  processing_speed: number
}

export interface LightweightModelInfo {
  model_type: string
  input_features: string[]
  feature_importance: Record<string, number>
  inference_time_ms: number
  accuracy: number
}

export interface RuleEngineInfo {
  total_rules: number
  active_rules: string[]
  rule_priorities: Record<string, number>
  last_rule_update: string
}

// Offline Operation Types
export interface OfflineCapabilities {
  local_storage_available: boolean
  cached_decisions: number
  offline_agents: number
  autonomous_operation_time: number  // seconds
  last_cloud_sync: string
}

export interface LocalStorageInfo {
  database_size: number
  stored_decisions: number
  stored_performance_data: number
  storage_utilization: number
}

// Emergency and Fallback Types
export interface EmergencyFallback {
  trigger_reason: string
  fallback_agent: string
  confidence_level: number
  recovery_actions: string[]
  estimated_recovery_time: number
}

export interface SystemResilience {
  uptime_percentage: number
  mean_time_to_recovery: number
  failure_rate: number
  redundancy_level: number
  autonomous_operation_capability: boolean
}

// API Request/Response Types
export interface EdgeServiceInfo {
  service: string
  version: string
  features: string[]
  response_targets: Record<TaskPriority, number>
  registered_agents: number
  cache_size: number
}

export interface EdgeHealthCheck {
  status: string
  service: string
  cloud_connectivity: boolean
  local_agents: number
  cache_hit_ratio: string
  avg_response_time: string
}

// Dashboard Integration Types
export interface EdgeDashboardData {
  service_info: EdgeServiceInfo
  health_status: EdgeHealthCheck
  performance_data: EdgePerformanceData
  analytics: EdgeAnalytics
  monitoring_data: EdgeMonitoringData
  offline_capabilities: OfflineCapabilities
}

// Form Types for UI
export interface TaskCreationForm {
  task_type: string
  priority: TaskPriority
  parameters: Record<string, any>
  timeout_ms: number
  require_response: boolean
}

export interface AgentRegistrationForm {
  agent_id: string
  agent_type: string
  capabilities: Record<string, number>
  location: string
}

// Utility Types
export type EdgeTaskID = string
export type AgentID = string
export type DecisionID = string

// Export commonly used unions
export type ResponseTime = number  // milliseconds
export type ConfidenceScore = number  // 0.0 to 1.0
export type LoadPercentage = number  // 0.0 to 1.0

// Configuration Types
export interface EdgeNodeConfig {
  node_id: string
  location: string
  capabilities: string[]
  max_agents: number
  cache_size: number
  offline_duration: number
}

export interface NetworkConfig {
  cloud_endpoint: string
  backup_endpoints: string[]
  connection_timeout: number
  retry_attempts: number
  fallback_mode: 'local_only' | 'cached_decisions' | 'emergency_rules'
}

// Performance Benchmarks
export interface PerformanceBenchmark {
  priority: TaskPriority
  target_time_ms: number
  current_avg_ms: number
  compliance_rate: number
  improvement_suggestions: string[]
}

export interface BenchmarkResults {
  overall_score: number
  priority_scores: Record<TaskPriority, number>
  bottlenecks: string[]
  optimization_opportunities: string[]
}

// Real-time Streaming Types
export interface EdgeStreamData {
  type: 'decision' | 'performance' | 'agent_update' | 'cache_update'
  timestamp: string
  data: any
}

export interface StreamSubscription {
  subscription_id: string
  stream_types: string[]
  filters: Record<string, any>
  active: boolean
}

// Error and Exception Types
export interface EdgeError {
  error_code: string
  error_message: string
  error_type: 'timeout' | 'agent_unavailable' | 'cache_miss' | 'model_error'
  recovery_suggestion: string
  timestamp: string
}

export interface ErrorRecovery {
  recovery_strategy: string
  estimated_time: number
  success_probability: number
  fallback_options: string[]
}

// Export response targets constant
export const RESPONSE_TARGETS: Record<TaskPriority, number> = {
  [TaskPriority.SAFETY_CRITICAL]: 1,      // 1ms
  [TaskPriority.QUALITY_CRITICAL]: 10,    // 10ms
  [TaskPriority.EFFICIENCY_CRITICAL]: 100, // 100ms
  [TaskPriority.STANDARD]: 500            // 500ms
}

// Export priority colors for UI
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.SAFETY_CRITICAL]: '#EF4444',    // Red
  [TaskPriority.QUALITY_CRITICAL]: '#F59E0B',   // Orange
  [TaskPriority.EFFICIENCY_CRITICAL]: '#3B82F6', // Blue
  [TaskPriority.STANDARD]: '#10B981'             // Green
}

// Export decision type colors for UI
export const DECISION_TYPE_COLORS: Record<EdgeDecisionType, string> = {
  [EdgeDecisionType.CACHED]: '#10B981',           // Green
  [EdgeDecisionType.LIGHTWEIGHT_MODEL]: '#3B82F6', // Blue
  [EdgeDecisionType.RULE_BASED]: '#F59E0B',       // Orange
  [EdgeDecisionType.CLOUD_FALLBACK]: '#8B5CF6'    // Purple
}
