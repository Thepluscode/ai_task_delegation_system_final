'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { RobotRegistrationForm } from '@/components/robot/RobotRegistrationForm'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  HomeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { robotsApi } from '@/lib/api/robots'
import { useRobots, useRobotOperations } from '@/lib/hooks/useRobots'
import toast from 'react-hot-toast'

export default function RobotTestPage() {
  const { robots, isLoading, mutate } = useRobots()
  const { registerRobot, unregisterRobot, loading } = useRobotOperations()
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [serviceInfo, setServiceInfo] = useState(null)
  const [healthStatus, setHealthStatus] = useState(null)
  const [testResults, setTestResults] = useState({})

  // Test service connectivity
  useEffect(() => {
    const testConnectivity = async () => {
      try {
        const health = await robotsApi.healthCheck()
        setHealthStatus(health)
        
        const info = await robotsApi.getServiceInfo()
        setServiceInfo(info)
      } catch (error) {
        console.error('Service connectivity test failed:', error)
        setHealthStatus({ status: 'error', error: error.message })
      }
    }

    testConnectivity()
  }, [])

  const testRobotCommand = async (robotId, commandType) => {
    setTestResults(prev => ({
      ...prev,
      [robotId]: { ...prev[robotId], [commandType]: 'testing' }
    }))

    try {
      let result
      switch (commandType) {
        case 'status':
          result = await robotsApi.getStatus(robotId)
          break
        case 'home':
          result = await robotsApi.moveHome(robotId)
          break
        case 'move':
          result = await robotsApi.moveToPosition(robotId, { x: 0.5, y: 0.3, z: 0.4 })
          break
        case 'emergency_stop':
          result = await robotsApi.emergencyStop(robotId)
          break
        default:
          throw new Error('Unknown command type')
      }

      setTestResults(prev => ({
        ...prev,
        [robotId]: { 
          ...prev[robotId], 
          [commandType]: { status: 'success', result } 
        }
      }))
      
      toast.success(`${commandType} command successful`)
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [robotId]: { 
          ...prev[robotId], 
          [commandType]: { status: 'error', error: error.message } 
        }
      }))
      
      toast.error(`${commandType} command failed: ${error.message}`)
    }
  }

  const handleRobotRegistration = async (robotData) => {
    await mutate() // Refresh robot list
    toast.success(`Robot ${robotData.robot_id} registered successfully`)
  }

  const handleUnregisterRobot = async (robotId) => {
    try {
      await unregisterRobot(robotId)
      await mutate()
      toast.success('Robot unregistered successfully')
    } catch (error) {
      toast.error('Failed to unregister robot')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-success-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-error-500" />
      case 'testing':
        return <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Robot Abstraction Protocol (RAP) Test
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test and validate your RAP service integration
          </p>
        </div>
        
        <Button
          onClick={() => setShowRegistrationForm(true)}
          className="flex items-center space-x-2"
        >
          <CpuChipIcon className="w-4 h-4" />
          <span>Register Robot</span>
        </Button>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Health</CardTitle>
          </CardHeader>
          <CardContent>
            {healthStatus ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {healthStatus.status === 'healthy' ? (
                    <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-error-500" />
                  )}
                  <span className="font-medium">
                    {healthStatus.status === 'healthy' ? 'Service Online' : 'Service Error'}
                  </span>
                </div>
                {healthStatus.error && (
                  <p className="text-sm text-error-600 dark:text-error-400">
                    {healthStatus.error}
                  </p>
                )}
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceInfo ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</p>
                  <p className="text-gray-900 dark:text-white">{serviceInfo.service}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</p>
                  <p className="text-gray-900 dark:text-white">{serviceInfo.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registered Robots</p>
                  <p className="text-gray-900 dark:text-white">{serviceInfo.registered_robots}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supported Brands</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {serviceInfo.supported_brands?.map((brand) => (
                      <Badge key={brand} variant="secondary" size="sm">
                        {brand.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registered Robots */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Robots ({robots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : robots.length === 0 ? (
            <div className="text-center py-8">
              <CpuChipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No robots registered. Register your first robot to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {robots.map((robot) => (
                <div
                  key={robot.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {robot.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {robot.brand.toUpperCase()} {robot.model}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={robot.is_connected ? 'success' : 'error'}
                        size="sm"
                      >
                        {robot.is_connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                      
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => handleUnregisterRobot(robot.id)}
                        disabled={loading}
                      >
                        Unregister
                      </Button>
                    </div>
                  </div>

                  {/* Test Commands */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testRobotCommand(robot.id, 'status')}
                      disabled={loading}
                      className="flex items-center space-x-2"
                    >
                      {getStatusIcon(testResults[robot.id]?.status?.status)}
                      <span>Status</span>
                    </Button>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => testRobotCommand(robot.id, 'home')}
                      disabled={loading || !robot.is_connected}
                      className="flex items-center space-x-2"
                    >
                      {getStatusIcon(testResults[robot.id]?.home?.status)}
                      <HomeIcon className="w-4 h-4" />
                      <span>Home</span>
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => testRobotCommand(robot.id, 'move')}
                      disabled={loading || !robot.is_connected}
                      className="flex items-center space-x-2"
                    >
                      {getStatusIcon(testResults[robot.id]?.move?.status)}
                      <PlayIcon className="w-4 h-4" />
                      <span>Move</span>
                    </Button>
                    
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => testRobotCommand(robot.id, 'emergency_stop')}
                      disabled={loading || !robot.is_connected}
                      className="flex items-center space-x-2"
                    >
                      {getStatusIcon(testResults[robot.id]?.emergency_stop?.status)}
                      <StopIcon className="w-4 h-4" />
                      <span>E-Stop</span>
                    </Button>
                  </div>

                  {/* Test Results */}
                  {Object.keys(testResults[robot.id] || {}).length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Test Results:
                      </p>
                      <div className="space-y-1 text-xs">
                        {Object.entries(testResults[robot.id] || {}).map(([command, result]) => (
                          <div key={command} className="flex items-center space-x-2">
                            <span className="font-medium">{command}:</span>
                            {typeof result === 'string' ? (
                              <span className="text-primary-600">{result}</span>
                            ) : (
                              <span className={
                                result.status === 'success' 
                                  ? 'text-success-600' 
                                  : 'text-error-600'
                              }>
                                {result.status === 'success' ? 'Success' : result.error}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Robot Registration Form */}
      <RobotRegistrationForm
        isOpen={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        onSuccess={handleRobotRegistration}
      />
    </div>
  )
}
