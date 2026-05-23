'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Trash2, Edit2, X, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { TOOL_STAGES, PRICING_TYPES } from '@/config/automation-stages'
import type { AutomationTool, ToolStage, PricingType } from '@/types'

const EMPTY_FORM = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  website_url: '',
  affiliate_url: '',
  stage: 'niche-research' as ToolStage,
  pricing_type: 'free' as PricingType,
  pricing_note: '',
  logo_initials: '',
  logo_bg_color: '#E8402A',
  logo_text_color: '#FFFFFF',
  logo_url: '',
  is_featured: false,
  is_ytniches_pick: false,
  is_faceless_friendly: false,
  is_new: false,
  is_hot: false,
  has_affiliate: false,
  position: 0,
}

export default function AutomationToolsManager() {
  const { showToast } = useToast()
  const [tools, setTools] = useState<AutomationTool[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [pricingFilter, setPricingFilter] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AutomationTool | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AutomationTool | null>(null)

  // Fetch tools
  const fetchTools = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/automation-tools')
      const data = await res.json()
      if (res.ok) setTools(data.data ?? [])
      else showToast(data.error ?? 'Failed to fetch tools', 'error')
    } catch {
      showToast('Failed to fetch tools', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchTools() }, [fetchTools])

  // Stats
  const stats = useMemo(() => ({
    total: tools.length,
    active: tools.filter(t => t.is_active).length,
    affiliate: tools.filter(t => t.has_affiliate).length,
    faceless: tools.filter(t => t.is_faceless_friendly).length,
  }), [tools])

  // Filtered tools
  const filtered = useMemo(() => {
    let result = tools
    if (stageFilter) result = result.filter(t => t.stage === stageFilter)
    if (pricingFilter) result = result.filter(t => t.pricing_type === pricingFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q)
      )
    }
    return result
  }, [tools, stageFilter, pricingFilter, search])

  // Slug generation
  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  // Open modal for add/edit
  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(tool: AutomationTool) {
    setEditing(tool)
    setForm({
      name: tool.name,
      slug: tool.slug,
      tagline: tool.tagline,
      description: tool.description,
      website_url: tool.website_url,
      affiliate_url: tool.affiliate_url ?? '',
      stage: tool.stage,
      pricing_type: tool.pricing_type,
      pricing_note: tool.pricing_note,
      logo_initials: tool.logo_initials,
      logo_bg_color: tool.logo_bg_color,
      logo_text_color: tool.logo_text_color,
      logo_url: tool.logo_url ?? '',
      is_featured: tool.is_featured,
      is_ytniches_pick: tool.is_ytniches_pick,
      is_faceless_friendly: tool.is_faceless_friendly,
      is_new: tool.is_new,
      is_hot: tool.is_hot,
      has_affiliate: tool.has_affiliate,
      position: tool.position,
    })
    setShowModal(true)
  }

  // Save (create or update)
  async function handleSave() {
    if (!form.name.trim() || !form.tagline.trim() || !form.website_url.trim()) {
      showToast('Name, tagline, and website URL are required', 'error')
      return
    }
    setSaving(true)

    const payload = {
      ...form,
      slug: form.slug || generateSlug(form.name),
      affiliate_url: form.affiliate_url || null,
      logo_url: form.logo_url || null,
    }

    try {
      if (editing) {
        const res = await fetch(`/api/admin/automation-tools/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (res.ok) {
          setTools(prev => prev.map(t => t.id === editing.id ? data.data : t))
          showToast('Tool updated successfully')
          setShowModal(false)
        } else {
          showToast(data.error ?? 'Failed to update', 'error')
        }
      } else {
        const res = await fetch('/api/admin/automation-tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (res.ok) {
          setTools(prev => [...prev, data.data])
          showToast('Tool created successfully')
          setShowModal(false)
        } else {
          showToast(data.error ?? 'Failed to create', 'error')
        }
      }
    } catch {
      showToast('Network error', 'error')
    }
    setSaving(false)
  }

  // Delete
  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/automation-tools/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        setTools(prev => prev.filter(t => t.id !== deleteTarget.id))
        showToast('Tool deleted')
      } else {
        const data = await res.json()
        showToast(data.error ?? 'Failed to delete', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    }
    setDeleteTarget(null)
  }

  // Toggle is_active
  async function toggleActive(tool: AutomationTool) {
    const newValue = !tool.is_active
    // Optimistic update
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, is_active: newValue } : t))
    try {
      const res = await fetch(`/api/admin/automation-tools/${tool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newValue }),
      })
      if (!res.ok) {
        // Revert
        setTools(prev => prev.map(t => t.id === tool.id ? { ...t, is_active: !newValue } : t))
        showToast('Failed to toggle status', 'error')
      }
    } catch {
      setTools(prev => prev.map(t => t.id === tool.id ? { ...t, is_active: !newValue } : t))
      showToast('Network error', 'error')
    }
  }

  // Pricing badge color
  function pricingBadge(type: PricingType) {
    switch (type) {
      case 'free': return 'bg-green-100 text-green-700'
      case 'freemium': return 'bg-amber-100 text-amber-700'
      case 'paid': return 'bg-purple-100 text-purple-700'
    }
  }

  // Stage label
  function stageLabel(stage: ToolStage) {
    return TOOL_STAGES.find(s => s.value === stage)?.label ?? stage
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#E8402A]" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">
            YT Automation Tools
          </h1>
          <p className="text-[#8A7F72] text-sm mt-1">
            Manage the tools directory for YouTube creators
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tools', value: stats.total },
          { label: 'Active Tools', value: stats.active },
          { label: 'With Affiliate', value: stats.affiliate },
          { label: 'Faceless Friendly', value: stats.faceless },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-[16px] border border-[#E0D9CE] p-4">
            <p className="font-display font-bold text-2xl text-[#1A1612]">{value}</p>
            <p className="text-xs text-[#8A7F72] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or tagline..."
            className="pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E0D9CE] rounded-full focus:outline-none focus:border-[#E8402A] w-full"
          />
        </div>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="border border-[#E0D9CE] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#E8402A]"
        >
          <option value="">All Stages</option>
          {TOOL_STAGES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={pricingFilter}
          onChange={e => setPricingFilter(e.target.value)}
          className="border border-[#E0D9CE] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#E8402A]"
        >
          <option value="">All Pricing</option>
          {PRICING_TYPES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <button
          onClick={openAdd}
          className="bg-[#E8402A] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors flex items-center gap-2 ml-auto"
        >
          <Plus className="w-4 h-4" /> Add New Tool
        </button>
      </div>

      {/* Tools Table */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-[#E0D9CE] bg-[#F5F0E8]">
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider">Tool</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider">Pricing</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider">Badges</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider">Active</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CE]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#8A7F72]">
                  No tools found.
                </td>
              </tr>
            ) : (
              filtered.map(tool => (
                <tr key={tool.id} className="hover:bg-[#F5F0E8]/50 transition-colors">
                  {/* Logo + Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {tool.logo_url ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E0D9CE] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: tool.logo_bg_color, color: tool.logo_text_color }}
                        >
                          {tool.logo_initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1A1612] truncate">{tool.name}</p>
                        <p className="text-xs text-[#8A7F72] truncate max-w-[200px]">{tool.tagline}</p>
                      </div>
                    </div>
                  </td>
                  {/* Stage */}
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold bg-[#F5F0E8] text-[#6B6259] px-2 py-1 rounded-full whitespace-nowrap">
                      {stageLabel(tool.stage)}
                    </span>
                  </td>
                  {/* Pricing */}
                  <td className="px-4 py-3">
                    <span className={cn('text-[11px] font-bold px-2 py-1 rounded-full capitalize', pricingBadge(tool.pricing_type))}>
                      {tool.pricing_type}
                    </span>
                  </td>
                  {/* Badges */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tool.is_hot && <span className="text-xs" title="Hot">🔥</span>}
                      {tool.is_ytniches_pick && <span className="text-xs" title="YTNiches Pick">⭐</span>}
                      {tool.is_faceless_friendly && <span className="text-xs" title="Faceless Friendly">🎭</span>}
                      {tool.has_affiliate && <span className="text-xs" title="Affiliate">🔗</span>}
                    </div>
                  </td>
                  {/* Active toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(tool)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        tool.is_active ? 'bg-[#2A7A4B]' : 'bg-[#E0D9CE]'
                      )}
                      aria-label={tool.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                          tool.is_active ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(tool)}
                        className="p-2 rounded-lg text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED] transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(tool)}
                        className="p-2 rounded-lg text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-[20px] border border-[#E0D9CE] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-[#1A1612]">
                {editing ? 'Edit Tool' : 'Add New Tool'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#8A7F72] hover:text-[#1A1612]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Tool Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => {
                      const name = e.target.value
                      setForm(f => ({ ...f, name, slug: editing ? f.slug : generateSlug(name) }))
                    }}
                    placeholder="e.g. VidIQ"
                    className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="auto-generated"
                    className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Tagline * (max 80 chars)</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm(f => ({ ...f, tagline: e.target.value.slice(0, 80) }))}
                  placeholder="Short description for cards"
                  maxLength={80}
                  className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                />
                <p className="text-xs text-[#8A7F72] mt-1">{form.tagline.length}/80</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="~100 words for SEO"
                  rows={4}
                  className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A] resize-none"
                />
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Website URL *</label>
                  <input
                    type="url"
                    value={form.website_url}
                    onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Affiliate URL</label>
                  <input
                    type="url"
                    value={form.affiliate_url}
                    onChange={e => setForm(f => ({ ...f, affiliate_url: e.target.value }))}
                    placeholder="https://example.com?ref=ytniches"
                    className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  />
                </div>
              </div>

              {/* Stage + Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Stage</label>
                  <select
                    value={form.stage}
                    onChange={e => setForm(f => ({ ...f, stage: e.target.value as ToolStage }))}
                    className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  >
                    {TOOL_STAGES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Pricing Type</label>
                  <select
                    value={form.pricing_type}
                    onChange={e => setForm(f => ({ ...f, pricing_type: e.target.value as PricingType }))}
                    className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  >
                    {PRICING_TYPES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Pricing Note</label>
                  <input
                    type="text"
                    value={form.pricing_note}
                    onChange={e => setForm(f => ({ ...f, pricing_note: e.target.value }))}
                    placeholder="Free | Pro $9/mo"
                    className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  />
                </div>
              </div>

              {/* Logo settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Logo Initials (max 2)</label>
                  <input
                    type="text"
                    value={form.logo_initials}
                    onChange={e => setForm(f => ({ ...f, logo_initials: e.target.value.slice(0, 2).toUpperCase() }))}
                    placeholder="VI"
                    maxLength={2}
                    className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Logo BG Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.logo_bg_color}
                      onChange={e => setForm(f => ({ ...f, logo_bg_color: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-[#E0D9CE] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.logo_bg_color}
                      onChange={e => setForm(f => ({ ...f, logo_bg_color: e.target.value }))}
                      className="flex-1 border border-[#E0D9CE] rounded-xl px-3 py-2.5 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Logo Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.logo_text_color}
                      onChange={e => setForm(f => ({ ...f, logo_text_color: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-[#E0D9CE] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.logo_text_color}
                      onChange={e => setForm(f => ({ ...f, logo_text_color: e.target.value }))}
                      className="flex-1 border border-[#E0D9CE] rounded-xl px-3 py-2.5 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Logo Image URL (optional — overrides initials)</label>
                <div className="flex items-center gap-3">
                  {form.logo_url && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#E0D9CE] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                  />
                  {form.logo_url && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
                      className="text-xs text-[#E8402A] font-semibold hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#8A7F72] mt-1">Paste a direct image URL. Displayed as a circle.</p>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#8A7F72]">Preview:</span>
                {form.logo_url ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E0D9CE]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: form.logo_bg_color, color: form.logo_text_color }}
                  >
                    {form.logo_initials || '??'}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {([
                  ['is_featured', 'Featured'],
                  ['is_ytniches_pick', 'YTNiches Pick'],
                  ['is_faceless_friendly', 'Faceless Friendly'],
                  ['is_new', 'Is New'],
                  ['is_hot', 'Is Hot'],
                  ['has_affiliate', 'Has Affiliate'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-[#1A1612] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#E0D9CE] text-[#E8402A] focus:ring-[#E8402A]"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Position */}
              <div className="w-32">
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Position</label>
                <input
                  type="number"
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-[#E0D9CE] text-[#1A1612] font-bold text-sm px-5 py-3 rounded-full hover:bg-[#F5F0E8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#E8402A] text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Update Tool' : 'Save Tool'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-[20px] border border-[#E0D9CE] w-full max-w-sm p-6 text-center">
            <h3 className="font-display font-bold text-lg text-[#1A1612] mb-2">
              Delete &ldquo;{deleteTarget.name}&rdquo;?
            </h3>
            <p className="text-sm text-[#8A7F72] mb-6">This cannot be undone.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-[#E0D9CE] text-[#1A1612] font-bold text-sm px-5 py-3 rounded-full hover:bg-[#F5F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-[#E8402A] text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
