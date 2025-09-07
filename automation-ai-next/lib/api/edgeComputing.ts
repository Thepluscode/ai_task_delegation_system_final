/**
 * Edge Computing Service API Client
 * Sub-10ms real-time decision engine with autonomous operation
 */

import { api } from './client'
import {
  EdgeTask,
  EdgeDecision,
  LocalAgent,
  EdgePerformanceData,
  CacheStats,
  EdgeServiceInfo,
  EdgeHealthCheck,
  EdgeAnalytics,
  EdgeMonitoringData,
  VisionFrame,
  VisionProcessingResult,
  VisionProcessingType,
  TaskPriority,
  EdgeDecisionType,
  AgentStatus,
  RESPONSE_TARGETS,
  PRIORITY_COLORS,
  DECISION_TYPE_COLORS
} from '@/types/edge-computing'

// Edge Computing API Client
export const edgeComputingApi = {
  // Base URL for the service
  baseURL: process.env.NEXT_PUBLIC_EDGE_COMPUTING_URL || 'http://localhost:8008',

  // Service Health and Info
  getServiceInfo: async (): Promise<EdgeServiceInfo> => {
    const response = await api.get('/', { baseURL: edgeComputingApi.baseURL })
    return response.data
  },

  getHealth: async (): Promise<EdgeHealthCheck> => {
    const response = await api.get('/health', { baseURL: edgeComputingApi.baseURL })
    return response.data
  },

  // Task Routing
  routeTask: async (task: EdgeTask): Promise<EdgeDecision> => {
    const response = await api.post('/api/v1/tasks/route', task, {
      baseURL: edgeComputingApi.baseURL
    })
    return response.data
  },

  // Agent Management
  listAgents: async (): Promise<{ agents: LocalAgent[]; total_count: number; available_count: number }> => {
    const response = await api.get('/api/v1/agents', {
      baseURL: edgeComputingApi.baseURL
    })
    return response.data
  },

  registerAgent: async (agent: LocalAgent): Promise<{ success: boolean; message: string; agent_id: string }> => {
    const response = await api.post('/api/v1/agents/register', agent, {
      baseURL: edgeComputingApi.baseURL
    })
    return response.data
  },

  updateAgentLoad: async (agentId: string, load: number): Promise<{ success: boolean; message: string; new_load: number }> => {
    const response = await api.put(`/api/v1/agents/${agentId}/load`, { load }, {
      baseURL: edgeComputingApi.baseURL
    })
    return response.data
  },

  // Performance Monitoring
  getPerformanceStats: async (): Promise<EdgePerformanceData> => {
    const response = await api.get('/api/v1/performance', {
      baseURL: edgeComputingApi.baseURL
    })
    return response.data
  },

  // Cache Management
  getCacheStats: async (): Promise<CacheStats> => {
    const response = await api.get('/api/v1/cache/stats', {
      baseURL: edgeComputingApi.baseURL
    })
    return response.data
  },

  clearCache: async (): Promise<{ success: boolean; message: string; cache_size: number }> => {
    const response = await api.post('/api/v1/cache/clear', {}, {
      baseURL: edgeComputingApi.baseURL
    })
    return response.data
  },

  // Computer Vision Processing
  processVisionFrame: async (frameData: ArrayBuffer | Uint8Array, processingType: VisionProcessingType): Promise<VisionProcessingResult> => {
    const formData = new FormData()
    const blob = new Blob([frameData], { type: 'application/octet-stream' })
    formData.append('frame_data', blob)
    formData.append('processing_type', processingType)

    const response = await api.post('/api/v1/edge/vision/process', formData, {
      baseURL: edgeComputingApi.baseURL,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data.vision_result
  },

  getResponseTargets: async (): Promise<{ targets: Record<string, string>; description: string }> => {
    const response = await api.get('/api/v1/edge/targets', {
      baseURL: edgeComputingApi.baseURL
    })
    return response.data
  },

  // WebSocket Connection for Real-time Updates
  subscribeToRealTimeUpdates: (callback: (data: EdgeMonitoringData) => void) => {
    if (typeof window === 'undefined') return null

    const wsUrl = `${edgeComputingApi.baseURL.replace('http', 'ws')}/ws/edge/realtime`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('Edge Computing WebSocket connected')
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
      console.error('Edge Computing WebSocket error:', error)
    }
    
    ws.onclose = () => {
      console.log('Edge Computing WebSocket disconnected')
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        edgeComputingApi.subscribeToRealTimeUpdates(callback)
      }, 5000)
    }
    
    return ws
  },

  // Utility Functions
  createEdgeTask: (
    taskType: string,
    priority: TaskPriority,
    parameters: Record<string, any> = {},
    timeoutMs: number = RESPONSE_TARGETS[priority]
  ): EdgeTask => {
    return {
      task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      priority,
      task_type: taskType,
      parameters,
      timeout_ms: timeoutMs,
      require_response: true
    }
  },

  createLocalAgent: (
    agentId: string,
    agentType: string,
    capabilities: Record<string, number>,
    location: string = 'edge_node_1'
  ): LocalAgent => {
    return {
      agent_id: agentId,
      agent_type: agentType,
      capabilities,
      current_load: 0.0,
      status: AgentStatus.AVAILABLE,
      location
    }
  },

  // Mock Data Generators for Development
  generateMockAgents: (count: number = 5): LocalAgent[] => {
    const agentTypes = ['ai_system', 'specialist', 'general', 'safety_monitor']
    const taskTypes = ['banking_transaction', 'fraud_detection', 'robot_control', 'data_processing', 'monitoring']
    const locations = ['edge_node_1', 'edge_node_2', 'edge_node_3']
    
    return Array.from({ length: count }, (_, i) => ({
      agent_id: `edge_agent_${String(i + 1).padStart(3, '0')}`,
      agent_type: agentTypes[i % agentTypes.length],
      capabilities: Object.fromEntries(
        taskTypes.map(taskType => [
          taskType,
          Math.random() * 0.4 + 0.6  // 0.6 to 1.0
        ])
      ),
      current_load: Math.random() * 0.8,  // 0.0 to 0.8
      status: Math.random() > 0.1 ? AgentStatus.AVAILABLE : AgentStatus.BUSY,
      location: locations[i % locations.length]
    }))
  },

  generateMockPerformanceData: (): EdgePerformanceData => {
    const priorities = Object.values(TaskPriority)
    const performanceByPriority = Object.fromEntries(
      priorities.map(priority => [
        priority,
        {
          avg_response_time: RESPONSE_TARGETS[priority] * (0.3 + Math.random() * 0.4), // 30-70% of target
          max_response_time: RESPONSE_TARGETS[priority] * (0.8 + Math.random() * 0.4), // 80-120% of target
          min_response_time: RESPONSE_TARGETS[priority] * (0.1 + Math.random() * 0.2), // 10-30% of target
          target_met_percentage: 85 + Math.random() * 15, // 85-100%
          total_requests: Math.floor(Math.random() * 1000) + 100
        }
      ])
    )

    return {
      performance_by_priority: performanceByPriority,
      overall: {
        cache_size: Math.floor(Math.random() * 5000) + 1000,
        cloud_available: Math.random() > 0.2, // 80% chance cloud is available
        total_agents: 5 + Math.floor(Math.random() * 10),
        available_agents: 3 + Math.floor(Math.random() * 8)
      },
      timestamp: new Date().toISOString()
    }
  },

  generateMockAnalytics: (): EdgeAnalytics => {
    return {
      total_decisions: 15420,
      cache_hit_rate: 92.5 + Math.random() * 7.5, // 92.5-100%
      average_response_time: 3.2 + Math.random() * 2.8, // 3.2-6.0ms
      target_compliance_rate: 94.2 + Math.random() * 5.8, // 94.2-100%
      agent_utilization: [
        {
          agent_id: 'edge_agent_001',
          agent_type: 'ai_system',
          average_load: 0.65,
          peak_load: 0.89,
          tasks_processed: 2340,
          success_rate: 98.7,
          specializations: ['banking_transaction', 'fraud_detection']
        },
        {
          agent_id: 'edge_agent_002',
          agent_type: 'specialist',
          average_load: 0.42,
          peak_load: 0.78,
          tasks_processed: 1890,
          success_rate: 99.2,
          specializations: ['robot_control', 'safety_monitoring']
        }
      ],
      decision_type_distribution: [
        {
          decision_type: EdgeDecisionType.CACHED,
          count: 8950,
          percentage: 58.1,
          avg_response_time: 0.8,
          success_rate: 99.5
        },
        {
          decision_type: EdgeDecisionType.LIGHTWEIGHT_MODEL,
          count: 4230,
          percentage: 27.4,
          avg_response_time: 4.2,
          success_rate: 97.8
        },
        {
          decision_type: EdgeDecisionType.RULE_BASED,
          count: 1890,
          percentage: 12.3,
          avg_response_time: 1.5,
          success_rate: 98.9
        },
        {
          decision_type: EdgeDecisionType.CLOUD_FALLBACK,
          count: 350,
          percentage: 2.2,
          avg_response_time: 45.2,
          success_rate: 96.1
        }
      ],
      performance_trends: [
        {
          metric: 'response_time',
          time_period: '24h',
          values: [4.2, 3.8, 3.5, 3.2, 3.1, 2.9, 3.0, 3.2],
          timestamps: Array.from({ length: 8 }, (_, i) => 
            new Date(Date.now() - (7 - i) * 3 * 60 * 60 * 1000).toISOString()
          ),
          trend_direction: 'improving'
        }
      ]
    }
  },

  // Formatting Utilities
  formatPriority: (priority: TaskPriority): string => {
    const labels = {
      [TaskPriority.SAFETY_CRITICAL]: 'Safety Critical',
      [TaskPriority.QUALITY_CRITICAL]: 'Quality Critical',
      [TaskPriority.EFFICIENCY_CRITICAL]: 'Efficiency Critical',
      [TaskPriority.STANDARD]: 'Standard'
    }
    return labels[priority] || priority
  },

  formatDecisionType: (decisionType: EdgeDecisionType): string => {
    const labels = {
      [EdgeDecisionType.CACHED]: 'Cached',
      [EdgeDecisionType.LIGHTWEIGHT_MODEL]: 'ML Model',
      [EdgeDecisionType.RULE_BASED]: 'Rule-Based',
      [EdgeDecisionType.CLOUD_FALLBACK]: 'Cloud Fallback'
    }
    return labels[decisionType] || decisionType
  },

  formatAgentStatus: (status: AgentStatus): string => {
    const labels = {
      [AgentStatus.AVAILABLE]: 'Available',
      [AgentStatus.BUSY]: 'Busy',
      [AgentStatus.OFFLINE]: 'Offline',
      [AgentStatus.MAINTENANCE]: 'Maintenance'
    }
    return labels[status] || status
  },

  getPriorityColor: (priority: TaskPriority): string => {
    return PRIORITY_COLORS[priority] || '#6B7280'
  },

  getDecisionTypeColor: (decisionType: EdgeDecisionType): string => {
    return DECISION_TYPE_COLORS[decisionType] || '#6B7280'
  },

  getAgentStatusColor: (status: AgentStatus): string => {
    const colors = {
      [AgentStatus.AVAILABLE]: '#10B981',   // Green
      [AgentStatus.BUSY]: '#F59E0B',        // Orange
      [AgentStatus.OFFLINE]: '#6B7280',     // Gray
      [AgentStatus.MAINTENANCE]: '#8B5CF6'  // Purple
    }
    return colors[status] || '#6B7280'
  },

  formatResponseTime: (timeMs: number): string => {
    if (timeMs < 1) {
      return `${(timeMs * 1000).toFixed(0)}μs`
    } else if (timeMs < 1000) {
      return `${timeMs.toFixed(1)}ms`
    } else {
      return `${(timeMs / 1000).toFixed(2)}s`
    }
  },

  formatLoadPercentage: (load: number): string => {
    return `${(load * 100).toFixed(1)}%`
  },

  calculateTargetCompliance: (actualTime: number, priority: TaskPriority): boolean => {
    return actualTime <= RESPONSE_TARGETS[priority]
  },

  getPerformanceRating: (complianceRate: number): string => {
    if (complianceRate >= 95) return 'Excellent'
    if (complianceRate >= 90) return 'Good'
    if (complianceRate >= 80) return 'Fair'
    return 'Poor'
  },

  estimateTaskComplexity: (parameters: Record<string, any>): number => {
    // Simple complexity estimation based on parameter count and types
    let complexity = Object.keys(parameters).length * 0.1

    for (const value of Object.values(parameters)) {
      if (typeof value === 'object' && value !== null) {
        complexity += 0.3
      } else if (Array.isArray(value)) {
        complexity += value.length * 0.05
      } else {
        complexity += 0.1
      }
    }

    return Math.min(complexity, 1.0)
  },

  // Computer Vision Utilities
  formatVisionProcessingType: (processingType: VisionProcessingType): string => {
    const labels = {
      [VisionProcessingType.QUALITY_INSPECTION]: 'Quality Inspection',
      [VisionProcessingType.SAFETY_MONITORING]: 'Safety Monitoring',
      [VisionProcessingType.OBJECT_DETECTION]: 'Object Detection',
      [VisionProcessingType.DEFECT_DETECTION]: 'Defect Detection',
      [VisionProcessingType.MOTION_TRACKING]: 'Motion Tracking'
    }
    return labels[processingType] || processingType
  },

  getVisionProcessingColor: (processingType: VisionProcessingType): string => {
    const colors = {
      [VisionProcessingType.QUALITY_INSPECTION]: '#10B981',   // Green
      [VisionProcessingType.SAFETY_MONITORING]: '#EF4444',    // Red
      [VisionProcessingType.OBJECT_DETECTION]: '#3B82F6',     // Blue
      [VisionProcessingType.DEFECT_DETECTION]: '#F59E0B',     // Orange
      [VisionProcessingType.MOTION_TRACKING]: '#8B5CF6'       // Purple
    }
    return colors[processingType] || '#6B7280'
  },

  createVisionFrame: (
    frameData: ArrayBuffer | Uint8Array,
    processingType: VisionProcessingType,
    metadata?: Record<string, any>
  ): VisionFrame => {
    return {
      frame_id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: frameData,
      timestamp: new Date().toISOString(),
      processing_type: processingType,
      metadata
    }
  },

  generateMockVisionResult: (processingType: VisionProcessingType): VisionProcessingResult => {
    const baseResult = {
      processing_time_ms: Math.random() * 8 + 2, // 2-10ms
      timestamp: new Date().toISOString()
    }

    switch (processingType) {
      case VisionProcessingType.QUALITY_INSPECTION:
        return {
          ...baseResult,
          result: {
            defect_detected: Math.random() < 0.1, // 10% chance of defect
            quality_score: 0.85 + Math.random() * 0.15, // 85-100%
            confidence: 0.9 + Math.random() * 0.1 // 90-100%
          }
        }

      case VisionProcessingType.SAFETY_MONITORING:
        return {
          ...baseResult,
          result: {
            safety_violation: Math.random() < 0.05, // 5% chance of violation
            risk_level: Math.random() < 0.8 ? 'low' : Math.random() < 0.9 ? 'medium' : 'high',
            confidence: 0.95 + Math.random() * 0.05 // 95-100%
          }
        }

      case VisionProcessingType.OBJECT_DETECTION:
        return {
          ...baseResult,
          result: {
            objects_detected: [
              {
                type: 'person',
                confidence: 0.85 + Math.random() * 0.15,
                bbox: [100, 100, 200, 300]
              },
              {
                type: 'machine',
                confidence: 0.9 + Math.random() * 0.1,
                bbox: [300, 150, 500, 400]
              }
            ]
          }
        }

      default:
        return {
          ...baseResult,
          result: {
            analysis_type: processingType,
            confidence: 0.8 + Math.random() * 0.2
          }
        }
    }
  }
}
}
