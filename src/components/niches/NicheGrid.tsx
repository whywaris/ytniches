'use client'

import { useState } from 'react'
import { NicheCard } from './NicheCard'
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { Niche } from '@/types'

interface NicheGridProps {
  niches: Niche[]
  isPremiumUser?: boolean
  isLoading?: boolean
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-[#E0D9CE] rounded-[20px] p-5 animate-pulse">
      <div className="h-2.5 w-16 bg-[#EDE8DF] rounded-full mb-2" />
      <div className="h-5 w-3/4 bg-[#EDE8DF] rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-28 bg-[#EDE8DF] rounded-full" />
        <div className="h-5 w-20 bg-[#EDE8DF] rounded-full" />
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-full bg-[#EDE8DF] rounded" />
        <div className="h-3 w-5/6 bg-[#EDE8DF] rounded" />
        <div className="h-3 w-4/6 bg-[#EDE8DF] rounded" />
      </div>
      <div className="flex justify-between pt-3 border-t border-[#E0D9CE]">
        <div className="h-3 w-20 bg-[#EDE8DF] rounded" />
        <div className="h-3 w-14 bg-[#EDE8DF] rounded" />
      </div>
    </div>
  )
}

export function NicheGrid({ niches, isPremiumUser: serverIsPremiumUser, isLoading }: NicheGridProps) {
  const { user: storeUser, addSavedNiche, removeSavedNiche } = useAuthStore()
  const { showToast } = useToast()
  const [savingId, setSavingId] = useState<string | null>(null)

  const isPremiumUser =
    serverIsPremiumUser ?? (storeUser?.plan === 'pro' || storeUser?.plan === 'lifetime')
  const savedNiches = storeUser?.saved_niches ?? []

  async function handleSave(nicheId: string) {
    if (savingId) return

    setSavingId(nicheId)
    const supabase = createClient()

    try {
      let userId: string
      let currentSaved: string[]

      if (storeUser) {
        // Store is hydrated — use it directly
        userId = storeUser.id
        currentSaved = storeUser.saved_niches ?? []
      } else {
        // Store not hydrated yet (race condition on first load) — check session directly
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          showToast('Please log in to save niches', 'info')
          return
        }
        userId = session.user.id
        const { data: profile } = await supabase
          .from('users')
          .select('saved_niches')
          .eq('id', userId)
          .single()
        currentSaved = profile?.saved_niches ?? []
      }

      const isSaved = currentSaved.includes(nicheId)

      // Optimistic update in store (no-op when store not hydrated, which is fine)
      if (isSaved) removeSavedNiche(nicheId)
      else addSavedNiche(nicheId)

      const updated = isSaved
        ? currentSaved.filter((id) => id !== nicheId)
        : [...currentSaved, nicheId]

      const { error } = await supabase
        .from('users')
        .update({ saved_niches: updated })
        .eq('id', userId)

      if (error) {
        // Revert optimistic update
        if (isSaved) addSavedNiche(nicheId)
        else removeSavedNiche(nicheId)
        showToast('Failed to save — please try again', 'error')
      } else {
        showToast(isSaved ? 'Removed from saved' : 'Niche saved!', 'success')
      }
    } catch {
      showToast('Failed to save — please try again', 'error')
    } finally {
      setSavingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (niches.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-[#E0D9CE] rounded-[20px]">
        <p className="text-3xl mb-3">🔍</p>
        <p className="font-display text-lg font-semibold text-[#1A1612] mb-1">No niches found</p>
        <p className="text-sm text-[#8A7F72]">Try adjusting your filters or search term.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {niches.map((niche) => (
        <NicheCard
          key={niche.id}
          niche={niche}
          isLocked={niche.is_premium && !isPremiumUser}
          isSaved={savedNiches.includes(niche.id)}
          onSave={handleSave}
          isSaving={savingId === niche.id}
        />
      ))}
    </div>
  )
}
