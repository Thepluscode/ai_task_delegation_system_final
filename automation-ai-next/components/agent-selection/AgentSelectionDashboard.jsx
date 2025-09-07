'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  CpuChipIcon,
  UserIcon,
  RobotIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BeakerIcon,
  BrainIcon,
  ComputerDesktopIcon,
  CogIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { 
  useAgentSelectionService,
  useAgentManagement,
  useTaskAssignment,
  useAgentSelectionAnalytics
} from '@/lib/hooks/useAgentSelection'
import { agentSelectionApi } from '@/lib/api/agentSelection'
import { AgentType, TaskPriority } from '@/types/agent-selection'
import toast from 'react-hot-toast'

export function AgentSelectionDashboard() {
  const { serviceStatus, loading: serviceLoading, checkServiceHealth, isOnline } = useAgentSelectionService()
  const { 
    agents, 
    generateMockAgents, 
    getAvailableAgents, 
    getAgentsByType,
    totalAgents,
    availableAgents 
  } = useAgentManagement()
  const { 
    assignments, 
    assignTask, 
    generateMockTask, 
    getRecentAssignments,
    loading: assignmentLoading 
  } = useTaskAssignment()
  const { 
    analytics, 
    loading: analyticsLoading, 
    getEfficiencyTrend,
    getTopPerformingAgents,
    getAgentTypeDistribution 
  } = useAgentSelectionAnalytics()

  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    // Generate mock data for demonstration
    if (agents.length === 0) {
      generateMockAgents(12)
    }
  }, [agents.length, generateMockAgents])

  const handleQuickAssignment = async () => {
    const availableAgentsList = getAvailableAgents()
    if (availableAgentsList.length === 0) {
      toast.error('No available agents for assignment')
      return
    }

    const mockTask = generateMockTask()
    await assignTask(mockTask, availableAgentsList)
  }

  const getServiceStatusIcon = () => {
    if (serviceLoading) return <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-500" />
    if (isOnline) return <CheckCircleIcon className="w-5 h-5 text-success-500" />
    return <ExclamationTriangleIcon className="w-5 h-5 text-error-500" />
  }

  const getAgentTypeIcon = (type) => {
    switch (type) {
      case AgentType.ROBOT:
        return <RobotIcon className="w-5 h-5" />
      case AgentType.HUMAN:
        return <UserIcon className="w-5 h-5" />
      case AgentType.AI_SYSTEM:
        return <CpuChipIcon className="w-5 h-5" />
      case AgentType.HYBRID:
        return <BeakerIcon className="w-5 h-5" />
      default:
        return <CpuChipIcon className="w-5 h-5" />
    }
  }

  const agentTypeDistribution = getAgentTypeDistribution()
  const recentAssignments = getRecentAssignments(5)
  const topPerformers = getTopPerformingAgents(3)
  const efficiencyTrend = getEfficiencyTrend()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Decision Engine - Agent Selection
          </h2>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Advanced multi-layer intelligence system for optimal task allocation
            </p>
            <div className="flex items-center space-x-2">
              {getServiceStatusIcon()}
              <Badge variant={isOnline ? 'success' : 'error'} size="sm">
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={checkServiceHealth}
            disabled={serviceLoading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          
          <Button
            onClick={handleQuickAssignment}
            disabled={assignmentLoading || availableAgents === 0}
            loading={assignmentLoading}
            className="flex items-center space-x-2"
          >
            <BoltIcon className="w-4 h-4" />
            <span>Quick Assignment</span>
          </Button>
        </div>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getServiceStatusIcon()}
                  <span className="font-medium text-gray-900 dark:text-white">
                    Agent Selection Service
                  </span>
                </div>
                <Badge variant="outline" size="sm">
                  v{serviceStatus.version}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Capabilities: {serviceStatus.capabilities.length}</span>
                <span>Active Agents: {totalAgents}</span>
                <span>Available: {availableAgents}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Agents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalAgents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Available
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {availableAgents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <BoltIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Assignments Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.total_assignments_today || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  System Efficiency
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics ? `${(analytics.system_efficiency * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(agentTypeDistribution).map(([type, count]) => (
              <div key={type} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div style={{ color: agentSelectionApi.getAgentTypeColor(type) }}>
                    {getAgentTypeIcon(type)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {agentSelectionApi.formatAgentType(type)}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count}
                </p>
                <p className="text-xs text-gray-500">
                  {totalAgents > 0 ? `${((count / totalAgents) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Intelligence Layers */}
      <Card>
        <CardHeader>
          <CardTitle>AI Intelligence Layers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Layer 1: Capability Matching */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800/50">
                  <BrainIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                    Layer 1: Capability Matching
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Dynamic Assessment
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Real-time Factors:</span>
                  <span className="text-blue-800 dark:text-blue-300">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Fatigue Tracking:</span>
                  <span className="text-blue-800 dark:text-blue-300">✓ Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Performance History:</span>
                  <span className="text-blue-800 dark:text-blue-300">✓ Learning</span>
                </div>
              </div>
            </div>

            {/* Layer 2: Multi-Objective Optimization */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800/50">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-300">
                    Layer 2: Multi-Objective Optimization
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    5-Dimensional Balancing
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Speed:</span>
                  <span className="text-green-800 dark:text-green-300">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Quality:</span>
                  <span className="text-green-800 dark:text-green-300">30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Cost:</span>
                  <span className="text-green-800 dark:text-green-300">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Safety:</span>
                  <span className="text-green-800 dark:text-green-300">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Energy:</span>
                  <span className="text-green-800 dark:text-green-300">10%</span>
                </div>
              </div>
            </div>

            {/* Layer 3: Reinforcement Learning */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-800/50">
                  <CogIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-300">
                    Layer 3: Reinforcement Learning
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    Q-Learning & Bandit
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-600">Learning Rate:</span>
                  <span className="text-purple-800 dark:text-purple-300">0.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">Exploration:</span>
                  <span className="text-purple-800 dark:text-purple-300">10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">Q-Table Size:</span>
                  <span className="text-purple-800 dark:text-purple-300">{analytics?.q_table_size || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Assignment Time:</span>
                  <span className="font-medium">{analytics.average_assignment_time.toFixed(1)}s</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quality Average:</span>
                  <span className="font-medium">{(analytics.quality_metrics.average_quality * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quality Consistency:</span>
                  <span className="font-medium">{(analytics.quality_metrics.quality_consistency * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost Savings:</span>
                  <span className="font-medium text-green-600">${analytics.cost_savings.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency Trend:</span>
                  <Badge 
                    variant={
                      efficiencyTrend === 'excellent' ? 'success' :
                      efficiencyTrend === 'good' ? 'primary' :
                      efficiencyTrend === 'fair' ? 'warning' : 'error'
                    } 
                    size="sm"
                  >
                    {efficiencyTrend.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((agent, index) => (
                  <div key={agent.agent_id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20">
                      <span className="text-sm font-bold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div style={{ color: agentSelectionApi.getAgentTypeColor(agent.agent_type) }}>
                        {getAgentTypeIcon(agent.agent_type)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {agent.agent_id}
                      </span>
                    </div>
                    
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {(agent.efficiency_score * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {agent.tasks_completed_today} tasks today
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Assignments</CardTitle>
            <Badge variant="outline" size="sm">
              {assignments.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {recentAssignments.length === 0 ? (
            <div className="text-center py-8">
              <BoltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No assignments yet. Click "Quick Assignment" to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <div key={assignment.task_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {assignment.task_id}
                      </span>
                      <Badge variant="outline" size="sm">
                        {assignment.assigned_agent_id}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={assignment.confidence_score > 0.8 ? 'success' : assignment.confidence_score > 0.6 ? 'warning' : 'error'} 
                        size="sm"
                      >
                        {(assignment.confidence_score * 100).toFixed(1)}% confidence
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(assignment.assignment_timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Speed</p>
                      <p className="text-sm font-medium">{(assignment.optimization_scores.speed * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Quality</p>
                      <p className="text-sm font-medium">{(assignment.optimization_scores.quality * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Cost</p>
                      <p className="text-sm font-medium">{(assignment.optimization_scores.cost * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Safety</p>
                      <p className="text-sm font-medium">{(assignment.optimization_scores.safety * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Energy</p>
                      <p className="text-sm font-medium">{(assignment.optimization_scores.energy * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    {assignment.reasoning}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
