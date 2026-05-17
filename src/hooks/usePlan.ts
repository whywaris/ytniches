'use client'

import { useAuthStore } from '@/store/useAuthStore'
import type { Niche } from '@/types'

const PRO_VARIANT = process.env.NEXT_PUBLIC_LS_PRO_VARIANT_ID ?? ''
const FOUNDING_VARIANT =
  process.env.NEXT_PUBLIC_LS_FOUNDING_VARIANT_ID ??
  process.env.NEXT_PUBLIC_LS_LIFETIME_VARIANT_ID ??
  ''

function buildCheckoutUrl(variantId: string, email?: string, userId?: string): string {
  if (!variantId) return '/dashboard/billing'
  const params = new URLSearchParams({ embed: '1' })
  if (email) params.set('checkout[email]', email)
  if (userId) params.set('checkout[custom][user_id]', userId)
  return `https://app.lemonsqueezy.com/checkout/buy/${variantId}?${params.toString()}`
}

export function usePlan() {
  const user = useAuthStore((s) => s.user)
  const isPro = useAuthStore((s) => s.isPro)
  const plan = user?.plan ?? 'free'

  return {
    plan,
    isFree: plan === 'free',
    isPro: isPro(),
    isLifetime: plan === 'lifetime',
    isFoundingMember: user?.is_founding_member ?? false,
    canAccessNiche: (niche: Niche) => !niche.is_premium || isPro(),
    canAccessFormats: () => isPro(),
    canAccessScriptGenerator: () => isPro(),
    getProCheckoutUrl: (email?: string, userId?: string) =>
      buildCheckoutUrl(PRO_VARIANT, email, userId),
    getFoundingCheckoutUrl: (email?: string, userId?: string) =>
      buildCheckoutUrl(FOUNDING_VARIANT, email, userId),
  }
}
