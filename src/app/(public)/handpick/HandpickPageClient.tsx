'use client'

import { useEffect, useState } from 'react'
import { Flame, Heart } from 'lucide-react'
import { HandpickCard } from '@/components/niches/HandpickCard'
import { useAuthStore } from '@/store/useAuthStore'
import { useSaveHandpick } from '@/hooks/useSaveHandpick'
import type { HandpickNiche, Plan } from '@/types'

const CATEGORIES = [
  'All',
  'Finance & Business',
  'Science & Technology',
  'Health & Fitness',
  'Education',
  'Entertainment',
  'Gaming',
  'Travel & Events',
  'Food & Cooking',
  'Beauty & Fashion',
  'Motivation & Self-help',
]

export function HandpickPageClient() {
  const [niches, setNiches] = useState<HandpickNiche[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [hotOnly, setHotOnly] = useState(false)
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  const plan = useAuthStore((s: { user: { plan: Plan } | null }) => s.user?.plan)
  const isPro = plan === 'pro' || plan === 'lifetime'

  const { savedIds, savingId, toggleSave } = useSaveHandpick()

  useEffect(() => {
    const fetchNiches = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeCategory !== 'All') params.set('category', activeCategory)
        if (hotOnly) params.set('hot', 'true')
        const res = await fetch(`/api/handpick?${params.toString()}`)
        const data: unknown = await res.json()
        setNiches(Array.isArray(data) ? (data as HandpickNiche[]) : [])
      } catch {
        setNiches([])
      } finally {
        setIsLoading(false)
      }
    }
    void fetchNiches()
  }, [activeCategory, hotOnly])

  const displayed = showSavedOnly
    ? niches.filter((n) => savedIds.has(n.id))
    : niches

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <Flame className="w-3.5 h-3.5" />
          Hand-Curated Channels
        </div>
        <h1 className="font-display font-black text-[36px] sm:text-[48px] leading-tight text-[#1A1612] mb-4">
          Real Channels.<br />Real Earnings.
        </h1>
        <p className="text-[#8A7F72] text-lg max-w-xl mx-auto">
          These are actual YouTube channels proving the niches work — with real subscriber counts,
          estimated earnings, and content tags. Save your favorites with the heart icon.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-[#E8402A] text-white border-[#E8402A]'
                  : 'bg-white text-[#8A7F72] border-[#E0D9CE] hover:border-[#E8402A] hover:text-[#E8402A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Saved only toggle */}
          {savedIds.size > 0 && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                showSavedOnly
                  ? 'bg-[#FDF0ED] text-[#E8402A] border-[#F5C4BA]'
                  : 'bg-white text-[#8A7F72] border-[#E0D9CE] hover:border-[#E8402A] hover:text-[#E8402A]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-current' : ''}`} />
              Saved ({savedIds.size})
            </button>
          )}

          {/* Hot toggle */}
          <button
            onClick={() => setHotOnly(!hotOnly)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              hotOnly
                ? 'bg-orange-100 text-orange-600 border-orange-200'
                : 'bg-white text-[#8A7F72] border-[#E0D9CE] hover:border-orange-300 hover:text-orange-500'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Hot Only
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 h-64 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-[#8A7F72]">
          <Heart className="w-12 h-12 text-[#C8C0B4] mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2 text-[#1A1612]">
            {showSavedOnly ? 'No saved niches yet' : 'No channels found'}
          </p>
          <p className="text-sm">
            {showSavedOnly
              ? 'Click the heart icon on any channel to save it here.'
              : 'Try changing the category or removing the Hot filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayed.map((niche) => (
            <HandpickCard
              key={niche.id}
              niche={niche}
              isPro={isPro}
              isSaved={savedIds.has(niche.id)}
              isSaving={savingId === niche.id}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}

      {/* Pro upsell banner */}
      {!isPro && (
        <div className="mt-12 bg-gradient-to-r from-[#1A1612] to-[#2d261f] rounded-[20px] p-8 text-center text-white">
          <p className="font-display font-bold text-2xl mb-2">Unlock All Channels</p>
          <p className="text-[#C5B8A8] text-sm mb-6 max-w-md mx-auto">
            Pro members see every handpicked channel including exclusive high-earning niches locked for free users.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-[#E8402A] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Go Pro — Unlock Everything →
          </a>
        </div>
      )}
    </div>
  )
}
