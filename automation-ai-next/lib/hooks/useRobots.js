import useSWR from 'swr'
import { robotsApi } from '@/lib/api/robots'
import { useRobotWebSocket } from '@/lib/hooks/useWebSocket'
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

// Custom hook for managing robots
export function useRobots(params = {}) {
  const { data, error, mutate, isLoading } = useSWR(
    'robots',
    robotsApi.getAll,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  // Transform the data to match expected format
  const robots = data?.robots?.map(robot => ({
    id: robot.robot_id,
    name: robot.robot_id, // Use robot_id as name if no name provided
    brand: robot.robot_type, // Use robot_type as brand
    model: robot.robot_type, // Use robot_type as model for now
    status: robot.status, // Use the actual status from the service
    is_connected: robot.status === 'online', // Derive connection status from status
    capabilities: robot.capabilities || [],
    last_seen: robot.last_heartbeat || new Date().toISOString(),
  })) || []

  return {
    robots,
    totalCount: data?.total_count || 0,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for a single robot with WebSocket updates
export function useRobot(id) {
  const { robots, mutate: mutateRobots } = useRobots()
  const { robotStatus, isConnected: wsConnected } = useRobotWebSocket(id)

  // Find robot from the list
  const robot = robots.find(r => r.id === id)

  // Merge robot data with real-time status
  const robotWithStatus = robot && robotStatus ? {
    ...robot,
    status: robotStatus.status,
    current_position: robotStatus.current_position,
    battery_level: robotStatus.battery_level,
    error_codes: robotStatus.error_codes || [],
    last_updated: robotStatus.last_updated
  } : robot

  return {
    robot: robotWithStatus,
    isLoading: !robot,
    error: null,
    mutate: mutateRobots,
    wsConnected
  }
}

// Custom hook for robot status with WebSocket
export function useRobotStatus(id) {
  const { robotStatus, isConnected } = useRobotWebSocket(id)
  const [lastFetch, setLastFetch] = useState(null)

  // Fallback to API if WebSocket is not connected
  const { data: apiStatus, error, mutate, isLoading } = useSWR(
    id && !isConnected ? ['robot-status', id] : null,
    () => robotsApi.getStatus(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: isConnected ? 0 : 5000, // Only poll if WebSocket is not connected
    }
  )

  // Use WebSocket data if available, otherwise use API data
  const status = robotStatus || apiStatus

  useEffect(() => {
    if (status) {
      setLastFetch(new Date().toISOString())
    }
  }, [status])

  return {
    status,
    isLoading: !status && isLoading,
    error,
    mutate,
    isConnected,
    lastFetch
  }
}

// Custom hook for robot operations
export function useRobotOperations() {
  const [loading, setLoading] = useState(false)

  const registerRobot = useCallback(async (robotConfig) => {
    setLoading(true)
    try {
      const result = await robotsApi.register(robotConfig)
      toast.success('Robot registered successfully')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to register robot')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const unregisterRobot = useCallback(async (id) => {
    setLoading(true)
    try {
      await robotsApi.unregister(id)
      toast.success('Robot unregistered successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to unregister robot')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const emergencyStop = useCallback(async (id) => {
    setLoading(true)
    try {
      await robotsApi.emergencyStop(id)
      toast.success('Emergency stop activated')
    } catch (error) {
      toast.error(error.message || 'Failed to activate emergency stop')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const moveToPosition = useCallback(async (id, position, options = {}) => {
    setLoading(true)
    try {
      const result = await robotsApi.moveToPosition(id, position, options)
      toast.success('Movement command sent')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to send movement command')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const moveHome = useCallback(async (id, options = {}) => {
    setLoading(true)
    try {
      const result = await robotsApi.moveHome(id, options)
      toast.success('Home command sent')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to send home command')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const pickObject = useCallback(async (id, objectParams, options = {}) => {
    setLoading(true)
    try {
      const result = await robotsApi.pickObject(id, objectParams, options)
      toast.success('Pick command sent')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to send pick command')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const placeObject = useCallback(async (id, placeParams, options = {}) => {
    setLoading(true)
    try {
      const result = await robotsApi.placeObject(id, placeParams, options)
      toast.success('Place command sent')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to send place command')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const calibrate = useCallback(async (id, calibrationType, parameters = {}) => {
    setLoading(true)
    try {
      const result = await robotsApi.calibrate(id, calibrationType, parameters)
      toast.success('Calibration started')
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to start calibration')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    createRobot,
    updateRobot,
    deleteRobot,
    connectRobot,
    disconnectRobot,
    emergencyStop,
    moveToPosition,
    moveHome,
    pickObject,
    placeObject,
    calibrate,
  }
}

// Custom hook for fleet management
export function useFleet() {
  const { robots, isLoading: robotsLoading, error: robotsError, mutate: mutateRobots } = useRobots()

  // Calculate fleet overview from robots data
  const overview = robots ? robotsApi.getFleetOverview(robots) : null
  const overviewError = robotsError
  const mutateOverview = mutateRobots

  // For status, we'll use the same robots data but format it differently
  const status = robots ? robots.map(robot => ({
    robot_id: robot.id,
    status: robot.status,
    last_updated: robot.last_seen,
    is_connected: robot.is_connected
  })) : null
  const statusError = robotsError
  const mutateStatus = mutateRobots

  const [loading, setLoading] = useState(false)

  const executeFleetCommand = useCallback(async (robotIds, command) => {
    setLoading(true)
    try {
      const result = await robotsApi.executeFleetCommand(robotIds, command)
      toast.success(`Fleet command sent to ${robotIds.length} robots`)
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to send fleet command')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkConnect = useCallback(async (robotIds) => {
    setLoading(true)
    try {
      await robotsApi.bulkConnect(robotIds)
      toast.success(`Connected ${robotIds.length} robots`)
      mutateStatus()
    } catch (error) {
      toast.error(error.message || 'Failed to connect robots')
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutateStatus])

  const bulkDisconnect = useCallback(async (robotIds) => {
    setLoading(true)
    try {
      await robotsApi.bulkDisconnect(robotIds)
      toast.success(`Disconnected ${robotIds.length} robots`)
      mutateStatus()
    } catch (error) {
      toast.error(error.message || 'Failed to disconnect robots')
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutateStatus])

  const bulkEmergencyStop = useCallback(async (robotIds) => {
    setLoading(true)
    try {
      await robotsApi.bulkEmergencyStop(robotIds)
      toast.success(`Emergency stop activated for ${robotIds.length} robots`)
      mutateStatus()
    } catch (error) {
      toast.error(error.message || 'Failed to activate emergency stop')
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutateStatus])

  const bulkHome = useCallback(async (robotIds) => {
    setLoading(true)
    try {
      await robotsApi.bulkHome(robotIds)
      toast.success(`Home command sent to ${robotIds.length} robots`)
      mutateStatus()
    } catch (error) {
      toast.error(error.message || 'Failed to send home command')
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutateStatus])

  return {
    overview,
    status,
    loading: robotsLoading || loading,
    overviewError,
    statusError,
    mutateOverview,
    mutateStatus,
    executeFleetCommand,
    bulkConnect,
    bulkDisconnect,
    bulkEmergencyStop,
    bulkHome,
  }
}

// Custom hook for robot alerts
export function useRobotAlerts(params = {}) {
  const { data, error, mutate, isLoading } = useSWR(
    ['robot-alerts', params],
    () => robotsApi.getAlerts(params),
    {
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  )

  const [loading, setLoading] = useState(false)

  const acknowledgeAlert = useCallback(async (alertId) => {
    setLoading(true)
    try {
      await robotsApi.acknowledgeAlert(alertId)
      toast.success('Alert acknowledged')
      mutate()
    } catch (error) {
      toast.error(error.message || 'Failed to acknowledge alert')
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutate])

  const resolveAlert = useCallback(async (alertId) => {
    setLoading(true)
    try {
      await robotsApi.resolveAlert(alertId)
      toast.success('Alert resolved')
      mutate()
    } catch (error) {
      toast.error(error.message || 'Failed to resolve alert')
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutate])

  return {
    alerts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    loading,
    mutate,
    acknowledgeAlert,
    resolveAlert,
  }
}
