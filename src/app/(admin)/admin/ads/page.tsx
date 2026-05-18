'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, X, Loader2, Check, Eye, EyeOff } from 'lucide-react'
import type { BannerAd, AdPlacement } from '@/types'

const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  sidebar: 'Sidebar',
  inline: 'Between Content',
  footer: 'Footer',
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<BannerAd[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [clickUrl, setClickUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [placement, setPlacement] = useState<AdPlacement>('inline')

  useEffect(() => { fetchAds() }, [])

  async function fetchAds() {
    const res = await fetch('/api/admin/ads')
    const data = await res.json()
    setAds(Array.isArray(data) ? data : [])
    setIsLoading(false)
  }

  function resetForm() {
    setName(''); setImageUrl(''); setClickUrl(''); setAltText(''); setPlacement('inline')
    setEditingId(null); setShowForm(false)
  }

  function startEdit(ad: BannerAd) {
    setName(ad.name); setImageUrl(ad.image_url); setClickUrl(ad.click_url)
    setAltText(ad.alt_text); setPlacement(ad.placement)
    setEditingId(ad.id); setShowForm(true)
  }

  async function handleSave() {
    if (!name.trim() || !imageUrl.trim()) return
    setSaving(true)

    const payload = {
      name: name.trim(),
      image_url: imageUrl.trim(),
      click_url: clickUrl.trim(),
      alt_text: altText.trim(),
      placement,
      is_active: true,
    }

    if (editingId) {
      const res = await fetch(`/api/admin/ads/${editingId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.id) setAds(prev => prev.map(a => a.id === data.id ? data : a))
    } else {
      const res = await fetch('/api/admin/ads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.id) setAds(prev => [...prev, data])
    }

    setSaving(false)
    resetForm()
  }

  async function toggleActive(ad: BannerAd) {
    const newActive = !ad.is_active
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: newActive } : a))
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newActive }),
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this ad?')) return
    setAds(prev => prev.filter(a => a.id !== id))
    await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' })
  }

  if (isLoading) return <div className="p-8 flex items-center justify-center text-sm text-[#8A7F72]"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A1612]">Banner Ads</h1>
          <p className="text-sm text-[#8A7F72] mt-1">Manage image banner ads across the site</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e]">
          <Plus className="w-4 h-4" />Add Banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-[#E8402A] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[#1A1612]">{editingId ? 'Edit Banner' : 'New Banner'}</h3>
            <button onClick={resetForm} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED]"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sponsor Banner Top"
                className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Placement</label>
              <select value={placement} onChange={e => setPlacement(e.target.value as AdPlacement)}
                className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A] cursor-pointer">
                <option value="inline">Between Content</option>
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Image URL *</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
              className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Click URL</label>
              <input type="url" value={clickUrl} onChange={e => setClickUrl(e.target.value)} placeholder="https://sponsor.com?utm_source=ytniches"
                className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Alt Text</label>
              <input type="text" value={altText} onChange={e => setAltText(e.target.value)} placeholder="Sponsor name banner"
                className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            </div>
          </div>

          {/* Preview */}
          {imageUrl && (
            <div>
              <p className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-2">Preview</p>
              <div className="bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl p-3">
                <img src={imageUrl} alt={altText || 'Preview'} className="max-h-32 rounded-lg object-contain mx-auto" />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t border-[#E0D9CE]">
            <button onClick={resetForm} className="px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8]">Cancel</button>
            <button onClick={handleSave} disabled={!name.trim() || !imageUrl.trim() || saving}
              className="px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-semibold hover:bg-[#c42e2e] disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add Banner'}
            </button>
          </div>
        </div>
      )}

      {/* Ads list */}
      {ads.length === 0 ? (
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-12 text-center text-sm text-[#8A7F72]">
          No banner ads yet. <button onClick={() => setShowForm(true)} className="text-[#E8402A] hover:underline">Add your first banner</button>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className={`bg-white border rounded-2xl p-4 flex items-center gap-4 ${ad.is_active ? 'border-[#E0D9CE]' : 'border-[#E0D9CE] opacity-60'}`}>
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-[#F5F0E8] border border-[#E0D9CE] shrink-0">
                <img src={ad.image_url} alt={ad.alt_text} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-[#1A1612] truncate">{ad.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-[#F5F0E8] text-[#8A7F72] rounded-full">{PLACEMENT_LABELS[ad.placement]}</span>
                  {!ad.is_active && <span className="text-xs px-2 py-0.5 bg-[#FDF0ED] text-[#E8402A] rounded-full">Hidden</span>}
                </div>
                {ad.click_url && <p className="text-xs text-[#C8C0B4] truncate">{ad.click_url}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => toggleActive(ad)} title={ad.is_active ? 'Hide' : 'Show'}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A7F72] hover:text-[#1A1612] hover:bg-[#F5F0E8]">
                  {ad.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => startEdit(ad)} title="Edit"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A7F72] hover:text-[#1A1612] hover:bg-[#F5F0E8]">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(ad.id)} title="Delete"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
