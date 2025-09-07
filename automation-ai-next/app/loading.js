import { Card } from '@/components/ui/Card'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary-600 to-ai-600 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          
          {/* Loading Text */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading AI Automation Platform
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Initializing systems and connecting to services...
          </p>
          
          {/* Progress Indicators */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Connecting to API</span>
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Loading Dashboard</span>
              <div className="w-4 h-4 border-2 border-ai-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Initializing WebSocket</span>
              <div className="w-4 h-4 border-2 border-success-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          
          {/* Loading Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-600 to-ai-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
