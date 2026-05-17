'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { PromptFieldManager } from './PromptFieldManager'
import { NichePromptForm } from './NichePromptForm'
import type { NichePromptRecord, PromptFieldValue } from '@/types'

export function AdminNichePromptsClient() {
  const [prompts, setPrompts] = useState<NichePromptRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/admin/niche-prompts')
      const data: unknown = await res.json()
      if (!res.ok) {
        setFetchError((data as { error?: string })?.error ?? 'Failed to load')
        setPrompts([])
      } else {
        setPrompts(Array.isArray(data) ? (data as NichePromptRecord[]) : [])
      }
    } catch {
      setFetchError('Network error')
      setPrompts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void fetchPrompts() }, [fetchPrompts])

  async function handleDelete(id: string) {
    await fetch(`/api/admin/niche-prompts/${id}`, { method: 'DELETE' })
    setDeleteConfirmId(null)
    void fetchPrompts()
  }

  function openEdit(id: string) {
    setEditingId(id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  const filtered = prompts.filter((p) =>
    p.channel_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">

      {/* ── Section 1: Field Manager ── */}
      <div>
        <div className="mb-4">
          <h2 className="font-display font-bold text-2xl text-[#1A1612]">Prompts</h2>
          <p className="text-sm text-[#8A7F72] mt-1">
            Manage prompt fields and niche prompt content.
          </p>
        </div>
        <PromptFieldManager />
      </div>

      <hr className="border-[#E0D9CE]" />

      {/* ── Section 2: Niche Prompts List ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-[#1A1612]">Niche Prompts</h3>
            <p className="text-sm text-[#8A7F72]">Add prompt content for individual niches.</p>
          </div>
          <button
            onClick={() => { setEditingId(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Niche Prompt
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-[#E0D9CE] rounded-xl px-3 py-2 mb-4 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#8A7F72] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by channel name..."
            className="bg-transparent border-none outline-none text-sm text-[#1A1612] w-full placeholder:text-[#C8C0B4]"
          />
        </div>

        {/* States */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#8A7F72]">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading prompts...
          </div>
        ) : fetchError ? (
          <div className="text-center py-10">
            <p className="text-sm font-semibold text-[#E8402A]">{fetchError}</p>
            <button onClick={() => { void fetchPrompts() }} className="mt-2 text-xs text-[#E8402A] underline">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#8A7F72]">
            <p className="text-sm font-semibold mb-1">
              {search ? 'No results found' : 'No niche prompts yet'}
            </p>
            {!search && (
              <button
                onClick={() => { setEditingId(null); setShowForm(true) }}
                className="mt-2 text-xs font-semibold text-[#E8402A] hover:underline"
              >
                + Add your first niche prompt
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((prompt) => {
              const isExpanded = expandedId === prompt.id
              const fieldValues = prompt.field_values ?? []
              const filledFields = fieldValues.filter((fv) => fv.value?.trim())

              return (
                <div
                  key={prompt.id}
                  className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden"
                >
                  {/* Row header */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1A1612] truncate">
                          {prompt.channel_name}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[#F5F0E8] text-[#8A7F72] rounded-full shrink-0">
                          {filledFields.length} field{filledFields.length !== 1 ? 's' : ''} filled
                        </span>
                      </div>
                      {prompt.channel_url && (
                        <a
                          href={prompt.channel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[#E8402A] hover:underline mt-0.5 w-fit"
                        >
                          {prompt.channel_url.replace('https://', '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEdit(prompt.id)}
                        className="w-7 h-7 rounded-lg bg-[#F5F0E8] flex items-center justify-center text-[#8A7F72] hover:text-[#1A1612] hover:bg-[#E0D9CE] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(prompt.id)}
                        className="w-7 h-7 rounded-lg bg-[#F5F0E8] flex items-center justify-center text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                        className="w-7 h-7 rounded-lg bg-[#F5F0E8] flex items-center justify-center text-[#8A7F72] hover:text-[#1A1612] hover:bg-[#E0D9CE] transition-colors"
                      >
                        {isExpanded
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <ChevronDown className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded field values */}
                  {isExpanded && (
                    <div className="border-t border-[#E0D9CE] px-5 py-4 bg-[#FAFAF8] space-y-4">
                      {filledFields.length === 0 ? (
                        <p className="text-sm text-[#8A7F72] text-center py-2">No fields filled yet.</p>
                      ) : (
                        filledFields.map((fv: PromptFieldValue) => (
                          <div key={fv.id}>
                            <p className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1">
                              {fv.field?.name ?? 'Unknown field'}
                            </p>
                            <p className="text-sm text-[#1A1612] whitespace-pre-wrap leading-relaxed bg-white border border-[#E0D9CE] rounded-xl px-4 py-3">
                              {fv.value}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <NichePromptForm
          editingId={editingId}
          onClose={closeForm}
          onSaved={() => { void fetchPrompts() }}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-xl p-6 w-80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF0ED] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#E8402A]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1A1612]">Delete this niche prompt?</p>
                <p className="text-xs text-[#8A7F72]">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { void handleDelete(deleteConfirmId) }}
                className="flex-1 px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#CF3520] transition-colors"
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
