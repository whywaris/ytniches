'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createProCheckout, createLifetimeCheckout } from '@/lib/lemonsqueezy/actions'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'

interface CheckoutButtonProps {
  plan: 'pro' | 'lifetime'
  className?: string
  children?: React.ReactNode
}

export function CheckoutButton({ plan, className, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { user, isPro } = useAuthStore()

  const isCurrentPlan =
    (plan === 'pro' && isPro() && user?.plan !== 'lifetime') ||
    (plan === 'lifetime' && user?.plan === 'lifetime')

  if (isCurrentPlan) {
    return (
      <button
        disabled
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-3 rounded-full opacity-60 cursor-not-allowed',
          className,
        )}
      >
        Current plan
      </button>
    )
  }

  async function handleClick() {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }
    setLoading(true)
    try {
      const email = user.email ?? ''
      const url =
        plan === 'lifetime'
          ? await createLifetimeCheckout(user.id, email)
          : await createProCheckout(user.id, email)
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-70',
        className,
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children ?? (plan === 'lifetime' ? 'Get Lifetime Access' : 'Start Pro — $9/mo')}
    </button>
  )
}
