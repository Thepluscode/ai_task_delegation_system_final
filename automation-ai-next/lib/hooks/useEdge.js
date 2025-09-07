import useSWR from 'swr'
import { edgeApi } from '@/lib/api/edge'
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

// Custom hook for edge system status
export function useEdgeSystemStatus() {
  const { data, error, mutate, isLoading } = useSWR(
    'edge-system-status',
    edgeApi.getSystemStatus,
    {
      refreshInterval: 1000, // Refresh every second for real-time monitoring
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    systemStatus: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for performance statistics
export function useEdgePerformance(timeRange = '1h') {
  const { data, error, mutate, isLoading } = useSWR(
    ['edge-performance', timeRange],
    () => edgeApi.getPerformanceStats(),
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    performanceStats: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for real-time decision monitoring
export function useEdgeDecisions(filters = {}) {
  const [decisions, setDecisions] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)

  const { data: initialDecisions, error, mutate } = useSWR(
    ['edge-decisions', filters],
    () => edgeApi.getDecisions(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  // Set initial decisions
  useEffect(() => {
    if (initialDecisions) {
      setDecisions(initialDecisions.decisions || initialDecisions)
    }
  }, [initialDecisions])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!realtimeEnabled) return

    const ws = edgeApi.subscribeToDecisions((data) => {
      if (data.type === 'decision') {
        setDecisions(prev => [data.data.decision, ...prev.slice(0, 999)]) // Keep last 1000
      }
    })

    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = () => setIsConnected(false)

    return () => {
      ws.close()
    }
  }, [realtimeEnabled])

  const enableRealtime = useCallback(() => {
    setRealtimeEnabled(true)
  }, [])

  const disableRealtime = useCallback(() => {
    setRealtimeEnabled(false)
    setIsConnected(false)
  }, [])

  return {
    decisions,
    isConnected,
    realtimeEnabled,
    error,
    mutate,
    enableRealtime,
    disableRealtime,
  }
}

// Custom hook for local agents management
export function useLocalAgents() {
  const { data, error, mutate, isLoading } = useSWR(
    'edge-local-agents',
    edgeApi.getLocalAgents,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    agents: data?.agents || data || [],
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for edge operations
export function useEdgeOperations() {
  const [loading, setLoading] = useState(false)

  const routeTask = useCallback(async (task) => {
    setLoading(true)
    try {
      const result = await edgeApi.routeTask(task)
      const processingTime = result.decision.processing_time_ms
      const targetTime = result.target_time_ms
      const metTarget = result.met_target

      toast.success(
        `Task routed in ${processingTime.toFixed(2)}ms ${metTarget ? '✓' : `(target: ${targetTime}ms)`}`
      )
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to route task')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const registerAgent = useCallback(async (agent) => {
    setLoading(true)
    try {
      const result = await edgeApi.registerAgent(agent)
      toast.success(`Agent ${agent.agent_id} registered successfully`)
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to register agent')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAgentLoad = useCallback(async (agentId, load) => {
    try {
      const result = await edgeApi.updateAgentLoad(agentId, load)
      return result
    } catch (error) {
      console.error('Failed to update agent load:', error)
      throw error
    }
  }, [])

  const processVisionFrame = useCallback(async (frameData, processingType) => {
    try {
      const result = await edgeApi.processVisionFrame(frameData, processingType)
      return result
    } catch (error) {
      console.error('Vision processing failed:', error)
      throw error
    }
  }, [])

  const clearCache = useCallback(async () => {
    setLoading(true)
    try {
      await edgeApi.clearCache()
      toast.success('Cache cleared successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to clear cache')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    routeTask,
    registerAgent,
    updateAgentLoad,
    processVisionFrame,
    clearCache,
  }
}

// Custom hook for cache management
export function useCacheStatistics() {
  const { data, error, mutate, isLoading } = useSWR(
    'edge-cache-stats',
    edgeApi.getCacheStatistics,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    cacheStats: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for decision metrics
export function useDecisionMetrics() {
  const { data, error, mutate, isLoading } = useSWR(
    'edge-decision-metrics',
    edgeApi.getDecisionMetrics,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    decisionMetrics: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for performance monitoring with real-time updates
export function useRealTimePerformance() {
  const [performanceData, setPerformanceData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  const { data: initialData } = useSWR(
    'edge-performance-realtime',
    edgeApi.getPerformanceStats
  )

  useEffect(() => {
    if (initialData) {
      setPerformanceData(initialData.performance_by_priority)
    }
  }, [initialData])

  useEffect(() => {
    const ws = edgeApi.subscribeToRealtimeUpdates((data) => {
      if (data.performance_stats) {
        setPerformanceData(data.performance_stats)
      }
    })

    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = () => setIsConnected(false)

    return () => {
      ws.close()
    }
  }, [])

  return {
    performanceData,
    isConnected,
  }
}

// Custom hook for edge configuration
export function useEdgeConfig() {
  const { data, error, mutate, isLoading } = useSWR(
    'edge-config',
    edgeApi.getConfig,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const [updating, setUpdating] = useState(false)

  const updateConfig = useCallback(async (newConfig) => {
    setUpdating(true)
    try {
      const result = await edgeApi.updateConfig(newConfig)
      await mutate()
      toast.success('Configuration updated successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to update configuration')
      throw error
    } finally {
      setUpdating(false)
    }
  }, [mutate])

  return {
    config: data,
    isLoading,
    updating,
    error,
    updateConfig,
    mutate,
  }
}

// Custom hook for offline capabilities
export function useOfflineCapabilities() {
  const { data, error, mutate, isLoading } = useSWR(
    'edge-offline-capabilities',
    edgeApi.getOfflineCapabilities,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const [syncing, setSyncing] = useState(false)

  const syncOfflineDecisions = useCallback(async () => {
    setSyncing(true)
    try {
      const result = await edgeApi.syncOfflineDecisions()
      await mutate()
      toast.success('Offline decisions synced successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to sync offline decisions')
      throw error
    } finally {
      setSyncing(false)
    }
  }, [mutate])

  return {
    offlineCapabilities: data,
    isLoading,
    syncing,
    error,
    syncOfflineDecisions,
    mutate,
  }
}

// Custom hook for performance analysis
export function usePerformanceAnalysis(timeRange = '1h') {
  const { data, error, mutate, isLoading } = useSWR(
    ['edge-performance-report', timeRange],
    () => edgeApi.getPerformanceReport(timeRange),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const analyzeBottlenecks = useCallback((performanceData) => {
    return edgeApi.analyzePerformanceBottlenecks(performanceData)
  }, [])

  return {
    performanceReport: data,
    isLoading,
    error,
    mutate,
    analyzeBottlenecks,
  }
}

// Custom hook for decision search and filtering
export function useDecisionSearch() {
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})

  const searchDecisions = useCallback(async (searchFilters) => {
    setLoading(true)
    try {
      const result = await edgeApi.searchDecisions(searchFilters)
      setSearchResults(result.decisions || result)
      setFilters(searchFilters)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setFilters({})
  }, [])

  return {
    searchResults,
    filters,
    loading,
    searchDecisions,
    clearSearch,
  }
}
