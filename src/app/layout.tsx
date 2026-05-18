import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/components/dashboard/AuthProvider'
import './globals.css'

// ─── Google Fonts ──────────────────────────────────────────────────────────────
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-fraunces',
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://ytniches.com'),
  title: {
    default: 'YTNiches — Find Your Perfect YouTube Niche',
    template: '%s'
  },
  description: 'Discover 1,200+ profitable YouTube niches with video ideas, title templates, script hooks & 30-day content calendars. Find your perfect niche today.',
  keywords: [
    'youtube niche ideas',
    'youtube niche research',
    'profitable youtube niches',
    'youtube channel ideas',
    'youtube video ideas',
    'how to find youtube niche',
    'best youtube niches 2025',
    'youtube content ideas',
    'youtube cpm niches',
    'low competition youtube niches'
  ],
  authors: [{ name: 'YTNiches', url: 'https://ytniches.com' }],
  creator: 'YTNiches',
  publisher: 'YTNiches',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ytniches.com',
    siteName: 'YTNiches',
    title: 'YTNiches — Find Your Perfect YouTube Niche',
    description: 'Discover 1,200+ profitable YouTube niches with video ideas, title templates & 30-day content calendars.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YTNiches — YouTube Niche Research Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YTNiches — Find Your Perfect YouTube Niche',
    description: 'Discover 1,200+ profitable YouTube niches with video ideas, title templates & 30-day content calendars.',
    images: ['/og-image.png'],
    creator: '@ytniches',
  },
  alternates: {
    canonical: 'https://ytniches.com',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YTNiches',
  },
}

export const viewport: Viewport = {
  themeColor: '#F5F0E8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background antialiased overflow-x-hidden">
        <AuthProvider>
          <ToastProvider>
            <main className="flex-1">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
