'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, Search, Trash2, Loader2, CheckCircle2, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { NicheRequest, RequestStatus, RequestFilter } from '@/types'

const STATUS_OPTIONS: RequestStatus[] = ['pending', 'under_review', 'approved', 'completed', 'rejected']

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending:      'Pending',
  under_review: 'Under Review',
  approved:     'Approved',
  completed:    'Completed',
  rejected:     'Rejected',
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending:      'bg-[#F0EDE8] text-[#8A7F72]',
  under_review: 'bg-[#EBF4FF] text-[#2563EB]',
  approved:     'bg-[#F3E8FF] text-[#7C3AED]',
  completed:    'bg-[#EBF5EF] text-[#2A7A4B]',
  rejected:     'bg-[#FDF0ED] text-[#E8402A]',
}

interface Stats {
  total: number
  pending: number
  under_review: number
  approved: number
  completed: number
  rejected: number
}

interface Props {
  requests: NicheRequest[]
  stats: Stats
}

export function RequestsManagerClient({ requests: initialRequests, stats }: Props) {
  const [requests, setRequests] = useState<NicheRequest[]>(initialRequests)
  const [filterStatus, setFilterStatus] = useState<RequestFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'votes' | 'newest' | 'oldest'>('votes')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [noteModal, setNoteModal] = useState<{ id: string; title: string; currentNote: string } | null>(null)
  const [noteText, setNoteText] = useState('')
  const [linkModal, setLinkModal] = useState<{ id: string; title: string } | null>(null)
  const [linkedSlug, setLinkedSlug] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<RequestStatus>('under_review')
  const [bulkNote, setBulkNote] = useState('')

  const filtered = useMemo(() => {
    let list = [...requests]
    if (filterStatus !== 'all') list = list.filter(r => r.status === filterStatus)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || (r.user_email ?? '').toLowerCase().includes(q))
    }
    if (sortBy === 'votes') list.sort((a, b) => b.votes_count - a.votes_count)
    else if (sortBy === 'newest') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    else list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return list
  }, [requests, filterStatus, searchQuery, sortBy])

  async function updateStatus(id: string, status: RequestStatus, adminNote?: string, linkedNicheId?: string) {
    setUpdatingId(id)
    const res = await fetch(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(adminNote !== undefined && { admin_note: adminNote }), ...(linkedNicheId !== undefined && { linked_niche_id: linkedNicheId }) }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
    }
    setUpdatingId(null)
  }

  async function deleteRequest(id: string) {
    if (!confirm('Delete this request?')) return
    setDeletingId(id)
    await fetch(`/api/admin/requests/${id}`, { method: 'DELETE' })
    setRequests(prev => prev.filter(r => r.id !== id))
    setDeletingId(null)
  }

  async function handleBulkUpdate() {
    const ids = Array.from(selectedIds)
    await Promise.all(ids.map(id => updateStatus(id, bulkStatus, bulkNote || undefined)))
    setSelectedIds(new Set())
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)))
    }
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: '#1A1612' },
          { label: 'Pending', value: stats.pending, color: '#8A7F72' },
          { label: 'Under Review', value: stats.under_review, color: '#2563EB' },
          { label: 'Approved', value: stats.approved, color: '#7C3AED' },
          { label: 'Completed', value: stats.completed, color: '#2A7A4B' },
          { label: 'Rejected', value: stats.rejected, color: '#E8402A' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E0D9CE] rounded-xl p-3 text-center">
            <div className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-[#8A7F72] uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A7F72]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search requests..."
            className="pl-9 pr-4 py-2 text-sm border border-[#E0D9CE] rounded-lg focus:outline-none focus:border-[#E8402A] w-56"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['all', ...STATUS_OPTIONS] as (RequestFilter)[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                filterStatus === s
                  ? 'bg-[#1A1612] text-white'
                  : 'bg-white border border-[#E0D9CE] text-[#8A7F72] hover:border-[#1A1612]'
              )}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s as RequestStatus]}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="ml-auto text-sm border border-[#E0D9CE] rounded-lg px-3 py-2 bg-white focus:outline-none"
        >
          <option value="votes">Most Voted</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-[#1A1612]">{selectedIds.size} selected</span>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value as RequestStatus)}
            className="text-sm border border-[#E0D9CE] rounded-lg px-2 py-1.5 bg-white focus:outline-none"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <input
            value={bulkNote}
            onChange={e => setBulkNote(e.target.value)}
            placeholder="Note (optional)"
            className="text-sm border border-[#E0D9CE] rounded-lg px-2 py-1.5 bg-white focus:outline-none flex-1 min-w-[160px]"
          />
          <button
            onClick={handleBulkUpdate}
            className="text-sm font-bold bg-[#1A1612] text-white px-4 py-1.5 rounded-lg hover:bg-[#2A2420] transition-colors"
          >
            Apply
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-[#8A7F72] hover:text-[#1A1612]">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E0D9CE] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F0E8] border-b border-[#E0D9CE]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">Votes</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">Title</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">Submitted by</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8A7F72] text-sm">No requests found.</td>
                </tr>
              ) : (
                filtered.map(request => (
                  <tr key={request.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(request.id)} onChange={() => toggleSelect(request.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-bold text-[#1A1612]">
                        <ChevronUp className="w-3 h-3 text-[#E8402A]" />
                        {request.votes_count}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-medium text-[#1A1612] truncate">{request.title}</div>
                      {request.admin_note && (
                        <div className="text-[11px] text-[#8A7F72] truncate mt-0.5">Note: {request.admin_note}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#8A7F72] whitespace-nowrap">{request.category}</td>
                    <td className="px-4 py-3">
                      <select
                        value={request.status}
                        onChange={e => updateStatus(request.id, e.target.value as RequestStatus)}
                        disabled={updatingId === request.id}
                        className={cn(
                          'text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E8402A]',
                          STATUS_COLORS[request.status]
                        )}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      {updatingId === request.id && <Loader2 className="w-3 h-3 animate-spin inline ml-1 text-[#8A7F72]" />}
                    </td>
                    <td className="px-4 py-3 text-[#8A7F72] text-xs max-w-[140px] truncate">{request.user_email || '—'}</td>
                    <td className="px-4 py-3 text-[#8A7F72] text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Admin note */}
                        <button
                          onClick={() => { setNoteModal({ id: request.id, title: request.title, currentNote: request.admin_note ?? '' }); setNoteText(request.admin_note ?? '') }}
                          title="Add note"
                          className="text-[#8A7F72] hover:text-[#1A1612] transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        {/* Link niche */}
                        <button
                          onClick={() => { setLinkModal({ id: request.id, title: request.title }); setLinkedSlug('') }}
                          title="Link niche"
                          className="text-[#8A7F72] hover:text-[#1A1612] transition-colors"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => deleteRequest(request.id)}
                          disabled={deletingId === request.id}
                          title="Delete"
                          className="text-[#8A7F72] hover:text-[#E8402A] transition-colors"
                        >
                          {deletingId === request.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
            <h3 className="font-display font-bold text-lg text-[#1A1612] mb-1">Admin Note</h3>
            <p className="text-xs text-[#8A7F72] mb-3 truncate">{noteModal.title}</p>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Reason for rejection, or any internal note..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-[#E0D9CE] rounded-xl focus:outline-none focus:border-[#E8402A] resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setNoteModal(null)} className="flex-1 py-2 text-sm font-semibold text-[#8A7F72] border border-[#E0D9CE] rounded-lg hover:border-[#1A1612] transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateStatus(noteModal.id, requests.find(r => r.id === noteModal.id)!.status, noteText)
                  setNoteModal(null)
                }}
                className="flex-1 py-2 text-sm font-bold bg-[#1A1612] text-white rounded-lg hover:bg-[#2A2420] transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Niche Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
            <h3 className="font-display font-bold text-lg text-[#1A1612] mb-1">Link to Niche</h3>
            <p className="text-xs text-[#8A7F72] mb-3 truncate">{linkModal.title}</p>
            <input
              value={linkedSlug}
              onChange={e => setLinkedSlug(e.target.value)}
              placeholder="Niche UUID or slug"
              className="w-full px-3 py-2.5 text-sm border border-[#E0D9CE] rounded-xl focus:outline-none focus:border-[#E8402A]"
            />
            <p className="text-[11px] text-[#8A7F72] mt-1">Enter the niche ID from the Niches table.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setLinkModal(null)} className="flex-1 py-2 text-sm font-semibold text-[#8A7F72] border border-[#E0D9CE] rounded-lg hover:border-[#1A1612] transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateStatus(linkModal.id, 'completed', undefined, linkedSlug)
                  setLinkModal(null)
                }}
                className="flex-1 py-2 text-sm font-bold bg-[#2A7A4B] text-white rounded-lg hover:bg-[#1E5A36] transition-colors"
              >
                Link & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
