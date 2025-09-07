'use client'

import { ThemeProvider } from 'next-themes'
import { SWRConfig } from 'swr'
import { AuthProvider } from '@/lib/context/AuthContext'
import { NotificationProvider } from '@/lib/context/NotificationContext'
import { WorkflowProvider } from '@/lib/context/WorkflowContext'

// SWR configuration
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
  onError: (error, key) => {
    console.error('SWR Error:', error, 'Key:', key)
    
    // Don't show error notifications for auth-related errors
    if (error.status !== 401 && error.status !== 403) {
      // You can add global error handling here
      // For example, show a toast notification
    }
  },
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Never retry on 404
    if (error.status === 404) return

    // Never retry on 401/403 (auth errors)
    if (error.status === 401 || error.status === 403) return

    // Only retry up to 3 times
    if (retryCount >= 3) return

    // Retry after 5 seconds
    setTimeout(() => revalidate({ retryCount }), 5000)
  },
}

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SWRConfig value={swrConfig}>
        <AuthProvider>
          <NotificationProvider>
            <WorkflowProvider>
              {children}
            </WorkflowProvider>
          </NotificationProvider>
        </AuthProvider>
      </SWRConfig>
    </ThemeProvider>
  )
}
