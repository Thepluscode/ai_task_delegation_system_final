'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { SearchBar } from '@/components/ui/SearchBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { WorkflowCard } from '@/components/workflow/WorkflowCard'
import {
  PlusIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import { useWorkflows, useWorkflowOperations, useBulkWorkflowOperations } from '@/lib/hooks/useWorkflows'
import { WorkflowState } from '@/types/workflow'
import { workflowsApi } from '@/lib/api/workflows'

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    states: [],
    dateRange: null
  })
  const [viewMode, setViewMode] = useState('grid')
  const [selectedWorkflows, setSelectedWorkflows] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const { workflows, totalCount, isLoading, error, mutate } = useWorkflows()
  const { loading: operationsLoading } = useWorkflowOperations()
  const { bulkStart, bulkPause, bulkCancel, loading: bulkLoading } = useBulkWorkflowOperations()

  const stateOptions = [
    { value: WorkflowState.PENDING, label: 'Pending' },
    { value: WorkflowState.ACTIVE, label: 'Active' },
    { value: WorkflowState.PAUSED, label: 'Paused' },
    { value: WorkflowState.COMPLETED, label: 'Completed' },
    { value: WorkflowState.FAILED, label: 'Failed' },
    { value: WorkflowState.CANCELLED, label: 'Cancelled' },
  ]

  const sortOptions = [
    { value: 'workflow_id', label: 'Workflow ID' },
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'progress', label: 'Progress' },
  ]

  // Filter and sort workflows
  const filteredAndSortedWorkflows = useMemo(() => {
    let filtered = workflows || []

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(workflow =>
        workflow.workflow_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (workflow.name && workflow.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply state filters
    if (filters.states.length > 0) {
      filtered = filtered.filter(workflow =>
        filters.states.includes(workflow.current_state)
      )
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'workflow_id':
          aValue = a.workflow_id.toLowerCase()
          bValue = b.workflow_id.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'updated_at':
          aValue = new Date(a.updated_at)
          bValue = new Date(b.updated_at)
          break
        default:
          return 0
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
    })
  }, [workflows, searchQuery, filters, sortBy, sortOrder])

  const handleWorkflowSelect = (workflowId, selected) => {
    setSelectedWorkflows(prev =>
      selected
        ? [...prev, workflowId]
        : prev.filter(id => id !== workflowId)
    )
  }

  const handleBulkOperation = async (operation) => {
    if (selectedWorkflows.length === 0) return

    try {
      switch (operation) {
        case 'start':
          await bulkStart(selectedWorkflows)
          break
        case 'pause':
          await bulkPause(selectedWorkflows)
          break
        case 'cancel':
          await bulkCancel(selectedWorkflows, 'Bulk cancellation')
          break
      }
      setSelectedWorkflows([])
      mutate()
    } catch (error) {
      console.error('Bulk operation failed:', error)
    }
  }

  const clearFilters = () => {
    setFilters({ states: [], dateRange: null })
    setSearchQuery('')
  }

  // Calculate overview metrics
  const overviewMetrics = useMemo(() => {
    const stateCounts = (workflows || []).reduce((acc, workflow) => {
      acc[workflow.current_state] = (acc[workflow.current_state] || 0) + 1
      return acc
    }, {})

    const totalSteps = (workflows || []).reduce((acc, workflow) => acc + (workflow.total_steps || 0), 0)
    const completedSteps = (workflows || []).reduce((acc, workflow) => acc + (workflow.completed_steps || 0), 0)

    return {
      total: (workflows || []).length,
      active: stateCounts[WorkflowState.ACTIVE] || 0,
      completed: stateCounts[WorkflowState.COMPLETED] || 0,
      failed: stateCounts[WorkflowState.FAILED] || 0,
      pending: stateCounts[WorkflowState.PENDING] || 0,
      paused: stateCounts[WorkflowState.PAUSED] || 0,
      overallProgress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
    }
  }, [workflows])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Workflows
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and monitor your automation workflows
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Badge variant="secondary">
            {filteredWorkflows.length} workflows
          </Badge>
          
          <Link href="/workflows/templates">
            <Button variant="secondary" size="sm">
              Templates
            </Button>
          </Link>
          
          <Link href="/workflows/create">
            <Button className="flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Create Workflow</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            className="w-40"
          />
          
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            className="w-40"
          />
          
          <Button
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
          </Button>
          
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <ListBulletIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <FilterPanel
          onClose={() => setShowFilters(false)}
          filters={[
            {
              type: 'select',
              label: 'Created By',
              options: [
                { value: 'all', label: 'All Users' },
                { value: 'me', label: 'Created by me' },
              ]
            },
            {
              type: 'daterange',
              label: 'Created Date',
            },
            {
              type: 'select',
              label: 'Complexity',
              options: [
                { value: 'all', label: 'All Levels' },
                { value: 'simple', label: 'Simple' },
                { value: 'medium', label: 'Medium' },
                { value: 'complex', label: 'Complex' },
              ]
            }
          ]}
        />
      )}

      {/* Bulk Actions */}
      {selectedWorkflows.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-700 dark:text-primary-300">
              {selectedWorkflows.length} workflow(s) selected
            </span>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => handleBulkAction('start')}
                className="flex items-center space-x-1"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Start</span>
              </Button>
              
              <Button
                size="sm"
                variant="warning"
                onClick={() => handleBulkAction('pause')}
                className="flex items-center space-x-1"
              >
                <PauseIcon className="w-4 h-4" />
                <span>Pause</span>
              </Button>
              
              <Button
                size="sm"
                variant="error"
                onClick={() => handleBulkAction('stop')}
                className="flex items-center space-x-1"
              >
                <StopIcon className="w-4 h-4" />
                <span>Stop</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Workflows Display */}
      {filteredWorkflows.length === 0 ? (
        <EmptyState
          title="No workflows found"
          description="Create your first workflow to get started with automation"
          action={{
            label: "Create Workflow",
            href: "/workflows/create"
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              selected={selectedWorkflows.includes(workflow.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedWorkflows([...selectedWorkflows, workflow.id])
                } else {
                  setSelectedWorkflows(selectedWorkflows.filter(id => id !== workflow.id))
                }
              }}
            />
          ))}
        </div>
      ) : (
        <WorkflowList
          workflows={filteredWorkflows}
          selectedWorkflows={selectedWorkflows}
          onSelectWorkflow={setSelectedWorkflows}
        />
      )}
    </div>
  )
}
