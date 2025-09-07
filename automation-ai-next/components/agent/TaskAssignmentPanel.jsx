'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { 
  PlusIcon,
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { useAgents, useTaskOperations } from '@/lib/hooks/useAgents'
import { TaskPriority, AgentType } from '@/types/agent'
import { formatDuration, formatPercentage, formatCurrency } from '@/lib/utils/helpers'

export function TaskAssignmentPanel({ isOpen, onClose, task, onAssignmentComplete }) {
  const { agents, isLoading: agentsLoading } = useAgents({ status: 'available' })
  const { assignTask, requestDelegation, loading } = useTaskOperations()
  
  const [assignmentMode, setAssignmentMode] = useState('auto') // 'auto' or 'manual'
  const [selectedAgent, setSelectedAgent] = useState('')
  const [optimizationPreferences, setOptimizationPreferences] = useState({
    prioritize_speed: false,
    prioritize_quality: true,
    prioritize_cost: false,
    prioritize_safety: task?.safety_critical || false
  })
  const [assignmentResult, setAssignmentResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const priorityOptions = [
    { value: TaskPriority.SAFETY_CRITICAL, label: 'Safety Critical' },
    { value: TaskPriority.QUALITY_CRITICAL, label: 'Quality Critical' },
    { value: TaskPriority.EFFICIENCY_CRITICAL, label: 'Efficiency Critical' },
    { value: TaskPriority.STANDARD, label: 'Standard' },
  ]

  const agentTypeOptions = [
    { value: AgentType.ROBOT, label: 'Robot' },
    { value: AgentType.HUMAN, label: 'Human' },
    { value: AgentType.AI_SYSTEM, label: 'AI System' },
    { value: AgentType.HYBRID, label: 'Hybrid' },
  ]

  // Filter agents based on task requirements
  const getCapableAgents = () => {
    if (!task || !agents) return []
    
    return agents.filter(agent => {
      // Check if agent has required capabilities
      const hasRequiredCapabilities = task.requirements?.every(req => {
        const capability = agent.capabilities?.[req.requirement_type]
        return capability && capability.proficiency_level >= req.minimum_proficiency
      })
      
      return hasRequiredCapabilities && agent.current_status === 'available'
    })
  }

  const capableAgents = getCapableAgents()

  const handleAutoAssignment = async () => {
    if (!task) return

    try {
      const delegationRequest = {
        task,
        optimization_preferences: optimizationPreferences,
        deadline_strict: task.deadline ? true : false
      }

      const result = await requestDelegation(delegationRequest)
      setAssignmentResult(result)
      setShowResult(true)
    } catch (error) {
      console.error('Auto assignment failed:', error)
    }
  }

  const handleManualAssignment = async () => {
    if (!task || !selectedAgent) return

    try {
      const agent = agents.find(a => a.agent_id === selectedAgent)
      if (!agent) return

      const result = await assignTask(task, [agent])
      setAssignmentResult(result)
      setShowResult(true)
    } catch (error) {
      console.error('Manual assignment failed:', error)
    }
  }

  const handleAssignmentConfirm = () => {
    if (assignmentResult && onAssignmentComplete) {
      onAssignmentComplete(assignmentResult)
    }
    setShowResult(false)
    setAssignmentResult(null)
    onClose()
  }

  const getAgentScore = (agent) => {
    if (!task) return 0
    
    let score = 0
    let totalWeight = 0
    
    task.requirements?.forEach(req => {
      const capability = agent.capabilities?.[req.requirement_type]
      if (capability) {
        score += capability.proficiency_level * req.weight
        totalWeight += req.weight
      }
    })
    
    return totalWeight > 0 ? score / totalWeight : 0
  }

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-success-600'
    if (score >= 0.6) return 'text-warning-600'
    return 'text-error-600'
  }

  if (!task) return null

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Assign Task"
        size="xl"
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Task ID</p>
                  <p className="text-gray-900 dark:text-white">{task.task_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-gray-900 dark:text-white">{task.task_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</p>
                  <Badge variant={task.priority === TaskPriority.SAFETY_CRITICAL ? 'error' : 'primary'}>
                    {task.priority.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="text-gray-900 dark:text-white">{formatDuration(task.estimated_duration)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complexity</p>
                  <p className="text-gray-900 dark:text-white">{formatPercentage(task.complexity_score)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Safety Critical</p>
                  <Badge variant={task.safety_critical ? 'error' : 'secondary'}>
                    {task.safety_critical ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              
              {task.requirements && task.requirements.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements:
                  </p>
                  <div className="space-y-2">
                    {task.requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {req.requirement_type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Min: {formatPercentage(req.minimum_proficiency)}</span>
                          <span className="text-gray-500">Weight: {req.weight.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Mode Selection */}
          <div className="flex space-x-4">
            <Button
              variant={assignmentMode === 'auto' ? 'primary' : 'outline'}
              onClick={() => setAssignmentMode('auto')}
              className="flex items-center space-x-2"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Auto Assignment</span>
            </Button>
            <Button
              variant={assignmentMode === 'manual' ? 'primary' : 'outline'}
              onClick={() => setAssignmentMode('manual')}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Manual Selection</span>
            </Button>
          </div>

          {/* Auto Assignment Configuration */}
          {assignmentMode === 'auto' && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={optimizationPreferences.prioritize_speed}
                      onChange={(e) => setOptimizationPreferences(prev => ({
                        ...prev,
                        prioritize_speed: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">Prioritize Speed</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={optimizationPreferences.prioritize_quality}
                      onChange={(e) => setOptimizationPreferences(prev => ({
                        ...prev,
                        prioritize_quality: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">Prioritize Quality</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={optimizationPreferences.prioritize_cost}
                      onChange={(e) => setOptimizationPreferences(prev => ({
                        ...prev,
                        prioritize_cost: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">Prioritize Cost</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={optimizationPreferences.prioritize_safety}
                      onChange={(e) => setOptimizationPreferences(prev => ({
                        ...prev,
                        prioritize_safety: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">Prioritize Safety</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Agent Selection */}
          {assignmentMode === 'manual' && (
            <Card>
              <CardHeader>
                <CardTitle>Available Agents ({capableAgents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {agentsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                ) : capableAgents.length === 0 ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="w-12 h-12 text-warning-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No agents available that meet the task requirements.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {capableAgents.map((agent) => {
                      const score = getAgentScore(agent)
                      return (
                        <div
                          key={agent.agent_id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedAgent === agent.agent_id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedAgent(agent.agent_id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                checked={selectedAgent === agent.agent_id}
                                onChange={() => setSelectedAgent(agent.agent_id)}
                                className="text-primary-600 focus:ring-primary-500"
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {agent.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {agent.agent_type.replace('_', ' ').toUpperCase()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="text-center">
                                <p className="text-gray-500">Match Score</p>
                                <p className={`font-medium ${getScoreColor(score)}`}>
                                  {formatPercentage(score)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500">Cost/Hour</p>
                                <p className="font-medium">{formatCurrency(agent.cost_per_hour)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500">Workload</p>
                                <p className="font-medium">{formatPercentage(agent.current_workload)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={assignmentMode === 'auto' ? handleAutoAssignment : handleManualAssignment}
              loading={loading}
              disabled={assignmentMode === 'manual' && !selectedAgent}
              className="flex items-center space-x-2"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>
                {assignmentMode === 'auto' ? 'Find Optimal Agent' : 'Assign to Selected Agent'}
              </span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assignment Result Modal */}
      <Modal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        title="Assignment Result"
        size="lg"
      >
        {assignmentResult && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 text-success-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Successfully Assigned!
              </h3>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Agent</p>
                    <p className="text-gray-900 dark:text-white">{assignmentResult.assigned_agent_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Confidence Score</p>
                    <p className="text-gray-900 dark:text-white">
                      {formatPercentage(assignmentResult.confidence_score)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Completion</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(assignmentResult.estimated_completion_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {assignmentResult.reasoning && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assignment Reasoning:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {assignmentResult.reasoning}
                    </p>
                  </div>
                )}
                
                {assignmentResult.optimization_scores && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Optimization Scores:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(assignmentResult.optimization_scores).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{formatPercentage(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex space-x-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowResult(false)}
              >
                Close
              </Button>
              
              <Button
                variant="primary"
                onClick={handleAssignmentConfirm}
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
