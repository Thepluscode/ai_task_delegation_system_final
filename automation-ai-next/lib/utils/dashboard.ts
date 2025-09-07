/**
 * Dashboard Utility Functions
 * Supporting real-time monitoring, analytics, and advanced features
 */

import { 
  ALERT_THRESHOLDS, 
  THEME_COLORS, 
  PERFORMANCE_METRICS,
  DASHBOARD_REFRESH_INTERVALS 
} from '@/config/dashboard'
import { 
  SystemAlert, 
  AlertSeverityLevel, 
  PerformanceTrend,
  ChartDataPoint,
  DashboardMetrics,
  SystemHealthMetrics,
  BankingServiceMetrics,
  AgentPerformanceMetrics
} from '@/types/dashboard'

// Health Status Utilities
export const calculateSystemHealth = (metrics: SystemHealthMetrics): 'healthy' | 'warning' | 'critical' => {
  const criticalChecks = [
    metrics.cpu_usage > ALERT_THRESHOLDS.CPU_USAGE.CRITICAL,
    metrics.memory_usage > ALERT_THRESHOLDS.MEMORY_USAGE.CRITICAL,
    metrics.error_rate > ALERT_THRESHOLDS.ERROR_RATE.CRITICAL,
    metrics.response_time > ALERT_THRESHOLDS.RESPONSE_TIME.CRITICAL
  ]

  const warningChecks = [
    metrics.cpu_usage > ALERT_THRESHOLDS.CPU_USAGE.WARNING,
    metrics.memory_usage > ALERT_THRESHOLDS.MEMORY_USAGE.WARNING,
    metrics.error_rate > ALERT_THRESHOLDS.ERROR_RATE.WARNING,
    metrics.response_time > ALERT_THRESHOLDS.RESPONSE_TIME.WARNING
  ]

  if (criticalChecks.some(check => check)) return 'critical'
  if (warningChecks.some(check => check)) return 'warning'
  return 'healthy'
}

export const getHealthStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy': return THEME_COLORS.SUCCESS
    case 'warning': return THEME_COLORS.WARNING
    case 'critical': return THEME_COLORS.ERROR
    case 'offline': return THEME_COLORS.NEUTRAL
    default: return THEME_COLORS.NEUTRAL
  }
}

export const getHealthStatusIcon = (status: string): string => {
  switch (status) {
    case 'healthy': return 'CheckCircleIcon'
    case 'warning': return 'ExclamationTriangleIcon'
    case 'critical': return 'XCircleIcon'
    case 'offline': return 'MinusCircleIcon'
    default: return 'QuestionMarkCircleIcon'
  }
}

// Performance Calculation Utilities
export const calculatePerformanceScore = (
  successRate: number,
  qualityScore: number,
  efficiencyScore: number,
  weights = { success: 0.4, quality: 0.35, efficiency: 0.25 }
): number => {
  return (
    successRate * weights.success +
    qualityScore * weights.quality +
    efficiencyScore * weights.efficiency
  )
}

export const calculateEfficiencyGain = (
  aiMetrics: { processing_time: number; quality_score: number },
  humanMetrics: { processing_time: number; quality_score: number }
): number => {
  const timeImprovement = (humanMetrics.processing_time - aiMetrics.processing_time) / humanMetrics.processing_time
  const qualityMaintained = aiMetrics.quality_score >= (humanMetrics.quality_score * 0.95)
  
  return qualityMaintained ? timeImprovement * 100 : 0
}

export const calculateCostSavings = (
  aiTasksPerDay: number,
  humanTasksPerDay: number,
  aiCostPerTask: number,
  humanCostPerTask: number
): { daily: number; monthly: number; annual: number } => {
  const dailySavings = (humanTasksPerDay * humanCostPerTask) - (aiTasksPerDay * aiCostPerTask)
  return {
    daily: dailySavings,
    monthly: dailySavings * 30,
    annual: dailySavings * 365
  }
}

