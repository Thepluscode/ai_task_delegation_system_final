/**
 * React Hooks for Robot Abstraction Protocol (RAP)
 * Universal interface for controlling diverse robot platforms
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { robotAbstractionApi } from '@/lib/api/robotAbstraction'
import { 
  RobotInfo,
  RobotConfig,
  RAPCommand,
  CommandResult,
  RobotStatusResponse,
  SystemAnalytics,
  RobotBrand,
  CommandType,
  RobotStatus,
  Position,
  Workflow,
  ExecuteWorkflowResponse
} from '@/types/robot-abstraction'
import toast from 'react-hot-toast'

// Service Status Hook
export function useRobotAbstractionService() {
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkServiceHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [health, info] = await Promise.all([
        robotAbstractionApi.getHealth(),
        robotAbstractionApi.getServiceInfo()
      ])
      
      setServiceStatus({
        ...health,
        ...info,
        last_updated: new Date().toISOString()
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Service unavailable'
      setError(errorMessage)
      setServiceStatus({
        status: 'offline',
        version: 'unknown',
        last_updated: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkServiceHealth()
    
    // Check service health every 30 seconds
    const interval = setInterval(checkServiceHealth, 30000)
    return () => clearInterval(interval)
  }, [checkServiceHealth])

  return {
    serviceStatus,
    loading,
    error,
    checkServiceHealth,
    isOnline: serviceStatus?.status === 'healthy'
  }
}

// Robot Management Hook
export function useRobotManagement() {
  const [robots, setRobots] = useState<RobotInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRobots = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await robotAbstractionApi.listRobots()
      // Convert the API response to RobotInfo format
      const robotInfoList = response.robots.map(robot => ({
        robot_id: robot.robot_id,
        brand: robot.brand,
        model: robot.model,
        name: `${robotAbstractionApi.formatBrandName(robot.brand)} ${robot.model}`,
        description: `${robot.model} robot for automation tasks`,
        capabilities: robot.capabilities || [],
        specifications: robotAbstractionApi.generateMockSpecifications(robot.brand),
        connection_info: {
          ip_address: '192.168.1.100',
          port: 502,
          protocol: 'tcp',
          connection_status: robot.is_connected ? 'connected' : 'disconnected',
          last_connected: new Date().toISOString(),
          connection_quality: robot.is_connected ? 95 : 0
        },
        safety_features: {
          emergency_stop: true,
          collision_detection: true,
          force_limiting: robot.brand === 'universal_robots',
          safety_zones: true,
          collaborative_mode: robot.brand === 'universal_robots',
          safety_rating: 'PLd'
        },
        maintenance_info: {
          last_maintenance: new Date(Date.now() - 86400000).toISOString(),
          next_maintenance: new Date(Date.now() + 2592000000).toISOString(),
          operating_hours: Math.floor(Math.random() * 5000),
          maintenance_alerts: [],
          health_score: 85 + Math.random() * 15
        }
      }))
      setRobots(robotInfoList)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load robots'
      setError(errorMessage)
      // Use mock data as fallback
      const mockRobots = robotAbstractionApi.generateMockRobots(6)
      setRobots(mockRobots)
    } finally {
      setLoading(false)
    }
  }, [])

  const registerRobot = useCallback(async (robotConfig: RobotConfig) => {
    setLoading(true)
    setError(null)
    try {
      const result = await robotAbstractionApi.registerRobot(robotConfig)
      if (result.success) {
        await loadRobots() // Refresh robot list
        toast.success(`Robot ${robotConfig.robot_id} registered successfully`)
        return true
      } else {
        throw new Error(result.message || 'Registration failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register robot'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadRobots])

  const unregisterRobot = useCallback(async (robotId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await robotAbstractionApi.unregisterRobot(robotId)
      if (result.success) {
        await loadRobots() // Refresh robot list
        toast.success(`Robot ${robotId} unregistered`)
        return true
      } else {
        throw new Error(result.message || 'Unregistration failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unregister robot'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadRobots])

  const generateMockRobots = useCallback((count: number = 6) => {
    const mockRobots = robotAbstractionApi.generateMockRobots(count)
    setRobots(mockRobots)
    return mockRobots
  }, [])

  const getRobotsByBrand = useCallback((brand: RobotBrand) => {
    return robots.filter(robot => robot.brand === brand)
  }, [robots])

  const getConnectedRobots = useCallback(() => {
    return robots.filter(robot => robot.connection_info.connection_status === 'connected')
  }, [robots])

  const getRobotsByStatus = useCallback((status: RobotStatus) => {
    return robots.filter(robot => {
      // Map connection status to robot status for filtering
      if (robot.connection_info.connection_status === 'disconnected') {
        return status === RobotStatus.OFFLINE
      }
      // For connected robots, assume they're idle unless specified otherwise
      return status === RobotStatus.IDLE
    })
  }, [robots])

  useEffect(() => {
    loadRobots()
  }, [loadRobots])

  return {
    robots,
    loading,
    error,
    loadRobots,
    registerRobot,
    unregisterRobot,
    generateMockRobots,
    getRobotsByBrand,
    getConnectedRobots,
    getRobotsByStatus,
    totalRobots: robots.length,
    connectedRobots: getConnectedRobots().length
  }
}

// Robot Control Hook
export function useRobotControl(robotId?: string) {
  const [currentRobot, setCurrentRobot] = useState<RobotInfo | null>(null)
  const [robotStatus, setRobotStatus] = useState<RobotStatusResponse | null>(null)
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectRobot = useCallback((robot: RobotInfo) => {
    setCurrentRobot(robot)
    setCommandHistory([])
    setError(null)
  }, [])

  const getRobotStatus = useCallback(async (targetRobotId?: string) => {
    const id = targetRobotId || robotId || currentRobot?.robot_id
    if (!id) return null

    try {
      const status = await robotAbstractionApi.getRobotStatus(id)
      setRobotStatus(status)
      return status
    } catch (err) {
      console.error('Failed to get robot status:', err)
      return null
    }
  }, [robotId, currentRobot])

  const executeCommand = useCallback(async (command: RAPCommand, targetRobotId?: string) => {
    const id = targetRobotId || robotId || currentRobot?.robot_id
    if (!id) {
      toast.error('No robot selected')
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const result = await robotAbstractionApi.executeCommand(id, command)
      setCommandHistory(prev => [result, ...prev.slice(0, 49)]) // Keep last 50 commands
      
      if (result.success) {
        toast.success(`Command executed: ${robotAbstractionApi.formatCommandType(command.command_type)}`)
      } else {
        toast.error(`Command failed: ${result.error_message}`)
      }
      
      // Refresh robot status after command
      await getRobotStatus(id)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Command execution failed'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [robotId, currentRobot, getRobotStatus])

  const executeWorkflow = useCallback(async (workflow: Workflow, targetRobotId?: string) => {
    const id = targetRobotId || robotId || currentRobot?.robot_id
    if (!id) {
      toast.error('No robot selected')
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const result = await robotAbstractionApi.executeWorkflow(id, workflow)
      toast.success(`Workflow started: ${workflow.name}`)
      
      // Refresh robot status
      await getRobotStatus(id)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Workflow execution failed'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [robotId, currentRobot, getRobotStatus])

  const emergencyStop = useCallback(async (targetRobotId?: string) => {
    const id = targetRobotId || robotId || currentRobot?.robot_id
    if (!id) {
      toast.error('No robot selected')
      return null
    }

    try {
      const result = await robotAbstractionApi.emergencyStop(id)
      if (result.success) {
        toast.success('Emergency stop executed')
      } else {
        toast.error('Emergency stop failed')
      }
      
      // Refresh robot status
      await getRobotStatus(id)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Emergency stop failed'
      toast.error(errorMessage)
      return null
    }
  }, [robotId, currentRobot, getRobotStatus])

  // Quick command helpers using direct API endpoints
  const moveToPosition = useCallback(async (position: Position, speed: number = 0.5) => {
    const id = robotId || currentRobot?.robot_id
    if (!id) {
      toast.error('No robot selected')
      return null
    }

    setLoading(true)
    try {
      const result = await robotAbstractionApi.moveRobot(id, position, speed)
      setCommandHistory(prev => [result, ...prev.slice(0, 49)])

      if (result.success) {
        toast.success('Move command executed')
      } else {
        toast.error(`Move failed: ${result.error_message}`)
      }

      await getRobotStatus(id)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Move command failed'
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [robotId, currentRobot, getRobotStatus])

  const pickObject = useCallback(async (objectId?: string, gripForce: number = 50) => {
    const id = robotId || currentRobot?.robot_id
    if (!id) {
      toast.error('No robot selected')
      return null
    }

    setLoading(true)
    try {
      const result = await robotAbstractionApi.pickObject(id, objectId || 'default_object', gripForce)
      setCommandHistory(prev => [result, ...prev.slice(0, 49)])

      if (result.success) {
        toast.success('Pick command executed')
      } else {
        toast.error(`Pick failed: ${result.error_message}`)
      }

      await getRobotStatus(id)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pick command failed'
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [robotId, currentRobot, getRobotStatus])

  const placeObject = useCallback(async (position: Position, objectId?: string) => {
    // For now, use move command as place command
    return moveToPosition(position)
  }, [moveToPosition])

  const goHome = useCallback(async () => {
    const id = robotId || currentRobot?.robot_id
    if (!id) {
      toast.error('No robot selected')
      return null
    }

    setLoading(true)
    try {
      const result = await robotAbstractionApi.homeRobot(id)
      setCommandHistory(prev => [result, ...prev.slice(0, 49)])

      if (result.success) {
        toast.success('Home command executed')
      } else {
        toast.error(`Home failed: ${result.error_message}`)
      }

      await getRobotStatus(id)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Home command failed'
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [robotId, currentRobot, getRobotStatus])

  const getRecentCommands = useCallback((count: number = 10) => {
    return commandHistory.slice(0, count)
  }, [commandHistory])

  const clearCommandHistory = useCallback(() => {
    setCommandHistory([])
  }, [])

  // Auto-refresh robot status
  useEffect(() => {
    if (currentRobot || robotId) {
      getRobotStatus()
      
      const interval = setInterval(() => {
        getRobotStatus()
      }, 5000) // Refresh every 5 seconds
      
      return () => clearInterval(interval)
    }
  }, [currentRobot, robotId, getRobotStatus])

  return {
    currentRobot,
    robotStatus,
    commandHistory,
    loading,
    error,
    selectRobot,
    getRobotStatus,
    executeCommand,
    executeWorkflow,
    emergencyStop,
    moveToPosition,
    pickObject,
    placeObject,
    goHome,
    getRecentCommands,
    clearCommandHistory
  }
}

// System Analytics Hook
export function useRobotAnalytics() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const systemAnalytics = await robotAbstractionApi.getSystemAnalytics()
      setAnalytics(systemAnalytics)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
      setError(errorMessage)
      // Use mock data as fallback
      const mockAnalytics = robotAbstractionApi.generateMockSystemAnalytics()
      setAnalytics(mockAnalytics)
    } finally {
      setLoading(false)
    }
  }, [])

  const startRealTimeUpdates = useCallback((intervalMs: number = 30000) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    loadAnalytics() // Initial load
    intervalRef.current = setInterval(loadAnalytics, intervalMs)
  }, [loadAnalytics])

  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
    return () => stopRealTimeUpdates()
  }, [loadAnalytics, stopRealTimeUpdates])

  const getBrandDistribution = useCallback(() => {
    return analytics?.brand_distribution || {}
  }, [analytics])

  const getStatusDistribution = useCallback(() => {
    return analytics?.status_distribution || {}
  }, [analytics])

  const getTopCapabilities = useCallback((count: number = 5) => {
    if (!analytics?.capability_coverage) return []
    
    return Object.entries(analytics.capability_coverage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([capability, robotCount]) => ({ capability, robotCount }))
  }, [analytics])

  const getSystemHealthScore = useCallback(() => {
    if (!analytics) return 0
    
    const efficiency = analytics.system_efficiency * 100
    const activeRatio = (analytics.active_robots / analytics.total_robots) * 100
    const responseTime = Math.max(0, 100 - (analytics.average_response_time * 100))
    
    return (efficiency * 0.4 + activeRatio * 0.3 + responseTime * 0.3)
  }, [analytics])

  return {
    analytics,
    loading,
    error,
    loadAnalytics,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    getBrandDistribution,
    getStatusDistribution,
    getTopCapabilities,
    getSystemHealthScore,
    isRealTimeActive: intervalRef.current !== null
  }
}

// Real-time Updates Hook
export function useRobotRealTimeUpdates(robotId?: string) {
  const [updates, setUpdates] = useState<any[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback((targetRobotId?: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const id = targetRobotId || robotId
    if (!id) {
      console.warn('No robot ID provided for WebSocket connection')
      return
    }

    const ws = robotAbstractionApi.subscribeToRobotUpdates(id, (data) => {
      setUpdates(prev => [{ ...data, timestamp: new Date().toISOString() }, ...prev.slice(0, 99)])
    })

    if (ws) {
      wsRef.current = ws
      ws.onopen = () => setConnected(true)
      ws.onclose = () => setConnected(false)
      ws.onerror = () => setConnected(false)
    }
  }, [robotId])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
  }, [])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  useEffect(() => {
    if (robotId) {
      connect(robotId)
    }
    return () => disconnect()
  }, [robotId, connect, disconnect])

  return {
    updates,
    connected,
    connect,
    disconnect,
    clearUpdates
  }
}

// Hook for monitoring all robots
export function useAllRobotsRealTimeUpdates() {
  const [updates, setUpdates] = useState<any[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const ws = robotAbstractionApi.subscribeToAllRobots((data) => {
      setUpdates(prev => [{ ...data, timestamp: new Date().toISOString() }, ...prev.slice(0, 99)])
    })

    if (ws) {
      wsRef.current = ws
      ws.onopen = () => setConnected(true)
      ws.onclose = () => setConnected(false)
      ws.onerror = () => setConnected(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
  }, [])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    updates,
    connected,
    connect,
    disconnect,
    clearUpdates
  }
}
