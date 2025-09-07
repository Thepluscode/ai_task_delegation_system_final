// Type declarations for context modules
import React from 'react';

interface AlertOptions {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface NotificationsContextType {
  notifications: AlertOptions[];
  addNotification: (notification: AlertOptions) => void;
  removeNotification: (index: number) => void;
  clearNotifications: () => void;
}

export const NotificationContext: React.Context<NotificationsContextType>;
export const NotificationProvider: React.FC<{ children: React.ReactNode }>;
export const useNotifications: () => NotificationsContextType;