'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Settings {
  public_enabled: boolean
  public_text: string
  dashboard_enabled: boolean
  dashboard_text: string
}

export function AnnouncementSettings() {
  const [settings, setSettings] = useState<Settings>({
    public_enabled: false,
    public_text: '',
    dashboard_enabled: false,
    dashboard_text: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/announcement-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/announcement-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-[#8A7F72]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Public Announcement */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-[#1A1612] text-lg">Public Pages</h2>
            <p className="text-xs text-[#8A7F72] mt-0.5">Shows on Homepage, Tools, Blog, Niches, etc.</p>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, public_enabled: !s.public_enabled }))}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              settings.public_enabled ? 'bg-[#2A7A4B]' : 'bg-[#E0D9CE]'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              settings.public_enabled ? 'translate-x-6' : 'translate-x-0.5'
            )} />
          </button>
        </div>

        {settings.public_enabled && (
          <div>
            <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Announcement Text</label>
            <input
              type="text"
              value={settings.public_text}
              onChange={(e) => setSettings((s) => ({ ...s, public_text: e.target.value }))}
              placeholder="e.g. 🔥 New — 47 niches added this week"
              className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
            />
            {/* Preview */}
            {settings.public_text && (
              <div className="mt-3 bg-[#1A1612] text-white text-center text-sm py-2.5 px-4 rounded-xl">
                {settings.public_text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Announcement */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-[#1A1612] text-lg">Dashboard</h2>
            <p className="text-xs text-[#8A7F72] mt-0.5">Shows for logged-in users in dashboard only</p>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, dashboard_enabled: !s.dashboard_enabled }))}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              settings.dashboard_enabled ? 'bg-[#2A7A4B]' : 'bg-[#E0D9CE]'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              settings.dashboard_enabled ? 'translate-x-6' : 'translate-x-0.5'
            )} />
          </button>
        </div>

        {settings.dashboard_enabled && (
          <div>
            <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Announcement Text</label>
            <input
              type="text"
              value={settings.dashboard_text}
              onChange={(e) => setSettings((s) => ({ ...s, dashboard_text: e.target.value }))}
              placeholder="e.g. 📢 New feature: Titles generator is now live!"
              className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
            />
            {/* Preview */}
            {settings.dashboard_text && (
              <div className="mt-3 bg-[#FDF0ED] border border-[#F5C4BA] text-[#1A1612] text-center text-sm py-2.5 px-4 rounded-xl">
                {settings.dashboard_text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#E8402A] text-white font-bold text-sm px-7 py-3 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}
