'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { 
  UserIcon,
  CpuChipIcon,
  RobotIcon,
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useAgentOperations } from '@/lib/hooks/useAgents'
import { AgentType } from '@/types/agent'
import { formatCurrency, formatPercentage, getStatusColor } from '@/lib/utils/helpers'

export function AgentCard({ 
  agent, 
  selected = false, 
  onSelect, 
  showControls = true,
  onViewDetails 
}) {
  const { updateAgentStatus, loading } = useAgentOperations()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const getAgentIcon = (type) => {
    const iconProps = { className: "w-6 h-6" }
    
    switch (type) {
      case AgentType.ROBOT:
        return <RobotIcon {...iconProps} />
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

  const getWorkloadColor = (workload) => {
    if (workload >= 0.8) return 'text-error-600'
    if (workload >= 0.6) return 'text-warning-600'
    return 'text-success-600'
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await updateAgentStatus(agent.agent_id, newStatus)
    } catch (error) {
      console.error('Status update failed:', error)
    }
  }

  const confirmAndExecute = (action, actionFn) => {
    setConfirmAction({ action, actionFn })
    setShowConfirmModal(true)
  }

  const executeConfirmedAction = async () => {
    if (confirmAction) {
      await confirmAction.actionFn()
      setShowConfirmModal(false)
      setConfirmAction(null)
    }
  }

  const getTopCapabilities = (capabilities) => {
    return Object.entries(capabilities || {})
      .sort(([,a], [,b]) => b.proficiency_level - a.proficiency_level)
      .slice(0, 3)
      .map(([name, capability]) => ({
        name: name.replace('_', ' '),
        level: capability.proficiency_level
      }))
  }

  const topCapabilities = getTopCapabilities(agent.capabilities)

  return (
    <>
      <Card 
        className={`transition-all duration-200 hover:shadow-lg ${
          selected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
        } ${agent.current_status === 'offline' ? 'opacity-75' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getAgentTypeColor(agent.agent_type)}`}>
                {getAgentIcon(agent.agent_type)}
              </div>
              <div>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {agent.agent_type.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(agent.current_status)} size="sm">
                {agent.current_status.replace('_', ' ')}
              </Badge>
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
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Workload</p>
                <p className={`font-medium ${getWorkloadColor(agent.current_workload)}`}>
                  {formatPercentage(agent.current_workload)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Cost/Hour</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(agent.cost_per_hour)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Safety</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatPercentage(agent.safety_rating)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <BoltIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600 dark:text-gray-400">Energy</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {agent.energy_consumption.toFixed(1)} kW/h
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {agent.location && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {agent.location}
              </span>
            </div>
          )}

          {/* Top Capabilities */}
          {topCapabilities.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top Capabilities:
              </p>
              <div className="space-y-1">
                {topCapabilities.map((capability, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {capability.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-primary-600 h-1.5 rounded-full"
                          style={{ width: `${capability.level * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">
                        {Math.round(capability.level * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          {showControls && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                {agent.current_status === 'available' ? (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => confirmAndExecute('Set to Busy', () => handleStatusChange('busy'))}
                    disabled={loading}
                    className="text-xs flex items-center justify-center space-x-1"
                  >
                    <PauseIcon className="w-3 h-3" />
                    <span>Set Busy</span>
                  </Button>
                ) : agent.current_status === 'busy' ? (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusChange('available')}
                    disabled={loading}
                    className="text-xs flex items-center justify-center space-x-1"
                  >
                    <PlayIcon className="w-3 h-3" />
                    <span>Set Available</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange('available')}
                    disabled={loading}
                    className="text-xs flex items-center justify-center space-x-1"
                  >
                    <PlayIcon className="w-3 h-3" />
                    <span>Activate</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => confirmAndExecute('Set to Maintenance', () => handleStatusChange('maintenance'))}
                  disabled={loading}
                  className="text-xs flex items-center justify-center space-x-1"
                >
                  <WrenchScrewdriverIcon className="w-3 h-3" />
                  <span>Maintenance</span>
                </Button>
                
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => confirmAndExecute('Set Offline', () => handleStatusChange('offline'))}
                  disabled={loading}
                  className="text-xs flex items-center justify-center space-x-1"
                >
                  <StopIcon className="w-3 h-3" />
                  <span>Offline</span>
                </Button>
                
                {onViewDetails ? (
                  <button
                    onClick={() => onViewDetails(agent.agent_id)}
                    className="text-xs flex items-center justify-center space-x-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                ) : (
                  <Link href={`/agents/${agent.agent_id}`}>
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
            Are you sure you want to "{confirmAction?.action}" for agent {agent.name}?
          </p>
          
          {confirmAction?.action?.includes('Offline') && (
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
              <p className="text-warning-700 dark:text-warning-300 text-sm">
                ⚠️ Setting the agent offline will prevent it from receiving new task assignments.
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
              variant={confirmAction?.action?.includes('Offline') ? 'error' : 'primary'}
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
