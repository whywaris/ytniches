'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import type { User } from '@/types'

export function useUser() {
  const { user, isLoading, isAuthenticated, isAdmin, setUser, setLoading } =
    useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    async function fetchAndSetProfile(userId: string) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      setUser(profile as User | null)
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setUser(null)
        return
      }
      await fetchAndSetProfile(session.user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await fetchAndSetProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  return { user, isLoading, isAuthenticated, isAdmin }
}
