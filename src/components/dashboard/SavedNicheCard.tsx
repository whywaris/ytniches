'use client'

import Link from 'next/link'
import { X, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'
import type { Niche } from '@/types'

interface SavedNicheCardProps {
  niche: Niche
  onRemove: (id: string) => void
}

const COMPETITION_STYLE: Record<string, string> = {
  Low: 'bg-[#EBF5EF] text-[#2A7A4B] border border-[#C2E0CE]',
  Medium: 'bg-[#FEF6E8] text-[#A06B00] border border-[#F5DFA8]',
  High: 'bg-[#FDF0ED] text-[#E8402A] border border-[#F5C4BA]',
}

export function SavedNicheCard({ niche, onRemove }: SavedNicheCardProps) {
  const { user, removeSavedNiche } = useAuthStore()

  async function handleRemove() {
    onRemove(niche.id)
    removeSavedNiche(niche.id)

    const supabase = createClient()
    const updated = (user?.saved_niches ?? []).filter((id) => id !== niche.id)
    await supabase.from('users').update({ saved_niches: updated }).eq('id', user?.id)
  }

  return (
    <div className="relative bg-card rounded-[20px] border border-border p-4 hover:shadow-sm transition-shadow group">
      {/* Remove button */}
      <button
        onClick={handleRemove}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-secondary text-muted hover:bg-accent-light hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
        title="Remove from saved"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="mb-3">
        <span className={cn('inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2', COMPETITION_STYLE[niche.competition_level] ?? COMPETITION_STYLE.Low)}>
          {niche.competition_level}
        </span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{niche.category}</p>
        <h3 className="font-display font-bold text-foreground leading-snug pr-8">{niche.name}</h3>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>CPM ${niche.cpm_min}–${niche.cpm_max}</span>
        <Link
          href={`/niches/${niche.slug}`}
          className="flex items-center gap-1 font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          Open kit <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
