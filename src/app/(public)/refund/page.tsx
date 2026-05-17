import type { Metadata } from 'next'
import { CheckCircle2, XCircle } from 'lucide-react'
import { LegalLayout, LegalSection } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Refund Policy — YTNiches',
  description: 'YTNiches refund policy. 7-day money back guarantee on Pro and Lifetime plans. No questions asked.',
  alternates: { canonical: 'https://ytniches.com/refund' },
}

const TOC = [
  { id: 's1', label: '7-Day Guarantee' },
  { id: 's2', label: 'Monthly Pro Plan' },
  { id: 's3', label: 'Lifetime Plan' },
  { id: 's4', label: 'Free Plan' },
  { id: 's5', label: 'How to Request' },
  { id: 's6', label: 'Exceptions' },
  { id: 's7', label: 'Questions?' },
]

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      lastUpdated="January 15, 2026"
      breadcrumbLabel="Refund Policy"
      toc={TOC}
    >
      <section id="s1" className="scroll-mt-24">
        <div className="bg-[#EBF5EF] border border-[#C2E0CE] rounded-[20px] p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-[#2A7A4B] mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-[#1A1612] mb-2">7-Day Money Back Guarantee</h2>
          <p className="text-[#6B6259] leading-relaxed max-w-lg mx-auto">
            If you&apos;re not satisfied with YTNiches Pro or Lifetime within 7 days of purchase, contact us for a full refund. No questions asked.
          </p>
        </div>
      </section>

      <LegalSection id="s2" title="Monthly Pro Plan ($12/month)">
        <div className="space-y-2">
          {[
            { ok: true, text: 'Full refund within 7 days of your first charge' },
            { ok: true, text: 'No questions asked — just email us' },
            { ok: true, text: 'Processed within 1–2 business days' },
            { ok: false, text: 'Renewal charges after 7 days are non-refundable' },
            { ok: false, text: 'Partial month refunds are not available' },
          ].map(({ ok, text }) => (
            <div key={text} className="flex items-start gap-2 text-sm">
              {ok ? (
                <CheckCircle2 className="w-4 h-4 text-[#2A7A4B] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-[#E8402A] shrink-0 mt-0.5" />
              )}
              <span>{text}</span>
            </div>
          ))}
        </div>
        <p className="text-sm">
          To request: Email{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
          {' '}with subject &ldquo;Refund Request&rdquo; and your account email.
        </p>
      </LegalSection>

      <LegalSection id="s3" title="Lifetime Plan ($249)">
        <div className="space-y-2">
          {[
            { ok: true, text: 'Full refund within 7 days of purchase' },
            { ok: true, text: 'No questions asked' },
            { ok: false, text: 'Non-refundable after the 7-day window' },
          ].map(({ ok, text }) => (
            <div key={text} className="flex items-start gap-2 text-sm">
              {ok ? (
                <CheckCircle2 className="w-4 h-4 text-[#2A7A4B] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-[#E8402A] shrink-0 mt-0.5" />
              )}
              <span>{text}</span>
            </div>
          ))}
        </div>
        <p className="text-sm">
          Same process — email{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
          {' '}within 7 days of your purchase.
        </p>
      </LegalSection>

      <LegalSection id="s4" title="Free Plan">
        <p>The free plan has no charges, so no refunds are applicable.</p>
      </LegalSection>

      <LegalSection id="s5" title="How to Get Your Refund">
        <div className="bg-[#F5F0E8] rounded-[20px] border border-[#E0D9CE] p-6">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold text-[#E8402A] shrink-0">1.</span>
              Email support@ytniches.com
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#E8402A] shrink-0">2.</span>
              Subject line: &ldquo;Refund Request — [your account email]&rdquo;
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#E8402A] shrink-0">3.</span>
              Include your account email and reason (optional)
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#E8402A] shrink-0">4.</span>
              We process your request within 1–2 business days
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#E8402A] shrink-0">5.</span>
              LemonSqueezy refund appears in 5–10 business days depending on your bank
            </li>
          </ol>
        </div>
      </LegalSection>

      <LegalSection id="s6" title="Exceptions">
        <p>We reserve the right to deny refunds if:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your account violated our Terms of Service</li>
          <li>A fraudulent purchase is detected</li>
          <li>The refund is requested after the 7-day window</li>
          <li>The account was previously refunded on a prior purchase</li>
        </ul>
      </LegalSection>

      <LegalSection id="s7" title="Questions?">
        <p>
          Email: <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a> — We reply within 24 hours.
        </p>
        <p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Contact Support →
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
