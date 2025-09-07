// Banking Learning Service Adapter TypeScript Types

export enum LoanType {
  PERSONAL = 'personal_loan',
  MORTGAGE = 'mortgage_loan',
  BUSINESS = 'business_loan',
  AUTO = 'auto_loan',
  CREDIT_LINE = 'credit_line',
}

export enum AgentType {
  AI_SYSTEM = 'ai_underwriter',
  JUNIOR_ANALYST = 'junior_loan_officer',
  SENIOR_ANALYST = 'senior_loan_officer',
  SPECIALIST = 'loan_specialist',
  COMPLIANCE_OFFICER = 'compliance_officer',
}

export enum RiskLevel {
  LOW = 'low_risk',
  MEDIUM = 'medium_risk',
  HIGH = 'high_risk',
  REGULATORY = 'regulatory_review',
}

// Core Banking Types
export interface LoanDelegationRequest {
  application_id: string
  loan_type: LoanType
  loan_amount: number
  credit_score: number
  debt_to_income: number
  documentation_quality: number
  applicant_history?: string
}

export interface LoanFeedbackRequest {
  application_id: string
  agent_id: string
  loan_type: string
  estimated_duration: number
  actual_duration: number
  approved: boolean
  approval_accuracy: number
  compliance_score: number
  customer_satisfaction: number
  processing_quality: number
}

export interface LoanDelegationResult {
  application_id: string
  assigned_agent: string
  agent_type: string
  risk_level: string
  complexity_score: number
  estimated_processing_time: number
  predicted_success_rate: number
  confidence: number
  reasoning: string
  delegation_timestamp: string
}

export interface LoanApplicationTask {
  application_id: string
  loan_type: LoanType
  loan_amount: number
  credit_score: number
  debt_to_income: number
  documentation_quality: number
  applicant_history: string
  risk_level: RiskLevel
  complexity_score: number
}

// Banking Analytics Types
export interface BankingOverview {
  total_loans_processed: number | string
  agents_active: number
  loan_types_handled: string[]
}

export interface BankingPerformanceMetrics {
  average_processing_time: string
  approval_accuracy: string
  system_efficiency: string
}

export interface BankingAgentRanking {
  agent_id: string
  estimated_quality?: number
  quality_score?: number
  total_tasks?: number
  success_rate?: number
}

export interface BankingAnalytics {
  banking_overview: BankingOverview
  performance_metrics: BankingPerformanceMetrics
  agent_rankings: BankingAgentRanking[]
  recommendations: string[]
  data_source: 'live_learning_service' | 'fallback_estimates'
}

// Loan Processing Types
export interface LoanAgent {
  id: string
  type: AgentType
  available: boolean
  specializations?: LoanType[]
  performance_metrics?: {
    success_rate: number
    avg_processing_time: number
    quality_score: number
    total_loans_processed: number
  }
}

export interface LoanProcessingHistory {
  application_id: string
  loan_type: LoanType
  loan_amount: number
  assigned_agent: string
  processing_time: number
  approved: boolean
  quality_metrics: {
    approval_accuracy: number
    compliance_score: number
    customer_satisfaction: number
    processing_quality: number
  }
  timestamp: string
}

// Dashboard and Monitoring Types
export interface LoanProcessingMetrics {
  total_applications: number
  applications_today: number
  average_processing_time: number
  approval_rate: number
  quality_score: number
  agent_utilization: number
}

export interface LoanTypeMetrics {
  loan_type: LoanType
  count: number
  avg_amount: number
  avg_processing_time: number
  approval_rate: number
  avg_quality_score: number
}

export interface RiskDistribution {
  risk_level: RiskLevel
  count: number
  percentage: number
  avg_processing_time: number
  approval_rate: number
}

export interface AgentPerformanceMetrics {
  agent_id: string
  agent_type: AgentType
  loans_processed: number
  avg_processing_time: number
  success_rate: number
  quality_score: number
  specialization_scores: Record<LoanType, number>
  current_load: number
  availability: boolean
}

// Real-time Monitoring Types
export interface LoanProcessingEvent {
  event_type: 'delegation' | 'completion' | 'feedback' | 'agent_update'
  timestamp: string
  data: any
}

export interface LoanDelegationEvent extends LoanProcessingEvent {
  event_type: 'delegation'
  data: {
    delegation: LoanDelegationResult
    loan_details: LoanApplicationTask
  }
}

export interface LoanCompletionEvent extends LoanProcessingEvent {
  event_type: 'completion'
  data: {
    application_id: string
    agent_id: string
    processing_time: number
    approved: boolean
    quality_metrics: Record<string, number>
  }
}

