'use client'

import { useState, useEffect } from 'react'
import { CATEGORY_NAMES } from '@/config/categories'
import Link from 'next/link'
import {
  ChevronUp, Plus, X, Search, Clock, Eye, CheckCircle2,
  Sparkles, XCircle, Trash2, Loader2, MessageSquarePlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNicheRequests } from '@/hooks/useNicheRequests'
import { formatDistanceToNow } from 'date-fns'
import type { NicheRequest, RequestStatus, RequestSortBy, RequestFilter } from '@/types'

// ─── Constants ─────────────────────────────────────────────────────────────

const CATEGORIES = CATEGORY_NAMES

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:      { label: 'Pending',      color: 'bg-[#F0EDE8] text-[#8A7F72]',  icon: <Clock className="w-3 h-3" /> },
  under_review: { label: 'Under Review', color: 'bg-[#EBF4FF] text-[#2563EB]',  icon: <Eye className="w-3 h-3" /> },
  approved:     { label: 'Approved ✓',   color: 'bg-[#F3E8FF] text-[#7C3AED]',  icon: <CheckCircle2 className="w-3 h-3" /> },
  completed:    { label: 'Added! 🎉',    color: 'bg-[#EBF5EF] text-[#2A7A4B]',  icon: <Sparkles className="w-3 h-3" /> },
  rejected:     { label: 'Not Added',    color: 'bg-[#FDF0ED] text-[#E8402A]',  icon: <XCircle className="w-3 h-3" /> },
}

const FILTER_OPTIONS: { label: string; value: RequestFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Completed', value: 'completed' },
]

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.color)}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ─── Vote Button ────────────────────────────────────────────────────────────

function VoteButton({ request, onVote }: { request: NicheRequest; onVote: (id: string) => void }) {
  return (
    <button
      onClick={() => onVote(request.id)}
      className={cn(
        'flex flex-col items-center gap-0.5 w-14 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0',
        request.has_voted
          ? 'bg-[#E8402A] border-[#E8402A] text-white'
          : 'bg-white border-[#E0D9CE] text-[#8A7F72] hover:border-[#E8402A] hover:text-[#E8402A]'
      )}
    >
      <ChevronUp className="w-4 h-4" />
      <span>{request.votes_count}</span>
    </button>
  )
}

// ─── Request Card ───────────────────────────────────────────────────────────

