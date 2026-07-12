import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper'
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SREE BALAJI FRAMES AND GIFTS - Personalized Gifts & Photo Frames',
    template: '%s | SREE BALAJI FRAMES AND GIFTS',
  },
  description: 'Create memorable personalized gifts with custom photo frames, mugs, canvases, and more. Premium quality, fast delivery across India.',
  keywords: ['personalized gifts', 'photo frames', 'custom gifts', 'photo prints', 'custom mugs', 'canvas prints', 'Hyderabad frames'],
  authors: [{ name: 'SREE BALAJI FRAMES AND GIFTS' }],
  creator: 'SREE BALAJI FRAMES AND GIFTS',
  publisher: 'SREE BALAJI FRAMES AND GIFTS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'SREE BALAJI FRAMES AND GIFTS',
    title: 'SREE BALAJI FRAMES AND GIFTS - Personalized Gifts & Photo Frames',
    description: 'Create memorable personalized gifts with custom photo frames, mugs, canvases, and more.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SREE BALAJI FRAMES AND GIFTS - Personalized Gifts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SREE BALAJI FRAMES AND GIFTS - Personalized Gifts & Photo Frames',
    description: 'Create memorable personalized gifts with custom photo frames, mugs, canvases, and more.',
    images: ['/og-image.jpg'],
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            Skip to main content
          </a>
          <MainLayoutWrapper>
            {children}
          </MainLayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}