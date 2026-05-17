'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { redirectToProCheckout, redirectToLifetimeCheckout } from '@/lib/lemonsqueezy/actions'
import { cn } from '@/lib/utils'

interface BillingUpgradeButtonProps {
  planKey: 'pro' | 'lifetime'
  className: string
}

export function BillingUpgradeButton({ planKey, className }: BillingUpgradeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      if (planKey === 'pro') {
        await redirectToProCheckout()
      } else {
        await redirectToLifetimeCheckout()
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={cn('block w-full text-center font-bold text-sm py-3 rounded-full transition-all disabled:opacity-60', className)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Upgrade'}
    </button>
  )
}
