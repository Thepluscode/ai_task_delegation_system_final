import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

const EDGE_COMPUTING_API_BASE = 'http://localhost:8008'

export function useEdgeComputing() {
  const [comprehensiveStats, setComprehensiveStats] = useState(null)
  const [hardwareResources, setHardwareResources] = useState(null)
  const [performanceMetrics, setPerformanceMetrics] = useState(null)
  const [visionProcessing, setVisionProcessing] = useState(null)
  const [predictiveCache, setPredictiveCache] = useState(null)
  const [autonomousMode, setAutonomousMode] = useState(null)
  const [clusterStatus, setClusterStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Helper function for API calls
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${EDGE_COMPUTING_API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err)
      throw err
    }
  }, [])

  // Load comprehensive statistics
  const loadComprehensiveStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [
        comprehensive,
        hardware,
        performance,
        vision,
        cache,
        autonomous,
        cluster
      ] = await Promise.all([
        apiCall('/api/v2/edge/comprehensive-stats'),
        apiCall('/api/v2/edge/hardware-resources'),
        apiCall('/api/v2/edge/performance-metrics'),
        apiCall('/api/v2/edge/vision-processing'),
        apiCall('/api/v2/edge/predictive-cache'),
        apiCall('/api/v2/edge/autonomous-mode/status'),
        apiCall('/api/v2/edge/cluster-status')
      ])

      setComprehensiveStats(comprehensive)
      setHardwareResources(hardware)
      setPerformanceMetrics(performance)
      setVisionProcessing(vision)
      setPredictiveCache(cache)
      setAutonomousMode(autonomous)
      setClusterStatus(cluster)

    } catch (err) {
      setError(err.message)
      toast.error('Failed to load edge computing statistics')
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Start computer vision processing
  const startVisionProcessing = useCallback(async (cameraUrl = 'demo://camera', processingType = 'quality_inspection') => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v2/edge/vision-processing/start', {
        method: 'POST',
        body: JSON.stringify({
          camera_url: cameraUrl,
          processing_type: processingType
        })
      })

      // Refresh vision processing stats
      const visionStats = await apiCall('/api/v2/edge/vision-processing')
      setVisionProcessing(visionStats)

      toast.success('Computer vision processing started')
      return result
    } catch (err) {
      toast.error('Failed to start vision processing')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Stop computer vision processing
  const stopVisionProcessing = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v2/edge/vision-processing/stop', {
        method: 'POST'
      })

      // Refresh vision processing stats
      const visionStats = await apiCall('/api/v2/edge/vision-processing')
      setVisionProcessing(visionStats)

      toast.success('Computer vision processing stopped')
      return result
    } catch (err) {
      toast.error('Failed to stop vision processing')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Activate autonomous operation mode
  const activateAutonomousMode = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v2/edge/autonomous-mode/activate', {
        method: 'POST'
      })

      // Refresh autonomous mode status
      const autonomousStats = await apiCall('/api/v2/edge/autonomous-mode/status')
      setAutonomousMode(autonomousStats)

      toast.success('Autonomous mode activated')
      return result
    } catch (err) {
      toast.error('Failed to activate autonomous mode')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Deactivate autonomous operation mode
  const deactivateAutonomousMode = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v2/edge/autonomous-mode/deactivate', {
        method: 'POST'
      })

      // Refresh autonomous mode status
      const autonomousStats = await apiCall('/api/v2/edge/autonomous-mode/status')
      setAutonomousMode(autonomousStats)

      toast.success('Connected mode restored')
      return result
    } catch (err) {
      toast.error('Failed to deactivate autonomous mode')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Optimize edge resources
  const optimizeResources = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v2/edge/resource-optimization/optimize', {
        method: 'POST'
      })

      // Refresh hardware resources
      const hardwareStats = await apiCall('/api/v2/edge/hardware-resources')
      setHardwareResources(hardwareStats)

      toast.success('Resource optimization completed')
      return result
    } catch (err) {
      toast.error('Failed to optimize resources')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Setup edge cluster
  const setupEdgeCluster = useCallback(async (nodeIds) => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v2/edge/cluster/setup', {
        method: 'POST',
        body: JSON.stringify(nodeIds)
      })

      // Refresh cluster status
      const clusterStats = await apiCall('/api/v2/edge/cluster-status')
      setClusterStatus(clusterStats)

      toast.success('Edge cluster configured')
      return result
    } catch (err) {
      toast.error('Failed to setup edge cluster')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Route task with advanced pipeline
  const routeTaskAdvanced = useCallback(async (task) => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v2/edge/tasks/realtime-route', {
        method: 'POST',
        body: JSON.stringify(task)
      })

      toast.success(`Task routed to ${result.assigned_agent_id}`)
      return result
    } catch (err) {
      toast.error('Failed to route task')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Get service health
  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await apiCall('/health')
      return health
    } catch (err) {
      toast.error('Service health check failed')
      throw err
    }
  }, [apiCall])

  // Clear predictive cache
  const clearPredictiveCache = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v1/cache/clear', {
        method: 'POST'
      })

      // Refresh cache stats
      const cacheStats = await apiCall('/api/v2/edge/predictive-cache')
      setPredictiveCache(cacheStats)

      toast.success('Predictive cache cleared')
      return result
    } catch (err) {
      toast.error('Failed to clear cache')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Get real-time performance stats
  const getRealtimeStats = useCallback(async () => {
    try {
      const stats = await apiCall('/api/v1/performance/stats')
      return stats
    } catch (err) {
      console.error('Failed to get realtime stats:', err)
      return null
    }
  }, [apiCall])

  // Test edge computing performance
  const testEdgePerformance = useCallback(async (testType = 'standard') => {
    setLoading(true)
    try {
      const testTask = {
        task_id: `test_${Date.now()}`,
        priority: testType,
        task_type: 'performance_test',
        parameters: { test_type: testType },
        timeout_ms: getTimeoutForPriority(testType)
      }

      const startTime = performance.now()
      const result = await routeTaskAdvanced(testTask)
      const endTime = performance.now()

      const responseTime = endTime - startTime

      toast.success(`Performance test completed in ${responseTime.toFixed(2)}ms`)
      
      return {
        ...result,
        actual_response_time_ms: responseTime,
        target_response_time_ms: getTimeoutForPriority(testType)
      }
    } catch (err) {
      toast.error('Performance test failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [routeTaskAdvanced])

  return {
    // State
    comprehensiveStats,
    hardwareResources,
    performanceMetrics,
    visionProcessing,
    predictiveCache,
    autonomousMode,
    clusterStatus,
    loading,
    error,

    // Actions
    loadComprehensiveStats,
    startVisionProcessing,
    stopVisionProcessing,
    activateAutonomousMode,
    deactivateAutonomousMode,
    optimizeResources,
    setupEdgeCluster,
    routeTaskAdvanced,
    checkServiceHealth,
    clearPredictiveCache,
    getRealtimeStats,
    testEdgePerformance
  }
}

// Helper function to get timeout for priority
function getTimeoutForPriority(priority) {
  const timeouts = {
    'safety_critical': 1,
    'quality_critical': 10,
    'efficiency_critical': 100,
    'standard': 500
  }
  return timeouts[priority] || 500
}

// Edge Computing Service Status Hook
export function useEdgeComputingService() {
  const [serviceStatus, setServiceStatus] = useState(null)
  const [isOnline, setIsOnline] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkServiceHealth = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${EDGE_COMPUTING_API_BASE}/health`)
      const health = await response.json()
      
      setServiceStatus(health)
      setIsOnline(response.ok)
      
      return health
    } catch (err) {
      setIsOnline(false)
      setServiceStatus(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    serviceStatus,
    isOnline,
    loading,
    checkServiceHealth
  }
}

// Real-time Edge Computing Monitoring Hook
export function useEdgeComputingRealtime() {
  const [realtimeData, setRealtimeData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [ws, setWs] = useState(null)

  const connect = useCallback(() => {
    try {
      const websocket = new WebSocket(`ws://localhost:8008/ws/realtime`)
      
      websocket.onopen = () => {
        setConnected(true)
        console.log('Edge computing WebSocket connected')
      }
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setRealtimeData(data)
        } catch (err) {
          console.error('WebSocket data parsing error:', err)
        }
      }
      
      websocket.onclose = () => {
        setConnected(false)
        console.log('Edge computing WebSocket disconnected')
      }
      
      websocket.onerror = (error) => {
        console.error('Edge computing WebSocket error:', error)
        setConnected(false)
      }
      
      setWs(websocket)
      
      return websocket
    } catch (err) {
      console.error('Failed to connect to edge computing WebSocket:', err)
      return null
    }
  }, [])

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close()
      setWs(null)
      setConnected(false)
    }
  }, [ws])

  return {
    realtimeData,
    connected,
    connect,
    disconnect
  }
}
