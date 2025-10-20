import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.plounix.xyz'),
  title: {
    default: 'Plounix - Financial Literacy for Filipino Youth',
    template: '%s | Plounix'
  },
  description: 'Master budgeting, saving, and investing with AI-powered guidance designed specifically for Filipino students and young professionals. Learn financial literacy the smart way.',
  keywords: ['financial literacy', 'budgeting', 'saving', 'investing', 'Filipino youth', 'AI financial coach', 'money management', 'Philippines', 'financial education', 'personal finance'],
  authors: [{ name: 'Plounix Team' }],
  creator: 'Plounix',
  publisher: 'Plounix',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: 'https://www.plounix.xyz',
    title: 'Plounix - Financial Literacy for Filipino Youth',
    description: 'Master budgeting, saving, and investing with AI-powered guidance designed specifically for Filipino students and young professionals.',
    siteName: 'Plounix',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Plounix - Financial Literacy Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plounix - Financial Literacy for Filipino Youth',
    description: 'Master budgeting, saving, and investing with AI-powered guidance for Filipino youth.',
    images: ['/og-image.png'],
    creator: '@plounix',
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Add after Google Search Console setup
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
