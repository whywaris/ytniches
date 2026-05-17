'use client'

import { useState, useMemo } from 'react'
import { Send, RefreshCw, Search, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DigestLog {
  id: string
  week_start: string
  week_end: string
  users_sent: number
  niches_featured: number
  sent_at: string
}

interface EmailLog {
  id: string
  user_id: string | null
  email_type: string
  subject: string
  status: 'sent' | 'failed' | 'bounced'
  resend_id: string | null
  sent_at: string
}

interface Props {
  digestLogs: DigestLog[]
  emailLogs: EmailLog[]
  lastDigest: DigestLog | null
  eligibleUsers: number
}

const STATUS_ICON = {
  sent:    <CheckCircle2 className="w-3.5 h-3.5 text-[#2A7A4B]" />,
  failed:  <XCircle className="w-3.5 h-3.5 text-[#E8402A]" />,
  bounced: <Clock className="w-3.5 h-3.5 text-[#A06B00]" />,
}

const STATUS_COLOR = {
  sent:    'bg-[#EBF5EF] text-[#2A7A4B]',
  failed:  'bg-[#FDF0ED] text-[#E8402A]',
  bounced: 'bg-[#FEF3C7] text-[#A06B00]',
}

export function EmailsAdminClient({ digestLogs, emailLogs, lastDigest, eligibleUsers }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed' | 'bounced'>('all')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isSendingNow, setIsSendingNow] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const filteredLogs = useMemo(() => {
    let list = [...emailLogs]
    if (statusFilter !== 'all') list = list.filter(l => l.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.subject.toLowerCase().includes(q) ||
        l.email_type.toLowerCase().includes(q) ||
        (l.resend_id ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [emailLogs, search, statusFilter])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleTestDigest() {
    if (!testEmail.trim()) { showToast('Enter an email address', 'error'); return }
    setIsSendingTest(true)
    try {
      const res = await fetch('/api/admin/test-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })
      const data = await res.json()
      if (res.ok) showToast(`Test digest sent to ${testEmail}`)
      else showToast(data.error ?? 'Failed', 'error')
    } catch {
      showToast('Failed to send test digest', 'error')
    }
    setIsSendingTest(false)
  }

  async function handleSendNow() {
    if (!confirm('Send this week\'s digest to all eligible Pro/Lifetime users now?')) return
    setIsSendingNow(true)
    try {
      const res = await fetch('/api/cron/weekly-digest', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}` },
      })
      const data = await res.json()
      if (res.ok && !data.skipped) {
        showToast(`Digest sent to ${data.sent ?? 0} users`)
      } else if (data.skipped) {
        showToast('Digest already sent this week', 'error')
      } else {
        showToast(data.error ?? 'Failed', 'error')
      }
    } catch {
      showToast('Failed to trigger digest', 'error')
    }
    setIsSendingNow(false)
  }

  function exportCsv() {
    const headers = ['Date', 'Email Type', 'Subject', 'Status', 'Resend ID']
    const rows = filteredLogs.map(l => [
      format(new Date(l.sent_at), 'yyyy-MM-dd HH:mm'),
      l.email_type,
      `"${l.subject.replace(/"/g, '""')}"`,
      l.status,
      l.resend_id ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Digest Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Stats */}
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg text-[#1A1612] mb-4">Digest Overview</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8A7F72]">Last digest sent</span>
              <span className="font-medium text-[#1A1612]">
                {lastDigest
                  ? format(new Date(lastDigest.sent_at), 'MMM d, yyyy')
                  : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A7F72]">Users reached</span>
              <span className="font-medium text-[#1A1612]">{lastDigest?.users_sent ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A7F72]">Niches featured</span>
              <span className="font-medium text-[#1A1612]">{lastDigest?.niches_featured ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A7F72]">Eligible users (Pro + Lifetime)</span>
              <span className="font-bold text-[#E8402A]">{eligibleUsers}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E0D9CE]">
            <p className="text-xs text-[#8A7F72] mb-2">Next send: Every Monday at 9:00 AM UTC</p>
            <button
              onClick={handleSendNow}
              disabled={isSendingNow}
              className="flex items-center gap-2 bg-[#1A1612] text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-[#2A2420] transition-colors disabled:opacity-50 w-full justify-center"
            >
              {isSendingNow
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
              {isSendingNow ? 'Sending...' : 'Send Digest Now'}
            </button>
          </div>
        </div>

        {/* Test digest */}
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg text-[#1A1612] mb-4">Send Test Digest</h2>
          <p className="text-sm text-[#8A7F72] mb-4">
            Send a preview of this week&apos;s digest to any email address.
          </p>
          <input
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            type="email"
            placeholder="admin@yoursite.com"
            className="w-full px-3 py-2.5 text-sm border border-[#E0D9CE] rounded-xl focus:outline-none focus:border-[#E8402A] mb-3"
          />
          <button
            onClick={handleTestDigest}
            disabled={isSendingTest}
            className="flex items-center gap-2 bg-[#E8402A] text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 w-full justify-center"
          >
            {isSendingTest
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />
            }
            {isSendingTest ? 'Sending...' : 'Send Test Digest'}
          </button>
        </div>
      </div>

      {/* Digest History */}
      <div className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[#E0D9CE]">
          <h2 className="font-display font-bold text-[#1A1612]">Digest History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F0E8] border-b border-[#E0D9CE]">
              <tr>
                {['Week', 'Users Sent', 'Niches Featured', 'Sent At'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {digestLogs.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-[#8A7F72] text-sm">No digests sent yet.</td></tr>
              ) : (
                digestLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-3 text-[#1A1612] font-medium">
                      {format(new Date(log.week_start), 'MMM d')} – {format(new Date(log.week_end), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1A1612]">{log.users_sent}</td>
                    <td className="px-4 py-3 text-[#8A7F72]">{log.niches_featured}</td>
                    <td className="px-4 py-3 text-[#8A7F72]">
                      {formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Logs */}
      <div className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E0D9CE] flex flex-wrap items-center gap-3">
          <h2 className="font-display font-bold text-[#1A1612]">Email Logs</h2>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A7F72]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-sm border border-[#E0D9CE] rounded-lg focus:outline-none w-44"
              />
            </div>
            {/* Filter */}
            {(['all', 'sent', 'failed', 'bounced'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize',
                  statusFilter === s
                    ? 'bg-[#1A1612] text-white'
                    : 'bg-[#F5F0E8] text-[#8A7F72] hover:bg-[#EDE8DF]'
                )}
              >
                {s}
              </button>
            ))}
            {/* Export */}
            <button
              onClick={exportCsv}
              className="text-xs font-semibold text-[#8A7F72] hover:text-[#1A1612] border border-[#E0D9CE] rounded-full px-3 py-1.5 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-[#F5F0E8] border-b border-[#E0D9CE]">
              <tr>
                {['Date', 'Email Type', 'Subject', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-[#8A7F72] text-sm">No logs found.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-3 text-[#8A7F72] whitespace-nowrap text-xs">
                      {format(new Date(log.sent_at), 'MMM d, HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-[#1A1612] capitalize">{log.email_type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-[#8A7F72] max-w-[240px] truncate">{log.subject}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full', STATUS_COLOR[log.status])}>
                        {STATUS_ICON[log.status]}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg z-50',
          toast.type === 'success' ? 'bg-[#1A1612]' : 'bg-[#E8402A]'
        )}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
