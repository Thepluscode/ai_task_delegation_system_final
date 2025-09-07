'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import {
  useWorkflowStateService,
  useWorkflowManagement,
  useWorkflow,
  useWorkflowAnalytics
} from '@/lib/hooks/useWorkflowState'
import { workflowStateApi } from '@/lib/api/workflowState'
import { WorkflowState, WorkflowSubState, StepStatus, StepType } from '@/types/workflow-state'
import { WorkflowCreation } from './WorkflowCreation'
import toast from 'react-hot-toast'

export function WorkflowDashboard() {
  const { serviceStatus, loading: serviceLoading, checkServiceHealth, isOnline } = useWorkflowStateService()
  const { 
    workflows, 
    generateMockWorkflows, 
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    getWorkflowsByState,
    totalWorkflows,
    activeWorkflows 
  } = useWorkflowManagement()
  const { 
    analytics, 
    getSuccessRate,
    getAverageCompletionTime,
    getTopFailureReasons,
    getAgentUtilization 
  } = useWorkflowAnalytics()

  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showWorkflowCreation, setShowWorkflowCreation] = useState(false)

  useEffect(() => {
    // Generate mock data for demonstration
    if (workflows.length === 0) {
      generateMockWorkflows(10)
    }
  }, [workflows.length, generateMockWorkflows])

  const handleWorkflowAction = async (workflowId, action) => {
    switch (action) {
      case 'start':
        await startWorkflow(workflowId)
        break
      case 'pause':
        await pauseWorkflow(workflowId)
        break
      case 'resume':
        await resumeWorkflow(workflowId)
        break
      case 'cancel':
        await cancelWorkflow(workflowId)
        break
    }
  }

  const getServiceStatusIcon = () => {
    if (serviceLoading) return <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-500" />
    if (isOnline) return <CheckCircleIcon className="w-5 h-5 text-success-500" />
    return <ExclamationTriangleIcon className="w-5 h-5 text-error-500" />
  }

  const getWorkflowStateIcon = (state) => {
    switch (state) {
      case WorkflowState.PENDING:
        return <ClockIcon className="w-4 h-4" />
      case WorkflowState.ACTIVE:
        return <PlayIcon className="w-4 h-4" />
      case WorkflowState.PAUSED:
        return <PauseIcon className="w-4 h-4" />
      case WorkflowState.COMPLETED:
        return <CheckCircleIcon className="w-4 h-4" />
      case WorkflowState.FAILED:
        return <ExclamationTriangleIcon className="w-4 h-4" />
      case WorkflowState.CANCELLED:
        return <StopIcon className="w-4 h-4" />
      default:
        return <CogIcon className="w-4 h-4" />
    }
  }

  const getActionButtons = (workflow) => {
    const buttons = []
    
    switch (workflow.current_state) {
      case WorkflowState.PENDING:
        buttons.push(
          <Button
            key="start"
            size="sm"
            onClick={() => handleWorkflowAction(workflow.workflow_id, 'start')}
            className="flex items-center space-x-1"
          >
            <PlayIcon className="w-3 h-3" />
            <span>Start</span>
          </Button>
        )
        break
      case WorkflowState.ACTIVE:
        buttons.push(
          <Button
            key="pause"
            size="sm"
            variant="outline"
            onClick={() => handleWorkflowAction(workflow.workflow_id, 'pause')}
            className="flex items-center space-x-1"
          >
            <PauseIcon className="w-3 h-3" />
            <span>Pause</span>
          </Button>
        )
        break
      case WorkflowState.PAUSED:
        buttons.push(
          <Button
            key="resume"
            size="sm"
            onClick={() => handleWorkflowAction(workflow.workflow_id, 'resume')}
            className="flex items-center space-x-1"
          >
            <PlayIcon className="w-3 h-3" />
            <span>Resume</span>
          </Button>
        )
        break
    }
    
    if ([WorkflowState.PENDING, WorkflowState.ACTIVE, WorkflowState.PAUSED].includes(workflow.current_state)) {
      buttons.push(
        <Button
          key="cancel"
          size="sm"
          variant="error"
          onClick={() => handleWorkflowAction(workflow.workflow_id, 'cancel')}
          className="flex items-center space-x-1"
        >
          <StopIcon className="w-3 h-3" />
          <span>Cancel</span>
        </Button>
      )
    }
    
    return buttons
  }

  const pendingWorkflows = getWorkflowsByState(WorkflowState.PENDING)
  const completedWorkflows = getWorkflowsByState(WorkflowState.COMPLETED)
  const failedWorkflows = getWorkflowsByState(WorkflowState.FAILED)
  const successRate = getSuccessRate()
  const avgCompletionTime = getAverageCompletionTime()
  const topFailures = getTopFailureReasons(3)
  const agentUtilization = getAgentUtilization()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workflow Management Dashboard
          </h2>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Hierarchical state machine with event sourcing
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
            onClick={() => setShowWorkflowCreation(!showWorkflowCreation)}
            className="flex items-center space-x-2"
          >
            <BoltIcon className="w-4 h-4" />
            <span>{showWorkflowCreation ? 'Hide Creation' : 'Create Workflow'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={checkServiceHealth}
            disabled={serviceLoading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
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
                    Workflow State Management Service
                  </span>
                </div>
                <Badge variant="outline" size="sm">
                  Event Sourcing
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Total Workflows: {totalWorkflows}</span>
                <span>Active: {activeWorkflows}</span>
                <span>Success Rate: {successRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Creation */}
      {showWorkflowCreation && (
        <WorkflowCreation
          onWorkflowCreated={(workflow) => {
            setShowWorkflowCreation(false)
            // Refresh workflow list will happen automatically via the hook
          }}
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Workflows
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalWorkflows}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <PlayIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeWorkflows}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Completion
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workflowStateApi.formatDuration(avgCompletionTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow State Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow State Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.values(WorkflowState).map((state) => {
              const count = getWorkflowsByState(state).length
              const percentage = totalWorkflows > 0 ? (count / totalWorkflows) * 100 : 0
              
              return (
                <div key={state} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2" style={{ color: workflowStateApi.getStateColor(state) }}>
                    {getWorkflowStateIcon(state)}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {workflowStateApi.formatWorkflowState(state)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                  <p className="text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {workflows.filter(w => w.current_state === WorkflowState.ACTIVE).map((workflow) => (
                <div 
                  key={workflow.workflow_id} 
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div style={{ color: workflowStateApi.getStateColor(workflow.current_state) }}>
                        {getWorkflowStateIcon(workflow.current_state)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {workflow.workflow_id}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="primary" 
                            size="sm"
                          >
                            {workflowStateApi.formatWorkflowState(workflow.current_state)}
                          </Badge>
                          {workflow.current_substate && (
                            <Badge variant="outline" size="sm">
                              {workflowStateApi.formatWorkflowSubState(workflow.current_substate)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getActionButtons(workflow)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress:</span>
                      <span className="font-medium">
                        {workflowStateApi.calculateProgress(workflow.step_states).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={workflowStateApi.calculateProgress(workflow.step_states)} 
                      className="h-2"
                    />
                    
                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mt-3">
                      <div>
                        <span>Completed:</span>
                        <span className="ml-1 font-medium">
                          {Object.values(workflow.step_states).filter(s => s === StepStatus.COMPLETED).length}
                        </span>
                      </div>
                      <div>
                        <span>Running:</span>
                        <span className="ml-1 font-medium">
                          {Object.values(workflow.step_states).filter(s => s === StepStatus.RUNNING).length}
                        </span>
                      </div>
                      <div>
                        <span>Pending:</span>
                        <span className="ml-1 font-medium">
                          {Object.values(workflow.step_states).filter(s => s === StepStatus.PENDING).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {workflows.filter(w => w.current_state === WorkflowState.ACTIVE).length === 0 && (
                <div className="text-center py-8">
                  <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No active workflows
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Completed Today</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {completedWorkflows.length}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Failed Today</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {failedWorkflows.length}
                  </p>
                </div>
              </div>

              {topFailures.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Top Failure Reasons
                  </h4>
                  <div className="space-y-2">
                    {topFailures.map((failure, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {failure.failure_type}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{failure.count}</span>
                          <span className="text-gray-500">({failure.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agentUtilization.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Agent Utilization
                  </h4>
                  <div className="space-y-2">
                    {agentUtilization.slice(0, 3).map((agent) => (
                      <div key={agent.agent_id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {agent.agent_id}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{agent.current_workload}</span>
                          <span className="text-gray-500">workflows</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
