'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ExternalLink, ChevronDown, X } from 'lucide-react'
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
  const [selectedTool, setSelectedTool] = useState<AutomationTool | null>(null)

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
    <div>
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E0D9CE] shadow-sm py-3">
        <div className="max-w-6xl mx-auto sm:px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto flex-nowrap scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Stage filters */}
            <button
              onClick={() => setStageFilter('')}
              className={cn(
                'px-3 py-1.5 min-h-[32px] rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 border',
                !stageFilter
                  ? 'bg-[#E8402A] text-white border-[#E8402A]'
                  : 'bg-white text-[#6B6259] border-[#E0D9CE] hover:border-[#E8402A]/40 hover:text-[#E8402A]'
              )}
            >
              All
            </button>
            {TOOL_STAGES.map(s => (
              <button
                key={s.value}
                onClick={() => setStageFilter(stageFilter === s.value ? '' : s.value)}
                className={cn(
                  'px-3 py-1.5 min-h-[32px] rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 border',
                  stageFilter === s.value
                    ? 'bg-[#E8402A] text-white border-[#E8402A]'
                    : 'bg-white text-[#6B6259] border-[#E0D9CE] hover:border-[#E8402A]/40 hover:text-[#E8402A]'
                )}
              >
                {s.label}
              </button>
            ))}

            {/* Divider */}
            <span className="w-px h-5 bg-[#E0D9CE] shrink-0 mx-1" />

            {/* Pricing Dropdown */}
            <PricingDropdown
              pricingFilter={pricingFilter}
              setPricingFilter={setPricingFilter}
              facelessOnly={facelessOnly}
              setFacelessOnly={setFacelessOnly}
            />

            {/* Clear button */}
            {(stageFilter || pricingFilter || facelessOnly) && (
              <button
                onClick={() => { setStageFilter(''); setPricingFilter(''); setFacelessOnly(false) }}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 text-[#E8402A] hover:bg-[#FDF0ED] transition-colors"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tools by Stage Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 space-y-14">
        {TOOL_STAGES.map((stage, idx) => {
          const stageTools = grouped.get(stage.value as ToolStage) ?? []
          if (stageTools.length === 0) return null

          return (
            <section key={stage.value} id={`stage-${stage.value}`} className="scroll-mt-28">
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
                  <ToolCard key={tool.id} tool={tool} onSelect={() => setSelectedTool(tool)} />
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

      {/* Tool Detail Modal */}
      {selectedTool && (
        <ToolDetailModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
    </div>
  )
}

function PricingDropdown({
  pricingFilter,
  setPricingFilter,
  facelessOnly,
  setFacelessOnly,
}: {
  pricingFilter: string
  setPricingFilter: (v: string) => void
  facelessOnly: boolean
  setFacelessOnly: (v: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const hasFilter = !!pricingFilter || facelessOnly
  const label = pricingFilter
    ? PRICING_TYPES.find(p => p.value === pricingFilter)?.label ?? 'Pricing'
    : facelessOnly
      ? '🎭 Faceless'
      : 'Pricing'

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 min-h-[32px] rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 border',
          hasFilter
            ? 'bg-[#1A1612] text-white border-[#1A1612]'
            : 'bg-white text-[#6B6259] border-[#E0D9CE] hover:border-[#1A1612]/30 hover:text-[#1A1612]'
        )}
      >
        {label}
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-[#E0D9CE] rounded-xl shadow-lg py-2 z-50">
          <p className="px-3 py-1 text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Pricing</p>
          {PRICING_TYPES.map(p => (
            <button
              key={p.value}
              onClick={() => { setPricingFilter(pricingFilter === p.value ? '' : p.value); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-2 text-xs hover:bg-[#F5F0E8] transition-colors flex items-center justify-between',
                pricingFilter === p.value ? 'text-[#E8402A] font-semibold' : 'text-[#1A1612]'
              )}
            >
              {p.label}
              {pricingFilter === p.value && <span className="text-[#E8402A]">✓</span>}
            </button>
          ))}
          <div className="border-t border-[#E0D9CE] my-1" />
          <button
            onClick={() => { setFacelessOnly(!facelessOnly); setOpen(false) }}
            className={cn(
              'w-full text-left px-3 py-2 text-xs hover:bg-[#F5F0E8] transition-colors flex items-center justify-between',
              facelessOnly ? 'text-[#E8402A] font-semibold' : 'text-[#1A1612]'
            )}
          >
            🎭 Faceless Only
            {facelessOnly && <span className="text-[#E8402A]">✓</span>}
          </button>
        </div>
      )}
    </div>
  )
}

function ToolCard({ tool, onSelect }: { tool: AutomationTool; onSelect: () => void }) {

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white border border-[#E0D9CE] rounded-2xl p-4 sm:p-5 flex flex-col relative overflow-hidden cursor-pointer hover:shadow-lg hover:border-[#C8C0B4] transition-all',
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
        {tool.logo_url ? (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#E0D9CE] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0"
            style={{ backgroundColor: tool.logo_bg_color, color: tool.logo_text_color }}
          >
            {tool.logo_initials}
          </div>
        )}
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
        <div className="flex items-center justify-between gap-2">
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

          <span className="text-[11px] font-semibold text-[#E8402A]">View Details →</span>
        </div>
      </div>
    </div>
  )
}

function ToolDetailModal({ tool, onClose }: { tool: AutomationTool; onClose: () => void }) {
  const visitUrl = tool.has_affiliate && tool.affiliate_url ? tool.affiliate_url : tool.website_url
  const isAffiliate = tool.has_affiliate && tool.affiliate_url
  const stageLabel = TOOL_STAGES.find(s => s.value === tool.stage)?.label ?? tool.stage

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] border border-[#E0D9CE] w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E0D9CE] px-6 py-4 flex items-center justify-between rounded-t-[20px]">
          <div className="flex items-center gap-3 min-w-0">
            {tool.logo_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E0D9CE] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: tool.logo_bg_color, color: tool.logo_text_color }}
              >
                {tool.logo_initials}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg text-[#1A1612] truncate">{tool.name}</h2>
              <p className="text-xs text-[#8A7F72] truncate">{tool.tagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F5F0E8] transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#8A7F72]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'text-xs font-bold px-3 py-1 rounded-full capitalize',
              pricingBadgeClass(tool.pricing_type)
            )}>
              {tool.pricing_type}
            </span>
            <span className="text-xs font-medium bg-[#F5F0E8] text-[#6B6259] px-3 py-1 rounded-full">
              {stageLabel}
            </span>
            {tool.is_ytniches_pick && (
              <span className="text-xs font-bold bg-[#FDF0ED] text-[#E8402A] px-3 py-1 rounded-full">⭐ YTNiches Pick</span>
            )}
            {tool.is_hot && <span className="text-xs">🔥 Hot</span>}
            {tool.is_new && <span className="text-xs">🆕 New</span>}
            {tool.is_faceless_friendly && <span className="text-xs">🎭 Faceless Friendly</span>}
          </div>

          {/* Pricing note */}
          {tool.pricing_note && (
            <div className="bg-[#F5F0E8] rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-[#8A7F72] uppercase mb-1">Pricing</p>
              <p className="text-sm text-[#1A1612]">{tool.pricing_note}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-xs font-bold text-[#8A7F72] uppercase mb-2">About</p>
            <p className="text-sm text-[#6B6259] leading-relaxed">{tool.description}</p>
          </div>

          {/* Visit button */}
          <a
            href={visitUrl}
            target="_blank"
            rel={isAffiliate ? 'noopener noreferrer nofollow' : 'noopener noreferrer'}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 min-h-[48px] rounded-full bg-[#E8402A] text-white text-sm font-bold hover:bg-[#CF3520] transition-colors"
          >
            Visit {tool.name} <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
