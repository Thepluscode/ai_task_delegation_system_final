'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  BoltIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useWorkflowManagement } from '@/lib/hooks/useWorkflowState'
import { workflowStateApi } from '@/lib/api/workflowState'
import { StepType } from '@/types/workflow-state'
import toast from 'react-hot-toast'

export function WorkflowCreation({ onWorkflowCreated }) {
  const { createWorkflow, loading } = useWorkflowManagement()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timeout: 3600,
    steps: [
      {
        step_name: 'Initial Step',
        step_type: StepType.SEQUENTIAL,
        parameters: {},
        dependencies: []
      }
    ]
  })
  const [errors, setErrors] = useState({})

  const stepTypeOptions = [
    { value: StepType.SEQUENTIAL, label: 'Sequential' },
    { value: StepType.PARALLEL, label: 'Parallel' },
    { value: StepType.CONDITIONAL, label: 'Conditional' },
    { value: StepType.LOOP, label: 'Loop' },
    { value: StepType.SYNCHRONIZATION, label: 'Synchronization' }
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.steps.length === 0) {
      newErrors.steps = 'At least one step is required'
    }

    formData.steps.forEach((step, index) => {
      if (!step.step_name.trim()) {
        newErrors[`step_${index}_name`] = 'Step name is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const workflowDefinition = workflowStateApi.createWorkflowDefinition(
      formData.name,
      formData.description,
      formData.steps
    )

    // Add timeout if specified
    if (formData.timeout > 0) {
      workflowDefinition.timeout = formData.timeout
    }

    const request = {
      definition: workflowDefinition,
      start_immediately: false
    }

    const result = await createWorkflow(request)
    
    if (result) {
      // Reset form
      setFormData({
        name: '',
        description: '',
        timeout: 3600,
        steps: [
          {
            step_name: 'Initial Step',
            step_type: StepType.SEQUENTIAL,
            parameters: {},
            dependencies: []
          }
        ]
      })
      setErrors({})
      
      if (onWorkflowCreated) {
        onWorkflowCreated(result)
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData(prev => ({ ...prev, steps: newSteps }))
    
    // Clear error when user starts typing
    const errorKey = `step_${index}_${field}`
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }))
    }
  }

  const addStep = () => {
    const newStep = {
      step_name: `Step ${formData.steps.length + 1}`,
      step_type: StepType.SEQUENTIAL,
      parameters: {},
      dependencies: []
    }
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, steps: newSteps }))
    }
  }

  const addDependency = (stepIndex, dependencyIndex) => {
    if (dependencyIndex !== stepIndex) {
      const newSteps = [...formData.steps]
      const dependencyStepId = `step_${dependencyIndex + 1}`
      
      if (!newSteps[stepIndex].dependencies.includes(dependencyStepId)) {
        newSteps[stepIndex].dependencies.push(dependencyStepId)
        setFormData(prev => ({ ...prev, steps: newSteps }))
      }
    }
  }

  const removeDependency = (stepIndex, dependency) => {
    const newSteps = [...formData.steps]
    newSteps[stepIndex].dependencies = newSteps[stepIndex].dependencies.filter(
      dep => dep !== dependency
    )
    setFormData(prev => ({ ...prev, steps: newSteps }))
  }

  const getStepTypeIcon = (stepType) => {
    switch (stepType) {
      case StepType.SEQUENTIAL:
        return <ArrowRightIcon className="w-4 h-4" />
      case StepType.PARALLEL:
        return <CogIcon className="w-4 h-4" />
      case StepType.CONDITIONAL:
        return <CheckCircleIcon className="w-4 h-4" />
      default:
        return <DocumentTextIcon className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <BoltIcon className="w-6 h-6 text-primary-500" />
          <CardTitle>Create New Workflow</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Workflow Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder="e.g., Banking Transaction Processing"
              required
            />

            <Input
              label="Timeout (seconds)"
              type="number"
              value={formData.timeout}
              onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
              min="0"
              placeholder="3600"
            />
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            placeholder="Describe what this workflow does..."
            required
          />

          {/* Workflow Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Workflow Steps
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Step</span>
              </Button>
            </div>

            <div className="space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" size="sm">
                        Step {index + 1}
                      </Badge>
                      <div className="text-primary-500">
                        {getStepTypeIcon(step.step_type)}
                      </div>
                    </div>
                    
                    {formData.steps.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStep(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Step Name"
                      value={step.step_name}
                      onChange={(e) => handleStepChange(index, 'step_name', e.target.value)}
                      error={errors[`step_${index}_name`]}
                      placeholder="e.g., Validate Transaction"
                      required
                    />

                    <Select
                      label="Step Type"
                      value={step.step_type}
                      onChange={(value) => handleStepChange(index, 'step_type', value)}
                      options={stepTypeOptions}
                      required
                    />
                  </div>

                  {/* Dependencies */}
                  {index > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dependencies (Optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.steps.slice(0, index).map((_, depIndex) => (
                          <Button
                            key={depIndex}
                            type="button"
                            variant={step.dependencies.includes(`step_${depIndex + 1}`) ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => {
                              if (step.dependencies.includes(`step_${depIndex + 1}`)) {
                                removeDependency(index, `step_${depIndex + 1}`)
                              } else {
                                addDependency(index, depIndex)
                              }
                            }}
                            className="text-xs"
                          >
                            Step {depIndex + 1}
                          </Button>
                        ))}
                      </div>
                      {step.dependencies.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          This step will wait for: {step.dependencies.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Workflow will be created with {formData.steps.length} step{formData.steps.length !== 1 ? 's' : ''}</p>
              <p>Estimated duration: {workflowStateApi.formatDuration(formData.timeout)}</p>
            </div>
            
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <BoltIcon className="w-4 h-4" />
              <span>Create Workflow</span>
            </Button>
          </div>

          {/* Workflow Preview */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Workflow Preview
            </h4>
            <div className="space-y-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <Badge variant="outline" size="sm">
                    {index + 1}
                  </Badge>
                  <div className="text-primary-500">
                    {getStepTypeIcon(step.step_type)}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {step.step_name}
                  </span>
                  <span className="text-gray-500">
                    ({workflowStateApi.formatStepType(step.step_type)})
                  </span>
                  {step.dependencies.length > 0 && (
                    <span className="text-xs text-orange-600">
                      Depends on: {step.dependencies.join(', ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
