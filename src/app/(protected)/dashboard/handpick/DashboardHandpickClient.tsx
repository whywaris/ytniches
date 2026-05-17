'use client'

import { useState, useMemo } from 'react'
import { Flame } from 'lucide-react'
import { HandpickCard } from '@/components/niches/HandpickCard'
import type { HandpickNiche } from '@/types'

interface Props {
  niches: HandpickNiche[]
  isPro: boolean
}

export function DashboardHandpickClient({ niches, isPro }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [hotOnly, setHotOnly] = useState(false)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(niches.map((n) => n.category))).sort()
    return ['All', ...cats]
  }, [niches])

  const filtered = useMemo(() => {
    return niches.filter((n) => {
      const matchCat = activeCategory === 'All' || n.category === activeCategory
      const matchHot = !hotOnly || n.is_hot
      return matchCat && matchHot
    })
  }, [niches, activeCategory, hotOnly])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">HandPick Niches</h1>
        <p className="text-muted text-sm mt-1">
          Real YouTube channels proving these niches work — verified earnings and subscriber counts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === cat
                ? 'bg-accent text-white border-accent'
                : 'bg-card text-muted border-border hover:border-accent hover:text-accent'
            }`}
          >
            {cat}
          </button>
        ))}

        <button
          onClick={() => setHotOnly(!hotOnly)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            hotOnly
              ? 'bg-orange-100 text-orange-600 border-orange-200'
              : 'bg-card text-muted border-border hover:border-orange-300 hover:text-orange-500'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Hot Only
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-muted mb-4">
        Showing {filtered.length} of {niches.length} channels
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
          <p className="text-sm font-semibold text-foreground">No channels found</p>
          <p className="text-xs text-muted">Try a different category or turn off the Hot filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((niche) => (
            <HandpickCard key={niche.id} niche={niche} isPro={isPro} />
          ))}
        </div>
      )}

      {/* Pro upsell for free users */}
      {!isPro && niches.some((n) => n.is_pro_only) && (
        <div className="mt-10 bg-gradient-to-r from-[#1A1612] to-[#2d261f] rounded-[20px] p-8 text-center text-white">
          <p className="font-display font-bold text-xl mb-2">Unlock All Channels</p>
          <p className="text-[#C5B8A8] text-sm mb-5 max-w-md mx-auto">
            Pro members see every handpicked channel including exclusive high-earning niches.
          </p>
          <a
            href="/dashboard/billing"
            className="inline-block bg-[#E8402A] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Go Pro — Unlock Everything →
          </a>
        </div>
      )}
    </div>
  )
}
