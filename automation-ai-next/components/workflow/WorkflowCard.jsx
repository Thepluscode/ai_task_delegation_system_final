'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { 
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useWorkflowOperations } from '@/lib/hooks/useWorkflows'
import { WorkflowState, WorkflowSubState } from '@/types/workflow'
import { formatDuration, formatDateTime, getStatusColor } from '@/lib/utils/helpers'

export function WorkflowCard({ 
  workflow, 
  selected = false, 
  onSelect, 
  showControls = true,
  onViewDetails 
}) {
  const { 
    startWorkflow, 
    pauseWorkflow, 
    resumeWorkflow, 
    cancelWorkflow, 
    loading 
  } = useWorkflowOperations()
  
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const getStateIcon = (state, substate) => {
    const iconProps = { className: "w-5 h-5" }
    
    switch (state) {
      case WorkflowState.PENDING:
        return <ClockIcon {...iconProps} className="w-5 h-5 text-gray-500" />
      case WorkflowState.ACTIVE:
        if (substate === WorkflowSubState.EXECUTING) {
          return <PlayIcon {...iconProps} className="w-5 h-5 text-primary-500" />
        }
        return <Cog6ToothIcon {...iconProps} className="w-5 h-5 text-blue-500" />
      case WorkflowState.PAUSED:
        return <PauseIcon {...iconProps} className="w-5 h-5 text-warning-500" />
      case WorkflowState.COMPLETED:
        return <CheckCircleIcon {...iconProps} className="w-5 h-5 text-success-500" />
      case WorkflowState.FAILED:
        return <XCircleIcon {...iconProps} className="w-5 h-5 text-error-500" />
      case WorkflowState.CANCELLED:
        return <StopIcon {...iconProps} className="w-5 h-5 text-gray-500" />
      default:
        return <ClockIcon {...iconProps} className="w-5 h-5 text-gray-500" />
    }
  }

  const getStateColor = (state) => {
    switch (state) {
      case WorkflowState.PENDING:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case WorkflowState.ACTIVE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
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

  const calculateProgress = () => {
    if (!workflow.step_states) return 0
    
    const totalSteps = Object.keys(workflow.step_states).length
    if (totalSteps === 0) return 0
    
    const completedSteps = Object.values(workflow.step_states).filter(
      status => status === 'completed' || status === 'skipped'
    ).length
    
    return (completedSteps / totalSteps) * 100
  }

  const getAssignedAgents = () => {
    if (!workflow.assigned_agents) return []
    return Object.values(workflow.assigned_agents).filter(Boolean)
  }

  const getDuration = () => {
    if (!workflow.created_at) return 0
    
    const startTime = new Date(workflow.created_at)
    const endTime = workflow.updated_at ? new Date(workflow.updated_at) : new Date()
    
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
  }

  const handleAction = async (action, actionFn) => {
    if (action.includes('Cancel') || action.includes('Stop')) {
      setConfirmAction({ action, actionFn })
      setShowConfirmModal(true)
    } else {
      await actionFn()
    }
  }

  const executeConfirmedAction = async () => {
    if (confirmAction) {
      await confirmAction.actionFn()
      setShowConfirmModal(false)
      setConfirmAction(null)
    }
  }

  const progress = calculateProgress()
  const assignedAgents = getAssignedAgents()
  const duration = getDuration()

  return (
    <>
      <Card 
        className={`transition-all duration-200 hover:shadow-lg ${
          selected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
        } ${workflow.current_state === WorkflowState.FAILED ? 'border-error-200 dark:border-error-800' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getStateColor(workflow.current_state)}`}>
                {getStateIcon(workflow.current_state, workflow.current_substate)}
              </div>
              <div>
                <CardTitle className="text-lg">{workflow.name || workflow.workflow_id}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {workflow.description || 'No description'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(workflow.current_state)} size="sm">
                {workflow.current_state.replace('_', ' ')}
              </Badge>
              {workflow.current_substate && (
                <Badge variant="secondary" size="sm">
                  {workflow.current_substate.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
          
          {onSelect && (
            <div className="mt-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => onSelect(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Select for bulk operations
                </span>
              </label>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  workflow.current_state === WorkflowState.COMPLETED ? 'bg-success-500' :
                  workflow.current_state === WorkflowState.FAILED ? 'bg-error-500' :
                  workflow.current_state === WorkflowState.ACTIVE ? 'bg-primary-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDuration(duration)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Steps</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {Object.keys(workflow.step_states || {}).length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Agents</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {assignedAgents.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Updated</p>
                <p className="font-medium text-gray-900 dark:text-white text-xs">
                  {formatDateTime(workflow.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Agents */}
          {assignedAgents.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigned Agents:
              </p>
              <div className="flex flex-wrap gap-1">
                {assignedAgents.slice(0, 3).map((agentId, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {agentId}
                  </Badge>
                ))}
                {assignedAgents.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{assignedAgents.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Controls */}
          {showControls && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                {workflow.current_state === WorkflowState.PENDING && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction('Start Workflow', () => startWorkflow(workflow.workflow_id))}
                    disabled={loading}
                    className="text-xs flex items-center justify-center space-x-1"
                  >
                    <PlayIcon className="w-3 h-3" />
                    <span>Start</span>
                  </Button>
                )}
                
                {workflow.current_state === WorkflowState.ACTIVE && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleAction('Pause Workflow', () => pauseWorkflow(workflow.workflow_id))}
                    disabled={loading}
                    className="text-xs flex items-center justify-center space-x-1"
                  >
                    <PauseIcon className="w-3 h-3" />
                    <span>Pause</span>
                  </Button>
                )}
                
                {workflow.current_state === WorkflowState.PAUSED && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction('Resume Workflow', () => resumeWorkflow(workflow.workflow_id))}
                    disabled={loading}
                    className="text-xs flex items-center justify-center space-x-1"
                  >
                    <PlayIcon className="w-3 h-3" />
                    <span>Resume</span>
                  </Button>
                )}
                
                {[WorkflowState.ACTIVE, WorkflowState.PAUSED].includes(workflow.current_state) && (
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => handleAction('Cancel Workflow', () => cancelWorkflow(workflow.workflow_id, 'User cancelled'))}
                    disabled={loading}
                    className="text-xs flex items-center justify-center space-x-1"
                  >
                    <StopIcon className="w-3 h-3" />
                    <span>Cancel</span>
                  </Button>
                )}
                
                {workflow.current_state === WorkflowState.FAILED && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction('Retry Workflow', () => retryWorkflow(workflow.workflow_id))}
                    disabled={loading}
                    className="text-xs flex items-center justify-center space-x-1"
                  >
                    <ArrowPathIcon className="w-3 h-3" />
                    <span>Retry</span>
                  </Button>
                )}
                
                {onViewDetails ? (
                  <button
                    onClick={() => onViewDetails(workflow.workflow_id)}
                    className="text-xs flex items-center justify-center space-x-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                ) : (
                  <Link href={`/workflows/${workflow.workflow_id}`}>
                    <button className="w-full text-xs flex items-center justify-center space-x-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                      <EyeIcon className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to "{confirmAction?.action}" for workflow "{workflow.name || workflow.workflow_id}"?
          </p>
          
          {confirmAction?.action?.includes('Cancel') && (
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
              <p className="text-warning-700 dark:text-warning-300 text-sm">
                ⚠️ Cancelling the workflow will stop all running steps and cannot be undone.
              </p>
            </div>
          )}
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <Button
              variant={confirmAction?.action?.includes('Cancel') ? 'error' : 'primary'}
              onClick={executeConfirmedAction}
              loading={loading}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
