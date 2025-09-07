import useSWR from 'swr'
import { agentsApi } from '@/lib/api/agents'
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

// Custom hook for managing agents
export function useAgents(params = {}) {
  const { data, error, mutate, isLoading } = useSWR(
    ['agents', params],
    () => agentsApi.getAgents(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  return {
    agents: data?.data || data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for a single agent
export function useAgent(agentId) {
  const { data, error, mutate, isLoading } = useSWR(
    agentId ? ['agent', agentId] : null,
    () => agentsApi.getAgent(agentId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  return {
    agent: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for agent performance
export function useAgentPerformance(agentId) {
  const { data, error, mutate, isLoading } = useSWR(
    agentId ? ['agent-performance', agentId] : null,
    () => agentsApi.getAgentPerformance(agentId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    performance: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for agent operations
export function useAgentOperations() {
  const [loading, setLoading] = useState(false)

  const registerAgent = useCallback(async (agentData) => {
    setLoading(true)
    try {
      const result = await agentsApi.registerAgent(agentData)
      toast.success('Agent registered successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to register agent')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAgent = useCallback(async (agentId, agentData) => {
    setLoading(true)
    try {
      const result = await agentsApi.updateAgent(agentId, agentData)
      toast.success('Agent updated successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to update agent')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAgent = useCallback(async (agentId) => {
    setLoading(true)
    try {
      await agentsApi.deleteAgent(agentId)
      toast.success('Agent deleted successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to delete agent')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAgentStatus = useCallback(async (agentId, status) => {
    setLoading(true)
    try {
      const result = await agentsApi.updateAgent(agentId, { current_status: status })
      toast.success(`Agent status updated to ${status}`)
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to update agent status')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkUpdateStatus = useCallback(async (agentIds, status) => {
    setLoading(true)
    try {
      await agentsApi.bulkUpdateAgentStatus(agentIds, status)
      toast.success(`Updated status for ${agentIds.length} agents`)
    } catch (error) {
      toast.error(error.message || 'Failed to update agent statuses')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    registerAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    bulkUpdateStatus,
  }
}

// Custom hook for task management
export function useTasks(params = {}) {
  const { data, error, mutate, isLoading } = useSWR(
    ['tasks', params],
    () => agentsApi.getTasks(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  return {
    tasks: data?.data || data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for task operations
export function useTaskOperations() {
  const [loading, setLoading] = useState(false)

  const createTask = useCallback(async (taskData) => {
    setLoading(true)
    try {
      const result = await agentsApi.createTask(taskData)
      toast.success('Task created successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to create task')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const assignTask = useCallback(async (task, availableAgents) => {
    setLoading(true)
    try {
      const result = await agentsApi.assignTask(task, availableAgents)
      toast.success(`Task assigned to ${result.assigned_agent_id}`)
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to assign task')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const requestDelegation = useCallback(async (delegationRequest) => {
    setLoading(true)
    try {
      const result = await agentsApi.requestDelegation(delegationRequest)
      toast.success('Task delegation completed')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to delegate task')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const reassignTask = useCallback(async (taskId, newAgentId, reason) => {
    setLoading(true)
    try {
      const result = await agentsApi.reassignTask(taskId, newAgentId, reason)
      toast.success('Task reassigned successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to reassign task')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkAssignTasks = useCallback(async (taskIds, criteria) => {
    setLoading(true)
    try {
      const result = await agentsApi.bulkAssignTasks(taskIds, criteria)
      toast.success(`Assigned ${taskIds.length} tasks`)
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to assign tasks')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    createTask,
    assignTask,
    requestDelegation,
    reassignTask,
    bulkAssignTasks,
  }
}

// Custom hook for fleet management
export function useFleet() {
  const { data: overview, error: overviewError, mutate: mutateOverview } = useSWR(
    'fleet-overview',
    agentsApi.getFleetOverview,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  const { data: status, error: statusError, mutate: mutateStatus } = useSWR(
    'fleet-status',
    agentsApi.getFleetStatus,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  )

  return {
    overview,
    status,
    overviewError,
    statusError,
    mutateOverview,
    mutateStatus,
  }
}

// Custom hook for analytics
export function useAnalytics(timeRange = '24h') {
  const { data: fleetPerformance, error: fleetError, mutate: mutateFleet } = useSWR(
    ['fleet-performance', timeRange],
    () => agentsApi.getFleetPerformance(timeRange),
    {
      refreshInterval: 60000, // Refresh every minute
    }
  )

  const { data: taskAnalytics, error: taskError, mutate: mutateTasks } = useSWR(
    ['task-analytics', timeRange],
    () => agentsApi.getTaskAnalytics(timeRange),
    {
      refreshInterval: 60000,
    }
  )

  return {
    fleetPerformance,
    taskAnalytics,
    fleetError,
    taskError,
    mutateFleet,
    mutateTasks,
  }
}

// Custom hook for capability management
export function useCapabilities() {
  const { data: matrix, error, mutate, isLoading } = useSWR(
    'capability-matrix',
    agentsApi.getCapabilityMatrix,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const [loading, setLoading] = useState(false)

  const updateMatrix = useCallback(async (newMatrix) => {
    setLoading(true)
    try {
      await agentsApi.updateCapabilityMatrix(newMatrix)
      toast.success('Capability matrix updated')
      mutate()
    } catch (error) {
      toast.error(error.message || 'Failed to update capability matrix')
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutate])

  const updateAgentCapabilities = useCallback(async (agentId, capabilities) => {
    setLoading(true)
    try {
      await agentsApi.updateAgentCapabilities(agentId, capabilities)
      toast.success('Agent capabilities updated')
    } catch (error) {
      toast.error(error.message || 'Failed to update capabilities')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    matrix,
    isLoading,
    error,
    loading,
    updateMatrix,
    updateAgentCapabilities,
    mutate,
  }
}

// Custom hook for optimization configuration
export function useOptimization() {
  const { data: config, error, mutate, isLoading } = useSWR(
    'optimization-config',
    agentsApi.getOptimizationConfig,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const [loading, setLoading] = useState(false)

  const updateConfig = useCallback(async (objectives) => {
    setLoading(true)
    try {
      await agentsApi.updateOptimizationConfig(objectives)
      toast.success('Optimization configuration updated')
      mutate()
    } catch (error) {
      toast.error(error.message || 'Failed to update optimization config')
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutate])

  const testConfig = useCallback(async (config, testCases) => {
    setLoading(true)
    try {
      const result = await agentsApi.testOptimizationConfig(config, testCases)
      toast.success('Configuration test completed')
      return result
    } catch (error) {
      toast.error(error.message || 'Configuration test failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    config,
    isLoading,
    error,
    loading,
    updateConfig,
    testConfig,
    mutate,
  }
}

// Custom hook for real-time monitoring
export function useRealtimeMonitoring() {
  const { data: systemStatus, mutate: mutateStatus } = useSWR(
    'system-status',
    agentsApi.getSystemStatus,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
    }
  )

  const { data: activeAssignments, mutate: mutateAssignments } = useSWR(
    'active-assignments',
    agentsApi.getActiveAssignments,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  )

  const { data: recentActivity, mutate: mutateActivity } = useSWR(
    'recent-activity',
    () => agentsApi.getRecentActivity(20),
    {
      refreshInterval: 15000, // Refresh every 15 seconds
    }
  )

  return {
    systemStatus,
    activeAssignments: activeAssignments || [],
    recentActivity: recentActivity || [],
    mutateStatus,
    mutateAssignments,
    mutateActivity,
  }
}
