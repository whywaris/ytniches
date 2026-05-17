'use client'

import { useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'

interface ManageSubscriptionButtonProps {
  className?: string
}

export function ManageSubscriptionButton({ className }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  if (user?.plan === 'lifetime') {
    return (
      <span className={cn('text-sm font-semibold text-[#2A7A4B]', className)}>
        Lifetime member
      </span>
    )
  }

  if (!user || user.plan === 'free') {
    return (
      <a
        href="/pricing"
        className={cn(
          'inline-flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors',
          className,
        )}
      >
        Upgrade to Pro
      </a>
    )
  }

  async function handleManage() {
    setLoading(true)
    try {
      window.location.href = '/api/lemonsqueezy/portal'
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-2 text-sm font-semibold text-[#1A1612] hover:text-[#E8402A] transition-colors disabled:opacity-60',
        className,
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ExternalLink className="w-4 h-4" />
      )}
      Manage subscription
    </button>
  )
}
