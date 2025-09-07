'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ClockIcon,
  CpuChipIcon,
  UserIcon,
  BeakerIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { agentsApi } from '@/lib/api/agents'
import { useTaskOperations } from '@/lib/hooks/useAgents'
import { AgentType, TaskPriority } from '@/types/agent'
import toast from 'react-hot-toast'

export default function AgentTestPage() {
  const { assignTask, loading } = useTaskOperations()
  const [serviceInfo, setServiceInfo] = useState(null)
  const [healthStatus, setHealthStatus] = useState(null)
  const [capabilityMatrix, setCapabilityMatrix] = useState(null)
  const [testAgents, setTestAgents] = useState([])
  const [testTask, setTestTask] = useState({
    task_id: 'test-task-001',
    task_type: 'assembly',
    priority: TaskPriority.STANDARD,
    requirements: [
      {
        requirement_type: 'precision_assembly',
        minimum_proficiency: 0.7,
        weight: 0.8
      },
      {
        requirement_type: 'quality_inspection',
        minimum_proficiency: 0.6,
        weight: 0.2
      }
    ],
    estimated_duration: 30,
    complexity_score: 0.6,
    safety_critical: false
  })
  const [assignmentResult, setAssignmentResult] = useState(null)

  // Test service connectivity
  useEffect(() => {
    const testConnectivity = async () => {
      try {
        const health = await agentsApi.healthCheck()
        setHealthStatus(health)
        
        const info = await agentsApi.getServiceInfo()
        setServiceInfo(info)
        
        const matrix = await agentsApi.getCapabilityMatrix()
        setCapabilityMatrix(matrix)
      } catch (error) {
        console.error('Service connectivity test failed:', error)
        setHealthStatus({ status: 'error', error: error.message })
      }
    }

    testConnectivity()
  }, [])

  // Generate test agents
  useEffect(() => {
    const generateTestAgents = () => {
      const agents = [
        {
          agent_id: 'robot-001',
          agent_type: AgentType.ROBOT,
          name: 'Assembly Robot Alpha',
          capabilities: {
            precision_assembly: { proficiency_level: 0.95, confidence: 0.9, last_assessed: new Date().toISOString() },
            quality_inspection: { proficiency_level: 0.85, confidence: 0.8, last_assessed: new Date().toISOString() },
            material_handling: { proficiency_level: 0.9, confidence: 0.85, last_assessed: new Date().toISOString() }
          },
          current_status: 'available',
          location: 'Factory Floor A',
          cost_per_hour: 25.0,
          energy_consumption: 2.5,
          safety_rating: 0.95,
          current_workload: 0.3
        },
        {
          agent_id: 'human-001',
          agent_type: AgentType.HUMAN,
          name: 'Sarah Johnson',
          capabilities: {
            precision_assembly: { proficiency_level: 0.8, confidence: 0.85, last_assessed: new Date().toISOString() },
            quality_inspection: { proficiency_level: 0.9, confidence: 0.9, last_assessed: new Date().toISOString() },
            troubleshooting: { proficiency_level: 0.95, confidence: 0.9, last_assessed: new Date().toISOString() }
          },
          current_status: 'available',
          location: 'Factory Floor A',
          cost_per_hour: 45.0,
          energy_consumption: 0.1,
          safety_rating: 0.85,
          current_workload: 0.5
        },
        {
          agent_id: 'ai-001',
          agent_type: AgentType.AI_SYSTEM,
          name: 'Vision AI System',
          capabilities: {
            quality_inspection: { proficiency_level: 0.98, confidence: 0.95, last_assessed: new Date().toISOString() },
            pattern_recognition: { proficiency_level: 0.95, confidence: 0.9, last_assessed: new Date().toISOString() },
            data_analysis: { proficiency_level: 0.9, confidence: 0.85, last_assessed: new Date().toISOString() }
          },
          current_status: 'available',
          location: 'Cloud Infrastructure',
          cost_per_hour: 15.0,
          energy_consumption: 1.0,
          safety_rating: 0.99,
          current_workload: 0.2
        },
        {
          agent_id: 'hybrid-001',
          agent_type: AgentType.HYBRID,
          name: 'Collaborative Workstation',
          capabilities: {
            precision_assembly: { proficiency_level: 0.88, confidence: 0.85, last_assessed: new Date().toISOString() },
            quality_inspection: { proficiency_level: 0.82, confidence: 0.8, last_assessed: new Date().toISOString() },
            human_robot_collaboration: { proficiency_level: 0.92, confidence: 0.9, last_assessed: new Date().toISOString() }
          },
          current_status: 'available',
          location: 'Factory Floor B',
          cost_per_hour: 35.0,
          energy_consumption: 3.0,
          safety_rating: 0.9,
          current_workload: 0.4
        }
      ]
      setTestAgents(agents)
    }

    generateTestAgents()
  }, [])

  const handleTestAssignment = async () => {
    try {
      const result = await assignTask(testTask, testAgents)
      setAssignmentResult(result)
      toast.success('Task assignment completed!')
    } catch (error) {
      toast.error('Task assignment failed: ' + error.message)
    }
  }

  const updateTaskRequirement = (index, field, value) => {
    setTestTask(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      )
    }))
  }

  const getAgentIcon = (type) => {
    const iconProps = { className: "w-5 h-5" }
    
    switch (type) {
      case AgentType.ROBOT:
        return <CpuChipIcon {...iconProps} />
      case AgentType.HUMAN:
        return <UserIcon {...iconProps} />
      case AgentType.AI_SYSTEM:
        return <CpuChipIcon {...iconProps} />
      case AgentType.HYBRID:
        return <BeakerIcon {...iconProps} />
      default:
        return <CpuChipIcon {...iconProps} />
    }
  }

  const getAgentTypeColor = (type) => {
    switch (type) {
      case AgentType.ROBOT:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case AgentType.HUMAN:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case AgentType.AI_SYSTEM:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case AgentType.HYBRID:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Agent Selection Service Test
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test and validate the multi-objective optimization engine
          </p>
        </div>
        
        <Button
          onClick={handleTestAssignment}
          disabled={loading || !testAgents.length}
          loading={loading}
          className="flex items-center space-x-2"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Test Assignment</span>
        </Button>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Health</CardTitle>
          </CardHeader>
          <CardContent>
            {healthStatus ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {healthStatus.status === 'healthy' ? (
                    <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-error-500" />
                  )}
                  <span className="font-medium">
                    {healthStatus.status === 'healthy' ? 'Service Online' : 'Service Error'}
                  </span>
                </div>
                {healthStatus.error && (
                  <p className="text-sm text-error-600 dark:text-error-400">
                    {healthStatus.error}
                  </p>
                )}
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceInfo ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</p>
                  <p className="text-gray-900 dark:text-white">{serviceInfo.service}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</p>
                  <p className="text-gray-900 dark:text-white">{serviceInfo.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Capabilities</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {serviceInfo.capabilities?.map((capability) => (
                      <Badge key={capability} variant="secondary" size="sm">
                        {capability.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capability Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            {capabilityMatrix ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Agent Types: {Object.keys(capabilityMatrix).length}
                </p>
                <div className="space-y-1">
                  {Object.entries(capabilityMatrix).map(([type, capabilities]) => (
                    <div key={type} className="text-sm">
                      <span className="font-medium capitalize">
                        {type.replace('_', ' ')}:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        {Object.keys(capabilities).length} capabilities
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Task Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Task Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Task ID"
                value={testTask.task_id}
                onChange={(e) => setTestTask(prev => ({ ...prev, task_id: e.target.value }))}
              />
              
              <Input
                label="Task Type"
                value={testTask.task_type}
                onChange={(e) => setTestTask(prev => ({ ...prev, task_type: e.target.value }))}
              />
              
              <Select
                label="Priority"
                value={testTask.priority}
                onChange={(value) => setTestTask(prev => ({ ...prev, priority: value }))}
                options={[
                  { value: TaskPriority.SAFETY_CRITICAL, label: 'Safety Critical' },
                  { value: TaskPriority.QUALITY_CRITICAL, label: 'Quality Critical' },
                  { value: TaskPriority.EFFICIENCY_CRITICAL, label: 'Efficiency Critical' },
                  { value: TaskPriority.STANDARD, label: 'Standard' },
                ]}
              />
            </div>
            
            <div className="space-y-4">
              <Input
                label="Estimated Duration (minutes)"
                type="number"
                value={testTask.estimated_duration}
                onChange={(e) => setTestTask(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
              />
              
              <Input
                label="Complexity Score (0-1)"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={testTask.complexity_score}
                onChange={(e) => setTestTask(prev => ({ ...prev, complexity_score: parseFloat(e.target.value) || 0 }))}
              />
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={testTask.safety_critical}
                  onChange={(e) => setTestTask(prev => ({ ...prev, safety_critical: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">Safety Critical</span>
              </label>
            </div>
          </div>
          
          {/* Task Requirements */}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Task Requirements
            </h4>
            <div className="space-y-3">
              {testTask.requirements.map((req, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Input
                    label="Capability Type"
                    value={req.requirement_type}
                    onChange={(e) => updateTaskRequirement(index, 'requirement_type', e.target.value)}
                  />
                  <Input
                    label="Min Proficiency (0-1)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={req.minimum_proficiency}
                    onChange={(e) => updateTaskRequirement(index, 'minimum_proficiency', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label="Weight (0-1)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={req.weight}
                    onChange={(e) => updateTaskRequirement(index, 'weight', parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Available Test Agents ({testAgents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testAgents.map((agent) => (
              <div
                key={agent.agent_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${getAgentTypeColor(agent.agent_type)}`}>
                    {getAgentIcon(agent.agent_type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {agent.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {agent.agent_type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Cost/Hour</p>
                    <p className="font-medium">${agent.cost_per_hour}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Safety Rating</p>
                    <p className="font-medium">{(agent.safety_rating * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Workload</p>
                    <p className="font-medium">{(agent.current_workload * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Energy</p>
                    <p className="font-medium">{agent.energy_consumption} kW/h</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capabilities:
                  </p>
                  <div className="space-y-1">
                    {Object.entries(agent.capabilities).map(([name, capability]) => (
                      <div key={name} className="flex justify-between text-xs">
                        <span className="capitalize">{name.replace('_', ' ')}</span>
                        <span className="font-medium">
                          {(capability.proficiency_level * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Result */}
      {assignmentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-success-500" />
              <span>Assignment Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Agent</p>
                  <p className="text-gray-900 dark:text-white">{assignmentResult.assigned_agent_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Confidence Score</p>
                  <p className="text-gray-900 dark:text-white">
                    {(assignmentResult.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Completion</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(assignmentResult.estimated_completion_time).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Optimization Scores:
                </p>
                <div className="space-y-2">
                  {Object.entries(assignmentResult.optimization_scores || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {assignmentResult.reasoning && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assignment Reasoning:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {assignmentResult.reasoning}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
