'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function AnnouncementBar() {
  const [message, setMessage] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/admin/announcement-settings')
      .then((res) => res.json())
      .then((data) => {
        const s = data?.settings
        if (s && s.public_enabled && s.public_text) {
          const wasDismissed = localStorage.getItem('ab-public-dismissed')
          if (wasDismissed === s.public_text) {
            setDismissed(true)
          } else {
            setMessage(s.public_text)
          }
        }
      })
      .catch(() => {})
  }, [])

  function handleDismiss() {
    setDismissed(true)
    if (message) localStorage.setItem('ab-public-dismissed', message)
  }

  if (dismissed || !message) return null

  return (
    <div className="bg-[#1A1612] text-white text-center text-sm py-2.5 px-10 relative">
      <span className="text-[#F5F0E8]">{message}</span>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A7F72] hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
