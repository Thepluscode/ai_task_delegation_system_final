import { api, apiUtils } from './client'

// AI Learning Service API Client
export const learningApi = {
  // Service Health and Info
  getServiceInfo: async () => {
    return api.get('/', { baseURL: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004' })
  },

  healthCheck: async () => {
    return api.get('/health', { baseURL: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004' })
  },

  // Feedback Submission
  submitTaskFeedback: async (feedback) => {
    return api.post('/api/v1/learning/feedback', feedback, { 
      baseURL: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Performance Prediction
  predictAgentPerformance: async (agentId, taskType = 'general') => {
    return api.get(`/api/v1/learning/predict-performance/${agentId}`, {
      params: { task_type: taskType },
      baseURL: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004'
    })
  },

  // Task Complexity Analysis
  analyzeTaskComplexity: async (taskType) => {
    return api.get(`/api/v1/learning/analyze-complexity/${taskType}`, { 
      baseURL: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Learning Insights
  getLearningInsights: async () => {
    return api.get('/api/v1/learning/insights', { 
      baseURL: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Agent Rankings
  getAgentRankings: async (taskType = null) => {
    const params = taskType ? { task_type: taskType } : {}
    return api.get('/api/v1/learning/agent-rankings', {
      params,
      baseURL: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004'
    })
  },

  // Learning Dashboard
  getLearningDashboard: async () => {
    return api.get('/api/v1/learning/dashboard', { 
      baseURL: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004' 
    })
  },

  // Utility functions for client-side operations
  calculatePerformanceScore: (successRate, qualityScore, efficiencyScore) => {
    return (successRate * 0.4 + qualityScore * 0.35 + efficiencyScore * 0.25)
  },

  calculateDurationAccuracy: (estimated, actual) => {
    return Math.abs(estimated - actual) / Math.max(estimated, 1)
  },

  calculateEfficiencyScore: (estimated, actual) => {
    return estimated / Math.max(actual, 1)
  },

  formatConfidenceLevel: (confidence) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    if (confidence >= 0.4) return 'Low'
    return 'Very Low'
  },

  getConfidenceColor: (confidence) => {
    if (confidence >= 0.8) return 'text-success-600'
    if (confidence >= 0.6) return 'text-warning-600'
    if (confidence >= 0.4) return 'text-orange-600'
    return 'text-error-600'
  },

  getTrendDirection: (trendValue) => {
    if (trendValue === 'improving') return { icon: '↗️', color: 'text-success-600', label: 'Improving' }
    if (trendValue === 'stable') return { icon: '→', color: 'text-warning-600', label: 'Stable' }
    return { icon: '↘️', color: 'text-error-600', label: 'Needs Attention' }
  },

  getInsightTypeColor: (insightType) => {
    const colors = {
      'performance': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'agent': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'task': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'system': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return colors[insightType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  },

  getInsightTypeIcon: (insightType) => {
    const icons = {
      'performance': '📈',
      'agent': '👤',
      'task': '📋',
      'system': '⚙️'
    }
    return icons[insightType] || '💡'
  },

  getRecommendationQualityColor: (quality) => {
    const colors = {
      'high': 'text-success-600',
      'medium': 'text-warning-600',
      'developing': 'text-error-600'
    }
    return colors[quality] || 'text-gray-600'
  },

  formatModelMaturity: (maturity) => {
    const percentage = Math.round(maturity * 100)
    if (percentage >= 90) return { label: 'Mature', color: 'text-success-600' }
    if (percentage >= 70) return { label: 'Developing', color: 'text-warning-600' }
    if (percentage >= 50) return { label: 'Learning', color: 'text-orange-600' }
    return { label: 'Initial', color: 'text-error-600' }
  },

  generateFeedbackFromResult: (taskResult, agentId, taskType) => {
    const now = new Date().toISOString()
    
    return {
      delegation_id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      task_id: taskResult.task_id || `task-${Date.now()}`,
      agent_id: agentId,
      task_type: taskType,
      priority: taskResult.priority || 'medium',
      requirements: taskResult.requirements || ['general_processing'],
      estimated_duration: taskResult.estimated_duration || 60,
      actual_duration: taskResult.actual_duration || taskResult.estimated_duration || 60,
      success: taskResult.success !== undefined ? taskResult.success : true,
      quality_score: taskResult.quality_score || 0.8,
      completion_timestamp: now,
      performance_metrics: taskResult.performance_metrics || {
        accuracy: 0.85,
        efficiency: 0.80,
        customer_satisfaction: 0.75
      }
    }
  },

  analyzeAgentSpecialization: (agentHistory) => {
    if (!agentHistory || agentHistory.length === 0) {
      return { specialization: 'general', confidence: 0, taskTypes: {} }
    }

    const taskTypeCounts = agentHistory.reduce((acc, task) => {
      acc[task.task_type] = (acc[task.task_type] || 0) + 1
      return acc
    }, {})

    const totalTasks = agentHistory.length
    const mostCommonType = Object.entries(taskTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]

    if (!mostCommonType) {
      return { specialization: 'general', confidence: 0, taskTypes: {} }
    }

    const [specialization, count] = mostCommonType
    const confidence = count / totalTasks

    return {
      specialization,
      confidence,
      taskTypes: Object.entries(taskTypeCounts).map(([type, count]) => ({
        type,
        count,
        percentage: (count / totalTasks) * 100
      }))
    }
  },

  calculatePerformanceTrend: (performanceHistory, windowSize = 5) => {
    if (!performanceHistory || performanceHistory.length < windowSize) {
      return { trend: 'insufficient_data', change: 0 }
    }

    const recent = performanceHistory.slice(-windowSize)
    const previous = performanceHistory.slice(-windowSize * 2, -windowSize)

    if (previous.length === 0) {
      return { trend: 'insufficient_data', change: 0 }
    }

    const recentAvg = recent.reduce((sum, p) => sum + p.quality_score, 0) / recent.length
    const previousAvg = previous.reduce((sum, p) => sum + p.quality_score, 0) / previous.length

    const change = ((recentAvg - previousAvg) / previousAvg) * 100

    let trend = 'stable'
    if (change > 5) trend = 'improving'
    else if (change < -5) trend = 'declining'

    return { trend, change: Math.round(change * 100) / 100 }
  },

  predictOptimalAgent: (availableAgents, taskType, taskComplexity = 0.5) => {
    if (!availableAgents || availableAgents.length === 0) {
      return null
    }

    // Score agents based on task type affinity and performance
    const scoredAgents = availableAgents.map(agent => {
      let score = 0

      // Base performance score
      if (agent.performance) {
        score += agent.performance.quality_score * 0.4
        score += agent.performance.success_rate * 0.3
        score += agent.performance.efficiency_score * 0.2
      }

      // Task type specialization bonus
      if (agent.specialization === taskType) {
        score += 0.2
      }

      // Experience factor
      if (agent.total_tasks) {
        const experienceBonus = Math.min(agent.total_tasks / 50, 0.1)
        score += experienceBonus
      }

      // Complexity handling
      if (taskComplexity > 0.7 && agent.agent_id.includes('senior')) {
        score += 0.15
      } else if (taskComplexity < 0.3 && agent.agent_id.includes('ai')) {
        score += 0.1
      }

      return { ...agent, predicted_score: score }
    })

    // Return the highest scoring agent
    return scoredAgents.sort((a, b) => b.predicted_score - a.predicted_score)[0]
  },

  generateInsightSummary: (insights) => {
    if (!insights || insights.length === 0) {
      return {
        total: 0,
        byType: {},
        highImpact: [],
        recentTrends: []
      }
    }

    const byType = insights.reduce((acc, insight) => {
      acc[insight.insights_type] = (acc[insight.insights_type] || 0) + 1
      return acc
    }, {})

    const highImpact = insights
      .filter(insight => insight.impact_score >= 0.8)
      .sort((a, b) => b.impact_score - a.impact_score)

    const recentTrends = insights
      .filter(insight => insight.insights_type === 'performance')
      .slice(-3)

    return {
      total: insights.length,
      byType,
      highImpact,
      recentTrends
    }
  },

  validateFeedbackData: (feedback) => {
    const errors = []

    if (!feedback.delegation_id) errors.push('Delegation ID is required')
    if (!feedback.task_id) errors.push('Task ID is required')
    if (!feedback.agent_id) errors.push('Agent ID is required')
    if (!feedback.task_type) errors.push('Task type is required')
    
    if (typeof feedback.estimated_duration !== 'number' || feedback.estimated_duration <= 0) {
      errors.push('Estimated duration must be a positive number')
    }
    
    if (typeof feedback.actual_duration !== 'number' || feedback.actual_duration <= 0) {
      errors.push('Actual duration must be a positive number')
    }
    
    if (typeof feedback.quality_score !== 'number' || feedback.quality_score < 0 || feedback.quality_score > 1) {
      errors.push('Quality score must be between 0 and 1')
    }

    if (typeof feedback.success !== 'boolean') {
      errors.push('Success must be a boolean value')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  formatDuration: (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    } else {
      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`
    }
  },

  formatPercentage: (value, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`
  },

  formatScore: (score, decimals = 2) => {
    return score.toFixed(decimals)
  },

  getPerformanceGrade: (score) => {
    if (score >= 0.9) return { grade: 'A+', color: 'text-success-600' }
    if (score >= 0.8) return { grade: 'A', color: 'text-success-600' }
    if (score >= 0.7) return { grade: 'B', color: 'text-warning-600' }
    if (score >= 0.6) return { grade: 'C', color: 'text-orange-600' }
    return { grade: 'D', color: 'text-error-600' }
  },

  calculateROI: (currentPerformance, projectedImprovement, implementationCost = 1) => {
    const improvement = projectedImprovement - currentPerformance
    const benefit = improvement * 100 // Assume 100 units of value per performance point
    const roi = ((benefit - implementationCost) / implementationCost) * 100
    return Math.round(roi)
  },

  generatePerformanceReport: (agentData, timeRange = 30) => {
    if (!agentData || !agentData.task_history) {
      return null
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - timeRange)

    const recentTasks = agentData.task_history.filter(task => 
      new Date(task.completion_timestamp) >= cutoffDate
    )

    if (recentTasks.length === 0) {
      return null
    }

    const totalTasks = recentTasks.length
    const successfulTasks = recentTasks.filter(task => task.success).length
    const avgQuality = recentTasks.reduce((sum, task) => sum + task.quality_score, 0) / totalTasks
    const avgDuration = recentTasks.reduce((sum, task) => sum + task.actual_duration, 0) / totalTasks

    const taskTypeBreakdown = recentTasks.reduce((acc, task) => {
      if (!acc[task.task_type]) {
        acc[task.task_type] = { count: 0, success: 0, quality: 0 }
      }
      acc[task.task_type].count++
      if (task.success) acc[task.task_type].success++
      acc[task.task_type].quality += task.quality_score
      return acc
    }, {})

    Object.keys(taskTypeBreakdown).forEach(type => {
      const data = taskTypeBreakdown[type]
      data.success_rate = data.success / data.count
      data.avg_quality = data.quality / data.count
    })

    return {
      agent_id: agentData.agent_id,
      time_range_days: timeRange,
      summary: {
        total_tasks: totalTasks,
        success_rate: successfulTasks / totalTasks,
        avg_quality_score: avgQuality,
        avg_duration_minutes: avgDuration
      },
      task_breakdown: taskTypeBreakdown,
      performance_grade: learningApi.getPerformanceGrade(avgQuality),
      generated_at: new Date().toISOString()
    }
  }
}
