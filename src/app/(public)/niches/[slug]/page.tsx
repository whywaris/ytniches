import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  Lock,
  Flame,
  Clock,
  Users,
  Eye,
  Video,
  BarChart3,
  DollarSign,
  ExternalLink,
  ChevronRight,
  Bookmark,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BreadcrumbJsonLd } from '@/components/shared/JsonLd'
import type { Niche } from '@/types'

export const revalidate = 3600

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchNiche(slug: string): Promise<Niche | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('niches')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return (data as unknown as Niche) ?? null
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const niche = await fetchNiche(slug)
  if (!niche) return { title: 'Niche Not Found' }

  const channelName = niche.channel_name ?? niche.name

  return {
    title: `${channelName} — ${niche.category} YouTube Niche`,
    description: `${channelName} is a ${niche.category} YouTube channel${niche.estimated_earning ? ` earning ${niche.estimated_earning}` : ''}. See full stats, thumbnails, and related niches.`,
    openGraph: {
      title: `${channelName} — ${niche.category} Niche`,
      description: `${niche.category} niche${niche.estimated_earning ? ` earning ${niche.estimated_earning}` : ''}`,
      type: 'article',
      url: `https://ytniches.com/niches/${slug}`,
    },
    alternates: {
      canonical: `https://ytniches.com/niches/${slug}`,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NicheDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const niche = await fetchNiche(slug)
  if (!niche) notFound()

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

  const isLocked = niche.is_premium && !isPro
  const channelName = niche.channel_name ?? niche.name

  // Related niches — same category
  const { data: relatedRaw } = await supabase
    .from('niches')
    .select('id, channel_name, name, slug, category, estimated_earning, thumbnail_url_1, is_hot, is_premium')
    .eq('published', true)
    .eq('category', niche.category)
    .neq('id', niche.id)
    .limit(4)
    .order('created_at', { ascending: false })
  const relatedNiches = (relatedRaw as unknown as Niche[]) ?? []

  const thumbnail = niche.thumbnail_url_1

  const categorySlug = niche.category.toLowerCase().replace(/[\s&]+/g, '-')

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${channelName} — ${niche.category} YouTube Niche`,
    description: `${channelName}${niche.estimated_earning ? ` earning ${niche.estimated_earning}` : ''} in ${niche.category}`,
    author: { '@type': 'Organization', name: 'YTNiches' },
  }

  const breadcrumbs = [
    { name: 'Home', url: 'https://ytniches.com' },
    { name: 'Niches', url: 'https://ytniches.com/niches' },
    { name: niche.category, url: `https://ytniches.com/categories/${categorySlug}` },
    { name: channelName, url: `https://ytniches.com/niches/${niche.slug}` },
  ]

  // Stats for the grid
  const stats = [
    { label: 'Subscribers', value: niche.subscribers, icon: Users, color: 'text-[#5B47CC]', bg: 'bg-[#EDE8FF]', border: 'border-[#C8C0F5]' },
    { label: 'Views / Day', value: niche.views_day, icon: Eye, color: 'text-[#E8402A]', bg: 'bg-[#FDF0ED]', border: 'border-[#F5C4BA]' },
    { label: 'Total Videos', value: niche.total_videos, icon: Video, color: 'text-[#A06B00]', bg: 'bg-[#FEF6E8]', border: 'border-[#F5DFA8]' },
    { label: 'Total Views', value: niche.total_views, icon: BarChart3, color: 'text-[#2A7A4B]', bg: 'bg-[#EBF5EF]', border: 'border-[#C2E0CE]' },
  ].filter(s => s.value)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className="min-h-screen bg-[#F5F0E8]">

        {/* BREADCRUMB */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
          <nav className="flex items-center gap-2 text-sm text-[#8A7F72] flex-wrap">
            <Link href="/" className="hover:text-[#1A1612] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/niches" className="hover:text-[#1A1612] transition-colors">Niches</Link>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/categories/${categorySlug}`}
              className="hover:text-[#1A1612] transition-colors"
            >
              {niche.category}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1A1612] font-medium truncate">{channelName}</span>
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT — Main content */}
            <div className="flex-1 min-w-0">

              {/* HEADER */}
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {niche.is_hot && (
                    <span className="flex items-center gap-1 bg-[#E8402A] text-white text-xs font-bold px-3 py-1 rounded-full">
                      <Flame className="w-3 h-3" /> Hot
                    </span>
                  )}
                  <span className="text-xs font-semibold text-[#E8402A] bg-[#FDF0ED] px-3 py-1 rounded-full">
                    {niche.category}
                  </span>
                  {niche.content_type && (
                    <span className="text-xs text-[#8A7F72] bg-white border border-[#E0D9CE] px-3 py-1 rounded-full">
                      {niche.content_type}
                    </span>
                  )}
                  {niche.is_premium && (
                    <span className="text-xs font-semibold bg-[#1A1612] text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Pro Only
                    </span>
                  )}
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-black text-[#1A1612] leading-tight mb-2">
                  {channelName}
                </h1>

                {niche.channel_age && (
                  <p className="text-sm text-[#8A7F72] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#E8402A]" />
                    Channel age: <strong className="text-[#1A1612]">{niche.channel_age}</strong>
                  </p>
                )}
              </div>

              {/* ESTIMATED EARNING — prominent */}
              {niche.estimated_earning && (
                <div className="bg-[#EBF5EF] border border-[#C2E0CE] rounded-2xl px-6 py-5 mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2A7A4B] rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#2A7A4B] uppercase tracking-wider mb-0.5">
                      Estimated Monthly Earning
                    </p>
                    <p className="font-display text-3xl font-black text-[#2A7A4B]">
                      {niche.estimated_earning}
                    </p>
                  </div>
                </div>
              )}

              {/* THUMBNAIL — single image */}
              {thumbnail && (
                <div className="mb-6">
                  <h2 className="font-display text-xl font-bold text-[#1A1612] mb-3">Content Example</h2>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F5F0E8] border border-[#E0D9CE] group/thumb">
                    <img
                      src={thumbnail}
                      alt={`${channelName} content example`}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                    />
                    {/* YouTube badge */}
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CHANNEL STATS — 4 cards */}
              {stats.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-display text-xl font-bold text-[#1A1612] mb-3">Channel Stats</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.map(stat => {
                      const Icon = stat.icon
                      return (
                        <div
                          key={stat.label}
                          className={`${stat.bg} border ${stat.border} rounded-2xl p-4 text-center`}
                        >
                          <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                          <div className={`font-display text-xl font-black ${stat.color} mb-0.5`}>
                            {stat.value}
                          </div>
                          <div className="text-xs text-[#8A7F72] font-medium">{stat.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* VIEW CHANNEL BUTTON */}
              {niche.channel_url && !isLocked && (
                <div className="mb-6">
                  <a
                    href={niche.channel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-[#E8402A] text-white rounded-2xl text-base font-bold hover:bg-[#CF3520] transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    View YouTube Channel
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* LOCK GATE */}
              {isLocked && (
                <div className="bg-white border-2 border-[#E8402A] rounded-2xl p-8 text-center mb-6">
                  <div className="w-14 h-14 bg-[#FDF0ED] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-[#E8402A]" />
                  </div>
                  <h3 className="font-display text-2xl font-black text-[#1A1612] mb-2">Pro Only Niche</h3>
                  <p className="text-sm text-[#8A7F72] mb-6 max-w-sm mx-auto">
                    Upgrade to Pro to view the full channel details, stats, and direct channel link.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Link
                      href="/pricing"
                      className="px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors"
                    >
                      Upgrade to Pro — $9/month
                    </Link>
                    {!user && (
                      <Link
                        href="/auth/signup"
                        className="px-6 py-3 border-2 border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold hover:border-[#E8402A] transition-colors"
                      >
                        Start free
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0 space-y-4">

              {/* Niche Info Card */}
              <div className="bg-white border border-[#E0D9CE] rounded-2xl p-5 sticky top-24">
                <h3 className="font-semibold text-sm text-[#1A1612] mb-4">Niche Details</h3>
                <div className="space-y-3">
                  <SidebarRow label="Category" value={niche.category} />
                  {niche.content_type && <SidebarRow label="Content Type" value={niche.content_type} />}
                  {niche.estimated_earning && <SidebarRow label="Est. Earning" value={niche.estimated_earning} />}
                  {niche.channel_age && <SidebarRow label="Channel Age" value={niche.channel_age} />}
                  {niche.subscribers && <SidebarRow label="Subscribers" value={niche.subscribers} />}
                </div>

                {!isLocked && niche.channel_url && (
                  <a
                    href={niche.channel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 mt-4 w-full py-2.5 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Visit Channel
                  </a>
                )}
              </div>

              {/* Related Niches */}
              {relatedNiches.length > 0 && (
                <div className="bg-white border border-[#E0D9CE] rounded-2xl p-5">
                  <h3 className="font-semibold text-sm text-[#1A1612] mb-3">Related Niches</h3>
                  <div className="space-y-2">
                    {relatedNiches.map(related => (
                      <Link
                        key={related.id}
                        href={`/niches/${related.slug}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F0E8] transition-colors group/rel"
                      >
                        {/* Mini thumbnail */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F0E8] border border-[#E0D9CE] flex-shrink-0">
                          {related.thumbnail_url_1 ? (
                            <img
                              src={related.thumbnail_url_1}
                              alt={related.channel_name ?? related.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-4 h-4 text-[#C8C0B4]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1612] truncate group-hover/rel:text-[#E8402A] transition-colors">
                            {related.channel_name ?? related.name}
                          </p>
                          {related.estimated_earning && (
                            <p className="text-xs text-[#2A7A4B] font-medium">{related.estimated_earning}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#C8C0B4] group-hover/rel:text-[#E8402A] flex-shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/categories/${categorySlug}`}
                    className="block text-center mt-3 text-xs text-[#E8402A] hover:underline"
                  >
                    See all {niche.category} niches →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AUTOMATION TOOLS BANNER */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
          <Link
            href="/youtube-automation-tools"
            className="group block bg-white border border-[#E0D9CE] rounded-2xl p-5 hover:shadow-md hover:border-[#E8402A]/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl shrink-0">🤖</span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm sm:text-base text-[#1A1612] group-hover:text-[#E8402A] transition-colors">
                  Want the best tools to start your {niche.category} channel?
                </p>
                <p className="text-xs text-[#8A7F72] mt-0.5">
                  50+ curated automation tools for scripting, voiceover, editing, thumbnails, and SEO.
                </p>
              </div>
              <span className="hidden sm:block text-sm font-bold text-[#E8402A] shrink-0">
                View Tools →
              </span>
            </div>
          </Link>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-white border-t border-[#E0D9CE] py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display font-bold text-3xl text-[#1A1612] mb-3">
              Start Your YouTube Journey Today
            </h2>
            <p className="text-[#8A7F72] mb-8">
              Get access to all niches with real channel data and earning estimates
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="bg-[#E8402A] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[#CF3520] transition-colors text-sm"
              >
                Create free account
              </Link>
              <Link
                href="/pricing"
                className="border border-[#E0D9CE] text-[#1A1612] font-semibold px-7 py-3.5 rounded-full hover:bg-[#F5F0E8] transition-colors text-sm"
              >
                See Pro features
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

// ─── Sidebar Row Component ────────────────────────────────────────────────────

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm gap-3">
      <span className="text-[#8A7F72]">{label}</span>
      <span className="font-medium text-[#1A1612] text-right truncate max-w-36">{value}</span>
    </div>
  )
}
