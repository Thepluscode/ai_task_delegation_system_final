'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

export function WorkflowStatus({ data }) {
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
        return <PlayIcon className="h-4 w-4" />
      case 'paused':
        return <PauseIcon className="h-4 w-4" />
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <ClipboardDocumentListIcon className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'paused':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Workflow Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active workflow monitoring
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((workflow) => (
          <div key={workflow.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {workflow.name}
                </h4>
                <Badge 
                  variant={getStatusVariant(workflow.status)}
                  className="flex items-center space-x-1"
                >
                  {getStatusIcon(workflow.status)}
                  <span className="capitalize">{workflow.status}</span>
                </Badge>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {workflow.tasks} tasks
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {workflow.progress}%
                </span>
              </div>
              <Progress value={workflow.progress} className="h-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-green-600">
              {data.filter(w => w.status === 'active').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-600">
              {data.filter(w => w.status === 'paused').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Paused</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.reduce((acc, w) => acc + w.tasks, 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
