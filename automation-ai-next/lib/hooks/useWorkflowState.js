import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

const WORKFLOW_STATE_API_BASE = 'http://localhost:8003'

export function useWorkflowState() {
  const [workflows, setWorkflows] = useState([])
  const [systemPerformance, setSystemPerformance] = useState(null)
  const [activeConflicts, setActiveConflicts] = useState([])
  const [cacheStats, setCacheStats] = useState(null)
  const [workflowDetails, setWorkflowDetails] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Helper function for API calls
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${WORKFLOW_STATE_API_BASE}${endpoint}`, {
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

  // Load all workflows
  const loadWorkflows = useCallback(async (status = null, limit = 100) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (status) queryParams.append('status', status)
      if (limit) queryParams.append('limit', limit.toString())

      const endpoint = `/api/v1/workflows${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const data = await apiCall(endpoint)
      
      setWorkflows(data.workflows || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Load system performance metrics
  const loadSystemPerformance = useCallback(async () => {
    try {
      const data = await apiCall('/api/v1/performance/system')
      setSystemPerformance(data)
    } catch (err) {
      console.error('Failed to load system performance:', err)
    }
  }, [apiCall])

  // Load cache statistics
  const loadCacheStats = useCallback(async () => {
    try {
      const data = await apiCall('/api/v1/performance/cache')
      setCacheStats(data)
    } catch (err) {
      console.error('Failed to load cache stats:', err)
    }
  }, [apiCall])

  // Load active conflicts
  const loadActiveConflicts = useCallback(async () => {
    try {
      const data = await apiCall('/api/v1/conflicts')
      setActiveConflicts(data.active_conflicts || [])
    } catch (err) {
      console.error('Failed to load active conflicts:', err)
    }
  }, [apiCall])

  // Create new workflow
  const createWorkflow = useCallback(async (workflowRequest) => {
    setLoading(true)
    try {
      const result = await apiCall('/api/v1/workflows', {
        method: 'POST',
        body: JSON.stringify(workflowRequest)
      })

      toast.success(`Workflow created: ${result.workflow_id}`)
      return result
    } catch (err) {
      toast.error('Failed to create workflow')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Get specific workflow details
  const getWorkflowDetails = useCallback(async (workflowId) => {
    try {
      const data = await apiCall(`/api/v1/workflows/${workflowId}`)
      setWorkflowDetails(prev => ({
        ...prev,
        [workflowId]: data
      }))
      return data
    } catch (err) {
      toast.error('Failed to load workflow details')
      throw err
    }
  }, [apiCall])

  // Update workflow state
  const updateWorkflowState = useCallback(async (workflowId, updateRequest) => {
    setLoading(true)
    try {
      const result = await apiCall(`/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        body: JSON.stringify(updateRequest)
      })

      toast.success('Workflow updated successfully')
      return result
    } catch (err) {
      toast.error('Failed to update workflow')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Cancel workflow
  const cancelWorkflow = useCallback(async (workflowId) => {
    setLoading(true)
    try {
      const result = await apiCall(`/api/v1/workflows/${workflowId}`, {
        method: 'DELETE'
      })

      toast.success('Workflow cancelled')
      return result
    } catch (err) {
      toast.error('Failed to cancel workflow')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Add workflow dependency
  const addWorkflowDependency = useCallback(async (workflowId, dependencyRequest) => {
    setLoading(true)
    try {
      const result = await apiCall(`/api/v1/workflows/${workflowId}/dependencies`, {
        method: 'POST',
        body: JSON.stringify(dependencyRequest)
      })

      toast.success('Dependency added successfully')
      return result
    } catch (err) {
      toast.error('Failed to add dependency')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Setup multi-agent coordination
  const setupCoordination = useCallback(async (coordinationRequest) => {
    setLoading(true)
    try {
      const result = await apiCall(`/api/v1/workflows/${coordinationRequest.workflow_id}/coordination`, {
        method: 'POST',
        body: JSON.stringify(coordinationRequest)
      })

      toast.success('Multi-agent coordination setup')
      return result
    } catch (err) {
      toast.error('Failed to setup coordination')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Handle agent synchronization point
  const handleAgentSync = useCallback(async (workflowId, syncPointId, agentId) => {
    try {
      const result = await apiCall(`/api/v1/workflows/${workflowId}/sync/${syncPointId}/agent/${agentId}`, {
        method: 'POST'
      })

      if (result.all_agents_synchronized) {
        toast.success('All agents synchronized')
      } else {
        toast.info(`Agent ${agentId} reached sync point`)
      }

      return result
    } catch (err) {
      toast.error('Failed to handle agent sync')
      throw err
    }
  }, [apiCall])

  // Create recovery checkpoint
  const createCheckpoint = useCallback(async (workflowId) => {
    setLoading(true)
    try {
      const result = await apiCall(`/api/v1/workflows/${workflowId}/checkpoint`, {
        method: 'POST'
      })

      toast.success('Recovery checkpoint created')
      return result
    } catch (err) {
      toast.error('Failed to create checkpoint')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Recover workflow from failure
  const recoverWorkflow = useCallback(async (workflowId, failureType, failureDetails = {}) => {
    setLoading(true)
    try {
      const result = await apiCall(`/api/v1/workflows/${workflowId}/recover?failure_type=${failureType}`, {
        method: 'POST',
        body: JSON.stringify(failureDetails)
      })

      if (result.success) {
        toast.success('Workflow recovery successful')
      } else {
        toast.warning('Workflow recovery attempted but may need manual intervention')
      }

      return result
    } catch (err) {
      toast.error('Failed to recover workflow')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Sync edge-cloud state
  const syncEdgeCloudState = useCallback(async (stateChanges) => {
    try {
      const result = await apiCall('/api/v1/state/sync', {
        method: 'POST',
        body: JSON.stringify(stateChanges)
      })

      toast.success(`Synced ${result.synced_changes} state changes`)
      return result
    } catch (err) {
      toast.error('Failed to sync state changes')
      throw err
    }
  }, [apiCall])

  // Get workflows by agent
  const getAgentWorkflows = useCallback(async (agentId) => {
    try {
      const data = await apiCall(`/api/v1/agents/${agentId}/workflows`)
      return data.assigned_workflows || []
    } catch (err) {
      toast.error('Failed to load agent workflows')
      throw err
    }
  }, [apiCall])

  // Check service health
  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await apiCall('/health')
      return health
    } catch (err) {
      toast.error('Service health check failed')
      throw err
    }
  }, [apiCall])

  return {
    // State
    workflows,
    systemPerformance,
    activeConflicts,
    cacheStats,
    workflowDetails,
    loading,
    error,

    // Actions
    loadWorkflows,
    loadSystemPerformance,
    loadCacheStats,
    loadActiveConflicts,
    createWorkflow,
    getWorkflowDetails,
    updateWorkflowState,
    cancelWorkflow,
    addWorkflowDependency,
    setupCoordination,
    handleAgentSync,
    createCheckpoint,
    recoverWorkflow,
    syncEdgeCloudState,
    getAgentWorkflows,
    checkServiceHealth
  }
}

// Workflow State Service Status Hook
export function useWorkflowStateService() {
  const [serviceStatus, setServiceStatus] = useState(null)
  const [isOnline, setIsOnline] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkServiceHealth = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${WORKFLOW_STATE_API_BASE}/health`)
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

// Real-time Workflow Monitoring Hook
export function useWorkflowStateRealtime() {
  const [realtimeData, setRealtimeData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [ws, setWs] = useState(null)

  const connect = useCallback(() => {
    try {
      const websocket = new WebSocket(`ws://localhost:8003/ws/workflows`)
      
      websocket.onopen = () => {
        setConnected(true)
        console.log('Workflow state WebSocket connected')
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
        console.log('Workflow state WebSocket disconnected')
      }
      
      websocket.onerror = (error) => {
        console.error('Workflow state WebSocket error:', error)
        setConnected(false)
      }
      
      setWs(websocket)
      
      return websocket
    } catch (err) {
      console.error('Failed to connect to workflow state WebSocket:', err)
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
