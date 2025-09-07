import axios from 'axios'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date()
    const duration = endTime - response.config.metadata.startTime
    
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
    }
    
    return response
  },
  (error) => {
    // Calculate request duration
    const endTime = new Date()
    const duration = error.config?.metadata ? endTime - error.config.metadata.startTime : 0
    
    // Log failed requests
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error.response?.data)
    }
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
          }
          break
          
        case 403:
          // Forbidden - show permission error
          throw new Error('You do not have permission to perform this action')
          
        case 404:
          // Not found
          throw new Error('The requested resource was not found')
          
        case 422:
          // Validation error
          throw new Error(data.message || 'Validation error')
          
        case 429:
          // Rate limit exceeded
          throw new Error('Too many requests. Please try again later.')
          
        case 500:
          // Server error
          throw new Error('Internal server error. Please try again later.')
          
        default:
          throw new Error(data.message || `Request failed with status ${status}`)
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection and try again.')
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

// Generic API methods
export const api = {
  // GET request
  get: async (url, config = {}) => {
    const response = await apiClient.get(url, config)
    return response.data
  },
  
  // POST request
  post: async (url, data = {}, config = {}) => {
    const response = await apiClient.post(url, data, config)
    return response.data
  },
  
  // PUT request
  put: async (url, data = {}, config = {}) => {
    const response = await apiClient.put(url, data, config)
    return response.data
  },
  
  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    const response = await apiClient.patch(url, data, config)
    return response.data
  },
  
  // DELETE request
  delete: async (url, config = {}) => {
    const response = await apiClient.delete(url, config)
    return response.data
  },
  
  // Upload file
  upload: async (url, file, onProgress = null) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
    
    const response = await apiClient.post(url, formData, config)
    return response.data
  },
  
  // Download file
  download: async (url, filename) => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    })
    
    // Create download link
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return response.data
  },
}

// Utility functions for common API patterns
export const apiUtils = {
  // Build query string from object
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item))
        } else {
          searchParams.append(key, value)
        }
      }
    })
    
    return searchParams.toString()
  },
  
  // Create paginated request
  paginated: async (url, params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    const fullUrl = queryString ? `${url}?${queryString}` : url
    return api.get(fullUrl)
  },
  
  // Retry request with exponential backoff
  retry: async (requestFn, maxRetries = 3, baseDelay = 1000) => {
    let lastError
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  },
}

export default apiClient
