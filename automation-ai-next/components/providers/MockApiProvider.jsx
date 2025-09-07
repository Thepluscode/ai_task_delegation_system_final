'use client'

import { useEffect } from 'react'
import { setupMockApi } from '@/lib/utils/mockApi'

export function MockApiProvider({ children }) {
  useEffect(() => {
    // Only setup mock API in development or when backend services are not available
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
      console.log('🎭 Setting up Mock API for investor presentation mode')
      setupMockApi()
    }
  }, [])

  return children
}
