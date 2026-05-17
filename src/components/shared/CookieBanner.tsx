'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

const CONSENT_KEY = 'cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'all')
    setVisible(false)
  }

  function essentialOnly() {
    localStorage.setItem(CONSENT_KEY, 'essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto sm:left-auto sm:right-6 sm:mx-0"
    >
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] shadow-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 bg-[#FDF0ED] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-4 h-4 text-[#E8402A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1A1612] text-sm mb-1">We use cookies</p>
            <p className="text-xs text-[#8A7F72] leading-relaxed">
              We use essential cookies to make our site work and optional analytics cookies to improve it.{' '}
              <Link href="/cookies" className="text-[#E8402A] hover:underline">Learn more</Link>
            </p>
          </div>
          <button
            onClick={essentialOnly}
            className="text-[#8A7F72] hover:text-[#1A1612] transition-colors shrink-0"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 bg-[#E8402A] text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={essentialOnly}
            className="flex-1 border border-[#E0D9CE] text-[#1A1612] text-xs font-bold px-4 py-2.5 rounded-full hover:bg-[#F5F0E8] transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  )
}
