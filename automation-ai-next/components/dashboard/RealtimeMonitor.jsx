'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

export function RealtimeMonitor({ data }) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'processing':
        return <ClockIcon className="h-4 w-4" />
      case 'failed':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const getTaskStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'secondary'
    }
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'error':
        return <XCircleIcon className="h-4 w-4" />
      case 'info':
        return <InformationCircleIcon className="h-4 w-4" />
      default:
        return <InformationCircleIcon className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type) => {
    switch (type) {
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      case 'info':
        return 'primary'
      default:
        return 'secondary'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - new Date(timestamp)
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <BoltIcon className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Real-time Monitor
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Live task activity and system alerts
            </p>
          </div>
        </div>
        <Badge variant="success" className="animate-pulse">
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Recent Tasks
          </h4>
          <div className="space-y-3">
            {data.recentTasks?.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={getTaskStatusVariant(task.status)}
                    className="flex items-center space-x-1"
                  >
                    {getTaskStatusIcon(task.status)}
                    <span className="capitalize">{task.status}</span>
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.type} Task #{task.id}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatTimeAgo(task.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            System Alerts
          </h4>
          <div className="space-y-3">
            {data.alerts?.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Badge 
                  variant={getAlertVariant(alert.type)}
                  className="flex items-center space-x-1 mt-0.5"
                >
                  {getAlertIcon(alert.type)}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {formatTimeAgo(alert.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-green-600">
              {data.recentTasks?.filter(t => t.status === 'completed').length || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-600">
              {data.recentTasks?.filter(t => t.status === 'processing').length || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Processing</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600">
              {data.recentTasks?.filter(t => t.status === 'failed').length || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Failed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">
              {data.alerts?.length || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Alerts</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
