'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Eye, EyeOff } from 'lucide-react'
import type { PromptField, NichePromptRecord, PromptFieldValue } from '@/types'

interface Props {
  editingId?: string | null
  onClose: () => void
  onSaved: () => void
}

export function NichePromptForm({ editingId, onClose, onSaved }: Props) {
  const [fields, setFields] = useState<PromptField[]>([])
  const [channelName, setChannelName] = useState('')
  const [channelUrl, setChannelUrl] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId])

  async function loadData() {
    setIsLoading(true)
    const [fieldsRes, promptRes] = await Promise.all([
      fetch('/api/admin/prompt-fields'),
      editingId ? fetch(`/api/admin/niche-prompts/${editingId}`) : Promise.resolve(null),
    ])

    const fieldsData = (await fieldsRes.json()) as unknown
    setFields(
      Array.isArray(fieldsData)
        ? (fieldsData as PromptField[]).filter((f) => f.is_active)
        : []
    )

    if (promptRes) {
      const promptData = (await promptRes.json()) as NichePromptRecord
      setChannelName(promptData.channel_name ?? '')
      setChannelUrl(promptData.channel_url ?? '')
      const vals: Record<string, string> = {}
      ;(promptData.field_values ?? []).forEach((fv: PromptFieldValue) => {
        vals[fv.field_id] = fv.value
      })
      setFieldValues(vals)
    }

    setIsLoading(false)
  }

  async function handleSave() {
    if (!channelName.trim()) return
    setIsSaving(true)

    const payload = {
      channel_name: channelName.trim(),
      channel_url: channelUrl.trim(),
      field_values: fields.map((f) => ({ field_id: f.id, value: fieldValues[f.id] ?? '' })),
    }

    console.log('[NichePromptForm] Saving prompt with fields:', JSON.stringify(payload.field_values, null, 2))

    const url = editingId
      ? `/api/admin/niche-prompts/${editingId}`
      : '/api/admin/niche-prompts'
    const method = editingId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await res.json()
    console.log('[NichePromptForm] Save result:', result)

    if (!res.ok) {
      alert(`Error saving: ${result.error ?? 'Unknown error'}`)
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9CE] shrink-0">
          <h3 className="font-display text-xl font-bold text-[#1A1612]">
            {editingId ? 'Edit Niche Prompt' : 'Add Niche Prompt'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A7F72] hover:bg-[#F5F0E8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-sm text-[#8A7F72]">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <>
              {/* Channel Name + URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="e.g. Finance Facts Daily"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
                    Channel URL
                  </label>
                  <input
                    type="url"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="https://youtube.com/@channel"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors"
                  />
                </div>
              </div>

              {/* Dynamic fields */}
              {fields.map((field) => (
                <div key={field.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider">
                      {field.name}
                    </label>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      field.show_to_users
                        ? 'bg-[#EBF5EF] text-[#2A7A4B]'
                        : 'bg-[#F5F0E8] text-[#8A7F72]'
                    }`}>
                      {field.show_to_users
                        ? <><Eye className="w-3 h-3" /> Visible to users</>
                        : <><EyeOff className="w-3 h-3" /> Admin only</>
                      }
                    </span>
                  </div>
                  <textarea
                    value={fieldValues[field.id] ?? ''}
                    onChange={(e) =>
                      setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] transition-colors resize-none leading-relaxed"
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E0D9CE] shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { void handleSave() }}
            disabled={!channelName.trim() || isSaving || isLoading}
            className="px-6 py-2.5 rounded-full text-sm bg-[#E8402A] text-white font-semibold hover:bg-[#CF3520] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Prompt'}
          </button>
        </div>
      </div>
    </div>
  )
}
