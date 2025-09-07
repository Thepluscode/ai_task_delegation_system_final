import useSWR from 'swr'
import { workflowsApi } from '@/lib/api/workflows'
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

// Custom hook for managing workflows
export function useWorkflows(params = {}) {
  const { data, error, mutate, isLoading } = useSWR(
    ['workflows', params],
    () => workflowsApi.listWorkflows ? workflowsApi.listWorkflows() : workflowsApi.getWorkflows(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  return {
    workflows: data?.workflows || data?.data || data || [],
    pagination: data?.pagination,
    totalCount: data?.total_count,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for a single workflow
export function useWorkflow(id) {
  const { data, error, mutate, isLoading } = useSWR(
    id ? ['workflow', id] : null,
    () => workflowsApi.getWorkflow ? workflowsApi.getWorkflow(id) : workflowsApi.getById(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // Refresh every 10 seconds for active workflows
    }
  )

  return {
    workflow: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for workflow state with real-time updates
export function useWorkflowState(workflowId) {
  const [state, setState] = useState(null)
  const [events, setEvents] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  const { data: initialState, error, mutate } = useSWR(
    workflowId ? ['workflow-state', workflowId] : null,
    () => workflowsApi.getWorkflowState(workflowId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  // Set initial state
  useEffect(() => {
    if (initialState) {
      setState(initialState)
    }
  }, [initialState])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!workflowId || !workflowsApi.subscribeToWorkflowUpdates) return

    const ws = workflowsApi.subscribeToWorkflowUpdates(workflowId, (data) => {
      if (data.type === 'state_update') {
        setState(data.state)
      } else if (data.type === 'event') {
        setEvents(prev => [...prev, data.event])
      }
    })

    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = () => setIsConnected(false)

    return () => {
      ws.close()
    }
  }, [workflowId])

  return {
    state,
    events,
    isConnected,
    error,
    mutate,
  }
}

// Custom hook for workflow operations
export function useWorkflowOperations() {
  const [loading, setLoading] = useState(false)

  const createWorkflow = useCallback(async (workflowData) => {
    setLoading(true)
    try {
      const result = await (workflowsApi.createWorkflow || workflowsApi.create)(workflowData)
      toast.success('Workflow created successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to create workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const startWorkflow = useCallback(async (workflowId) => {
    setLoading(true)
    try {
      const result = await (workflowsApi.startWorkflow || workflowsApi.start)(workflowId)
      toast.success('Workflow started successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to start workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const pauseWorkflow = useCallback(async (workflowId) => {
    setLoading(true)
    try {
      const result = await (workflowsApi.pauseWorkflow || workflowsApi.pause)(workflowId)
      toast.success('Workflow paused successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to pause workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const resumeWorkflow = useCallback(async (workflowId) => {
    setLoading(true)
    try {
      const result = await (workflowsApi.resumeWorkflow || workflowsApi.resume)(workflowId)
      toast.success('Workflow resumed successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to resume workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelWorkflow = useCallback(async (workflowId, reason = '') => {
    setLoading(true)
    try {
      const result = await workflowsApi.cancelWorkflow(workflowId, reason)
      toast.success('Workflow cancelled successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to cancel workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const completeStep = useCallback(async (workflowId, stepId, result) => {
    setLoading(true)
    try {
      await workflowsApi.completeStep(workflowId, stepId, result)
      toast.success('Step completed successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to complete step')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const failStep = useCallback(async (workflowId, stepId, error) => {
    setLoading(true)
    try {
      await workflowsApi.failStep(workflowId, stepId, error)
      toast.success('Step marked as failed')
    } catch (error) {
      toast.error(error.message || 'Failed to mark step as failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const assignAgentToStep = useCallback(async (workflowId, stepId, agentId) => {
    setLoading(true)
    try {
      await workflowsApi.assignAgentToStep(workflowId, stepId, agentId)
      toast.success('Agent assigned to step')
    } catch (error) {
      toast.error(error.message || 'Failed to assign agent')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateWorkflow = useCallback(async (id, workflowData) => {
    setLoading(true)
    try {
      const result = await workflowsApi.update(id, workflowData)
      toast.success('Workflow updated successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to update workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteWorkflow = useCallback(async (id) => {
    setLoading(true)
    try {
      await workflowsApi.delete(id)
      toast.success('Workflow deleted successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to delete workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const duplicateWorkflow = useCallback(async (id, name) => {
    setLoading(true)
    try {
      const result = await workflowsApi.duplicate(id, name)
      toast.success('Workflow duplicated successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to duplicate workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const executeWorkflow = useCallback(async (id, inputs = {}) => {
    setLoading(true)
    try {
      const result = await workflowsApi.execute(id, inputs)
      toast.success('Workflow execution started')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to execute workflow')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])



  const bulkStart = useCallback(async (workflowIds) => {
    setLoading(true)
    try {
      await workflowsApi.bulkStart(workflowIds)
      toast.success(`Started ${workflowIds.length} workflows`)
    } catch (error) {
      toast.error(error.message || 'Failed to start workflows')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkPause = useCallback(async (workflowIds) => {
    setLoading(true)
    try {
      await workflowsApi.bulkPause(workflowIds)
      toast.success(`Paused ${workflowIds.length} workflows`)
    } catch (error) {
      toast.error(error.message || 'Failed to pause workflows')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkStop = useCallback(async (workflowIds) => {
    setLoading(true)
    try {
      await workflowsApi.bulkStop(workflowIds)
      toast.success(`Stopped ${workflowIds.length} workflows`)
    } catch (error) {
      toast.error(error.message || 'Failed to stop workflows')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDelete = useCallback(async (workflowIds) => {
    setLoading(true)
    try {
      await workflowsApi.bulkDelete(workflowIds)
      toast.success(`Deleted ${workflowIds.length} workflows`)
    } catch (error) {
      toast.error(error.message || 'Failed to delete workflows')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    executeWorkflow,
    startWorkflow,
    pauseWorkflow,
    stopWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    completeStep,
    failStep,
    assignAgentToStep,
    bulkStart,
    bulkPause,
    bulkStop,
    bulkDelete,
  }
}

// Custom hook for workflow executions
export function useWorkflowExecutions(workflowId, params = {}) {
  const { data, error, mutate, isLoading } = useSWR(
    workflowId ? ['workflow-executions', workflowId, params] : null,
    () => workflowsApi.getExecutions(workflowId, params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
    }
  )

  return {
    executions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for workflow metrics
export function useWorkflowMetrics(workflowId, timeRange = '24h') {
  const { data, error, mutate, isLoading } = useSWR(
    workflowId ? ['workflow-metrics', workflowId, timeRange] : null,
    () => workflowsApi.getMetrics(workflowId, timeRange),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  return {
    metrics: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for workflow templates
export function useWorkflowTemplates(params = {}) {
  const { data, error, mutate, isLoading } = useSWR(
    ['workflow-templates', params],
    () => workflowsApi.getTemplates(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    templates: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for workflow events
export function useWorkflowEvents(workflowId, params = {}) {
  const { data, error, mutate, isLoading } = useSWR(
    workflowId ? ['workflow-events', workflowId, params] : null,
    () => workflowsApi.getWorkflowEvents ? workflowsApi.getWorkflowEvents(workflowId, params) : Promise.resolve([]),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
    }
  )

  return {
    events: data?.data || data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for bulk workflow operations
export function useBulkWorkflowOperations() {
  const [loading, setLoading] = useState(false)
  const [selectedWorkflows, setSelectedWorkflows] = useState([])

  const selectWorkflow = useCallback((workflowId) => {
    setSelectedWorkflows(prev =>
      prev.includes(workflowId)
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    )
  }, [])

  const selectAll = useCallback((workflowIds) => {
    setSelectedWorkflows(workflowIds)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedWorkflows([])
  }, [])

  const bulkStart = useCallback(async (workflowIds = selectedWorkflows) => {
    setLoading(true)
    try {
      await workflowsApi.bulkStart(workflowIds)
      toast.success(`Started ${workflowIds.length} workflows`)
      clearSelection()
    } catch (error) {
      toast.error(error.message || 'Failed to start workflows')
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedWorkflows, clearSelection])

  const bulkPause = useCallback(async (workflowIds = selectedWorkflows) => {
    setLoading(true)
    try {
      await workflowsApi.bulkPause(workflowIds)
      toast.success(`Paused ${workflowIds.length} workflows`)
      clearSelection()
    } catch (error) {
      toast.error(error.message || 'Failed to pause workflows')
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedWorkflows, clearSelection])

  const bulkStop = useCallback(async (workflowIds = selectedWorkflows) => {
    setLoading(true)
    try {
      await workflowsApi.bulkStop(workflowIds)
      toast.success(`Stopped ${workflowIds.length} workflows`)
      clearSelection()
    } catch (error) {
      toast.error(error.message || 'Failed to stop workflows')
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedWorkflows, clearSelection])

  const bulkDelete = useCallback(async (workflowIds = selectedWorkflows) => {
    setLoading(true)
    try {
      await workflowsApi.bulkDelete(workflowIds)
      toast.success(`Deleted ${workflowIds.length} workflows`)
      clearSelection()
    } catch (error) {
      toast.error(error.message || 'Failed to delete workflows')
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedWorkflows, clearSelection])

  return {
    loading,
    selectedWorkflows,
    selectWorkflow,
    selectAll,
    clearSelection,
    bulkStart,
    bulkPause,
    bulkStop,
    bulkDelete,
  }
}
