'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { 
  PlayIcon,
  PauseIcon,
  StopIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ArrowPathIcon,
  SignalIcon,
  BoltIcon, // Using BoltIcon instead of BatteryIcon
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useRobot, useRobotStatus, useRobotOperations } from '@/lib/hooks/useRobots'
import { getStatusColor, formatRelativeTime } from '@/lib/utils/helpers'

export function RobotControlPanel({ robotId, onClose }) {
  const { robot, isLoading: robotLoading, mutate: mutateRobot } = useRobot(robotId)
  const { status, isLoading: statusLoading, mutate: mutateStatus } = useRobotStatus(robotId)
  const {
    loading,
    connectRobot,
    disconnectRobot,
    emergencyStop,
    moveToPosition,
    moveHome,
    pickObject,
    placeObject,
    calibrate
  } = useRobotOperations()

  const [showPositionModal, setShowPositionModal] = useState(false)
  const [showPickModal, setShowPickModal] = useState(false)
  const [showPlaceModal, setShowPlaceModal] = useState(false)
  const [showCalibrateModal, setShowCalibrateModal] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 })
  const [speed, setSpeed] = useState(0.5)

  // Auto-refresh status
  useEffect(() => {
    const interval = setInterval(() => {
      mutateStatus()
    }, 2000)
    return () => clearInterval(interval)
  }, [mutateStatus])

  const handleConnect = async () => {
    try {
      await connectRobot(robotId)
      mutateRobot()
      mutateStatus()
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectRobot(robotId)
      mutateRobot()
      mutateStatus()
    } catch (error) {
      console.error('Disconnection failed:', error)
    }
  }

  const handleEmergencyStop = async () => {
    try {
      await emergencyStop(robotId)
      mutateStatus()
    } catch (error) {
      console.error('Emergency stop failed:', error)
    }
  }

  const handleMoveHome = async () => {
    try {
      await moveHome(robotId, { speed })
      mutateStatus()
    } catch (error) {
      console.error('Move home failed:', error)
    }
  }

  const handleMoveToPosition = async () => {
    try {
      await moveToPosition(robotId, position, { speed })
      setShowPositionModal(false)
      mutateStatus()
    } catch (error) {
      console.error('Move to position failed:', error)
    }
  }

  const handlePickObject = async (objectParams) => {
    try {
      await pickObject(robotId, objectParams)
      setShowPickModal(false)
      mutateStatus()
    } catch (error) {
      console.error('Pick object failed:', error)
    }
  }

  const handlePlaceObject = async (placeParams) => {
    try {
      await placeObject(robotId, placeParams)
      setShowPlaceModal(false)
      mutateStatus()
    } catch (error) {
      console.error('Place object failed:', error)
    }
  }

  const handleCalibrate = async (calibrationType, parameters) => {
    try {
      await calibrate(robotId, calibrationType, parameters)
      setShowCalibrateModal(false)
      mutateStatus()
    } catch (error) {
      console.error('Calibration failed:', error)
    }
  }

  if (robotLoading || statusLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!robot || !status) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Robot Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load robot information. Please check the robot ID and try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  const isConnected = status.status !== 'offline'
  const canControl = isConnected && status.status !== 'error' && status.status !== 'emergency_stop'

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <CardTitle className="text-2xl">{robot.name}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  {robot.brand.toUpperCase()} {robot.model}
                </p>
              </div>
              <Badge variant={getStatusColor(status.status)} size="lg">
                {status.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isConnected ? 'error' : 'success'}
                onClick={isConnected ? handleDisconnect : handleConnect}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <SignalIcon className="w-4 h-4" />
                <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
              </Button>
              
              <Button
                variant="error"
                onClick={handleEmergencyStop}
                disabled={!isConnected || loading}
                className="flex items-center space-x-2"
              >
                <StopIcon className="w-4 h-4" />
                <span>E-STOP</span>
              </Button>
              
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Connection</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`} />
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            {status.current_position && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 block mb-2">Current Position</span>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>X: {status.current_position.x.toFixed(3)}</div>
                  <div>Y: {status.current_position.y.toFixed(3)}</div>
                  <div>Z: {status.current_position.z.toFixed(3)}</div>
                </div>
              </div>
            )}
            
            {status.battery_level !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Battery</span>
                <div className="flex items-center space-x-2">
                  <BoltIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{status.battery_level}%</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span className="text-sm">{formatRelativeTime(status.last_updated)}</span>
              </div>
            </div>
            
            {status.error_codes && status.error_codes.length > 0 && (
              <div>
                <span className="text-error-600 dark:text-error-400 block mb-2">Error Codes</span>
                <div className="space-y-1">
                  {status.error_codes.map((code, index) => (
                    <Badge key={index} variant="error" size="sm">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movement Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Movement Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speed: {(speed * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
                disabled={!canControl}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                onClick={handleMoveHome}
                disabled={!canControl || loading}
                className="flex items-center justify-center space-x-2"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setShowPositionModal(true)}
                disabled={!canControl || loading}
                className="flex items-center justify-center space-x-2"
              >
                <MapPinIcon className="w-4 h-4" />
                <span>Move To</span>
              </Button>
              
              <Button
                variant="success"
                onClick={() => setShowPickModal(true)}
                disabled={!canControl || loading}
                className="flex items-center justify-center space-x-2"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Pick</span>
              </Button>
              
              <Button
                variant="warning"
                onClick={() => setShowPlaceModal(true)}
                disabled={!canControl || loading}
                className="flex items-center justify-center space-x-2"
              >
                <PauseIcon className="w-4 h-4" />
                <span>Place</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Controls */}
        <Card>
          <CardHeader>
            <CardTitle>System Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowCalibrateModal(true)}
              disabled={!canControl || loading}
              className="w-full flex items-center justify-center space-x-2"
            >
              <CogIcon className="w-4 h-4" />
              <span>Calibrate</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                mutateRobot()
                mutateStatus()
              }}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            
            {status.capabilities && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 block mb-2">Capabilities</span>
                <div className="flex flex-wrap gap-1">
                  {status.capabilities.map((capability, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {capability.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Position Modal */}
      <Modal
        isOpen={showPositionModal}
        onClose={() => setShowPositionModal(false)}
        title="Move to Position"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="X (m)"
              type="number"
              step="0.001"
              value={position.x}
              onChange={(e) => setPosition(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Y (m)"
              type="number"
              step="0.001"
              value={position.y}
              onChange={(e) => setPosition(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Z (m)"
              type="number"
              step="0.001"
              value={position.z}
              onChange={(e) => setPosition(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="RX (rad)"
              type="number"
              step="0.01"
              value={position.rx}
              onChange={(e) => setPosition(prev => ({ ...prev, rx: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="RY (rad)"
              type="number"
              step="0.01"
              value={position.ry}
              onChange={(e) => setPosition(prev => ({ ...prev, ry: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="RZ (rad)"
              type="number"
              step="0.01"
              value={position.rz}
              onChange={(e) => setPosition(prev => ({ ...prev, rz: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPositionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleMoveToPosition}
              loading={loading}
            >
              Move
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
