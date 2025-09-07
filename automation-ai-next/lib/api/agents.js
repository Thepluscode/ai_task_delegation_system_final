import { api, apiUtils } from './client'

// Agent Selection Service API Client
export const agentsApi = {
  // Service Health and Info
  getServiceInfo: async () => {
    return api.get('/', { baseURL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8001' })
  },

  healthCheck: async () => {
    return api.get('/health', { baseURL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8001' })
  },

  // Agent Management
  registerAgent: async (agent) => {
    return api.post('/agents/register', agent, { 
      baseURL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8001' 
    })
  },

  getAgents: async (params = {}) => {
    // This would typically come from your main backend that stores agent data
    return api.get('/agents', { params })
  },

  getAgent: async (agentId) => {
    return api.get(`/agents/${agentId}`)
  },

  updateAgent: async (agentId, agentData) => {
    return api.put(`/agents/${agentId}`, agentData)
  },

  deleteAgent: async (agentId) => {
    return api.delete(`/agents/${agentId}`)
  },

  // Task Assignment - Core functionality
  assignTask: async (task, availableAgents) => {
    return api.post('/tasks/assign', {
      ...task,
      available_agents: availableAgents
    }, { 
      baseURL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8001' 
    })
  },

  // Task Management
  createTask: async (taskData) => {
    return api.post('/tasks', taskData)
  },

  getTasks: async (params = {}) => {
    return apiUtils.paginated('/tasks', params)
  },

  getTask: async (taskId) => {
    return api.get(`/tasks/${taskId}`)
  },

  updateTask: async (taskId, taskData) => {
    return api.put(`/tasks/${taskId}`, taskData)
  },

  deleteTask: async (taskId) => {
    return api.delete(`/tasks/${taskId}`)
  },

  // Assignment Management
  getAssignments: async (params = {}) => {
    return apiUtils.paginated('/assignments', params)
  },

  getAssignment: async (assignmentId) => {
    return api.get(`/assignments/${assignmentId}`)
  },

  updateAssignmentStatus: async (assignmentId, status) => {
    return api.patch(`/assignments/${assignmentId}`, { status })
  },

  reassignTask: async (taskId, newAgentId, reason) => {
    return api.post(`/assignments/reassign`, {
      task_id: taskId,
      new_agent_id: newAgentId,
      reason
    })
  },

  // Performance Analytics
  getAgentPerformance: async (agentId) => {
    return api.get(`/agents/${agentId}/performance`, { 
      baseURL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8001' 
    })
  },

  getFleetPerformance: async (timeRange = '24h') => {
    return api.get('/analytics/fleet', { 
      params: { range: timeRange } 
    })
  },

  getTaskAnalytics: async (timeRange = '24h') => {
    return api.get('/analytics/tasks', { 
      params: { range: timeRange } 
    })
  },

  getUtilizationMetrics: async (agentIds = []) => {
    return api.post('/analytics/utilization', { agent_ids: agentIds })
  },

  // Capability Management
  getCapabilityMatrix: async () => {
    return api.get('/capabilities/matrix', { 
      baseURL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8001' 
    })
  },

  updateCapabilityMatrix: async (matrix) => {
    return api.put('/capabilities/matrix', matrix)
  },

  getAgentCapabilities: async (agentId) => {
    return api.get(`/agents/${agentId}/capabilities`)
  },

  updateAgentCapabilities: async (agentId, capabilities) => {
    return api.put(`/agents/${agentId}/capabilities`, capabilities)
  },

  assessCapability: async (agentId, capabilityType, assessment) => {
    return api.post(`/agents/${agentId}/capabilities/${capabilityType}/assess`, assessment)
  },

  // Optimization Configuration
  getOptimizationConfig: async () => {
    return api.get('/optimization/config')
  },

  updateOptimizationConfig: async (objectives) => {
    return api.post('/optimization/configure', objectives, { 
      baseURL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8001' 
    })
  },

  // Fleet Overview and Monitoring
  getFleetOverview: async () => {
    return api.get('/fleet/overview')
  },

  getFleetStatus: async () => {
    return api.get('/fleet/status')
  },

  getSystemStatus: async () => {
    return api.get('/system/status')
  },

  // Delegation and Assignment Optimization
  requestDelegation: async (delegationRequest) => {
    const { task, preferred_agent_types, exclude_agents, optimization_preferences } = delegationRequest
    
    // Get available agents (this would typically filter based on preferences)
    const agentsResponse = await agentsApi.getAgents({
      types: preferred_agent_types,
      exclude: exclude_agents,
      status: 'available'
    })
    
    const availableAgents = agentsResponse.data || agentsResponse
    
    // Request assignment from optimization service
    return agentsApi.assignTask(task, availableAgents)
  },

  // Bulk Operations
  bulkAssignTasks: async (taskIds, criteria = {}) => {
    return api.post('/tasks/bulk-assign', {
      task_ids: taskIds,
      assignment_criteria: criteria
    })
  },

  bulkUpdateAgentStatus: async (agentIds, status) => {
    return api.post('/agents/bulk-update', {
      agent_ids: agentIds,
      status
    })
  },

  bulkReassignTasks: async (assignments) => {
    return api.post('/assignments/bulk-reassign', { assignments })
  },

  // Search and Filtering
  searchAgents: async (query, filters = {}) => {
    return api.get('/agents/search', {
      params: { q: query, ...filters }
    })
  },

  searchTasks: async (query, filters = {}) => {
    return api.get('/tasks/search', {
      params: { q: query, ...filters }
    })
  },

  filterAgentsByCapability: async (capabilities, minProficiency = 0.7) => {
    return api.post('/agents/filter/capabilities', {
      capabilities,
      min_proficiency: minProficiency
    })
  },

  // Recommendations and Suggestions
  getTaskRecommendations: async (taskId) => {
    return api.get(`/tasks/${taskId}/recommendations`)
  },

  getAgentRecommendations: async (agentId) => {
    return api.get(`/agents/${agentId}/recommendations`)
  },

  getOptimizationSuggestions: async () => {
    return api.get('/optimization/suggestions')
  },

  // Real-time Updates and Notifications
  getActiveAssignments: async () => {
    return api.get('/assignments/active')
  },

  getRecentActivity: async (limit = 50) => {
    return api.get('/activity/recent', { params: { limit } })
  },

  // Simulation and Testing
  simulateAssignment: async (task, agents, scenarios = []) => {
    return api.post('/simulation/assignment', {
      task,
      agents,
      scenarios
    })
  },

  testOptimizationConfig: async (config, testCases) => {
    return api.post('/optimization/test', {
      config,
      test_cases: testCases
    })
  },

  // Export and Import
  exportAgentData: async (agentIds = []) => {
    return api.download('/agents/export', `agents-${Date.now()}.json`, {
      params: { agent_ids: agentIds }
    })
  },

  exportTaskData: async (taskIds = []) => {
    return api.download('/tasks/export', `tasks-${Date.now()}.json`, {
      params: { task_ids: taskIds }
    })
  },

  importAgentData: async (file, onProgress) => {
    return api.upload('/agents/import', file, onProgress)
  },

  importTaskData: async (file, onProgress) => {
    return api.upload('/tasks/import', file, onProgress)
  },

  // Utility functions for client-side operations
  calculateTaskComplexity: (task) => {
    const factors = [
      task.requirements?.length || 0,
      task.estimated_duration / 60, // Convert to hours
      task.safety_critical ? 1 : 0,
      task.priority === 'safety_critical' ? 1 : 0
    ]
    
    const complexity = factors.reduce((sum, factor) => sum + factor, 0) / factors.length
    return Math.min(complexity, 1.0)
  },

  calculateAgentUtilization: (agent, assignments = []) => {
    const activeAssignments = assignments.filter(a => 
      a.assigned_agent_id === agent.agent_id && 
      ['assigned', 'in_progress'].includes(a.status)
    )
    
    return {
      current_workload: agent.current_workload || 0,
      active_tasks: activeAssignments.length,
      utilization_score: Math.min(agent.current_workload * 100, 100)
    }
  },

  // Client-side filtering and sorting
  filterAgents: (agents, filters) => {
    return agents.filter(agent => {
      if (filters.types && !filters.types.includes(agent.agent_type)) return false
      if (filters.statuses && !filters.statuses.includes(agent.current_status)) return false
      if (filters.min_safety_rating && agent.safety_rating < filters.min_safety_rating) return false
      if (filters.max_cost_per_hour && agent.cost_per_hour > filters.max_cost_per_hour) return false
      if (filters.locations && filters.locations.length > 0 && !filters.locations.includes(agent.location)) return false
      if (filters.min_workload && agent.current_workload < filters.min_workload) return false
      if (filters.max_workload && agent.current_workload > filters.max_workload) return false
      
      if (filters.capabilities && filters.capabilities.length > 0) {
        const hasRequiredCapabilities = filters.capabilities.every(cap => 
          agent.capabilities && agent.capabilities[cap]
        )
        if (!hasRequiredCapabilities) return false
      }
      
      return true
    })
  },

  sortAgents: (agents, sortBy, sortOrder = 'asc') => {
    return [...agents].sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'cost':
          aValue = a.cost_per_hour
          bValue = b.cost_per_hour
          break
        case 'safety':
          aValue = a.safety_rating
          bValue = b.safety_rating
          break
        case 'workload':
          aValue = a.current_workload
          bValue = b.current_workload
          break
        default:
          return 0
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
    })
  }
}
