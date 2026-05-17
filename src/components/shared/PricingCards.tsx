'use client'

import { Check, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { CheckoutButton } from '@/components/shared/CheckoutButton'
import type { PricingPlan } from '@/types'

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Perfect for exploring and getting started.',
    features: [
      '5 free niches',
      'Basic video ideas',
      'Competition ratings',
      'Limited niche detail',
    ],
    cta: 'Get started free',
    highlighted: false,
    lemon_variant_id: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1200,
    period: 'month',
    description: 'For serious creators who want every advantage.',
    features: [
      'All 200+ niches unlocked',
      'Full AI content kits',
      '30-day content calendars',
      'Title & thumbnail templates',
      'Script hooks & ideas',
      'Save unlimited niches',
      'Priority support',
    ],
    cta: 'Start Pro — $12/mo',
    highlighted: true,
    lemon_variant_id: process.env.NEXT_PUBLIC_LS_PRO_VARIANT_ID ?? '',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 24900,
    period: 'once',
    description: 'Pay once, use forever. Best value for committed creators.',
    features: [
      'Everything in Pro',
      'Lifetime access',
      'All future niches',
      'All future features',
      'Founding member badge',
      'Private community access',
    ],
    cta: 'Get Lifetime Access',
    highlighted: false,
    lemon_variant_id: process.env.NEXT_PUBLIC_LS_LIFETIME_VARIANT_ID ?? '',
  },
]

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free'
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            'relative flex flex-col',
            plan.highlighted && 'border-[#E8402A] ring-2 ring-[#E8402A] shadow-lg',
            plan.id === 'pro' && 'order-first md:order-none',
          )}
        >
          {plan.highlighted && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="accent" className="gap-1 text-xs">
                <Zap className="w-3 h-3" />
                Most popular
              </Badge>
            </div>
          )}

          <CardContent className="p-6 flex flex-col flex-1">
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold text-[#1A1612] mb-1">{plan.name}</h3>
              <p className="text-sm text-[#8A7F72] mb-4">{plan.description}</p>
              <div className="flex items-end gap-1">
                <span className="font-display text-4xl font-bold text-[#1A1612]">
                  {formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-[#8A7F72] text-sm mb-1">
                    {plan.period === 'once' ? ' one-time' : '/mo'}
                  </span>
                )}
              </div>
            </div>

            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2A7A4B] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1A1612]">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <a
                href="/auth/signup"
                className="block w-full text-center border border-[#E0D9CE] text-[#1A1612] font-bold text-sm px-6 py-3 rounded-full hover:border-[#1A1612] transition-colors"
              >
                {plan.cta}
              </a>
            ) : (
              <CheckoutButton
                plan={plan.id as 'pro' | 'lifetime'}
                className={cn(
                  'w-full',
                  plan.highlighted
                    ? 'bg-[#E8402A] text-white hover:bg-[#CF3520]'
                    : 'border border-[#1A1612] text-[#1A1612] hover:bg-[#1A1612] hover:text-white',
                )}
              >
                {plan.cta}
              </CheckoutButton>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
