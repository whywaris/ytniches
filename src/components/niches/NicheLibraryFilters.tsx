'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompetitionLevel } from '@/types'

const CATEGORIES = [
  'All', 'Finance', 'Technology', 'Health & Fitness',
  'Education', 'Business', 'Lifestyle', 'Gaming',
]

const COMPETITION: Array<{ value: CompetitionLevel | 'All'; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

const CPM_RANGES = [
  { value: 'All', label: 'All' },
  { value: '0-15', label: '$0–$15' },
  { value: '15-30', label: '$15–$30' },
  { value: '30+', label: '$30+' },
]

const pillBase = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const pillActive = 'bg-[#1A1612] text-[#F5F0E8] border-[#1A1612]'
const pillInactive = 'bg-white text-[#8A7F72] border-[#E0D9CE] hover:text-[#1A1612] hover:border-[#8A7F72]'

export function NicheLibraryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const category = searchParams.get('category') ?? 'All'
  const competition = searchParams.get('competition') ?? 'All'
  const cpmRange = searchParams.get('cpm') ?? 'All'
  const searchFromUrl = searchParams.get('search') ?? ''

  const [searchInput, setSearchInput] = useState(searchFromUrl)

  // Sync search input when URL changes (back/forward navigation)
  useEffect(() => {
    setSearchInput(searchFromUrl)
  }, [searchFromUrl])

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'All' || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  function applySearch(value: string) {
    updateParam('search', value.trim())
  }

  const hasFilters =
    category !== 'All' || competition !== 'All' || searchFromUrl !== '' || cpmRange !== 'All'

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-[#8A7F72]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onBlur={(e) => applySearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applySearch((e.target as HTMLInputElement).value)
          }}
          placeholder="Search niches..."
          className="w-full pl-9 pr-4 h-10 rounded-xl border border-[#E0D9CE] bg-white text-sm text-[#1A1612] placeholder:text-[#8A7F72] focus:outline-none focus:ring-2 focus:ring-[#E8402A] focus:border-transparent"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); applySearch('') }}
            className="absolute right-3 text-[#8A7F72] hover:text-[#1A1612]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7F72] mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={cn(pillBase, category === cat ? pillActive : pillInactive)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Competition */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7F72] mb-2">Competition</p>
        <div className="flex gap-1.5 flex-wrap">
          {COMPETITION.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateParam('competition', value)}
              className={cn(pillBase, competition === value ? pillActive : pillInactive)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* CPM Range */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A7F72] mb-2">CPM Range</p>
        <div className="flex gap-1.5 flex-wrap">
          {CPM_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateParam('cpm', value)}
              className={cn(pillBase, cpmRange === value ? pillActive : pillInactive)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#E8402A] hover:text-[#CF3520] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear all filters
        </button>
      )}
    </div>
  )
}