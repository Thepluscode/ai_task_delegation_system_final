'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function FilterPanel({ filters = [], onClose, onApply, onReset }) {
  const [filterValues, setFilterValues] = useState({})

  const handleFilterChange = (filterId, value) => {
    setFilterValues(prev => ({
      ...prev,
      [filterId]: value
    }))
  }

  const handleApply = () => {
    if (onApply) {
      onApply(filterValues)
    }
  }

  const handleReset = () => {
    setFilterValues({})
    if (onReset) {
      onReset()
    }
  }

  const renderFilter = (filter, index) => {
    const filterId = filter.id || `filter-${index}`
    const value = filterValues[filterId] || ''

    switch (filter.type) {
      case 'select':
        return (
          <Select
            key={filterId}
            label={filter.label}
            value={value}
            onChange={(newValue) => handleFilterChange(filterId, newValue)}
            options={filter.options || []}
            placeholder={filter.placeholder}
          />
        )
      
      case 'input':
        return (
          <Input
            key={filterId}
            label={filter.label}
            type={filter.inputType || 'text'}
            value={value}
            onChange={(e) => handleFilterChange(filterId, e.target.value)}
            placeholder={filter.placeholder}
          />
        )
      
      case 'daterange':
        return (
          <div key={filterId} className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {filter.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="From"
                value={value.from || ''}
                onChange={(e) => handleFilterChange(filterId, { ...value, from: e.target.value })}
              />
              <Input
                type="date"
                placeholder="To"
                value={value.to || ''}
                onChange={(e) => handleFilterChange(filterId, { ...value, to: e.target.value })}
              />
            </div>
          </div>
        )
      
      case 'range':
        return (
          <div key={filterId} className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {filter.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={value.min || ''}
                onChange={(e) => handleFilterChange(filterId, { ...value, min: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max"
                value={value.max || ''}
                onChange={(e) => handleFilterChange(filterId, { ...value, max: e.target.value })}
              />
            </div>
          </div>
        )
      
      case 'checkbox':
        return (
          <div key={filterId} className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {filter.label}
            </label>
            <div className="space-y-2">
              {filter.options?.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value.includes?.(option.value) || false}
                    onChange={(e) => {
                      const currentValues = value || []
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value)
                      handleFilterChange(filterId, newValues)
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter, index) => renderFilter(filter, index))}
        </div>
        
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-primary-200 dark:border-primary-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Reset
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
