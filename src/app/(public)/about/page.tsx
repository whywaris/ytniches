import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, Package, Wrench, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About YTNiches — Built for Faceless YouTube Creators',
  description: 'Learn about YTNiches — why we built it, who it\'s for, and our mission to help creators start profitable faceless YouTube channels.',
  alternates: { canonical: 'https://ytniches.com/about' },
}

const FEATURES = [
  {
    title: '1,200+ Curated Niches',
    body: 'Manually researched niches with RPM data and competition analysis — updated monthly.',
    icon: Database,
  },
  {
    title: 'Complete Content Kits',
    body: 'Every niche includes script hooks, title templates, thumbnail prompts, and 30-day content calendars.',
    icon: Package,
  },
  {
    title: 'Free YouTube Tools',
    body: 'Thumbnail downloader, revenue calculator, tag extractor — free for every creator, forever.',
    icon: Wrench,
  },
  {
    title: 'Built for Beginners',
    body: 'No YouTube experience needed. Everything is explained simply so you can start immediately.',
    icon: Sparkles,
  },
]

export default function AboutPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#8A7F72] mb-8">
          <Link href="/" className="hover:text-[#1A1612]">Home</Link>
          <span className="mx-2">→</span>
          <span className="text-[#1A1612]">About</span>
        </nav>

        {/* Hero */}
        <div className="mb-16">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] text-[#1A1612] leading-tight mb-4">
            Built for Faceless YouTube Creators
          </h1>
          <p className="text-lg text-[#6B6259] leading-relaxed">
            YTNiches started with one simple problem — finding a profitable YouTube niche was taking weeks of research. We fixed that.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl text-[#1A1612] mb-4">Why We Built YTNiches</h2>
          <div className="text-[#6B6259] leading-[1.8] space-y-4">
            <p>
              Starting a faceless YouTube channel sounds simple. Pick a niche, make videos, earn money.
            </p>
            <p>
              But finding the RIGHT niche? That takes weeks.
            </p>
            <p>
              You spend hours scrolling YouTube, checking CPM data, analyzing competition — only to still feel unsure.
            </p>
            <p>
              We built YTNiches to solve exactly that. One platform with 1,200+ manually researched niches — each with real RPM data, content ideas, and everything you need to start creating immediately.
            </p>
            <p>
              No more guessing. No more wasted weeks. Just find your niche and start.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="mb-16 bg-[#EDE8DF] rounded-[20px] p-8">
          <h2 className="font-display font-bold text-2xl text-[#1A1612] mb-4">Our Mission</h2>
          <p className="text-[#6B6259] leading-[1.8] text-lg">
            To give every creator — regardless of experience, budget, or background — the research and tools they need to build a profitable faceless YouTube channel from day one.
          </p>
        </section>

        {/* What We Offer */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl text-[#1A1612] mb-8">What You Get with YTNiches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map(({ title, body, icon: Icon }) => (
              <div key={title} className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
                <div className="w-10 h-10 rounded-xl bg-[#FDF0ED] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#E8402A]" />
                </div>
                <h3 className="font-display font-bold text-[15px] text-[#1A1612] mb-1.5">{title}</h3>
                <p className="text-sm text-[#8A7F72] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-[#1A1612] rounded-[24px] p-10">
          <h2 className="font-display font-bold text-2xl text-white mb-3">Ready to Find Your Niche?</h2>
          <p className="text-[#8A7F72] text-sm mb-6">Browse 1,200+ faceless YouTube niches — free to start.</p>
          <Link
            href="/niches"
            className="inline-flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Browse Free Niches →
          </Link>
        </section>
      </div>
    </div>
  )
}
