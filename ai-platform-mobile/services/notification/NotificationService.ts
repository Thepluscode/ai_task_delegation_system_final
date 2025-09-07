/**
 * Notification Service for the AutomatedAI Platform
 * 
 * Provides standardized notification capabilities across the application
 * including alerts, toasts, and native notifications.
 */

import { Platform } from 'react-native';

// Alert types for styling
export type AlertType = 'info' | 'success' | 'warning' | 'danger';

// Alert interface for showing notifications
export interface AlertOptions {
  title: string;
  message: string;
  type: AlertType;
  duration?: number; // Duration in ms, default 3000
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Security notification with classification
export interface SecurityNotification extends AlertOptions {
  securityClassification?: string;
  source?: string;
  timestamp?: string;
  requiresAcknowledgment?: boolean;
}

/**
 * NotificationService class - provides methods for displaying various notification types
 */
export class NotificationService {
  private static instance: NotificationService;
  private alertCallback: ((options: AlertOptions) => void) | null = null;
  
  constructor() {
    if (NotificationService.instance) {
      return NotificationService.instance;
    }
    
    NotificationService.instance = this;
  }
  
  /**
   * Register a callback for handling alerts
   * @param callback Function to be called when alerts are triggered
   */
  registerAlertHandler(callback: (options: AlertOptions) => void) {
    this.alertCallback = callback;
  }
  
  /**
   * Display an alert with the given options
   * @param options Alert configuration
   */
  showAlert(options: AlertOptions) {
    if (this.alertCallback) {
      this.alertCallback(options);
    } else {
      // Fallback to console log if no handler registered
      console.log(`ALERT [${options.type}]: ${options.title} - ${options.message}`);
    }
  }
  
  /**
   * Show a security notification with classification
   * @param notification Security notification configuration
   */
  showSecurityNotification(notification: SecurityNotification) {
    const enhancedTitle = notification.securityClassification 
      ? `[${notification.securityClassification}] ${notification.title}`
      : notification.title;
      
    this.showAlert({
      ...notification,
      title: enhancedTitle,
    });
  }
  
  /**
   * Show a toast message (brief, non-intrusive notification)
   * @param message Message to display
   * @param type Type of toast
   * @param duration Duration to show (ms)
   */
  showToast(message: string, type: AlertType = 'info', duration: number = 3000) {
    // In a real implementation, this would show a toast UI component
    console.log(`TOAST [${type}]: ${message} (duration: ${duration}ms)`);
  }
  
  /**
   * Show a native notification using the platform's notification system
   * @param title Notification title
   * @param body Notification body
   */
  showNativeNotification(title: string, body: string) {
    // In a real implementation, this would use something like expo-notifications
    console.log(`NATIVE NOTIFICATION: ${title} - ${body} (Platform: ${Platform.OS})`);
  }
}

// Export a singleton instance
export default new NotificationService();