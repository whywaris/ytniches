'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export function AdsenseScript() {
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ads')
      .then((res) => res.json())
      .then((data) => {
        if (data.adsense_enabled && data.adsense_client_id) {
          setClientId(data.adsense_client_id)
        }
      })
      .catch(() => {})
  }, [])

  if (!clientId) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  )
}
