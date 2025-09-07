'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
  PlayIcon,
  StopIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  BoltIcon, // Using BoltIcon instead of BatteryIcon
  MapPinIcon,
  ClockIcon,
  CogIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useRobotOperations } from '@/lib/hooks/useRobots'
import { getStatusColor, formatRelativeTime } from '@/lib/utils/helpers'

export function RobotCard({ 
  robot, 
  selected = false, 
  onSelect, 
  showControls = true,
  onViewDetails 
}) {
  const {
    loading,
    connectRobot,
    disconnectRobot,
    emergencyStop,
    moveHome
  } = useRobotOperations()

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const isConnected = robot.status !== 'offline'
  const canControl = isConnected && robot.status !== 'error' && robot.status !== 'emergency_stop'

  const handleConnect = async () => {
    try {
      await connectRobot(robot.id)
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectRobot(robot.id)
    } catch (error) {
      console.error('Disconnection failed:', error)
    }
  }

  const handleEmergencyStop = async () => {
    try {
      await emergencyStop(robot.id)
    } catch (error) {
      console.error('Emergency stop failed:', error)
    }
  }

  const handleMoveHome = async () => {
    try {
      await moveHome(robot.id)
    } catch (error) {
      console.error('Move home failed:', error)
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

  const getBrandIcon = (brand) => {
    const icons = {
      universal_robots: '🤖',
      abb: '🏭',
      kuka: '🦾',
      fanuc: '⚙️',
      boston_dynamics: '🐕',
      custom: '🔧'
    }
    return icons[brand] || '🤖'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'idle':
        return <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
      case 'moving':
      case 'working':
        return <div className="w-2 h-2 bg-primary-500 rounded-full animate-spin" />
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-error-500" />
      case 'emergency_stop':
        return <StopIcon className="w-4 h-4 text-error-600" />
      case 'maintenance':
        return <CogIcon className="w-4 h-4 text-warning-500" />
      case 'offline':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  return (
    <>
      <Card 
        className={`transition-all duration-200 hover:shadow-lg ${
          selected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
        } ${!isConnected ? 'opacity-75' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getBrandIcon(robot.brand)}</div>
              <div>
                <CardTitle className="text-lg">{robot.name}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {robot.brand.toUpperCase()} {robot.model}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(robot.status)}
              <Badge variant={getStatusColor(robot.status)} size="sm">
                {robot.status.replace('_', ' ')}
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
          {/* Status Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <SignalIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {robot.battery_level !== undefined && (
              <div className="flex items-center space-x-2">
                <BoltIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {robot.battery_level}%
                </span>
              </div>
            )}
            
            {robot.current_position && (
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  ({robot.current_position.x.toFixed(1)}, {robot.current_position.y.toFixed(1)})
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {formatRelativeTime(robot.last_seen)}
              </span>
            </div>
          </div>

          {/* Error Codes */}
          {robot.error_codes && robot.error_codes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-error-600 dark:text-error-400 mb-2">
                Active Errors:
              </p>
              <div className="flex flex-wrap gap-1">
                {robot.error_codes.slice(0, 3).map((code, index) => (
                  <Badge key={index} variant="error" size="sm">
                    {code}
                  </Badge>
                ))}
                {robot.error_codes.length > 3 && (
                  <Badge variant="error" size="sm">
                    +{robot.error_codes.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {robot.capabilities && robot.capabilities.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capabilities:
              </p>
              <div className="flex flex-wrap gap-1">
                {robot.capabilities.slice(0, 3).map((capability, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {capability.replace('_', ' ')}
                  </Badge>
                ))}
                {robot.capabilities.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{robot.capabilities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Controls */}
          {showControls && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={isConnected ? 'error' : 'success'}
                  size="sm"
                  onClick={isConnected ? handleDisconnect : handleConnect}
                  disabled={loading}
                  className="text-xs"
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMoveHome}
                  disabled={!canControl || loading}
                  className="text-xs flex items-center justify-center space-x-1"
                >
                  <HomeIcon className="w-3 h-3" />
                  <span>Home</span>
                </Button>
                
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => confirmAndExecute('Emergency Stop', handleEmergencyStop)}
                  disabled={!isConnected || loading}
                  className="text-xs flex items-center justify-center space-x-1"
                >
                  <StopIcon className="w-3 h-3" />
                  <span>E-Stop</span>
                </Button>
                
                {onViewDetails ? (
                  <button
                    onClick={() => onViewDetails(robot.id)}
                    className="text-xs flex items-center justify-center space-x-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                ) : (
                  <Link href={`/robots/${robot.id}`}>
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
            Are you sure you want to execute "{confirmAction?.action}" on robot {robot.name}?
          </p>
          
          {confirmAction?.action === 'Emergency Stop' && (
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-3">
              <p className="text-error-700 dark:text-error-300 text-sm">
                ⚠️ This will immediately stop all robot movement and may require manual intervention to resume operation.
              </p>
            </div>
          )}
          
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            
            <Button
              variant={confirmAction?.action === 'Emergency Stop' ? 'error' : 'primary'}
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
