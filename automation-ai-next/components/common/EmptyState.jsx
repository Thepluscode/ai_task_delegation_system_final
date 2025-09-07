'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function EmptyState({ 
  title, 
  description, 
  icon: Icon,
  action,
  children 
}) {
  return (
    <Card className="text-center py-12">
      <div className="mx-auto max-w-md">
        {Icon && (
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Icon className="h-full w-full" />
          </div>
        )}
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>
        )}
        
        {action && (
          <div className="flex justify-center">
            {action.href ? (
              <Link href={action.href}>
                <Button variant={action.variant || 'primary'}>
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button 
                variant={action.variant || 'primary'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
        )}
        
        {children}
      </div>
    </Card>
  )
}
