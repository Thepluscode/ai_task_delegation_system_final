/**
 * Workflow State Management API Client
 * Hierarchical state machine with event sourcing for complex workflows
 */

import { api } from './client'
import { 
  WorkflowDefinition,
  WorkflowStateSnapshot,
  WorkflowEvent,
  WorkflowInfo,
  WorkflowAnalytics,
  WorkflowMonitoringData,
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  WorkflowActionRequest,
  WorkflowActionResponse,
  StepActionRequest,
  StepActionResponse,
  AgentAssignmentRequest,
  AgentAssignmentResponse,
  WorkflowState,
  WorkflowSubState,
  EventType,
  StepType,
  StepStatus,
  SystemHealth
} from '@/types/workflow-state'

// Workflow State Management API Client
export const workflowStateApi = {
  // Base URL for the service
  baseURL: process.env.NEXT_PUBLIC_WORKFLOW_STATE_URL || 'http://localhost:8003',

  // Service Health and Info
  getHealth: async (): Promise<SystemHealth> => {
    const response = await api.get('/health', { baseURL: workflowStateApi.baseURL })
    return {
      overall_status: 'healthy',
      event_store_status: 'healthy',
      state_machine_status: 'healthy',
      workflow_engine_status: 'healthy',
      last_health_check: new Date().toISOString(),
      ...response.data
    }
  },

  getServiceInfo: async () => {
    const response = await api.get('/', { baseURL: workflowStateApi.baseURL })
    return response.data
  },

  // Workflow Management
  createWorkflow: async (request: CreateWorkflowRequest): Promise<CreateWorkflowResponse> => {
    const response = await api.post('/api/v1/workflows', request, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  getWorkflow: async (workflowId: string): Promise<WorkflowStateSnapshot> => {
    const response = await api.get(`/api/v1/workflows/${workflowId}`, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  listWorkflows: async (params?: {
    state?: WorkflowState
    limit?: number
    offset?: number
  }): Promise<{ workflows: WorkflowStateSnapshot[]; total: number }> => {
    const response = await api.get('/api/v1/workflows', {
      params,
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  // Workflow Actions
  startWorkflow: async (workflowId: string): Promise<WorkflowActionResponse> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/start`, {}, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  pauseWorkflow: async (workflowId: string): Promise<WorkflowActionResponse> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/pause`, {}, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  resumeWorkflow: async (workflowId: string): Promise<WorkflowActionResponse> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/resume`, {}, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  cancelWorkflow: async (workflowId: string): Promise<WorkflowActionResponse> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/cancel`, {}, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  // Step Management
  completeStep: async (workflowId: string, stepId: string, result: Record<string, any>): Promise<StepActionResponse> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/steps/${stepId}/complete`, {
      result
    }, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  failStep: async (workflowId: string, stepId: string, errorMessage: string): Promise<StepActionResponse> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/steps/${stepId}/fail`, {
      error_message: errorMessage
    }, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  assignAgentToStep: async (workflowId: string, stepId: string, agentId: string): Promise<AgentAssignmentResponse> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/steps/${stepId}/assign`, {
      agent_id: agentId
    }, {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  // Event Sourcing
  getWorkflowEvents: async (workflowId: string, fromSequence?: number): Promise<WorkflowEvent[]> => {
    const response = await api.get(`/api/v1/workflows/${workflowId}/events`, {
      params: { from_sequence: fromSequence },
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  // Analytics and Monitoring
  getWorkflowAnalytics: async (): Promise<WorkflowAnalytics> => {
    const response = await api.get('/api/v1/analytics', {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  getMonitoringData: async (): Promise<WorkflowMonitoringData> => {
    const response = await api.get('/api/v1/monitoring', {
      baseURL: workflowStateApi.baseURL
    })
    return response.data
  },

  // WebSocket Connection for Real-time Updates
  subscribeToWorkflowUpdates: (workflowId: string, callback: (data: any) => void) => {
    if (typeof window === 'undefined') return null

    const wsUrl = `${workflowStateApi.baseURL.replace('http', 'ws')}/ws/workflows/${workflowId}`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log(`Workflow WebSocket connected for ${workflowId}`)
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('Workflow WebSocket error:', error)
    }
    
    ws.onclose = () => {
      console.log(`Workflow WebSocket disconnected for ${workflowId}`)
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        workflowStateApi.subscribeToWorkflowUpdates(workflowId, callback)
      }, 5000)
    }
    
    return ws
  },

  subscribeToAllWorkflows: (callback: (data: any) => void) => {
    if (typeof window === 'undefined') return null

    const wsUrl = `${workflowStateApi.baseURL.replace('http', 'ws')}/ws/workflows`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('All Workflows WebSocket connected')
      ws.send(JSON.stringify({ type: 'subscribe', channels: ['workflow_events', 'state_changes'] }))
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('Workflows WebSocket error:', error)
    }
    
    ws.onclose = () => {
      console.log('Workflows WebSocket disconnected')
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        workflowStateApi.subscribeToAllWorkflows(callback)
      }, 5000)
    }
    
    return ws
  },

  // Utility Functions
  createWorkflowDefinition: (
    name: string,
    description: string,
    steps: Array<{
      step_name: string
      step_type: StepType
      parameters?: Record<string, any>
      dependencies?: string[]
    }>
  ): WorkflowDefinition => {
    return {
      workflow_id: `workflow_${Date.now()}`,
      name,
      description,
      steps: steps.map((step, index) => ({
        step_id: `step_${index + 1}`,
        step_name: step.step_name,
        step_type: step.step_type,
        parameters: step.parameters || {},
        dependencies: step.dependencies || [],
        status: StepStatus.PENDING
      })),
      global_parameters: {}
    }
  },

  // Mock Data Generators for Development
  generateMockWorkflows: (count: number = 5): WorkflowStateSnapshot[] => {
    const states = Object.values(WorkflowState)
    const substates = Object.values(WorkflowSubState)
    
    return Array.from({ length: count }, (_, i) => ({
      workflow_id: `workflow_${i + 1}`,
      current_state: states[i % states.length],
      current_substate: i % 2 === 0 ? substates[i % substates.length] : undefined,
      step_states: {
        'step_1': StepStatus.COMPLETED,
        'step_2': i > 2 ? StepStatus.RUNNING : StepStatus.PENDING,
        'step_3': StepStatus.PENDING
      },
      assigned_agents: {
        'step_1': 'agent_001',
        'step_2': i > 2 ? 'agent_002' : ''
      },
      global_context: {
        priority: i % 3 + 1,
        category: ['banking', 'analysis', 'automation'][i % 3]
      },
      created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      snapshot_sequence: Math.floor(Math.random() * 100)
    }))
  },

  generateMockAnalytics: (): WorkflowAnalytics => {
    return {
      total_workflows: 156,
      active_workflows: 23,
      completed_workflows: 128,
      failed_workflows: 5,
      average_completion_time: 1847, // seconds
      success_rate: 96.8,
      most_common_failures: [
        {
          failure_type: 'timeout',
          count: 3,
          percentage: 60,
          common_steps: ['data_processing', 'external_api_call'],
          suggested_improvements: ['Increase timeout', 'Add retry logic']
        },
        {
          failure_type: 'validation_error',
          count: 2,
          percentage: 40,
          common_steps: ['input_validation'],
          suggested_improvements: ['Improve validation rules', 'Add data sanitization']
        }
      ],
      performance_trends: [
        {
          metric: 'completion_time',
          time_period: '7d',
          values: [1920, 1875, 1834, 1798, 1847, 1823, 1801],
          timestamps: Array.from({ length: 7 }, (_, i) => 
            new Date(Date.now() - (6 - i) * 86400000).toISOString()
          ),
          trend_direction: 'improving'
        }
      ],
      agent_utilization: [
        {
          agent_id: 'agent_001',
          agent_type: 'ai_system',
          workflows_assigned: 45,
          steps_completed: 134,
          average_step_time: 245,
          success_rate: 98.5,
          current_workload: 3,
          efficiency_rating: 94.2
        },
        {
          agent_id: 'agent_002',
          agent_type: 'human',
          workflows_assigned: 23,
          steps_completed: 67,
          average_step_time: 892,
          success_rate: 95.2,
          current_workload: 2,
          efficiency_rating: 87.6
        }
      ]
    }
  },

  // Formatting Utilities
  formatWorkflowState: (state: WorkflowState): string => {
    const labels = {
      [WorkflowState.PENDING]: 'Pending',
      [WorkflowState.ACTIVE]: 'Active',
      [WorkflowState.PAUSED]: 'Paused',
      [WorkflowState.COMPLETED]: 'Completed',
      [WorkflowState.FAILED]: 'Failed',
      [WorkflowState.CANCELLED]: 'Cancelled'
    }
    return labels[state] || state
  },

  formatWorkflowSubState: (substate?: WorkflowSubState): string => {
    if (!substate) return ''
    
    const labels = {
      [WorkflowSubState.INITIALIZING]: 'Initializing',
      [WorkflowSubState.EXECUTING]: 'Executing',
      [WorkflowSubState.WAITING]: 'Waiting',
      [WorkflowSubState.SYNCHRONIZING]: 'Synchronizing',
      [WorkflowSubState.FINALIZING]: 'Finalizing'
    }
    return labels[substate] || substate
  },

  formatStepType: (stepType: StepType): string => {
    const labels = {
      [StepType.SEQUENTIAL]: 'Sequential',
      [StepType.PARALLEL]: 'Parallel',
      [StepType.CONDITIONAL]: 'Conditional',
      [StepType.LOOP]: 'Loop',
      [StepType.SYNCHRONIZATION]: 'Synchronization'
    }
    return labels[stepType] || stepType
  },

  formatEventType: (eventType: EventType): string => {
    const labels = {
      [EventType.WORKFLOW_CREATED]: 'Workflow Created',
      [EventType.WORKFLOW_STARTED]: 'Workflow Started',
      [EventType.WORKFLOW_PAUSED]: 'Workflow Paused',
      [EventType.WORKFLOW_RESUMED]: 'Workflow Resumed',
      [EventType.WORKFLOW_COMPLETED]: 'Workflow Completed',
      [EventType.WORKFLOW_FAILED]: 'Workflow Failed',
      [EventType.STEP_ASSIGNED]: 'Step Assigned',
      [EventType.STEP_STARTED]: 'Step Started',
      [EventType.STEP_COMPLETED]: 'Step Completed',
      [EventType.STEP_FAILED]: 'Step Failed',
      [EventType.STATE_TRANSITION]: 'State Transition',
      [EventType.AGENT_ASSIGNED]: 'Agent Assigned',
      [EventType.AGENT_RELEASED]: 'Agent Released'
    }
    return labels[eventType] || eventType
  },

  getStateColor: (state: WorkflowState): string => {
    const colors = {
      [WorkflowState.PENDING]: '#6B7280',     // Gray
      [WorkflowState.ACTIVE]: '#3B82F6',      // Blue
      [WorkflowState.PAUSED]: '#F59E0B',      // Orange
      [WorkflowState.COMPLETED]: '#10B981',   // Green
      [WorkflowState.FAILED]: '#EF4444',      // Red
      [WorkflowState.CANCELLED]: '#6B7280'    // Gray
    }
    return colors[state] || '#6B7280'
  },

  getStepStatusColor: (status: StepStatus): string => {
    const colors = {
      [StepStatus.PENDING]: '#6B7280',        // Gray
      [StepStatus.RUNNING]: '#3B82F6',        // Blue
      [StepStatus.COMPLETED]: '#10B981',      // Green
      [StepStatus.FAILED]: '#EF4444',         // Red
      [StepStatus.SKIPPED]: '#F59E0B',        // Orange
      [StepStatus.CANCELLED]: '#6B7280'       // Gray
    }
    return colors[status] || '#6B7280'
  },

  calculateProgress: (stepStates: Record<string, StepStatus>): number => {
    const totalSteps = Object.keys(stepStates).length
    if (totalSteps === 0) return 0
    
    const completedSteps = Object.values(stepStates).filter(
      status => status === StepStatus.COMPLETED || status === StepStatus.SKIPPED
    ).length
    
    return (completedSteps / totalSteps) * 100
  },

  formatDuration: (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
  }
}
