// AI Learning Service TypeScript Types

// Core Learning Types
export interface TaskCompletionFeedback {
  delegation_id: string
  task_id: string
  agent_id: string
  task_type: string
  priority: string
  requirements: string[]
  estimated_duration: number
  actual_duration: number
  success: boolean
  quality_score: number
  completion_timestamp: string
  performance_metrics: Record<string, number>
}

export interface TrainingSample extends TaskCompletionFeedback {
  duration_accuracy: number
  efficiency_score: number
}

// Agent Performance Types
export interface AgentPerformanceProfile {
  agent_id: string
  task_history: TrainingSample[]
  last_updated: string
}

export interface AgentPerformancePrediction {
  agent_id: string
  task_type: string
  predicted_success_rate: number
  predicted_duration: number
  predicted_quality: number
  confidence: number
  factors: {
    experience: number
    task_affinity: number
    recent_performance: number
    consistency: number
  }
  total_experience: number
  note?: string
}

export interface AgentRanking {
  agent_id: string
  composite_score: number
  success_rate: number
  quality_score: number
  efficiency_score: number
  total_tasks: number
  specialization: string
}

export interface AgentRankingsResponse {
  task_type: string
  rankings: AgentRanking[]
  total_agents: number
  generated_at: string
}

// Task Complexity Types
export interface TaskComplexityModel {
  task_type: string
  samples: TrainingSample[]
  last_updated: string
}

export interface TaskComplexityAnalysis {
  task_type: string
  complexity_score: number
  difficulty_factors: {
    duration_factor: number
    difficulty_factor: number
    variability_factor: number
  }
  recommended_agent_types: string[]
  estimated_duration_range: {
    min: number
    max: number
    average: number
    median: number
  }
  sample_size: number
  success_rate: number
  note?: string
}

// Learning Insights Types
export interface LearningInsight {
  insights_type: 'performance' | 'agent' | 'task' | 'system'
  description: string
  impact_score: number
  actionable_recommendations: string[]
  generated_at: string
}

export interface LearningInsightsResponse {
  total_insights: number
  insights: LearningInsight[]
  categories: {
    performance_optimization: number
    agent_recommendations: number
    task_optimization: number
    system_improvements: number
  }
  last_generated: string | null
}

// Dashboard Types
export interface SystemOverview {
  total_training_samples: number
  agents_profiled: number
  task_types_analyzed: number
  insights_generated: number
}

export interface PerformanceTrends {
  recent_success_rate: number
  recent_quality_score: number
  duration_prediction_accuracy: number
  trend_direction: 'improving' | 'stable' | 'needs_attention'
}

export interface TopPerformer {
  agent_id: string
  quality_score: number
}

export interface ComplexTask {
  task_type: string
  complexity_score: number
}

export interface LearningStatus {
  model_maturity: number
  confidence_level: number
  recommendation_quality: 'high' | 'medium' | 'developing'
}

export interface LearningDashboard {
  system_overview: SystemOverview
  performance_trends: PerformanceTrends
  top_performers: TopPerformer[]
  complex_tasks: ComplexTask[]
  learning_status: LearningStatus
}

// Service Info Types
export interface LearningServiceInfo {
  service: string
  status: string
  capabilities: string[]
  models_trained: number
  training_samples: number
}

// API Response Types
export interface FeedbackSubmissionResponse {
  message: string
  training_samples: number
  agent_profile_updated: string
  insights_generated: number
}

// Real-time Learning Types
export interface LearningEvent {
  event_type: 'feedback' | 'prediction' | 'insight' | 'model_update'
  timestamp: string
  data: any
}

export interface FeedbackEvent extends LearningEvent {
  event_type: 'feedback'
  data: {
    feedback: TaskCompletionFeedback
    training_samples_count: number
    agent_updated: string
  }
}

export interface PredictionEvent extends LearningEvent {
  event_type: 'prediction'
  data: {
    prediction: AgentPerformancePrediction
    request_context: any
  }
}

export interface InsightEvent extends LearningEvent {
  event_type: 'insight'
  data: {
    insight: LearningInsight
    trigger: string
  }
}

// Performance Analysis Types
export interface PerformanceAnalysis {
  agent_id: string
  time_period: {
    start: string
    end: string
    duration_days: number
  }
  task_breakdown: Record<string, {
    count: number
    success_rate: number
    avg_quality: number
    avg_duration: number
  }>
  performance_trends: Array<{
    date: string
    success_rate: number
    quality_score: number
    efficiency_score: number
    task_count: number
  }>
  strengths: string[]
  improvement_areas: string[]
  recommendations: string[]
}

