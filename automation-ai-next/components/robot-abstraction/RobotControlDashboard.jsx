'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { 
  RobotIcon,
  CpuChipIcon,
  BoltIcon,
  HomeIcon,
  StopIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HandRaisedIcon,
  ArrowRightIcon,
  ChartBarIcon,
  WifiIcon,
  SignalIcon,
  BatteryIcon
} from '@heroicons/react/24/outline'
import {
  useRobotAbstractionService,
  useRobotManagement,
  useRobotControl,
  useRobotAnalytics
} from '@/lib/hooks/useRobotAbstraction'
import { RobotRegistration } from './RobotRegistration'
import { robotAbstractionApi } from '@/lib/api/robotAbstraction'
import { RobotBrand, CommandType, RobotStatus } from '@/types/robot-abstraction'
import toast from 'react-hot-toast'

export function RobotControlDashboard() {
  const { serviceStatus, loading: serviceLoading, checkServiceHealth, isOnline } = useRobotAbstractionService()
  const { 
    robots, 
    generateMockRobots, 
    getConnectedRobots, 
    getRobotsByBrand,
    totalRobots,
    connectedRobots 
  } = useRobotManagement()
  const { 
    currentRobot,
    robotStatus,
    commandHistory,
    selectRobot,
    executeCommand,
    emergencyStop,
    moveToPosition,
    pickObject,
    goHome,
    getRecentCommands,
    loading: controlLoading 
  } = useRobotControl()
  const { 
    analytics, 
    getBrandDistribution,
    getStatusDistribution,
    getSystemHealthScore 
  } = useRobotAnalytics()

  const [selectedTab, setSelectedTab] = useState('overview')
  const [showRegistration, setShowRegistration] = useState(false)
  const [quickCommand, setQuickCommand] = useState({
    type: CommandType.MOVE_TO_POSITION,
    x: 0,
    y: 0,
    z: 0,
    speed: 0.5
  })

  useEffect(() => {
    // Generate mock data for demonstration
    if (robots.length === 0) {
      generateMockRobots(8)
    }
  }, [robots.length, generateMockRobots])

  const handleQuickCommand = async () => {
    if (!currentRobot) {
      toast.error('Please select a robot first')
      return
    }

    switch (quickCommand.type) {
      case CommandType.MOVE_TO_POSITION:
        await moveToPosition({
          x: quickCommand.x,
          y: quickCommand.y,
          z: quickCommand.z
        }, quickCommand.speed)
        break
      case CommandType.PICK_OBJECT:
        await pickObject()
        break
      case CommandType.HOME:
        await goHome()
        break
      default:
        const command = {
          command_id: `quick_${Date.now()}`,
          command_type: quickCommand.type,
          parameters: {},
          priority: 1,
          timeout: 30
        }
        await executeCommand(command)
    }
  }

  const getServiceStatusIcon = () => {
    if (serviceLoading) return <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-500" />
    if (isOnline) return <CheckCircleIcon className="w-5 h-5 text-success-500" />
    return <ExclamationTriangleIcon className="w-5 h-5 text-error-500" />
  }

  const getRobotBrandIcon = (brand) => {
    switch (brand) {
      case RobotBrand.UNIVERSAL_ROBOTS:
        return <RobotIcon className="w-5 h-5" />
      case RobotBrand.ABB:
        return <CpuChipIcon className="w-5 h-5" />
      case RobotBrand.KUKA:
        return <BoltIcon className="w-5 h-5" />
      case RobotBrand.BOSTON_DYNAMICS:
        return <SignalIcon className="w-5 h-5" />
      default:
        return <RobotIcon className="w-5 h-5" />
    }
  }

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <WifiIcon className="w-4 h-4 text-success-500" />
      case 'disconnected':
        return <WifiIcon className="w-4 h-4 text-error-500" />
      default:
        return <WifiIcon className="w-4 h-4 text-warning-500" />
    }
  }

  const brandDistribution = getBrandDistribution()
  const statusDistribution = getStatusDistribution()
  const recentCommands = getRecentCommands(5)
  const systemHealthScore = getSystemHealthScore()

  const commandTypeOptions = [
    { value: CommandType.MOVE_TO_POSITION, label: 'Move to Position' },
    { value: CommandType.PICK_OBJECT, label: 'Pick Object' },
    { value: CommandType.PLACE_OBJECT, label: 'Place Object' },
    { value: CommandType.HOME, label: 'Go Home' },
    { value: CommandType.GET_STATUS, label: 'Get Status' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Robot Control Dashboard
          </h2>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Universal Robot Abstraction Protocol (RAP)
            </p>
            <div className="flex items-center space-x-2">
              {getServiceStatusIcon()}
              <Badge variant={isOnline ? 'success' : 'error'} size="sm">
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowRegistration(!showRegistration)}
            className="flex items-center space-x-2"
          >
            <PlayIcon className="w-4 h-4" />
            <span>{showRegistration ? 'Hide Registration' : 'Register Robot'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={checkServiceHealth}
            disabled={serviceLoading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => emergencyStop()}
            disabled={!currentRobot}
            variant="error"
            className="flex items-center space-x-2"
          >
            <StopIcon className="w-4 h-4" />
            <span>Emergency Stop</span>
          </Button>
        </div>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getServiceStatusIcon()}
                  <span className="font-medium text-gray-900 dark:text-white">
                    Robot Abstraction Protocol
                  </span>
                </div>
                <Badge variant="outline" size="sm">
                  v{serviceStatus.version || '1.0.0'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Total Robots: {totalRobots}</span>
                <span>Connected: {connectedRobots}</span>
                <span>Health: {systemHealthScore.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Robot Registration */}
      {showRegistration && (
        <RobotRegistration
          onRobotRegistered={(robot) => {
            setShowRegistration(false)
            // Refresh robot list will happen automatically via the hook
          }}
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <RobotIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Robots
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalRobots}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Connected
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {connectedRobots}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <BoltIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Commands Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.total_commands_today || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  System Health
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemHealthScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Robot Selection and Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Robot Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {robots.map((robot) => (
                <div 
                  key={robot.robot_id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    currentRobot?.robot_id === robot.robot_id 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => selectRobot(robot)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div style={{ color: robotAbstractionApi.getBrandColor(robot.brand) }}>
                        {getRobotBrandIcon(robot.brand)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {robot.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {robotAbstractionApi.formatBrandName(robot.brand)} • {robot.model}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getConnectionStatusIcon(robot.connection_info.connection_status)}
                      <Badge 
                        variant={robot.connection_info.connection_status === 'connected' ? 'success' : 'error'} 
                        size="sm"
                      >
                        {robot.connection_info.connection_status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>IP: {robot.connection_info.ip_address}</span>
                    <span>Health: {robot.maintenance_info.health_score.toFixed(0)}%</span>
                    <span>Capabilities: {robot.capabilities.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Robot Control Panel</CardTitle>
          </CardHeader>
          <CardContent>
            {currentRobot ? (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {currentRobot.name}
                    </h4>
                    <Badge 
                      variant={currentRobot.connection_info.connection_status === 'connected' ? 'success' : 'error'} 
                      size="sm"
                    >
                      {currentRobot.connection_info.connection_status}
                    </Badge>
                  </div>
                  
                  {robotStatus && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-medium">{robotAbstractionApi.formatRobotStatus(robotStatus.status)}</span>
                      </div>
                      {robotStatus.current_position && (
                        <div>
                          <span className="text-gray-500">Position:</span>
                          <span className="ml-2 font-mono text-xs">
                            {robotAbstractionApi.formatPosition(robotStatus.current_position)}
                          </span>
                        </div>
                      )}
                      {robotStatus.battery_level && (
                        <div>
                          <span className="text-gray-500">Battery:</span>
                          <span className="ml-2 font-medium">{robotStatus.battery_level.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">Quick Commands</h5>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => goHome()}
                      disabled={controlLoading}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <HomeIcon className="w-4 h-4" />
                      <span>Home</span>
                    </Button>
                    
                    <Button
                      onClick={() => pickObject()}
                      disabled={controlLoading}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <HandRaisedIcon className="w-4 h-4" />
                      <span>Pick</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Select
                      label="Command Type"
                      value={quickCommand.type}
                      onChange={(value) => setQuickCommand(prev => ({ ...prev, type: value }))}
                      options={commandTypeOptions}
                    />
                    
                    {quickCommand.type === CommandType.MOVE_TO_POSITION && (
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          label="X"
                          type="number"
                          step="0.1"
                          value={quickCommand.x}
                          onChange={(e) => setQuickCommand(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                        />
                        <Input
                          label="Y"
                          type="number"
                          step="0.1"
                          value={quickCommand.y}
                          onChange={(e) => setQuickCommand(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                        />
                        <Input
                          label="Z"
                          type="number"
                          step="0.1"
                          value={quickCommand.z}
                          onChange={(e) => setQuickCommand(prev => ({ ...prev, z: parseFloat(e.target.value) }))}
                        />
                      </div>
                    )}
                    
                    <Button
                      onClick={handleQuickCommand}
                      disabled={controlLoading}
                      loading={controlLoading}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>Execute Command</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <RobotIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a robot from the fleet to start controlling
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Brand Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Robot Brand Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(brandDistribution).map(([brand, count]) => (
              <div key={brand} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2" style={{ color: robotAbstractionApi.getBrandColor(brand) }}>
                  {getRobotBrandIcon(brand)}
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {robotAbstractionApi.formatBrandName(brand)}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Commands */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Commands</CardTitle>
            <Badge variant="outline" size="sm">
              {commandHistory.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {recentCommands.length === 0 ? (
            <div className="text-center py-8">
              <BoltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No commands executed yet. Select a robot and execute a command.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCommands.map((command) => (
                <div key={command.command_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {command.command_id}
                      </span>
                      <Badge 
                        variant={command.success ? 'success' : 'error'} 
                        size="sm"
                      >
                        {command.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {command.execution_time.toFixed(2)}s
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(command.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {command.error_message && (
                    <p className="text-sm text-error-600 bg-error-50 dark:bg-error-900/20 p-2 rounded mt-2">
                      {command.error_message}
                    </p>
                  )}
                  
                  {command.result_data && (
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      Response: {JSON.stringify(command.result_data, null, 2).slice(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