// Trend Analysis Utilities
export const calculateTrend = (dataPoints: ChartDataPoint[]): PerformanceTrend => {
  if (dataPoints.length < 2) {
    return {
      metric: 'unknown',
      current_value: 0,
      previous_value: 0,
      change_percentage: 0,
      trend_direction: 'stable',
      time_period: '24h',
      data_points: dataPoints
    }
  }

  const current = dataPoints[dataPoints.length - 1]
  const previous = dataPoints[dataPoints.length - 2]
  const changePercentage = ((current.value - previous.value) / previous.value) * 100

  let trendDirection: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(changePercentage) > 5) {
    trendDirection = changePercentage > 0 ? 'up' : 'down'
  }

  return {
    metric: current.label || 'metric',
    current_value: current.value,
    previous_value: previous.value,
    change_percentage: changePercentage,
    trend_direction: trendDirection,
    time_period: '24h',
    data_points: dataPoints
  }
}

export const getTrendIcon = (direction: 'up' | 'down' | 'stable'): string => {
  switch (direction) {
    case 'up': return 'ArrowTrendingUpIcon'
    case 'down': return 'ArrowTrendingDownIcon'
    case 'stable': return 'ArrowRightIcon'
    default: return 'ArrowRightIcon'
  }
}

export const getTrendColor = (direction: 'up' | 'down' | 'stable', isPositive = true): string => {
  if (direction === 'stable') return THEME_COLORS.NEUTRAL
  
  const isGoodTrend = (direction === 'up' && isPositive) || (direction === 'down' && !isPositive)
  return isGoodTrend ? THEME_COLORS.SUCCESS : THEME_COLORS.ERROR
}

// Alert Utilities
export const generateAlert = (
  type: string,
  severity: AlertSeverityLevel,
  title: string,
  message: string,
  source: string,
  metadata: Record<string, any> = {}
): SystemAlert => {
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    severity,
    type: type as any,
    title,
    message,
    source,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    resolved: false,
    metadata,
    actions: [
      {
        id: 'acknowledge',
        label: 'Acknowledge',
        action_type: 'acknowledge',
        confirmation_required: false
      },
      {
        id: 'investigate',
        label: 'Investigate',
        action_type: 'investigate',
        confirmation_required: false
      }
    ]
  }
}

export const checkThresholds = (metrics: any): SystemAlert[] => {
  const alerts: SystemAlert[] = []

  // CPU Usage Check
  if (metrics.cpu_usage > ALERT_THRESHOLDS.CPU_USAGE.CRITICAL) {
    alerts.push(generateAlert(
      'system',
      'CRITICAL',
      'Critical CPU Usage',
      `CPU usage is at ${metrics.cpu_usage}%, exceeding critical threshold of ${ALERT_THRESHOLDS.CPU_USAGE.CRITICAL}%`,
      'system_monitor',
      { cpu_usage: metrics.cpu_usage }
    ))
  } else if (metrics.cpu_usage > ALERT_THRESHOLDS.CPU_USAGE.WARNING) {
    alerts.push(generateAlert(
      'system',
      'WARNING',
      'High CPU Usage',
      `CPU usage is at ${metrics.cpu_usage}%, exceeding warning threshold of ${ALERT_THRESHOLDS.CPU_USAGE.WARNING}%`,
      'system_monitor',
      { cpu_usage: metrics.cpu_usage }
    ))
  }

  // Response Time Check
  if (metrics.response_time > ALERT_THRESHOLDS.RESPONSE_TIME.CRITICAL) {
    alerts.push(generateAlert(
      'performance',
      'CRITICAL',
      'Critical Response Time',
      `Response time is ${metrics.response_time}s, exceeding critical threshold of ${ALERT_THRESHOLDS.RESPONSE_TIME.CRITICAL}s`,
      'performance_monitor',
      { response_time: metrics.response_time }
    ))
  }

  return alerts
}

