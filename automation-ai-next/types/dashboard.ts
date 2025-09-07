/**
 * Comprehensive Dashboard TypeScript Types
 * Supporting real-time monitoring, analytics, and advanced features
 */

import { ALERT_SEVERITY, DASHBOARD_SECTIONS, THEME_COLORS } from '@/config/dashboard'

// Core Dashboard Types
export interface DashboardMetrics {
  systemHealth: SystemHealthMetrics
  bankingService: BankingServiceMetrics
  learningAnalytics: LearningAnalyticsMetrics
  agentPerformance: AgentPerformanceMetrics
  taskManagement: TaskManagementMetrics
  alerts: SystemAlert[]
  timestamp: string
}

// System Health Metrics
export interface SystemHealthMetrics {
  overall_status: 'healthy' | 'warning' | 'critical' | 'offline'
  uptime: number
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_latency: number
  active_connections: number
  response_time: number
  error_rate: number
  services: ServiceHealthStatus[]
  last_updated: string
}

export interface ServiceHealthStatus {
  service_name: string
  status: 'online' | 'offline' | 'degraded'
  url: string
  response_time: number
  last_check: string
  version: string
  uptime: number
  error_count: number
}

// Banking Service Metrics
export interface BankingServiceMetrics {
  total_loans_processed: number
  loans_processed_today: number
  average_processing_time: number
  approval_rate: number
  ai_vs_human_performance: AIvsHumanMetrics
  agent_utilization: AgentUtilization[]
  loan_types_breakdown: LoanTypeBreakdown[]
  risk_distribution: RiskDistribution
  processing_queue: ProcessingQueue
  performance_trends: PerformanceTrend[]
  cost_savings: CostSavingsMetrics
  last_updated: string
}

export interface AIvsHumanMetrics {
  ai_performance: {
    quality_score: number
    processing_time: number
    success_rate: number
    tasks_handled: number
    efficiency_rating: number
  }
  human_performance: {
    quality_score: number
    processing_time: number
    success_rate: number
    tasks_handled: number
    efficiency_rating: number
  }
  comparison: {
    quality_improvement: number
    speed_improvement: number
    cost_savings: number
    efficiency_gain: number
  }
}

export interface AgentUtilization {
  agent_id: string
  agent_type: 'ai' | 'human'
  current_load: number
  max_capacity: number
  utilization_percentage: number
  tasks_in_queue: number
  average_task_time: number
  specialization: string[]
  performance_score: number
  status: 'active' | 'idle' | 'offline' | 'overloaded'
}

export interface LoanTypeBreakdown {
  loan_type: string
  count: number
  percentage: number
  average_amount: number
  approval_rate: number
  processing_time: number
  preferred_agent_type: 'ai' | 'human' | 'either'
}

export interface RiskDistribution {
  low_risk: { count: number; percentage: number }
  medium_risk: { count: number; percentage: number }
  high_risk: { count: number; percentage: number }
  regulatory_review: { count: number; percentage: number }
}

export interface ProcessingQueue {
  total_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  failed_tasks: number
  average_wait_time: number
  estimated_completion_time: number
  queue_health: 'optimal' | 'busy' | 'overloaded'
}

export interface CostSavingsMetrics {
  annual_savings: number
  monthly_savings: number
  cost_per_task_ai: number
  cost_per_task_human: number
  roi_percentage: number
  efficiency_gain: number
}

// Learning Analytics Metrics
export interface LearningAnalyticsMetrics {
  model_performance: ModelPerformanceMetrics
  training_progress: TrainingProgressMetrics
  insights_generated: InsightMetrics
  prediction_accuracy: PredictionAccuracyMetrics
  learning_trends: LearningTrend[]
  data_quality: DataQualityMetrics
  last_updated: string
}

export interface ModelPerformanceMetrics {
  overall_accuracy: number
  confidence_level: number
  model_maturity: number
  training_samples: number
  validation_accuracy: number
  prediction_speed: number
  model_version: string
  last_training: string
}

