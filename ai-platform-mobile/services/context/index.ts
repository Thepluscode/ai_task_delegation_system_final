/**
 * Context API index - re-exports all context providers and hooks
 * for easier imports throughout the application
 */

// Re-export NotificationContext
export {
  NotificationContext,
  NotificationProvider,
  useNotifications
} from './NotificationContext';

// Re-export AuthContext
export {
  AuthContext,
  AuthProvider,
  useAuth
} from './AuthContext';