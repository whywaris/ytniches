import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AutomationToolsClient } from '@/components/automation-tools/AutomationToolsClient'
import { BackToTop } from '@/components/shared/BackToTop'
import type { AutomationTool } from '@/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'YouTube Automation Tools 2025 — 50+ Best Tools by Workflow Stage | YTNiches',
  description:
    'Discover the 50+ best YouTube automation tools for every stage — script writing, AI voiceover, video editing, thumbnail design, SEO, and scheduling. Curated by YTNiches.',
  keywords: [
    'youtube automation tools',
    'best ai tools for youtube',
    'youtube automation software',
    'faceless youtube tools',
    'youtube workflow tools',
  ],
  openGraph: {
    title: 'YouTube Automation Tools 2025 — 50+ Best Tools | YTNiches',
    description:
      'The complete list of YouTube automation tools organized by workflow stage.',
    url: 'https://ytniches.com/youtube-automation-tools',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ytniches.com/youtube-automation-tools',
  },
}

export default async function YouTubeAutomationToolsPage() {
  const supabase = await createClient()

  const { data: tools } = await supabase
    .from('automation_tools')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  const allTools = (tools as AutomationTool[]) ?? []
  const freeCount = allTools.filter(t => t.pricing_type === 'free').length

  // JSON-LD ItemList
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'YouTube Automation Tools',
    description: 'Best tools for YouTube automation organized by workflow stage',
    numberOfItems: allTools.length,
    itemListElement: allTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      description: tool.tagline,
      url: tool.website_url,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <BackToTop />
      <main className="bg-[#F5F0E8] min-h-screen overflow-x-hidden pb-20 sm:pb-0">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <nav className="flex items-center gap-2 text-xs text-[#8A7F72]">
            <Link href="/" className="hover:text-[#1A1612] transition-colors">Home</Link>
            <span>→</span>
            <span className="text-[#1A1612]">YouTube Automation Tools</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-8 sm:pb-10 text-center">
          <span className="inline-block bg-[#FDF0ED] text-[#E8402A] text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full mb-4">
            🤖 {allTools.length}+ Curated Tools
          </span>
          <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-[#1A1612] mb-3 sm:mb-4 leading-tight">
            YouTube Automation Tools
          </h1>
          <p className="text-[#8A7F72] text-sm sm:text-lg max-w-2xl mx-auto mb-5 sm:mb-6">
            Every tool you need to research, create, edit, and grow your YouTube channel
            — organized by workflow stage.
          </p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-3">
            <span className="bg-white text-[#1A1612] text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-full border border-[#E0D9CE]">
              🛠️ {allTools.length}+ Tools
            </span>
            <span className="bg-white text-[#1A1612] text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-full border border-[#E0D9CE]">
              📋 9 Workflow Stages
            </span>
            <span className="bg-white text-[#1A1612] text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-full border border-[#E0D9CE]">
              💚 {freeCount} Free Tools
            </span>
            <span className="bg-white text-[#1A1612] text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-full border border-[#E0D9CE]">
              🔄 Updated Weekly
            </span>
          </div>
        </section>

        {/* Client-side interactive tools list */}
        <AutomationToolsClient tools={allTools} />

        {/* Bottom SEO Text Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="font-display font-bold text-xl text-[#1A1612] mb-4">
            How to Use These YouTube Automation Tools
          </h2>
          <div className="space-y-4 text-sm text-[#6B6259] leading-relaxed">
            <p>
              Building a successful YouTube channel no longer requires expensive equipment or a large team.
              With the right automation tools, a single creator can research profitable niches, write
              compelling scripts, generate professional voiceovers, edit videos, design thumbnails, and
              optimize for search — all within a streamlined workflow. These tools are organized by the
              nine stages of YouTube content production so you can build your ideal stack step by step.
            </p>
            <p>
              Start with niche research tools to validate your channel idea and identify low-competition
              topics. Move to script writing and AI voiceover tools to produce content at scale. Use video
              editing platforms that support batch processing and templates for consistent output. Finally,
              leverage SEO and scheduling tools to maximize reach without spending hours on manual uploads.
            </p>
            <p>
              Whether you are running a faceless channel or a personal brand, the key is choosing tools
              that integrate well together. Many creators combine a free research tool with a paid
              voiceover service and a freemium editor to keep costs low while maintaining quality. Use the
              filters above to find tools that match your budget and workflow preferences.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
