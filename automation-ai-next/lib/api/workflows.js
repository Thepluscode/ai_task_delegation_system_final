import { api, apiUtils } from './client'

// Workflow State Management Service API Client
export const workflowsApi = {
  // Service Health and Info
  getServiceInfo: async () => {
    return api.get('/', { baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003' })
  },

  healthCheck: async () => {
    return api.get('/health', { baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003' })
  },

  // Workflow Management
  createWorkflow: async (definition) => {
    return api.post('/workflows', definition, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  getWorkflows: async (params = {}) => {
    return api.get('/workflows', {
      params,
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  getWorkflow: async (workflowId) => {
    return api.get(`/workflows/${workflowId}`, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  updateWorkflow: async (workflowId, updates) => {
    return api.put(`/workflows/${workflowId}`, updates, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  deleteWorkflow: async (workflowId) => {
    return api.delete(`/workflows/${workflowId}`, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  // Workflow Execution Control
  startWorkflow: async (workflowId) => {
    return api.post(`/workflows/${workflowId}/start`, {}, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  pauseWorkflow: async (workflowId) => {
    return api.post(`/workflows/${workflowId}/pause`, {}, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  resumeWorkflow: async (workflowId) => {
    return api.post(`/workflows/${workflowId}/resume`, {}, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  cancelWorkflow: async (workflowId, reason = '') => {
    return api.post(`/workflows/${workflowId}/cancel`, { reason }, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  // Resume workflow
  resume: async (id) => {
    return api.post(`/workflows/${id}/resume`)
  },

  // Get workflow execution history
  getExecutions: async (id, params = {}) => {
    return apiUtils.paginated(`/workflows/${id}/executions`, params)
  },

  // Get workflow execution by ID
  getExecution: async (workflowId, executionId) => {
    return api.get(`/workflows/${workflowId}/executions/${executionId}`)
  },

  // Cancel workflow execution
  cancelExecution: async (workflowId, executionId) => {
    return api.post(`/workflows/${workflowId}/executions/${executionId}/cancel`)
  },

  // Get workflow logs
  getLogs: async (id, params = {}) => {
    return apiUtils.paginated(`/workflows/${id}/logs`, params)
  },

  // Get workflow metrics
  getMetrics: async (id, timeRange = '24h') => {
    return api.get(`/workflows/${id}/metrics?range=${timeRange}`)
  },

  // Get workflow analytics
  getAnalytics: async (id, params = {}) => {
    return api.get(`/workflows/${id}/analytics`, { params })
  },

  // Export workflow
  export: async (id, format = 'json') => {
    return api.download(`/workflows/${id}/export?format=${format}`, `workflow-${id}.${format}`)
  },

  // Import workflow
  import: async (file, onProgress) => {
    return api.upload('/workflows/import', file, onProgress)
  },

  // Validate workflow
  validate: async (workflowData) => {
    return api.post('/workflows/validate', workflowData)
  },

  // Get workflow templates
  getTemplates: async (params = {}) => {
    return apiUtils.paginated('/workflows/templates', params)
  },

  // Create workflow from template
  createFromTemplate: async (templateId, workflowData) => {
    return api.post(`/workflows/templates/${templateId}/create`, workflowData)
  },

  // Get workflow dependencies
  getDependencies: async (id) => {
    return api.get(`/workflows/${id}/dependencies`)
  },

  // Get workflow versions
  getVersions: async (id) => {
    return api.get(`/workflows/${id}/versions`)
  },

  // Create workflow version
  createVersion: async (id, versionData) => {
    return api.post(`/workflows/${id}/versions`, versionData)
  },

  // Restore workflow version
  restoreVersion: async (id, versionId) => {
    return api.post(`/workflows/${id}/versions/${versionId}/restore`)
  },

  // Share workflow
  share: async (id, shareData) => {
    return api.post(`/workflows/${id}/share`, shareData)
  },

  // Get workflow permissions
  getPermissions: async (id) => {
    return api.get(`/workflows/${id}/permissions`)
  },

  // Update workflow permissions
  updatePermissions: async (id, permissions) => {
    return api.put(`/workflows/${id}/permissions`, permissions)
  },

  // Get workflow comments
  getComments: async (id) => {
    return api.get(`/workflows/${id}/comments`)
  },

  // Add workflow comment
  addComment: async (id, comment) => {
    return api.post(`/workflows/${id}/comments`, comment)
  },

  // Update workflow comment
  updateComment: async (id, commentId, comment) => {
    return api.put(`/workflows/${id}/comments/${commentId}`, comment)
  },

  // Delete workflow comment
  deleteComment: async (id, commentId) => {
    return api.delete(`/workflows/${id}/comments/${commentId}`)
  },

  // Get workflow statistics
  getStatistics: async (params = {}) => {
    return api.get('/workflows/statistics', { params })
  },

  // Bulk operations
  bulkStart: async (workflowIds) => {
    return api.post('/workflows/bulk/start', { workflow_ids: workflowIds })
  },

  bulkPause: async (workflowIds) => {
    return api.post('/workflows/bulk/pause', { workflow_ids: workflowIds })
  },

  bulkStop: async (workflowIds) => {
    return api.post('/workflows/bulk/stop', { workflow_ids: workflowIds })
  },

  bulkDelete: async (workflowIds) => {
    return api.post('/workflows/bulk/delete', { workflow_ids: workflowIds })
  },

  // Search workflows
  search: async (query, params = {}) => {
    return api.get('/workflows/search', { 
      params: { q: query, ...params } 
    })
  },

  // Get workflow suggestions
  getSuggestions: async (query) => {
    return api.get('/workflows/suggestions', {
      params: { q: query }
    })
  },

  // Workflow State Management Service specific functions
  retryWorkflow: async (workflowId, fromStep = null) => {
    return api.post(`/workflows/${workflowId}/retry`, { from_step: fromStep }, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  completeStep: async (workflowId, stepId, result) => {
    return api.post(`/workflows/${workflowId}/steps/${stepId}/complete`, { result }, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  failStep: async (workflowId, stepId, error) => {
    return api.post(`/workflows/${workflowId}/steps/${stepId}/fail`, { error }, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  assignAgentToStep: async (workflowId, stepId, agentId) => {
    return api.post(`/workflows/${workflowId}/steps/${stepId}/assign`, agentId, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  // Get valid state transitions
  getValidTransitions: async (workflowId) => {
    return api.get(`/workflows/${workflowId}/transitions`, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  // List all workflows
  listWorkflows: async () => {
    return api.get('/workflows', {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  getWorkflowState: async (workflowId) => {
    return api.get(`/workflows/${workflowId}/state`, {
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  getWorkflowEvents: async (workflowId, fromSequence = 0) => {
    return api.get(`/workflows/${workflowId}/events`, {
      params: { from_sequence: fromSequence },
      baseURL: process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL || 'http://localhost:8003'
    })
  },

  // Real-time updates for Workflow State Management
  subscribeToWorkflowUpdates: (workflowId, callback) => {
    const wsUrl = process.env.NEXT_PUBLIC_WORKFLOW_WS_URL || 'ws://localhost:8003'
    const ws = new WebSocket(`${wsUrl}/ws/workflows/${workflowId}`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    return ws
  },

  // Utility functions for Workflow State Management
  calculateWorkflowProgress: (workflow) => {
    if (!workflow.steps || workflow.steps.length === 0) return 0

    const completedSteps = workflow.steps.filter(step =>
      step.status === 'completed' || step.status === 'skipped'
    ).length

    return (completedSteps / workflow.steps.length) * 100
  },

  getValidTransitions: (currentState) => {
    const transitions = {
      'pending': ['active'],
      'active': ['paused', 'completed', 'failed', 'cancelled'],
      'paused': ['active', 'cancelled'],
      'completed': [],
      'failed': [],
      'cancelled': []
    }

    return transitions[currentState] || []
  },

  canTransitionTo: (currentState, targetState) => {
    const validTransitions = workflowsApi.getValidTransitions(currentState)
    return validTransitions.includes(targetState)
  }
}
