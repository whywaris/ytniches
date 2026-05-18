import type { Metadata } from 'next'
import { Shield, Check } from 'lucide-react'
import { PricingCards } from '@/components/shared/PricingCards'
import { FaqAccordion } from '@/components/shared/FaqAccordion'

export const metadata: Metadata = {
  title: 'Pricing — Free, Pro & Lifetime Plans',
  description: 'Start free with 5 niches or unlock everything with Pro at $12/month. Lifetime access available for $249 one-time payment.',
  alternates: { canonical: 'https://ytniches.com/pricing' },
}

const FAQS = [
  {
    q: "What's included in the free plan?",
    a: "The free plan gives you access to 5 free niches with basic video ideas and competition data. No credit card required.",
  },
  {
    q: 'Can I cancel my Pro subscription anytime?',
    a: 'Absolutely. Cancel anytime from your account settings — no questions asked, no cancellation fees. Your access continues until the end of the billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and more through LemonSqueezy, our secure payment provider.',
  },
  {
    q: 'Do lifetime members get new niches too?',
    a: 'Yes. Lifetime access means exactly that — you get every niche we add in the future, plus all new features, at no extra cost. One payment, forever.',
  },
  {
    q: 'Is there a refund policy?',
    a: "Yes. We offer a 7-day money-back guarantee on all paid plans. If you're not happy for any reason, email us within 7 days of purchase for a full refund. No questions asked.",
  },
  {
    q: 'Can I use YTNiches for multiple YouTube channels?',
    a: 'Yes. One subscription covers all your channels. Research as many niches as you like across any number of channels you run.',
  },
]

import { PricingJsonLd } from '@/components/shared/JsonLd'

export default function PricingPage() {
  return (
    <div className="py-16 px-4">
      <PricingJsonLd />
      <div className="max-w-7xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A7F72] mb-3">Pricing</p>
          <h1 className="font-display font-black text-[36px] sm:text-[52px] leading-tight text-[#1A1612] mb-4">
            Simple &amp; honest pricing
          </h1>
          <p className="text-[#8A7F72] text-lg">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </div>

        {/* ── Pricing Cards ────────────────────────────────────────── */}
        <PricingCards />

        {/* ── Money-back guarantee ─────────────────────────────────── */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#EBF5EF] border border-[#C2E0CE] rounded-[20px] px-8 py-5 max-w-xl mx-auto">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2A7A4B]/10 shrink-0">
            <Shield className="w-5 h-5 text-[#2A7A4B]" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1612] text-sm">
              7-day money-back guarantee
            </p>
            <p className="text-xs text-[#2A7A4B] mt-0.5">
              Not happy? Get a full refund within 7 days — no questions asked.
            </p>
          </div>
        </div>

        {/* ── What you get comparison ──────────────────────────────── */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-[28px] text-[#1A1612] text-center mb-10">
            Everything in one place
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                plan: 'Free',
                color: 'border-[#E0D9CE]',
                items: [
                  '5 researched niches',
                  'Basic video ideas',
                  'CPM & competition data',
                ],
              },
              {
                plan: 'Pro',
                color: 'border-[#E8402A]',
                items: [
                  '1,200+ niches unlocked',
                  '30 video ideas per niche',
                  'Script hooks & openers',
                  'Title templates',
                  'Thumbnail prompts',
                  '30-day content calendars',
                  'Save unlimited niches',
                  'Priority support',
                ],
              },
              {
                plan: 'Lifetime',
                color: 'border-[#1A1612]',
                items: [
                  'Everything in Pro',
                  'All future niches',
                  'All future features',
                  'Priority support forever',
                  'One-time payment',
                  'Pay once, use forever',
                ],
              },
            ].map(({ plan, color, items }) => (
              <div
                key={plan}
                className={`bg-white rounded-[20px] border-2 ${color} p-5 shadow-sm`}
              >
                <p className="font-display font-bold text-base text-[#1A1612] mb-4">{plan}</p>
                <ul className="flex flex-col gap-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-[#6B6259]">
                      <Check className="w-3.5 h-3.5 text-[#2A7A4B] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-[32px] text-[#1A1612] text-center mb-10">
            Frequently asked questions
          </h2>
          <FaqAccordion items={FAQS} />
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <div className="mt-20 bg-[#1A1612] rounded-[24px] p-10 sm:p-14 text-center">
          <h2 className="font-display font-bold text-[32px] text-white mb-3">
            Still have questions?
          </h2>
          <p className="text-[#8A7F72] text-sm mb-7 max-w-sm mx-auto">
            We&apos;re a small team and we read every email. Reach out and we&apos;ll get back to you within a few hours.
          </p>
          <a
            href="mailto:help@ytniches.com"
            className="inline-flex items-center gap-2 bg-white text-[#1A1612] font-bold text-sm px-7 py-3.5 rounded-full hover:bg-[#F5F0E8] transition-colors"
          >
            Email us
          </a>
        </div>
      </div>
    </div>
  )
}
