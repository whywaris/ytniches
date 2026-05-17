'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, X, Info } from 'lucide-react'

interface SaveHandpickButtonProps {
  handpickId: string
  isSaved: boolean
  isSaving: boolean
  onToggle: (id: string, onNotLoggedIn: () => void) => Promise<void>
  size?: 'sm' | 'md'
}

export function SaveHandpickButton({
  handpickId,
  isSaved,
  isSaving,
  onToggle,
  size = 'md',
}: SaveHandpickButtonProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    void onToggle(handpickId, () => setShowLoginPrompt(true))
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isSaving}
        title={isSaved ? 'Remove from saved' : 'Save this niche'}
        className={`
          flex items-center justify-center rounded-full border transition-all shrink-0
          ${size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'}
          ${isSaved
            ? 'bg-[#FDF0ED] border-[#F5C4BA] text-[#E8402A]'
            : 'bg-white border-[#E0D9CE] text-[#C8C0B4] hover:border-[#E8402A] hover:text-[#E8402A]'
          }
          ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isSaving ? (
          <div className="w-3.5 h-3.5 border-2 border-[#E8402A]/30 border-t-[#E8402A] rounded-full animate-spin" />
        ) : (
          <Heart
            className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isSaved ? 'fill-current' : ''}`}
          />
        )}
      </button>

      {/* Login prompt toast */}
      {showLoginPrompt && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1612] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm whitespace-nowrap">
          <Info className="w-4 h-4 text-[#E8402A] shrink-0" />
          <span>Please log in to save niches</span>
          <Link
            href="/auth/login"
            className="text-[#E8402A] font-semibold hover:underline ml-1"
            onClick={(e) => e.stopPropagation()}
          >
            Log in →
          </Link>
          <button
            className="ml-2 text-white/50 hover:text-white"
            onClick={() => setShowLoginPrompt(false)}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  )
}
