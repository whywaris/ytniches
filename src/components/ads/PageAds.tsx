'use client'

import { AdSlot } from './AdSlot'

interface PageAdsProps {
  children: React.ReactNode
}

/**
 * Wraps page content with ad slots (top + bottom).
 * Use on tools, blog, and public pages.
 * Ads only show if enabled in admin panel.
 */
export function PageAds({ children }: PageAdsProps) {
  return (
    <>
      <AdSlot position="top" />
      {children}
      <AdSlot position="bottom" />
    </>
  )
}

/**
 * Sidebar ad slot — use in pages with sidebar layout.
 */
export function SidebarAd() {
  return <AdSlot position="sidebar" />
}
