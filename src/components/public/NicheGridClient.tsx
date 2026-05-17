'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Lock, TrendingUp, Minus, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, getCategoryTypes } from '@/config/categories'
import type { Niche } from '@/types'

interface Props {
  niches: Niche[]
  initialCategory?: string
}

const CPM_RANGES = [
  { label: 'All CPM', value: 'all' },
  { label: '$0–$15', value: '0-15' },
  { label: '$15–$30', value: '15-30' },
  { label: '$30+', value: '30+' },
]

const COMPETITION_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
]

function competitionStyle(level: string) {
  if (level === 'Low') return 'bg-[#EBF5EF] text-[#2A7A4B]'
  if (level === 'Medium') return 'bg-[#FEF3C7] text-[#92400E]'
  return 'bg-[#FDF0ED] text-[#E8402A]'
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'rising') return <TrendingUp className="w-3 h-3" />
  if (trend === 'declining') return <TrendingDown className="w-3 h-3" />
  return <Minus className="w-3 h-3" />
}

function NicheCard({ niche }: { niche: Niche }) {
  return (
    <Link
      href={`/niches/${niche.slug}`}
      className="group bg-white border border-[#E0D9CE] rounded-[20px] overflow-hidden hover:border-[#C8C0B4] hover:shadow-md transition-all block"
    >
      {/* Header strip */}
      <div className="bg-[#F5F0E8] px-4 py-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7F72]">
          {niche.category}
          {niche.content_type && <span className="font-normal"> · {niche.content_type}</span>}
        </span>
        {niche.is_premium && (
          <Lock className="w-3 h-3 text-[#8A7F72]" />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display font-bold text-[15px] text-[#1A1612] mb-3 line-clamp-2 group-hover:text-[#E8402A] transition-colors leading-snug">
          {niche.name}
        </h3>

        {/* CPM + Competition */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-[#1A1612]">
            ${niche.cpm_min}–${niche.cpm_max} CPM
          </span>
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full',
              competitionStyle(niche.competition_level)
            )}
          >
            {niche.competition_level}
          </span>
        </div>

        {/* Video ideas count + trend */}
        <div className="flex items-center justify-between text-[11px] text-[#8A7F72]">
          <span>{niche.video_ideas?.length ?? 0} video ideas</span>
          <span className="flex items-center gap-1 capitalize">
            <TrendIcon trend={niche.growth_trend} />
            {niche.growth_trend}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-3 pt-3 border-t border-[#F0EBE3]">
          <span className="text-xs font-bold text-[#E8402A] group-hover:underline">
            View niche →
          </span>
        </div>
      </div>
    </Link>
  )
}

export function NicheGridClient({ niches, initialCategory }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory ?? 'All')
  const [contentType, setContentType] = useState('All')
  const [cpmRange, setCpmRange] = useState('all')
  const [competition, setCompetition] = useState('all')

  const contentTypes = useMemo(() => getCategoryTypes(category), [category])

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    setContentType('All')
  }

  const filtered = useMemo(() => {
    return niches.filter((n) => {
      if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'All' && n.category !== category) return false
      if (contentType !== 'All' && n.content_type !== contentType) return false
      if (cpmRange === '0-15' && n.cpm_max > 15) return false
      if (cpmRange === '15-30' && (n.cpm_min < 15 || n.cpm_max > 30)) return false
      if (cpmRange === '30+' && n.cpm_min < 30) return false
      if (competition !== 'all' && n.competition_level !== competition) return false
      return true
    })
  }, [niches, search, category, contentType, cpmRange, competition])

  const allCategories = ['All', ...CATEGORIES.map((c) => c.name)]

  return (
    <div>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search niches..."
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E0D9CE] rounded-full focus:outline-none focus:border-[#E8402A]"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0',
                category === cat
                  ? 'bg-[#E8402A] text-white'
                  : 'bg-white border border-[#E0D9CE] text-[#8A7F72] hover:border-[#E8402A] hover:text-[#E8402A]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content type pills — shown when a category is selected */}
        {category !== 'All' && contentTypes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {['All', ...contentTypes].map((type) => (
              <button
                key={type}
                onClick={() => setContentType(type)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0',
                  contentType === type
                    ? 'bg-[#1A1612] text-white'
                    : 'bg-white border border-[#E0D9CE] text-[#8A7F72] hover:border-[#1A1612] hover:text-[#1A1612]'
                )}
              >
                {type === 'All' ? 'All Types' : type}
              </button>
            ))}
          </div>
        )}

        {/* CPM + Competition dropdowns */}
        <div className="flex flex-wrap gap-3">
          <select
            value={cpmRange}
            onChange={(e) => setCpmRange(e.target.value)}
            className="text-sm border border-[#E0D9CE] bg-white text-[#1A1612] rounded-full px-3 py-2 focus:outline-none focus:border-[#E8402A]"
          >
            {CPM_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
            className="text-sm border border-[#E0D9CE] bg-white text-[#1A1612] rounded-full px-3 py-2 focus:outline-none focus:border-[#E8402A]"
          >
            {COMPETITION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Competition: {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-[#8A7F72] mb-4">
        Showing <strong>{filtered.length}</strong> of {niches.length} niches
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E0D9CE] rounded-[20px] py-16 text-center">
          <p className="text-[#8A7F72] text-sm">No niches match your filters.</p>
          <button
            onClick={() => {
              setSearch('')
              setCategory('All')
              setContentType('All')
              setCpmRange('all')
              setCompetition('all')
            }}
            className="mt-3 text-sm font-semibold text-[#E8402A] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((niche) => (
            <NicheCard key={niche.id} niche={niche} />
          ))}
        </div>
      )}
    </div>
  )
}
