'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CpuChipIcon,
  ServerIcon,
  UsersIcon,
  QueueListIcon
} from '@heroicons/react/24/outline'

export function MetricsCards({ data }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </Card>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Tasks',
      value: data.totalTasks?.toLocaleString() || '0',
      icon: ClipboardDocumentListIcon,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Tasks',
      value: data.activeTasks?.toLocaleString() || '0',
      icon: ClockIcon,
      color: 'yellow',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Completed Tasks',
      value: data.completedTasks?.toLocaleString() || '0',
      icon: CheckCircleIcon,
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Success Rate',
      value: `${data.successRate || 0}%`,
      icon: ChartBarIcon,
      color: 'green',
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      title: 'Avg Processing Time',
      value: `${data.avgProcessingTime || 0}s`,
      icon: ClockIcon,
      color: 'blue',
      change: '-0.3s',
      changeType: 'positive'
    },
    {
      title: 'System Uptime',
      value: `${data.systemUptime || 0}%`,
      icon: ServerIcon,
      color: 'green',
      change: '+0.02%',
      changeType: 'positive'
    },
    {
      title: 'Active Agents',
      value: data.activeAgents?.toLocaleString() || '0',
      icon: UsersIcon,
      color: 'purple',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Queued Tasks',
      value: data.queuedTasks?.toLocaleString() || '0',
      icon: QueueListIcon,
      color: 'orange',
      change: '-5',
      changeType: 'positive'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'success' : 'error'}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    vs last period
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
