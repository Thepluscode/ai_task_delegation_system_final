'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RobotCard } from '@/components/robot/RobotCard'
import { FleetOverview } from '@/components/robot/FleetOverview'
import { RobotControlPanel } from '@/components/robot/RobotControlPanel'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { SearchBar } from '@/components/common/SearchBar'
import { FilterPanel } from '@/components/common/FilterPanel'
import { EmptyState } from '@/components/common/EmptyState'
import { 
  PlusIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlayIcon,
  StopIcon,
  HomeIcon,
  SignalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useRobots, useFleet } from '@/lib/hooks/useRobots'

export default function RobotsPage() {
  const { robots, isLoading, error, mutate } = useRobots()
  const { bulkConnect, bulkDisconnect, bulkEmergencyStop, bulkHome } = useFleet()
  
  const [activeTab, setActiveTab] = useState('fleet')
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRobots, setSelectedRobots] = useState([])
  const [showControlPanel, setShowControlPanel] = useState(false)
  const [selectedRobotId, setSelectedRobotId] = useState(null)

  const tabs = [
    { id: 'fleet', name: 'Fleet Overview', icon: Squares2X2Icon },
    { id: 'robots', name: 'Robot Management', icon: SignalIcon },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'idle', label: 'Idle' },
    { value: 'moving', label: 'Moving' },
    { value: 'working', label: 'Working' },
    { value: 'error', label: 'Error' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'offline', label: 'Offline' },
  ]

  const brandOptions = [
    { value: 'all', label: 'All Brands' },
    { value: 'universal_robots', label: 'Universal Robots' },
    { value: 'abb', label: 'ABB' },
    { value: 'kuka', label: 'KUKA' },
    { value: 'fanuc', label: 'Fanuc' },
    { value: 'boston_dynamics', label: 'Boston Dynamics' },
    { value: 'custom', label: 'Custom' },
  ]

  const filteredRobots = robots?.filter(robot => {
    const matchesSearch = robot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         robot.model.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || robot.status === statusFilter
    const matchesBrand = brandFilter === 'all' || robot.brand === brandFilter
    
    return matchesSearch && matchesStatus && matchesBrand
  }) || []

  const handleBulkAction = async (action, actionFn) => {
    try {
      await actionFn(selectedRobots)
      mutate()
      setSelectedRobots([])
    } catch (error) {
      console.error(`Failed to ${action} robots:`, error)
    }
  }

  const handleViewDetails = (robotId) => {
    setSelectedRobotId(robotId)
    setShowControlPanel(true)
  }

  const handleSelectRobot = (robotId, selected) => {
    if (selected) {
      setSelectedRobots([...selectedRobots, robotId])
    } else {
      setSelectedRobots(selectedRobots.filter(id => id !== robotId))
    }
  }

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
            Robot Fleet Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and control your robot fleet using the Robot Abstraction Protocol (RAP)
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Badge variant="secondary">
            {filteredRobots.length} robots
          </Badge>
          
          <Link href="/robots/connect">
            <Button variant="secondary" size="sm">
              Connect Robot
            </Button>
          </Link>
          
          <Link href="/robots/fleet">
            <Button className="flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Add Robot</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'fleet' && (
        <FleetOverview />
      )}

      {activeTab === 'robots' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search robots by name or model..."
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
                value={brandFilter}
                onChange={setBrandFilter}
                options={brandOptions}
                className="w-40"
              />
              
              <Button
                variant="outline"
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
                  label: 'Connection Status',
                  options: [
                    { value: 'all', label: 'All' },
                    { value: 'connected', label: 'Connected' },
                    { value: 'disconnected', label: 'Disconnected' },
                  ]
                },
                {
                  type: 'select',
                  label: 'Battery Level',
                  options: [
                    { value: 'all', label: 'All Levels' },
                    { value: 'high', label: 'High (>80%)' },
                    { value: 'medium', label: 'Medium (20-80%)' },
                    { value: 'low', label: 'Low (<20%)' },
                  ]
                },
                {
                  type: 'daterange',
                  label: 'Last Seen',
                }
              ]}
            />
          )}

          {/* Bulk Actions */}
          {selectedRobots.length > 0 && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700 dark:text-primary-300">
                  {selectedRobots.length} robot(s) selected
                </span>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleBulkAction('connect', bulkConnect)}
                    className="flex items-center space-x-1"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>Connect</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleBulkAction('disconnect', bulkDisconnect)}
                    className="flex items-center space-x-1"
                  >
                    <SignalIcon className="w-4 h-4" />
                    <span>Disconnect</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleBulkAction('home', bulkHome)}
                    className="flex items-center space-x-1"
                  >
                    <HomeIcon className="w-4 h-4" />
                    <span>Home</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="error"
                    onClick={() => handleBulkAction('emergency_stop', bulkEmergencyStop)}
                    className="flex items-center space-x-1"
                  >
                    <StopIcon className="w-4 h-4" />
                    <span>E-Stop</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Robots Display */}
          {filteredRobots.length === 0 ? (
            <EmptyState
              title="No robots found"
              description="Connect your first robot to get started with fleet management"
              action={{
                label: "Connect Robot",
                href: "/robots/connect"
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRobots.map(robot => (
                <RobotCard
                  key={robot.id}
                  robot={robot}
                  selected={selectedRobots.includes(robot.id)}
                  onSelect={(selected) => handleSelectRobot(robot.id, selected)}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Robot Control Panel Modal */}
      <Modal
        isOpen={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        title="Robot Control Panel"
        size="full"
      >
        {selectedRobotId && (
          <RobotControlPanel
            robotId={selectedRobotId}
            onClose={() => setShowControlPanel(false)}
          />
        )}
      </Modal>
    </div>
  )
}
