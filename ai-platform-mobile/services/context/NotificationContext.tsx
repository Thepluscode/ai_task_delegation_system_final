import React, { createContext, useState, useEffect, ReactNode } from 'react';
import NotificationService, { AlertOptions } from '../notification/NotificationService';

interface NotificationsContextType {
  notifications: AlertOptions[];
  addNotification: (notification: AlertOptions) => void;
  removeNotification: (index: number) => void;
  clearNotifications: () => void;
}

// Create the context with a default value
export const NotificationContext = createContext<NotificationsContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {}
});

// Provider component that wraps the app and provides notifications context
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AlertOptions[]>([]);

  useEffect(() => {
    // Register alert handler with NotificationService
    NotificationService.registerAlertHandler((options) => {
      addNotification(options);
    });
  }, []);

  const addNotification = (notification: AlertOptions) => {
    setNotifications(current => [...current, notification]);
  };

  const removeNotification = (index: number) => {
    setNotifications(current => current.filter((_, i) => i !== index));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Provide the notifications context value to children components
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using the notifications context
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};