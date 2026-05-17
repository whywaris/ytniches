'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, ChevronDown, X, Loader2 } from 'lucide-react'

interface NichesFilterProps {
  categories: string[]
  currentCategory: string
  currentSearch: string
}

export function NichesFilter({
  categories,
  currentCategory,
  currentSearch,
}: NichesFilterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  function buildUrl(params: { category: string; search: string }) {
    const sp = new URLSearchParams()
    if (params.category) sp.set('category', params.category)
    if (params.search) sp.set('search', params.search)
    return `/niches${sp.toString() ? `?${sp.toString()}` : ''}`
  }

  function handleSearch() {
    startTransition(() => {
      router.push(buildUrl({ category: currentCategory, search }))
    })
  }

  function handleCategory(cat: string) {
    startTransition(() => {
      router.push(buildUrl({ category: cat, search: currentSearch }))
    })
  }

  function clearSearch() {
    setSearch('')
    startTransition(() => {
      router.push(buildUrl({ category: currentCategory, search: '' }))
    })
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 md:px-8 mb-6 transition-opacity ${isPending ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex gap-3 flex-col sm:flex-row">

        {/* Category dropdown */}
        <div className="relative">
          <select
            value={currentCategory}
            onChange={e => handleCategory(e.target.value)}
            className="appearance-none w-full sm:w-56 px-4 py-3 pr-9 bg-white border border-[#E0D9CE] rounded-full text-sm text-[#1A1612] outline-none focus:border-[#E8402A] transition-colors cursor-pointer font-medium"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72] pointer-events-none" />
        </div>

        {/* Search input */}
        <div className="flex gap-2 flex-1">
          <div className="flex items-center gap-2 bg-white border border-[#E0D9CE] rounded-full px-4 py-3 flex-1 focus-within:border-[#E8402A] transition-colors">
            <Search className="w-4 h-4 text-[#8A7F72] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search niches by channel name..."
              className="bg-transparent border-none outline-none text-sm text-[#1A1612] w-full placeholder-[#C8C0B4]"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-[#C8C0B4] hover:text-[#E8402A] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={isPending}
            className="flex items-center gap-1.5 px-5 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#CF3520] disabled:opacity-50 transition-colors shrink-0"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
      </div>
    </div>
  )
}
