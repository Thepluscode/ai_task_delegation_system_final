import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'
import { MockApiProvider } from '@/components/providers/MockApiProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Enhanced Automation Platform',
    template: '%s | Enhanced Automation Platform'
  },
  description: 'World\'s first edge-cloud hybrid automation platform with sub-millisecond decision making',
  keywords: ['AI', 'automation', 'robots', 'edge computing', 'safety monitoring', 'task delegation'],
  authors: [{ name: 'Enhanced Automation Team' }],
  creator: 'Enhanced Automation Platform',
  publisher: 'Enhanced Automation Platform',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Enhanced Automation Platform - Sub-Millisecond Edge Processing',
    description: 'World\'s first edge-cloud hybrid automation platform. 100x faster than competitors with real-time safety monitoring.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Enhanced Automation Platform',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Automation Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Automation Platform',
    description: 'Comprehensive AI-powered automation platform for workflows, robots, and task management',
    images: ['/images/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <MockApiProvider>
          <Providers>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </Providers>
        </MockApiProvider>
      </body>
    </html>
  )
}
