'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Lock, Flame, Clock, DollarSign, ArrowRight } from 'lucide-react'
import type { Niche } from '@/types'

interface NicheCardProps {
  niche: Niche
  isPro?: boolean
  isLocked?: boolean
  isSaved?: boolean
  onSave?: ((nicheId: string) => Promise<void>) | (() => Promise<void>)
  isSaving?: boolean
}

export function NicheCard({ niche, isPro = false, isLocked: isLockedProp, isSaved, onSave, isSaving }: NicheCardProps) {
  const isLocked = isLockedProp ?? (niche.is_premium && !isPro)
  const thumbnail = niche.thumbnail_url_1

  const cardContent = (
    <div className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden hover:border-[#C8C0B4] hover:shadow-lg transition-all duration-200 h-full flex flex-col group relative">

      {/* THUMBNAIL — single image */}
      <div className="relative h-40 bg-[#E0D9CE] flex-shrink-0 overflow-hidden">
        {thumbnail ? (
          <>
            <img
              src={thumbnail}
              alt={`${niche.channel_name ?? niche.name} thumbnail`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* YouTube play icon overlay */}
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F5F0E8]">
            <svg className="w-8 h-8 text-[#C8C0B4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* HOT BADGE */}
      {niche.is_hot && (
        <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1 bg-[#E8402A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            <Flame className="w-3 h-3" /> Hot
          </span>
        </div>
      )}

      {/* PRO BADGE */}
      {niche.is_premium && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 bg-[#1A1612] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <Lock className="w-2.5 h-2.5" /> Pro
          </span>
        </div>
      )}

      {/* CARD BODY */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category + Content Type */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span className="text-[10px] font-semibold text-[#E8402A] bg-[#FDF0ED] px-2.5 py-0.5 rounded-full">
            {niche.category}
          </span>
          {niche.content_type && (
            <span className="text-[10px] text-[#8A7F72] bg-[#F5F0E8] border border-[#E0D9CE] px-2.5 py-0.5 rounded-full">
              {niche.content_type}
            </span>
          )}
        </div>

        {/* Channel Name */}
        <h3 className="font-display text-lg font-bold text-[#1A1612] leading-snug mb-1 group-hover:text-[#E8402A] transition-colors line-clamp-2">
          {niche.channel_name ?? niche.name}
        </h3>

        {/* Channel Age */}
        {niche.channel_age && (
          <p className="text-xs text-[#8A7F72] mb-3 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {niche.channel_age} old
          </p>
        )}

        {/* ESTIMATED EARNING — prominent */}
        {niche.estimated_earning && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2A7A4B] bg-[#EBF5EF] border border-[#C2E0CE] px-3 py-1.5 rounded-full">
              <DollarSign className="w-3.5 h-3.5" />
              {niche.estimated_earning}
            </span>
          </div>
        )}

        {/* SPACER */}
        <div className="flex-1" />

        {/* VIEW DETAIL BUTTON */}
        <div className="pt-3 border-t border-[#E0D9CE]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8A7F72]">Click to see full details</span>
            <span className="text-xs font-semibold text-[#E8402A] flex items-center gap-1 group-hover:gap-2 transition-all">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* LOCK OVERLAY */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#F5F0E8]/90 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-3 px-6 text-center z-20">
          <div className="w-12 h-12 bg-white border border-[#E0D9CE] rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#8A7F72]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#1A1612] mb-1">Pro Only</p>
            <p className="text-xs text-[#8A7F72]">Upgrade to unlock this niche</p>
          </div>
          <Link
            href="/pricing"
            onClick={e => e.stopPropagation()}
            className="px-4 py-2 bg-[#E8402A] text-white rounded-full text-xs font-semibold hover:bg-[#CF3520] transition-colors"
          >
            Go Pro — $9/mo
          </Link>
        </div>
      )}
    </div>
  )

  // Wrap in Link if not locked
  if (!isLocked) {
    return (
      <Link href={`/niches/${niche.slug}`} className="h-full block">
        {cardContent}
      </Link>
    )
  }

  return <div className="h-full">{cardContent}</div>
}
