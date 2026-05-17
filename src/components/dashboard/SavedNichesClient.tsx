'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Heart, Search, ExternalLink } from 'lucide-react'
import { SavedNicheCard } from './SavedNicheCard'
import type { Niche, HandpickNiche } from '@/types'

const CATEGORIES = ['All', 'Finance', 'Tech', 'Health', 'Business', 'Lifestyle', 'Education', 'Gaming']

type Tab = 'niches' | 'handpick'

interface SavedHandpickRow {
  id: string
  handpick_id: string
  handpick: HandpickNiche
}

interface Props {
  initialNiches: Niche[]
  initialSavedHandpick: SavedHandpickRow[]
}

export function SavedNichesClient({ initialNiches, initialSavedHandpick }: Props) {
  const [niches, setNiches] = useState(initialNiches)
  const [savedHandpick, setSavedHandpick] = useState(initialSavedHandpick)
  const [activeTab, setActiveTab] = useState<Tab>('niches')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filteredNiches = useMemo(() => {
    return niches.filter((n) => {
      const matchCat = activeCategory === 'All' || n.category === activeCategory
      const matchSearch = n.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [niches, activeCategory, search])

  function handleRemove(id: string) {
    setNiches((prev) => prev.filter((n) => n.id !== id))
  }

  async function handleUnsaveHandpick(handpickId: string) {
    // Optimistic update
    setSavedHandpick((prev) => prev.filter((r) => r.handpick_id !== handpickId))
    try {
      await fetch('/api/handpick/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handpick_id: handpickId }),
      })
    } catch {
      // Silent fail — state already updated
    }
  }

  const totalSaved = niches.length + savedHandpick.length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Saved Niches</h1>
        <span className="bg-accent-light text-accent text-sm font-bold px-3 py-1 rounded-full">
          {totalSaved}
        </span>
      </div>

      {totalSaved === 0 ? (
        <div className="bg-card rounded-[20px] border border-border border-dashed py-20 text-center">
          <Heart className="w-12 h-12 text-border mx-auto mb-4" />
          <p className="font-display font-bold text-xl text-foreground mb-2">No saved niches yet</p>
          <p className="text-muted text-sm mb-6">
            Browse the niche library and tap the heart to save ones you like
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/niches"
              className="inline-block bg-accent text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-accent-hover transition-colors"
            >
              Browse niches
            </Link>
            <Link
              href="/handpick"
              className="inline-block bg-card border border-border text-foreground font-bold text-sm px-6 py-3 rounded-full hover:bg-[#F5F0E8] transition-colors"
            >
              HandPick channels
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-[#F5F0E8] rounded-full p-1 w-fit mb-6">
            <button
              onClick={() => setActiveTab('niches')}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${
                activeTab === 'niches'
                  ? 'bg-white text-[#1A1612] shadow-sm'
                  : 'text-[#8A7F72] hover:text-[#1A1612]'
              }`}
            >
              Niche Library
              {niches.length > 0 && (
                <span className="ml-1.5 text-xs bg-[#E0D9CE] text-[#5A5248] px-1.5 py-0.5 rounded-full">
                  {niches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('handpick')}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${
                activeTab === 'handpick'
                  ? 'bg-white text-[#1A1612] shadow-sm'
                  : 'text-[#8A7F72] hover:text-[#1A1612]'
              }`}
            >
              HandPick Channels
              {savedHandpick.length > 0 && (
                <span className="ml-1.5 text-xs bg-[#E0D9CE] text-[#5A5248] px-1.5 py-0.5 rounded-full">
                  {savedHandpick.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Niche Library Tab ── */}
          {activeTab === 'niches' && (
            niches.length === 0 ? (
              <div className="bg-card rounded-[20px] border border-border border-dashed py-14 text-center">
                <p className="text-muted text-sm mb-4">No saved niches from the library yet.</p>
                <Link href="/niches" className="text-sm font-semibold text-accent hover:underline">
                  Browse niches →
                </Link>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-4 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search saved niches..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-full focus:outline-none focus:border-accent transition-colors text-foreground"
                  />
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-6">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                        activeCategory === cat
                          ? 'bg-accent text-white'
                          : 'bg-card border border-border text-muted hover:border-accent hover:text-accent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {filteredNiches.length === 0 ? (
                  <div className="py-14 text-center text-muted text-sm">
                    No niches match your filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNiches.map((niche) => (
                      <SavedNicheCard key={niche.id} niche={niche} onRemove={handleRemove} />
                    ))}
                  </div>
                )}
              </>
            )
          )}

          {/* ── HandPick Tab ── */}
          {activeTab === 'handpick' && (
            savedHandpick.length === 0 ? (
              <div className="bg-card rounded-[20px] border border-border border-dashed py-14 text-center">
                <Heart className="w-10 h-10 text-border mx-auto mb-3" />
                <p className="text-muted text-sm mb-4">No saved handpick channels yet.</p>
                <Link href="/handpick" className="text-sm font-semibold text-accent hover:underline">
                  Browse HandPick channels →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedHandpick.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E0D9CE]"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F5F0E8] border border-[#E0D9CE] shrink-0">
                      {item.handpick.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.handpick.image_url}
                          alt={item.handpick.channel_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-[#8A7F72] font-bold">
                          {item.handpick.channel_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1A1612] truncate">
                        {item.handpick.channel_name}
                      </p>
                      <p className="text-xs text-[#8A7F72]">
                        {item.handpick.category} · {item.handpick.monthly_earning_range}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={item.handpick.channel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#F5F0E8] text-[#1A1612] rounded-full border border-[#E0D9CE] hover:bg-[#E0D9CE] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                      <button
                        onClick={() => void handleUnsaveHandpick(item.handpick_id)}
                        className="w-7 h-7 flex items-center justify-center text-[#E8402A] hover:bg-[#FDF0ED] rounded-lg transition-colors"
                        title="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}
