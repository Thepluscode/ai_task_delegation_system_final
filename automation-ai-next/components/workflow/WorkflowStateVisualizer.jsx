'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  UserIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useWorkflowState, useWorkflowOperations } from '@/lib/hooks/useWorkflows'
import { WorkflowState, WorkflowSubState, StepType } from '@/types/workflow'
import { formatDateTime, formatDuration } from '@/lib/utils/helpers'

export function WorkflowStateVisualizer({ workflowId, showControls = true }) {
  const { state, events, isConnected, error } = useWorkflowState(workflowId)
  const { 
    startWorkflow, 
    pauseWorkflow, 
    resumeWorkflow, 
    cancelWorkflow,
    completeStep,
    failStep,
    assignAgentToStep,
    loading 
  } = useWorkflowOperations()

  const [selectedStep, setSelectedStep] = useState(null)
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    if (events.length > 0) {
      setRecentEvents(events.slice(-10)) // Keep last 10 events
    }
  }, [events])

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Workflow State
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Unable to retrieve workflow state information.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!state) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStepIcon = (status) => {
    const iconProps = { className: "w-4 h-4" }
    
    switch (status) {
      case 'pending':
        return <ClockIcon {...iconProps} className="text-gray-400" />
      case 'running':
        return <PlayIcon {...iconProps} className="text-primary-500" />
      case 'completed':
        return <CheckCircleIcon {...iconProps} className="text-success-500" />
      case 'failed':
        return <XCircleIcon {...iconProps} className="text-error-500" />
      case 'skipped':
        return <ArrowRightIcon {...iconProps} className="text-gray-400" />
      default:
        return <ClockIcon {...iconProps} className="text-gray-400" />
    }
  }

  const getStepStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'running':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
      case 'completed':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
      case 'failed':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
      case 'skipped':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStateIcon = (currentState, substate) => {
    const iconProps = { className: "w-6 h-6" }
    
    switch (currentState) {
      case WorkflowState.PENDING:
        return <ClockIcon {...iconProps} className="text-gray-500" />
      case WorkflowState.ACTIVE:
        if (substate === WorkflowSubState.EXECUTING) {
          return <PlayIcon {...iconProps} className="text-primary-500" />
        }
        return <Cog6ToothIcon {...iconProps} className="text-blue-500" />
      case WorkflowState.PAUSED:
        return <PauseIcon {...iconProps} className="text-warning-500" />
      case WorkflowState.COMPLETED:
        return <CheckCircleIcon {...iconProps} className="text-success-500" />
      case WorkflowState.FAILED:
        return <XCircleIcon {...iconProps} className="text-error-500" />
      default:
        return <ClockIcon {...iconProps} className="text-gray-500" />
    }
  }

  const getWorkflowDuration = () => {
    if (!state.created_at) return 0
    
    const startTime = new Date(state.created_at)
    const endTime = new Date(state.updated_at)
    
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
  }

  const getStepProgress = () => {
    const totalSteps = Object.keys(state.step_states).length
    if (totalSteps === 0) return { completed: 0, failed: 0, running: 0, pending: 0 }
    
    const stepCounts = Object.values(state.step_states).reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
    
    return {
      completed: stepCounts.completed || 0,
      failed: stepCounts.failed || 0,
      running: stepCounts.running || 0,
      pending: stepCounts.pending || 0,
      total: totalSteps
    }
  }

  const stepProgress = getStepProgress()
  const duration = getWorkflowDuration()

  return (
    <div className="space-y-6">
      {/* Workflow State Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                {getStateIcon(state.current_state, state.current_substate)}
              </div>
              <div>
                <CardTitle className="text-xl">
                  Workflow State: {state.current_state.replace('_', ' ').toUpperCase()}
                </CardTitle>
                {state.current_substate && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Substate: {state.current_substate.replace('_', ' ')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? 'success' : 'error'} size="sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Badge variant="secondary" size="sm">
                Sequence: {state.snapshot_sequence}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">{stepProgress.completed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{stepProgress.running}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Running</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-error-600">{stepProgress.failed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stepProgress.pending}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Duration</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDuration(duration)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Last Updated</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDateTime(state.updated_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Controls */}
      {showControls && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {state.current_state === WorkflowState.PENDING && (
                <Button
                  onClick={() => startWorkflow(workflowId)}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Start Workflow</span>
                </Button>
              )}
              
              {state.current_state === WorkflowState.ACTIVE && (
                <Button
                  variant="warning"
                  onClick={() => pauseWorkflow(workflowId)}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <PauseIcon className="w-4 h-4" />
                  <span>Pause Workflow</span>
                </Button>
              )}
              
              {state.current_state === WorkflowState.PAUSED && (
                <Button
                  onClick={() => resumeWorkflow(workflowId)}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Resume Workflow</span>
                </Button>
              )}
              
              {[WorkflowState.ACTIVE, WorkflowState.PAUSED].includes(state.current_state) && (
                <Button
                  variant="error"
                  onClick={() => cancelWorkflow(workflowId, 'Manual cancellation')}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <XCircleIcon className="w-4 h-4" />
                  <span>Cancel Workflow</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step States */}
      <Card>
        <CardHeader>
          <CardTitle>Step States ({stepProgress.total} steps)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(state.step_states).map(([stepId, status]) => {
              const assignedAgent = state.assigned_agents[stepId]
              
              return (
                <div
                  key={stepId}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedStep === stepId
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStep(selectedStep === stepId ? null : stepId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStepIcon(status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {stepId}
                        </p>
                        {assignedAgent && (
                          <div className="flex items-center space-x-1 mt-1">
                            <UserIcon className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {assignedAgent}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge variant={getStepStatusColor(status)} size="sm">
                      {status}
                    </Badge>
                  </div>
                  
                  {selectedStep === stepId && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            completeStep(workflowId, stepId, { manual_completion: true })
                          }}
                          disabled={loading || status !== 'running'}
                        >
                          Complete Step
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            failStep(workflowId, stepId, 'Manual failure')
                          }}
                          disabled={loading || status !== 'running'}
                        >
                          Fail Step
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 text-sm">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {event.event_type.replace('_', ' ').toUpperCase()}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>
                    {event.event_data && Object.keys(event.event_data).length > 0 && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {JSON.stringify(event.event_data, null, 2).slice(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
