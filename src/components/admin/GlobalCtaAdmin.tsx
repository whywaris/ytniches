'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Check } from 'lucide-react'
import type { GlobalCta } from '@/types'

export function GlobalCtaAdmin() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [isActive, setIsActive] = useState(true)
  const [heading, setHeading] = useState('')
  const [subheading, setSubheading] = useState('')
  const [primaryText, setPrimaryText] = useState('')
  const [primaryUrl, setPrimaryUrl] = useState('')
  const [secondaryText, setSecondaryText] = useState('')
  const [secondaryUrl, setSecondaryUrl] = useState('')

  useEffect(() => {
    fetch('/api/admin/global-cta')
      .then(r => r.json())
      .then((data: GlobalCta) => {
        if (data?.id) {
          setIsActive(data.is_active)
          setHeading(data.heading)
          setSubheading(data.subheading)
          setPrimaryText(data.primary_button_text)
          setPrimaryUrl(data.primary_button_url)
          setSecondaryText(data.secondary_button_text)
          setSecondaryUrl(data.secondary_button_url)
        }
        setIsLoading(false)
      })
  }, [])

  async function handleSave() {
    setIsSaving(true)
    await fetch('/api/admin/global-cta', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_active: isActive,
        heading,
        subheading,
        primary_button_text: primaryText,
        primary_button_url: primaryUrl,
        secondary_button_text: secondaryText,
        secondary_button_url: secondaryUrl,
      }),
    })
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-48 text-sm text-[#8A7F72]"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#1A1612]">CTA Settings</h1>
        <p className="text-sm text-[#8A7F72] mt-1">One global CTA — shows on every page automatically.</p>
      </div>

      <div className="bg-white border border-[#E0D9CE] rounded-2xl p-6 space-y-5">
        {/* Active toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E0D9CE]">
          <div>
            <p className="text-sm font-semibold text-[#1A1612]">Show CTA on all pages</p>
            <p className="text-xs text-[#8A7F72] mt-0.5">Toggle off to hide sitewide</p>
          </div>
          <button onClick={() => setIsActive(!isActive)}
            className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-[#E8402A]' : 'bg-[#E0D9CE]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Heading */}
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Heading</label>
          <input type="text" value={heading} onChange={e => setHeading(e.target.value)}
            placeholder="e.g. Start Growing Your YouTube Channel Today"
            className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
        </div>

        {/* Subheading */}
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Subheading</label>
          <input type="text" value={subheading} onChange={e => setSubheading(e.target.value)}
            placeholder="e.g. Browse 1,200+ curated niches..."
            className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
        </div>

        {/* Primary Button */}
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Primary Button</label>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={primaryText} onChange={e => setPrimaryText(e.target.value)} placeholder="Button text"
              className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            <input type="text" value={primaryUrl} onChange={e => setPrimaryUrl(e.target.value)} placeholder="/signup"
              className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
          </div>
        </div>

        {/* Secondary Button */}
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Secondary Button</label>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={secondaryText} onChange={e => setSecondaryText(e.target.value)} placeholder="Button text"
              className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            <input type="text" value={secondaryUrl} onChange={e => setSecondaryUrl(e.target.value)} placeholder="/pricing"
              className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${saved ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'bg-[#E8402A] text-white hover:bg-[#c42e2e] disabled:opacity-50'}`}>
            {saved ? <><Check className="w-4 h-4" />Saved!</> : isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <p className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-3">Live Preview</p>
        <div className="w-full bg-[#1A1612] rounded-2xl px-8 py-12 text-center">
          {!isActive ? (
            <p className="text-white/30 text-sm">CTA is hidden (toggle is off)</p>
          ) : (
            <>
              <h2 className="font-display text-2xl font-black text-white mb-3">{heading || 'Your heading here'}</h2>
              {subheading && <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">{subheading}</p>}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {primaryText && <span className="px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold">{primaryText}</span>}
                {secondaryText && <span className="px-6 py-3 bg-white/10 text-white rounded-full text-sm font-semibold">{secondaryText}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
