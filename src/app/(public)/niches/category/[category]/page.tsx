import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NicheGridClient } from '@/components/public/NicheGridClient'
import { BreadcrumbJsonLd } from '@/components/shared/JsonLd'
import { CATEGORIES, getCategoryBySlug } from '@/config/categories'
import type { Niche } from '@/types'

export const revalidate = 3600

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const cat = getCategoryBySlug(params.category)
  if (!cat) return { title: 'Category Not Found' }

  return {
    title: `Best ${cat.name} YouTube Niches 2025 — CPM & Ideas`,
    description: `Browse ${cat.name} YouTube niches with CPM data, competition levels, and video ideas. Find the most profitable ${cat.name.toLowerCase()} niche for your channel.`,
    openGraph: {
      title: `${cat.name} YouTube Niches 2025`,
      description: `CPM data, competition levels, and video ideas for ${cat.name} YouTube niches.`,
      type: 'website',
      url: `https://ytniches.com/niches/category/${params.category}`,
    },
    alternates: { canonical: `https://ytniches.com/niches/category/${params.category}` },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string }
}) {
  const cat = getCategoryBySlug(params.category)
  if (!cat) notFound()

  const supabase = await createClient()

  const { data } = await supabase
    .from('niches')
    .select(
      'id, name, slug, category, category_slug, content_type, cpm_min, cpm_max, competition_level, growth_trend, avg_views, is_premium, published, video_ideas, created_at, updated_at'
    )
    .eq('category', cat.name)
    .eq('published', true)
    .order('cpm_max', { ascending: false })

  const niches = (data as unknown as Niche[]) ?? []

  const breadcrumbs = [
    { name: 'Home', url: 'https://ytniches.com' },
    { name: 'Niches', url: 'https://ytniches.com/niches' },
    { name: cat.name, url: `https://ytniches.com/niches/category/${params.category}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className="min-h-screen bg-[#F5F0E8]">
        {/* Breadcrumb */}
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-[#8A7F72]">
            <Link href="/" className="hover:text-[#1A1612] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/niches" className="hover:text-[#1A1612] transition-colors">Niches</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1A1612] font-medium">{cat.name}</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="pt-6 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E8402A] mb-3 block">
            {cat.name}
          </span>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-[#1A1612] mb-4 leading-tight">
            {cat.name} YouTube Niches
          </h1>
          <p className="text-[#8A7F72] leading-relaxed max-w-2xl mb-4">
            {cat.intro}
          </p>
          <div className="flex items-center gap-3 text-sm">
            <span className="bg-white border border-[#E0D9CE] rounded-full px-3 py-1 text-[#1A1612] font-semibold">
              {niches.length} niches
            </span>
            <Link href="/niches" className="text-[#8A7F72] hover:text-[#E8402A] transition-colors">
              Browse all categories →
            </Link>
          </div>
        </section>

        {/* Grid */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">
          <NicheGridClient niches={niches} initialCategory={cat.name} />
        </section>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-[#E0D9CE] py-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display font-bold text-3xl text-[#1A1612] mb-3">
              Get the complete kit for every niche
            </h2>
            <p className="text-[#8A7F72] mb-8">
              Video ideas, title templates, script hooks, and a 30-day content calendar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="bg-[#E8402A] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[#CF3520] transition-colors text-sm"
              >
                Start for free
              </Link>
              <Link
                href="/pricing"
                className="border border-[#E0D9CE] text-[#1A1612] font-semibold px-7 py-3.5 rounded-full hover:bg-[#F5F0E8] transition-colors text-sm"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
