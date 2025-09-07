// API Configuration for Enterprise Automation Platform
// Centralized configuration for all service endpoints

export const API_CONFIG = {
  // Service Base URLs
  SERVICES: {
    WORKFLOW_STATE: 'http://localhost:8003',
    ROBOT_ABSTRACTION: 'http://localhost:8004', 
    AI_TASK_DELEGATION: 'http://localhost:8005',
    EDGE_COMPUTING: 'http://localhost:8006',
    SECURITY_COMPLIANCE: 'http://localhost:8007',
    MONITORING_ANALYTICS: 'http://localhost:8008'
  },

  // API Endpoints
  ENDPOINTS: {
    // Workflow State Service (Port 8003)
    WORKFLOWS: {
      BASE: '/api/v1/workflows',
      LIST: '/api/v1/workflows',
      CREATE: '/api/v1/workflows',
      GET: (id) => `/api/v1/workflows/${id}`,
      UPDATE: (id) => `/api/v1/workflows/${id}`,
      DELETE: (id) => `/api/v1/workflows/${id}`,
      EXECUTE: (id) => `/api/v1/workflows/${id}/execute`,
      STATE: '/api/v1/state',
      EVENTS: '/api/v1/events'
    },

    // Robot Abstraction Protocol (Port 8004)
    ROBOTS: {
      BASE: '/api/v1/robots',
      LIST: '/api/v1/robots',
      GET: (id) => `/api/v1/robots/${id}`,
      STATUS: (id) => `/api/v1/robots/${id}/status`,
      COMMAND: (id) => `/api/v1/robots/${id}/command`,
      CAPABILITIES: '/api/v1/capabilities',
      REGISTER: '/api/v1/robots/register'
    },

    // AI Task Delegation (Port 8005)
    TASKS: {
      BASE: '/api/v1/tasks',
      LIST: '/api/v1/tasks',
      DELEGATE: '/api/v1/tasks/delegate',
      AGENTS: '/api/v1/agents',
      REGISTER_AGENT: '/api/v1/agents/register',
      PERFORMANCE: '/api/v1/performance'
    },

    // Edge Computing (Port 8006)
    EDGE: {
      BASE: '/api/v1',
      DECISIONS: '/api/v1/decisions/make',
      VISION: '/api/v1/vision/process',
      NODES: '/api/v1/nodes',
      PERFORMANCE: '/api/v1/performance'
    },

    // Security & Compliance (Port 8007)
    AUTH: {
      BASE: '/api/v1/auth',
      LOGIN: '/api/v1/auth/login',
      LOGOUT: '/api/v1/auth/logout',
      ME: '/api/v1/auth/me',
      REFRESH: '/api/v1/auth/refresh',
      USERS: '/api/v1/users',
      AUDIT: '/api/v1/audit',
      SECURITY: '/api/v1/security'
    },

    // Monitoring & Analytics (Port 8008)
    MONITORING: {
      BASE: '/api/v1',
      METRICS: '/api/v1/metrics',
      SERVICES: '/api/v1/services',
      ANALYTICS: '/api/v1/analytics',
      DASHBOARD: '/api/v1/analytics/dashboard',
      INSIGHTS: '/api/v1/analytics/insights',
      ALERTS: '/api/v1/alerts'
    }
  },

  // WebSocket Endpoints
  WEBSOCKETS: {
    WORKFLOWS: 'ws://localhost:8003/ws/workflows',
    ROBOTS: 'ws://localhost:8004/ws/robots',
    DELEGATION: 'ws://localhost:8005/ws/delegation',
    EDGE: 'ws://localhost:8006/ws/edge',
    SECURITY: 'ws://localhost:8007/ws/security',
    MONITORING: 'ws://localhost:8008/ws/monitoring'
  },

  // Request Configuration
  DEFAULT_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to build full URL
export const buildUrl = (service, endpoint) => {
  const baseUrl = API_CONFIG.SERVICES[service];
  if (!baseUrl) {
    throw new Error(`Unknown service: ${service}`);
  }
  return `${baseUrl}${endpoint}`;
};

// Helper function to get service health URL
export const getHealthUrl = (service) => {
  const baseUrl = API_CONFIG.SERVICES[service];
  if (!baseUrl) {
    throw new Error(`Unknown service: ${service}`);
  }
  return `${baseUrl}/health`;
};

// Service status checker
export const checkServiceHealth = async (service) => {
  try {
    const response = await fetch(getHealthUrl(service), {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error(`Health check failed for ${service}:`, error);
    return false;
  }
};

// Check all services health
export const checkAllServicesHealth = async () => {
  const services = Object.keys(API_CONFIG.SERVICES);
  const healthChecks = await Promise.allSettled(
    services.map(service => checkServiceHealth(service))
  );
  
  const results = {};
  services.forEach((service, index) => {
    results[service] = healthChecks[index].status === 'fulfilled' && healthChecks[index].value;
  });
  
  return results;
};

// API Client with error handling and retries
export class ApiClient {
  constructor(service) {
    this.baseUrl = API_CONFIG.SERVICES[service];
    this.service = service;
    
    if (!this.baseUrl) {
      throw new Error(`Unknown service: ${service}`);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      timeout: API_CONFIG.DEFAULT_TIMEOUT,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let lastError;
    
    // Retry logic
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text();
        }
      } catch (error) {
        lastError = error;
        console.warn(`Request attempt ${attempt} failed for ${this.service}:`, error);
        
        if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError;
  }

  // Convenience methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Pre-configured API clients for each service
export const workflowApi = new ApiClient('WORKFLOW_STATE');
export const robotApi = new ApiClient('ROBOT_ABSTRACTION');
export const taskApi = new ApiClient('AI_TASK_DELEGATION');
export const edgeApi = new ApiClient('EDGE_COMPUTING');
export const authApi = new ApiClient('SECURITY_COMPLIANCE');
export const monitoringApi = new ApiClient('MONITORING_ANALYTICS');

export default API_CONFIG;
