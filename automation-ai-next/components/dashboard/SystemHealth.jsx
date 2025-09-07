'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export function SystemHealth({ data }) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const getHealthColor = (value) => {
    if (value >= 80) return 'text-red-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getHealthStatus = () => {
    const avgHealth = (data.cpu + data.memory + data.disk + data.network) / 4
    if (avgHealth >= 80) return { status: 'Critical', variant: 'error' }
    if (avgHealth >= 60) return { status: 'Warning', variant: 'warning' }
    return { status: 'Healthy', variant: 'success' }
  }

  const healthStatus = getHealthStatus()

  const metrics = [
    {
      label: 'CPU Usage',
      value: data.cpu,
      icon: CpuChipIcon,
      unit: '%'
    },
    {
      label: 'Memory Usage',
      value: data.memory,
      icon: CircleStackIcon,
      unit: '%'
    },
    {
      label: 'Disk Usage',
      value: data.disk,
      icon: ServerIcon,
      unit: '%'
    },
    {
      label: 'Network I/O',
      value: data.network,
      icon: GlobeAltIcon,
      unit: '%'
    },
    {
      label: 'Temperature',
      value: data.temperature,
      icon: FireIcon,
      unit: '°C',
      isTemperature: true
    }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <ServerIcon className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Health
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time system monitoring
            </p>
          </div>
        </div>
        <Badge variant={healthStatus.variant}>
          {healthStatus.status}
        </Badge>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const isHigh = metric.isTemperature ? metric.value > 60 : metric.value > 80
          const isMedium = metric.isTemperature ? metric.value > 45 : metric.value > 60
          
          return (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 flex-1">
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </span>
                    <span className={`font-medium ${
                      isHigh ? 'text-red-600' : 
                      isMedium ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                  {!metric.isTemperature && (
                    <Progress value={metric.value} className="h-2" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Uptime */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              System Uptime
            </span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {data.uptime}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="px-3 py-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
          View Logs
        </button>
        <button className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          System Info
        </button>
      </div>
    </Card>
  )
}
