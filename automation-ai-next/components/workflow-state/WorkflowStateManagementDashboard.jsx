'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChartBarIcon,
  UsersIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  BoltIcon,
  CloudIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import { useWorkflowState } from '@/lib/hooks/useWorkflowState'

export function WorkflowStateManagementDashboard() {
  const {
    workflows,
    systemPerformance,
    activeConflicts,
    cacheStats,
    loading,
    error,
    loadWorkflows,
    loadSystemPerformance,
    createWorkflow,
    updateWorkflowState,
    createCheckpoint,
    setupCoordination,
    loadActiveConflicts
  } = useWorkflowState()

  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [selectedView, setSelectedView] = useState('overview')
  const [realTimeData, setRealTimeData] = useState(null)

  useEffect(() => {
    loadWorkflows()
    loadSystemPerformance()
    loadActiveConflicts()
    
    // Setup WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:8003/ws/workflows')
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setRealTimeData(data)
      } catch (err) {
        console.error('WebSocket data parsing error:', err)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    return () => {
      ws.close()
    }
  }, [])

  const getWorkflowStateColor = (state) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'paused': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    return colors[state] || colors['pending']
  }

  const getWorkflowStateIcon = (state) => {
    switch (state) {
      case 'active':
        return <PlayIcon className="w-4 h-4" />
      case 'paused':
        return <PauseIcon className="w-4 h-4" />
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'cancelled':
        return <StopIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const handleCreateTestWorkflow = async () => {
    const testWorkflow = {
      template_id: 'precision_assembly',
      parameters: {
        product_type: 'test_component',
        quality_level: 'high',
        batch_size: 10
      },
      priority: 7
    }
    
    await createWorkflow(testWorkflow)
    await loadWorkflows()
  }

  const handleWorkflowAction = async (workflowId, action) => {
    const stateMap = {
      'play': 'active',
      'pause': 'paused',
      'stop': 'cancelled'
    }
    
    if (stateMap[action]) {
      await updateWorkflowState(workflowId, { state: stateMap[action] })
      await loadWorkflows()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workflow State Management System
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Distributed state machine with hierarchical coordination and fault-tolerant execution
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline" size="sm" className="flex items-center space-x-1">
              <CogIcon className="w-3 h-3" />
              <span>Hierarchical States</span>
            </Badge>
            <Badge variant="outline" size="sm" className="flex items-center space-x-1">
              <UsersIcon className="w-3 h-3" />
              <span>Multi-Agent Coordination</span>
            </Badge>
            <Badge variant="outline" size="sm" className="flex items-center space-x-1">
              <ShieldCheckIcon className="w-3 h-3" />
              <span>Fault Tolerant</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              loadWorkflows()
              loadSystemPerformance()
              loadActiveConflicts()
            }}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            onClick={handleCreateTestWorkflow}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <PlayIcon className="w-4 h-4" />
            <span>Create Test Workflow</span>
          </Button>
        </div>
      </div>

      {/* View Navigation */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: ChartBarIcon },
          { id: 'workflows', label: 'Active Workflows', icon: CogIcon },
          { id: 'coordination', label: 'Multi-Agent Coordination', icon: UsersIcon },
          { id: 'conflicts', label: 'Conflict Resolution', icon: ExclamationTriangleIcon },
          { id: 'performance', label: 'Performance', icon: BoltIcon },
          { id: 'recovery', label: 'Recovery & Checkpoints', icon: ShieldCheckIcon }
        ].map((view) => {
          const IconComponent = view.icon
          return (
            <Button
              key={view.id}
              variant={selectedView === view.id ? 'default' : 'outline'}
              onClick={() => setSelectedView(view.id)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <IconComponent className="w-4 h-4" />
              <span>{view.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Overview Section */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <CogIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Workflows
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemPerformance?.active_workflows || 0}
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
                      Total Workflows
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemPerformance?.total_workflows || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Conflicts
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemPerformance?.active_conflicts || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Coordinations
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemPerformance?.active_coordinations || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <CircleStackIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Cache Hit Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cacheStats ? `${((cacheStats.memory_cache_size / Math.max(cacheStats.memory_cache_capacity, 1)) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Components Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Architecture Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Hierarchical State Machine</span>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Multi-level state management</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Dependency Manager</span>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Cycle detection & resolution</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Multi-Agent Coordinator</span>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Synchronized execution</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Conflict Resolver</span>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Automatic conflict resolution</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Recovery Manager</span>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Checkpoint-based recovery</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">State Cache</span>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Multi-tier optimization</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Consistency Manager</span>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Edge-cloud synchronization</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Event Sourcing</span>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Complete audit trails</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Workflows Section */}
      {selectedView === 'workflows' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.workflow_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedWorkflow?.workflow_id === workflow.workflow_id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getWorkflowStateIcon(workflow.current_state)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {workflow.workflow_id}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Template: {workflow.definition_id || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getWorkflowStateColor(workflow.current_state)} size="sm">
                          {workflow.current_state?.toUpperCase()}
                        </Badge>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleWorkflowAction(workflow.workflow_id, 'play')
                            }}
                            disabled={workflow.current_state === 'active'}
                          >
                            <PlayIcon className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleWorkflowAction(workflow.workflow_id, 'pause')
                            }}
                            disabled={workflow.current_state !== 'active'}
                          >
                            <PauseIcon className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              createCheckpoint(workflow.workflow_id)
                            }}
                          >
                            <ShieldCheckIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {new Date(workflow.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Steps:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {workflow.current_step || 0} / {workflow.total_steps || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Agents:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {Object.keys(workflow.assigned_agents || {}).length}
                        </span>
                      </div>
                    </div>

                    {workflow.current_step && workflow.total_steps && (
                      <div className="mt-3">
                        <Progress 
                          value={(workflow.current_step / workflow.total_steps) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {workflows.length === 0 && (
                  <div className="text-center py-8">
                    <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No active workflows
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Data Display */}
      {realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle>Real-time System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Active Workflows:</span>
                <span className="ml-2 font-medium">{realTimeData.active_workflows}</span>
              </div>
              <div>
                <span className="text-gray-500">Active Conflicts:</span>
                <span className="ml-2 font-medium">{realTimeData.active_conflicts}</span>
              </div>
              <div>
                <span className="text-gray-500">Coordinations:</span>
                <span className="ml-2 font-medium">{realTimeData.active_coordinations}</span>
              </div>
              <div>
                <span className="text-gray-500">Cache Size:</span>
                <span className="ml-2 font-medium">{realTimeData.cache_stats?.memory_cache_size || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
