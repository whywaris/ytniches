'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { NicheRequest, RequestType } from '@/types'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:      { label: 'Pending',      bg: 'bg-[#FEF6E8]', text: 'text-[#A06B00]' },
  under_review: { label: 'Under Review', bg: 'bg-[#EDE8FF]', text: 'text-[#5B47CC]' },
  completed:    { label: 'Completed',    bg: 'bg-[#EBF5EF]', text: 'text-[#2A7A4B]' },
  rejected:     { label: 'Rejected',     bg: 'bg-[#FDF0ED]', text: 'text-[#E8402A]' },
}

interface Props {
  initialRequests: NicheRequest[]
  isPro: boolean
}

export function RequestPageClient({ initialRequests, isPro }: Props) {
  const [requests, setRequests] = useState<NicheRequest[]>(initialRequests)
  const [requestType, setRequestType] = useState<RequestType>('niche')
  const [nicheName, setNicheName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!nicheName.trim()) return
    setIsSubmitting(true)
    setError(null)

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_type: requestType,
        niche_name: nicheName.trim(),
        description: description.trim(),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setIsSubmitting(false)
      return
    }

    setRequests(prev => [data, ...prev])
    setNicheName('')
    setDescription('')
    setRequestType('niche')
    setIsSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-[#1A1612]">Request</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Request a new niche or custom prompts for your niche.</p>
      </div>

      {/* Form */}
      {!isPro ? (
        <div className="bg-white border-2 border-[#E0D9CE] rounded-2xl p-8 mb-8 text-center">
          <div className="w-14 h-14 bg-[#EDE8FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👑</span>
          </div>
          <h2 className="font-display text-xl font-bold text-[#1A1612] mb-2">Pro Feature</h2>
          <p className="text-sm text-[#8A7F72] mb-6 max-w-sm mx-auto">
            Only Pro and Lifetime members can submit niche and prompt requests. Upgrade to unlock this feature.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      ) : (
      <div className="bg-white border border-[#E0D9CE] rounded-2xl p-6 mb-8">
        {/* Type toggle */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-2 block">What are you requesting?</label>
          <div className="flex gap-2">
            <button onClick={() => setRequestType('niche')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${requestType === 'niche' ? 'bg-[#1A1612] text-white border-[#1A1612]' : 'bg-white text-[#8A7F72] border-[#E0D9CE] hover:border-[#1A1612] hover:text-[#1A1612]'}`}>
              📺 Request a Niche
            </button>
            <button onClick={() => setRequestType('prompts')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${requestType === 'prompts' ? 'bg-[#1A1612] text-white border-[#1A1612]' : 'bg-white text-[#8A7F72] border-[#E0D9CE] hover:border-[#1A1612] hover:text-[#1A1612]'}`}>
              ✍️ Request Prompts
            </button>
          </div>
          <p className="text-xs text-[#8A7F72] mt-2">
            {requestType === 'niche' ? '📺 Ask us to add a new YouTube niche to the library.' : '✍️ Already found a niche? Ask us to create custom AI prompts for it.'}
          </p>
        </div>

        {/* Niche Name */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
            {requestType === 'niche' ? 'Niche Name *' : 'Your Niche Name *'}
          </label>
          <input type="text" value={nicheName} onChange={e => setNicheName(e.target.value)}
            placeholder={requestType === 'niche' ? 'e.g. Personal Finance for Gen Z' : 'e.g. AI Tools for Freelancers'}
            className="w-full px-4 py-3 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A] transition-colors" />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">
            {requestType === 'niche' ? 'Why should we add this niche?' : 'Describe your niche & what prompts you need'}
          </label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder={requestType === 'niche' ? 'Tell us about this niche — audience size, potential, why it works on YouTube...' : 'Describe your channel, target audience, and what kind of prompts would help you most...'}
            rows={4} className="w-full px-4 py-3 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A] transition-colors resize-none leading-relaxed" />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-[#FDF0ED] border border-[#F5C5BB] rounded-xl">
            <p className="text-xs text-[#E8402A]">{error}</p>
          </div>
        )}

        {submitted && (
          <div className="mb-4 px-4 py-3 bg-[#EBF5EF] border border-[#B5DEC5] rounded-xl flex items-center gap-2">
            <span className="text-[#2A7A4B]">✓</span>
            <p className="text-xs text-[#2A7A4B] font-medium">Request submitted! We'll review it soon.</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!nicheName.trim() || isSubmitting}
          className="w-full py-3 bg-[#E8402A] text-white rounded-xl text-sm font-semibold hover:bg-[#c42e2e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
          ) : (
            <>Submit Request</>
          )}
        </button>
      </div>
      )}

      {/* Past Requests */}
      {requests.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold text-[#1A1612] mb-4">Your Requests</h2>
          <div className="space-y-3">
            {requests.map(req => {
              const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
              return (
                <div key={req.id} className="bg-white border border-[#E0D9CE] rounded-2xl px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">{req.request_type === 'niche' ? '📺' : '✍️'}</span>
                        <span className="text-sm font-semibold text-[#1A1612] truncate">{req.niche_name}</span>
                      </div>
                      {req.description && (
                        <p className="text-xs text-[#8A7F72] leading-relaxed line-clamp-2">{req.description}</p>
                      )}
                      {req.admin_note && (
                        <div className="mt-2 px-3 py-2 bg-[#F5F0E8] rounded-lg">
                          <p className="text-xs text-[#8A7F72]">
                            <span className="font-semibold text-[#1A1612]">Note: </span>{req.admin_note}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-[#C8C0B4]">
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {requests.length === 0 && !submitted && (
        <div className="text-center py-8">
          <p className="text-sm text-[#8A7F72]">No requests yet. Submit your first one above.</p>
        </div>
      )}
    </div>
  )
}
