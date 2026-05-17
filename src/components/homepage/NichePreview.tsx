import Link from 'next/link'
import { TrendingUp, Lock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Niche } from '@/types'

const COMPETITION_STYLE: Record<string, string> = {
  Low: 'bg-[#EBF5EF] text-[#2A7A4B]',
  Medium: 'bg-[#FEF6E8] text-[#A06B00]',
  High: 'bg-[#FDF0ED] text-[#E8402A]',
}

function NicheCardMini({ niche, isLocked }: { niche: Niche; isLocked: boolean }) {
  return (
    <div className="relative bg-white rounded-[20px] border border-[#E0D9CE] p-5 hover:shadow-[0_8px_32px_0_rgba(26,22,18,0.1)] hover:border-[#C8C0B3] transition-all">
      {isLocked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-4 h-4 text-[#E0D9CE]" />
        </div>
      )}
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8402A] mb-1.5">
        {niche.category}
      </p>
      <h3 className="font-display text-[15px] font-bold text-[#1A1612] leading-snug mb-3 line-clamp-2">
        {niche.name}
      </h3>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="inline-flex items-center gap-1 bg-[#EDE8DF] text-[#1A1612] text-xs font-semibold px-2.5 py-0.5 rounded-full">
          ${niche.cpm_min}–${niche.cpm_max} RPM
        </span>
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', COMPETITION_STYLE[niche.competition_level] ?? COMPETITION_STYLE.Low)}>
          {niche.competition_level}
        </span>
      </div>
      {!isLocked ? (
        <Link href={`/niches/${niche.slug}`} className="text-xs font-bold text-[#E8402A] hover:text-[#CF3520] transition-colors">
          View Niche →
        </Link>
      ) : (
        <Link href="/pricing" className="text-xs font-bold text-[#8A7F72] hover:text-[#E8402A] transition-colors flex items-center gap-1">
          <Lock className="w-3 h-3" /> Unlock
        </Link>
      )}
    </div>
  )
}

interface NichePreviewProps {
  niches: Niche[]
  isPremiumUser: boolean
}

export function NichePreview({ niches, isPremiumUser }: NichePreviewProps) {
  if (!niches || niches.length === 0) return null

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A7F72] mb-2">
            Niche Library
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="font-display font-bold text-[32px] sm:text-[38px] text-[#1A1612] leading-tight">
              Trending Niches Right Now
            </h2>
            <Link
              href="/niches"
              className="text-sm font-semibold text-[#E8402A] hover:text-[#CF3520] transition-colors shrink-0 flex items-center gap-1"
            >
              Browse all niches <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-[#8A7F72] text-sm mt-2">Hand-picked niches with high RPM and low competition</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {niches.map((niche) => (
            <NicheCardMini
              key={niche.id}
              niche={niche}
              isLocked={false}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
