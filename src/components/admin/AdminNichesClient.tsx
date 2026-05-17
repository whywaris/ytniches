'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, X, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_NAMES } from '@/config/categories'

interface Niche {
  id: string
  name: string
  slug: string
  channel_name: string | null
  channel_url: string | null
  category: string
  category_slug: string | null
  content_type: string | null
  estimated_earning: string | null
  is_premium: boolean
  is_hot: boolean
  subscribers: string | null
  views_day: string | null
  total_videos: string | null
  total_views: string | null
  channel_age: string | null
  thumbnail_url_1: string | null
  thumbnail_url_2: string | null
  thumbnail_url_3: string | null
  published: boolean
  created_at: string
}


export function AdminNichesClient({ niches: initial }: { niches: Niche[] }) {
  const [niches, setNiches] = useState(initial)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Niche | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [channelName, setChannelName] = useState('')
  const [channelUrl, setChannelUrl] = useState('')
  const [category, setCategory] = useState(CATEGORY_NAMES[0])
  const [subscribers, setSubscribers] = useState('')
  const [isHot, setIsHot] = useState(false)
  const [thumb1, setThumb1] = useState('')

  const filtered = niches.filter((n) =>
    (n.channel_name ?? n.name).toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  )

  function resetForm() {
    setName(''); setChannelName(''); setChannelUrl(''); setCategory(CATEGORY_NAMES[0])
    setSubscribers(''); setIsHot(false); setThumb1('')
    setEditing(null); setShowForm(false)
  }

  function startEdit(niche: Niche) {
    setName(niche.name ?? '')
    setChannelName(niche.channel_name ?? '')
    setChannelUrl(niche.channel_url ?? '')
    setCategory(niche.category)
    setSubscribers(niche.subscribers ?? '')
    setIsHot(niche.is_hot ?? false)
    setThumb1(niche.thumbnail_url_1 ?? '')
    setEditing(niche)
    setShowForm(true)
  }

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function handleSave() {
    if (!name.trim() && !channelName.trim()) return
    setSaving(true)

    const displayName = channelName.trim() || name.trim()

    const payload = {
      name: name.trim() || displayName,
      channel_name: channelName.trim() || null,
      slug: generateSlug(displayName),
      channel_url: channelUrl.trim() || null,
      category,
      subscribers: subscribers.trim() || null,
      is_hot: isHot,
      is_premium: false,
      thumbnail_url_1: thumb1.trim() || null,
      published: true,
    }

    console.log('[AdminNiches] Saving payload:', payload)

    if (editing) {
      const res = await fetch('/api/admin/niches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...payload }),
      })
      const data = await res.json()
      console.log('[AdminNiches] PATCH response:', res.status, data)
      if (res.ok && data.niche) {
        setNiches((prev) => prev.map((n) => (n.id === data.niche.id ? data.niche : n)))
      } else {
        alert(`Error updating: ${data.error ?? 'Unknown error'}`)
        setSaving(false)
        return
      }
    } else {
      const res = await fetch('/api/admin/niches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      console.log('[AdminNiches] POST response:', res.status, data)
      if (res.ok && data.niche) {
        setNiches((prev) => [data.niche, ...prev])
      } else {
        alert(`Error saving: ${data.error ?? 'Unknown error'}`)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    resetForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this niche?')) return
    const res = await fetch('/api/admin/niches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setNiches((prev) => prev.filter((n) => n.id !== id))
    }
  }

  return (
    <div>
      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-[#E8402A] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Niche
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1A1612] text-lg">{editing ? 'Edit Niche' : 'Add New Niche'}</h2>
            <button onClick={resetForm} className="text-[#8A7F72] hover:text-[#1A1612]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Channel Name *</label>
                <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g. Finance Facts Daily" className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Channel URL</label>
                <input type="text" value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} placeholder="https://youtube.com/@channel" className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]">
                  {CATEGORY_NAMES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Subscribers</label>
                <input type="text" value={subscribers} onChange={(e) => setSubscribers(e.target.value)} placeholder="7.0K" className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]" />
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Thumbnail URL (optional)</label>
              <input type="text" value={thumb1} onChange={(e) => setThumb1(e.target.value)} placeholder="https://img.youtube.com/vi/[VIDEO_ID]/mqdefault.jpg" className="w-full border border-[#E0D9CE] rounded-xl px-4 py-2.5 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]" />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-[#1A1612] cursor-pointer">
                <input type="checkbox" checked={isHot} onChange={(e) => setIsHot(e.target.checked)} className="w-4 h-4 rounded border-[#E0D9CE] text-[#FF6B00] focus:ring-[#FF6B00]" />
                🔥 Mark as Hot
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || (!name.trim() && !channelName.trim())}
              className="bg-[#E8402A] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Update Niche' : 'Add Niche'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search niches..." className="pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E0D9CE] rounded-full focus:outline-none focus:border-[#E8402A] w-full sm:w-64" />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[20px] border border-[#E0D9CE] py-12 text-center text-sm text-[#8A7F72]">
            No niches found.
          </div>
        ) : (
          filtered.map((niche) => (
            <div key={niche.id} className="bg-white rounded-[16px] border border-[#E0D9CE] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#1A1612] text-[15px] truncate">{niche.channel_name ?? niche.name}</h3>
                  {niche.is_hot && <span className="text-[10px] font-bold bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full">🔥</span>}
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', niche.is_premium ? 'bg-[#FDF0ED] text-[#E8402A]' : 'bg-[#EBF5EF] text-[#2A7A4B]')}>
                    {niche.is_premium ? 'Pro' : 'Free'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8A7F72]">
                  <span className="font-medium text-[#6B6259]">{niche.category}</span>
                  {niche.subscribers && <span>👥 {niche.subscribers}</span>}
                  {niche.views_day && <span>👁 {niche.views_day}/day</span>}
                  {niche.estimated_earning && <span>💰 {niche.estimated_earning}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(niche)} className="p-2 rounded-lg text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED] transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(niche.id)} className="p-2 rounded-lg text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED] transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
