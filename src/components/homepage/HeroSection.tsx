'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Compass, Zap, Youtube } from 'lucide-react'

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch() {
    const q = query.trim()
    router.push(q ? `/niches?search=${encodeURIComponent(q)}` : '/niches')
  }

  return (
    <section className="pt-10 sm:pt-16 pb-16 px-4 bg-gradient-to-b from-[#F5F0E8] to-[#EDE8DF]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="font-display font-black text-[32px] sm:text-[56px] lg:text-[64px] leading-[1.08] text-[#1A1612] mb-4 sm:mb-6 tracking-tight text-balance">
          Start a Profitable{' '}
          <span className="text-[#E8402A]">Faceless YouTube Channel</span>{' '}
          This Week
        </h1>

        {/* Subheadline */}
        <p className="text-[#6B6259] text-base sm:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed text-balance">
          Browse manually researched faceless YouTube niches. Every niche comes with RPM data, script hooks, title templates, thumbnail prompts, and a 30-day content calendar.
        </p>

        {/* Single CTA */}
        <Link
          href="/niches"
          className="inline-flex items-center gap-2 bg-[#E8402A] text-white font-bold text-base px-8 py-4 rounded-full hover:bg-[#CF3520] transition-colors shadow-lg shadow-[#E8402A]/20"
        >
          Browse Free Niches →
        </Link>
        <p className="text-xs text-[#8A7F72] mt-3">
          Free forever • No credit card • Curated niches
        </p>

        {/* Search bar */}
        <div className="mt-8 sm:mt-10 max-w-[520px] mx-auto relative flex items-center bg-white rounded-full border border-[#E0D9CE] shadow-[0_4px_24px_0_rgba(26,22,18,0.08)]">
          <Search className="absolute left-4 sm:left-5 w-4 h-4 text-[#8A7F72] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search niches..."
            className="flex-1 h-12 sm:h-14 pl-10 sm:pl-12 pr-2 bg-transparent text-sm text-[#1A1612] placeholder:text-[#8A7F72] focus:outline-none rounded-full min-w-0"
          />
          <button
            onClick={handleSearch}
            className="m-1.5 px-4 sm:px-6 h-9 sm:h-11 bg-[#1A1612] text-[#F5F0E8] font-semibold text-sm rounded-full hover:opacity-90 active:scale-95 transition-all shrink-0"
          >
            Search
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mt-12">
          {[
            { icon: Compass, text: 'Curated Niches' },
            { icon: Zap, text: '30+ New Niches/Month' },
            { icon: Youtube, text: 'Faceless YouTube Focused' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-[#6B6259]">
              <Icon className="w-4 h-4 text-[#E8402A]" />
              <span className="font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
