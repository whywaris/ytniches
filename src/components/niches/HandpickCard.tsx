'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { HandpickNiche } from '@/types'
import { SaveHandpickButton } from '@/components/handpick/SaveHandpickButton'

interface HandpickCardProps {
  niche: HandpickNiche
  isPro?: boolean
  isSaved?: boolean
  isSaving?: boolean
  onToggleSave?: (id: string, onNotLoggedIn: () => void) => Promise<void>
}

export function HandpickCard({
  niche,
  isPro = false,
  isSaved = false,
  isSaving = false,
  onToggleSave,
}: HandpickCardProps) {
  const isLocked = niche.is_pro_only && !isPro

  return (
    <div className="relative bg-white border border-[#E0D9CE] rounded-[20px] p-5 flex flex-col gap-3 overflow-hidden">
      {/* Hot badge */}
      {niche.is_hot && (
        <span className="absolute top-3 left-3 text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
          🔥 Hot
        </span>
      )}

      {/* Save button — only when save handler provided */}
      {onToggleSave && (
        <div className="absolute top-3 right-3">
          <SaveHandpickButton
            handpickId={niche.id}
            isSaved={isSaved}
            isSaving={isSaving}
            onToggle={onToggleSave}
            size="sm"
          />
        </div>
      )}

      {/* Avatar + name */}
      <div className={`flex items-center gap-3 ${niche.is_hot ? 'mt-5' : ''}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F5F0E8] border border-[#E0D9CE] shrink-0">
          {niche.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={niche.image_url}
              alt={niche.channel_name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-[#8A7F72] font-bold">
              {niche.channel_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 pr-8">
          <p className="font-semibold text-sm text-[#1A1612] truncate">{niche.channel_name}</p>
          <p className="text-xs text-[#8A7F72] truncate">{niche.category}</p>
        </div>
      </div>

      {/* Earnings */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs">💰</span>
        <span className="text-sm font-bold text-[#2A7A4B]">{niche.monthly_earning_range}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-[#8A7F72]">
        <span>👥 {niche.subscribers} subs</span>
        {niche.channel_age && <span>· {niche.channel_age} old</span>}
      </div>

      {/* Tags */}
      {(niche.niche_tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(niche.niche_tags ?? []).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 bg-[#F5F0E8] text-[#5A5248] rounded-full border border-[#E0D9CE] font-medium"
            >
              {tag}
            </span>
          ))}
          {(niche.niche_tags ?? []).length > 4 && (
            <span className="text-xs px-2.5 py-0.5 bg-[#E0D9CE] text-[#8A7F72] rounded-full font-medium">
              +{(niche.niche_tags ?? []).length - 4}
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <a
        href={niche.channel_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-[#E8402A] hover:underline"
      >
        View Channel →
      </a>

      {/* Pro lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-[20px] flex flex-col items-center justify-center gap-2 p-4">
          <div className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#8A7F72]" />
          </div>
          <p className="font-semibold text-sm text-[#1A1612] text-center">Pro Only</p>
          <p className="text-xs text-[#8A7F72] text-center">Upgrade to see this channel</p>
          <Link
            href="/pricing"
            className="mt-1 text-xs font-bold bg-[#E8402A] text-white px-4 py-1.5 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Go Pro →
          </Link>
        </div>
      )}
    </div>
  )
}
