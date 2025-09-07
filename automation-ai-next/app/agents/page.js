'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { SearchBar } from '@/components/ui/SearchBar'
import { FilterPanel } from '@/components/ui/FilterPanel'
import { EmptyState } from '@/components/ui/EmptyState'
import { AgentCard } from '@/components/agent/AgentCard'
import { AgentFleetOverview } from '@/components/agent/AgentFleetOverview'
import { TaskAssignmentPanel } from '@/components/agent/TaskAssignmentPanel'
import { 
  PlusIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  UserGroupIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { useAgents, useAgentOperations } from '@/lib/hooks/useAgents'
import { AgentType } from '@/types/agent'
import { agentsApi } from '@/lib/api/agents'

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    types: [],
    statuses: [],
    capabilities: [],
    min_safety_rating: 0,
    max_cost_per_hour: 1000,
    locations: []
  })
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedAgents, setSelectedAgents] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const { agents, isLoading, error, mutate } = useAgents()
  const { bulkUpdateStatus, loading: operationsLoading } = useAgentOperations()

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.agent_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.agent_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    filtered = agentsApi.filterAgents(filtered, filters)

    // Apply sorting
    return agentsApi.sortAgents(filtered, sortBy, sortOrder)
  }, [agents, searchQuery, filters, sortBy, sortOrder])

  const handleAgentSelect = (agentId, selected) => {
    setSelectedAgents(prev =>
      selected
        ? [...prev, agentId]
        : prev.filter(id => id !== agentId)
    )
  }

  const handleSelectAll = (selected) => {
    setSelectedAgents(selected ? filteredAndSortedAgents.map(a => a.agent_id) : [])
  }

  const handleBulkStatusUpdate = async (status) => {
    if (selectedAgents.length === 0) return

    try {
      await bulkUpdateStatus(selectedAgents, status)
      setSelectedAgents([])
      mutate()
    } catch (error) {
      console.error('Bulk status update failed:', error)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({
      types: [],
      statuses: [],
      capabilities: [],
      min_safety_rating: 0,
      max_cost_per_hour: 1000,
      locations: []
    })
    setSearchQuery('')
  }

  const agentTypeOptions = [
    { value: AgentType.ROBOT, label: 'Robot' },
    { value: AgentType.HUMAN, label: 'Human' },
    { value: AgentType.AI_SYSTEM, label: 'AI System' },
    { value: AgentType.HYBRID, label: 'Hybrid' },
  ]

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'offline', label: 'Offline' },
  ]

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'cost', label: 'Cost per Hour' },
    { value: 'safety', label: 'Safety Rating' },
    { value: 'workload', label: 'Current Workload' },
  ]

  const tabs = [
    {
      id: 'overview',
      label: 'Fleet Overview',
      icon: UserGroupIcon,
      content: <AgentFleetOverview />
    },
    {
      id: 'agents',
      label: 'Agent Management',
      icon: Squares2X2Icon,
      content: (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search agents..."
                onClear={() => setSearchQuery('')}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filters</span>
                {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f > 0) && (
                  <Badge variant="primary" size="sm">
                    Active
                  </Badge>
                )}
              </button>
              
              <Select
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
                placeholder="Sort by..."
                size="sm"
              />
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              
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

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFilterChange}
              onClear={clearFilters}
              filterOptions={{
                types: agentTypeOptions,
                statuses: statusOptions,
                capabilities: [], // Would be populated from capability matrix
                locations: [] // Would be populated from agent data
              }}
            />
          )}

          {/* Bulk Actions */}
          {selectedAgents.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={() => setSelectedAgents([])}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleBulkStatusUpdate('available')}
                      disabled={operationsLoading}
                    >
                      Set Available
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleBulkStatusUpdate('maintenance')}
                      disabled={operationsLoading}
                    >
                      Maintenance
                    </Button>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleBulkStatusUpdate('offline')}
                      disabled={operationsLoading}
                    >
                      Set Offline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agents Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-error-600 dark:text-error-400">
                  Failed to load agents: {error.message}
                </p>
                <Button onClick={() => mutate()} className="mt-4">
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : filteredAndSortedAgents.length === 0 ? (
            <EmptyState
              icon={UserGroupIcon}
              title="No agents found"
              description={
                searchQuery || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f > 0)
                  ? "No agents match your current search and filter criteria."
                  : "No agents have been registered yet."
              }
              action={
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredAndSortedAgents.map((agent) => (
                <AgentCard
                  key={agent.agent_id}
                  agent={agent}
                  selected={selectedAgents.includes(agent.agent_id)}
                  onSelect={(selected) => handleAgentSelect(agent.agent_id, selected)}
                  showControls={true}
                />
              ))}
            </div>
          )}

          {/* Pagination would go here if needed */}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Agent Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and manage your intelligent agent fleet
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAssignmentPanel(true)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Smart Assignment</span>
          </button>
          
          <Button
            onClick={() => {/* Open agent registration modal */}}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Agent</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      {/* Task Assignment Panel */}
      <TaskAssignmentPanel
        isOpen={showAssignmentPanel}
        onClose={() => setShowAssignmentPanel(false)}
        task={null} // Would be passed when assigning a specific task
        onAssignmentComplete={(assignment) => {
          console.log('Assignment completed:', assignment)
          setShowAssignmentPanel(false)
        }}
      />
    </div>
  )
}
