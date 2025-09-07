import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for Auth service
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  organization: string;
  lastLogin: string;
  createdAt: string;
  isActive: boolean;
  profileImage?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Auth service for handling authentication
class AuthService {
  private BASE_PATH = '/api/v1/auth';
  private TOKEN_KEY = 'auth_token';
  private REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private USER_KEY = 'auth_user';

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(`${this.BASE_PATH}/login`, request);

      // Store auth data in AsyncStorage
      await this.storeAuthData(response);

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(request: RegisterRequest): Promise<User> {
    try {
      return await apiClient.post<User>(`${this.BASE_PATH}/register`, request);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post(`${this.BASE_PATH}/logout`);
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage regardless of API call result
      await this.clearAuthData();
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_PATH}/forgot-password`, request);
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_PATH}/change-password`, request);
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<LoginResponse> {
    try {
      const refreshToken = await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<LoginResponse>(`${this.BASE_PATH}/refresh-token`, {
        refreshToken
      });

      // Store updated tokens
      await this.storeAuthData(response);

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, force logout
      await this.clearAuthData();
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // First try to get from local storage
      const userJson = await AsyncStorage.getItem(this.USER_KEY);
      if (userJson) {
        return JSON.parse(userJson) as User;
      }

      // If not in storage, get from API
      const user = await apiClient.get<User>(`${this.BASE_PATH}/me`);
      
      // Save to storage
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      return !!token; // Return true if token exists
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Store authentication data in AsyncStorage
   */
  private async storeAuthData(response: LoginResponse): Promise<void> {
    await AsyncStorage.setItem(this.TOKEN_KEY, response.token);
    await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }

  /**
   * Clear authentication data from AsyncStorage
   */
  private async clearAuthData(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
    await AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(): Promise<string[]> {
    const user = await this.getCurrentUser();
    return user?.permissions || [];
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return permissions.includes(permission);
  }
}

export const authService = new AuthService();