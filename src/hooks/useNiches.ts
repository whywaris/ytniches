'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useNicheStore } from '@/store/useNicheStore'
import type { Niche } from '@/types'

export function useNiches() {
  const { niches, filteredNiches, filters, isLoading, error, setNiches, setLoading, setError } =
    useNicheStore()
  const isPro = useAuthStore((s) => s.isPro)

  useEffect(() => {
    if (niches.length > 0) return

    const supabase = createClient()
    setLoading(true)

    let query = supabase
      .from('niches')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    // RLS enforces this at DB level too, but we filter client-side for free users
    // to avoid showing locked niches in the response at all
    if (!isPro()) {
      query = query.eq('is_premium', false)
    }

    query.then(({ data, error: err }) => {
      if (err) {
        setError(err.message)
      } else {
        setNiches((data as Niche[]) ?? [])
      }
      setLoading(false)
    })
  }, [niches.length, isPro, setNiches, setLoading, setError])

  return { niches, filteredNiches, filters, isLoading, error }
}
