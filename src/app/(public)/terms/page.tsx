import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms of Service — YTNiches',
  description: 'YTNiches terms of service. Read our terms before using ytniches.com.',
  alternates: { canonical: 'https://ytniches.com/terms' },
}

const TOC = [
  { id: 's1', label: '1. Acceptance of Terms' },
  { id: 's2', label: '2. Description of Service' },
  { id: 's3', label: '3. Account Registration' },
  { id: 's4', label: '4. Plans & Payments' },
  { id: 's5', label: '5. Acceptable Use' },
  { id: 's6', label: '6. Intellectual Property' },
  { id: 's7', label: '7. Disclaimer of Warranties' },
  { id: 's8', label: '8. Limitation of Liability' },
  { id: 's9', label: '9. Termination' },
  { id: 's10', label: '10. Changes to Terms' },
  { id: 's11', label: '11. Governing Law' },
  { id: 's12', label: '12. Contact' },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="January 15, 2026"
      breadcrumbLabel="Terms of Service"
      toc={TOC}
    >
      <LegalSection id="s1" title="1. Acceptance of Terms">
        <p>
          By accessing or using YTNiches (ytniches.com), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use our service.
        </p>
      </LegalSection>

      <LegalSection id="s2" title="2. Description of Service">
        <p>
          YTNiches provides a web-based platform for YouTube niche research, content planning tools, and YouTube utility tools. We offer free and paid subscription plans. Features and pricing may change with appropriate notice.
        </p>
      </LegalSection>

      <LegalSection id="s3" title="3. Account Registration">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be 13 years or older to create an account</li>
          <li>You must provide accurate and complete information during registration</li>
          <li>You are responsible for maintaining the security of your password</li>
          <li>One account per person — shared accounts are not permitted</li>
          <li>You are responsible for all activity that occurs under your account</li>
          <li>Notify us immediately if you suspect unauthorized access to your account</li>
        </ul>
      </LegalSection>

      <LegalSection id="s4" title="4. Subscription Plans & Payments">
        <div>
          <p className="font-semibold text-[#1A1612] mb-1">Free Plan:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access to 5 free niches and all free tools</li>
            <li>No credit card required</li>
            <li>Subject to fair-use limits</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1A1612] mb-1">Pro Plan ($12/month):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Billed monthly via LemonSqueezy</li>
            <li>Cancel anytime from your dashboard — no cancellation fees</li>
            <li>Full refund within 7 days of first purchase (see Refund Policy)</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1A1612] mb-1">Lifetime Plan ($249 one-time):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Single payment via LemonSqueezy</li>
            <li>Permanent access to all current and future features</li>
            <li>Full refund within 7 days of purchase (see Refund Policy)</li>
          </ul>
        </div>
        <p>
          Prices may be adjusted with 30 days&apos; notice to existing subscribers. Continued use after a price change constitutes acceptance of the new pricing.
        </p>
      </LegalSection>

      <LegalSection id="s5" title="5. Acceptable Use">
        <div>
          <p className="font-semibold text-[#1A1612] mb-1">You MAY:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use niche data and content kits for your own YouTube channels</li>
            <li>Use our free tools for personal and commercial projects</li>
            <li>Share results and screenshots from our tools</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1A1612] mb-1">You MAY NOT:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Resell, sublicense, or redistribute YTNiches content or data</li>
            <li>Scrape or bulk-copy our niche database by automated means</li>
            <li>Share your account credentials with other people</li>
            <li>Use our service to spam, harass, or abuse YouTube&apos;s platform</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Build competing products using data or insights derived from our platform</li>
          </ul>
        </div>
        <p>Violations may result in immediate account termination without refund.</p>
      </LegalSection>

      <LegalSection id="s6" title="6. Intellectual Property">
        <p>
          All content on YTNiches — including niche research data, content kits, video ideas, script hooks, and tool outputs — is owned by YTNiches and protected by applicable copyright law. Your subscription grants you a personal, non-exclusive, non-transferable license to use our content solely for your own YouTube channels.
        </p>
      </LegalSection>

      <LegalSection id="s7" title="7. Disclaimer of Warranties">
        <p>
          YTNiches is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. We do not guarantee:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Specific earnings, RPM rates, or revenue figures</li>
          <li>YouTube channel growth or monetization approval</li>
          <li>Absolute accuracy of all niche data (CPM figures are industry estimates)</li>
          <li>Uninterrupted or error-free service availability</li>
        </ul>
        <p>
          RPM and CPM data is based on industry averages and may not reflect your actual YouTube earnings. See our full <a href="/disclaimer" className="text-[#E8402A] hover:underline">Disclaimer</a>.
        </p>
      </LegalSection>

      <LegalSection id="s8" title="8. Limitation of Liability">
        <p>To the maximum extent permitted by law, YTNiches shall not be liable for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Lost revenue, profits, or business opportunities</li>
          <li>YouTube account issues, strikes, or demonetization</li>
          <li>Third-party service failures or outages</li>
          <li>Data loss or corruption</li>
          <li>Indirect, incidental, or consequential damages</li>
        </ul>
        <p>
          Our maximum aggregate liability to you for any claim is limited to the total amount you paid to YTNiches in the three months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection id="s9" title="9. Termination">
        <p>We may suspend or terminate your account if you:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Violate any provision of these Terms</li>
          <li>Engage in fraudulent or deceptive activity</li>
          <li>Abuse our platform, team, or other users</li>
          <li>Attempt to circumvent access controls</li>
        </ul>
        <p>
          You may cancel your account at any time from your dashboard settings. Upon termination, your access to premium features ends immediately.
        </p>
      </LegalSection>

      <LegalSection id="s10" title="10. Changes to Terms">
        <p>
          We will notify you by email at least 30 days before making material changes to these Terms. Minor clarifications may be made without notice. Continued use of YTNiches after changes take effect constitutes your acceptance of the revised terms.
        </p>
      </LegalSection>

      <LegalSection id="s11" title="11. Governing Law">
        <p>
          These Terms are governed by applicable international law. In the event of a dispute, we encourage resolution through direct email negotiation first. We aim to respond to all disputes within 5 business days.
        </p>
      </LegalSection>

      <LegalSection id="s12" title="12. Contact">
        <p>
          Questions about these Terms? Email:{' '}
          <a href="mailto:help@ytniches.com" className="text-[#E8402A] hover:underline">help@ytniches.com</a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