function RequestCard({
  request,
  onVote,
  onDelete,
  currentUserId,
  isDeleting,
}: {
  request: NicheRequest
  onVote: (id: string) => void
  onDelete?: (id: string) => void
  currentUserId?: string
  isDeleting?: string | null
}) {
  const isOwn = currentUserId === request.user_id
  const canDelete = isOwn && request.status === 'pending'

  return (
    <div className="bg-white border border-[#E0D9CE] rounded-2xl p-4 flex gap-4 hover:border-[#C8C0B4] transition-colors">
      <VoteButton request={request} onVote={onVote} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7F72] bg-[#F5F0E8] px-2 py-0.5 rounded-full">
              {request.category}
            </span>
            <StatusBadge status={request.status} />
          </div>
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(request.id)}
              disabled={isDeleting === request.id}
              className="text-[#8A7F72] hover:text-[#E8402A] transition-colors shrink-0"
            >
              {isDeleting === request.id
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />
              }
            </button>
          )}
        </div>

        <h3 className="font-display font-bold text-[15px] text-[#1A1612] leading-snug mb-1.5">
          {request.title}
        </h3>

        {request.description && (
          <p className="text-sm text-[#8A7F72] line-clamp-2 mb-2">{request.description}</p>
        )}

        {request.status === 'completed' && request.linked_niche_id && (
          <Link
            href={`/niches/${request.linked_niche_id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2A7A4B] hover:underline mb-2"
          >
            <Sparkles className="w-3 h-3" />
            This niche has been added! → View Niche
          </Link>
        )}

        {request.status === 'rejected' && request.admin_note && (
          <p className="text-xs text-[#E8402A] bg-[#FDF0ED] px-2 py-1 rounded-lg mb-2">
            Reason: {request.admin_note}
          </p>
        )}

        <div className="flex items-center gap-2 text-[11px] text-[#8A7F72]">
          <span>{isOwn ? 'You' : `User ${request.user_id.slice(0, 6)}***`}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Submit Modal ───────────────────────────────────────────────────────────

function SubmitModal({
  onClose,
  onSubmit,
  monthlyCount,
}: {
  onClose: () => void
  onSubmit: (data: { title: string; description: string; category: string; reason: string }) => Promise<{ success: boolean; error?: string }>
  monthlyCount: number
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const remaining = Math.max(0, 3 - monthlyCount)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !category) { setErrorMsg('Title and category are required.'); return }
    setIsSubmitting(true)
    setErrorMsg('')
    const result = await onSubmit({ title: title.trim(), description, category, reason })
    setIsSubmitting(false)
    if (result.success) { onClose() } else { setErrorMsg(result.error ?? 'Something went wrong.') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#E0D9CE]">
          <h2 className="font-display font-bold text-xl text-[#1A1612]">Request a Niche</h2>
          <button onClick={onClose} className="text-[#8A7F72] hover:text-[#1A1612] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1A1612] block mb-1.5">
              Niche Title <span className="text-[#E8402A]">*</span>
            </label>
            <div className="relative">
              <input
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 80))}
                placeholder="e.g. Budget Investing for Beginners"
                className="w-full px-3 py-2.5 text-sm border border-[#E0D9CE] rounded-xl focus:outline-none focus:border-[#E8402A] pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8A7F72]">{title.length}/80</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1612] block mb-1.5">
              Category <span className="text-[#E8402A]">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[#E0D9CE] rounded-xl focus:outline-none focus:border-[#E8402A] bg-white"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1612] block mb-1.5">
              Why this niche? <span className="text-[#8A7F72] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value.slice(0, 300))}
                placeholder="Tell us why this niche would be valuable..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-[#E0D9CE] rounded-xl focus:outline-none focus:border-[#E8402A] resize-none"
              />
              <span className="absolute right-3 bottom-2 text-[10px] text-[#8A7F72]">{description.length}/300</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1612] block mb-1.5">
              Why should we add it? <span className="text-[#8A7F72] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value.slice(0, 300))}
                placeholder="What makes this niche profitable or in-demand?"
                rows={2}
                className="w-full px-3 py-2.5 text-sm border border-[#E0D9CE] rounded-xl focus:outline-none focus:border-[#E8402A] resize-none"
              />
              <span className="absolute right-3 bottom-2 text-[10px] text-[#8A7F72]">{reason.length}/300</span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-[#E8402A] bg-[#FDF0ED] px-3 py-2 rounded-lg">{errorMsg}</p>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-[#8A7F72]">{remaining} of 3 requests remaining this month</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#8A7F72] hover:text-[#1A1612] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || remaining === 0}
                className="flex items-center gap-1.5 bg-[#E8402A] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Request →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function RequestSkeleton() {
  return (
    <div className="bg-white border border-[#E0D9CE] rounded-2xl p-4 flex gap-4 animate-pulse">
      <div className="w-14 h-16 bg-[#F5F0E8] rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[#F5F0E8] rounded w-1/4" />
        <div className="h-4 bg-[#F5F0E8] rounded w-3/4" />
        <div className="h-3 bg-[#F5F0E8] rounded w-1/2" />
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RequestPage() {
  const {
    requests, isLoading, error,
    sortBy, setSortBy,
    filterStatus, setFilterStatus,
    searchQuery, setSearchQuery,
    submitRequest, toggleVote,
    getUserRequests, deleteRequest, getMonthlyRequestCount,
  } = useNicheRequests()

  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [myRequests, setMyRequests] = useState<NicheRequest[]>([])
  const [isLoadingMine, setIsLoadingMine] = useState(false)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  const totalVotes = requests.reduce((sum, r) => sum + r.votes_count, 0)
  const completedCount = requests.filter(r => r.status === 'completed').length

  useEffect(() => {
    async function init() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
    }
    init()
    getMonthlyRequestCount().then(setMonthlyCount)
  }, [])

  async function loadMyRequests() {
    setIsLoadingMine(true)
    const data = await getUserRequests()
    setMyRequests(data)
    setIsLoadingMine(false)
  }

  function handleTabChange(tab: 'all' | 'mine') {
    setActiveTab(tab)
    if (tab === 'mine') loadMyRequests()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteRequest(id)
    setMyRequests(prev => prev.filter(r => r.id !== id))
    setDeletingId(null)
  }

  async function handleSubmit(data: { title: string; description: string; category: string; reason: string }) {
    const result = await submitRequest(data)
    if (result.success) {
      setMonthlyCount(c => c + 1)
      if (activeTab === 'mine') loadMyRequests()
    }
    return result
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1A1612] mb-2">
              Request a Niche
            </h1>
            <p className="text-[#8A7F72] text-sm max-w-md">
              Vote on existing requests or submit your own. Most voted niches get added first.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { value: requests.length, label: 'Total Requests', color: '#1A1612' },
                { value: totalVotes.toLocaleString(), label: 'Total Votes', color: '#1A1612' },
                { value: completedCount, label: 'Niches Added', color: '#2A7A4B' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-[#E0D9CE] rounded-xl px-3 py-2 text-center min-w-[80px]">
                  <div className="font-display font-bold text-lg" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] text-[#8A7F72] uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-[#CF3520] transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Request a Niche
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#E0D9CE] rounded-full p-1 w-fit mb-6">
          {(['all', 'mine'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-semibold transition-colors',
                activeTab === tab ? 'bg-[#E8402A] text-white' : 'text-[#8A7F72] hover:text-[#1A1612]'
              )}
            >
              {tab === 'all' ? 'All Requests' : 'My Requests'}
            </button>
          ))}
        </div>

        {activeTab === 'all' ? (
          <>
            {/* Filters */}
            <div className="mb-5 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search requests..."
                  className="w-full sm:w-72 pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E0D9CE] rounded-full focus:outline-none focus:border-[#E8402A]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterStatus(opt.value)}
                    className={cn(
                      'text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                      filterStatus === opt.value
                        ? 'bg-[#1A1612] text-white'
                        : 'bg-white border border-[#E0D9CE] text-[#8A7F72] hover:border-[#1A1612] hover:text-[#1A1612]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as RequestSortBy)}
                  className="ml-auto text-sm border border-[#E0D9CE] bg-white text-[#1A1612] rounded-full px-3 py-1.5 focus:outline-none focus:border-[#E8402A]"
                >
                  <option value="votes">Most Voted</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3, 4].map(i => <RequestSkeleton key={i} />)}</div>
            ) : error ? (
              <div className="text-center py-16 text-[#8A7F72]">{error}</div>
            ) : requests.length === 0 ? (
              <div className="bg-white border border-dashed border-[#E0D9CE] rounded-2xl py-16 text-center">
                <MessageSquarePlus className="w-10 h-10 text-[#E0D9CE] mx-auto mb-3" />
                <p className="text-[#8A7F72] text-sm font-medium">
                  {searchQuery ? 'No requests match your search.' : 'No requests yet. Be the first to request a niche!'}
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="mt-3 text-sm font-semibold text-[#E8402A] hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map(r => (
                  <RequestCard key={r.id} request={r} onVote={toggleVote} currentUserId={currentUserId} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* My Requests */
          <div>
            <p className="text-sm text-[#8A7F72] mb-4">
              Requests remaining this month:{' '}
              <strong className="text-[#1A1612]">{Math.max(0, 3 - monthlyCount)}/3</strong>
            </p>

            {isLoadingMine ? (
              <div className="space-y-3">{[1, 2].map(i => <RequestSkeleton key={i} />)}</div>
            ) : myRequests.length === 0 ? (
              <div className="bg-white border border-dashed border-[#E0D9CE] rounded-2xl py-16 text-center">
                <MessageSquarePlus className="w-10 h-10 text-[#E0D9CE] mx-auto mb-3" />
                <p className="text-[#8A7F72] text-sm font-medium">You haven&apos;t requested any niches yet.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-3 text-sm font-semibold text-[#E8402A] hover:underline"
                >
                  Submit your first request →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map(r => (
                  <RequestCard
                    key={r.id}
                    request={r}
                    onVote={toggleVote}
                    onDelete={handleDelete}
                    currentUserId={currentUserId}
                    isDeleting={deletingId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <SubmitModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          monthlyCount={monthlyCount}
        />
      )}
    </div>
  )
}
