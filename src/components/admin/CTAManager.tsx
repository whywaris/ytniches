'use client'

import { useState, useEffect } from 'react'
import { Save, Check, Loader2 } from 'lucide-react'
import type { CTASetting } from '@/types'

const PAGE_LABELS: Record<string, string> = {
  niche_detail: 'Niche Detail Page',
  niche_library: 'Niche Library Page',
}

export function CTAManager() {
  const [settings, setSettings] = useState<CTASetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    const res = await fetch('/api/admin/cta-settings')
    const data = await res.json() as CTASetting[]
    setSettings(data)
    setIsLoading(false)
  }

  function updateLocal(page: string, field: string, value: string | boolean) {
    setSettings(prev => prev.map(s =>
      s.page === page ? { ...s, [field]: value } : s
    ))
  }

  async function saveSetting(page: string) {
    const setting = settings.find(s => s.page === page)
    if (!setting) return
    setSaving(page)
    await fetch(`/api/admin/cta-settings/${page}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setting),
    })
    setSaving(null)
    setSaved(page)
    setTimeout(() => setSaved(null), 2000)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-32 text-sm text-[#8A7F72]">
      Loading CTA settings…
    </div>
  )

  return (
    <div className="space-y-6">
      {settings.map(setting => (
        <div key={setting.page} className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9CE] bg-[#FAFAF8]">
            <div>
              <h3 className="font-semibold text-[#1A1612] text-sm">
                {PAGE_LABELS[setting.page] ?? setting.page}
              </h3>
              <p className="text-xs text-[#8A7F72] mt-0.5">
                CTA shown at the bottom of {PAGE_LABELS[setting.page] ?? setting.page}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${setting.is_active ? 'text-[#2A7A4B]' : 'text-[#8A7F72]'}`}>
                {setting.is_active ? 'Active' : 'Disabled'}
              </span>
              <button
                type="button"
                onClick={() => {
                  updateLocal(setting.page, 'is_active', !setting.is_active)
                  setTimeout(() => saveSetting(setting.page), 100)
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  setting.is_active ? 'bg-[#E8402A]' : 'bg-[#E0D9CE]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  setting.is_active ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Heading</label>
                <input
                  type="text"
                  value={setting.heading}
                  onChange={e => updateLocal(setting.page, 'heading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Subheading</label>
                <input
                  type="text"
                  value={setting.subheading}
                  onChange={e => updateLocal(setting.page, 'subheading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Primary Button Text</label>
                <input
                  type="text"
                  value={setting.button_text}
                  onChange={e => updateLocal(setting.page, 'button_text', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Primary Button URL</label>
                <input
                  type="text"
                  value={setting.button_url}
                  onChange={e => updateLocal(setting.page, 'button_url', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Secondary Button Text</label>
                <input
                  type="text"
                  value={setting.button_secondary_text}
                  onChange={e => updateLocal(setting.page, 'button_secondary_text', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Secondary Button URL</label>
                <input
                  type="text"
                  value={setting.button_secondary_url}
                  onChange={e => updateLocal(setting.page, 'button_secondary_url', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                />
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-xl overflow-hidden border border-[#E0D9CE]">
              <div className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider px-3 py-2 bg-[#FAFAF8] border-b border-[#E0D9CE]">
                Preview
              </div>
              <div className="bg-[#1A1612] p-6 text-center">
                <h3 className="font-display text-xl font-black text-white mb-2">{setting.heading}</h3>
                <p className="text-xs text-white/60 mb-4">{setting.subheading}</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <span className="px-4 py-2 bg-[#E8402A] text-white rounded-full text-xs font-semibold">
                    {setting.button_text}
                  </span>
                  <span className="px-4 py-2 bg-white/10 text-white rounded-full text-xs font-semibold">
                    {setting.button_secondary_text}
                  </span>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => saveSetting(setting.page)}
                disabled={saving === setting.page}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  saved === setting.page
                    ? 'bg-[#EBF5EF] text-[#2A7A4B] border border-[#C2E0CE]'
                    : 'bg-[#E8402A] text-white hover:bg-[#CF3520]'
                } disabled:opacity-60`}
              >
                {saving === setting.page ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                ) : saved === setting.page ? (
                  <><Check className="w-3.5 h-3.5" /> Saved!</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
