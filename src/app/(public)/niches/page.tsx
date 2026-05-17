import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutGrid, X, Lock, Flame, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/config/categories'
import { NichesFilter } from '@/components/niches/NichesFilter'
import { NichesPagination } from '@/components/niches/NichesPagination'
import { NichesCTA } from '@/components/shared/NichesCTA'
import { WebsiteJsonLd } from '@/components/shared/JsonLd'
import { NicheCard } from '@/components/niches/NicheCard'
import type { Niche, CTASetting } from '@/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '100+ Most Profitable YouTube Niches 2026',
  description:
    'Browse curated YouTube niches with real channel examples, earning estimates, and proven content ideas. Find your perfect niche today.',
  openGraph: {
    title: 'YouTube Niche Library | YTNiches',
    description: 'Browse curated YouTube niches with real earning data.',
    url: 'https://ytniches.com/niches',
    type: 'website',
  },
  alternates: { canonical: 'https://ytniches.com/niches' },
}

const NICHES_PER_PAGE = 20

interface PageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    search?: string
  }>
}

export default async function NichesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const supabase = await createClient()

  const currentPage = Math.max(1, parseInt(sp.page ?? '1'))
  const category = sp.category ?? ''
  const search = sp.search ?? ''

  // Get user plan
  const { data: { user } } = await supabase.auth.getUser()
  let isPro = false
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()
    isPro = userData?.plan === 'pro' || userData?.plan === 'lifetime'
  }

  // Fetch HOT niches (always show at top — no pagination, no filters)
  const { data: hotNichesRaw } = await supabase
    .from('niches')
    .select('*')
    .eq('published', true)
    .eq('is_hot', true)
    .order('created_at', { ascending: false })
  const hotNiches = (hotNichesRaw as unknown as Niche[]) ?? []

  // Fetch regular niches with pagination
  let query = supabase
    .from('niches')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .eq('is_hot', false)

  if (category) query = query.eq('category', category)
  if (search) query = query.or(`channel_name.ilike.%${search}%,name.ilike.%${search}%`)

  const from = (currentPage - 1) * NICHES_PER_PAGE
  const to = from + NICHES_PER_PAGE - 1
  query = query.range(from, to).order('created_at', { ascending: false })

  const { data, count } = await query
  const niches = (data as unknown as Niche[]) ?? []
  const totalPages = Math.ceil((count ?? 0) / NICHES_PER_PAGE)

  // Fetch CTA settings
  const { data: ctaData } = await supabase
    .from('cta_settings')
    .select('*')
    .eq('page', 'niche_library')
    .single()

  const hasFilters = !!(category || search)

  return (
    <>
      <WebsiteJsonLd />

      <div className="min-h-screen bg-[#F5F0E8]">

        {/* PAGE HEADER */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#E8402A] uppercase tracking-wider mb-2">Niche Library</p>
              <h1 className="font-display text-4xl md:text-5xl font-black text-[#1A1612] leading-tight">
                YouTube Niches Library
              </h1>
              <p className="text-sm text-[#8A7F72] mt-2">
                Real channels, real earnings — find your perfect niche
              </p>
            </div>
            <Link
              href="/categories"
              className="flex items-center gap-1.5 text-sm font-medium text-[#E8402A] hover:underline shrink-0"
            >
              <LayoutGrid className="w-4 h-4" />
              Browse by category
            </Link>
          </div>
        </div>

        {/* FILTER BAR */}
        <NichesFilter
          categories={CATEGORIES.map(c => c.name)}
          currentCategory={category}
          currentSearch={search}
        />

        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">

          {/* HOT NICHES SECTION */}
          {hotNiches.length > 0 && !hasFilters && currentPage === 1 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-[#E8402A]" />
                <h2 className="font-display text-2xl font-black text-[#1A1612]">Hot Right Now</h2>
                <span className="text-xs text-[#8A7F72] bg-white border border-[#E0D9CE] px-2.5 py-1 rounded-full ml-1">
                  {hotNiches.length} niche{hotNiches.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {hotNiches.map(niche => (
                  <NicheCard key={niche.id} niche={niche} isPro={isPro} />
                ))}
              </div>
            </div>
          )}

          {/* DIVIDER */}
          {hotNiches.length > 0 && !hasFilters && currentPage === 1 && (
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-[#E0D9CE]" />
              <span className="text-xs text-[#8A7F72] font-medium">All Niches</span>
              <div className="flex-1 h-px bg-[#E0D9CE]" />
            </div>
          )}

          {/* RESULTS COUNT */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#8A7F72]">
              {count === 0 ? (
                'No niches found'
              ) : (
                <>
                  Showing{' '}
                  <span className="text-[#1A1612] font-semibold">{from + 1}–{Math.min(to + 1, count ?? 0)}</span>
                  {' '}of{' '}
                  <span className="text-[#1A1612] font-semibold">{count}</span>
                  {' '}niches
                  {category && <> in <strong>{category}</strong></>}
                  {search && <> matching <strong>&ldquo;{search}&rdquo;</strong></>}
                </>
              )}
            </p>
            {hasFilters && (
              <Link href="/niches" className="flex items-center gap-1 text-xs text-[#E8402A] hover:underline">
                <X className="w-3 h-3" /> Clear filters
              </Link>
            )}
          </div>

          {/* NICHES GRID */}
          {niches.length === 0 ? (
            <div className="bg-white border border-[#E0D9CE] rounded-2xl p-16 text-center">
              <h3 className="font-display text-xl font-bold text-[#1A1612] mb-2">No niches found</h3>
              <p className="text-sm text-[#8A7F72] mb-4">Try adjusting your filters or search term.</p>
              <Link href="/niches" className="text-sm font-semibold text-[#E8402A] hover:underline">
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {niches.map(niche => (
                <NicheCard key={niche.id} niche={niche} isPro={isPro} />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <NichesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={{ page: sp.page, category: sp.category, search: sp.search }}
            />
          )}
        </div>

        {/* ADMIN-CONTROLLED CTA */}
        {ctaData
          ? <NichesCTA cta={ctaData as CTASetting} />
          : (
            <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
              <div className="bg-[#1A1612] rounded-2xl p-8 md:p-10 text-center">
                <h3 className="font-display text-3xl font-black text-white mb-3">
                  Find Your Perfect YouTube Niche
                </h3>
                <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
                  Join thousands of creators using YTNiches to grow their channels.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/auth/signup" className="px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors">
                    Start free today
                  </Link>
                  <Link href="/pricing" className="px-6 py-3 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition-colors">
                    See pricing
                  </Link>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </>
  )
}
