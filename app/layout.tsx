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
    default: 'Plounix - AI Financial Literacy for Filipino Young Adults | Learn Budgeting & Investing',
    template: '%s | Plounix'
  },
  description: 'AI-powered financial literacy platform for Filipino young adults (18-25). Master budgeting, saving & investing with personalized guidance from Fili AI. Build smart money habits and achieve your financial goals. 🇵🇭',
  keywords: [
    'financial literacy Philippines',
    'AI financial advisor Philippines',
    'budgeting app Philippines',
    'Filipino young adults money management',
    'young professional finance Philippines',
    'AI financial coach',
    'learn investing Philippines',
    'personal finance for Filipinos',
    'financial education young adults',
    'emergency fund calculator',
    '50-30-20 budget rule',
    'savings goal tracker',
    'expense tracker Philippines',
    'financial planning young professionals',
    'peso budgeting app',
    'Filipino financial literacy',
    'financial education platform',
    'AI money coach Philippines',
    'smart savings Philippines',
    'young adult financial goals',
    'millennial finance Philippines',
    'Gen Z money management',
    'financial wellness Philippines',
    'money habits for young adults'
  ],
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
    title: 'Plounix - AI Financial Literacy for Filipino Young Adults 🇵🇭',
    description: 'AI-powered financial coach for Filipino young adults (18-25). Master budgeting, saving & investing with personalized guidance. Build wealth with smart money habits! 💰',
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
    title: 'Plounix - AI Financial Coach for Filipino Young Adults 🇵🇭',
    description: 'AI-powered financial literacy for Filipino young adults (18-25). Learn budgeting, saving & investing with personalized guidance. Build wealth the smart way! 💰',
    images: ['/og-image.png'],
    creator: '@plounix',
    site: '@plounix',
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
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
