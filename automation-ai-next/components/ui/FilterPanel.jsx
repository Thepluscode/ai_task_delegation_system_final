'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  FunnelIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export function FilterPanel({ 
  filters = {}, 
  onFiltersChange, 
  availableFilters = {},
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (category, value) => {
    const newFilters = { ...localFilters }
    
    if (!newFilters[category]) {
      newFilters[category] = []
    }
    
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter(item => item !== value)
    } else {
      newFilters[category] = [...newFilters[category], value]
    }
    
    if (newFilters[category].length === 0) {
      delete newFilters[category]
    }
    
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    onFiltersChange?.({})
  }

  const getActiveFilterCount = () => {
    return Object.values(localFilters).reduce((count, filterArray) => {
      return count + (Array.isArray(filterArray) ? filterArray.length : 0)
    }, 0)
  }

  const activeCount = getActiveFilterCount()

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <FunnelIcon className="w-4 h-4" />
        <span>Filters</span>
        {activeCount > 0 && (
          <Badge variant="primary" className="ml-2">
            {activeCount}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
            <div className="flex items-center space-x-2">
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(availableFilters).map(([category, options]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {category.replace('_', ' ')}
                </h4>
                <div className="space-y-1">
                  {options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters[category]?.includes(option) || false}
                        onChange={() => handleFilterChange(category, option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(availableFilters).length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No filters available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(localFilters).map(([category, values]) =>
            values.map((value) => (
              <Badge
                key={`${category}-${value}`}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span className="text-xs">
                  {category}: {value}
                </span>
                <button
                  onClick={() => handleFilterChange(category, value)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Preset filter configurations for common use cases
export const agentFilters = {
  status: ['active', 'idle', 'maintenance', 'offline'],
  type: ['ai_agent', 'human_agent', 'hybrid_agent'],
  specialization: ['healthcare', 'manufacturing', 'banking', 'logistics', 'retail'],
  performance: ['excellent', 'good', 'average', 'needs_improvement'],
  availability: ['available', 'busy', 'scheduled_maintenance']
}

export const taskFilters = {
  status: ['pending', 'in_progress', 'completed', 'failed'],
  priority: ['low', 'medium', 'high', 'critical'],
  type: ['automation', 'analysis', 'monitoring', 'optimization'],
  industry: ['healthcare', 'manufacturing', 'banking', 'logistics', 'retail']
}

export const robotFilters = {
  status: ['active', 'idle', 'maintenance', 'offline'],
  type: ['industrial_arm', 'mobile_robot', 'autonomous_vehicle', 'collaborative_robot'],
  manufacturer: ['ABB', 'KUKA', 'Universal Robots', 'Boston Dynamics', 'Amazon Robotics'],
  location: ['Zone A', 'Zone B', 'Zone C', 'Warehouse', 'Factory Floor']
}
