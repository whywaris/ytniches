'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NicheGrid } from '@/components/niches/NicheGrid'
import { NicheFilters } from '@/components/niches/NicheFilters'
import { useNiches } from '@/hooks/useNiches'
import { useNicheStore } from '@/store/useNicheStore'

export function NicheExplorer() {
  const { isLoading } = useNiches()
  const { filteredNiches } = useNicheStore()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Explore Niches
        </h2>
        <Link
          href="/niches"
          className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover"
        >
          Full library
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mb-6">
        <NicheFilters />
      </div>

      <NicheGrid niches={filteredNiches} isLoading={isLoading} />
    </div>
  )
}
