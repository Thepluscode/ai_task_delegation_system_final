import { apiUtils } from './client'

// Create a frontend API client for Next.js API routes
const frontendApi = {
  get: async (url, config = {}) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  post: async (url, data, config = {}) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  put: async (url, data, config = {}) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  delete: async (url, config = {}) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },
}

// Robot Abstraction Protocol (RAP) API Client
export const robotsApi = {
  // Robot Management
  getAll: async (params = {}) => {
    return frontendApi.get('/api/robots')
  },

  register: async (robotConfig) => {
    return frontendApi.post('/api/robots', robotConfig)
  },

  unregister: async (id) => {
    return frontendApi.delete(`/api/robots/${id}`)
  },

  // Robot Status and Monitoring
  getStatus: async (id) => {
    return frontendApi.get(`/api/robots/${id}/status`)
  },

  // Robot Commands - Updated to match your actual API
  executeCommand: async (id, command) => {
    return frontendApi.post(`/api/robots/${id}/commands`, command)
  },

  // Movement Commands - Updated to match your actual API endpoints
  moveToPosition: async (id, position, speed = 0.5) => {
    return frontendApi.post(`/api/robots/${id}/move`, { ...position, speed })
  },

  moveHome: async (id) => {
    return frontendApi.post(`/api/robots/${id}/home`)
  },

  emergencyStop: async (id) => {
    return frontendApi.post(`/api/robots/${id}/emergency-stop`)
  },

  // Object Manipulation
  pickObject: async (id, objectId, gripForce = 50.0) => {
    return frontendApi.post(`/api/robots/${id}/pick`, {
      object_id: objectId,
      grip_force: gripForce
    })
  },

  // Generic command execution for custom commands
  executeCustomCommand: async (id, command) => {
    return robotsApi.executeCommand(id, command)
  },

  // WebSocket connection for real-time updates
  createWebSocketConnection: (robotId) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8002'
    return new WebSocket(`${wsUrl}/ws/robots/${robotId}`)
  },

  // Health check
  healthCheck: async () => {
    return frontendApi.get('/api/robots/health')
  },

  // Service info
  getServiceInfo: async () => {
    return frontendApi.get('/api/robots/info')
  },

  // Utility functions for fleet management (client-side)
  getFleetOverview: (robots) => {
    const total = robots.length
    const online = robots.filter(r => r.is_connected).length
    const offline = total - online
    const error = robots.filter(r => r.status === 'error').length
    const maintenance = robots.filter(r => r.status === 'maintenance').length

    return {
      total_robots: total,
      online_robots: online,
      offline_robots: offline,
      error_robots: error,
      maintenance_robots: maintenance,
      active_commands: 0, // Would need to track this separately
      completed_commands_today: 0, // Would need to track this separately
      fleet_efficiency: online > 0 ? (online / total) * 100 : 0
    }
  },

  // Bulk operations (client-side implementation)
  bulkEmergencyStop: async (robotIds) => {
    const results = await Promise.allSettled(
      robotIds.map(id => robotsApi.emergencyStop(id))
    )
    return results
  },

  bulkHome: async (robotIds) => {
    const results = await Promise.allSettled(
      robotIds.map(id => robotsApi.moveHome(id))
    )
    return results
  },

  // Search and filter (client-side)
  filterRobots: (robots, filters) => {
    return robots.filter(robot => {
      if (filters.status && filters.status !== 'all' && robot.status !== filters.status) {
        return false
      }
      if (filters.brand && filters.brand !== 'all' && robot.brand !== filters.brand) {
        return false
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return robot.robot_id.toLowerCase().includes(searchLower) ||
               robot.model.toLowerCase().includes(searchLower)
      }
      return true
    })
  }
}
