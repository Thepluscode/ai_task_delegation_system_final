import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Force production mode to use real data instead of mock data
    this.isDevelopmentMode = false; // Changed from process.env.NODE_ENV === 'development'
  }

  // Service Health Checks
  async getServiceHealth() {
    // Use mock data in development mode
    if (this.isDevelopmentMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockServices = [
            { name: 'API Gateway', port: 8000, status: 'healthy', response_time: '45ms', uptime: '99.9%' },
            { name: 'Auth Service', port: 8001, status: 'healthy', response_time: '32ms', uptime: '99.8%' },
            { name: 'Database Service', port: 8002, status: 'healthy', response_time: '28ms', uptime: '99.9%' },
            { name: 'Monitoring Service', port: 8003, status: 'healthy', response_time: '51ms', uptime: '99.7%' },
            { name: 'Learning Service', port: 8004, status: 'healthy', response_time: '67ms', uptime: '99.6%' },
            { name: 'Trading Service', port: 8005, status: 'healthy', response_time: '39ms', uptime: '99.9%' },
            { name: 'Market Signals', port: 8006, status: 'healthy', response_time: '44ms', uptime: '99.8%' },
            { name: 'Banking Service', port: 8008, status: 'healthy', response_time: '56ms', uptime: '99.7%' },
            { name: 'Healthcare Service', port: 8009, status: 'healthy', response_time: '41ms', uptime: '99.9%' },
            { name: 'Retail Service', port: 8010, status: 'healthy', response_time: '38ms', uptime: '99.8%' },
            { name: 'IoT Service', port: 8011, status: 'healthy', response_time: '47ms', uptime: '99.6%' },
            { name: 'Main Platform', port: 8080, status: 'healthy', response_time: '35ms', uptime: '99.9%' }
          ];
          resolve(mockServices);
        }, 400);
      });
    }

    // Production mode - use real API
    try {
      const services = [
        { name: 'API Gateway', url: `${this.baseURL}/health`, port: 8000 },
        { name: 'Auth Service', url: 'http://localhost:8001/health', port: 8001 },
        { name: 'Database Service', url: 'http://localhost:8002/health', port: 8002 },
        { name: 'Monitoring Service', url: 'http://localhost:8003/health', port: 8003 },
        { name: 'Learning Service', url: 'http://localhost:8004/health', port: 8004 },
        { name: 'Trading Service', url: 'http://localhost:8005/health', port: 8005 },
        { name: 'Market Signals', url: 'http://localhost:8006/health', port: 8006 },
        { name: 'Banking Service', url: 'http://localhost:8008/health', port: 8008 },
        { name: 'Healthcare Service', url: 'http://localhost:8009/health', port: 8009 },
        { name: 'Retail Service', url: 'http://localhost:8010/health', port: 8010 },
        { name: 'IoT Service', url: 'http://localhost:8011/health', port: 8011 },
        { name: 'Main Platform', url: 'http://localhost:8080/health', port: 8080 }
      ];

      const healthChecks = await Promise.allSettled(
        services.map(async (service) => {
          try {
            const response = await axios.get(service.url, { timeout: 5000 });
            return {
              ...service,
              status: 'healthy',
              response_time: response.headers['x-response-time'] || 'N/A',
              data: response.data
            };
          } catch (error) {
            return {
              ...service,
              status: 'unhealthy',
              error: error.message,
              response_time: 'N/A'
            };
          }
        })
      );

      return healthChecks.map((result, index) => ({
        ...services[index],
        ...(result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason })
      }));
    } catch (error) {
      throw new Error('Failed to check service health');
    }
  }

  // Database Service APIs
  async getDatabaseStats() {
    // Use mock data in development mode
    if (this.isDevelopmentMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            total_records: 1247892,
            active_connections: 23,
            query_performance: {
              avg_response_time: 45,
              slow_queries: 3,
              total_queries_today: 15847
            },
            storage: {
              used_space: '2.4 GB',
              available_space: '47.6 GB',
              usage_percentage: 4.8
            },
            health_status: 'healthy',
            last_backup: '2024-01-15T02:00:00Z'
          });
        }, 250);
      });
    }

    // Production mode - use real API through gateway
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/database/stats`, {
        headers: {
          'X-API-Key': 'dashboard-api-key',
          'X-Service-Name': 'main-platform'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to get database stats');
    }
  }

  async executeQuery(query, parameters = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/database/query`, {
        query,
        parameters
      }, {
        headers: {
          'X-API-Key': 'dashboard-api-key',
          'X-Service-Name': 'main-platform'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Query execution failed');
    }
  }

  // Monitoring Service APIs
  async getMonitoringDashboard() {
    // Use mock data in development mode
    if (this.isDevelopmentMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            system_metrics: {
              cpu_usage: 34.7,
              memory_usage: 67.2,
              disk_usage: 45.8,
              network_io: 12.4
            },
            active_tasks: 156,
            completed_tasks_today: 892,
            error_rate: 0.3,
            average_response_time: 245,
            alerts: {
              critical: 0,
              warning: 2,
              info: 5
            },
            performance_trends: [
              { time: '00:00', cpu: 25, memory: 60, tasks: 45 },
              { time: '06:00', cpu: 30, memory: 65, tasks: 78 },
              { time: '12:00', cpu: 35, memory: 70, tasks: 156 },
              { time: '18:00', cpu: 32, memory: 67, tasks: 134 }
            ]
          });
        }, 350);
      });
    }

    // Production mode - use real API through gateway
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/monitoring/dashboard`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get monitoring dashboard');
    }
  }

  async getActiveAlerts() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/monitoring/alerts`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get active alerts');
    }
  }

  async startTaskMonitoring(taskData) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/monitoring/start`, taskData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to start monitoring');
    }
  }

  // Learning Service APIs
  async getLearningStats() {
    // Use mock data in development mode
    if (this.isDevelopmentMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            total_tasks_learned: 1247,
            active_learning_sessions: 23,
            model_accuracy: 94.7,
            improvement_rate: 12.3,
            agent_performance: {
              top_performer: 'Agent-Alpha-7',
              average_score: 87.2,
              total_agents: 15
            },
            learning_trends: [
              { date: '2024-01-01', accuracy: 89.2, tasks: 45 },
              { date: '2024-01-02', accuracy: 91.1, tasks: 52 },
              { date: '2024-01-03', accuracy: 92.8, tasks: 48 },
              { date: '2024-01-04', accuracy: 94.7, tasks: 61 }
            ]
          });
        }, 300);
      });
    }

    // Production mode - use real API through gateway
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/learning/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get learning stats');
    }
  }

  async getAgentPerformance() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/learning/agents/performance`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get agent performance');
    }
  }

  // Task Management APIs
  async getTasks() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/tasks`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get tasks');
    }
  }

  async createTask(taskData) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/tasks`, taskData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create task');
    }
  }

  async delegateTask(taskId, agentId) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/tasks/${taskId}/delegate`, {
        agent_id: agentId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delegate task');
    }
  }

  // Auth Service APIs
  async getAuthStats() {
    // Use mock data in development mode
    if (this.isDevelopmentMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalUsers: 1247,
            activeUsers: 892,
            todayLogins: 156,
            failedAttempts: 12,
            tokenValidation: 99.7,
            sessionDuration: 45,
            recentLogins: [
              {
                key: '1',
                user: 'john.doe@company.com',
                timestamp: '2024-01-15 14:30:22',
                ip: '192.168.1.100',
                status: 'success',
                location: 'New York, US'
              },
              {
                key: '2',
                user: 'jane.smith@company.com',
                timestamp: '2024-01-15 14:28:15',
                ip: '192.168.1.101',
                status: 'success',
                location: 'London, UK'
              },
              {
                key: '3',
                user: 'admin@company.com',
                timestamp: '2024-01-15 14:25:10',
                ip: '192.168.1.102',
                status: 'failed',
                location: 'Unknown'
              }
            ]
          });
        }, 400);
      });
    }

    // Production mode - use real API through gateway
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/auth/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get auth stats');
    }
  }

  // User Management APIs
  async getUsers() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/auth/users`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get users');
    }
  }

  async createUser(userData) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create user');
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await axios.put(`${this.baseURL}/api/v1/auth/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update user');
    }
  }

  // Trading Service APIs
  async getTradingStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/trading/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get trading stats');
    }
  }

  async getPositions() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/trading/positions`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get positions');
    }
  }

  // Banking Service APIs
  async getBankingStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/banking/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get banking stats');
    }
  }

  async getLoanApplications() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/banking/applications`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get loan applications');
    }
  }

  // System Configuration APIs
  async getSystemConfig() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/config`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get system configuration');
    }
  }

  async updateSystemConfig(config) {
    try {
      const response = await axios.put(`${this.baseURL}/api/v1/config`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update configuration');
    }
  }

  // IoT Service APIs
  async getIoTStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/iot/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get IoT stats');
    }
  }

  async getConnectedDevices() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/iot/devices`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get connected devices');
    }
  }

  async getIoTAlerts() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/iot/alerts`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get IoT alerts');
    }
  }

  async getMaintenanceSchedule() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/iot/maintenance`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get maintenance schedule');
    }
  }

  async getDeviceDetails(deviceId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/iot/device/${deviceId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get device details');
    }
  }

  async sendDeviceCommand(deviceId, command) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/iot/device/${deviceId}/command`, command);
      return response.data;
    } catch (error) {
      throw new Error('Failed to send device command');
    }
  }

  async getIoTAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/iot/analytics`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get IoT analytics');
    }
  }

  // Healthcare Service APIs
  async getHealthcareStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/healthcare/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get healthcare stats');
    }
  }

  async getPatientRecords() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/healthcare/patients`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get patient records');
    }
  }

  // Retail Service APIs
  async getRetailStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/retail/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get retail stats');
    }
  }

  async getInventoryData() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/retail/inventory`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get inventory data');
    }
  }
}

export const apiService = new ApiService();
