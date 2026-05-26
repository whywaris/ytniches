'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Zap, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS_MONTHLY = [
  {
    name: 'Free',
    price: 'Free',
    period: 'forever',
    description: 'Exploring and getting started',
    features: [
      '20 niches access',
      '3 video ideas / niche',
      'Free tools',
      'Save 3 niches',
      '5 new niches added free/month',
      'Basic support',
    ],
    cta: 'Get Started Free',
    href: '/auth/signup',
    style: 'border-[#E0D9CE] bg-white',
    buttonStyle: 'border border-[#1A1612] text-[#1A1612] hover:bg-[#1A1612] hover:text-white',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    badge: 'Most Popular',
    description: 'Serious creators who want every advantage',
    features: [
      'Unlimited niche access',
      'Unlimited video ideas',
      'Script hooks',
      'Title templates',
      'Thumbnail prompts',
      'RPM / CPM data',
      'Free tools',
      'Save unlimited niches',
      'New niches every month',
      'Priority support',
    ],
    cta: 'Start Pro — $9/mo',
    href: '/auth/signup',
    style: 'border-[#E8402A] bg-white ring-2 ring-[#E8402A]/10',
    buttonStyle: 'bg-[#E8402A] text-white hover:bg-[#CF3520]',
  },
  {
    name: 'Lifetime',
    price: '$199',
    period: 'one-time',
    badge: '⚡ Founding Member',
    description: 'Committed creators who want lifetime access',
    features: [
      'Everything in Pro',
      'Lifetime access — pay once',
      'All future niches included',
      'All future features',
      'Founding member badge',
      'Save unlimited niches',
      'VIP support',
    ],
    cta: 'Get Lifetime Access',
    href: '/auth/signup',
    style: 'border-[#1A1612] bg-[#1A1612]',
    buttonStyle: 'bg-white text-[#1A1612] hover:bg-[#F5F0E8]',
    dark: true,
  },
]

const PLANS_YEARLY = [
  {
    name: 'Free',
    price: 'Free',
    period: 'forever',
    description: 'Exploring and getting started',
    features: [
      '20 niches access',
      '3 video ideas / niche',
      'Free tools',
      'Save 3 niches',
      '5 new niches added free/month',
      'Basic support',
    ],
    cta: 'Get Started Free',
    href: '/auth/signup',
    style: 'border-[#E0D9CE] bg-white',
    buttonStyle: 'border border-[#1A1612] text-[#1A1612] hover:bg-[#1A1612] hover:text-white',
  },
  {
    name: 'Pro',
    price: '$72',
    period: '/year',
    badge: 'Most Popular',
    savings: 'Save $36/year',
    description: 'Serious creators who want every advantage',
    features: [
      'Unlimited niche access',
      'Unlimited video ideas',
      'Script hooks',
      'Title templates',
      'Thumbnail prompts',
      'RPM / CPM data',
      'Free tools',
      'Save unlimited niches',
      'New niches every month',
      'Priority support',
    ],
    cta: 'Start Pro — $72/year',
    href: '/auth/signup',
    style: 'border-[#E8402A] bg-white ring-2 ring-[#E8402A]/10',
    buttonStyle: 'bg-[#E8402A] text-white hover:bg-[#CF3520]',
  },
  {
    name: 'Lifetime',
    price: '$199',
    period: 'one-time',
    badge: '⚡ Founding Member',
    description: 'Committed creators who want lifetime access',
    features: [
      'Everything in Pro',
      'Lifetime access — pay once',
      'All future niches included',
      'All future features',
      'Founding member badge',
      'Save unlimited niches',
      'VIP support',
    ],
    cta: 'Get Lifetime Access',
    href: '/auth/signup',
    style: 'border-[#1A1612] bg-[#1A1612]',
    buttonStyle: 'bg-white text-[#1A1612] hover:bg-[#F5F0E8]',
    dark: true,
  },
]

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)
  const PLANS = isYearly ? PLANS_YEARLY : PLANS_MONTHLY

  return (
    <section className="py-20 px-4 bg-[#EDE8DF]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A7F72] mb-3">
            Pricing
          </p>
          <h2 className="font-display font-bold text-[32px] sm:text-[38px] text-[#1A1612] mb-3">
            Simple & Honest Pricing
          </h2>
          <p className="text-[#8A7F72] text-sm mb-6">Start free. Upgrade when you&apos;re ready.</p>

          {/* Monthly/Yearly Toggle */}
          <div className="inline-flex items-center gap-3 bg-white rounded-full border border-[#E0D9CE] p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-bold transition-all',
                !isYearly ? 'bg-[#1A1612] text-white' : 'text-[#8A7F72] hover:text-[#1A1612]'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-bold transition-all',
                isYearly ? 'bg-[#1A1612] text-white' : 'text-[#8A7F72] hover:text-[#1A1612]'
              )}
            >
              Yearly
              <span className="ml-1.5 text-[10px] font-bold text-[#2A7A4B]">Save 33%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'rounded-[24px] border-2 p-7 flex flex-col relative',
                plan.style
              )}
            >
              {plan.badge && (
                <span className={cn(
                  'absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full',
                  plan.dark ? 'bg-white text-[#1A1612]' : 'bg-[#E8402A] text-white'
                )}>
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <h3 className={cn('font-display font-bold text-lg mb-1', plan.dark ? 'text-white' : 'text-[#1A1612]')}>
                  {plan.name}
                </h3>
                <p className={cn('text-xs', plan.dark ? 'text-[#8A7F72]' : 'text-[#8A7F72]')}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={cn('font-display font-black text-[40px] leading-none', plan.dark ? 'text-white' : 'text-[#1A1612]')}>
                  {plan.price}
                </span>
                <span className={cn('text-sm ml-1', plan.dark ? 'text-[#8A7F72]' : 'text-[#8A7F72]')}>
                  {plan.period}
                </span>
                {'savings' in plan && plan.savings && (
                  <span className="block text-xs font-bold text-[#2A7A4B] mt-1">{plan.savings}</span>
                )}
              </div>

              <ul className="flex-1 space-y-2.5 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className={cn('flex items-start gap-2 text-sm', plan.dark ? 'text-[#C4BBB0]' : 'text-[#6B6259]')}>
                    <Check className={cn('w-4 h-4 shrink-0 mt-0.5', plan.dark ? 'text-[#E8402A]' : 'text-[#2A7A4B]')} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  'block text-center font-bold text-sm py-3.5 rounded-full transition-all',
                  plan.buttonStyle
                )}
              >
                {plan.cta}
              </Link>

              {plan.name === 'Lifetime' && (
                <p className="text-[10px] text-[#8A7F72] text-center mt-2">
                  Only available during launch period
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: Shield, text: '7-day money back' },
            { icon: Check, text: 'Cancel anytime' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-[#8A7F72]">
              <Icon className="w-3.5 h-3.5 text-[#2A7A4B]" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
