import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNotifications } from './NotificationContext'

const WorkflowContext = createContext()

export function WorkflowProvider({ children }) {
  const [workflows, setWorkflows] = useState([])
  const [activeWorkflow, setActiveWorkflow] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { success, error: notifyError } = useNotifications()

  // Mock data for development
  const mockWorkflows = [
    {
      id: '1',
      name: 'Banking Automation',
      description: 'Automated loan processing and customer onboarding',
      status: 'active',
      progress: 87,
      tasks: 45,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      steps: [
        { id: '1', name: 'Document Collection', status: 'completed', duration: 120 },
        { id: '2', name: 'Credit Check', status: 'completed', duration: 45 },
        { id: '3', name: 'Risk Assessment', status: 'active', duration: 60 },
        { id: '4', name: 'Approval Process', status: 'pending', duration: 30 }
      ]
    },
    {
      id: '2',
      name: 'Healthcare Processing',
      description: 'Patient data processing and appointment scheduling',
      status: 'active',
      progress: 92,
      tasks: 23,
      createdAt: '2024-01-18T09:00:00Z',
      updatedAt: '2024-01-20T16:45:00Z',
      steps: [
        { id: '1', name: 'Patient Registration', status: 'completed', duration: 90 },
        { id: '2', name: 'Insurance Verification', status: 'completed', duration: 60 },
        { id: '3', name: 'Appointment Scheduling', status: 'active', duration: 30 },
        { id: '4', name: 'Confirmation', status: 'pending', duration: 15 }
      ]
    },
    {
      id: '3',
      name: 'Retail Analytics',
      description: 'Inventory management and sales forecasting',
      status: 'paused',
      progress: 65,
      tasks: 12,
      createdAt: '2024-01-10T11:00:00Z',
      updatedAt: '2024-01-19T13:20:00Z',
      steps: [
        { id: '1', name: 'Data Collection', status: 'completed', duration: 180 },
        { id: '2', name: 'Analysis', status: 'paused', duration: 120 },
        { id: '3', name: 'Forecasting', status: 'pending', duration: 90 },
        { id: '4', name: 'Report Generation', status: 'pending', duration: 45 }
      ]
    }
  ]

  useEffect(() => {
    // Initialize with mock data
    setWorkflows(mockWorkflows)
  }, [])

  const createWorkflow = useCallback(async (workflowData) => {
    try {
      setLoading(true)
      setError(null)

      const newWorkflow = {
        id: Date.now().toString(),
        ...workflowData,
        status: 'draft',
        progress: 0,
        tasks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: workflowData.steps || []
      }

      setWorkflows(prev => [...prev, newWorkflow])
      success(`Workflow "${newWorkflow.name}" created successfully`)
      
      return newWorkflow
    } catch (err) {
      setError(err.message)
      notifyError(`Failed to create workflow: ${err.message}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [success, notifyError])

  const updateWorkflow = useCallback(async (id, updates) => {
    try {
      setLoading(true)
      setError(null)

      setWorkflows(prev => prev.map(workflow => 
        workflow.id === id 
          ? { ...workflow, ...updates, updatedAt: new Date().toISOString() }
          : workflow
      ))

      success('Workflow updated successfully')
    } catch (err) {
      setError(err.message)
      notifyError(`Failed to update workflow: ${err.message}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [success, notifyError])

  const deleteWorkflow = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)

      const workflow = workflows.find(w => w.id === id)
      if (!workflow) {
        throw new Error('Workflow not found')
      }

      setWorkflows(prev => prev.filter(w => w.id !== id))
      
      if (activeWorkflow?.id === id) {
        setActiveWorkflow(null)
      }

      success(`Workflow "${workflow.name}" deleted successfully`)
    } catch (err) {
      setError(err.message)
      notifyError(`Failed to delete workflow: ${err.message}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [workflows, activeWorkflow, success, notifyError])

  const startWorkflow = useCallback(async (id) => {
    try {
      await updateWorkflow(id, { status: 'active' })
      success('Workflow started successfully')
    } catch (err) {
      notifyError(`Failed to start workflow: ${err.message}`)
      throw err
    }
  }, [updateWorkflow, success, notifyError])

  const pauseWorkflow = useCallback(async (id) => {
    try {
      await updateWorkflow(id, { status: 'paused' })
      success('Workflow paused successfully')
    } catch (err) {
      notifyError(`Failed to pause workflow: ${err.message}`)
      throw err
    }
  }, [updateWorkflow, success, notifyError])

  const stopWorkflow = useCallback(async (id) => {
    try {
      await updateWorkflow(id, { status: 'stopped' })
      success('Workflow stopped successfully')
    } catch (err) {
      notifyError(`Failed to stop workflow: ${err.message}`)
      throw err
    }
  }, [updateWorkflow, success, notifyError])

  const getWorkflowById = useCallback((id) => {
    return workflows.find(workflow => workflow.id === id)
  }, [workflows])

  const getWorkflowsByStatus = useCallback((status) => {
    return workflows.filter(workflow => workflow.status === status)
  }, [workflows])

  const value = {
    workflows,
    activeWorkflow,
    loading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    pauseWorkflow,
    stopWorkflow,
    getWorkflowById,
    getWorkflowsByStatus,
    setActiveWorkflow
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  
  if (context === undefined) {
    // Fallback for when used outside of WorkflowProvider
    return {
      workflows: [],
      activeWorkflow: null,
      loading: false,
      error: null,
      createWorkflow: async () => {},
      updateWorkflow: async () => {},
      deleteWorkflow: async () => {},
      startWorkflow: async () => {},
      pauseWorkflow: async () => {},
      stopWorkflow: async () => {},
      getWorkflowById: () => null,
      getWorkflowsByStatus: () => [],
      setActiveWorkflow: () => {}
    }
  }
  
  return context
}
