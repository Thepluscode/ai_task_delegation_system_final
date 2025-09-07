/**
 * Agent Selection Service API Client
 * Multi-objective optimization for intelligent task delegation
 */

import { api } from './client'
import { 
  Agent, 
  Task, 
  TaskAssignment, 
  AgentPerformanceMetrics,
  CapabilityMatrix,
  OptimizationObjective,
  AssignmentRequest,
  AssignmentResponse,
  ServiceStatus,
  SystemAnalytics,
  AgentSelectionAPIResponse,
  AgentType,
  TaskPriority,
  OptimizationScores,
  AgentUtilizationMetrics
} from '@/types/agent-selection'

// Agent Selection API Client
export const agentSelectionApi = {
  // Base URL for the service
  baseURL: process.env.NEXT_PUBLIC_AGENT_SELECTION_URL || 'http://localhost:8001',

  // Health and Status
  getHealth: async (): Promise<ServiceStatus> => {
    const response = await api.get('/health', { baseURL: agentSelectionApi.baseURL })
    return response.data
  },

  getServiceInfo: async (): Promise<ServiceStatus> => {
    const response = await api.get('/', { baseURL: agentSelectionApi.baseURL })
    return {
      status: 'healthy',
      version: response.data.version,
      capabilities: response.data.capabilities,
      active_agents: 0,
      pending_assignments: 0,
      last_updated: new Date().toISOString()
    }
  },

  // Agent Management
  registerAgent: async (agent: Agent): Promise<AgentSelectionAPIResponse> => {
    const response = await api.post('/api/v1/agents/register', agent, {
      baseURL: agentSelectionApi.baseURL
    })
    return response.data
  },

  getAgentPerformance: async (agentId: string): Promise<AgentPerformanceMetrics> => {
    const response = await api.get(`/api/v1/agents/${agentId}/performance`, {
      baseURL: agentSelectionApi.baseURL
    })
    return response.data
  },

  // Task Assignment
  assignTask: async (task: Task, availableAgents: Agent[]): Promise<TaskAssignment> => {
    const response = await api.post('/api/v1/tasks/assign', task, {
      params: { available_agents: availableAgents },
      baseURL: agentSelectionApi.baseURL
    })
    return response.data
  },

  assignTaskAdvanced: async (request: AssignmentRequest): Promise<AssignmentResponse> => {
    const response = await api.post('/api/v1/tasks/assign', request.task, {
      params: { available_agents: request.available_agents },
      baseURL: agentSelectionApi.baseURL
    })
    
    // Transform response to include analysis
    const assignment = response.data
    return {
      assignment,
      alternatives: [],
      analysis: {
        total_agents_evaluated: request.available_agents.length,
        capable_agents: request.available_agents.filter(a => a.current_status === 'available').length,
        optimization_breakdown: agentSelectionApi.analyzeOptimization(assignment.optimization_scores),
        risk_assessment: agentSelectionApi.assessRisk(assignment, request.task),
        efficiency_analysis: agentSelectionApi.analyzeEfficiency(assignment, request.task)
      },
      recommendations: agentSelectionApi.generateRecommendations(assignment, request.task)
    }
  },

  // Capability Management
  getCapabilityMatrix: async (): Promise<CapabilityMatrix> => {
    const response = await api.get('/api/v1/capabilities/matrix', {
      baseURL: agentSelectionApi.baseURL
    })
    return response.data
  },

  // Optimization Configuration
  configureOptimization: async (objectives: Record<string, OptimizationObjective>): Promise<AgentSelectionAPIResponse> => {
    const response = await api.post('/api/v1/optimization/configure', objectives, {
      baseURL: agentSelectionApi.baseURL
    })
    return response.data
  },

  // Utility Functions
  analyzeOptimization: (scores: OptimizationScores) => {
    const factors = Object.entries(scores).map(([factor, score]) => ({
      factor,
      weight: agentSelectionApi.getDefaultWeight(factor),
      score,
      impact: score > 0.8 ? 'high' : score > 0.6 ? 'medium' : 'low'
    }))

    const tradeOffs = [
      {
        factor1: 'speed',
        factor2: 'quality',
        description: scores.speed > 0.8 && scores.quality < 0.7 ? 
          'High speed may compromise quality' : 
          'Good balance between speed and quality'
      },
      {
        factor1: 'cost',
        factor2: 'quality',
        description: scores.cost < 0.3 && scores.quality > 0.8 ? 
          'Excellent cost-quality ratio' : 
          'Standard cost-quality trade-off'
      }
    ]

    return {
      primary_factors: factors,
      trade_offs: tradeOffs
    }
  },

  assessRisk: (assignment: TaskAssignment, task: Task) => {
    const riskFactors = []
    let overallRisk: 'low' | 'medium' | 'high' = 'low'

    if (assignment.confidence_score < 0.7) {
      riskFactors.push({
        factor: 'Low confidence assignment',
        severity: 'medium' as const,
        mitigation: 'Consider additional agent training or human oversight'
      })
      overallRisk = 'medium'
    }

    if (task.safety_critical && assignment.optimization_scores.safety < 0.9) {
      riskFactors.push({
        factor: 'Safety-critical task with moderate safety score',
        severity: 'high' as const,
        mitigation: 'Implement additional safety protocols and monitoring'
      })
      overallRisk = 'high'
    }

    if (assignment.optimization_scores.quality < 0.6) {
      riskFactors.push({
        factor: 'Below-average quality expectation',
        severity: 'medium' as const,
        mitigation: 'Increase quality monitoring and checkpoints'
      })
      if (overallRisk === 'low') overallRisk = 'medium'
    }

    return {
      overall_risk: overallRisk,
      risk_factors: riskFactors,
      confidence_level: assignment.confidence_score
    }
  },

  analyzeEfficiency: (assignment: TaskAssignment, task: Task) => {
    const efficiencyFactors = [
      {
        factor: 'Agent capability match',
        contribution: assignment.optimization_scores.quality * 0.4,
        description: `Quality score of ${(assignment.optimization_scores.quality * 100).toFixed(1)}%`
      },
      {
        factor: 'Processing speed',
        contribution: assignment.optimization_scores.speed * 0.3,
        description: `Speed optimization score of ${(assignment.optimization_scores.speed * 100).toFixed(1)}%`
      },
      {
        factor: 'Cost effectiveness',
        contribution: (1 - assignment.optimization_scores.cost) * 0.2,
        description: `Cost efficiency score of ${((1 - assignment.optimization_scores.cost) * 100).toFixed(1)}%`
      },
      {
        factor: 'Energy efficiency',
        contribution: (1 - assignment.optimization_scores.energy) * 0.1,
        description: `Energy efficiency score of ${((1 - assignment.optimization_scores.energy) * 100).toFixed(1)}%`
      }
    ]

    const expectedEfficiency = efficiencyFactors.reduce((sum, factor) => sum + factor.contribution, 0)

    const improvementSuggestions = []
    if (assignment.optimization_scores.quality < 0.8) {
      improvementSuggestions.push('Consider agent training to improve capability match')
    }
    if (assignment.optimization_scores.speed < 0.7) {
      improvementSuggestions.push('Optimize workflow or consider faster agent alternatives')
    }
    if (assignment.optimization_scores.cost > 0.7) {
      improvementSuggestions.push('Evaluate cost-effective alternatives or process improvements')
    }

    return {
      expected_efficiency: expectedEfficiency,
      efficiency_factors: efficiencyFactors,
      improvement_suggestions: improvementSuggestions
    }
  },

  generateRecommendations: (assignment: TaskAssignment, task: Task): string[] => {
    const recommendations = []

    if (assignment.confidence_score > 0.9) {
      recommendations.push('Excellent assignment match - proceed with confidence')
    } else if (assignment.confidence_score > 0.7) {
      recommendations.push('Good assignment match - monitor progress closely')
    } else {
      recommendations.push('Moderate assignment match - consider alternatives or additional oversight')
    }

    if (task.safety_critical) {
      recommendations.push('Implement safety monitoring protocols for this critical task')
    }

    if (assignment.optimization_scores.speed > 0.8) {
      recommendations.push('Fast completion expected - ensure quality checkpoints are in place')
    }

    if (assignment.optimization_scores.cost < 0.3) {
      recommendations.push('Cost-effective assignment - good resource utilization')
    }

    return recommendations
  },

  getDefaultWeight: (factor: string): number => {
    const defaultWeights: Record<string, number> = {
      speed: 0.25,
      quality: 0.30,
      cost: 0.20,
      safety: 0.15,
      energy: 0.10
    }
    return defaultWeights[factor] || 0.1
  },

  // Mock Data Generators for Development
  generateMockAgents: (count: number = 10): Agent[] => {
    const agentTypes = Object.values(AgentType)
    const capabilities = [
      'precision_assembly', 'heavy_lifting', 'quality_inspection', 'welding',
      'creative_problem_solving', 'customer_interaction', 'data_analysis',
      'pattern_recognition', 'complex_assembly', 'adaptive_manufacturing'
    ]

    return Array.from({ length: count }, (_, i) => ({
      agent_id: `agent_${i + 1}`,
      agent_type: agentTypes[i % agentTypes.length],
      name: `Agent ${i + 1}`,
      capabilities: capabilities.slice(0, 3 + (i % 4)).reduce((acc, cap) => {
        acc[cap] = {
          capability_type: cap,
          proficiency_level: 0.6 + Math.random() * 0.4,
          confidence: 0.7 + Math.random() * 0.3,
          last_assessed: new Date().toISOString()
        }
        return acc
      }, {} as Record<string, any>),
      current_status: i % 4 === 0 ? 'busy' : 'available',
      location: `Location ${Math.floor(i / 3) + 1}`,
      cost_per_hour: 25 + Math.random() * 75,
      energy_consumption: 1 + Math.random() * 8,
      safety_rating: 0.8 + Math.random() * 0.2,
      current_workload: Math.random() * 0.8
    }))
  },

  generateMockTask: (taskId?: string): Task => {
    const priorities = Object.values(TaskPriority)
    const taskTypes = ['assembly', 'inspection', 'analysis', 'maintenance', 'optimization']
    const requirements = [
      'precision_assembly', 'quality_inspection', 'data_analysis', 'problem_solving'
    ]

    return {
      task_id: taskId || `task_${Date.now()}`,
      task_type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      requirements: requirements.slice(0, 2 + Math.floor(Math.random() * 3)).map(req => ({
        requirement_type: req,
        minimum_proficiency: 0.5 + Math.random() * 0.4,
        weight: 0.2 + Math.random() * 0.6
      })),
      estimated_duration: 30 + Math.floor(Math.random() * 240), // 30-270 minutes
      deadline: new Date(Date.now() + (1 + Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      complexity_score: Math.random(),
      safety_critical: Math.random() > 0.8,
      location: `Location ${Math.floor(Math.random() * 5) + 1}`
    }
  },

  generateMockSystemAnalytics: (): SystemAnalytics => {
    const mockAgents = agentSelectionApi.generateMockAgents(15)
    
    return {
      total_agents: mockAgents.length,
      active_agents: mockAgents.filter(a => a.current_status === 'available').length,
      total_assignments_today: 45 + Math.floor(Math.random() * 20),
      average_assignment_time: 2.5 + Math.random() * 2,
      system_efficiency: 0.85 + Math.random() * 0.1,
      cost_savings: 15000 + Math.random() * 10000,
      quality_metrics: {
        average_quality: 0.88 + Math.random() * 0.1,
        quality_consistency: 0.92 + Math.random() * 0.05,
        improvement_rate: 0.05 + Math.random() * 0.1
      },
      utilization_metrics: mockAgents.map(agent => ({
        agent_id: agent.agent_id,
        agent_type: agent.agent_type,
        utilization_percentage: agent.current_workload * 100,
        tasks_completed_today: Math.floor(Math.random() * 10),
        average_task_duration: 45 + Math.random() * 60,
        efficiency_score: 0.7 + Math.random() * 0.3,
        quality_score: 0.8 + Math.random() * 0.2,
        cost_effectiveness: 0.75 + Math.random() * 0.25,
        status: agent.current_status
      }))
    }
  },

  // Formatting Utilities
  formatAgentType: (type: AgentType): string => {
    const labels = {
      [AgentType.ROBOT]: 'Robot',
      [AgentType.HUMAN]: 'Human',
      [AgentType.AI_SYSTEM]: 'AI System',
      [AgentType.HYBRID]: 'Hybrid'
    }
    return labels[type] || type
  },

  formatTaskPriority: (priority: TaskPriority): string => {
    const labels = {
      [TaskPriority.SAFETY_CRITICAL]: 'Safety Critical',
      [TaskPriority.QUALITY_CRITICAL]: 'Quality Critical',
      [TaskPriority.EFFICIENCY_CRITICAL]: 'Efficiency Critical',
      [TaskPriority.STANDARD]: 'Standard'
    }
    return labels[priority] || priority
  },

  getAgentTypeColor: (type: AgentType): string => {
    const colors = {
      [AgentType.ROBOT]: '#3B82F6',      // Blue
      [AgentType.HUMAN]: '#10B981',      // Green
      [AgentType.AI_SYSTEM]: '#8B5CF6',  // Purple
      [AgentType.HYBRID]: '#F59E0B'      // Orange
    }
    return colors[type] || '#6B7280'
  },

  getPriorityColor: (priority: TaskPriority): string => {
    const colors = {
      [TaskPriority.SAFETY_CRITICAL]: '#EF4444',    // Red
      [TaskPriority.QUALITY_CRITICAL]: '#F59E0B',   // Orange
      [TaskPriority.EFFICIENCY_CRITICAL]: '#3B82F6', // Blue
      [TaskPriority.STANDARD]: '#6B7280'            // Gray
    }
    return colors[priority] || '#6B7280'
  }
}
