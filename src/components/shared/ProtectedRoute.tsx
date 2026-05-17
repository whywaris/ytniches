'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import type { Plan } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPlan?: Plan
  fallbackPath?: string
}

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  pro: 1,
  lifetime: 2,
}

export function ProtectedRoute({
  children,
  requiredPlan = 'free',
  fallbackPath = '/',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace(`${fallbackPath}?auth=login`)
      return
    }

    if (user && requiredPlan !== 'free') {
      const userRank = PLAN_RANK[user.plan]
      const requiredRank = PLAN_RANK[requiredPlan]
      if (userRank < requiredRank) {
        router.replace('/pricing')
      }
    }
  }, [isLoading, isAuthenticated, user, requiredPlan, fallbackPath, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
