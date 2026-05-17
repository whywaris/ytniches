'use client'

import { useState } from 'react'
import { Search, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

interface FieldValue {
  id: string
  field_id: string
  value: string
  field: {
    id: string
    name: string
    slug: string
    show_to_users: boolean
    position: number
  } | null
}

interface NichePrompt {
  id: string
  channel_name: string
  channel_url: string | null
  published: boolean
  created_at: string
  field_values: FieldValue[]
}

interface Props {
  prompts: NichePrompt[]
}

export function DashboardPromptsClient({ prompts }: Props) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = prompts.filter((p) =>
    p.channel_name.toLowerCase().includes(search.toLowerCase())
  )

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">Prompts</h1>
        <p className="text-[#8A7F72] text-sm mt-1">Ready-to-use prompts for each niche</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by channel name..."
          className="pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E0D9CE] rounded-full focus:outline-none focus:border-[#E8402A] w-full sm:w-72"
        />
      </div>

      {/* Prompts list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[20px] border border-[#E0D9CE] py-16 text-center">
          <p className="text-[#8A7F72] text-sm">
            {search ? 'No prompts match your search.' : 'No prompts available yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((prompt) => {
            const isExpanded = expandedId === prompt.id
            const hasContent = prompt.field_values.length > 0

            return (
              <div key={prompt.id} className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F5F0E8] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A1612] text-[16px]">{prompt.channel_name}</h3>
                    {prompt.channel_url && (
                      <p className="text-xs text-[#8A7F72] mt-0.5 truncate">{prompt.channel_url}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#8A7F72]">
                      {prompt.field_values.length} prompt{prompt.field_values.length !== 1 ? 's' : ''}
                    </span>
                    {isExpanded
                      ? <ChevronUp className="w-5 h-5 text-[#8A7F72]" />
                      : <ChevronDown className="w-5 h-5 text-[#8A7F72]" />
                    }
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-[#E0D9CE] p-5 space-y-4">
                    {prompt.channel_url && (
                      <a
                        href={prompt.channel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[#E8402A] hover:underline mb-2"
                      >
                        Visit Channel <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {!hasContent ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-[#8A7F72]">No prompt content available for this niche yet.</p>
                      </div>
                    ) : (
                      prompt.field_values.map((fv) => {
                        const copyKey = `${prompt.id}-${fv.id}`
                        return (
                          <div key={fv.id} className="bg-[#F5F0E8] rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[#8A7F72] uppercase tracking-wider">
                                {fv.field?.name ?? 'Field'}
                              </span>
                              <button
                                onClick={() => handleCopy(fv.value, copyKey)}
                                className="flex items-center gap-1 text-xs font-semibold text-[#E8402A] hover:text-[#CF3520] transition-colors"
                              >
                                {copied === copyKey
                                  ? <><Check className="w-3 h-3" /> Copied</>
                                  : <><Copy className="w-3 h-3" /> Copy</>
                                }
                              </button>
                            </div>
                            <p className="text-sm text-[#1A1612] leading-relaxed whitespace-pre-wrap">
                              {fv.value}
                            </p>
                          </div>
                        )
                      })
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
