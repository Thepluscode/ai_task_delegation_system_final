import apiClient from './apiClient';
import { WorkflowDomain } from './workflowService';

// Types for Notifications
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
}

export enum NotificationCategory {
  SYSTEM = 'system',
  SECURITY = 'security',
  WORKFLOW = 'workflow',
  AGENT = 'agent',
  IOT = 'iot',
  HEALTHCARE = 'healthcare',
  MANUFACTURING = 'manufacturing',
  USER = 'user',
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  domain?: WorkflowDomain;
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_text?: string;
  related_entity_id?: string;
  related_entity_type?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationSubscription {
  id: string;
  user_id: string;
  categories: NotificationCategory[];
  domains: WorkflowDomain[];
  notification_types: NotificationType[];
  channels: ('app' | 'email' | 'sms' | 'push')[];
  priority_threshold: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
}

// Real-time Notification Service
class NotificationService {
  private BASE_PATH = '/notifications';
  private websocket: WebSocket | null = null;
  private messageListeners: ((notification: Notification) => void)[] = [];
  private connectionStateListeners: ((connected: boolean) => void)[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  /**
   * Initialize the WebSocket connection
   */
  initializeWebSocket() {
    try {
      // In a real implementation, this would use a real WebSocket URL
      // and handle authentication, etc.
      // For demo purposes, we'll simulate the WebSocket behavior
      
      // Simulate WebSocket connection
      setTimeout(() => {
        this.isConnected = true;
        this.notifyConnectionStateChanged(true);
        console.log('WebSocket connected');
        
        // Simulate receiving notifications periodically
        setInterval(() => {
          if (this.isConnected) {
            const mockNotification = this.generateMockNotification();
            this.notifyMessageReceived(mockNotification);
          }
        }, 45000); // Simulate a new notification every 45 seconds
      }, 1500);
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.handleConnectionError();
    }
  }

  /**
   * Generate a mock notification for demo purposes
   */
  private generateMockNotification(): Notification {
    const types = Object.values(NotificationType);
    const categories = Object.values(NotificationCategory);
    const domains = Object.values(WorkflowDomain);
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const domain = category === NotificationCategory.HEALTHCARE || 
                   category === NotificationCategory.MANUFACTURING || 
                   category === NotificationCategory.IOT 
                   ? domains.find(d => d.toLowerCase() === category) 
                   : undefined;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as 'low' | 'medium' | 'high' | 'critical';
    
    let title = '';
    let message = '';
    
    switch (category) {
      case NotificationCategory.SYSTEM:
        title = 'System Update Available';
        message = 'A new system update is available for installation.';
        break;
      case NotificationCategory.SECURITY:
        title = 'Security Alert Detected';
        message = 'Unusual login activity detected from a new location.';
        break;
      case NotificationCategory.WORKFLOW:
        title = 'Workflow Status Change';
        message = 'Workflow "Patient Admission" has completed successfully.';
        break;
      case NotificationCategory.AGENT:
        title = 'Agent Performance Alert';
        message = 'Agent "Healthcare Triage AI" efficiency has dropped below threshold.';
        break;
      case NotificationCategory.IOT:
        title = 'Device Connectivity Issue';
        message = 'IoT device in Building B has lost connection.';
        break;
      case NotificationCategory.HEALTHCARE:
        title = 'Patient Alert';
        message = 'New patient admitted to Emergency Department.';
        break;
      case NotificationCategory.MANUFACTURING:
        title = 'Production Line Alert';
        message = 'Line A production rate has dropped by 15%.';
        break;
      default:
        title = 'New Notification';
        message = 'You have a new system notification.';
    }
    
    return {
      id: `notification-${Date.now()}`,
      title,
      message,
      type,
      category,
      domain,
      timestamp: new Date().toISOString(),
      read: false,
      priority,
    };
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError() {
    this.isConnected = false;
    this.notifyConnectionStateChanged(false);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const reconnectDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.initializeWebSocket();
      }, reconnectDelay);
    } else {
      console.error('Max reconnect attempts reached. WebSocket connection failed.');
    }
  }

