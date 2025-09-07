// Mock API utility for investor presentations
// Provides realistic demo data without requiring backend services

export const mockApiResponse = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve(data)
      })
    }, delay)
  })
}

export const mockApiError = (message = 'Service unavailable', delay = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(message))
    }, delay)
  })
}

// Mock data generators
export const generateMockMetrics = () => ({
  latency: Math.random() * 0.5 + 0.1, // 0.1-0.6ms
  throughput: Math.floor(Math.random() * 2000) + 5000, // 5000-7000 ops/sec
  accuracy: 99.5 + Math.random() * 0.5, // 99.5-100%
  uptime: 99.8 + Math.random() * 0.2, // 99.8-100%
  efficiency_gain: Math.random() * 20 + 25, // 25-45%
  cost_savings: Math.floor(Math.random() * 500000) + 1000000 // $1M-$1.5M
})

export const generateMockRobotData = () => ({
  id: `robot_${Math.floor(Math.random() * 1000)}`,
  name: `Robot-${Math.floor(Math.random() * 100)}`,
  type: ['industrial_arm', 'mobile_robot', 'collaborative_robot'][Math.floor(Math.random() * 3)],
  status: ['active', 'idle', 'maintenance'][Math.floor(Math.random() * 3)],
  location: `Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
  battery: Math.floor(Math.random() * 40) + 60, // 60-100%
  uptime: 99.5 + Math.random() * 0.5,
  tasks_completed: Math.floor(Math.random() * 100) + 50,
  efficiency: 95 + Math.random() * 5
})

export const generateMockHealthcareData = () => ({
  devices: {
    total: 1247,
    online: 1235,
    offline: 12,
    alerts: 3
  },
  patients: {
    total: 847,
    critical: 23,
    stable: 824
  },
  performance: {
    uptime: 99.8,
    response_time: 0.12,
    accuracy: 99.9,
    efficiency_gain: 34.2
  },
  roi: {
    annual_savings: 3800000,
    cost_reduction: 28.5,
    payback_months: 3.8
  }
})

export const generateMockBankingData = () => ({
  applications: {
    total: 1247,
    approved: 892,
    pending: 234,
    rejected: 121
  },
  performance: {
    processing_time: 0.08, // seconds
    accuracy: 99.7,
    fraud_detection: 99.9,
    efficiency_gain: 67.3
  },
  roi: {
    annual_savings: 1200000,
    cost_reduction: 45.2,
    payback_months: 12
  }
})

export const generateMockManufacturingData = () => ({
  production: {
    units_produced: 15847,
    quality_rate: 99.8,
    oee: 87.3,
    downtime_hours: 2.1
  },
  robots: {
    total: 25,
    active: 23,
    maintenance: 2
  },
  performance: {
    cycle_time: 0.16, // seconds
    defect_rate: 0.2,
    efficiency_gain: 42.8
  },
  roi: {
    annual_savings: 5000000,
    cost_reduction: 32.1,
    payback_months: 1.6
  }
})

// Intercept fetch calls and provide mock responses
export const setupMockApi = () => {
  const originalFetch = window.fetch
  
  window.fetch = async (url, options) => {
    // Check if this is a backend API call that should be mocked
    if (typeof url === 'string' && url.includes('localhost:8')) {
      console.log(`🎭 Mocking API call: ${url}`)

      // Banking APIs (localhost:8005)
      if (url.includes('8005') || url.includes('banking')) {
        if (url.includes('/api/v1/banking/analytics')) {
          return mockApiResponse(generateMockBankingData())
        }
        if (url.includes('/health')) {
          return mockApiResponse({ status: 'healthy', service: 'banking', version: 'v1' })
        }
        // Root service info
        return mockApiResponse({
          service: 'Banking Learning Service',
          version: 'v1.0.0',
          status: 'operational',
          demo_mode: true
        })
      }

      // Healthcare APIs
      if (url.includes('8009') || url.includes('healthcare')) {
        return mockApiResponse(generateMockHealthcareData())
      }

      // Manufacturing APIs
      if (url.includes('8013') || url.includes('manufacturing')) {
        return mockApiResponse(generateMockManufacturingData())
      }

      // Robot APIs
      if (url.includes('8004') || url.includes('robots')) {
        return mockApiResponse({
          robots: Array.from({length: 5}, generateMockRobotData)
        })
      }

      // Edge Computing APIs
      if (url.includes('8006') || url.includes('edge')) {
        return mockApiResponse(generateMockMetrics())
      }

      // Default mock response
      return mockApiResponse({
        status: 'success',
        message: 'Demo mode - using mock data',
        data: generateMockMetrics()
      })
    }

    // For all other requests, use the original fetch
    return originalFetch(url, options)
  }
}

// Restore original fetch
export const restoreFetch = () => {
  if (window.originalFetch) {
    window.fetch = window.originalFetch
  }
}
