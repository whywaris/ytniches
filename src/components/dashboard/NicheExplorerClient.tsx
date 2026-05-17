'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { LayoutGrid, List, Heart, ArrowRight, Search, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import { NicheCard } from '@/components/niches/NicheCard'
import { cn } from '@/lib/utils'
import { CATEGORY_NAMES, getCategoryTypes } from '@/config/categories'
import type { Niche } from '@/types'

const COMPETITIONS = ['All', 'Low', 'Medium', 'High']

interface Props {
  niches: Niche[]
  total: number
  page: number
  isPro: boolean
  savedNicheIds: string[]
}

export function NicheExplorerClient({ niches, total, page, isPro, savedNicheIds }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [saved, setSaved] = useState<Set<string>>(new Set(savedNicheIds))
  const [savingId, setSavingId] = useState<string | null>(null)
  const { user, addSavedNiche, removeSavedNiche } = useAuthStore()
  const { showToast } = useToast()

  const totalPages = Math.ceil(total / 24)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'All') params.set(key, value)
    else params.delete(key)
    if (key === 'category') params.delete('content_type')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  async function toggleSave(niche: Niche) {
    if (savingId === niche.id) return

    setSavingId(niche.id)
    const supabase = createClient()

    try {
      let userId: string

      if (user) {
        // Store is hydrated — use directly
        userId = user.id
      } else {
        // Store not hydrated yet — check session directly
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          showToast('Please log in to save niches', 'info')
          return
        }
        userId = session.user.id
      }

      const isSaved = saved.has(niche.id)

      // Optimistic UI update
      if (isSaved) {
        setSaved((prev) => { const s = new Set(prev); s.delete(niche.id); return s })
        removeSavedNiche(niche.id)
      } else {
        setSaved((prev) => new Set(Array.from(prev).concat(niche.id)))
        addSavedNiche(niche.id)
      }

      // Build updated array from local Set (source of truth for this component)
      const savedArr = Array.from(saved)
      const updatedArray = isSaved
        ? savedArr.filter((id) => id !== niche.id)
        : savedArr.concat(niche.id)

      const { error } = await supabase
        .from('users')
        .update({ saved_niches: updatedArray })
        .eq('id', userId)

      if (error) {
        // Revert optimistic update
        if (isSaved) {
          setSaved((prev) => new Set(Array.from(prev).concat(niche.id)))
          addSavedNiche(niche.id)
        } else {
          setSaved((prev) => { const s = new Set(prev); s.delete(niche.id); return s })
          removeSavedNiche(niche.id)
        }
        showToast('Failed to save — please try again', 'error')
      } else {
        showToast(isSaved ? 'Removed from saved' : 'Niche saved!', 'success')
      }
    } catch {
      showToast('Failed to save — please try again', 'error')
    } finally {
      setSavingId(null)
    }
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const currentSearch = searchParams.get('search') ?? ''
  const currentCat = searchParams.get('category') ?? 'All'
  const currentComp = searchParams.get('competition') ?? 'All'
  const currentContentType = searchParams.get('content_type') ?? ''

  const categoryTypes = getCategoryTypes(currentCat)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">HandPick Niches</h1>
          <p className="text-muted text-sm mt-1">{total.toLocaleString()} niches available</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className={cn('p-2 rounded-lg transition-colors', view === 'grid' ? 'bg-accent-light text-accent' : 'text-muted hover:bg-secondary')}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-colors', view === 'list' ? 'bg-accent-light text-accent' : 'text-muted hover:bg-secondary')}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            defaultValue={currentSearch}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Search niches..."
            className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-full focus:outline-none focus:border-accent w-44 text-foreground"
          />
        </div>
        <select
          defaultValue={currentCat}
          onChange={(e) => updateParam('category', e.target.value)}
          className="text-sm bg-card border border-border rounded-full px-4 py-2 focus:outline-none focus:border-accent text-foreground"
        >
          <option value="All">All Categories</option>
          {CATEGORY_NAMES.map((c) => <option key={c}>{c}</option>)}
        </select>
        {currentCat !== 'All' && categoryTypes.length > 0 && (
          <select
            key={currentCat}
            defaultValue={currentContentType}
            onChange={(e) => updateParam('content_type', e.target.value)}
            className="text-sm bg-card border border-border rounded-full px-4 py-2 focus:outline-none focus:border-accent text-foreground"
          >
            <option value="">All Types</option>
            {categoryTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
        <select
          defaultValue={currentComp}
          onChange={(e) => updateParam('competition', e.target.value)}
          className="text-sm bg-card border border-border rounded-full px-4 py-2 focus:outline-none focus:border-accent text-foreground"
        >
          {COMPETITIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {niches.map((niche) => (
            <NicheCard
              key={niche.id}
              niche={niche}
              isLocked={niche.is_premium && !isPro}
              isSaved={saved.has(niche.id)}
              onSave={() => toggleSave(niche)}
              isSaving={savingId === niche.id}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="bg-card rounded-[20px] border border-border overflow-hidden mb-8 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left px-5 py-3 text-xs font-bold text-muted uppercase tracking-wider">Niche</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider hidden md:table-cell">CPM</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider hidden lg:table-cell">Competition</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {niches.map((niche) => (
                <tr key={niche.id} className="hover:bg-secondary transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-foreground">{niche.name}</p>
                    {niche.is_premium && !isPro && (
                      <span className="text-[10px] text-accent font-bold">PRO</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted hidden sm:table-cell">{niche.category}</td>
                  <td className="px-4 py-3.5 text-muted hidden md:table-cell">${niche.cpm_min}–${niche.cpm_max}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
                      niche.competition_level === 'Low' ? 'bg-[#EBF5EF] text-[#2A7A4B]' :
                      niche.competition_level === 'Medium' ? 'bg-[#FEF6E8] text-[#A06B00]' :
                      'bg-accent-light text-accent'
                    )}>
                      {niche.competition_level}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleSave(niche)}
                        disabled={savingId === niche.id}
                        aria-label={saved.has(niche.id) ? 'Unsave' : 'Save'}
                      >
                        {savingId === niche.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted" />
                        ) : (
                          <Heart className={cn('w-4 h-4 transition-colors', saved.has(niche.id) ? 'fill-accent text-accent' : 'text-muted hover:text-accent')} />
                        )}
                      </button>
                      {(!niche.is_premium || isPro) && (
                        <Link href={`/niches/${niche.slug}`} className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover">
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="px-4 py-2 text-sm font-semibold rounded-full border border-border disabled:opacity-40 hover:border-accent transition-colors text-foreground">
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page + i - 2
            if (p > totalPages) return null
            return (
              <button key={p} onClick={() => goToPage(p)} className={cn('w-9 h-9 text-sm font-semibold rounded-full transition-colors', p === page ? 'bg-accent text-white' : 'border border-border hover:border-accent text-foreground')}>
                {p}
              </button>
            )
          })}
          <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="px-4 py-2 text-sm font-semibold rounded-full border border-border disabled:opacity-40 hover:border-accent transition-colors text-foreground">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
