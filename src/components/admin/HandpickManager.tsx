'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, X, Loader2 } from 'lucide-react'
import { HandpickNiche, HandpickNicheForm } from '@/types'
import { CATEGORIES } from '@/config/categories'

const EMPTY_FORM: HandpickNicheForm = {
  channel_name: '',
  image_url: '',
  channel_url: '',
  category: '',
  monthly_earning_range: '',
  niche_tags: [],
  subscribers: '',
  channel_age: '',
  is_hot: false,
  is_pro_only: false,
  published: true,
}

const EARNING_RANGES = [
  '$500 – $2,000/mo',
  '$1,000 – $3,000/mo',
  '$2,000 – $5,000/mo',
  '$3,000 – $8,000/mo',
  '$5,000 – $15,000/mo',
  '$10,000 – $30,000/mo',
  '$20,000 – $50,000/mo',
  '$50,000+/mo',
]

const SUGGESTED_TAGS = [
  'High CPM', 'Low Competition', 'Faceless', 'Trending 2025',
  'AI Niche', 'Growing Fast', 'No Face Needed', 'Medium CPM',
  'Passion Niche', 'Easy to Start', 'High Views', 'Viral Potential',
]

function Toggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
        value ? 'bg-[#E8402A]' : 'bg-[#E0D9CE]'
      }`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function HandpickManager() {
  const [niches, setNiches] = useState<HandpickNiche[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<HandpickNicheForm>(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [imgError, setImgError] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchNiches = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/admin/handpick')
      const data: unknown = await res.json()
      if (!res.ok) {
        const errMsg = (data as { error?: string })?.error ?? 'Failed to load'
        setFetchError(errMsg)
        setNiches([])
      } else {
        setNiches(Array.isArray(data) ? (data as HandpickNiche[]) : [])
      }
    } catch {
      setFetchError('Network error — could not reach API')
      setNiches([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void fetchNiches() }, [fetchNiches])

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setTagInput('')
    setImgError(false)
    setShowModal(true)
  }

  function openEdit(n: HandpickNiche) {
    setForm({
      channel_name: n.channel_name,
      image_url: n.image_url,
      channel_url: n.channel_url,
      category: n.category,
      monthly_earning_range: n.monthly_earning_range,
      niche_tags: [...n.niche_tags],
      subscribers: n.subscribers,
      channel_age: n.channel_age,
      is_hot: n.is_hot,
      is_pro_only: n.is_pro_only,
      published: n.published,
    })
    setEditingId(n.id)
    setTagInput('')
    setImgError(false)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setTagInput('')
  }

  function addTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed || form.niche_tags.includes(trimmed)) return
    setForm((p) => ({ ...p, niche_tags: [...p.niche_tags, trimmed] }))
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm((p) => ({ ...p, niche_tags: p.niche_tags.filter((t) => t !== tag) }))
  }

  function setField<K extends keyof HandpickNicheForm>(k: K, v: HandpickNicheForm[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSave() {
    if (!form.channel_name || !form.image_url || !form.channel_url || !form.category || !form.monthly_earning_range) {
      alert('Please fill all required fields.')
      return
    }
    setIsSaving(true)
    try {
      const url = editingId ? `/api/admin/handpick/${editingId}` : '/api/admin/handpick'
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data: unknown = await res.json()
      if (!res.ok) {
        const msg = (data as { error?: string })?.error ?? 'Save failed'
        alert(`Error: ${msg}`)
        return
      }
      closeModal()
      void fetchNiches()
    } catch {
      alert('Network error — could not save. Check console.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/handpick/${id}`, { method: 'DELETE' })
    setDeleteConfirmId(null)
    void fetchNiches()
  }

  async function toggleField(niche: HandpickNiche, field: 'published' | 'is_hot') {
    await fetch(`/api/admin/handpick/${niche.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !niche[field] }),
    })
    void fetchNiches()
  }

  const filtered = niches.filter((n) => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      !q ||
      n.channel_name.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      (n.niche_tags ?? []).some((t) => t.toLowerCase().includes(q))
    const matchCat = !filterCategory || n.category === filterCategory
    return matchSearch && matchCat
  })

  const stats = [
    { label: 'Total', value: niches.length },
    { label: 'Published', value: niches.filter((n) => n.published).length },
    { label: 'Hot 🔥', value: niches.filter((n) => n.is_hot).length },
    { label: 'Pro Only', value: niches.filter((n) => n.is_pro_only).length },
  ]

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#E0D9CE] rounded-2xl p-4">
            <p className="text-xs text-[#8A7F72] mb-1">{s.label}</p>
            <p className="font-display text-2xl font-bold text-[#1A1612]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar + Add button */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-[#E0D9CE] rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 text-[#8A7F72] shrink-0" />
          <input
            type="text"
            placeholder="Search channels, categories, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#1A1612] w-full placeholder:text-[#C8C0B4]"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-[#E0D9CE] rounded-xl text-sm text-[#1A1612] outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add HandPick Niche
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-sm text-[#8A7F72]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
          <p className="text-sm font-semibold text-[#E8402A]">Failed to load handpick niches</p>
          <p className="text-xs text-[#8A7F72] max-w-sm">{fetchError}</p>
          <button
            onClick={() => { void fetchNiches() }}
            className="mt-2 text-xs font-semibold text-[#E8402A] underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-sm text-[#8A7F72] gap-3">
          <p>No handpick niches found.</p>
          <button onClick={openAdd} className="text-[#E8402A] font-medium text-sm hover:underline">
            + Add your first one
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0D9CE] bg-[#FAFAF8]">
                  {['Channel', 'Category', 'Earning Range', 'Subscribers', 'Age', 'Tags', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#8A7F72] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((niche, i) => (
                  <tr
                    key={niche.id}
                    className={`hover:bg-[#FAFAF8] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#E0D9CE]' : ''}`}
                  >
                    {/* Channel */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F5F0E8] border border-[#E0D9CE] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={niche.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-[#1A1612]">{niche.channel_name}</span>
                            {niche.is_hot && <span className="text-xs">🔥</span>}
                          </div>
                          <a
                            href={niche.channel_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#E8402A] hover:underline"
                          >
                            View →
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-[#F5F0E8] text-[#8A7F72] rounded-full whitespace-nowrap">
                        {niche.category}
                      </span>
                    </td>

                    {/* Earning range */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-[#2A7A4B] bg-[#EBF5EF] px-2 py-1 rounded-full whitespace-nowrap">
                        {niche.monthly_earning_range}
                      </span>
                    </td>

                    {/* Subscribers */}
                    <td className="px-4 py-3 text-sm text-[#1A1612]">{niche.subscribers}</td>

                    {/* Age */}
                    <td className="px-4 py-3 text-sm text-[#8A7F72] whitespace-nowrap">{niche.channel_age}</td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap max-w-40">
                        {niche.niche_tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-[#F0EBE3] text-[#8A7F72] rounded-full whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                        {niche.niche_tags.length > 2 && (
                          <span className="text-xs text-[#8A7F72]">+{niche.niche_tags.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => { void toggleField(niche, 'published') }}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                            niche.published ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'bg-[#F5F0E8] text-[#8A7F72]'
                          }`}
                        >
                          {niche.published ? 'Published' : 'Draft'}
                        </button>
                        {niche.is_pro_only && (
                          <span className="text-xs px-2 py-0.5 bg-[#EDE8FF] text-[#5B47CC] rounded-full font-medium">
                            Pro Only
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { void toggleField(niche, 'is_hot') }}
                          title={niche.is_hot ? 'Remove hot' : 'Mark as hot'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors ${
                            niche.is_hot ? 'bg-orange-100' : 'bg-[#F5F0E8] hover:bg-orange-50'
                          }`}
                        >
                          🔥
                        </button>
                        <button
                          onClick={() => { void toggleField(niche, 'published') }}
                          title={niche.published ? 'Unpublish' : 'Publish'}
                          className="w-7 h-7 rounded-lg bg-[#F5F0E8] flex items-center justify-center text-[#8A7F72] hover:text-[#2A7A4B] hover:bg-[#EBF5EF] transition-colors"
                        >
                          {niche.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openEdit(niche)}
                          className="w-7 h-7 rounded-lg bg-[#F5F0E8] flex items-center justify-center text-[#8A7F72] hover:text-[#1A1612] hover:bg-[#E0D9CE] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(niche.id)}
                          className="w-7 h-7 rounded-lg bg-[#F5F0E8] flex items-center justify-center text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9CE] shrink-0">
              <h3 className="font-display text-xl font-bold text-[#1A1612]">
                {editingId ? 'Edit HandPick Niche' : 'Add New HandPick Niche'}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A7F72] hover:bg-[#F5F0E8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Image URL + preview */}
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                  Image URL *
                </label>
                <div className="flex gap-3 items-start">
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => { setField('image_url', e.target.value); setImgError(false) }}
                    placeholder="https://yt3.googleusercontent.com/..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                  />
                  <div className="w-12 h-12 rounded-full border border-[#E0D9CE] bg-[#F5F0E8] overflow-hidden shrink-0 flex items-center justify-center text-sm text-[#8A7F72] font-bold">
                    {form.image_url && !imgError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      form.channel_name.charAt(0) || '?'
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#8A7F72] mt-1">
                  Tip: Copy avatar URL from YouTube channel page source (yt3.googleusercontent.com)
                </p>
              </div>

              {/* Channel Name + URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={form.channel_name}
                    onChange={(e) => setField('channel_name', e.target.value)}
                    placeholder="e.g. Finance Facts Daily"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                    Channel URL *
                  </label>
                  <input
                    type="url"
                    value={form.channel_url}
                    onChange={(e) => setField('channel_url', e.target.value)}
                    placeholder="https://youtube.com/@channel"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                  Niche Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors bg-white"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Earning range */}
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                  Monthly Earning Range *
                </label>
                <select
                  value={form.monthly_earning_range}
                  onChange={(e) => setField('monthly_earning_range', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors bg-white"
                >
                  <option value="">Select earning range...</option>
                  {EARNING_RANGES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-xs text-[#8A7F72] mt-1">Estimated monthly YouTube revenue for channels in this niche</p>
              </div>

              {/* Subscribers + Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                    Subscribers
                  </label>
                  <input
                    type="text"
                    value={form.subscribers}
                    onChange={(e) => setField('subscribers', e.target.value)}
                    placeholder="e.g. 7.2K"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                    Channel Age
                  </label>
                  <input
                    type="text"
                    value={form.channel_age}
                    onChange={(e) => setField('channel_age', e.target.value)}
                    placeholder="e.g. 4 months"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                  Niche Tags
                </label>
                {form.niche_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.niche_tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#F5F0E8] text-[#1A1612] rounded-full border border-[#E0D9CE]"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-[#8A7F72] hover:text-[#E8402A] transition-colors ml-0.5 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) }
                      if (e.key === ',') { e.preventDefault(); addTag(tagInput) }
                    }}
                    placeholder="Type a tag and press Enter..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                  />
                  <button
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#F5F0E8] text-sm text-[#1A1612] font-medium hover:bg-[#E0D9CE] transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-[#8A7F72] mb-1.5">Quick add:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_TAGS.filter((t) => !form.niche_tags.includes(t)).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="text-xs px-2.5 py-1 bg-[#F5F0E8] text-[#8A7F72] rounded-full border border-[#E0D9CE] hover:border-[#E8402A] hover:text-[#E8402A] transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                {(
                  [
                    { key: 'is_hot', label: '🔥 Mark as Hot', desc: 'Show flame badge on card' },
                    { key: 'is_pro_only', label: '🔒 Pro Only', desc: 'Only visible to Pro users' },
                    { key: 'published', label: '👁 Published', desc: 'Visible on public site' },
                  ] as const
                ).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start gap-2">
                    <Toggle value={form[key]} onChange={(v) => setField(key, v)} />
                    <div>
                      <p className="text-sm font-medium text-[#1A1612]">{label}</p>
                      <p className="text-xs text-[#8A7F72]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E0D9CE] shrink-0">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { void handleSave() }}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-full text-sm bg-[#E8402A] text-white font-semibold hover:bg-[#CF3520] disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Add HandPick Niche'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-xl p-6 w-80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF0ED] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#E8402A]" />
              </div>
              <div>
                <p className="font-semibold text-[#1A1612] text-sm">Delete HandPick Niche?</p>
                <p className="text-xs text-[#8A7F72]">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { void handleDelete(deleteConfirmId) }}
                className="px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#CF3520] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
