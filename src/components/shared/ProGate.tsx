'use client'

import { Lock } from 'lucide-react'
import Script from 'next/script'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlan } from '@/hooks/usePlan'

interface ProGateProps {
  feature: string
  children: React.ReactNode
}

export function ProGate({ feature, children }: ProGateProps) {
  const isLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)
  const { isPro, getProCheckoutUrl, getFoundingCheckoutUrl } = usePlan()

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[20px] border border-[#E0D9CE] h-48 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isPro) return <>{children}</>

  const proUrl = getProCheckoutUrl(user?.email, user?.id)
  const foundingUrl = getFoundingCheckoutUrl(user?.email, user?.id)

  return (
    <>
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="lazyOnload" />
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-full bg-[#FDF0ED] flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-[#E8402A]" />
          </div>

          <h2 className="font-display font-bold text-2xl text-[#1A1612] mb-2">
            {feature} is a Pro feature
          </h2>
          <p className="text-sm text-[#8A7F72] mb-6 leading-relaxed">
            Unlock everything for $9/month — cancel anytime.
          </p>

          {/* Pro checkout — opens as LemonSqueezy overlay */}
          <a
            href={proUrl}
            className="lemonsqueezy-button inline-flex items-center justify-center bg-[#E8402A] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Upgrade to Pro — $9/month
          </a>

          {/* Lifetime / founding link */}
          <p className="mt-4 text-xs text-[#8A7F72]">
            <a
              href={foundingUrl}
              className="lemonsqueezy-button underline underline-offset-2 hover:text-[#1A1612] transition-colors"
            >
              Or get lifetime access for $199
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
