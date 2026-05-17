'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AdSettings {
  id?: string
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

const DEFAULT_SETTINGS: AdSettings = {
  adsense_enabled: false,
  adsense_client_id: '',
  adsense_slot_top: '',
  adsense_slot_sidebar: '',
  adsense_slot_bottom: '',
  custom_ads_enabled: false,
  custom_ad_top_html: '',
  custom_ad_sidebar_html: '',
  custom_ad_bottom_html: '',
}

export function AdsManager({ initialSettings }: { initialSettings: AdSettings | null }) {
  const [settings, setSettings] = useState<AdSettings>(initialSettings ?? DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  function update(key: keyof AdSettings, value: string | boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const { id, ...data } = settings

    if (id) {
      await supabase.from('ad_settings').update(data).eq('id', id)
    } else {
      const { data: newRow } = await supabase.from('ad_settings').insert(data).select().single()
      if (newRow) setSettings((prev) => ({ ...prev, id: newRow.id }))
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Google AdSense Section */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-[#1A1612] text-lg">Google AdSense</h2>
            <p className="text-xs text-[#8A7F72] mt-0.5">Show AdSense ads on tools, blog, and public pages</p>
          </div>
          <button
            onClick={() => update('adsense_enabled', !settings.adsense_enabled)}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              settings.adsense_enabled ? 'bg-[#2A7A4B]' : 'bg-[#E0D9CE]'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              settings.adsense_enabled ? 'translate-x-6' : 'translate-x-0.5'
            )} />
          </button>
        </div>

        {settings.adsense_enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">AdSense Client ID</label>
              <input
                type="text"
                value={settings.adsense_client_id}
                onChange={(e) => update('adsense_client_id', e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Top Slot ID</label>
                <input
                  type="text"
                  value={settings.adsense_slot_top}
                  onChange={(e) => update('adsense_slot_top', e.target.value)}
                  placeholder="1234567890"
                  className="w-full border border-[#E0D9CE] rounded-xl px-4 py-2.5 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Sidebar Slot ID</label>
                <input
                  type="text"
                  value={settings.adsense_slot_sidebar}
                  onChange={(e) => update('adsense_slot_sidebar', e.target.value)}
                  placeholder="1234567890"
                  className="w-full border border-[#E0D9CE] rounded-xl px-4 py-2.5 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Bottom Slot ID</label>
                <input
                  type="text"
                  value={settings.adsense_slot_bottom}
                  onChange={(e) => update('adsense_slot_bottom', e.target.value)}
                  placeholder="1234567890"
                  className="w-full border border-[#E0D9CE] rounded-xl px-4 py-2.5 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Ads Section */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-[#1A1612] text-lg">Custom Ads</h2>
            <p className="text-xs text-[#8A7F72] mt-0.5">Show custom HTML/image ads (affiliate banners, sponsors, etc.)</p>
          </div>
          <button
            onClick={() => update('custom_ads_enabled', !settings.custom_ads_enabled)}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              settings.custom_ads_enabled ? 'bg-[#2A7A4B]' : 'bg-[#E0D9CE]'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              settings.custom_ads_enabled ? 'translate-x-6' : 'translate-x-0.5'
            )} />
          </button>
        </div>

        {settings.custom_ads_enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Top Ad (HTML)</label>
              <textarea
                value={settings.custom_ad_top_html}
                onChange={(e) => update('custom_ad_top_html', e.target.value)}
                placeholder='<a href="https://..."><img src="..." alt="Ad" /></a>'
                rows={3}
                className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] font-mono focus:outline-none focus:border-[#E8402A] resize-y"
              />
              <p className="text-[10px] text-[#8A7F72] mt-1">Shows above tool/blog content</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Sidebar Ad (HTML)</label>
              <textarea
                value={settings.custom_ad_sidebar_html}
                onChange={(e) => update('custom_ad_sidebar_html', e.target.value)}
                placeholder='<a href="https://..."><img src="..." alt="Ad" /></a>'
                rows={3}
                className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] font-mono focus:outline-none focus:border-[#E8402A] resize-y"
              />
              <p className="text-[10px] text-[#8A7F72] mt-1">Shows in sidebar on desktop</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Bottom Ad (HTML)</label>
              <textarea
                value={settings.custom_ad_bottom_html}
                onChange={(e) => update('custom_ad_bottom_html', e.target.value)}
                placeholder='<a href="https://..."><img src="..." alt="Ad" /></a>'
                rows={3}
                className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] font-mono focus:outline-none focus:border-[#E8402A] resize-y"
              />
              <p className="text-[10px] text-[#8A7F72] mt-1">Shows below tool/blog content</p>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#E8402A] text-white font-bold text-sm px-7 py-3 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
