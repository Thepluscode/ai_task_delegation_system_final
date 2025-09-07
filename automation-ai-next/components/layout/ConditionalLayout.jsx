'use client'

import { usePathname } from 'next/navigation'
import { ClientLayout } from './ClientLayout'
import { Toaster } from 'react-hot-toast'

export function ConditionalLayout({ children }) {
  const pathname = usePathname()

  // Check if we're on an auth page, root page, or welcome page
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register') ||
                     pathname?.startsWith('/forgot-password')

  const isRootPage = pathname === '/'
  const isWelcomePage = pathname === '/welcome'

  // For auth pages, root page, and welcome page, just return children with minimal styling and toast notifications
  if (isAuthPage || isRootPage || isWelcomePage) {
    return (
      <>
        {children}
        {/* Toast Notifications for auth pages */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </>
    )
  }
  
  // For all other pages, use the full ClientLayout with sidebar and navbar
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  )
}
