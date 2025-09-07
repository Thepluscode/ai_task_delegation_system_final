/**
 * Comprehensive Dashboard API Client
 * Supporting real-time monitoring, analytics, and advanced features
 */

import { api } from './client'
import { SERVICE_ENDPOINTS } from '@/config/dashboard'
import { 
  DashboardMetrics, 
  SystemHealthMetrics,
  BankingServiceMetrics,
  LearningAnalyticsMetrics,
  AgentPerformanceMetrics,
  TaskManagementMetrics,
  SystemAlert,
  ExportRequest,
  ExportResult,
  DashboardAPIResponse
} from '@/types/dashboard'

// Dashboard API Client
export const dashboardApi = {
  // Core Dashboard Endpoints
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get('/api/v1/dashboard/metrics', {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  getSystemHealth: async (): Promise<SystemHealthMetrics> => {
    const response = await api.get('/api/v1/dashboard/system-health', {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  getBankingMetrics: async (): Promise<BankingServiceMetrics> => {
    const response = await api.get('/api/v1/dashboard/banking-metrics', {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  getLearningAnalytics: async (): Promise<LearningAnalyticsMetrics> => {
    const response = await api.get('/api/v1/dashboard/learning-analytics', {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  getAgentPerformance: async (): Promise<AgentPerformanceMetrics> => {
    const response = await api.get('/api/v1/dashboard/agent-performance', {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  getTaskManagement: async (): Promise<TaskManagementMetrics> => {
    const response = await api.get('/api/v1/dashboard/task-management', {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  // Alert Management
  getAlerts: async (params?: {
    severity?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<SystemAlert[]> => {
    const response = await api.get('/api/v1/dashboard/alerts', {
      params,
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  acknowledgeAlert: async (alertId: string): Promise<void> => {
    await api.post(`/api/v1/dashboard/alerts/${alertId}/acknowledge`, {}, {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
  },

  resolveAlert: async (alertId: string, notes?: string): Promise<void> => {
    await api.post(`/api/v1/dashboard/alerts/${alertId}/resolve`, {
      resolution_notes: notes
    }, {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
  },

  // Historical Data
  getHistoricalMetrics: async (params: {
    metric: string
    start_date: string
    end_date: string
    interval?: string
  }) => {
    const response = await api.get('/api/v1/dashboard/historical-metrics', {
      params,
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  // Performance Analytics
  getPerformanceTrends: async (timeRange: string = '24h') => {
    const response = await api.get('/api/v1/dashboard/performance-trends', {
      params: { time_range: timeRange },
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  getCapacityAnalysis: async () => {
    const response = await api.get('/api/v1/dashboard/capacity-analysis', {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  // Service Health Checks
  checkServiceHealth: async (serviceName?: string) => {
    const endpoint = serviceName 
      ? `/api/v1/dashboard/health/${serviceName}`
      : '/api/v1/dashboard/health'
    
    const response = await api.get(endpoint, {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  // Real-time Updates
  subscribeToUpdates: (callback: (data: any) => void) => {
    if (typeof window === 'undefined') return null

    const ws = new WebSocket(SERVICE_ENDPOINTS.WEBSOCKET_URL)
    
    ws.onopen = () => {
      console.log('Dashboard WebSocket connected')
      ws.send(JSON.stringify({ type: 'subscribe', channels: ['dashboard'] }))
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('Dashboard WebSocket error:', error)
    }
    
    ws.onclose = () => {
      console.log('Dashboard WebSocket disconnected')
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        dashboardApi.subscribeToUpdates(callback)
      }, 5000)
    }
    
    return ws
  },

  // Export Functionality
  requestExport: async (exportRequest: ExportRequest): Promise<ExportResult> => {
    const response = await api.post('/api/v1/dashboard/export', exportRequest, {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  getExportStatus: async (exportId: string): Promise<ExportResult> => {
    const response = await api.get(`/api/v1/dashboard/export/${exportId}`, {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  downloadExport: async (exportId: string): Promise<Blob> => {
    const response = await api.get(`/api/v1/dashboard/export/${exportId}/download`, {
      responseType: 'blob',
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  // Configuration Management
  getDashboardConfig: async () => {
    const response = await api.get('/api/v1/dashboard/config', {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  updateDashboardConfig: async (config: any) => {
    const response = await api.put('/api/v1/dashboard/config', config, {
      baseURL: SERVICE_ENDPOINTS.DASHBOARD_API
    })
    return response.data
  },

  // Utility Functions
  formatMetricsForDisplay: (metrics: DashboardMetrics) => {
    return {
      systemHealth: {
        ...metrics.systemHealth,
        cpu_usage_formatted: `${metrics.systemHealth.cpu_usage.toFixed(1)}%`,
        memory_usage_formatted: `${metrics.systemHealth.memory_usage.toFixed(1)}%`,
        response_time_formatted: `${metrics.systemHealth.response_time.toFixed(2)}s`,
        uptime_formatted: dashboardApi.formatUptime(metrics.systemHealth.uptime)
      },
      bankingService: {
        ...metrics.bankingService,
        total_loans_formatted: dashboardApi.formatNumber(metrics.bankingService.total_loans_processed),
        approval_rate_formatted: `${metrics.bankingService.approval_rate.toFixed(1)}%`,
        processing_time_formatted: `${metrics.bankingService.average_processing_time.toFixed(0)} min`
      }
    }
  },

  formatNumber: (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  },

  formatUptime: (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  },

  calculateHealthScore: (metrics: SystemHealthMetrics): number => {
    const weights = {
      cpu: 0.25,
      memory: 0.25,
      response_time: 0.25,
      error_rate: 0.25
    }
    
    const cpuScore = Math.max(0, 100 - metrics.cpu_usage)
    const memoryScore = Math.max(0, 100 - metrics.memory_usage)
    const responseScore = Math.max(0, 100 - (metrics.response_time * 20))
    const errorScore = Math.max(0, 100 - (metrics.error_rate * 10))
    
    return (
      cpuScore * weights.cpu +
      memoryScore * weights.memory +
      responseScore * weights.response_time +
      errorScore * weights.error_rate
    )
  },

  generateHealthSummary: (metrics: SystemHealthMetrics): string => {
    const healthScore = dashboardApi.calculateHealthScore(metrics)
    
    if (healthScore >= 90) return 'Excellent system performance'
    if (healthScore >= 80) return 'Good system performance'
    if (healthScore >= 70) return 'Fair system performance'
    if (healthScore >= 60) return 'Poor system performance'
    return 'Critical system issues detected'
  },

  // Aggregation Functions
  aggregateServiceMetrics: async () => {
    try {
      const [systemHealth, bankingMetrics, learningAnalytics, agentPerformance, taskManagement] = await Promise.all([
        dashboardApi.getSystemHealth(),
        dashboardApi.getBankingMetrics(),
        dashboardApi.getLearningAnalytics(),
        dashboardApi.getAgentPerformance(),
        dashboardApi.getTaskManagement()
      ])

      return {
        systemHealth,
        bankingService: bankingMetrics,
        learningAnalytics,
        agentPerformance,
        taskManagement,
        alerts: await dashboardApi.getAlerts({ limit: 10 }),
        timestamp: new Date().toISOString()
      } as DashboardMetrics
    } catch (error) {
      console.error('Failed to aggregate service metrics:', error)
      throw error
    }
  },

  // Fallback Data Generation
  generateFallbackMetrics: (): DashboardMetrics => {
    const now = new Date().toISOString()
    
    return {
      systemHealth: {
        overall_status: 'warning',
        uptime: 86400,
        cpu_usage: 45.2,
        memory_usage: 62.8,
        disk_usage: 34.1,
        network_latency: 12.5,
        active_connections: 156,
        response_time: 0.85,
        error_rate: 2.1,
        services: [
          {
            service_name: 'Learning Service',
            status: 'online',
            url: SERVICE_ENDPOINTS.LEARNING_SERVICE,
            response_time: 0.45,
            last_check: now,
            version: '1.0.0',
            uptime: 86400,
            error_count: 0
          },
          {
            service_name: 'Banking Service V2',
            status: 'online',
            url: SERVICE_ENDPOINTS.BANKING_V2_SERVICE,
            response_time: 0.32,
            last_check: now,
            version: '2.0.0',
            uptime: 86400,
            error_count: 1
          }
        ],
        last_updated: now
      },
      bankingService: {
        total_loans_processed: 15420,
        loans_processed_today: 342,
        average_processing_time: 28.5,
        approval_rate: 87.3,
        ai_vs_human_performance: {
          ai_performance: {
            quality_score: 0.952,
            processing_time: 12.3,
            success_rate: 0.978,
            tasks_handled: 245,
            efficiency_rating: 0.94
          },
          human_performance: {
            quality_score: 0.918,
            processing_time: 45.2,
            success_rate: 0.952,
            tasks_handled: 97,
            efficiency_rating: 0.86
          },
          comparison: {
            quality_improvement: 3.7,
            speed_improvement: 72.8,
            cost_savings: 156000,
            efficiency_gain: 9.3
          }
        },
        agent_utilization: [],
        loan_types_breakdown: [],
        risk_distribution: {
          low_risk: { count: 8234, percentage: 53.4 },
          medium_risk: { count: 4521, percentage: 29.3 },
          high_risk: { count: 2156, percentage: 14.0 },
          regulatory_review: { count: 509, percentage: 3.3 }
        },
        processing_queue: {
          total_tasks: 45,
          pending_tasks: 12,
          in_progress_tasks: 8,
          completed_tasks: 23,
          failed_tasks: 2,
          average_wait_time: 8.5,
          estimated_completion_time: 25.3,
          queue_health: 'optimal'
        },
        performance_trends: [],
        cost_savings: {
          annual_savings: 2150000,
          monthly_savings: 179167,
          cost_per_task_ai: 2.50,
          cost_per_task_human: 15.75,
          roi_percentage: 340,
          efficiency_gain: 42.3
        },
        last_updated: now
      },
      learningAnalytics: {} as LearningAnalyticsMetrics,
      agentPerformance: {} as AgentPerformanceMetrics,
      taskManagement: {} as TaskManagementMetrics,
      alerts: [],
      timestamp: now
    }
  }
}
