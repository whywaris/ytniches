'use client'

import { useState, useEffect } from 'react'
import { X, Megaphone } from 'lucide-react'

export function DashboardAnnouncementBar() {
  const [message, setMessage] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/admin/announcement-settings')
      .then((res) => res.json())
      .then((data) => {
        const s = data?.settings
        if (s && s.dashboard_enabled && s.dashboard_text) {
          const wasDismissed = localStorage.getItem('ab-dashboard-dismissed')
          if (wasDismissed === s.dashboard_text) {
            setDismissed(true)
          } else {
            setMessage(s.dashboard_text)
          }
        }
      })
      .catch(() => {})
  }, [])

  function handleDismiss() {
    setDismissed(true)
    if (message) localStorage.setItem('ab-dashboard-dismissed', message)
  }

  if (dismissed || !message) return null

  return (
    <div className="bg-[#1A1612] text-white text-sm py-2.5 px-4 flex items-center justify-center gap-2 relative">
      <Megaphone className="w-3.5 h-3.5 text-[#E8402A] shrink-0" />
      <span>{message}</span>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A7F72] hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
