'use client'

import { useState } from 'react'
import { DigestTab } from '@/components/admin/emails/DigestTab'
import { BroadcastTab } from '@/components/admin/emails/BroadcastTab'
import { LogsTab } from '@/components/admin/emails/LogsTab'

type EmailTab = 'digest' | 'broadcast' | 'logs'

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState<EmailTab>('digest')

  const tabs: { key: EmailTab; label: string }[] = [
    { key: 'digest', label: 'Digest' },
    { key: 'broadcast', label: 'Broadcast' },
    { key: 'logs', label: 'Logs' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#1A1612]">Emails</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Manage digests, broadcasts, and email logs</p>
      </div>

      <div className="flex gap-1 bg-white border border-[#E0D9CE] rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-[#1A1612] text-white' : 'text-[#8A7F72] hover:text-[#1A1612]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'digest' && <DigestTab />}
      {activeTab === 'broadcast' && <BroadcastTab />}
      {activeTab === 'logs' && <LogsTab />}
    </div>
  )
}