  /**
   * Close the WebSocket connection
   */
  closeConnection() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.isConnected) {
      this.isConnected = false;
      this.notifyConnectionStateChanged(false);
      console.log('WebSocket disconnected');
    }
    
    this.websocket = null;
  }

  /**
   * Add a message listener
   */
  addMessageListener(listener: (notification: Notification) => void) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  /**
   * Add a connection state listener
   */
  addConnectionStateListener(listener: (connected: boolean) => void) {
    this.connectionStateListeners.push(listener);
    listener(this.isConnected); // Immediately notify with current state
    return () => {
      this.connectionStateListeners = this.connectionStateListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all message listeners
   */
  private notifyMessageReceived(notification: Notification) {
    this.messageListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Notify all connection state listeners
   */
  private notifyConnectionStateChanged(connected: boolean) {
    this.connectionStateListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in connection state listener:', error);
      }
    });
  }

  /**
   * Get all notifications
   */
  async getNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      // In a real implementation:
      // let url = `${this.BASE_PATH}?limit=${limit}&offset=${offset}`;
      // if (unreadOnly) url += '&unread_only=true';
      // return apiClient.get(url);
      
      // Simulated data
      const notifications: Notification[] = [];
      
      // Generate a few sample notifications
      for (let i = 0; i < 10; i++) {
        const createdAt = new Date(Date.now() - i * 1800000); // Every 30 minutes in the past
        
        notifications.push({
          id: `notification-${i + 1}`,
          title: i % 3 === 0 ? 'System Update' : i % 3 === 1 ? 'Security Alert' : 'Workflow Completed',
          message: i % 3 === 0 
            ? 'A new system update is available for installation.' 
            : i % 3 === 1 
              ? 'Unusual login activity detected from a new location.' 
              : 'Workflow "Patient Admission" has completed successfully.',
          type: i % 4 === 0 
            ? NotificationType.INFO 
            : i % 4 === 1 
              ? NotificationType.SUCCESS 
              : i % 4 === 2 
                ? NotificationType.WARNING 
                : NotificationType.ERROR,
          category: i % 3 === 0 
            ? NotificationCategory.SYSTEM 
            : i % 3 === 1 
              ? NotificationCategory.SECURITY 
              : NotificationCategory.WORKFLOW,
          timestamp: createdAt.toISOString(),
          read: i > 3, // First 4 are unread
          priority: i % 4 === 0 ? 'low' : i % 4 === 1 ? 'medium' : i % 4 === 2 ? 'high' : 'critical',
        });
      }
      
      // Filter for unread if requested
      return unreadOnly ? notifications.filter(n => !n.read) : notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      return apiClient.post(`${this.BASE_PATH}/${notificationId}/read`);
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      return apiClient.post(`${this.BASE_PATH}/read-all`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationSubscription[]> {
    try {
      // In a real implementation:
      // return apiClient.get(`${this.BASE_PATH}/preferences`);
      
      // Simulated data
      return [
        {
          id: 'subscription-1',
          user_id: 'current-user',
          categories: [NotificationCategory.SYSTEM, NotificationCategory.SECURITY],
          domains: [WorkflowDomain.HEALTHCARE, WorkflowDomain.IOT],
          notification_types: [
            NotificationType.INFO,
            NotificationType.WARNING,
            NotificationType.ERROR
          ],
          channels: ['app', 'email'],
          priority_threshold: 'medium',
          active: true
        },
        {
          id: 'subscription-2',
          user_id: 'current-user',
          categories: [NotificationCategory.WORKFLOW, NotificationCategory.AGENT],
          domains: [WorkflowDomain.HEALTHCARE],
          notification_types: [NotificationType.INFO, NotificationType.SUCCESS],
          channels: ['app'],
          priority_threshold: 'low',
          active: true
        }
      ];
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    subscription: NotificationSubscription
  ): Promise<NotificationSubscription> {
    try {
      return apiClient.put(`${this.BASE_PATH}/preferences/${subscription.id}`, subscription);
    } catch (error) {
      console.error(`Error updating notification subscription ${subscription.id}:`, error);
      throw error;
    }
  }

  /**
   * Send a test notification
   */
  async sendTestNotification(
    type: NotificationType,
    category: NotificationCategory
  ): Promise<Notification> {
    try {
      return apiClient.post(`${this.BASE_PATH}/test`, { type, category });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();