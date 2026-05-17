import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check, Shield, CheckCircle2, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { BillingUpgradeButton } from '@/components/dashboard/BillingUpgradeButton'

export const metadata: Metadata = {
  title: 'Billing',
}

const PLANS = [
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
    planKey: 'free',
    style: 'border-[#E0D9CE] bg-white',
    buttonStyle: 'border border-[#E0D9CE] text-[#8A7F72] cursor-default',
  },
  {
    name: 'Pro',
    price: '$12',
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
    planKey: 'pro',
    style: 'border-[#E8402A] bg-white ring-2 ring-[#E8402A]/10',
    buttonStyle: 'bg-[#E8402A] text-white hover:bg-[#CF3520]',
  },
  {
    name: 'Lifetime',
    price: '$249',
    period: 'one-time',
    badge: '⚡ Founding Member',
    description: 'Committed creators who want lifetime access',
    features: [
      'Everything in Pro',
      'Lifetime access — pay once',
      'All future niches included',
      'All future features',
      'Founding member badge',
      'VIP support',
    ],
    planKey: 'lifetime',
    style: 'border-[#1A1612] bg-[#1A1612]',
    buttonStyle: 'bg-white text-[#1A1612] hover:bg-[#F5F0E8]',
    dark: true,
  },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('plan, plan_expires_at, lemonsqueezy_subscription_id')
    .eq('id', user.id)
    .single()

  const currentPlan = profile?.plan ?? 'free'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Billing</h1>
        <p className="text-muted text-sm mt-1">Manage your subscription and plan</p>
      </div>

      {/* Founding Member badge */}
      {currentPlan === 'lifetime' && (
        <div className="mb-6 flex items-center gap-2 bg-[#FEF6E8] border border-[#F5DFA8] rounded-full px-4 py-2 w-fit">
          <span className="text-sm">⚡</span>
          <span className="text-sm font-bold text-[#A06B00]">Founding Member</span>
        </div>
      )}

      {/* Current plan status */}
      <div className="bg-card border border-border rounded-[20px] p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2A7A4B]" />
            <div>
              <p className="font-semibold text-foreground capitalize">{currentPlan} Plan</p>
              <p className="text-xs text-muted mt-0.5">
                {currentPlan === 'lifetime'
                  ? 'Lifetime access — no renewal needed'
                  : currentPlan === 'pro'
                  ? 'Monthly subscription — cancel anytime'
                  : 'Free forever — upgrade to unlock all niches'}
              </p>
            </div>
          </div>
          {currentPlan === 'pro' && profile?.plan_expires_at && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Calendar className="w-3.5 h-3.5" />
              Renews {new Date(profile.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
          {currentPlan === 'pro' && (
            <Link
              href="/api/lemonsqueezy/portal"
              className="text-xs font-bold text-[#E8402A] hover:text-[#CF3520] transition-colors"
            >
              Manage subscription →
            </Link>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.planKey === currentPlan
          const isUpgrade = (currentPlan === 'free' && plan.planKey !== 'free') ||
                            (currentPlan === 'pro' && plan.planKey === 'lifetime')

          return (
            <div
              key={plan.name}
              className={cn(
                'rounded-[24px] border-2 p-6 flex flex-col relative',
                isCurrentPlan ? 'ring-2 ring-[#2A7A4B]/20' : '',
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

              {isCurrentPlan && (
                <span className="absolute -top-3 right-4 text-[11px] font-bold px-3 py-1 rounded-full bg-[#EBF5EF] text-[#2A7A4B] border border-[#C2E0CE]">
                  Current
                </span>
              )}

              <div className="mb-4">
                <h3 className={cn('font-display font-bold text-lg mb-1', plan.dark ? 'text-white' : 'text-[#1A1612]')}>
                  {plan.name}
                </h3>
                <p className={cn('text-xs', 'text-[#8A7F72]')}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-5">
                <span className={cn('font-display font-black text-[36px] leading-none', plan.dark ? 'text-white' : 'text-[#1A1612]')}>
                  {plan.price}
                </span>
                <span className="text-sm ml-1 text-[#8A7F72]">{plan.period}</span>
              </div>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={cn('flex items-start gap-2 text-sm', plan.dark ? 'text-[#C4BBB0]' : 'text-[#6B6259]')}>
                    <Check className={cn('w-4 h-4 shrink-0 mt-0.5', plan.dark ? 'text-[#E8402A]' : 'text-[#2A7A4B]')} />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="block text-center font-bold text-sm py-3 rounded-full bg-[#EBF5EF] text-[#2A7A4B] border border-[#C2E0CE]">
                  ✓ Active
                </div>
              ) : isUpgrade ? (
                <BillingUpgradeButton planKey={plan.planKey as 'pro' | 'lifetime'} className={plan.buttonStyle} />
              ) : (
                <div className={cn('block text-center font-bold text-sm py-3 rounded-full opacity-40 cursor-not-allowed', plan.buttonStyle)}>
                  {plan.planKey === 'free' ? 'Included' : 'Upgrade'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mt-8">
        {[
          { icon: Shield, text: '7-day money back' },
          { icon: Check, text: 'Cancel anytime' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5 text-xs text-muted">
            <Icon className="w-3.5 h-3.5 text-[#2A7A4B]" />
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}