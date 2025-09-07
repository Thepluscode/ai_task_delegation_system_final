'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { 
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  XCircleIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import { useFleet, useAgentOperations } from '@/lib/hooks/useAgents'
import { AgentType } from '@/types/agent'
import { formatNumber, formatPercentage, formatCurrency } from '@/lib/utils/helpers'

export function AgentFleetOverview() {
  const {
    overview,
    status,
    overviewError,
    statusError,
    mutateOverview,
    mutateStatus
  } = useFleet()

  const { bulkUpdateStatus, loading } = useAgentOperations()
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkAction, setBulkAction] = useState(null)

  const handleBulkAction = (action, actionFn) => {
    setBulkAction({ action, actionFn })
    setShowBulkModal(true)
  }

  const executeBulkAction = async () => {
    if (bulkAction) {
      try {
        // This would need to be implemented based on your specific bulk operations
        await bulkAction.actionFn()
        setShowBulkModal(false)
        setBulkAction(null)
        mutateOverview()
        mutateStatus()
      } catch (error) {
        console.error('Bulk action failed:', error)
      }
    }
  }

  const handleRefresh = () => {
    mutateOverview()
    mutateStatus()
  }

  if (overviewError || statusError) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Fleet Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to retrieve fleet information. Please try again.
          </p>
          <Button onClick={handleRefresh}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!overview) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
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
    )
  }

  const metrics = [
    {
      title: 'Total Agents',
      value: overview.total_agents || 0,
      icon: UserGroupIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    },
    {
      title: 'Available',
      value: overview.available_agents || 0,
      icon: CheckCircleIcon,
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900/20',
      percentage: overview.total_agents > 0 ? (overview.available_agents / overview.total_agents) * 100 : 0
    },
    {
      title: 'Busy',
      value: overview.busy_agents || 0,
      icon: ClockIcon,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100 dark:bg-warning-900/20',
      percentage: overview.total_agents > 0 ? (overview.busy_agents / overview.total_agents) * 100 : 0
    },
    {
      title: 'Offline',
      value: overview.offline_agents || 0,
      icon: XCircleIcon,
      color: 'text-error-600',
      bgColor: 'bg-error-100 dark:bg-error-900/20',
      percentage: overview.total_agents > 0 ? (overview.offline_agents / overview.total_agents) * 100 : 0
    }
  ]

  const performanceMetrics = [
    {
      title: 'Active Assignments',
      value: overview.active_assignments || 0,
      subtitle: 'Currently executing'
    },
    {
      title: 'Tasks Today',
      value: overview.completed_tasks_today || 0,
      subtitle: 'Successfully completed'
    },
    {
      title: 'Fleet Utilization',
      value: `${(overview.average_utilization || 0).toFixed(1)}%`,
      subtitle: 'Average workload'
    },
    {
      title: 'Fleet Efficiency',
      value: `${(overview.fleet_efficiency || 0).toFixed(1)}%`,
      subtitle: 'Overall performance'
    }
  ]

  // Calculate agent type distribution
  const agentTypeDistribution = status ? Object.entries(status).reduce((acc, [type, agents]) => {
    if (Array.isArray(agents)) {
      acc[type] = agents.length
    }
    return acc
  }, {}) : {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Fleet Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your intelligent agent fleet
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Status Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(metric.value)}
                    </p>
                    {metric.percentage !== undefined && (
                      <Badge 
                        variant={metric.percentage > 80 ? 'success' : metric.percentage > 50 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {metric.percentage.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                </p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {metric.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.subtitle}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Type Distribution */}
      {Object.keys(agentTypeDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(agentTypeDistribution).map(([type, count]) => {
                const percentage = overview.total_agents > 0 ? (count / overview.total_agents) * 100 : 0
                
                return (
                  <div key={type} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {type.replace('_', ' ')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              type === AgentType.ROBOT ? 'bg-blue-500' :
                              type === AgentType.HUMAN ? 'bg-green-500' :
                              type === AgentType.AI_SYSTEM ? 'bg-purple-500' :
                              type === AgentType.HYBRID ? 'bg-orange-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                          {count} ({percentage.toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fleet Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="success"
              onClick={() => handleBulkAction('Activate All Available Agents', () => {})}
              disabled={loading || overview.offline_agents === 0}
              className="flex items-center justify-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Activate All</span>
            </Button>
            
            <Button
              variant="warning"
              onClick={() => handleBulkAction('Set All Agents to Maintenance', () => {})}
              disabled={loading || overview.available_agents === 0}
              className="flex items-center justify-center space-x-2"
            >
              <WrenchScrewdriverIcon className="w-4 h-4" />
              <span>Maintenance Mode</span>
            </Button>
            
            <Button
              variant="primary"
              onClick={() => handleBulkAction('Optimize Fleet Utilization', () => {})}
              disabled={loading}
              className="flex items-center justify-center space-x-2"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Optimize</span>
            </Button>
            
            <Button
              variant="error"
              onClick={() => handleBulkAction('Emergency Stop All Agents', () => {})}
              disabled={loading || overview.busy_agents === 0}
              className="flex items-center justify-center space-x-2"
            >
              <StopIcon className="w-4 h-4" />
              <span>Emergency Stop</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Confirmation Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Confirm Fleet Action"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to execute "{bulkAction?.action}"?
          </p>
          
          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
            <p className="text-warning-700 dark:text-warning-300 text-sm">
              ⚠️ This action will affect multiple agents in your fleet. Make sure this is what you intend to do.
            </p>
          </div>
          
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </Button>
            
            <Button
              variant={bulkAction?.action?.includes('Emergency Stop') ? 'error' : 'primary'}
              onClick={executeBulkAction}
              loading={loading}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