export interface TrainingProgressMetrics {
  current_epoch: number
  total_epochs: number
  training_loss: number
  validation_loss: number
  learning_rate: number
  estimated_completion: string
  training_status: 'training' | 'completed' | 'paused' | 'failed'
}

export interface InsightMetrics {
  total_insights: number
  high_impact_insights: number
  actionable_recommendations: number
  insights_by_category: Record<string, number>
  recent_insights: LearningInsight[]
}

export interface LearningInsight {
  id: string
  type: 'performance' | 'agent' | 'task' | 'system'
  title: string
  description: string
  impact_score: number
  confidence: number
  recommendations: string[]
  generated_at: string
  status: 'new' | 'acknowledged' | 'implemented' | 'dismissed'
}

export interface PredictionAccuracyMetrics {
  agent_performance_accuracy: number
  task_complexity_accuracy: number
  processing_time_accuracy: number
  success_rate_accuracy: number
  overall_prediction_score: number
}

export interface DataQualityMetrics {
  completeness: number
  accuracy: number
  consistency: number
  timeliness: number
  validity: number
  overall_quality_score: number
}

// Agent Performance Metrics
export interface AgentPerformanceMetrics {
  individual_agents: IndividualAgentMetrics[]
  team_performance: TeamPerformanceMetrics
  performance_rankings: AgentRanking[]
  specialization_analysis: SpecializationAnalysis[]
  efficiency_comparisons: EfficiencyComparison[]
  performance_trends: AgentPerformanceTrend[]
  last_updated: string
}

export interface IndividualAgentMetrics {
  agent_id: string
  agent_type: 'ai' | 'human'
  name: string
  performance_score: number
  tasks_completed: number
  success_rate: number
  average_quality: number
  average_processing_time: number
  specializations: string[]
  current_status: 'active' | 'idle' | 'offline'
  workload: number
  efficiency_rating: number
  customer_satisfaction: number
  recent_performance: PerformanceDataPoint[]
}

export interface TeamPerformanceMetrics {
  total_agents: number
  active_agents: number
  team_efficiency: number
  collective_success_rate: number
  team_workload_distribution: WorkloadDistribution[]
  collaboration_score: number
  knowledge_sharing_index: number
}

export interface AgentRanking {
  rank: number
  agent_id: string
  agent_type: 'ai' | 'human'
  composite_score: number
  performance_category: 'excellent' | 'good' | 'average' | 'needs_improvement'
  strengths: string[]
  improvement_areas: string[]
}

export interface SpecializationAnalysis {
  specialization: string
  agent_count: number
  performance_score: number
  demand_level: 'high' | 'medium' | 'low'
  capacity_utilization: number
  recommended_actions: string[]
}

export interface EfficiencyComparison {
  metric: string
  ai_score: number
  human_score: number
  improvement_potential: number
  recommendation: string
}

// Task Management Metrics
export interface TaskManagementMetrics {
  queue_status: QueueStatus
  processing_statistics: ProcessingStatistics
  task_distribution: TaskDistribution
  bottleneck_analysis: BottleneckAnalysis[]
  sla_compliance: SLACompliance
  capacity_planning: CapacityPlanningMetrics
  last_updated: string
}

export interface QueueStatus {
  total_queued: number
  high_priority: number
  medium_priority: number
  low_priority: number
  overdue_tasks: number
  average_wait_time: number
  longest_waiting_task: number
  queue_health_score: number
}

export interface ProcessingStatistics {
  tasks_processed_today: number
  tasks_processed_this_hour: number
  average_processing_time: number
  throughput_per_hour: number
  peak_processing_time: string
  success_rate: number
  error_rate: number
}

export interface TaskDistribution {
  by_type: Record<string, number>
  by_priority: Record<string, number>
  by_complexity: Record<string, number>
  by_agent_type: Record<string, number>
}

