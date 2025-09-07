'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline'

// Notification Context
const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
      timestamp: new Date().toISOString()
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Notification Container
const NotificationContainer = () => {
  const { notifications } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

// Individual Notification Item
const NotificationItem = ({ notification }) => {
  const { removeNotification } = useNotifications()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => removeNotification(notification.id), 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
        border rounded-lg shadow-lg p-4 max-w-sm
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {notification.title && (
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {notification.title}
            </h4>
          )}
          <p className="text-sm text-gray-700">
            {notification.message}
          </p>
          {notification.action && (
            <div className="mt-2">
              <button
                onClick={notification.action.onClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Notification Bell Component
export const NotificationBell = () => {
  const { notifications, clearAllNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        {notification.title && (
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                        )}
                        <p className="text-sm text-gray-700 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get notification icon
const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />
    case 'warning':
      return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
    case 'error':
      return <XCircleIcon className="h-4 w-4 text-red-600" />
    default:
      return <InformationCircleIcon className="h-4 w-4 text-blue-600" />
  }
}

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

// Utility functions for easy notification creation
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications()

  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    })
  }

  const showError = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 8000, // Longer duration for errors
      ...options
    })
  }

  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    })
  }

  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

// Industry-specific notification templates
export const useIndustryNotifications = () => {
  const { addNotification } = useNotifications()

  const healthcareNotifications = {
    patientAlert: (patientId, message) => addNotification({
      type: 'warning',
      title: `Patient Alert - ${patientId}`,
      message,
      duration: 0, // Persistent until dismissed
      action: {
        label: 'View Patient',
        onClick: () => console.log(`Navigate to patient ${patientId}`)
      }
    }),

    medicationReminder: (medication, time) => addNotification({
      type: 'info',
      title: 'Medication Reminder',
      message: `${medication} scheduled for ${time}`,
      duration: 10000
    }),

    emergencyAlert: (location, description) => addNotification({
      type: 'error',
      title: `Emergency - ${location}`,
      message: description,
      duration: 0,
      action: {
        label: 'Respond',
        onClick: () => console.log('Emergency response initiated')
      }
    })
  }

  const manufacturingNotifications = {
    qualityAlert: (lineId, issue) => addNotification({
      type: 'warning',
      title: `Quality Alert - Line ${lineId}`,
      message: issue,
      duration: 0,
      action: {
        label: 'Investigate',
        onClick: () => console.log(`Navigate to line ${lineId}`)
      }
    }),

    maintenanceReminder: (equipment, scheduledTime) => addNotification({
      type: 'info',
      title: 'Maintenance Scheduled',
      message: `${equipment} maintenance at ${scheduledTime}`,
      duration: 8000
    }),

    productionMilestone: (milestone, value) => addNotification({
      type: 'success',
      title: 'Production Milestone',
      message: `${milestone}: ${value} units completed`,
      duration: 5000
    })
  }

  const financialNotifications = {
    riskAlert: (riskType, level) => addNotification({
      type: level === 'high' ? 'error' : 'warning',
      title: `Risk Alert - ${riskType}`,
      message: `${level.toUpperCase()} risk level detected`,
      duration: 0,
      action: {
        label: 'Review',
        onClick: () => console.log('Navigate to risk dashboard')
      }
    }),

    tradeExecution: (symbol, quantity, price) => addNotification({
      type: 'success',
      title: 'Trade Executed',
      message: `${quantity} shares of ${symbol} at $${price}`,
      duration: 3000
    }),

    complianceAlert: (regulation, issue) => addNotification({
      type: 'warning',
      title: `Compliance Alert - ${regulation}`,
      message: issue,
      duration: 0,
      action: {
        label: 'Address',
        onClick: () => console.log('Navigate to compliance dashboard')
      }
    })
  }

  return {
    healthcare: healthcareNotifications,
    manufacturing: manufacturingNotifications,
    financial: financialNotifications
  }
}
