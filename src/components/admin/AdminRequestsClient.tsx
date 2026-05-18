'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { NicheRequest, RequestStatus } from '@/types'

interface RequestWithUser extends NicheRequest {
  user: { display_name: string | null; email: string } | null
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; text: string }> = {
  pending:      { label: 'Pending',      bg: 'bg-[#FEF6E8]', text: 'text-[#A06B00]' },
  under_review: { label: 'Under Review', bg: 'bg-[#EDE8FF]', text: 'text-[#5B47CC]' },
  completed:    { label: 'Completed',    bg: 'bg-[#EBF5EF]', text: 'text-[#2A7A4B]' },
  rejected:     { label: 'Rejected',     bg: 'bg-[#FDF0ED]', text: 'text-[#E8402A]' },
}

const STATUS_OPTIONS: RequestStatus[] = ['pending', 'under_review', 'completed', 'rejected']

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all')
  const [filterType, setFilterType] = useState<'all' | 'niche' | 'prompts'>('all')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [editState, setEditState] = useState<Record<string, { status: RequestStatus; admin_note: string }>>({})

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests() {
    const res = await fetch('/api/admin/requests')
    const data = await res.json()
    if (Array.isArray(data)) {
      setRequests(data)
      const init: Record<string, { status: RequestStatus; admin_note: string }> = {}
      data.forEach((r: RequestWithUser) => {
        init[r.id] = { status: r.status, admin_note: r.admin_note ?? '' }
      })
      setEditState(init)
    }
    setIsLoading(false)
  }

  async function handleSave(id: string) {
    const edit = editState[id]
    if (!edit) return
    setSavingId(id)
    await fetch(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: edit.status, admin_note: edit.admin_note }),
    })
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: edit.status, admin_note: edit.admin_note } : r))
    setSavingId(null)
    setSavedId(id)
    setTimeout(() => setSavedId(null), 2000)
  }

  function updateEdit(id: string, field: 'status' | 'admin_note', value: string) {
    setEditState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const filtered = requests.filter(r => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus
    const typeMatch = filterType === 'all' || r.request_type === filterType
    return statusMatch && typeMatch
  })

  const pendingCount = requests.filter(r => r.status === 'pending').length

  if (isLoading) return <div className="flex items-center justify-center h-48 text-sm text-[#8A7F72]"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading requests...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A1612]">Requests</h1>
          <p className="text-sm text-[#8A7F72] mt-0.5">Manage user niche and prompt requests</p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 bg-[#FEF6E8] text-[#A06B00] text-xs font-semibold rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-[#E0D9CE] rounded-full px-1.5 py-1.5">
          {(['all', ...STATUS_OPTIONS] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all capitalize ${filterStatus === s ? 'bg-[#1A1612] text-white' : 'text-[#8A7F72] hover:text-[#1A1612]'}`}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#E0D9CE] rounded-full px-1.5 py-1.5">
          {(['all', 'niche', 'prompts'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${filterType === t ? 'bg-[#1A1612] text-white' : 'text-[#8A7F72] hover:text-[#1A1612]'}`}>
              {t === 'all' ? 'All Types' : t === 'niche' ? '📺 Niche' : '✍️ Prompts'}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#8A7F72] ml-auto">{filtered.length} request{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-12 text-center">
          <p className="text-sm text-[#8A7F72]">{requests.length === 0 ? 'No requests yet.' : 'No requests match the selected filters.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const edit = editState[req.id] ?? { status: req.status, admin_note: req.admin_note ?? '' }
            const statusCfg = STATUS_CONFIG[edit.status]
            const isDirty = edit.status !== req.status || edit.admin_note !== (req.admin_note ?? '')

            return (
              <div key={req.id} className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden">
                {/* Top */}
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{req.request_type === 'niche' ? '📺' : '✍️'}</span>
                      <h3 className="font-display text-base font-bold text-[#1A1612] truncate">{req.niche_name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-[#F5F0E8] text-[#8A7F72] rounded-full font-medium shrink-0">
                        {req.request_type === 'niche' ? 'Niche' : 'Prompts'}
                      </span>
                    </div>
                    {req.description && <p className="text-sm text-[#8A7F72] leading-relaxed mb-2 line-clamp-2">{req.description}</p>}
                    <div className="flex items-center gap-2 text-xs text-[#C8C0B4]">
                      <span>{req.user?.display_name ?? 'Unknown'}</span>
                      <span>·</span>
                      <span>{req.user?.email ?? ''}</span>
                      <span>·</span>
                      <span>{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Admin controls */}
                <div className="px-5 py-4 bg-[#FAFAF8] border-t border-[#E0D9CE]">
                  <div className="flex items-end gap-3">
                    <div className="shrink-0">
                      <label className="text-xs text-[#8A7F72] mb-1 block">Status</label>
                      <select value={edit.status} onChange={e => updateEdit(req.id, 'status', e.target.value)}
                        className="px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A] cursor-pointer">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-[#8A7F72] mb-1 block">Note to user</label>
                      <input type="text" value={edit.admin_note} onChange={e => updateEdit(req.id, 'admin_note', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(req.id) }}
                        placeholder="e.g. Added to queue, will be live next week..."
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
                    </div>
                    <button onClick={() => handleSave(req.id)} disabled={savingId === req.id}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        savedId === req.id ? 'bg-[#EBF5EF] text-[#2A7A4B]' :
                        isDirty ? 'bg-[#E8402A] text-white hover:bg-[#c42e2e]' :
                        'bg-[#F5F0E8] text-[#8A7F72] hover:bg-[#E0D9CE]'
                      } disabled:opacity-50`}>
                      {savingId === req.id ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> :
                       savedId === req.id ? <>✓ Saved!</> : <>Save</>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
