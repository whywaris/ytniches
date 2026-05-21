import type { Metadata } from 'next'
import Link from 'next/link'
import { Tag, Timer, Rss, ThumbsDown, Dices, ImageIcon, Download, DollarSign, Clock, Code2, QrCode, UserPlus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GlobalCtaBanner } from '@/components/shared/GlobalCtaBanner'
import type { GlobalCta } from '@/types'

export const metadata: Metadata = {
  title: '100% Free YouTube Tools',
  description:
    'Free YouTube tools for creators. Extract tags, calculate revenue, download thumbnails, generate timestamps, create QR codes, and more. 13 tools, always free.',
  alternates: { canonical: 'https://ytniches.com/tools' },
}

const TOOLS = [
  {
    name: 'YouTube Tag Extractor',
    href: '/tag-extractor',
    icon: Tag,
    bg: 'bg-[#FDF0ED]',
    color: 'text-[#E8402A]',
    description:
      'Extract hidden tags from any YouTube video. See exactly which keywords top creators are targeting.',
  },
  {
    name: 'Watch Time Calculator',
    href: '/watch-time-calculator',
    icon: Timer,
    bg: 'bg-[#EBF5EF]',
    color: 'text-[#2A7A4B]',
    description:
      "Calculate exactly when you'll hit the 4,000 watch hour monetization requirement.",
  },
  {
    name: 'RSS Feed Generator',
    href: '/rss-feed-generator',
    icon: Rss,
    bg: 'bg-[#EBF4FF]',
    color: 'text-[#2563EB]',
    description:
      'Generate RSS feed URLs for any YouTube channel. Get notified of new uploads automatically.',
  },
  {
    name: 'Dislike Viewer',
    href: '/dislike-viewer',
    icon: ThumbsDown,
    bg: 'bg-[#F3E8FF]',
    color: 'text-[#7C3AED]',
    description:
      'View the estimated dislike count on any YouTube video using crowd-sourced data.',
  },
  {
    name: 'Random Comment Picker',
    href: '/random-comment-picker',
    icon: Dices,
    bg: 'bg-[#FEF6E8]',
    color: 'text-[#A06B00]',
    description:
      'Pick a fair random winner from YouTube comments for giveaways and contests.',
  },
  {
    name: 'Thumbnail Resizer',
    href: '/thumbnail-resizer',
    icon: ImageIcon,
    bg: 'bg-[#F0FDF4]',
    color: 'text-[#16A34A]',
    description:
      'Resize any image to perfect YouTube thumbnail dimensions (1280×720) instantly.',
  },
  {
    name: 'Thumbnail Downloader',
    href: '/youtube-thumbnail-download',
    icon: Download,
    bg: 'bg-[#FDF0ED]',
    color: 'text-[#E8402A]',
    description:
      'Download any YouTube video thumbnail in full HD quality instantly. All sizes available.',
  },
  {
    name: 'Revenue Calculator',
    href: '/youtube-revenue-calculator',
    icon: DollarSign,
    bg: 'bg-[#EBF5EF]',
    color: 'text-[#2A7A4B]',
    description:
      'Estimate YouTube earnings based on views, CPM, and niche. See how much creators make.',
  },
  {
    name: 'Timestamp Generator',
    href: '/youtube-timestamp-generator',
    icon: Clock,
    bg: 'bg-[#EBF4FF]',
    color: 'text-[#2563EB]',
    description:
      'Generate formatted timestamps and chapters for your YouTube videos. Boost watch time.',
  },
  {
    name: 'Embed Code Generator',
    href: '/youtube-embed-code-generator',
    icon: Code2,
    bg: 'bg-[#F3E8FF]',
    color: 'text-[#7C3AED]',
    description:
      'Generate custom YouTube embed codes with autoplay, loop, start time, and responsive options.',
  },
  {
    name: 'QR Code Generator',
    href: '/youtube-qr-code-generator',
    icon: QrCode,
    bg: 'bg-[#FEF6E8]',
    color: 'text-[#A06B00]',
    description:
      'Generate QR codes for any YouTube video or channel. Perfect for print and offline promotion.',
  },
  {
    name: 'Subscribe Link Generator',
    href: '/youtube-subscribe-link-generator',
    icon: UserPlus,
    bg: 'bg-[#F0FDF4]',
    color: 'text-[#16A34A]',
    description:
      'Create a direct subscribe link that auto-opens the subscribe popup for your channel.',
  },
  {
    name: 'Video Word Counter',
    href: '/youtube-word-counter',
    icon: FileText,
    bg: 'bg-[#FDF0ED]',
    color: 'text-[#E8402A]',
    description:
      'Count words in your video script and estimate video duration. Plan the perfect length.',
  },
]

const STATS = ['Used by 8,400+ Creators', 'Always Free']

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: cta } = await supabase.from('global_cta').select('*').single()

  return (
    <main className="bg-[#F5F0E8] min-h-screen">
      {/* Hero */}
      <section className="container-site section-padding text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E8402A] mb-3">
          Free Tools
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-[#1A1612] mb-4 leading-tight">
          Free YouTube Tools
        </h1>
        <p className="text-[#8A7F72] text-lg max-w-xl mx-auto mb-8">
          Powerful tools to grow your YouTube channel — completely free, no account needed.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-3">
          {STATS.map((stat) => (
            <span
              key={stat}
              className="bg-[#F5F0E8] text-[#1A1612] text-xs font-medium px-3 py-1.5 rounded-full border border-[#E0D9CE]"
            >
              {stat}
            </span>
          ))}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container-site pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-white border border-[#E0D9CE] rounded-[20px] p-6 flex flex-col hover:shadow-lg transition-shadow"
              >
                <div
                  className={`${tool.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <h2 className="font-display font-bold text-lg text-[#1A1612] mb-2 leading-snug">
                  {tool.name}
                </h2>
                <p className="text-sm text-[#8A7F72] leading-relaxed flex-1 mb-4">
                  {tool.description}
                </p>
                <span className="text-xs font-bold text-[#E8402A] group-hover:underline self-start">
                  Use Tool →
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container-site pb-20">
        <GlobalCtaBanner cta={cta as GlobalCta | null} />
      </section>
    </main>
  )
}