// Data Formatting Utilities
export const formatNumber = (value: number, decimals = 0): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`
  }
  return value.toFixed(decimals)
}

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
  return date.toLocaleDateString()
}

// Chart Utilities
export const generateChartData = (
  dataPoints: ChartDataPoint[],
  label: string,
  color: string
) => {
  return {
    labels: dataPoints.map(point => new Date(point.timestamp).toLocaleTimeString()),
    datasets: [{
      label,
      data: dataPoints.map(point => point.value),
      borderColor: color,
      backgroundColor: `${color}20`,
      fill: true,
      tension: 0.4
    }]
  }
}

export const getChartColor = (index: number): string => {
  const colors = THEME_COLORS.CHART_COLORS
  return colors[index % colors.length]
}

// Performance Grade Utilities
export const getPerformanceGrade = (score: number): { grade: string; color: string } => {
  if (score >= 95) return { grade: 'A+', color: THEME_COLORS.SUCCESS }
  if (score >= 90) return { grade: 'A', color: THEME_COLORS.SUCCESS }
  if (score >= 85) return { grade: 'B+', color: THEME_COLORS.INFO }
  if (score >= 80) return { grade: 'B', color: THEME_COLORS.INFO }
  if (score >= 75) return { grade: 'C+', color: THEME_COLORS.WARNING }
  if (score >= 70) return { grade: 'C', color: THEME_COLORS.WARNING }
  if (score >= 65) return { grade: 'D+', color: THEME_COLORS.ERROR }
  if (score >= 60) return { grade: 'D', color: THEME_COLORS.ERROR }
  return { grade: 'F', color: THEME_COLORS.ERROR }
}

// Capacity Planning Utilities
export const calculateCapacityUtilization = (
  currentLoad: number,
  maxCapacity: number
): { utilization: number; status: 'optimal' | 'busy' | 'overloaded' } => {
  const utilization = (currentLoad / maxCapacity) * 100
  
  let status: 'optimal' | 'busy' | 'overloaded' = 'optimal'
  if (utilization > 90) status = 'overloaded'
  else if (utilization > 75) status = 'busy'
  
  return { utilization, status }
}

export const predictCapacityNeeds = (
  historicalData: ChartDataPoint[],
  growthRate: number = 0.1
): number => {
  if (historicalData.length === 0) return 0
  
  const latestValue = historicalData[historicalData.length - 1].value
  return latestValue * (1 + growthRate)
}

// Real-time Data Utilities
export const isDataStale = (timestamp: string, maxAgeMs: number = 300000): boolean => {
  const dataAge = Date.now() - new Date(timestamp).getTime()
  return dataAge > maxAgeMs
}

export const getRefreshInterval = (sectionId: string): number => {
  switch (sectionId) {
    case 'system-alerts':
    case 'task-management':
      return DASHBOARD_REFRESH_INTERVALS.REAL_TIME
    case 'learning-analytics':
      return DASHBOARD_REFRESH_INTERVALS.ANALYTICS
    default:
      return DASHBOARD_REFRESH_INTERVALS.STANDARD
  }
}

// Export Utilities
export const generateExportData = (
  metrics: DashboardMetrics,
  format: 'csv' | 'json'
): string => {
  if (format === 'json') {
    return JSON.stringify(metrics, null, 2)
  }
  
  // CSV format
  const csvRows = [
    'Metric,Value,Timestamp',
    `System Health,${metrics.systemHealth.overall_status},${metrics.systemHealth.last_updated}`,
    `CPU Usage,${metrics.systemHealth.cpu_usage}%,${metrics.systemHealth.last_updated}`,
    `Memory Usage,${metrics.systemHealth.memory_usage}%,${metrics.systemHealth.last_updated}`,
    `Response Time,${metrics.systemHealth.response_time}s,${metrics.systemHealth.last_updated}`,
    `Total Loans,${metrics.bankingService.total_loans_processed},${metrics.bankingService.last_updated}`,
    `Approval Rate,${metrics.bankingService.approval_rate}%,${metrics.bankingService.last_updated}`,
  ]
  
  return csvRows.join('\n')
}

// Validation Utilities
export const validateMetrics = (metrics: any): boolean => {
  const requiredFields = ['systemHealth', 'bankingService', 'timestamp']
  return requiredFields.every(field => field in metrics)
}

export const sanitizeMetrics = (metrics: any): DashboardMetrics => {
  // Ensure all numeric values are valid
  const sanitized = { ...metrics }
  
  if (sanitized.systemHealth) {
    sanitized.systemHealth.cpu_usage = Math.max(0, Math.min(100, sanitized.systemHealth.cpu_usage || 0))
    sanitized.systemHealth.memory_usage = Math.max(0, Math.min(100, sanitized.systemHealth.memory_usage || 0))
    sanitized.systemHealth.response_time = Math.max(0, sanitized.systemHealth.response_time || 0)
  }
  
  return sanitized
}
