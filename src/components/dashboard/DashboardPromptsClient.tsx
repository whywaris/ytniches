'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Copy, Check, ExternalLink, ChevronDown, Lock } from 'lucide-react'
import type { NicheChannel, NichePromptValue } from '@/types'

interface Props {
  channels: NicheChannel[]
  isPro: boolean
}

export function DashboardPromptsClient({ channels, isPro }: Props) {
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = channels.filter(c =>
    !search || c.channel_name.toLowerCase().includes(search.toLowerCase())
  )

  const hasProFields = channels.some(c =>
    c.prompt_values?.some(pv => pv.access === 'pro')
  )

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black text-[#1A1612]">Prompts</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Ready-to-use AI prompts for each YouTube niche</p>
      </div>

      <div className="flex items-center gap-2 bg-white border border-[#E0D9CE] rounded-full px-4 py-2.5 mb-6 max-w-sm">
        <Search className="w-4 h-4 text-[#8A7F72]" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by channel name..." className="bg-transparent border-none outline-none text-sm text-[#1A1612] w-full placeholder-[#C8C0B4]" />
      </div>

      {!isPro && hasProFields && (
        <div className="bg-[#EDE8FF] border border-[#C8C0F5] rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <p className="text-sm font-semibold text-[#5B47CC]">Unlock Pro Prompts</p>
              <p className="text-xs text-[#5B47CC]/70">Some fields are locked. Upgrade to access all prompts.</p>
            </div>
          </div>
          <Link href="/pricing" className="shrink-0 px-4 py-2 bg-[#5B47CC] text-white rounded-full text-xs font-semibold hover:bg-[#4a38bb]">Upgrade →</Link>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-12 text-center">
          <p className="text-sm text-[#8A7F72]">{search ? 'No channels match your search.' : 'No prompts available yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(channel => {
            const fields = (channel.prompt_values ?? [])
              .slice()
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

            return (
              <div key={channel.id} className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden">
                <button onClick={() => setOpenId(openId === channel.id ? null : channel.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#FAFAF8] transition-colors">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#1A1612]">{channel.channel_name}</h3>
                    {channel.channel_url && <p className="text-xs text-[#8A7F72] mt-0.5">{channel.channel_url}</p>}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#8A7F72] transition-transform ${openId === channel.id ? 'rotate-180' : ''}`} />
                </button>

                {openId === channel.id && (
                  <div className="border-t border-[#E0D9CE]">
                    {channel.channel_url && (
                      <div className="px-6 py-3 border-b border-[#E0D9CE] bg-[#FAFAF8]">
                        <a href={channel.channel_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm font-medium text-[#E8402A] hover:underline w-fit">
                          Visit Channel <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {fields.length === 0 ? (
                      <div className="px-6 py-8 text-center"><p className="text-xs text-[#C8C0B4]">No prompts added yet.</p></div>
                    ) : (
                      <div className="divide-y divide-[#E0D9CE]">
                        {fields.map(field => {
                          const isProField = field.access === 'pro'
                          const canAccess = !isProField || isPro
                          const hasContent = field.content.trim() !== ''

                          return (
                            <div key={field.id} className="px-6 py-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider">{field.field_name}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${isProField ? 'bg-[#EDE8FF] text-[#5B47CC]' : 'bg-[#EBF5EF] text-[#2A7A4B]'}`}>
                                    {isProField ? '👑 Pro' : '🆓 Free'}
                                  </span>
                                </div>
                                {canAccess && hasContent && (
                                  <button onClick={() => handleCopy(field.content, field.id)}
                                    className={`flex items-center gap-1 text-xs font-medium ${copiedId === field.id ? 'text-[#2A7A4B]' : 'text-[#E8402A] hover:text-[#c42e2e]'}`}>
                                    {copiedId === field.id ? <><Check className="w-3 h-3" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
                                  </button>
                                )}
                              </div>
                              {!canAccess ? (
                                <div className="relative">
                                  <div className="bg-[#F5F0E8] rounded-xl p-4 blur-sm select-none pointer-events-none">
                                    <p className="text-sm text-[#1A1612]">This is a Pro prompt. Upgrade to access.</p>
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white border border-[#E0D9CE] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
                                      <Lock className="w-4 h-4 text-[#5B47CC]" />
                                      <span className="text-xs font-semibold text-[#5B47CC]">Pro only</span>
                                      <Link href="/pricing" className="text-xs bg-[#5B47CC] text-white px-2.5 py-1 rounded-full font-semibold hover:bg-[#4a38bb]">Upgrade</Link>
                                    </div>
                                  </div>
                                </div>
                              ) : !hasContent ? (
                                <div className="bg-[#F5F0E8] rounded-xl p-4 text-center">
                                  <p className="text-xs text-[#C8C0B4]">No prompt added yet.</p>
                                </div>
                              ) : (
                                <div className="bg-[#F5F0E8] rounded-xl p-4">
                                  <p className="text-sm text-[#1A1612] leading-relaxed whitespace-pre-wrap">{field.content}</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
