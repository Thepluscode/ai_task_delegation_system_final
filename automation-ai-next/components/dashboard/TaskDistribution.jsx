'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ChartPieIcon } from '@heroicons/react/24/outline'

export function TaskDistribution({ data }) {
  // Enhanced validation to prevent undefined errors
  if (!data || !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0 ||
      !data.datasets[0].data || !data.labels || !Array.isArray(data.labels)) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  const total = data.datasets[0].data.reduce((a, b) => a + b, 0)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <ChartPieIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Task Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tasks by industry sector
            </p>
          </div>
        </div>
        <Badge variant="primary">Real-time</Badge>
      </div>

      {/* Pie Chart Visualization */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          {/* Simple donut chart using CSS */}
          <div className="w-full h-full rounded-full border-8 border-gray-200 dark:border-gray-700 relative overflow-hidden">
            {data.labels && data.labels.map((label, index) => {
              const dataValue = data.datasets[0].data[index] || 0
              const percentage = total > 0 ? (dataValue / total) * 100 : 0
              const rotation = data.datasets[0].data.slice(0, index).reduce((acc, val) => acc + (val / total) * 360, 0)
              const backgroundColor = data.datasets[0].backgroundColor && data.datasets[0].backgroundColor[index]
                ? data.datasets[0].backgroundColor[index]
                : `hsl(${index * 60}, 70%, 50%)`

              return (
                <div
                  key={index}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from ${rotation}deg, ${backgroundColor} 0deg, ${backgroundColor} ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((rotation + percentage * 3.6) * Math.PI / 180)}% ${50 + 50 * Math.sin((rotation + percentage * 3.6) * Math.PI / 180)}%, 50% 50%)`
                  }}
                />
              )
            })}
          </div>
          
          {/* Center circle */}
          <div className="absolute inset-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.labels && data.labels.map((label, index) => {
          const value = data.datasets[0].data[index] || 0
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
          const backgroundColor = data.datasets[0].backgroundColor && data.datasets[0].backgroundColor[index]
            ? data.datasets[0].backgroundColor[index]
            : `hsl(${index * 60}, 70%, 50%)`

          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor }}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {value}
                </span>
                <Badge variant="outline" className="text-xs">
                  {percentage}%
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.labels ? data.labels.length : 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Industries</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">
              {data.labels && data.labels.length > 0 ? data.labels[0] : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Top Sector</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
