import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Car, Smile, GraduationCap, Star, Film, Gamepad2, Scissors, Music,
  Newspaper, Heart, User, PawPrint, Cpu, Trophy, Plane, Dumbbell,
  Sparkles, ChefHat, DollarSign, Sun, Baby, Video, Rocket, Globe,
  Ruler, Eye, ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/config/categories'
import type { Category } from '@/config/categories'

export const metadata: Metadata = {
  title: 'YouTube Niche Categories — Browse All 26 Categories | YTNiches',
  description: 'Explore all 26 YouTube niche categories. From Finance & Business to Gaming, Health & Fitness to Tech — find the perfect YouTube niche category for your channel.',
  openGraph: {
    title: 'YouTube Niche Categories | YTNiches',
    description: 'Browse all 26 YouTube niche categories and find your perfect channel topic.',
    type: 'website',
    url: 'https://ytniches.com/categories',
  },
  alternates: { canonical: 'https://ytniches.com/categories' },
  keywords: [
    'YouTube niche categories',
    'YouTube channel categories',
    'best YouTube niches by category',
    'YouTube content categories 2025',
  ],
}

export const revalidate = 3600

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'autos-vehicles': Car,
  'comedy': Smile,
  'education': GraduationCap,
  'entertainment': Star,
  'film-animation': Film,
  'gaming': Gamepad2,
  'how-to-style': Scissors,
  'music': Music,
  'news-politics': Newspaper,
  'nonprofits-activism': Heart,
  'people-blogs': User,
  'pets-animals': PawPrint,
  'science-technology': Cpu,
  'sports': Trophy,
  'travel-events': Plane,
  'health-fitness': Dumbbell,
  'beauty-fashion': Sparkles,
  'food-cooking': ChefHat,
  'finance-business': DollarSign,
  'spirituality-religion': Sun,
  'kids-family': Baby,
  'documentaries': Video,
  'motivation-self-help': Rocket,
  'language-learning': Globe,
  'architecture-design': Ruler,
  'paranormal-mystery': Eye,
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'finance-business':      { bg: '#EBF5EF', text: '#2A7A4B', border: '#C2E0CE' },
  'science-technology':    { bg: '#EDE8FF', text: '#5B47CC', border: '#C8C0F5' },
  'gaming':                { bg: '#FDF0ED', text: '#E8402A', border: '#F5C4BA' },
  'health-fitness':        { bg: '#EBF5EF', text: '#2A7A4B', border: '#C2E0CE' },
  'food-cooking':          { bg: '#FEF6E8', text: '#A06B00', border: '#F5DFA8' },
  'education':             { bg: '#EDE8FF', text: '#5B47CC', border: '#C8C0F5' },
  'travel-events':         { bg: '#E8F4FD', text: '#1565A0', border: '#BBDEFB' },
  'motivation-self-help':  { bg: '#FDF0ED', text: '#E8402A', border: '#F5C4BA' },
  'beauty-fashion':        { bg: '#FDE8F5', text: '#9C27B0', border: '#E1BEE7' },
  'music':                 { bg: '#E8F4FD', text: '#1565A0', border: '#BBDEFB' },
  'sports':                { bg: '#FEF6E8', text: '#A06B00', border: '#F5DFA8' },
  'entertainment':         { bg: '#FDE8F5', text: '#9C27B0', border: '#E1BEE7' },
  'news-politics':         { bg: '#E8F4FD', text: '#1565A0', border: '#BBDEFB' },
  'autos-vehicles':        { bg: '#FDF0ED', text: '#E8402A', border: '#F5C4BA' },
  'comedy':                { bg: '#FEF6E8', text: '#A06B00', border: '#F5DFA8' },
  'film-animation':        { bg: '#EDE8FF', text: '#5B47CC', border: '#C8C0F5' },
  'how-to-style':          { bg: '#FDE8F5', text: '#9C27B0', border: '#E1BEE7' },
  'nonprofits-activism':   { bg: '#EBF5EF', text: '#2A7A4B', border: '#C2E0CE' },
  'people-blogs':          { bg: '#FEF6E8', text: '#A06B00', border: '#F5DFA8' },
  'pets-animals':          { bg: '#EBF5EF', text: '#2A7A4B', border: '#C2E0CE' },
  'spirituality-religion': { bg: '#EDE8FF', text: '#5B47CC', border: '#C8C0F5' },
  'kids-family':           { bg: '#EBF5EF', text: '#2A7A4B', border: '#C2E0CE' },
  'documentaries':         { bg: '#F5F0E8', text: '#6B6259', border: '#E0D9CE' },
  'language-learning':     { bg: '#E8F4FD', text: '#1565A0', border: '#BBDEFB' },
  'architecture-design':   { bg: '#EDE8FF', text: '#5B47CC', border: '#C8C0F5' },
  'paranormal-mystery':    { bg: '#F5F0E8', text: '#4B5563', border: '#E0D9CE' },
}

