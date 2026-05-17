'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Bell, MessageSquare, Megaphone, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Prefs {
  weekly_digest: boolean
  niche_alerts: boolean
  request_updates: boolean
  product_updates: boolean
  unsubscribed_all: boolean
}

const PREF_ITEMS = [
  {
    key: 'weekly_digest' as keyof Prefs,
    icon: Mail,
    label: 'Weekly Niche Digest',
    description: 'Every Monday — new niches, featured niche, and top community requests',
  },
  {
    key: 'niche_alerts' as keyof Prefs,
    icon: Bell,
    label: 'Niche Alerts',
    description: 'When niches in your saved categories are added to the library',
  },
  {
    key: 'request_updates' as keyof Prefs,
    icon: MessageSquare,
    label: 'Request Updates',
    description: 'When your niche requests change status (approved, completed, rejected)',
  },
  {
    key: 'product_updates' as keyof Prefs,
    icon: Megaphone,
    label: 'Product Updates',
    description: 'New features, improvements, and important announcements',
  },
]

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8402A] focus:ring-offset-2 shrink-0',
        checked ? 'bg-[#E8402A]' : 'bg-[#E0D9CE]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

export default function EmailPreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>({
    weekly_digest: true,
    niche_alerts: true,
    request_updates: true,
    product_updates: true,
    unsubscribed_all: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    async function loadPrefs() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('email_preferences')
        .select('weekly_digest, niche_alerts, request_updates, product_updates, unsubscribed_all')
        .eq('user_id', user.id)
        .single()

      if (data) setPrefs(data as Prefs)
      setIsLoading(false)
    }
    loadPrefs()
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function updatePref(key: keyof Prefs, value: boolean) {
    setSavingKey(key)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingKey(null); return }

    const { error } = await supabase
      .from('email_preferences')
      .upsert({ user_id: user.id, [key]: value }, { onConflict: 'user_id' })

    if (!error) {
      setPrefs(prev => ({ ...prev, [key]: value }))
      showToast('Email preferences updated ✓')
    }
    setSavingKey(null)
  }

  async function unsubscribeAll() {
    setSavingKey('unsubscribed_all')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingKey(null); return }

    const newValue = !prefs.unsubscribed_all
    const { error } = await supabase
      .from('email_preferences')
      .upsert({ user_id: user.id, unsubscribed_all: newValue }, { onConflict: 'user_id' })

    if (!error) {
      setPrefs(prev => ({ ...prev, unsubscribed_all: newValue }))
      showToast(newValue ? 'Unsubscribed from all emails ✓' : 'Re-subscribed to emails ✓')
    }
    setSavingKey(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#8A7F72]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link */}
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 text-sm text-[#8A7F72] hover:text-[#1A1612] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl text-[#1A1612] mb-1">Email Preferences</h1>
          <p className="text-[#8A7F72] text-sm">Choose which emails you receive from YTNiches.</p>
        </div>

        {/* Prefs card */}
        <div className="bg-white border border-[#E0D9CE] rounded-2xl divide-y divide-[#F0EBE3] mb-6">
          {PREF_ITEMS.map(({ key, icon: Icon, label, description }) => (
            <div
              key={key}
              className={cn(
                'flex items-start gap-4 p-5',
                prefs.unsubscribed_all && key !== 'unsubscribed_all' && 'opacity-50'
              )}
            >
              <div className="w-9 h-9 bg-[#F5F0E8] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-[#8A7F72]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1612] mb-0.5">{label}</p>
                <p className="text-xs text-[#8A7F72]">{description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {savingKey === key && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8A7F72]" />}
                <Toggle
                  checked={prefs[key] as boolean}
                  onChange={() => updatePref(key, !(prefs[key] as boolean))}
                  disabled={savingKey !== null || (prefs.unsubscribed_all && key !== 'unsubscribed_all')}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Unsubscribe all */}
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#1A1612] mb-0.5">
                {prefs.unsubscribed_all ? '⚠️ Currently unsubscribed from all emails' : '⚠️ Unsubscribe from all emails'}
              </p>
              <p className="text-xs text-[#8A7F72]">
                You will still receive transactional emails (receipts, password resets, account security).
              </p>
            </div>
            <button
              onClick={unsubscribeAll}
              disabled={savingKey !== null}
              className={cn(
                'shrink-0 text-xs font-bold px-4 py-2 rounded-full border transition-colors',
                prefs.unsubscribed_all
                  ? 'bg-[#E8402A] text-white border-[#E8402A] hover:bg-[#CF3520]'
                  : 'border-[#E8402A] text-[#E8402A] hover:bg-[#FDF0ED]',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {savingKey === 'unsubscribed_all' && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
              {prefs.unsubscribed_all ? 'Re-subscribe' : 'Unsubscribe from all'}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#8A7F72] text-center">
          Changes are saved automatically.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1A1612] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg z-50">
          <Check className="w-4 h-4 text-[#2A7A4B]" />
          {toast}
        </div>
      )}
    </div>
  )
}
