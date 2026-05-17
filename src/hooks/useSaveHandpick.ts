'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSaveHandpick() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSavedIds()
  }, [])

  async function fetchSavedIds() {
    try {
      const res = await fetch('/api/handpick/saved')
      const ids = await res.json() as string[]
      setSavedIds(new Set(ids))
    } catch {
      setSavedIds(new Set())
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleSave(handpickId: string, onNotLoggedIn?: () => void): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      onNotLoggedIn?.()
      return
    }

    setSavingId(handpickId)
    const isSaved = savedIds.has(handpickId)

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (isSaved) next.delete(handpickId)
      else next.add(handpickId)
      return next
    })

    try {
      const res = await fetch('/api/handpick/save', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handpick_id: handpickId }),
      })

      if (!res.ok) {
        // Revert on error
        setSavedIds((prev) => {
          const next = new Set(prev)
          if (isSaved) next.add(handpickId)
          else next.delete(handpickId)
          return next
        })
      }
    } catch {
      // Revert on error
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (isSaved) next.add(handpickId)
        else next.delete(handpickId)
        return next
      })
    } finally {
      setSavingId(null)
    }
  }

  return {
    savedIds,
    isLoading,
    savingId,
    isSaved: (id: string) => savedIds.has(id),
    toggleSave,
  }
}
