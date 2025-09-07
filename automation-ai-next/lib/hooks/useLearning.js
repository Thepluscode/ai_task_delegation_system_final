import useSWR from 'swr'
import { learningApi } from '@/lib/api/learning'
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

// Custom hook for learning service status
export function useLearningServiceStatus() {
  const { data, error, mutate, isLoading } = useSWR(
    'learning-service-status',
    learningApi.getServiceInfo,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    serviceInfo: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for learning dashboard
export function useLearningDashboard() {
  const { data, error, mutate, isLoading } = useSWR(
    'learning-dashboard',
    learningApi.getLearningDashboard,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    dashboard: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for agent rankings
export function useAgentRankings(taskType = null) {
  const { data, error, mutate, isLoading } = useSWR(
    ['agent-rankings', taskType],
    () => learningApi.getAgentRankings(taskType),
    {
      refreshInterval: 120000, // Refresh every 2 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    rankings: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for learning insights
export function useLearningInsights() {
  const { data, error, mutate, isLoading } = useSWR(
    'learning-insights',
    learningApi.getLearningInsights,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    insights: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for learning operations
export function useLearningOperations() {
  const [loading, setLoading] = useState(false)

  const submitFeedback = useCallback(async (feedback) => {
    setLoading(true)
    try {
      // Validate feedback data
      const validation = learningApi.validateFeedbackData(feedback)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const result = await learningApi.submitTaskFeedback(feedback)
      
      toast.success(
        `Feedback submitted for ${feedback.agent_id} (${result.training_samples} total samples)`
      )
      
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to submit feedback')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const predictPerformance = useCallback(async (agentId, taskType = 'general') => {
    setLoading(true)
    try {
      const result = await learningApi.predictAgentPerformance(agentId, taskType)
      
      const confidence = learningApi.formatConfidenceLevel(result.confidence)
      toast.success(
        `Performance prediction for ${agentId}: ${(result.predicted_quality * 100).toFixed(1)}% quality (${confidence} confidence)`
      )
      
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to predict performance')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeComplexity = useCallback(async (taskType) => {
    setLoading(true)
    try {
      const result = await learningApi.analyzeTaskComplexity(taskType)
      
      toast.success(
        `Task complexity analysis for ${taskType}: ${(result.complexity_score * 100).toFixed(1)}% complexity`
      )
      
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to analyze task complexity')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    submitFeedback,
    predictPerformance,
    analyzeComplexity,
  }
}

// Custom hook for performance tracking
export function usePerformanceTracking() {
  const [performanceHistory, setPerformanceHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const addPerformanceData = useCallback((performanceData) => {
    setPerformanceHistory(prev => [performanceData, ...prev.slice(0, 99)]) // Keep last 100 entries
  }, [])

  const clearPerformanceHistory = useCallback(() => {
    setPerformanceHistory([])
  }, [])

  const generateReport = useCallback((agentId, timeRange = 30) => {
    setLoading(true)
    try {
      const agentData = {
        agent_id: agentId,
        task_history: performanceHistory.filter(p => p.agent_id === agentId)
      }
      
      const report = learningApi.generatePerformanceReport(agentData, timeRange)
      return report
    } finally {
      setLoading(false)
    }
  }, [performanceHistory])

  const getPerformanceTrend = useCallback((agentId, windowSize = 5) => {
    const agentHistory = performanceHistory.filter(p => p.agent_id === agentId)
    return learningApi.calculatePerformanceTrend(agentHistory, windowSize)
  }, [performanceHistory])

  const getAgentSpecialization = useCallback((agentId) => {
    const agentHistory = performanceHistory.filter(p => p.agent_id === agentId)
    return learningApi.analyzeAgentSpecialization(agentHistory)
  }, [performanceHistory])

  return {
    performanceHistory,
    loading,
    addPerformanceData,
    clearPerformanceHistory,
    generateReport,
    getPerformanceTrend,
    getAgentSpecialization,
  }
}

// Custom hook for feedback builder
export function useFeedbackBuilder() {
  const [feedback, setFeedback] = useState({
    delegation_id: '',
    task_id: '',
    agent_id: '',
    task_type: 'general',
    priority: 'medium',
    requirements: ['general_processing'],
    estimated_duration: 60,
    actual_duration: 60,
    success: true,
    quality_score: 0.8,
    completion_timestamp: new Date().toISOString(),
    performance_metrics: {
      accuracy: 0.85,
      efficiency: 0.80,
      customer_satisfaction: 0.75
    }
  })

  const [calculatedMetrics, setCalculatedMetrics] = useState({
    duration_accuracy: 0,
    efficiency_score: 1,
    performance_score: 0.8
  })

  const updateFeedback = useCallback((updates) => {
    setFeedback(prev => {
      const updated = { ...prev, ...updates }
      
      // Auto-generate IDs if not provided
      if (!updated.delegation_id) {
        updated.delegation_id = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      if (!updated.task_id) {
        updated.task_id = `task-${Date.now()}`
      }
      
      return updated
    })
  }, [])

  const calculateMetrics = useCallback(() => {
    const durationAccuracy = learningApi.calculateDurationAccuracy(
      feedback.estimated_duration,
      feedback.actual_duration
    )
    
    const efficiencyScore = learningApi.calculateEfficiencyScore(
      feedback.estimated_duration,
      feedback.actual_duration
    )
    
    const performanceScore = learningApi.calculatePerformanceScore(
      feedback.success ? 1 : 0,
      feedback.quality_score,
      efficiencyScore
    )
    
    setCalculatedMetrics({
      duration_accuracy: durationAccuracy,
      efficiency_score: efficiencyScore,
      performance_score: performanceScore
    })
  }, [feedback])

  const resetFeedback = useCallback(() => {
    setFeedback({
      delegation_id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      task_id: `task-${Date.now()}`,
      agent_id: '',
      task_type: 'general',
      priority: 'medium',
      requirements: ['general_processing'],
      estimated_duration: 60,
      actual_duration: 60,
      success: true,
      quality_score: 0.8,
      completion_timestamp: new Date().toISOString(),
      performance_metrics: {
        accuracy: 0.85,
        efficiency: 0.80,
        customer_satisfaction: 0.75
      }
    })
    setCalculatedMetrics({
      duration_accuracy: 0,
      efficiency_score: 1,
      performance_score: 0.8
    })
  }, [])

  const validateFeedback = useCallback(() => {
    return learningApi.validateFeedbackData(feedback)
  }, [feedback])

  // Auto-calculate metrics when feedback changes
  useEffect(() => {
    calculateMetrics()
  }, [feedback, calculateMetrics])

  return {
    feedback,
    calculatedMetrics,
    updateFeedback,
    calculateMetrics,
    resetFeedback,
    validateFeedback,
  }
}

// Custom hook for agent performance prediction
export function useAgentPerformancePrediction() {
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(false)

  const getPrediction = useCallback(async (agentId, taskType = 'general') => {
    const key = `${agentId}-${taskType}`
    
    if (predictions[key]) {
      return predictions[key]
    }

    setLoading(true)
    try {
      const prediction = await learningApi.predictAgentPerformance(agentId, taskType)
      
      setPredictions(prev => ({
        ...prev,
        [key]: prediction
      }))
      
      return prediction
    } catch (error) {
      console.error('Failed to get prediction:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [predictions])

  const clearPredictions = useCallback(() => {
    setPredictions({})
  }, [])

  const getBestAgent = useCallback(async (availableAgents, taskType = 'general') => {
    setLoading(true)
    try {
      const predictions = await Promise.all(
        availableAgents.map(async (agent) => {
          try {
            const prediction = await learningApi.predictAgentPerformance(agent.agent_id, taskType)
            return { ...agent, prediction }
          } catch (error) {
            return { ...agent, prediction: null }
          }
        })
      )

      // Sort by predicted quality score
      const rankedAgents = predictions
        .filter(agent => agent.prediction)
        .sort((a, b) => b.prediction.predicted_quality - a.prediction.predicted_quality)

      return rankedAgents[0] || null
    } catch (error) {
      console.error('Failed to find best agent:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    predictions,
    loading,
    getPrediction,
    clearPredictions,
    getBestAgent,
  }
}

// Custom hook for task complexity analysis
export function useTaskComplexityAnalysis() {
  const [complexityData, setComplexityData] = useState({})
  const [loading, setLoading] = useState(false)

  const analyzeTask = useCallback(async (taskType) => {
    if (complexityData[taskType]) {
      return complexityData[taskType]
    }

    setLoading(true)
    try {
      const analysis = await learningApi.analyzeTaskComplexity(taskType)
      
      setComplexityData(prev => ({
        ...prev,
        [taskType]: analysis
      }))
      
      return analysis
    } catch (error) {
      console.error('Failed to analyze task complexity:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [complexityData])

  const clearComplexityData = useCallback(() => {
    setComplexityData({})
  }, [])

  const getRecommendedAgents = useCallback((taskType) => {
    const analysis = complexityData[taskType]
    return analysis?.recommended_agent_types || []
  }, [complexityData])

  const getComplexityLevel = useCallback((taskType) => {
    const analysis = complexityData[taskType]
    if (!analysis) return 'unknown'
    
    const score = analysis.complexity_score
    if (score >= 0.8) return 'very_high'
    if (score >= 0.6) return 'high'
    if (score >= 0.4) return 'medium'
    if (score >= 0.2) return 'low'
    return 'very_low'
  }, [complexityData])

  return {
    complexityData,
    loading,
    analyzeTask,
    clearComplexityData,
    getRecommendedAgents,
    getComplexityLevel,
  }
}

// Custom hook for learning insights analysis
export function useLearningInsightsAnalysis() {
  const { insights, isLoading, error, mutate } = useLearningInsights()

  const getInsightsSummary = useCallback(() => {
    if (!insights?.insights) return null
    return learningApi.generateInsightSummary(insights.insights)
  }, [insights])

  const getHighImpactInsights = useCallback(() => {
    if (!insights?.insights) return []
    return insights.insights
      .filter(insight => insight.impact_score >= 0.8)
      .sort((a, b) => b.impact_score - a.impact_score)
  }, [insights])

  const getInsightsByType = useCallback((type) => {
    if (!insights?.insights) return []
    return insights.insights.filter(insight => insight.insights_type === type)
  }, [insights])

  const getRecentInsights = useCallback((count = 5) => {
    if (!insights?.insights) return []
    return insights.insights
      .sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at))
      .slice(0, count)
  }, [insights])

  return {
    insights,
    isLoading,
    error,
    mutate,
    getInsightsSummary,
    getHighImpactInsights,
    getInsightsByType,
    getRecentInsights,
  }
}
