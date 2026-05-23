'use client'

import { useState, useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TOOL_STAGES, PRICING_TYPES } from '@/config/automation-stages'
import type { AutomationTool, ToolStage, PricingType } from '@/types'

interface Props {
  tools: AutomationTool[]
}

const STAGE_DESCRIPTIONS: Record<string, string> = {
  'niche-research': 'Find profitable topics and validate your channel idea.',
  'script-writing': 'Generate scripts, outlines, and hooks with AI.',
  'ai-voiceover': 'Convert text to natural-sounding speech.',
  'video-editing': 'Edit, assemble, and produce videos at scale.',
  'thumbnail-design': 'Create click-worthy thumbnails that boost CTR.',
  'seo-upload': 'Optimize titles, tags, and descriptions for search.',
  'scheduling-automation': 'Schedule uploads and automate repetitive tasks.',
  'monetization': 'Maximize revenue from ads, sponsors, and products.',
  'analytics': 'Track performance and find growth opportunities.',
}

function pricingBadgeClass(type: PricingType) {
  switch (type) {
    case 'free': return 'bg-green-100 text-green-700'
    case 'freemium': return 'bg-amber-100 text-amber-700'
    case 'paid': return 'bg-purple-100 text-purple-700'
  }
}

export function AutomationToolsClient({ tools }: Props) {
  const [stageFilter, setStageFilter] = useState<string>('')
  const [pricingFilter, setPricingFilter] = useState<string>('')
  const [facelessOnly, setFacelessOnly] = useState(false)

  // Filter tools
  const filtered = useMemo(() => {
    let result = tools
    if (stageFilter) result = result.filter(t => t.stage === stageFilter)
    if (pricingFilter) result = result.filter(t => t.pricing_type === pricingFilter)
    if (facelessOnly) result = result.filter(t => t.is_faceless_friendly)
    return result
  }, [tools, stageFilter, pricingFilter, facelessOnly])

  // Group by stage (preserving TOOL_STAGES order)
  const grouped = useMemo(() => {
    const map = new Map<ToolStage, AutomationTool[]>()
    TOOL_STAGES.forEach(s => map.set(s.value as ToolStage, []))
    filtered.forEach(t => {
      const arr = map.get(t.stage) ?? []
      arr.push(t)
      map.set(t.stage, arr)
    })
    return map
  }, [filtered])

  return (
    <div className="overflow-x-hidden">
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-[#E0D9CE] py-3 sm:py-4">
        <div className="max-w-6xl mx-auto sm:px-6">
          {/* Stage pills */}
          <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setStageFilter('')}
              className={cn(
                'px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold whitespace-nowrap transition-colors shrink-0',
                !stageFilter
                  ? 'bg-[#E8402A] text-white'
                  : 'bg-[#F5F0E8] text-[#8A7F72] hover:text-[#1A1612]'
              )}
            >
              All Tools
            </button>
            {TOOL_STAGES.map(s => (
              <button
                key={s.value}
                onClick={() => setStageFilter(stageFilter === s.value ? '' : s.value)}
                className={cn(
                  'px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold whitespace-nowrap transition-colors shrink-0',
                  stageFilter === s.value
                    ? 'bg-[#E8402A] text-white'
                    : 'bg-[#F5F0E8] text-[#8A7F72] hover:text-[#1A1612]'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Pricing filter + Faceless toggle */}
          <div className="flex items-center gap-2 mt-2 sm:mt-3 overflow-x-auto flex-nowrap scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setPricingFilter('')}
              className={cn(
                'px-3 py-2 min-h-[44px] rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                !pricingFilter
                  ? 'bg-[#1A1612] text-white'
                  : 'bg-white text-[#8A7F72] border border-[#E0D9CE] hover:text-[#1A1612]'
              )}
            >
              All Pricing
            </button>
            {PRICING_TYPES.map(p => (
              <button
                key={p.value}
                onClick={() => setPricingFilter(pricingFilter === p.value ? '' : p.value)}
                className={cn(
                  'px-3 py-2 min-h-[44px] rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                  pricingFilter === p.value
                    ? 'bg-[#1A1612] text-white'
                    : 'bg-white text-[#8A7F72] border border-[#E0D9CE] hover:text-[#1A1612]'
                )}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setFacelessOnly(!facelessOnly)}
              className={cn(
                'px-3 py-2 min-h-[44px] rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ml-2',
                facelessOnly
                  ? 'bg-[#1A1612] text-white'
                  : 'bg-white text-[#8A7F72] border border-[#E0D9CE] hover:text-[#1A1612]'
              )}
            >
              🎭 Faceless Only
            </button>
          </div>
        </div>
      </div>

      {/* Tools by Stage Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {TOOL_STAGES.map((stage, idx) => {
          const stageTools = grouped.get(stage.value as ToolStage) ?? []
          if (stageTools.length === 0) return null

          return (
            <section key={stage.value} id={`stage-${stage.value}`} className="scroll-mt-40">
              {/* Stage Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#E8402A] text-white text-[11px] sm:text-sm font-bold flex items-center justify-center shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <h2 className="font-display font-bold text-lg sm:text-xl lg:text-2xl text-[#1A1612]">
                      {stage.label}
                    </h2>
                    <span className="text-[11px] sm:text-xs text-[#8A7F72] bg-[#F5F0E8] px-2 py-0.5 rounded-full">
                      {stageTools.length} tool{stageTools.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="hidden sm:block text-sm text-[#8A7F72] mt-0.5">
                    {STAGE_DESCRIPTIONS[stage.value] ?? ''}
                  </p>
                </div>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stageTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#8A7F72] text-lg">No tools match your filters.</p>
            <button
              onClick={() => { setStageFilter(''); setPricingFilter(''); setFacelessOnly(false) }}
              className="mt-4 text-sm font-semibold text-[#E8402A] hover:underline min-h-[44px] px-4"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ToolCard({ tool }: { tool: AutomationTool }) {
  const visitUrl = tool.has_affiliate && tool.affiliate_url ? tool.affiliate_url : tool.website_url
  const isAffiliate = tool.has_affiliate && tool.affiliate_url

  return (
    <div
      className={cn(
        'bg-white border border-[#E0D9CE] rounded-2xl p-4 sm:p-5 flex flex-col relative overflow-hidden',
        tool.is_ytniches_pick && 'border-l-4 border-l-[#E8402A]'
      )}
    >
      {/* YTNiches Pick badge */}
      {tool.is_ytniches_pick && (
        <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#FDF0ED] text-[#E8402A] px-2 py-0.5 rounded-full">
          ⭐ YTNiches Pick
        </span>
      )}

      {/* Logo + Name */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0"
          style={{ backgroundColor: tool.logo_bg_color, color: tool.logo_text_color }}
        >
          {tool.logo_initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-sm sm:text-base font-bold text-[#1A1612] leading-tight">{tool.name}</h3>
          <p className="hidden sm:block text-xs text-[#8A7F72] truncate">{tool.tagline}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#6B6259] leading-relaxed mb-4 flex-1 line-clamp-2 sm:line-clamp-3">
        {tool.description}
      </p>

      {/* Divider */}
      <div className="border-t border-[#E0D9CE] pt-3 mt-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
          {/* Pricing + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize',
              pricingBadgeClass(tool.pricing_type)
            )}>
              {tool.pricing_type}
            </span>
            {tool.is_hot && <span className="text-xs" title="Hot">🔥</span>}
            {tool.is_new && <span className="text-xs" title="New">🆕</span>}
            {tool.is_faceless_friendly && <span className="text-xs" title="Faceless Friendly">🎭</span>}
          </div>

          {/* Visit button */}
          <a
            href={visitUrl}
            target="_blank"
            rel={isAffiliate ? 'noopener noreferrer nofollow' : 'noopener noreferrer'}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2.5 sm:py-1.5 min-h-[44px] rounded-full border border-[#E0D9CE] text-xs font-semibold text-[#1A1612] hover:bg-[#F5F0E8] transition-colors shrink-0"
          >
            Visit Site <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
