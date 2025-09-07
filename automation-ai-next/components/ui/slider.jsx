'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const Slider = React.forwardRef(({ 
  className, 
  min = 0, 
  max = 100, 
  step = 1, 
  value = [0], 
  onValueChange,
  disabled = false,
  orientation = 'horizontal',
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value)
  
  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (event) => {
    const newValue = [Number(event.target.value)]
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  const percentage = ((internalValue[0] - min) / (max - min)) * 100

  return (
    <div
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        orientation === 'vertical' && 'h-full w-4 flex-col',
        className
      )}
      ref={ref}
      {...props}
    >
      <div
        className={cn(
          'relative w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800',
          orientation === 'horizontal' ? 'h-2' : 'w-2 h-full'
        )}
      >
        <div
          className={cn(
            'absolute bg-primary-600 dark:bg-primary-400',
            orientation === 'horizontal' 
              ? 'h-full transition-all' 
              : 'w-full transition-all'
          )}
          style={{
            [orientation === 'horizontal' ? 'width' : 'height']: `${percentage}%`
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={internalValue[0]}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
          disabled && 'cursor-not-allowed',
          orientation === 'vertical' && 'writing-mode-vertical-lr'
        )}
      />
      <div
        className={cn(
          'absolute w-5 h-5 border-2 border-primary-600 dark:border-primary-400 bg-white dark:bg-gray-900 rounded-full shadow-lg transition-all',
          'hover:scale-110 focus:scale-110',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          [orientation === 'horizontal' ? 'left' : 'bottom']: `calc(${percentage}% - 10px)`
        }}
      />
    </div>
  )
})

Slider.displayName = 'Slider'

export { Slider }
