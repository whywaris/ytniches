'use client'

import { useState } from 'react'
import { X, Loader2, Check, Send } from 'lucide-react'

interface Props {
  userId: string
  userEmail: string
  userName: string
  onClose: () => void
}

export function ManualEmailModal({ userId, userEmail, userName, onClose }: Props) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return
    setIsSending(true)
    setError(null)

    const res = await fetch('/api/admin/emails/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, email: userEmail, subject, body }),
    })

    if (!res.ok) {
      setError('Failed to send email.')
      setIsSending(false)
      return
    }

    setIsSending(false)
    setSent(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612]">Send Email</h3>
            <p className="text-xs text-[#8A7F72] mt-0.5">To: {userName} — {userEmail}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Subject *</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." autoFocus
            className="w-full px-4 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-1.5 block">Message *</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={6}
            className="w-full px-4 py-3 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A] resize-none leading-relaxed" />
        </div>

        {error && <p className="text-xs text-[#E8402A] mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8]">Cancel</button>
          <button onClick={handleSend} disabled={!subject.trim() || !body.trim() || isSending}
            className={`flex-1 px-4 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${sent ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'bg-[#E8402A] text-white hover:bg-[#c42e2e] disabled:opacity-50'}`}>
            {sent ? <><Check className="w-4 h-4" />Sent!</> : isSending ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send Email</>}
          </button>
        </div>
      </div>
    </div>
  )
}
