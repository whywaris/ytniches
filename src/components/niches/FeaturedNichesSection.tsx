'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, TrendingUp, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Niche, CompetitionLevel } from '@/types'

const CATEGORIES = ['All', 'Finance', 'Technology', 'Health & Fitness', 'Business', 'Lifestyle', 'Education']

const competitionVariant: Record<CompetitionLevel, 'low' | 'medium' | 'high'> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

interface Props {
  niches: Niche[]
  isPremiumUser: boolean
}

export function FeaturedNichesSection({ niches, isPremiumUser }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')

  const displayed =
    activeCategory === 'All' ? niches : niches.filter((n) => n.category === activeCategory)

  return (
    <div>
      {/* ── Category tabs ─────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors shrink-0',
              activeCategory === cat
                ? 'bg-[#1A1612] text-[#F5F0E8] border-[#1A1612]'
                : 'bg-white text-[#8A7F72] border-[#E0D9CE] hover:text-[#1A1612] hover:border-[#8A7F72]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Niche Cards ───────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <p className="text-center text-[#8A7F72] py-12 text-sm">
          No niches in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map((niche) => {
            const isLocked = niche.is_premium && !isPremiumUser
            return (
              <div
                key={niche.id}
                className={cn(
                  'relative bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden',
                  'shadow-[0_2px_12px_0_rgba(26,22,18,0.06)]',
                  !isLocked && 'hover:shadow-[0_8px_32px_0_rgba(26,22,18,0.12)] hover:border-[#C8C0B3] transition-all duration-200'
                )}
              >
                {isLocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-7 bg-gradient-to-b from-transparent via-white/75 to-white rounded-[20px]">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#EDE8DF] border border-[#E0D9CE] mb-2.5">
                      <Lock className="w-4 h-4 text-[#8A7F72]" />
                    </div>
                    <p className="text-sm font-bold text-[#1A1612] mb-1">Pro niche</p>
                    <Link
                      href="/pricing"
                      className="text-xs font-semibold text-[#E8402A] hover:underline"
                    >
                      Unlock — $9/mo
                    </Link>
                  </div>
                )}

                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8402A] mb-1.5">
                    {niche.category}
                  </p>
                  <h3 className="font-display text-[16px] font-bold text-[#1A1612] leading-snug mb-3 line-clamp-2">
                    {niche.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EDE8DF] text-[#1A1612] px-2.5 py-0.5 rounded-full">
                      <DollarSign className="w-3 h-3 text-[#2E7D32]" />
                      ${niche.cpm_min}–${niche.cpm_max} CPM
                    </span>
                    <Badge variant={competitionVariant[niche.competition_level]}>
                      <TrendingUp className="w-3 h-3" />
                      {niche.competition_level}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#8A7F72] mb-4">
                    {niche.video_ideas.length} video ideas included
                  </p>

                  <div className="pt-3.5 border-t border-[#E0D9CE]">
                    {isLocked ? (
                      <Link
                        href="/pricing"
                        className="text-sm font-bold text-[#E8402A] hover:text-[#CF3520] transition-colors"
                      >
                        Unlock kit →
                      </Link>
                    ) : (
                      <Link
                        href={`/niches/${niche.slug}`}
                        className="text-sm font-bold text-[#E8402A] hover:text-[#CF3520] transition-colors"
                      >
                        View kit →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
