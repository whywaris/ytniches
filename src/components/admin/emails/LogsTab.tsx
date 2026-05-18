'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import type { EmailLog, EmailType, EmailStatus } from '@/types'

const TYPE_OPTIONS: { value: EmailType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'digest', label: 'Digest' },
  { value: 'broadcast', label: 'Broadcast' },
  { value: 'manual', label: 'Manual' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'request_notification', label: 'Request' },
  { value: 'test_digest', label: 'Test' },
]

const STATUS_STYLES: Record<EmailStatus, { bg: string; text: string }> = {
  sent: { bg: 'bg-[#EBF5EF]', text: 'text-[#2A7A4B]' },
  failed: { bg: 'bg-[#FDF0ED]', text: 'text-[#E8402A]' },
  bounced: { bg: 'bg-[#FEF6E8]', text: 'text-[#A06B00]' },
}

export function LogsTab() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<EmailType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<EmailStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/emails/logs?${params}`)
    const data = await res.json()
    setLogs(data.logs ?? [])
    setTotal(data.total ?? 0)
    setIsLoading(false)
  }, [page, typeFilter, statusFilter, search])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#E0D9CE] rounded-full px-3 py-2 flex-1 max-w-xs">
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by email..." className="bg-transparent border-none outline-none text-sm text-[#1A1612] w-full placeholder-[#C8C0B4]" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value as EmailType | 'all'); setPage(1) }}
          className="px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A] cursor-pointer">
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as EmailStatus | 'all'); setPage(1) }}
          className="px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A] cursor-pointer">
          <option value="all">All Status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="bounced">Bounced</option>
        </select>
        <span className="text-xs text-[#8A7F72] ml-auto">{total} log{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E0D9CE] bg-[#FAFAF8]">
              {['Date', 'Type', 'Recipient', 'Subject', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8A7F72] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CE]">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-[#8A7F72]"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-[#8A7F72]">No logs found.</td></tr>
            ) : (
              logs.map(log => {
                const st = STATUS_STYLES[log.status]
                return (
                  <tr key={log.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-3 text-xs text-[#8A7F72] whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-[#F5F0E8] text-[#8A7F72] rounded-full font-medium capitalize">{log.email_type.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3 text-xs text-[#1A1612] max-w-[180px] truncate">{log.recipient_email}</td>
                    <td className="px-4 py-3 text-xs text-[#1A1612] max-w-[220px] truncate">{log.subject}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${st.bg} ${st.text}`}>{log.status}</span></td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm text-[#8A7F72] border border-[#E0D9CE] rounded-full hover:bg-[#F5F0E8] disabled:opacity-40">Previous</button>
          <span className="text-xs text-[#8A7F72]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 text-sm text-[#8A7F72] border border-[#E0D9CE] rounded-full hover:bg-[#F5F0E8] disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
