'use client'

import { Button } from './Button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = ""
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Icon className="h-full w-full" />
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <Button onClick={action} className="inline-flex items-center">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
