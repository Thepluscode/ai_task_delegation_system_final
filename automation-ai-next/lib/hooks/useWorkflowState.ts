/**
 * React Hooks for Workflow State Management
 * Hierarchical state machine with event sourcing for complex workflows
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { workflowStateApi } from '@/lib/api/workflowState'
import { 
  WorkflowDefinition,
  WorkflowStateSnapshot,
  WorkflowEvent,
  WorkflowAnalytics,
  WorkflowMonitoringData,
  WorkflowState,
  StepStatus,
  CreateWorkflowRequest,
  SystemHealth
} from '@/types/workflow-state'
import toast from 'react-hot-toast'

// Service Status Hook
export function useWorkflowStateService() {
  const [serviceStatus, setServiceStatus] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkServiceHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [health, info] = await Promise.all([
        workflowStateApi.getHealth(),
        workflowStateApi.getServiceInfo()
      ])
      
      setServiceStatus({
        ...health,
        last_health_check: new Date().toISOString()
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Service unavailable'
      setError(errorMessage)
      setServiceStatus({
        overall_status: 'critical',
        event_store_status: 'offline',
        state_machine_status: 'offline',
        workflow_engine_status: 'offline',
        last_health_check: new Date().toISOString()
      })
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
    serviceStatus,
    loading,
    error,
    checkServiceHealth,
    isOnline: serviceStatus?.overall_status === 'healthy'
  }
}

// Workflow Management Hook
export function useWorkflowManagement() {
  const [workflows, setWorkflows] = useState<WorkflowStateSnapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadWorkflows = useCallback(async (filters?: { state?: WorkflowState; limit?: number }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await workflowStateApi.listWorkflows(filters)
      setWorkflows(response.workflows)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workflows'
      setError(errorMessage)
      // Use mock data as fallback
      const mockWorkflows = workflowStateApi.generateMockWorkflows(8)
      setWorkflows(mockWorkflows)
    } finally {
      setLoading(false)
    }
  }, [])

  const createWorkflow = useCallback(async (request: CreateWorkflowRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await workflowStateApi.createWorkflow(request)
      await loadWorkflows() // Refresh workflow list
      toast.success(`Workflow ${request.definition.name} created successfully`)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workflow'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [loadWorkflows])

  const startWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await workflowStateApi.startWorkflow(workflowId)
      await loadWorkflows() // Refresh workflow list
      toast.success('Workflow started successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start workflow'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [loadWorkflows])

  const pauseWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await workflowStateApi.pauseWorkflow(workflowId)
      await loadWorkflows() // Refresh workflow list
      toast.success('Workflow paused')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause workflow'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [loadWorkflows])

  const resumeWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await workflowStateApi.resumeWorkflow(workflowId)
      await loadWorkflows() // Refresh workflow list
      toast.success('Workflow resumed')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume workflow'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [loadWorkflows])

  const cancelWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await workflowStateApi.cancelWorkflow(workflowId)
      await loadWorkflows() // Refresh workflow list
      toast.success('Workflow cancelled')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel workflow'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [loadWorkflows])

  const generateMockWorkflows = useCallback((count: number = 8) => {
    const mockWorkflows = workflowStateApi.generateMockWorkflows(count)
    setWorkflows(mockWorkflows)
    return mockWorkflows
  }, [])

  const getWorkflowsByState = useCallback((state: WorkflowState) => {
    return workflows.filter(workflow => workflow.current_state === state)
  }, [workflows])

  const getActiveWorkflows = useCallback(() => {
    return workflows.filter(workflow => workflow.current_state === WorkflowState.ACTIVE)
  }, [workflows])

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  return {
    workflows,
    loading,
    error,
    loadWorkflows,
    createWorkflow,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    generateMockWorkflows,
    getWorkflowsByState,
    getActiveWorkflows,
    totalWorkflows: workflows.length,
    activeWorkflows: getActiveWorkflows().length
  }
}

// Individual Workflow Hook
export function useWorkflow(workflowId?: string) {
  const [workflow, setWorkflow] = useState<WorkflowStateSnapshot | null>(null)
  const [events, setEvents] = useState<WorkflowEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadWorkflow = useCallback(async (targetWorkflowId?: string) => {
    const id = targetWorkflowId || workflowId
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const [workflowData, workflowEvents] = await Promise.all([
        workflowStateApi.getWorkflow(id),
        workflowStateApi.getWorkflowEvents(id)
      ])
      
      setWorkflow(workflowData)
      setEvents(workflowEvents)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workflow'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [workflowId])

  const completeStep = useCallback(async (stepId: string, result: Record<string, any>) => {
    if (!workflowId) return null

    setLoading(true)
    setError(null)
    try {
      const response = await workflowStateApi.completeStep(workflowId, stepId, result)
      await loadWorkflow() // Refresh workflow data
      toast.success(`Step ${stepId} completed`)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete step'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [workflowId, loadWorkflow])

  const failStep = useCallback(async (stepId: string, errorMessage: string) => {
    if (!workflowId) return null

    setLoading(true)
    setError(null)
    try {
      const response = await workflowStateApi.failStep(workflowId, stepId, errorMessage)
      await loadWorkflow() // Refresh workflow data
      toast.error(`Step ${stepId} failed`)
      return response
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fail step'
      setError(error)
      toast.error(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [workflowId, loadWorkflow])

  const assignAgentToStep = useCallback(async (stepId: string, agentId: string) => {
    if (!workflowId) return null

    setLoading(true)
    setError(null)
    try {
      const response = await workflowStateApi.assignAgentToStep(workflowId, stepId, agentId)
      await loadWorkflow() // Refresh workflow data
      toast.success(`Agent ${agentId} assigned to step ${stepId}`)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign agent'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [workflowId, loadWorkflow])

  const getProgress = useCallback(() => {
    if (!workflow) return 0
    return workflowStateApi.calculateProgress(workflow.step_states)
  }, [workflow])

  const getStepsByStatus = useCallback((status: StepStatus) => {
    if (!workflow) return []
    return Object.entries(workflow.step_states)
      .filter(([, stepStatus]) => stepStatus === status)
      .map(([stepId]) => stepId)
  }, [workflow])

  const getRecentEvents = useCallback((count: number = 10) => {
    return events.slice(0, count)
  }, [events])

  useEffect(() => {
    if (workflowId) {
      loadWorkflow()
    }
  }, [workflowId, loadWorkflow])

  return {
    workflow,
    events,
    loading,
    error,
    loadWorkflow,
    completeStep,
    failStep,
    assignAgentToStep,
    getProgress,
    getStepsByStatus,
    getRecentEvents
  }
}

// Analytics Hook
export function useWorkflowAnalytics() {
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null)
  const [monitoringData, setMonitoringData] = useState<WorkflowMonitoringData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [analyticsData, monitoring] = await Promise.all([
        workflowStateApi.getWorkflowAnalytics(),
        workflowStateApi.getMonitoringData()
      ])
      
      setAnalytics(analyticsData)
      setMonitoringData(monitoring)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
      setError(errorMessage)
      // Use mock data as fallback
      const mockAnalytics = workflowStateApi.generateMockAnalytics()
      setAnalytics(mockAnalytics)
    } finally {
      setLoading(false)
    }
  }, [])

  const startRealTimeUpdates = useCallback((intervalMs: number = 30000) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    loadAnalytics() // Initial load
    intervalRef.current = setInterval(loadAnalytics, intervalMs)
  }, [loadAnalytics])

  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
    return () => stopRealTimeUpdates()
  }, [loadAnalytics, stopRealTimeUpdates])

  const getSuccessRate = useCallback(() => {
    return analytics?.success_rate || 0
  }, [analytics])

  const getAverageCompletionTime = useCallback(() => {
    return analytics?.average_completion_time || 0
  }, [analytics])

  const getTopFailureReasons = useCallback((count: number = 3) => {
    return analytics?.most_common_failures.slice(0, count) || []
  }, [analytics])

  const getAgentUtilization = useCallback(() => {
    return analytics?.agent_utilization || []
  }, [analytics])

  return {
    analytics,
    monitoringData,
    loading,
    error,
    loadAnalytics,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    getSuccessRate,
    getAverageCompletionTime,
    getTopFailureReasons,
    getAgentUtilization,
    isRealTimeActive: intervalRef.current !== null
  }
}

// Real-time Updates Hook
export function useWorkflowRealTimeUpdates(workflowId?: string) {
  const [updates, setUpdates] = useState<any[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback((targetWorkflowId?: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const id = targetWorkflowId || workflowId
    if (!id) {
      // Connect to all workflows
      const ws = workflowStateApi.subscribeToAllWorkflows((data) => {
        setUpdates(prev => [{ ...data, timestamp: new Date().toISOString() }, ...prev.slice(0, 99)])
      })

      if (ws) {
        wsRef.current = ws
        ws.onopen = () => setConnected(true)
        ws.onclose = () => setConnected(false)
        ws.onerror = () => setConnected(false)
      }
    } else {
      // Connect to specific workflow
      const ws = workflowStateApi.subscribeToWorkflowUpdates(id, (data) => {
        setUpdates(prev => [{ ...data, timestamp: new Date().toISOString() }, ...prev.slice(0, 99)])
      })

      if (ws) {
        wsRef.current = ws
        ws.onopen = () => setConnected(true)
        ws.onclose = () => setConnected(false)
        ws.onerror = () => setConnected(false)
      }
    }
  }, [workflowId])

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
    connected,
    connect,
    disconnect,
    clearUpdates
  }
}