const DEFAULT_COLOR = { bg: '#F5F0E8', text: '#8A7F72', border: '#E0D9CE' }

function CategoryCard({ cat, count }: { cat: Category; count: number }) {
  const IconComp = CATEGORY_ICONS[cat.slug] ?? Star
  const color = CATEGORY_COLORS[cat.slug] ?? DEFAULT_COLOR

  return (
    <Link href={`/categories/${cat.slug}`} className="group">
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-6 hover:border-[#C8C0B4] hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Icon + name */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: color.bg, border: `1.5px solid ${color.border}` }}
          >
            <IconComp className="w-5 h-5" style={{ color: color.text }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-[#1A1612] leading-snug group-hover:text-[#E8402A] transition-colors">
              {cat.name}
            </h2>
            <p className="text-xs text-[#8A7F72] mt-0.5">
              {count > 0 ? `${count} niches` : `${cat.types.length} content types`}
            </p>
          </div>
        </div>

        {/* Content type pills */}
        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
          {cat.types.slice(0, 4).map((type) => (
            <span
              key={type}
              className="text-xs px-2 py-0.5 bg-[#F5F0E8] text-[#8A7F72] rounded-full border border-[#E0D9CE]"
            >
              {type}
            </span>
          ))}
          {cat.types.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-[#8A7F72]">
              +{cat.types.length - 4} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E0D9CE]">
          <span className="text-xs text-[#8A7F72]">{cat.types.length} content types</span>
          <span className="text-xs font-semibold text-[#E8402A] flex items-center gap-1 group-hover:gap-2 transition-all">
            Browse <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: nicheCounts } = await supabase
    .from('niches')
    .select('category')
    .eq('published', true)

  const countMap: Record<string, number> = {}
  nicheCounts?.forEach((n) => {
    countMap[n.category] = (countMap[n.category] ?? 0) + 1
  })

  const totalNiches = Object.values(countMap).reduce((a, b) => a + b, 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'YouTube Niche Categories',
    description: 'Browse all 26 YouTube niche categories on YTNiches',
    url: 'https://ytniches.com/categories',
    hasPart: CATEGORIES.map((cat) => ({
      '@type': 'WebPage',
      name: cat.name,
      url: `https://ytniches.com/categories/${cat.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F5F0E8]">

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 text-center">
          <p className="text-xs font-bold text-[#E8402A] uppercase tracking-wider mb-3">
            Browse by category
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-black text-[#1A1612] leading-tight mb-4">
            YouTube Niche<br />Categories
          </h1>
          <p className="text-base text-[#8A7F72] leading-relaxed mb-8 max-w-xl mx-auto">
            Explore all 26 YouTube niche categories. Click any category to browse curated niches with CPM data, video ideas, and complete content kits.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="font-display text-3xl font-black text-[#1A1612]">26</div>
              <div className="text-xs text-[#8A7F72] mt-0.5">Categories</div>
            </div>
            <div className="w-px h-8 bg-[#E0D9CE]" />
            <div className="text-center">
              <div className="font-display text-3xl font-black text-[#1A1612]">{totalNiches > 0 ? `${totalNiches}+` : '1,200+'}</div>
              <div className="text-xs text-[#8A7F72] mt-0.5">Niches</div>
            </div>
            <div className="w-px h-8 bg-[#E0D9CE]" />
            <div className="text-center">
              <div className="font-display text-3xl font-black text-[#1A1612]">36k+</div>
              <div className="text-xs text-[#8A7F72] mt-0.5">Video Ideas</div>
            </div>
          </div>
        </div>

        {/* Categories grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.slug}
                cat={cat}
                count={countMap[cat.name] ?? 0}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-[#1A1612] rounded-[20px] p-8 md:p-10 text-center">
            <p className="text-xs font-semibold text-[#E8402A] uppercase tracking-wider mb-2">
              Ready to start?
            </p>
            <h3 className="font-display text-3xl font-black text-white mb-3">
              Find your perfect YouTube niche
            </h3>
            <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
              Get CPM data, 30 video ideas, title templates, thumbnail prompts, and a 30-day content calendar for any niche.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/niches"
                className="px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors"
              >
                Browse all niches →
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
