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
  return CATEGORIES.map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug)
  if (!category) return { title: 'Category Not Found' }

  return {
    title: `${category.name} YouTube Niches — CPM Data & Video Ideas | YTNiches`,
    description: `Browse the best ${category.name} YouTube niches with CPM data, competition levels, and 30 video ideas each. Find the most profitable ${category.name} niche for your channel in 2025.`,
    openGraph: {
      title: `${category.name} YouTube Niches | YTNiches`,
      description: `Browse ${category.name} YouTube niches with CPM data and video ideas.`,
      type: 'website',
      url: `https://ytniches.com/categories/${params.slug}`,
    },
    alternates: { canonical: `https://ytniches.com/categories/${params.slug}` },
    keywords: [
      `${category.name} YouTube niches`,
      `best ${category.name} YouTube channel ideas`,
      `${category.name} niche CPM`,
      `YouTube ${category.name} content ideas 2025`,
      `${category.name} YouTube channel`,
    ],
  }
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-white border border-[#E0D9CE] rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-[#1A1612] list-none select-none">
        <span>{question}</span>
        <ChevronRight className="w-4 h-4 text-[#8A7F72] group-open:rotate-90 transition-transform shrink-0 ml-3" />
      </summary>
      <div className="px-5 pb-4 text-sm text-[#8A7F72] leading-relaxed border-t border-[#E0D9CE] pt-3">
        {answer}
      </div>
    </details>
  )
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const category = getCategoryBySlug(params.slug)
  if (!category) notFound()

  const supabase = await createClient()

  const { data } = await supabase
    .from('niches')
    .select(
      'id, name, slug, category, category_slug, content_type, cpm_min, cpm_max, competition_level, growth_trend, avg_views, is_premium, published, video_ideas, created_at, updated_at'
    )
    .eq('category', category.name)
    .eq('published', true)
    .order('cpm_max', { ascending: false })

  const niches = (data as unknown as Niche[]) ?? []

  const relatedCategories = CATEGORIES.filter((c) => c.slug !== params.slug).slice(0, 4)

  const breadcrumbs = [
    { name: 'Home', url: 'https://ytniches.com' },
    { name: 'Categories', url: 'https://ytniches.com/categories' },
    { name: category.name, url: `https://ytniches.com/categories/${params.slug}` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} YouTube Niches`,
    description: `Browse ${category.name} YouTube niches with CPM data and video ideas`,
    url: `https://ytniches.com/categories/${params.slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ytniches.com' },
        { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://ytniches.com/categories' },
        { '@type': 'ListItem', position: 3, name: category.name, item: `https://ytniches.com/categories/${params.slug}` },
      ],
    },
    hasPart: niches.map((niche) => ({
      '@type': 'WebPage',
      name: niche.name,
      url: `https://ytniches.com/niches/${niche.slug}`,
    })),
  }

  const faqs = [
    {
      q: `What are the best ${category.name} YouTube niches?`,
      a: `The best ${category.name} YouTube niches combine high CPM rates, low competition, and a growing audience. YTNiches has curated ${niches.length} verified ${category.name} niches with detailed CPM data and competition analysis to help you make the right choice.`,
    },
    {
      q: `How much can I earn with a ${category.name} YouTube channel?`,
      a: `Earnings vary by specific niche, audience location, and video performance. ${category.name} channels typically earn through YouTube ad revenue (CPM), sponsorships, and affiliate marketing. Each niche on YTNiches includes estimated CPM ranges so you can calculate your potential revenue.`,
    },
    {
      q: `Is ${category.name} a good YouTube niche in 2025?`,
      a: `Yes — ${category.name} remains one of YouTube's active content categories in 2025. With ${category.types.length} distinct content types to explore, there are many sub-niches with low competition and dedicated audiences looking for quality content.`,
    },
    {
      q: `How do I start a ${category.name} YouTube channel?`,
      a: `Start by picking a specific niche within ${category.name} — the more specific, the better. Use YTNiches to find a niche with low competition and solid CPM. Then use our video ideas, title templates, and 30-day content calendar to plan your first month of content without guessing.`,
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F5F0E8]">

        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center gap-1.5 text-sm text-[#8A7F72]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#1A1612] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/categories" className="hover:text-[#1A1612] transition-colors">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1A1612] font-medium">{category.name}</span>
          </nav>
        </div>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold text-[#E8402A] uppercase tracking-wider mb-2">
                YouTube Niches
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-black text-[#1A1612] leading-tight mb-3">
                {category.name}
              </h1>
              <p className="text-base text-[#8A7F72] max-w-xl leading-relaxed">
                Browse all {niches.length} curated {category.name} YouTube niches. Each niche includes CPM data, competition level, 30 video ideas, title templates, and a complete content kit.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3 shrink-0 flex-wrap">
              <div className="bg-white border border-[#E0D9CE] rounded-[20px] px-5 py-4 text-center">
                <div className="font-display text-2xl font-black text-[#1A1612]">{niches.length}</div>
                <div className="text-xs text-[#8A7F72] mt-0.5">Niches</div>
              </div>
              <div className="bg-white border border-[#E0D9CE] rounded-[20px] px-5 py-4 text-center">
                <div className="font-display text-2xl font-black text-[#1A1612]">{category.types.length}</div>
                <div className="text-xs text-[#8A7F72] mt-0.5">Content types</div>
              </div>
              <div className="bg-white border border-[#E0D9CE] rounded-[20px] px-5 py-4 text-center">
                <div className="font-display text-2xl font-black text-[#1A1612]">30</div>
                <div className="text-xs text-[#8A7F72] mt-0.5">Ideas/niche</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-10">

          {/* Content type pills */}
          <div>
            <p className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-3">
              Content Types in {category.name}
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-3 py-1.5 rounded-full bg-[#E8402A] text-white font-medium">
                All types
              </span>
              {category.types.map((type) => (
                <Link
                  key={type}
                  href={`/niches?category=${encodeURIComponent(category.name)}&type=${encodeURIComponent(type)}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-white text-[#8A7F72] border border-[#E0D9CE] hover:border-[#E8402A] hover:text-[#E8402A] transition-colors"
                >
                  {type}
                </Link>
              ))}
            </div>
          </div>

          {/* Niches grid */}
          {niches.length === 0 ? (
            <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-16 text-center">
              <h3 className="font-display text-xl font-bold text-[#1A1612] mb-2">
                No niches yet in {category.name}
              </h3>
              <p className="text-sm text-[#8A7F72] mb-5">
                We're adding new niches regularly. Check back soon or browse other categories.
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E8402A] hover:underline"
              >
                ← Browse all categories
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#8A7F72]">
                  Showing <span className="text-[#1A1612] font-semibold">{niches.length}</span> niches in {category.name}
                </p>
                <Link href="/niches" className="text-xs text-[#E8402A] hover:underline">
                  Browse all niches →
                </Link>
              </div>
              <NicheGridClient niches={niches} initialCategory={category.name} />
            </div>
          )}

          {/* About this category — SEO content */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-8">
            <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-4">
              About {category.name} YouTube Niches
            </h2>
            <div className="text-sm text-[#8A7F72] leading-relaxed space-y-3">
              <p>{category.intro}</p>
              <p>
                YTNiches has curated <strong className="text-[#1A1612]">{niches.length} verified niches</strong> in the {category.name} category, each with CPM data, competition analysis, 30 video ideas, title templates, thumbnail prompts, and a 30-day content calendar.
              </p>
            </div>

            {/* Content types list */}
            <div className="mt-6">
              <h3 className="font-semibold text-sm text-[#1A1612] mb-3">
                Content types in {category.name}:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {category.types.map((type) => (
                  <div key={type} className="flex items-center gap-2 text-sm text-[#8A7F72]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8402A] shrink-0" />
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ section */}
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>

          {/* Related categories */}
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-5">
              Explore Other Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group bg-white border border-[#E0D9CE] rounded-[20px] p-4 hover:border-[#E8402A] hover:shadow-sm transition-all"
                >
                  <p className="font-semibold text-sm text-[#1A1612] group-hover:text-[#E8402A] transition-colors mb-1 leading-snug">
                    {cat.name}
                  </p>
                  <p className="text-xs text-[#8A7F72]">{cat.types.length} content types</p>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/categories" className="text-sm font-semibold text-[#E8402A] hover:underline">
                View all 26 categories →
              </Link>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-[#1A1612] rounded-[20px] p-8 text-center">
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              Get the complete kit for every niche
            </h3>
            <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
              Video ideas, title templates, script hooks, and a 30-day content calendar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="bg-[#E8402A] text-white font-bold px-7 py-3 rounded-full hover:bg-[#CF3520] transition-colors text-sm"
              >
                Start for free
              </Link>
              <Link
                href="/pricing"
                className="border border-white/20 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                View pricing
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
