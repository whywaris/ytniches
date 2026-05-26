'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const GA_ID = 'G-TP1Z050E8V'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

// Excluded routes — inhe GA mein track nahi karenge
const EXCLUDED_PATHS = ['/admin', '/dashboard']

function isExcludedPath(pathname: string | null): boolean {
  if (!pathname) return false
  return EXCLUDED_PATHS.some(path => pathname.startsWith(path))
}

export function GoogleAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (isExcludedPath(pathname)) return

    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, {
        page_path: pathname,
      })
    }
  }, [pathname])

  // Excluded pages par script load hi nahi hogi
  if (isExcludedPath(pathname)) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
