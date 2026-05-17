import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/homepage/HeroSection'
import { NichePreview } from '@/components/homepage/NichePreview'
import { HowItWorks } from '@/components/homepage/HowItWorks'
import { Features } from '@/components/homepage/Features'
import { Pricing } from '@/components/homepage/Pricing'
import { FreeToolsPreview } from '@/components/homepage/FreeToolsPreview'
import { HandpickCard } from '@/components/niches/HandpickCard'
import type { HandpickNiche } from '@/types'

export const metadata: Metadata = {
  title: { absolute: 'YT Niches - Find Most Profitable YouTube Niches' },
  description:
    'Browse 1,200+ faceless YouTube niches with RPM data, script hooks, title templates and 30-day content calendars. Start your YouTube channel today.',
  keywords: [
    'faceless youtube niches',
    'youtube niche ideas',
    'faceless youtube channel ideas',
    'youtube niche finder',
    'profitable youtube niches',
    'youtube automation niches',
  ],
  openGraph: {
    title: 'YTNiches — Faceless YouTube Niche Finder',
    description:
      'Browse 1,200+ faceless YouTube niches with RPM data, script hooks, title templates and 30-day content calendars. Start your YouTube channel today.',
    url: 'https://ytniches.com',
    siteName: 'YTNiches',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'YTNiches — Faceless YouTube Niche Finder' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YTNiches — Faceless YouTube Niche Finder',
    description: 'Browse 1,200+ faceless YouTube niches with RPM data, script hooks, and content calendars.',
    images: ['/og-image.png'],
    creator: '@ytniches',
  },
  alternates: { canonical: 'https://ytniches.com' },
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let isPremiumUser = false
  if (authUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', authUser.id)
      .single()
    isPremiumUser = profile?.plan === 'pro' || profile?.plan === 'lifetime'
  }

  // Fetch featured niches (free only, max 15)
  const { data: niches } = await supabase
    .from('niches')
    .select('*')
    .eq('published', true)
    .eq('is_premium', false)
    .order('created_at', { ascending: false })
    .limit(15)

  // Fetch 3 hot handpick niches for homepage preview
  const { data: hotHandpicks } = await supabase
    .from('handpick_niches')
    .select('*')
    .eq('published', true)
    .eq('is_hot', true)
    .eq('is_pro_only', false)
    .order('position', { ascending: true })
    .limit(3)


  return (
    <>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'YTNiches',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Find profitable faceless YouTube niches with RPM data, scripts, and content calendars',
            url: 'https://ytniches.com',
          }),
        }}
      />

      <HeroSection />

      <NichePreview niches={niches ?? []} isPremiumUser={isPremiumUser} />

      {/* HandPick Niches Preview */}
      {(hotHandpicks ?? []).length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-orange-600 text-xs font-bold bg-orange-100 px-3 py-1 rounded-full mb-3">
                🔥 Real Channels, Real Earnings
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">
                HandPicked Channels
              </h2>
              <p className="text-[#8A7F72] text-sm mt-1 max-w-md">
                Real YouTube channels proving these niches work — with verified subscriber counts and estimated earnings.
              </p>
            </div>
            <Link
              href="/handpick"
              className="hidden sm:inline-flex text-sm font-semibold text-[#E8402A] hover:underline shrink-0"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(hotHandpicks as HandpickNiche[]).map((niche) => (
              <HandpickCard key={niche.id} niche={niche} isPro={isPremiumUser} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/handpick" className="text-sm font-semibold text-[#E8402A] hover:underline">
              View all channels →
            </Link>
          </div>
        </section>
      )}

      <HowItWorks />
      <Features />
      <FreeToolsPreview />


      <Pricing />
    </>
  )
}
