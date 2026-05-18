'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import type { BroadcastEmail, BroadcastSegment } from '@/types'

const SEGMENT_LABELS: Record<BroadcastSegment, string> = { all: 'All Users', pro: 'Pro + Lifetime', free: 'Free Users' }
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-[#F5F0E8]', text: 'text-[#8A7F72]' },
  scheduled: { bg: 'bg-[#EDE8FF]', text: 'text-[#5B47CC]' },
  sending: { bg: 'bg-[#FEF6E8]', text: 'text-[#A06B00]' },
  sent: { bg: 'bg-[#EBF5EF]', text: 'text-[#2A7A4B]' },
  failed: { bg: 'bg-[#FDF0ED]', text: 'text-[#E8402A]' },
}

export function BroadcastTab() {
  const [broadcasts, setBroadcasts] = useState<BroadcastEmail[]>([])
  const [showComposer, setShowComposer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [segment, setSegment] = useState<BroadcastSegment>('all')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { fetchBroadcasts() }, [])

  async function fetchBroadcasts() {
    const res = await fetch('/api/admin/emails/broadcast')
    setBroadcasts(await res.json())
    setIsLoading(false)
  }

  async function handleSave() {
    if (!subject.trim() || !body.trim()) return
    setIsSaving(true)
    const res = await fetch('/api/admin/emails/broadcast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body, segment }),
    })
    const data = await res.json()
    if (data.id) setBroadcasts(prev => [data, ...prev])
    setSubject(''); setBody(''); setSegment('all'); setShowComposer(false); setIsSaving(false)
  }

  async function handleSendNow(id: string) {
    if (!confirm('Send this broadcast now?')) return
    setIsSending(id)
    await fetch(`/api/admin/emails/broadcast/${id}/send`, { method: 'POST' })
    await fetchBroadcasts()
    setIsSending(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8A7F72]">Send emails to segments of your users</p>
        <button onClick={() => setShowComposer(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#E8402A] text-white rounded-full text-xs font-semibold hover:bg-[#c42e2e]">
          <Plus className="w-3.5 h-3.5" />New Broadcast
        </button>
      </div>

      {showComposer && (
        <div className="bg-white border-2 border-[#E8402A] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[#1A1612]">New Broadcast</h3>
            <button onClick={() => setShowComposer(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED]"><X className="w-4 h-4" /></button>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Subject *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..."
              className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Body *</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your email..." rows={6}
              className="w-full px-4 py-3 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A] resize-y leading-relaxed" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Audience</label>
            <div className="flex gap-2">
              {(['all', 'pro', 'free'] as BroadcastSegment[]).map(s => (
                <button key={s} onClick={() => setSegment(s)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-all ${segment === s ? 'border-[#1A1612] bg-[#1A1612] text-white' : 'border-[#E0D9CE] bg-white text-[#8A7F72] hover:border-[#1A1612]'}`}>
                  {SEGMENT_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#E0D9CE]">
            <button onClick={() => setShowComposer(false)} className="px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8]">Cancel</button>
            <button onClick={handleSave} disabled={!subject.trim() || !body.trim() || isSaving}
              className="px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-semibold hover:bg-[#c42e2e] disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? <div className="text-center py-10 text-sm text-[#8A7F72]"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...</div> :
       broadcasts.length === 0 ? <div className="bg-white border border-[#E0D9CE] rounded-2xl p-12 text-center text-sm text-[#8A7F72]">No broadcasts yet.</div> : (
        <div className="space-y-3">
          {broadcasts.map(b => {
            const st = STATUS_STYLES[b.status] ?? STATUS_STYLES.draft
            return (
              <div key={b.id} className="bg-white border border-[#E0D9CE] rounded-2xl px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-bold text-[#1A1612] truncate">{b.subject}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#8A7F72] mt-1">
                      <span>{SEGMENT_LABELS[b.segment]}</span>
                      {b.recipients_count > 0 && <><span>·</span><span>{b.recipients_count} sent</span></>}
                      {b.sent_at && <><span>·</span><span>{new Date(b.sent_at).toLocaleDateString()}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${st.bg} ${st.text}`}>{b.status}</span>
                    {(b.status === 'draft' || b.status === 'scheduled') && (
                      <button onClick={() => handleSendNow(b.id)} disabled={isSending === b.id}
                        className="text-xs px-3 py-1.5 bg-[#E8402A] text-white rounded-full font-medium hover:bg-[#c42e2e] disabled:opacity-50">
                        {isSending === b.id ? 'Sending...' : 'Send Now'}
                      </button>
                    )}
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
