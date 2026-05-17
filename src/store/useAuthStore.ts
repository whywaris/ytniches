'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Plan } from '@/types'

const PLAN_RANK: Record<Plan, number> = { free: 0, pro: 1, lifetime: 2 }

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setPlan: (plan: Plan) => void
  updatePlan: (plan: Plan) => void
  addSavedNiche: (nicheId: string) => void
  removeSavedNiche: (nicheId: string) => void
  clearUser: () => void

  // Derived helpers (must call as functions)
  isPro: () => boolean
  hasAccess: (requiresPremium: boolean) => boolean
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isAdmin: user?.is_admin ?? false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setPlan: (plan) =>
        set((state) =>
          state.user ? { user: { ...state.user, plan } } : {}
        ),

      updatePlan: (plan) =>
        set((state) =>
          state.user ? { user: { ...state.user, plan } } : {}
        ),

      addSavedNiche: (nicheId) =>
        set((state) => {
          if (!state.user) return {}
          const saved = Array.from(
            new Set([...state.user.saved_niches, nicheId])
          )
          return { user: { ...state.user, saved_niches: saved } }
        }),

      removeSavedNiche: (nicheId) =>
        set((state) => {
          if (!state.user) return {}
          return {
            user: {
              ...state.user,
              saved_niches: state.user.saved_niches.filter((id) => id !== nicheId),
            },
          }
        }),

      clearUser: () =>
        set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false }),

      isPro: () => {
        const plan = get().user?.plan ?? 'free'
        return PLAN_RANK[plan] >= PLAN_RANK['pro']
      },

      hasAccess: (requiresPremium) => {
        if (!requiresPremium) return true
        return get().isPro()
      },
    }),
    { name: 'auth-store' }
  )
)
