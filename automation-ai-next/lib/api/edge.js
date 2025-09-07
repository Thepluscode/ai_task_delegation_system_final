import { api, apiUtils } from './client'

// Edge Computing Service API Client
export const edgeApi = {
  // Service Health and Info
  getServiceInfo: async () => {
    return api.get('/', { baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008' })
  },

  healthCheck: async () => {
    return api.get('/health', { baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008' })
  },

  // Real-time Task Processing
  routeTask: async (task) => {
    return api.post('/api/v1/edge/tasks/route', task, {
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008'
    })
  },

  // Agent Management
  registerAgent: async (agent) => {
    return api.post('/api/v1/edge/agents/register', agent, {
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008'
    })
  },

  updateAgentLoad: async (agentId, load) => {
    return api.put(`/api/v1/edge/agents/${agentId}/load`, load, {
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008'
    })
  },

  getLocalAgents: async () => {
    return api.get('/api/v1/edge/agents', {
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008'
    })
  },

  // Computer Vision Processing
  processVisionFrame: async (frameData, processingType = 'quality_inspection') => {
    return api.post('/api/v1/edge/vision/process', frameData, {
      params: { processing_type: processingType },
      headers: { 'Content-Type': 'application/octet-stream' },
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008'
    })
  },

  getAgentPerformance: async (agentId, taskType = null) => {
    const params = taskType ? { task_type: taskType } : {}
    return api.get(`/api/v1/agents/${agentId}/performance`, { 
      params,
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Performance Monitoring
  getPerformanceStats: async () => {
    return api.get('/api/v1/edge/performance', {
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008'
    })
  },

  getResponseTargets: async () => {
    return api.get('/api/v1/edge/targets', {
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008'
    })
  },

  // Cache Management
  clearCache: async () => {
    return api.post('/api/v1/edge/cache/clear', {}, {
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8008'
    })
  },

  getCacheEntries: async (limit = 100) => {
    return api.get('/api/v1/cache/entries', { 
      params: { limit },
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Decision History
  getDecisions: async (params = {}) => {
    return api.get('/api/v1/decisions', { 
      params,
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  getDecision: async (taskId) => {
    return api.get(`/api/v1/decisions/${taskId}`, { 
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  searchDecisions: async (filters) => {
    return api.post('/api/v1/decisions/search', filters, { 
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Configuration
  getConfig: async () => {
    return api.get('/api/v1/config', { 
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  updateConfig: async (config) => {
    return api.put('/api/v1/config', config, { 
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Testing and Simulation
  runTestScenario: async (scenario) => {
    return api.post('/api/v1/test/scenario', scenario, { 
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  getTestResults: async (scenarioId) => {
    return api.get(`/api/v1/test/results/${scenarioId}`, { 
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Offline Operations
  getOfflineCapabilities: async () => {
    return api.get('/api/v1/offline/capabilities', { 
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  syncOfflineDecisions: async () => {
    return api.post('/api/v1/offline/sync', {}, { 
      baseURL: process.env.NEXT_PUBLIC_EDGE_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Real-time Streaming
  subscribeToRealtimeUpdates: (callback) => {
    const wsUrl = process.env.NEXT_PUBLIC_EDGE_WS_URL || 'ws://localhost:8008'
    const ws = new WebSocket(`${wsUrl}/ws/edge/realtime`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    return ws
  },

  // Utility functions for client-side operations
  calculateResponseTimeCompliance: (decisions, priority) => {
    const targets = {
      'safety_critical': 1,
      'quality_critical': 10,
      'efficiency_critical': 100,
      'standard': 500
    }
    
    const target = targets[priority]
    if (!target) return 0
    
    const relevantDecisions = decisions.filter(d => d.task_priority === priority)
    if (relevantDecisions.length === 0) return 100
    
    const compliantDecisions = relevantDecisions.filter(d => d.processing_time_ms <= target)
    return (compliantDecisions.length / relevantDecisions.length) * 100
  },

  getDecisionTypeDistribution: (decisions) => {
    const distribution = decisions.reduce((acc, decision) => {
      acc[decision.decision_type] = (acc[decision.decision_type] || 0) + 1
      return acc
    }, {})
    
    const total = decisions.length
    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
  },

  calculateAverageResponseTime: (decisions, priority = null) => {
    let filteredDecisions = decisions
    
    if (priority) {
      filteredDecisions = decisions.filter(d => d.task_priority === priority)
    }
    
    if (filteredDecisions.length === 0) return 0
    
    const totalTime = filteredDecisions.reduce((sum, d) => sum + d.processing_time_ms, 0)
    return totalTime / filteredDecisions.length
  },

  getPerformanceTrend: (decisions, intervalMinutes = 5) => {
    const intervals = {}
    const intervalMs = intervalMinutes * 60 * 1000
    
    decisions.forEach(decision => {
      const timestamp = new Date(decision.timestamp)
      const intervalStart = new Date(Math.floor(timestamp.getTime() / intervalMs) * intervalMs)
      const key = intervalStart.toISOString()
      
      if (!intervals[key]) {
        intervals[key] = {
          timestamp: key,
          decisions: [],
          totalTime: 0,
          count: 0
        }
      }
      
      intervals[key].decisions.push(decision)
      intervals[key].totalTime += decision.processing_time_ms
      intervals[key].count += 1
    })
    
    return Object.values(intervals).map(interval => ({
      timestamp: interval.timestamp,
      avgResponseTime: interval.count > 0 ? interval.totalTime / interval.count : 0,
      requestCount: interval.count,
      decisions: interval.decisions
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  },

  // Client-side filtering and sorting
  filterDecisions: (decisions, filters) => {
    return decisions.filter(decision => {
      if (filters.priority && !filters.priority.includes(decision.task_priority)) return false
      if (filters.decision_type && !filters.decision_type.includes(decision.decision_type)) return false
      if (filters.agent_ids && !filters.agent_ids.includes(decision.assigned_agent_id)) return false
      if (filters.min_confidence && decision.confidence < filters.min_confidence) return false
      if (filters.max_response_time && decision.processing_time_ms > filters.max_response_time) return false
      if (filters.cached_only && !decision.cached) return false
      
      if (filters.time_range) {
        const decisionTime = new Date(decision.timestamp)
        const start = new Date(filters.time_range.start)
        const end = new Date(filters.time_range.end)
        if (decisionTime < start || decisionTime > end) return false
      }
      
      return true
    })
  },

  sortDecisions: (decisions, sortBy, sortOrder = 'desc') => {
    return [...decisions].sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp)
          bValue = new Date(b.timestamp)
          break
        case 'processing_time':
          aValue = a.processing_time_ms
          bValue = b.processing_time_ms
          break
        case 'confidence':
          aValue = a.confidence
          bValue = b.confidence
          break
        case 'priority':
          const priorityOrder = { 'safety_critical': 4, 'quality_critical': 3, 'efficiency_critical': 2, 'standard': 1 }
          aValue = priorityOrder[a.task_priority] || 0
          bValue = priorityOrder[b.task_priority] || 0
          break
        default:
          return 0
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
    })
  },

  // Performance analysis helpers
  analyzePerformanceBottlenecks: (performanceData) => {
    const bottlenecks = []
    
    // Check response time compliance
    Object.entries(performanceData).forEach(([priority, stats]) => {
      if (stats.target_met_percentage < 95) {
        bottlenecks.push({
          type: 'response_time',
          priority,
          severity: stats.target_met_percentage < 80 ? 'high' : 'medium',
          description: `${priority} tasks meeting target only ${stats.target_met_percentage.toFixed(1)}% of the time`,
          suggestion: 'Consider optimizing decision algorithms or increasing local processing capacity'
        })
      }
    })
    
    return bottlenecks
  },

  generateOptimizationSuggestions: (systemStatus, performanceStats, cacheStats) => {
    const suggestions = []
    
    // Cache optimization
    if (cacheStats.hit_rate < 0.8) {
      suggestions.push({
        type: 'cache',
        priority: 'high',
        description: `Cache hit rate is ${(cacheStats.hit_rate * 100).toFixed(1)}%, below optimal 80%`,
        recommendation: 'Increase cache size or adjust TTL settings',
        expected_improvement: 'Reduce response times by 20-40%'
      })
    }
    
    // Load balancing
    if (systemStatus.avg_response_time > 50) {
      suggestions.push({
        type: 'load_balancing',
        priority: 'medium',
        description: `Average response time is ${systemStatus.avg_response_time.toFixed(1)}ms`,
        recommendation: 'Review agent load distribution and capacity',
        expected_improvement: 'Reduce average response time by 15-30%'
      })
    }
    
    return suggestions
  }
}
