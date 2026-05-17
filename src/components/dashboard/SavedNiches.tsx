'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import type { Niche } from '@/types'

export function SavedNiches() {
  const [niches, setNiches] = useState<Niche[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore((s) => s.user)
  const removeSavedNiche = useAuthStore((s) => s.removeSavedNiche)

  useEffect(() => {
    if (!user?.saved_niches?.length) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('niches')
      .select('*')
      .in('id', user.saved_niches)
      .then(({ data }) => {
        setNiches((data as Niche[]) ?? [])
        setIsLoading(false)
      })
  }, [user?.saved_niches])

  async function handleUnsave(nicheId: string) {
    const supabase = createClient()
    removeSavedNiche(nicheId)
    setNiches((prev) => prev.filter((n) => n.id !== nicheId))

    await supabase
      .from('users')
      .update({
        saved_niches: user?.saved_niches?.filter((id) => id !== nicheId) ?? [],
      })
      .eq('id', user?.id)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!niches.length) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-xl">
        <Bookmark className="w-10 h-10 text-muted mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">No saved niches yet</p>
        <p className="text-sm text-muted mb-4">
          Browse the niche library and save ones you like.
        </p>
        <Link
          href="/niches"
          className="text-sm font-semibold text-accent hover:text-accent-hover"
        >
          Browse niches →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {niches.map((niche) => (
        <Card key={niche.id} className="group">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Badge variant="default" className="mb-2 text-xs">
                  {niche.category}
                </Badge>
                <h4 className="font-display font-semibold text-foreground truncate">
                  {niche.name}
                </h4>
                <p className="text-xs text-muted mt-1">CPM: ${niche.cpm_min}–${niche.cpm_max}</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <Link
                  href={`/niches/${niche.slug}`}
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleUnsave(niche.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/5 transition-colors"
                  title="Remove from saved"
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
