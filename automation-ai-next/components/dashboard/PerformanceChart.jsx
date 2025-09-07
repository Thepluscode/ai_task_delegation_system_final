'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export function PerformanceChart({ data }) {
  // Enhanced validation to prevent undefined errors
  if (!data || !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0 || !data.datasets[0].data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  // Simple chart visualization using CSS
  const maxValue = Math.max(...data.datasets[0].data)
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Overview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tasks processed and success rate over time
            </p>
          </div>
        </div>
        <Badge variant="success">Live</Badge>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 mb-6">
        {data.datasets && data.datasets.map((dataset, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: dataset.borderColor || '#3B82F6' }}
            ></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {dataset.label || `Dataset ${index + 1}`}
            </span>
          </div>
        ))}
      </div>

      {/* Simple Bar Chart */}
      <div className="space-y-4">
        {data.labels && data.labels.map((label, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
              <div className="flex space-x-4">
                {data.datasets && data.datasets.map((dataset, datasetIndex) => (
                  <span key={datasetIndex} className="text-gray-900 dark:text-white font-medium">
                    {dataset.data && dataset.data[index] !== undefined ? dataset.data[index] : 0}
                    {datasetIndex === 1 ? '%' : ''}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              {data.datasets && data.datasets.map((dataset, datasetIndex) => (
                <div key={datasetIndex} className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: dataset.borderColor || '#3B82F6',
                      width: `${((dataset.data && dataset.data[index] !== undefined ? dataset.data[index] : 0) / (datasetIndex === 1 ? 100 : maxValue)) * 100}%`
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.datasets && data.datasets[0] && data.datasets[0].data
                ? data.datasets[0].data.reduce((a, b) => a + b, 0)
                : 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {data.datasets && data.datasets[1] && data.datasets[1].data && data.datasets[1].data.length > 0
                ? Math.round(data.datasets[1].data.reduce((a, b) => a + b, 0) / data.datasets[1].data.length)
                : 0}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {data.datasets && data.datasets[0] && data.datasets[0].data && data.datasets[0].data.length > 0
                ? Math.round(data.datasets[0].data.reduce((a, b) => a + b, 0) / data.datasets[0].data.length)
                : 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Tasks/Period</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
