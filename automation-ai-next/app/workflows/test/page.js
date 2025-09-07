'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { WorkflowStateVisualizer } from '@/components/workflow/WorkflowStateVisualizer'
import { 
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  Cog6ToothIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { workflowsApi } from '@/lib/api/workflows'
import { useWorkflowOperations } from '@/lib/hooks/useWorkflows'
import { WorkflowState, StepType } from '@/types/workflow'
import toast from 'react-hot-toast'

export default function WorkflowTestPage() {
  const { createWorkflow, loading } = useWorkflowOperations()
  const [serviceInfo, setServiceInfo] = useState(null)
  const [healthStatus, setHealthStatus] = useState(null)
  const [testWorkflows, setTestWorkflows] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [newWorkflow, setNewWorkflow] = useState({
    workflow_id: 'test-workflow-001',
    name: 'Test Assembly Workflow',
    description: 'A test workflow for assembly operations',
    steps: [
      {
        step_id: 'step-001',
        step_name: 'Initialize System',
        step_type: StepType.SEQUENTIAL,
        parameters: { timeout: 30 },
        dependencies: [],
        status: 'pending'
      },
      {
        step_id: 'step-002',
        step_name: 'Prepare Materials',
        step_type: StepType.PARALLEL,
        parameters: { materials: ['part-a', 'part-b'] },
        dependencies: ['step-001'],
        status: 'pending'
      },
      {
        step_id: 'step-003',
        step_name: 'Assembly Process',
        step_type: StepType.SEQUENTIAL,
        parameters: { precision: 0.1 },
        dependencies: ['step-002'],
        status: 'pending'
      },
      {
        step_id: 'step-004',
        step_name: 'Quality Check',
        step_type: StepType.CONDITIONAL,
        parameters: { quality_threshold: 0.95 },
        dependencies: ['step-003'],
        status: 'pending'
      },
      {
        step_id: 'step-005',
        step_name: 'Finalize',
        step_type: StepType.SYNCHRONIZATION,
        parameters: {},
        dependencies: ['step-004'],
        status: 'pending'
      }
    ],
    global_parameters: {
      max_retries: 3,
      timeout: 300
    }
  })

  // Test service connectivity
  useEffect(() => {
    const testConnectivity = async () => {
      try {
        const health = await workflowsApi.healthCheck()
        setHealthStatus(health)
        
        const info = await workflowsApi.getServiceInfo()
        setServiceInfo(info)
      } catch (error) {
        console.error('Service connectivity test failed:', error)
        setHealthStatus({ status: 'error', error: error.message })
      }
    }

    testConnectivity()
  }, [])

  const handleCreateTestWorkflow = async () => {
    try {
      const result = await createWorkflow(newWorkflow)
      const workflowData = {
        workflow_id: newWorkflow.workflow_id,
        name: newWorkflow.name,
        description: newWorkflow.description,
        current_state: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_steps: newWorkflow.steps.length,
        completed_steps: 0,
        ...result
      }
      setTestWorkflows(prev => [...prev, workflowData])
      toast.success('Test workflow created successfully!')

      // Auto-select the new workflow
      setSelectedWorkflow(newWorkflow.workflow_id)
    } catch (error) {
      toast.error('Failed to create test workflow: ' + error.message)
    }
  }

  const updateWorkflowStep = (stepIndex, field, value) => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }))
  }

  const addWorkflowStep = () => {
    const newStep = {
      step_id: `step-${String(newWorkflow.steps.length + 1).padStart(3, '0')}`,
      step_name: 'New Step',
      step_type: StepType.SEQUENTIAL,
      parameters: {},
      dependencies: [],
      status: 'pending'
    }
    
    setNewWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const removeWorkflowStep = (stepIndex) => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter((_, index) => index !== stepIndex)
    }))
  }

  const stepTypeOptions = [
    { value: StepType.SEQUENTIAL, label: 'Sequential' },
    { value: StepType.PARALLEL, label: 'Parallel' },
    { value: StepType.CONDITIONAL, label: 'Conditional' },
    { value: StepType.LOOP, label: 'Loop' },
    { value: StepType.SYNCHRONIZATION, label: 'Synchronization' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Workflow State Management Test
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test and validate the hierarchical workflow state machine with event sourcing
          </p>
        </div>
        
        <Button
          onClick={handleCreateTestWorkflow}
          disabled={loading}
          loading={loading}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Test Workflow</span>
        </Button>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="text-gray-900 dark:text-white">{serviceInfo.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</p>
                  <p className="text-gray-900 dark:text-white">{serviceInfo.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-gray-900 dark:text-white text-sm">{serviceInfo.description}</p>
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
      </div>

      {/* Workflow Definition Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Test Workflow Definition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Workflow ID"
                value={newWorkflow.workflow_id}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, workflow_id: e.target.value }))}
              />
              
              <Input
                label="Workflow Name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Description"
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Steps Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Workflow Steps ({newWorkflow.steps.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWorkflowStep}
                  className="flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Step</span>
                </Button>
              </div>
              
              <div className="space-y-4">
                {newWorkflow.steps.map((step, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Step ID"
                        value={step.step_id}
                        onChange={(e) => updateWorkflowStep(index, 'step_id', e.target.value)}
                      />
                      
                      <Input
                        label="Step Name"
                        value={step.step_name}
                        onChange={(e) => updateWorkflowStep(index, 'step_name', e.target.value)}
                      />
                      
                      <Select
                        label="Step Type"
                        value={step.step_type}
                        onChange={(value) => updateWorkflowStep(index, 'step_type', value)}
                        options={stepTypeOptions}
                      />
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Dependencies: {step.dependencies.length > 0 ? step.dependencies.join(', ') : 'None'}
                      </div>
                      
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => removeWorkflowStep(index)}
                        disabled={newWorkflow.steps.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Created Workflows */}
      {testWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Created Test Workflows ({testWorkflows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testWorkflows.map((workflow) => (
                <div
                  key={workflow.workflow_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedWorkflow === workflow.workflow_id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedWorkflow(workflow.workflow_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {workflow.name || workflow.workflow_id}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workflow.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" size="sm">
                        {workflow.steps?.length || 0} steps
                      </Badge>
                      <Badge variant="primary" size="sm">
                        {workflow.current_state || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow State Visualizer */}
      {selectedWorkflow && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Workflow State Visualization
          </h2>
          <WorkflowStateVisualizer 
            workflowId={selectedWorkflow}
            showControls={true}
          />
        </div>
      )}
    </div>
  )
}