export interface BottleneckAnalysis {
  bottleneck_type: 'agent_capacity' | 'system_resource' | 'data_dependency' | 'external_service'
  severity: 'low' | 'medium' | 'high' | 'critical'
  affected_tasks: number
  estimated_delay: number
  recommended_action: string
  resolution_eta: string
}

export interface SLACompliance {
  overall_compliance: number
  by_priority: Record<string, number>
  by_task_type: Record<string, number>
  violations_today: number
  at_risk_tasks: number
}

export interface CapacityPlanningMetrics {
  current_capacity: number
  peak_capacity: number
  capacity_utilization: number
  projected_demand: number
  capacity_gap: number
  scaling_recommendations: string[]
}

// System Alerts
export interface SystemAlert {
  id: string
  severity: keyof typeof ALERT_SEVERITY
  type: 'system' | 'performance' | 'security' | 'business' | 'user'
  title: string
  message: string
  source: string
  timestamp: string
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  resolved: boolean
  resolved_at?: string
  resolution_notes?: string
  metadata: Record<string, any>
  actions: AlertAction[]
}

export interface AlertAction {
  id: string
  label: string
  action_type: 'acknowledge' | 'resolve' | 'escalate' | 'investigate' | 'custom'
  url?: string
  confirmation_required: boolean
}

// Real-time Data Types
export interface RealTimeUpdate {
  type: 'metrics' | 'alert' | 'status' | 'performance'
  data: any
  timestamp: string
  source: string
}

export interface WebSocketMessage {
  event: string
  data: RealTimeUpdate
  timestamp: string
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: string
  value: number
  label?: string
  metadata?: Record<string, any>
}

export interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  borderColor: string
  backgroundColor: string
  fill?: boolean
  tension?: number
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter'
  data: {
    labels: string[]
    datasets: ChartDataset[]
  }
  options: Record<string, any>
}

// Performance Trends
export interface PerformanceTrend {
  metric: string
  current_value: number
  previous_value: number
  change_percentage: number
  trend_direction: 'up' | 'down' | 'stable'
  time_period: string
  data_points: ChartDataPoint[]
}

export interface LearningTrend {
  metric: string
  values: number[]
  timestamps: string[]
  trend: 'improving' | 'stable' | 'declining'
  confidence: number
}

export interface AgentPerformanceTrend {
  agent_id: string
  metric: string
  trend_data: ChartDataPoint[]
  trend_direction: 'improving' | 'stable' | 'declining'
  prediction: number[]
}

// Dashboard Layout Types
export interface DashboardWidget {
  id: string
  type: string
  title: string
  size: { width: number; height: number }
  position: { x: number; y: number }
  config: Record<string, any>
  data_source: string
  refresh_interval: number
  visible: boolean
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: DashboardWidget[]
  created_at: string
  updated_at: string
  is_default: boolean
}

// Export Types
export interface ExportRequest {
  format: 'pdf' | 'csv' | 'json' | 'xlsx'
  data_type: 'metrics' | 'alerts' | 'performance' | 'all'
  date_range: {
    start: string
    end: string
  }
  include_charts: boolean
  filters?: Record<string, any>
}

export interface ExportResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  download_url?: string
  file_size?: number
  created_at: string
  expires_at: string
  error_message?: string
}

// Utility Types
export type DashboardSection = keyof typeof DASHBOARD_SECTIONS
export type AlertSeverityLevel = keyof typeof ALERT_SEVERITY
export type ThemeColorKey = keyof typeof THEME_COLORS

// API Response Types
export interface DashboardAPIResponse<T = any> {
  success: boolean
  data: T
  message?: string
  timestamp: string
  version: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Configuration Types
export interface DashboardConfig {
  refresh_intervals: Record<string, number>
  alert_thresholds: Record<string, any>
  theme: Record<string, string>
  features: Record<string, boolean>
  layout: DashboardLayout
}