// Model Training Types
export interface ModelTrainingStatus {
  model_type: string
  training_progress: number
  samples_processed: number
  current_accuracy: number
  estimated_completion: string
  status: 'training' | 'completed' | 'failed' | 'pending'
}

export interface ModelPerformanceMetrics {
  model_type: string
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  training_samples: number
  validation_samples: number
  last_updated: string
}

// Prediction Confidence Types
export interface PredictionConfidence {
  overall_confidence: number
  factors: {
    data_quality: number
    sample_size: number
    model_maturity: number
    task_similarity: number
  }
  reliability_score: number
  confidence_interval: {
    lower: number
    upper: number
  }
}

// Learning Configuration Types
export interface LearningConfiguration {
  model_settings: {
    min_samples_for_prediction: number
    confidence_threshold: number
    model_update_frequency: number
    max_training_samples: number
  }
  insight_generation: {
    min_samples_for_insights: number
    insight_generation_frequency: number
    max_insights_stored: number
  }
  performance_tracking: {
    performance_window_days: number
    trend_analysis_samples: number
    outlier_detection_enabled: boolean
  }
}

// Batch Processing Types
export interface BatchFeedbackRequest {
  feedback_items: TaskCompletionFeedback[]
  processing_options: {
    parallel_processing: boolean
    validate_data: boolean
    generate_insights: boolean
  }
}

export interface BatchFeedbackResponse {
  total_processed: number
  successful: number
  failed: number
  processing_time_ms: number
  insights_generated: number
  errors: Array<{
    index: number
    error: string
  }>
}

// Export and Import Types
export interface LearningDataExport {
  export_timestamp: string
  data_version: string
  training_data: TrainingSample[]
  agent_profiles: Record<string, AgentPerformanceProfile>
  task_models: Record<string, TaskComplexityModel>
  insights: LearningInsight[]
  metadata: {
    total_samples: number
    date_range: {
      start: string
      end: string
    }
    export_format: string
  }
}

export interface LearningDataImport {
  import_data: LearningDataExport
  import_options: {
    merge_strategy: 'replace' | 'merge' | 'append'
    validate_data: boolean
    backup_existing: boolean
  }
}

// Search and Filtering Types
export interface LearningDataFilter {
  agent_ids?: string[]
  task_types?: string[]
  date_range?: {
    start: string
    end: string
  }
  success_only?: boolean
  min_quality_score?: number
  priority_levels?: string[]
}

export interface LearningDataSearchResult {
  training_samples: TrainingSample[]
  total_count: number
  facets: {
    agents: Record<string, number>
    task_types: Record<string, number>
    success_rates: Array<{
      range: string
      count: number
    }>
    quality_ranges: Array<{
      range: string
      count: number
    }>
  }
}

// Optimization Types
export interface OptimizationSuggestion {
  type: 'agent_assignment' | 'task_routing' | 'performance_improvement' | 'system_optimization'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expected_impact: {
    success_rate_improvement: number
    quality_improvement: number
    efficiency_gain: number
  }
  implementation_steps: string[]
  estimated_effort: 'low' | 'medium' | 'high'
  confidence: number
}

export interface OptimizationReport {
  generated_at: string
  analysis_period: {
    start: string
    end: string
  }
  current_performance: {
    overall_success_rate: number
    average_quality_score: number
    system_efficiency: number
  }
  optimization_opportunities: OptimizationSuggestion[]
  projected_improvements: {
    success_rate_increase: number
    quality_improvement: number
    efficiency_gain: number
    roi_estimate: number
  }
}

// Monitoring and Alerting Types
export interface LearningAlert {
  id: string
  type: 'performance_degradation' | 'model_drift' | 'data_quality' | 'system_anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  affected_entities: string[]
  recommended_actions: string[]
  resolved: boolean
  resolution_notes?: string
}

export interface LearningMonitoringMetrics {
  system_health: {
    model_accuracy: number
    prediction_confidence: number
    data_quality_score: number
    system_load: number
  }
  performance_indicators: {
    recent_success_rate: number
    quality_trend: 'improving' | 'stable' | 'declining'
    prediction_accuracy: number
    insight_relevance: number
  }
  alerts: {
    active_alerts: number
    critical_alerts: number
    recent_alerts: LearningAlert[]
  }
}
