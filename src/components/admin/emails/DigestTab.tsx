'use client'

import { useState } from 'react'

export function DigestTab() {
  const [testEmail, setTestEmail] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isSendingNow, setIsSendingNow] = useState(false)
  const [testSent, setTestSent] = useState(false)
  const [digestSent, setDigestSent] = useState(false)

  async function handleSendDigest() {
    setIsSendingNow(true)
    await fetch('/api/cron/weekly-digest', { method: 'POST' })
    setIsSendingNow(false)
    setDigestSent(true)
    setTimeout(() => setDigestSent(false), 3000)
  }

  async function handleSendTest() {
    if (!testEmail) return
    setIsSendingTest(true)
    await fetch('/api/admin/test-digest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    })
    setIsSendingTest(false)
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-5">
          <h3 className="font-display text-base font-bold text-[#1A1612] mb-1">Weekly Digest</h3>
          <p className="text-xs text-[#8A7F72] mb-4">Send weekly digest to all Pro/Lifetime users</p>
          <button onClick={handleSendDigest} disabled={isSendingNow}
            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${digestSent ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'bg-[#1A1612] text-white hover:bg-black/80 disabled:opacity-50'}`}>
            {digestSent ? '✓ Sent!' : isSendingNow ? 'Sending...' : 'Send Digest Now'}
          </button>
        </div>

        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-5">
          <h3 className="font-display text-base font-bold text-[#1A1612] mb-1">Send Test</h3>
          <p className="text-xs text-[#8A7F72] mb-4">Preview digest to any email address</p>
          <div className="flex gap-2">
            <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 px-3 py-2.5 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            <button onClick={handleSendTest} disabled={!testEmail || isSendingTest}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all ${testSent ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'bg-[#E8402A] text-white hover:bg-[#c42e2e] disabled:opacity-50'}`}>
              {testSent ? '✓ Sent!' : isSendingTest ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
