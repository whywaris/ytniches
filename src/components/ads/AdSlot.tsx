'use client'

import { useEffect, useState } from 'react'

interface AdSettings {
  adsense_enabled: boolean
  adsense_client_id: string
  adsense_slot_top: string
  adsense_slot_sidebar: string
  adsense_slot_bottom: string
  custom_ads_enabled: boolean
  custom_ad_top_html: string
  custom_ad_sidebar_html: string
  custom_ad_bottom_html: string
}

type Position = 'top' | 'sidebar' | 'bottom'

interface AdSlotProps {
  position: Position
}

let cachedSettings: AdSettings | null = null
let fetchPromise: Promise<AdSettings> | null = null

function getSettings(): Promise<AdSettings> {
  if (cachedSettings) return Promise.resolve(cachedSettings)
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch('/api/ads')
    .then((res) => res.json())
    .then((data) => {
      cachedSettings = data
      return data
    })

  return fetchPromise
}

export function AdSlot({ position }: AdSlotProps) {
  const [settings, setSettings] = useState<AdSettings | null>(cachedSettings)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  if (!settings) return null

  const showAdsense = settings.adsense_enabled
  const showCustom = settings.custom_ads_enabled

  if (!showAdsense && !showCustom) return null

  const adsenseSlot = position === 'top'
    ? settings.adsense_slot_top
    : position === 'sidebar'
    ? settings.adsense_slot_sidebar
    : settings.adsense_slot_bottom

  const customHtml = position === 'top'
    ? settings.custom_ad_top_html
    : position === 'sidebar'
    ? settings.custom_ad_sidebar_html
    : settings.custom_ad_bottom_html

  return (
    <div className="ad-slot my-6">
      {/* Custom Ad */}
      {showCustom && customHtml && (
        <div
          className="custom-ad rounded-xl overflow-hidden text-center"
          dangerouslySetInnerHTML={{ __html: customHtml }}
        />
      )}

      {/* AdSense */}
      {showAdsense && settings.adsense_client_id && adsenseSlot && (
        <div className="adsense-ad text-center my-4">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={settings.adsense_client_id}
            data-ad-slot={adsenseSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
    </div>
  )
}
