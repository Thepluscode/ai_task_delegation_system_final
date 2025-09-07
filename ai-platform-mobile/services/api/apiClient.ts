import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL - should be configured for different environments
const API_BASE_URL = 'http://localhost:8000';

// HTTP request timeout (in milliseconds)
const TIMEOUT = 30000;

// Headers used for all requests
const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * API Client for making HTTP requests to the backend services
 * This is a wrapper around fetch that adds authentication, error handling, and other common functionality
 */
class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the authentication token from AsyncStorage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Add authentication to request headers
   */
  private async getHeaders(additionalHeaders: Record<string, string> = {}): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    
    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...additionalHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make a HTTP request
   */
  private async request<T>(
    method: string,
    path: string,
    data?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = await this.getHeaders(additionalHeaders);
    
    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(TIMEOUT),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        };
      }

      return responseData as T;
    } catch (error) {
      console.error(`API Error (${method} ${path}):`, error);
      throw error;
    }
  }

  /**
   * HTTP GET request
   */
  public async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, headers);
  }

  /**
   * HTTP POST request
   */
  public async post<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, data, headers);
  }

  /**
   * HTTP PUT request
   */
  public async put<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, data, headers);
  }

  /**
   * HTTP PATCH request
   */
  public async patch<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', path, data, headers);
  }

  /**
   * HTTP DELETE request
   */
  public async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', path, undefined, headers);
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;