// Configuration and Settings Types
export interface BankingConfiguration {
  risk_thresholds: {
    high_risk_credit_score: number
    high_risk_debt_ratio: number
    regulatory_amount_threshold: number
  }
  delegation_rules: {
    ai_max_amount: number
    ai_min_credit_score: number
    senior_required_amount: number
    compliance_required_amount: number
  }
  performance_targets: {
    max_processing_time: Record<LoanType, number>
    min_approval_accuracy: number
    min_compliance_score: number
    min_customer_satisfaction: number
  }
}

// Loan Application Builder Types
export interface LoanApplicationBuilder {
  application_id: string
  applicant_info: {
    name: string
    email: string
    phone: string
    ssn?: string
  }
  loan_details: {
    type: LoanType
    amount: number
    purpose: string
    term_months: number
  }
  financial_info: {
    annual_income: number
    employment_status: string
    credit_score: number
    existing_debt: number
    assets: number
  }
  documentation: {
    income_verification: boolean
    credit_report: boolean
    bank_statements: boolean
    tax_returns: boolean
    quality_score: number
  }
}

// Bulk Operations Types
export interface BulkLoanProcessing {
  applications: LoanDelegationRequest[]
  processing_options: {
    parallel_processing: boolean
    max_concurrent: number
    priority_order: 'amount' | 'risk' | 'type' | 'fifo'
  }
}

export interface BulkProcessingResult {
  total_applications: number
  successful_delegations: number
  failed_delegations: number
  processing_time: number
  delegations: LoanDelegationResult[]
  errors: Array<{
    application_id: string
    error: string
  }>
}

// Reporting Types
export interface LoanProcessingReport {
  period: {
    start: string
    end: string
    duration_days: number
  }
  summary: {
    total_applications: number
    total_amount: number
    approval_rate: number
    avg_processing_time: number
    quality_score: number
  }
  by_loan_type: LoanTypeMetrics[]
  by_risk_level: RiskDistribution[]
  by_agent: AgentPerformanceMetrics[]
  trends: Array<{
    date: string
    applications: number
    approvals: number
    avg_processing_time: number
    quality_score: number
  }>
  recommendations: string[]
}

// Search and Filtering Types
export interface LoanApplicationFilter {
  loan_types?: LoanType[]
  risk_levels?: RiskLevel[]
  agent_types?: AgentType[]
  amount_range?: {
    min: number
    max: number
  }
  credit_score_range?: {
    min: number
    max: number
  }
  date_range?: {
    start: string
    end: string
  }
  approval_status?: boolean[]
  quality_threshold?: number
}

export interface LoanApplicationSearchResult {
  applications: LoanProcessingHistory[]
  total_count: number
  facets: {
    loan_types: Record<LoanType, number>
    risk_levels: Record<RiskLevel, number>
    agents: Record<string, number>
    approval_rates: Array<{
      range: string
      count: number
    }>
  }
}

// Integration Types
export interface BankingServiceStatus {
  service_status: 'online' | 'offline' | 'degraded'
  learning_service_connected: boolean
  total_agents: number
  active_delegations: number
  avg_response_time: number
  error_rate: number
  uptime_hours: number
}

export interface BankingServiceInfo {
  service: string
  status: string
  capabilities: string[]
  supported_loan_types: string[]
  version?: string
}

// Notification and Alert Types
export interface BankingAlert {
  id: string
  type: 'performance' | 'compliance' | 'system' | 'quality'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: string
  resolved: boolean
  related_entity?: {
    type: 'agent' | 'application' | 'loan_type'
    id: string
  }
}

export interface BankingNotification {
  id: string
  type: 'delegation' | 'completion' | 'milestone' | 'alert'
  title: string
  message: string
  timestamp: string
  read: boolean
  action_required: boolean
  related_application?: string
}

// Performance Optimization Types
export interface BankingOptimizationSuggestion {
  type: 'delegation' | 'agent_training' | 'process' | 'technology'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expected_impact: {
    processing_time_reduction: number
    quality_improvement: number
    cost_savings: number
  }
  implementation_effort: 'low' | 'medium' | 'high'
  estimated_roi: number
}

export interface BankingPerformanceOptimization {
  current_performance: BankingPerformanceMetrics
  optimization_opportunities: BankingOptimizationSuggestion[]
  projected_improvements: {
    processing_time_reduction: number
    quality_improvement: number
    efficiency_gain: number
  }
  implementation_roadmap: Array<{
    phase: number
    suggestions: string[]
    timeline: string
    expected_impact: number
  }>
}
