'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const Switch = React.forwardRef(({ 
  className, 
  checked = false, 
  onCheckedChange,
  disabled = false,
  size = 'default',
  ...props 
}, ref) => {
  const [internalChecked, setInternalChecked] = React.useState(checked)
  
  React.useEffect(() => {
    setInternalChecked(checked)
  }, [checked])

  const handleChange = (event) => {
    const newChecked = event.target.checked
    setInternalChecked(newChecked)
    onCheckedChange?.(newChecked)
  }

  const sizeClasses = {
    sm: 'h-4 w-7',
    default: 'h-6 w-11',
    lg: 'h-7 w-12'
  }

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-5 w-5', 
    lg: 'h-6 w-6'
  }

  const translateClasses = {
    sm: internalChecked ? 'translate-x-3' : 'translate-x-0',
    default: internalChecked ? 'translate-x-5' : 'translate-x-0',
    lg: internalChecked ? 'translate-x-5' : 'translate-x-0'
  }

  return (
    <label
      className={cn(
        'relative inline-flex cursor-pointer items-center',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={internalChecked}
        onChange={handleChange}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      <div
        className={cn(
          'relative rounded-full transition-colors duration-200 ease-in-out',
          sizeClasses[size],
          internalChecked 
            ? 'bg-primary-600 dark:bg-primary-500' 
            : 'bg-gray-200 dark:bg-gray-700',
          disabled && 'opacity-50'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out',
            thumbSizeClasses[size],
            translateClasses[size],
            disabled && 'opacity-50'
          )}
        />
      </div>
    </label>
  )
})

Switch.displayName = 'Switch'

export { Switch }
