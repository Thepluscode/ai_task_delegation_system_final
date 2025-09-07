'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

export function RobotOverview({ data }) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'maintenance':
        return <WrenchScrewdriverIcon className="h-4 w-4" />
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <CpuChipIcon className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'maintenance':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'secondary'
    }
  }

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return 'text-red-600'
    if (utilization >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <CpuChipIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Robot Overview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI agent status and utilization
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((robot) => (
          <div key={robot.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {robot.name}
                </h4>
                <Badge 
                  variant={getStatusVariant(robot.status)}
                  className="flex items-center space-x-1"
                >
                  {getStatusIcon(robot.status)}
                  <span className="capitalize">{robot.status}</span>
                </Badge>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {robot.tasks} tasks
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                <span className={`font-medium ${getUtilizationColor(robot.utilization)}`}>
                  {robot.utilization}%
                </span>
              </div>
              <Progress value={robot.utilization} className="h-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-green-600">
              {data.filter(r => r.status === 'active').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-600">
              {data.filter(r => r.status === 'maintenance').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Maintenance</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">
              {Math.round(data.reduce((acc, r) => acc + r.utilization, 0) / data.length)}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Utilization</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
