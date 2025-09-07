'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon
} from '@heroicons/react/24/outline'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  const handleReportError = () => {
    // Send error report to monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }
    
    // In a real app, send this to your error tracking service
    console.log('Error report:', errorReport)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 max-w-lg w-full">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-error-100 dark:bg-error-900 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-error-600 dark:text-error-400" />
            </div>
          </div>
          
          {/* Error Message */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </p>
          
          {/* Error Details (in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Error Details:
              </h3>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                {error.message}
              </pre>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full flex items-center justify-center space-x-2"
              variant="primary"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => window.location.href = '/'}
                variant="secondary"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Go Home</span>
              </Button>
              
              <button
                onClick={handleReportError}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BugAntIcon className="w-4 h-4" />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>
              If this problem persists, please contact our support team at{' '}
              <a 
                href="mailto:support@automation-platform.com" 
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                support@automation-platform.com
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
