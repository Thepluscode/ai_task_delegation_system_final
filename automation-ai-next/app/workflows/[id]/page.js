'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { WorkflowStateVisualizer } from '@/components/workflow/WorkflowStateVisualizer'
import { 
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useWorkflow, useWorkflowState, useWorkflowEvents, useWorkflowOperations } from '@/lib/hooks/useWorkflows'
import { WorkflowState } from '@/types/workflow'
import { formatDateTime, formatDuration } from '@/lib/utils/helpers'

export default function WorkflowDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id
  
  const [activeTab, setActiveTab] = useState('overview')
  
  const { workflow, isLoading: workflowLoading, error: workflowError } = useWorkflow(workflowId)
  const { state, events, isConnected } = useWorkflowState(workflowId)
  const { events: eventHistory } = useWorkflowEvents(workflowId)
  const { 
    startWorkflow, 
    pauseWorkflow, 
    resumeWorkflow, 
    cancelWorkflow,
    loading: operationsLoading 
  } = useWorkflowOperations()

  if (workflowLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (workflowError || !workflow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Workflow Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {workflowError?.message || 'The requested workflow could not be found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStateIcon = (currentState) => {
    const iconProps = { className: "w-6 h-6" }
    
    switch (currentState) {
      case WorkflowState.PENDING:
        return <ClockIcon {...iconProps} className="text-gray-500" />
      case WorkflowState.ACTIVE:
        return <PlayIcon {...iconProps} className="text-primary-500" />
      case WorkflowState.PAUSED:
        return <PauseIcon {...iconProps} className="text-warning-500" />
      case WorkflowState.COMPLETED:
        return <CheckCircleIcon {...iconProps} className="text-success-500" />
      case WorkflowState.FAILED:
        return <XCircleIcon {...iconProps} className="text-error-500" />
      case WorkflowState.CANCELLED:
        return <StopIcon {...iconProps} className="text-gray-500" />
      default:
        return <ClockIcon {...iconProps} className="text-gray-500" />
    }
  }

  const getStateColor = (currentState) => {
    switch (currentState) {
      case WorkflowState.PENDING:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case WorkflowState.ACTIVE:
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
      case WorkflowState.PAUSED:
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
      case WorkflowState.COMPLETED:
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
      case WorkflowState.FAILED:
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
      case WorkflowState.CANCELLED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const currentState = state?.current_state || workflow.current_state
  const stepStates = state?.step_states || {}
  const assignedAgents = state?.assigned_agents || {}

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-6">
          {/* Workflow Info */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Workflow ID</p>
                    <p className="text-gray-900 dark:text-white font-mono">{workflow.workflow_id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-white">{workflow.name || 'Unnamed Workflow'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-gray-900 dark:text-white">{workflow.description || 'No description'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white">{formatDateTime(workflow.created_at)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="text-gray-900 dark:text-white">{formatDateTime(workflow.updated_at)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Steps</p>
                    <p className="text-gray-900 dark:text-white">{workflow.total_steps || Object.keys(stepStates).length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success-600">
                    {Object.values(stepStates).filter(s => s === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {Object.values(stepStates).filter(s => s === 'running').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Running</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-error-600">
                    {Object.values(stepStates).filter(s => s === 'failed').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {Object.values(stepStates).filter(s => s === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'state',
      label: 'State Machine',
      icon: Cog6ToothIcon,
      content: (
        <WorkflowStateVisualizer 
          workflowId={workflowId}
          showControls={true}
        />
      )
    },
    {
      id: 'events',
      label: 'Event History',
      icon: DocumentTextIcon,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Event Stream</CardTitle>
          </CardHeader>
          <CardContent>
            {eventHistory && eventHistory.length > 0 ? (
              <div className="space-y-3">
                {eventHistory.slice().reverse().map((event, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sequence: {event.sequence_number}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>
                    {event.event_data && Object.keys(event.event_data).length > 0 && (
                      <div className="mt-2">
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No events recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStateColor(currentState)}`}>
              {getStateIcon(currentState)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {workflow.name || workflow.workflow_id}
              </h1>
              <div className="flex items-center space-x-2">
                <Badge variant={getStateColor(currentState)} size="sm">
                  {currentState?.replace('_', ' ') || 'Unknown'}
                </Badge>
                {state?.current_substate && (
                  <Badge variant="secondary" size="sm">
                    {state.current_substate.replace('_', ' ')}
                  </Badge>
                )}
                {isConnected !== undefined && (
                  <Badge variant={isConnected ? 'success' : 'error'} size="sm">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {currentState === WorkflowState.PENDING && (
            <Button
              onClick={() => startWorkflow(workflowId)}
              disabled={operationsLoading}
              className="flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Start</span>
            </Button>
          )}
          
          {currentState === WorkflowState.ACTIVE && (
            <Button
              variant="warning"
              onClick={() => pauseWorkflow(workflowId)}
              disabled={operationsLoading}
              className="flex items-center space-x-2"
            >
              <PauseIcon className="w-4 h-4" />
              <span>Pause</span>
            </Button>
          )}
          
          {currentState === WorkflowState.PAUSED && (
            <Button
              onClick={() => resumeWorkflow(workflowId)}
              disabled={operationsLoading}
              className="flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Resume</span>
            </Button>
          )}
          
          {[WorkflowState.ACTIVE, WorkflowState.PAUSED].includes(currentState) && (
            <Button
              variant="error"
              onClick={() => cancelWorkflow(workflowId, 'Manual cancellation')}
              disabled={operationsLoading}
              className="flex items-center space-x-2"
            >
              <StopIcon className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
