'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function HeroSearchForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/niches?search=${encodeURIComponent(q)}` : '/niches')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center bg-white rounded-full border border-[#E0D9CE] shadow-[0_4px_24px_0_rgba(26,22,18,0.08)] max-w-[520px] mx-auto"
    >
      <Search className="absolute left-5 w-4 h-4 text-[#8A7F72] shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search niches... e.g. finance, fitness, tech"
        className="flex-1 h-14 pl-12 pr-3 bg-transparent text-sm text-[#1A1612] placeholder:text-[#8A7F72] focus:outline-none rounded-full"
      />
      <button
        type="submit"
        className="m-1.5 px-6 h-11 bg-[#1A1612] text-[#F5F0E8] font-semibold text-sm rounded-full hover:opacity-90 active:scale-95 transition-all shrink-0"
      >
        Explore
      </button>
    </form>
  )
}