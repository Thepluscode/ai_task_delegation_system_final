'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  CpuChipIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  HomeIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useRobotAbstraction } from '@/lib/hooks/useRobotAbstraction'
import { robotAbstractionApi } from '@/lib/api/robotAbstraction'
import { RobotBrand, RobotStatus, CommandType, PrecisionLevel, ObjectType } from '@/types/robot-abstraction'

export function RobotAbstractionDashboard() {
  const {
    robots,
    loading,
    error,
    loadRobots,
    executeCommand,
    getPerformanceStats,
    recentCommands
  } = useRobotAbstraction()

  const [selectedRobot, setSelectedRobot] = useState(null)
  const [commandInProgress, setCommandInProgress] = useState(false)
  const [performanceStats, setPerformanceStats] = useState(null)

  useEffect(() => {
    loadRobots()
    loadPerformanceStats()
  }, [])

  const loadPerformanceStats = async () => {
    try {
      const stats = await getPerformanceStats()
      setPerformanceStats(stats)
    } catch (err) {
      console.error('Failed to load performance stats:', err)
    }
  }

  const handleRobotSelect = (robot) => {
    setSelectedRobot(robot)
  }

  const handleCommand = async (commandType, parameters = {}) => {
    if (!selectedRobot) return

    setCommandInProgress(true)
    try {
      await executeCommand(selectedRobot.robot_id, commandType, parameters)
      await loadRobots() // Refresh robot status
    } catch (err) {
      console.error('Command failed:', err)
    } finally {
      setCommandInProgress(false)
    }
  }

  const getRobotStatusIcon = (status) => {
    switch (status) {
      case RobotStatus.IDLE:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case RobotStatus.MOVING:
      case RobotStatus.WORKING:
        return <CogIcon className="w-5 h-5 text-blue-500 animate-spin" />
      case RobotStatus.ERROR:
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case RobotStatus.EMERGENCY_STOP:
        return <StopIcon className="w-5 h-5 text-red-600" />
      case RobotStatus.MAINTENANCE:
        return <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <CpuChipIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getBrandColor = (brand) => {
    const colors = {
      [RobotBrand.UNIVERSAL_ROBOTS]: '#0066CC',
      [RobotBrand.ABB]: '#FF6600',
      [RobotBrand.KUKA]: '#FF8C00',
      [RobotBrand.FANUC]: '#FFD700',
      [RobotBrand.BOSTON_DYNAMICS]: '#1E90FF',
      [RobotBrand.CUSTOM]: '#6B7280'
    }
    return colors[brand] || '#6B7280'
  }

  const formatBrandName = (brand) => {
    return robotAbstractionApi.formatBrandName(brand)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Robot Abstraction Protocol (RAP)
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Universal robot control interface supporting multiple manufacturers
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" size="sm">
            {robots.length} Robots Connected
          </Badge>
          <Button
            variant="outline"
            onClick={loadRobots}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <CogIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      {performanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <CpuChipIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Commands
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performanceStats.total_commands}
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
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performanceStats.success_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Execution Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performanceStats.avg_execution_time.toFixed(0)}ms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <BoltIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Robots
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performanceStats.active_robots}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Robot Grid and Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Robot List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Connected Robots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {robots.map((robot) => (
                  <div
                    key={robot.robot_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRobot?.robot_id === robot.robot_id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => handleRobotSelect(robot)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getRobotStatusIcon(robot.status)}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {robot.name}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        size="sm"
                        style={{ color: getBrandColor(robot.brand) }}
                      >
                        {formatBrandName(robot.brand)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Model:</span>
                        <span className="text-gray-900 dark:text-white">{robot.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Badge variant="outline" size="sm">
                          {robot.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">IP:</span>
                        <span className="text-gray-900 dark:text-white">{robot.ip_address}</span>
                      </div>
                      {robot.capabilities && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payload:</span>
                          <span className="text-gray-900 dark:text-white">
                            {robot.capabilities.max_payload}kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {robots.length === 0 && (
                <div className="text-center py-8">
                  <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No robots connected
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Register robots to start controlling them
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Robot Control</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRobot ? (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {selectedRobot.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getRobotStatusIcon(selectedRobot.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedRobot.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleCommand(CommandType.HOME_POSITION)}
                      disabled={commandInProgress || selectedRobot.status === RobotStatus.ERROR}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <HomeIcon className="w-4 h-4" />
                      <span>Home Position</span>
                    </Button>

                    <Button
                      onClick={() => handleCommand(CommandType.MOVE_TO_POSITION, {
                        coordinates: [400, 0, 300, 0, 0, 0],
                        speed: 50,
                        precision: PrecisionLevel.FINE
                      })}
                      disabled={commandInProgress || selectedRobot.status === RobotStatus.ERROR}
                      className="w-full flex items-center justify-center space-x-2"
                      variant="outline"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>Test Move</span>
                    </Button>

                    <Button
                      onClick={() => handleCommand(CommandType.PICK_OBJECT, {
                        coordinates: [400, 0, 100, 0, 0, 0],
                        grip_force: 50,
                        object_type: ObjectType.STANDARD,
                        approach_height: 50
                      })}
                      disabled={commandInProgress || selectedRobot.status === RobotStatus.ERROR}
                      className="w-full flex items-center justify-center space-x-2"
                      variant="outline"
                    >
                      <CogIcon className="w-4 h-4" />
                      <span>Test Pick</span>
                    </Button>

                    <Button
                      onClick={() => handleCommand(CommandType.EMERGENCY_STOP)}
                      disabled={commandInProgress}
                      className="w-full flex items-center justify-center space-x-2"
                      variant="destructive"
                    >
                      <StopIcon className="w-4 h-4" />
                      <span>Emergency Stop</span>
                    </Button>
                  </div>

                  {selectedRobot.capabilities && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                        Capabilities
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reach:</span>
                          <span className="text-gray-900 dark:text-white">
                            {selectedRobot.capabilities.reach_radius}mm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Precision:</span>
                          <span className="text-gray-900 dark:text-white">
                            ±{selectedRobot.capabilities.precision_rating}mm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">DOF:</span>
                          <span className="text-gray-900 dark:text-white">
                            {selectedRobot.capabilities.degrees_of_freedom}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a robot to control
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentCommands.slice(0, 10).map((command) => (
              <div key={command.command_id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {command.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {command.command_type?.replace('_', ' ').toUpperCase() || 'Unknown Command'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Robot: {command.robot_id}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {command.execution_time_ms.toFixed(0)}ms
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(command.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {recentCommands.length === 0 && (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No recent commands
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
