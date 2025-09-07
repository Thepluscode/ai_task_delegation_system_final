/**
 * React Hooks for Agent Selection Service
 * Multi-objective optimization for intelligent task delegation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { agentSelectionApi } from '@/lib/api/agentSelection'
import { 
  Agent, 
  Task, 
  TaskAssignment, 
  AgentPerformanceMetrics,
  ServiceStatus,
  SystemAnalytics,
  AssignmentRequest,
  AssignmentResponse,
  AgentType,
  TaskPriority,
  OptimizationScores,
  CapabilityMatrix
} from '@/types/agent-selection'
import toast from 'react-hot-toast'

// Service Status Hook
export function useAgentSelectionService() {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkServiceHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [health, info] = await Promise.all([
        agentSelectionApi.getHealth(),
        agentSelectionApi.getServiceInfo()
      ])
      
      setServiceStatus({
        ...health,
        ...info,
        last_updated: new Date().toISOString()
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Service unavailable'
      setError(errorMessage)
      setServiceStatus({
        status: 'offline',
        version: 'unknown',
        capabilities: [],
        active_agents: 0,
        pending_assignments: 0,
        last_updated: new Date().toISOString()
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
    isOnline: serviceStatus?.status === 'healthy'
  }
}

// Agent Management Hook
export function useAgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerAgent = useCallback(async (agent: Agent) => {
    setLoading(true)
    setError(null)
    try {
      await agentSelectionApi.registerAgent(agent)
      setAgents(prev => [...prev, agent])
      toast.success(`Agent ${agent.name} registered successfully`)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register agent'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgentPerformance = useCallback(async (agentId: string): Promise<AgentPerformanceMetrics | null> => {
    try {
      return await agentSelectionApi.getAgentPerformance(agentId)
    } catch (err) {
      console.error('Failed to get agent performance:', err)
      return null
    }
  }, [])

  const generateMockAgents = useCallback((count: number = 10) => {
    const mockAgents = agentSelectionApi.generateMockAgents(count)
    setAgents(mockAgents)
    return mockAgents
  }, [])

  const updateAgentStatus = useCallback((agentId: string, status: string) => {
    setAgents(prev => prev.map(agent => 
      agent.agent_id === agentId 
        ? { ...agent, current_status: status as any }
        : agent
    ))
  }, [])

  const getAvailableAgents = useCallback(() => {
    return agents.filter(agent => agent.current_status === 'available')
  }, [agents])

  const getAgentsByType = useCallback((type: AgentType) => {
    return agents.filter(agent => agent.agent_type === type)
  }, [agents])

  return {
    agents,
    loading,
    error,
    registerAgent,
    getAgentPerformance,
    generateMockAgents,
    updateAgentStatus,
    getAvailableAgents,
    getAgentsByType,
    totalAgents: agents.length,
    availableAgents: getAvailableAgents().length
  }
}

// Task Assignment Hook
export function useTaskAssignment() {
  const [assignments, setAssignments] = useState<TaskAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  const assignTask = useCallback(async (
    task: Task, 
    availableAgents: Agent[]
  ): Promise<TaskAssignment | null> => {
    setLoading(true)
    setError(null)
    setCurrentTask(task)
    
    try {
      const assignment = await agentSelectionApi.assignTask(task, availableAgents)
      setAssignments(prev => [assignment, ...prev.slice(0, 49)]) // Keep last 50
      toast.success(`Task assigned to ${assignment.assigned_agent_id}`)
      return assignment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign task'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
      setCurrentTask(null)
    }
  }, [])

  const assignTaskAdvanced = useCallback(async (
    request: AssignmentRequest
  ): Promise<AssignmentResponse | null> => {
    setLoading(true)
    setError(null)
    setCurrentTask(request.task)
    
    try {
      const response = await agentSelectionApi.assignTaskAdvanced(request)
      setAssignments(prev => [response.assignment, ...prev.slice(0, 49)])
      toast.success(`Task assigned to ${response.assignment.assigned_agent_id}`)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign task'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
      setCurrentTask(null)
    }
  }, [])

  const generateMockTask = useCallback(() => {
    return agentSelectionApi.generateMockTask()
  }, [])

  const getRecentAssignments = useCallback((count: number = 10) => {
    return assignments.slice(0, count)
  }, [assignments])

  const getAssignmentsByAgent = useCallback((agentId: string) => {
    return assignments.filter(assignment => assignment.assigned_agent_id === agentId)
  }, [assignments])

  const clearAssignments = useCallback(() => {
    setAssignments([])
  }, [])

  return {
    assignments,
    loading,
    error,
    currentTask,
    assignTask,
    assignTaskAdvanced,
    generateMockTask,
    getRecentAssignments,
    getAssignmentsByAgent,
    clearAssignments,
    totalAssignments: assignments.length
  }
}

// System Analytics Hook
export function useAgentSelectionAnalytics() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // For now, use mock data since the service doesn't have analytics endpoint yet
      const mockAnalytics = agentSelectionApi.generateMockSystemAnalytics()
      setAnalytics(mockAnalytics)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
      setError(errorMessage)
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

  const getEfficiencyTrend = useCallback(() => {
    if (!analytics) return 'stable'
    
    const efficiency = analytics.system_efficiency
    if (efficiency > 0.9) return 'excellent'
    if (efficiency > 0.8) return 'good'
    if (efficiency > 0.7) return 'fair'
    return 'needs_improvement'
  }, [analytics])

  const getTopPerformingAgents = useCallback((count: number = 5) => {
    if (!analytics) return []
    
    return analytics.utilization_metrics
      .sort((a, b) => b.efficiency_score - a.efficiency_score)
      .slice(0, count)
  }, [analytics])

  const getAgentTypeDistribution = useCallback(() => {
    if (!analytics) return {}
    
    const distribution: Record<AgentType, number> = {
      [AgentType.ROBOT]: 0,
      [AgentType.HUMAN]: 0,
      [AgentType.AI_SYSTEM]: 0,
      [AgentType.HYBRID]: 0
    }
    
    analytics.utilization_metrics.forEach(metric => {
      distribution[metric.agent_type]++
    })
    
    return distribution
  }, [analytics])

  return {
    analytics,
    loading,
    error,
    loadAnalytics,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    getEfficiencyTrend,
    getTopPerformingAgents,
    getAgentTypeDistribution,
    isRealTimeActive: intervalRef.current !== null
  }
}

// Capability Matrix Hook
export function useCapabilityMatrix() {
  const [matrix, setMatrix] = useState<CapabilityMatrix | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMatrix = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const capabilityMatrix = await agentSelectionApi.getCapabilityMatrix()
      setMatrix(capabilityMatrix)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load capability matrix'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMatrix()
  }, [loadMatrix])

  const getCapabilitiesForAgentType = useCallback((agentType: AgentType) => {
    if (!matrix) return {}
    return matrix[agentType] || {}
  }, [matrix])

  const getAgentTypesForCapability = useCallback((capability: string) => {
    if (!matrix) return []
    
    const agentTypes: Array<{ type: AgentType; proficiency: number }> = []
    
    Object.entries(matrix).forEach(([type, capabilities]) => {
      if (capabilities[capability]) {
        agentTypes.push({
          type: type as AgentType,
          proficiency: capabilities[capability]
        })
      }
    })
    
    return agentTypes.sort((a, b) => b.proficiency - a.proficiency)
  }, [matrix])

  const getAllCapabilities = useCallback(() => {
    if (!matrix) return []
    
    const capabilities = new Set<string>()
    Object.values(matrix).forEach(agentCapabilities => {
      Object.keys(agentCapabilities).forEach(cap => capabilities.add(cap))
    })
    
    return Array.from(capabilities).sort()
  }, [matrix])

  return {
    matrix,
    loading,
    error,
    loadMatrix,
    getCapabilitiesForAgentType,
    getAgentTypesForCapability,
    getAllCapabilities
  }
}

// Optimization Configuration Hook
export function useOptimizationConfig() {
  const [config, setConfig] = useState<Record<string, any>>({
    speed: { weight: 0.25, maximize: false },
    quality: { weight: 0.30, maximize: true },
    cost: { weight: 0.20, maximize: false },
    safety: { weight: 0.15, maximize: true },
    energy: { weight: 0.10, maximize: false }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateConfig = useCallback(async (newConfig: Record<string, any>) => {
    setLoading(true)
    setError(null)
    try {
      await agentSelectionApi.configureOptimization(newConfig)
      setConfig(newConfig)
      toast.success('Optimization configuration updated')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const resetToDefaults = useCallback(() => {
    const defaultConfig = {
      speed: { weight: 0.25, maximize: false },
      quality: { weight: 0.30, maximize: true },
      cost: { weight: 0.20, maximize: false },
      safety: { weight: 0.15, maximize: true },
      energy: { weight: 0.10, maximize: false }
    }
    setConfig(defaultConfig)
  }, [])

  const validateWeights = useCallback((weights: Record<string, number>) => {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    return Math.abs(total - 1.0) < 0.01 // Allow small floating point errors
  }, [])

  return {
    config,
    loading,
    error,
    updateConfig,
    resetToDefaults,
    validateWeights
  }
}
