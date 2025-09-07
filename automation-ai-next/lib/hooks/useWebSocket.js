import { useState, useEffect, useRef, useCallback } from 'react'

export function useWebSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  
  const ws = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const maxReconnectAttempts = options.maxReconnectAttempts || 5
  const reconnectInterval = options.reconnectInterval || 3000

  const connect = useCallback(() => {
    try {
      // Disable WebSocket connections for now to prevent errors
      if (process.env.NODE_ENV === 'development') {
        console.log('WebSocket connections disabled in development mode')
        setIsConnected(false)
        setError(null)
        return
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8002'
      const fullUrl = url.startsWith('ws') ? url : `${wsUrl}${url}`

      ws.current = new WebSocket(fullUrl)
      
      ws.current.onopen = () => {
        console.log('WebSocket connected:', fullUrl)
        setIsConnected(true)
        setError(null)
        setConnectionAttempts(0)
      }
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage({
            data,
            timestamp: new Date().toISOString()
          })
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
          setLastMessage({
            data: event.data,
            timestamp: new Date().toISOString()
          })
        }
      }
      
      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && connectionAttempts < maxReconnectAttempts) {
          setConnectionAttempts(prev => prev + 1)
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${connectionAttempts + 1}/${maxReconnectAttempts})`)
            connect()
          }, reconnectInterval)
        }
      }
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError(error)
        setIsConnected(false)
      }
      
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError(err)
    }
  }, [url, connectionAttempts, maxReconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect')
      ws.current = null
    }
    
    setIsConnected(false)
    setConnectionAttempts(0)
  }, [])

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message)
      ws.current.send(messageStr)
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (url) {
      connect()
    }
    
    return () => {
      disconnect()
    }
  }, [url, connect, disconnect])

  return {
    isConnected,
    lastMessage,
    error,
    connectionAttempts,
    sendMessage,
    connect,
    disconnect
  }
}

// Specialized hook for robot WebSocket connections
export function useRobotWebSocket(robotId) {
  const { isConnected, lastMessage, error, sendMessage } = useWebSocket(
    robotId ? `/ws/robots/${robotId}` : null,
    {
      maxReconnectAttempts: 5,
      reconnectInterval: 3000
    }
  )

  const [robotStatus, setRobotStatus] = useState(null)

  useEffect(() => {
    if (lastMessage?.data) {
      // Handle different message types
      if (lastMessage.data.error) {
        console.error('Robot WebSocket error:', lastMessage.data.error)
      } else {
        // Assume it's a status update
        setRobotStatus(lastMessage.data)
      }
    }
  }, [lastMessage])

  return {
    isConnected,
    robotStatus,
    error,
    sendMessage,
    lastMessage
  }
}

// Hook for fleet-wide WebSocket connections
export function useFleetWebSocket() {
  const [robotConnections, setRobotConnections] = useState(new Map())
  const [fleetStatus, setFleetStatus] = useState(new Map())

  const connectToRobot = useCallback((robotId) => {
    if (!robotConnections.has(robotId)) {
      const connection = useRobotWebSocket(robotId)
      setRobotConnections(prev => new Map(prev).set(robotId, connection))
    }
  }, [robotConnections])

  const disconnectFromRobot = useCallback((robotId) => {
    const connection = robotConnections.get(robotId)
    if (connection) {
      connection.disconnect()
      setRobotConnections(prev => {
        const newMap = new Map(prev)
        newMap.delete(robotId)
        return newMap
      })
      setFleetStatus(prev => {
        const newMap = new Map(prev)
        newMap.delete(robotId)
        return newMap
      })
    }
  }, [robotConnections])

  const connectToFleet = useCallback((robotIds) => {
    robotIds.forEach(robotId => {
      connectToRobot(robotId)
    })
  }, [connectToRobot])

  const disconnectFromFleet = useCallback(() => {
    robotConnections.forEach((connection, robotId) => {
      connection.disconnect()
    })
    setRobotConnections(new Map())
    setFleetStatus(new Map())
  }, [robotConnections])

  // Update fleet status when individual robot status changes
  useEffect(() => {
    robotConnections.forEach((connection, robotId) => {
      if (connection.robotStatus) {
        setFleetStatus(prev => new Map(prev).set(robotId, connection.robotStatus))
      }
    })
  }, [robotConnections])

  return {
    robotConnections,
    fleetStatus,
    connectToRobot,
    disconnectFromRobot,
    connectToFleet,
    disconnectFromFleet
  }
}
