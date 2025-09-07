'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 max-w-lg w-full">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
              404
            </div>
            <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          
          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
          
          {/* Navigation Options */}
          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full flex items-center justify-center space-x-2">
                <HomeIcon className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href="/workflows">
                <Button variant="secondary" className="w-full">
                  Workflows
                </Button>
              </Link>
              
              <Link href="/robots">
                <Button variant="secondary" className="w-full">
                  Robots
                </Button>
              </Link>
              
              <Link href="/ai">
                <Button variant="secondary" className="w-full">
                  AI Models
                </Button>
              </Link>
              
              <Link href="/tasks">
                <Button variant="secondary" className="w-full">
                  Tasks
                </Button>
              </Link>
            </div>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
          
          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you believe this is an error, please{' '}
              <a 
                href="mailto:support@automation-platform.com"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                contact support
              </a>
              {' '}or check our{' '}
              <Link 
                href="/docs"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                documentation
              </Link>
              .
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
