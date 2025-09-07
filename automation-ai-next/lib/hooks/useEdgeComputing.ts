/**
 * React Hooks for Edge Computing Service
 * Sub-10ms real-time decision engine with autonomous operation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { edgeComputingApi } from '@/lib/api/edgeComputing'
import {
  EdgeTask,
  EdgeDecision,
  LocalAgent,
  EdgePerformanceData,
  CacheStats,
  EdgeServiceInfo,
  EdgeHealthCheck,
  EdgeAnalytics,
  EdgeMonitoringData,
  VisionFrame,
  VisionProcessingResult,
  VisionProcessingType,
  TaskPriority,
  AgentStatus
} from '@/types/edge-computing'
import toast from 'react-hot-toast'

// Service Status Hook
export function useEdgeComputingService() {
  const [serviceInfo, setServiceInfo] = useState<EdgeServiceInfo | null>(null)
  const [healthStatus, setHealthStatus] = useState<EdgeHealthCheck | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkServiceHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [info, health] = await Promise.all([
        edgeComputingApi.getServiceInfo(),
        edgeComputingApi.getHealth()
      ])
      
      setServiceInfo(info)
      setHealthStatus(health)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Service unavailable'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkServiceHealth()
    
    // Check service health every 30 seconds
    const interval = setInterval(checkServiceHealth, 30000)
    return () => clearInterval(interval)
  }, [checkServiceHealth])

  return {
    serviceInfo,
    healthStatus,
    loading,
    error,
    checkServiceHealth,
    isOnline: healthStatus?.status === 'healthy',
    cloudConnected: healthStatus?.cloud_connectivity || false
  }
}

// Task Routing Hook
export function useTaskRouting() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentDecisions, setRecentDecisions] = useState<EdgeDecision[]>([])

  const routeTask = useCallback(async (task: EdgeTask) => {
    setLoading(true)
    setError(null)
    try {
      const decision = await edgeComputingApi.routeTask(task)
      
      // Add to recent decisions
      setRecentDecisions(prev => [decision, ...prev.slice(0, 49)]) // Keep last 50
      
      // Show success notification
      const responseTime = decision.processing_time_ms
      const targetTime = edgeComputingApi.calculateTargetCompliance(responseTime, task.priority)
      
      if (targetTime) {
        toast.success(`Task routed in ${edgeComputingApi.formatResponseTime(responseTime)}`)
      } else {
        toast.warning(`Task routed but exceeded target time: ${edgeComputingApi.formatResponseTime(responseTime)}`)
      }
      
      return decision
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to route task'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const routeTaskWithPriority = useCallback(async (
    taskType: string,
    priority: TaskPriority,
    parameters: Record<string, any> = {}
  ) => {
    const task = edgeComputingApi.createEdgeTask(taskType, priority, parameters)
    return routeTask(task)
  }, [routeTask])

  const clearRecentDecisions = useCallback(() => {
    setRecentDecisions([])
  }, [])

  return {
    routeTask,
    routeTaskWithPriority,
    recentDecisions,
    clearRecentDecisions,
    loading,
    error
  }
}

// Agent Management Hook
export function useAgentManagement() {
  const [agents, setAgents] = useState<LocalAgent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAgents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await edgeComputingApi.listAgents()
      setAgents(response.agents)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load agents'
      setError(errorMessage)
      // Use mock data as fallback
      const mockAgents = edgeComputingApi.generateMockAgents(6)
      setAgents(mockAgents)
    } finally {
      setLoading(false)
    }
  }, [])

  const registerAgent = useCallback(async (agent: LocalAgent) => {
    setLoading(true)
    setError(null)
    try {
      const result = await edgeComputingApi.registerAgent(agent)
      if (result.success) {
        await loadAgents() // Refresh agent list
        toast.success(`Agent ${agent.agent_id} registered successfully`)
        return true
      } else {
        throw new Error(result.message || 'Registration failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register agent'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadAgents])

  const updateAgentLoad = useCallback(async (agentId: string, load: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await edgeComputingApi.updateAgentLoad(agentId, load)
      if (result.success) {
        // Update local state
        setAgents(prev => prev.map(agent => 
          agent.agent_id === agentId 
            ? { ...agent, current_load: load }
            : agent
        ))
        return true
      } else {
        throw new Error(result.message || 'Load update failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent load'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgentsByStatus = useCallback((status: AgentStatus) => {
    return agents.filter(agent => agent.status === status)
  }, [agents])

  const getAvailableAgents = useCallback(() => {
    return getAgentsByStatus(AgentStatus.AVAILABLE)
  }, [getAgentsByStatus])

  const getAgentUtilization = useCallback(() => {
    if (agents.length === 0) return 0
    const totalLoad = agents.reduce((sum, agent) => sum + agent.current_load, 0)
    return totalLoad / agents.length
  }, [agents])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  return {
    agents,
    loading,
    error,
    loadAgents,
    registerAgent,
    updateAgentLoad,
    getAgentsByStatus,
    getAvailableAgents,
    getAgentUtilization,
    totalAgents: agents.length,
    availableAgents: getAvailableAgents().length
  }
}

// Performance Monitoring Hook
export function usePerformanceMonitoring() {
  const [performanceData, setPerformanceData] = useState<EdgePerformanceData | null>(null)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadPerformanceData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [performance, cache] = await Promise.all([
        edgeComputingApi.getPerformanceStats(),
        edgeComputingApi.getCacheStats()
      ])
      
      setPerformanceData(performance)
      setCacheStats(cache)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load performance data'
      setError(errorMessage)
      // Use mock data as fallback
      const mockPerformance = edgeComputingApi.generateMockPerformanceData()
      setPerformanceData(mockPerformance)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearCache = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await edgeComputingApi.clearCache()
      if (result.success) {
        await loadPerformanceData() // Refresh data
        toast.success('Cache cleared successfully')
        return true
      } else {
        throw new Error(result.message || 'Cache clear failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadPerformanceData])

  const startRealTimeUpdates = useCallback((intervalMs: number = 5000) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    loadPerformanceData() // Initial load
    intervalRef.current = setInterval(loadPerformanceData, intervalMs)
  }, [loadPerformanceData])

  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    loadPerformanceData()
    return () => stopRealTimeUpdates()
  }, [loadPerformanceData, stopRealTimeUpdates])

  const getOverallCompliance = useCallback(() => {
    if (!performanceData) return 0
    
    const priorities = Object.values(performanceData.performance_by_priority)
    if (priorities.length === 0) return 0
    
    const totalCompliance = priorities.reduce((sum, stats) => sum + stats.target_met_percentage, 0)
    return totalCompliance / priorities.length
  }, [performanceData])

  const getAverageResponseTime = useCallback(() => {
    if (!performanceData) return 0
    
    const priorities = Object.values(performanceData.performance_by_priority)
    if (priorities.length === 0) return 0
    
    const totalTime = priorities.reduce((sum, stats) => sum + stats.avg_response_time, 0)
    return totalTime / priorities.length
  }, [performanceData])

  return {
    performanceData,
    cacheStats,
    loading,
    error,
    loadPerformanceData,
    clearCache,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    getOverallCompliance,
    getAverageResponseTime,
    isRealTimeActive: intervalRef.current !== null
  }
}

// Real-time Updates Hook
export function useEdgeRealTimeUpdates() {
  const [updates, setUpdates] = useState<EdgeMonitoringData[]>([])
  const [connected, setConnected] = useState(false)
  const [latestData, setLatestData] = useState<EdgeMonitoringData | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const ws = edgeComputingApi.subscribeToRealTimeUpdates((data) => {
      setLatestData(data)
      setUpdates(prev => [data, ...prev.slice(0, 99)]) // Keep last 100 updates
    })

    if (ws) {
      wsRef.current = ws
      ws.onopen = () => setConnected(true)
      ws.onclose = () => setConnected(false)
      ws.onerror = () => setConnected(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
  }, [])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    updates,
    latestData,
    connected,
    connect,
    disconnect,
    clearUpdates
  }
}

// Analytics Hook
export function useEdgeAnalytics() {
  const [analytics, setAnalytics] = useState<EdgeAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // For now, use mock data since analytics endpoint isn't implemented
      const mockAnalytics = edgeComputingApi.generateMockAnalytics()
      setAnalytics(mockAnalytics)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const getTopPerformingAgents = useCallback((count: number = 3) => {
    return analytics?.agent_utilization
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, count) || []
  }, [analytics])

  const getMostUsedDecisionType = useCallback(() => {
    return analytics?.decision_type_distribution
      .sort((a, b) => b.count - a.count)[0] || null
  }, [analytics])

  return {
    analytics,
    loading,
    error,
    loadAnalytics,
    getTopPerformingAgents,
    getMostUsedDecisionType
  }
}

// Computer Vision Processing Hook
export function useVisionProcessing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentResults, setRecentResults] = useState<VisionProcessingResult[]>([])
  const [processingStats, setProcessingStats] = useState({
    totalFrames: 0,
    averageTime: 0,
    successRate: 100
  })

  const processFrame = useCallback(async (
    frameData: ArrayBuffer | Uint8Array,
    processingType: VisionProcessingType
  ) => {
    setLoading(true)
    setError(null)
    try {
      const result = await edgeComputingApi.processVisionFrame(frameData, processingType)

      // Add to recent results
      setRecentResults(prev => [result, ...prev.slice(0, 49)]) // Keep last 50

      // Update stats
      setProcessingStats(prev => ({
        totalFrames: prev.totalFrames + 1,
        averageTime: (prev.averageTime * prev.totalFrames + result.processing_time_ms) / (prev.totalFrames + 1),
        successRate: result.error ? prev.successRate * 0.99 : prev.successRate
      }))

      // Show success notification
      const responseTime = result.processing_time_ms
      toast.success(`Frame processed in ${edgeComputingApi.formatResponseTime(responseTime)}`)

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process frame'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const processTestFrame = useCallback(async (processingType: VisionProcessingType) => {
    // Generate mock frame data for testing
    const mockFrameData = new Uint8Array(1024) // 1KB mock frame
    for (let i = 0; i < mockFrameData.length; i++) {
      mockFrameData[i] = Math.floor(Math.random() * 256)
    }

    return processFrame(mockFrameData, processingType)
  }, [processFrame])

  const clearRecentResults = useCallback(() => {
    setRecentResults([])
  }, [])

  const getResultsByType = useCallback((processingType: VisionProcessingType) => {
    return recentResults.filter(result =>
      result.result.analysis_type === processingType
    )
  }, [recentResults])

  const getAverageProcessingTime = useCallback((processingType?: VisionProcessingType) => {
    const results = processingType
      ? getResultsByType(processingType)
      : recentResults

    if (results.length === 0) return 0

    const totalTime = results.reduce((sum, result) => sum + result.processing_time_ms, 0)
    return totalTime / results.length
  }, [recentResults, getResultsByType])

  return {
    processFrame,
    processTestFrame,
    recentResults,
    clearRecentResults,
    getResultsByType,
    getAverageProcessingTime,
    processingStats,
    loading,
    error
  }
}
