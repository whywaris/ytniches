'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { useNicheStore } from '@/store/useNicheStore'
import type { CompetitionLevel } from '@/types'

const CATEGORIES = [
  'All',
  'Finance',
  'Health & Fitness',
  'Technology',
  'Education',
  'Lifestyle',
  'Business',
  'Gaming',
  'Food',
  'Travel',
  'Personal Development',
]

const COMPETITION_LEVELS: Array<{ value: CompetitionLevel | 'All'; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

export function NicheFilters() {
  const { filters, setFilter, resetFilters } = useNicheStore()
  const hasActiveFilters =
    filters.category !== 'All' || filters.competition !== 'All' || filters.search !== ''

  return (
    <div className="space-y-4">
      {/* ── Search ───────────────────────────────────────────────── */}
      <Input
        placeholder="Search niches..."
        value={filters.search}
        onChange={(e) => setFilter('search', e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          filters.search ? (
            <button onClick={() => setFilter('search', '')} className="hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          ) : undefined
        }
      />

      {/* ── Category Pills ───────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter('category', cat)}
              className={cn(
                'px-3 py-1.5 rounded-pill text-xs font-medium border transition-colors',
                filters.category === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card border-border text-muted hover:text-foreground hover:border-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Competition Pills ────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Competition</p>
        <div className="flex gap-2">
          {COMPETITION_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter('competition', value)}
              className={cn(
                'px-3 py-1.5 rounded-pill text-xs font-medium border transition-colors',
                filters.competition === value
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card border-border text-muted hover:text-foreground hover:border-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reset ────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover font-medium"
        >
          <X className="w-3.5 h-3.5" />
          Clear all filters
        </button>
      )}
    </div>
  )
}
