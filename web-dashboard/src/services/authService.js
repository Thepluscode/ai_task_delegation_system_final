import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1/auth`;
    this.isDevelopmentMode = process.env.NODE_ENV === 'development';

    // Mock users for development
    this.mockUsers = [
      { username: 'admin', password: 'admin123', role: 'Administrator', name: 'Admin User' },
      { username: 'manager', password: 'manager123', role: 'Manager', name: 'Manager User' },
      { username: 'user', password: 'user123', role: 'User', name: 'Regular User' }
    ];
    
    // Setup axios interceptors
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials) {
    // Use mock authentication in development mode
    if (this.isDevelopmentMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = this.mockUsers.find(
            u => u.username === credentials.username && u.password === credentials.password
          );

          if (user) {
            const mockToken = `mock_token_${user.username}_${Date.now()}`;
            const mockResponse = {
              access_token: mockToken,
              token_type: 'bearer',
              user: {
                id: Math.floor(Math.random() * 1000),
                username: user.username,
                name: user.name,
                role: user.role,
                email: `${user.username}@enterprise.com`
              }
            };
            resolve(mockResponse);
          } else {
            reject(new Error('Invalid username or password'));
          }
        }, 500); // Simulate network delay
      });
    }

    // Production mode - use real API
    try {
      const response = await axios.post(`${this.baseURL}/login`, credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${this.baseURL}/register`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  }

  async verifyToken(token) {
    // Use mock verification in development mode
    if (this.isDevelopmentMode && token && token.startsWith('mock_token_')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const username = token.split('_')[2];
          const user = this.mockUsers.find(u => u.username === username);
          if (user) {
            resolve({
              id: Math.floor(Math.random() * 1000),
              username: user.username,
              name: user.name,
              role: user.role,
              email: `${user.username}@enterprise.com`
            });
          } else {
            throw new Error('Token verification failed');
          }
        }, 200);
      });
    }

    // Production mode - use real API
    try {
      const response = await axios.get(`${this.baseURL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await axios.put(`${this.baseURL}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Profile update failed');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await axios.post(`${this.baseURL}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Password change failed');
    }
  }

  async forgotPassword(email) {
    try {
      const response = await axios.post(`${this.baseURL}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Password reset request failed');
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await axios.post(`${this.baseURL}/reset-password`, {
        token,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Password reset failed');
    }
  }

  async getUserSessions() {
    try {
      const response = await axios.get(`${this.baseURL}/sessions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get sessions');
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
