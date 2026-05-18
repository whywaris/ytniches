'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ExternalLink } from 'lucide-react'
import type { HandpickNiche } from '@/types'

interface SavedHandpickRow {
  id: string
  handpick_id: string
  handpick: HandpickNiche
}

interface Props {
  initialSavedHandpick: SavedHandpickRow[]
}

export function SavedNichesClient({ initialSavedHandpick }: Props) {
  const [savedHandpick, setSavedHandpick] = useState(initialSavedHandpick)

  async function handleUnsave(handpickId: string) {
    setSavedHandpick((prev) => prev.filter((r) => r.handpick_id !== handpickId))
    try {
      await fetch('/api/handpick/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handpick_id: handpickId }),
      })
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">Saved Niches</h1>
        {savedHandpick.length > 0 && (
          <span className="bg-[#FDF0ED] text-[#E8402A] text-sm font-bold px-3 py-1 rounded-full">
            {savedHandpick.length}
          </span>
        )}
      </div>

      {savedHandpick.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E0D9CE] py-20 text-center">
          <Heart className="w-12 h-12 text-[#E0D9CE] mx-auto mb-4" />
          <p className="font-display font-bold text-xl text-[#1A1612] mb-2">No saved niches yet</p>
          <p className="text-[#8A7F72] text-sm mb-6">
            Browse HandPick niches and tap the heart to save ones you like
          </p>
          <Link
            href="/dashboard/handpick"
            className="inline-block bg-[#E8402A] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Browse HandPick Niches
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedHandpick.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#E0D9CE]"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#F5F0E8] border border-[#E0D9CE] shrink-0">
                {item.handpick.image_url ? (
                  <img
                    src={item.handpick.image_url}
                    alt={item.handpick.channel_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-[#8A7F72] font-bold">
                    {item.handpick.channel_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1A1612] truncate">{item.handpick.channel_name}</p>
                <div className="flex items-center gap-2 text-xs text-[#8A7F72] mt-0.5">
                  <span>{item.handpick.category}</span>
                  {item.handpick.monthly_earning_range && (
                    <>
                      <span className="text-[#E0D9CE]">·</span>
                      <span className="text-[#2A7A4B] font-medium">{item.handpick.monthly_earning_range}</span>
                    </>
                  )}
                  {item.handpick.subscribers && (
                    <>
                      <span className="text-[#E0D9CE]">·</span>
                      <span>{item.handpick.subscribers} subs</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={item.handpick.channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[#F5F0E8] text-[#1A1612] rounded-full border border-[#E0D9CE] hover:bg-[#E0D9CE] transition-colors font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </a>
                <button
                  onClick={() => void handleUnsave(item.handpick_id)}
                  className="w-8 h-8 flex items-center justify-center text-[#E8402A] hover:bg-[#FDF0ED] rounded-full transition-colors"
                  title="Remove from saved"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
