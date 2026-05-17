import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — YTNiches',
  description: 'YTNiches privacy policy. Learn how we collect, use, and protect your personal data.',
  alternates: { canonical: 'https://ytniches.com/privacy' },
}

const TOC = [
  { id: 's1', label: '1. Introduction' },
  { id: 's2', label: '2. Information We Collect' },
  { id: 's3', label: '3. How We Use Your Data' },
  { id: 's4', label: '4. Cookies' },
  { id: 's5', label: '5. Data Sharing' },
  { id: 's6', label: '6. Data Retention' },
  { id: 's7', label: '7. Your Rights' },
  { id: 's8', label: '8. Children\'s Privacy' },
  { id: 's9', label: '9. Policy Changes' },
  { id: 's10', label: '10. Contact' },
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="January 15, 2026"
      breadcrumbLabel="Privacy Policy"
      toc={TOC}
    >
      <LegalSection id="s1" title="1. Introduction">
        <p>
          YTNiches (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates ytniches.com. This policy explains what data we collect, how we use it, and your rights regarding your personal information. By using our service, you consent to the practices described here.
        </p>
      </LegalSection>

      <LegalSection id="s2" title="2. Information We Collect">
        <div>
          <p className="font-semibold text-[#1A1612] text-sm mb-2">2.1 Information you provide:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account registration (name, email, password)</li>
            <li>Payment information (processed by LemonSqueezy — we never store card details)</li>
            <li>Messages sent via the contact form</li>
            <li>Niche requests and votes submitted on the platform</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1A1612] text-sm mb-2">2.2 Information collected automatically:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Device information (browser, OS, screen size)</li>
            <li>IP address and approximate geographic location</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </div>
      </LegalSection>

      <LegalSection id="s3" title="3. How We Use Your Information">
        <ul className="list-disc pl-5 space-y-1">
          <li>To provide, maintain, and improve our service</li>
          <li>To process payments via LemonSqueezy</li>
          <li>To send transactional emails (receipts, plan confirmations)</li>
          <li>To send our weekly digest and product updates (you can unsubscribe anytime)</li>
          <li>To respond to niche requests and notify you of status updates</li>
          <li>To analyze usage patterns and improve features</li>
          <li>To detect and prevent fraud or abuse</li>
          <li>To comply with legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection id="s4" title="4. Cookies">
        <p>Types of cookies we use:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[#1A1612]">Essential cookies</strong> — required for login and session management. Cannot be disabled.</li>
          <li><strong className="text-[#1A1612]">Analytics cookies</strong> — help us understand how visitors use the site (anonymized).</li>
          <li><strong className="text-[#1A1612]">Preference cookies</strong> — remember your settings and consent choices.</li>
        </ul>
        <p>
          You can manage cookie preferences through your browser settings or our <a href="/cookies" className="text-[#E8402A] hover:underline">Cookie Policy</a> page. See our full <a href="/cookies" className="text-[#E8402A] hover:underline">Cookie Policy</a> for details.
        </p>
      </LegalSection>

      <LegalSection id="s5" title="5. Data Sharing">
        <p className="font-semibold text-[#1A1612]">We do not sell your personal data. Ever.</p>
        <p>We share data only with trusted service providers who help us operate the platform:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[#1A1612]">LemonSqueezy</strong> — payment processing and subscription management</li>
          <li><strong className="text-[#1A1612]">Supabase</strong> — database hosting and authentication</li>
          <li><strong className="text-[#1A1612]">Vercel</strong> — web hosting and content delivery</li>
          <li><strong className="text-[#1A1612]">Resend</strong> — transactional email delivery</li>
          <li><strong className="text-[#1A1612]">OpenAI</strong> — AI-powered content generation tools</li>
          <li><strong className="text-[#1A1612]">Legal authorities</strong> — only when required by law</li>
        </ul>
        <p>Each provider is bound by their own privacy policy and data processing agreements with us.</p>
      </LegalSection>

      <LegalSection id="s6" title="6. Data Retention">
        <ul className="list-disc pl-5 space-y-1">
          <li>Account data: kept for as long as your account is active</li>
          <li>Deleted account data: removed within 30 days of deletion request</li>
          <li>Payment records: retained for 7 years (legal and tax requirement)</li>
          <li>Email logs: retained for 90 days for deliverability troubleshooting</li>
          <li>Analytics data: aggregated and anonymized after 12 months</li>
        </ul>
      </LegalSection>

      <LegalSection id="s7" title="7. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[#1A1612]">Access</strong> — request a copy of your personal data</li>
          <li><strong className="text-[#1A1612]">Rectification</strong> — correct inaccurate data</li>
          <li><strong className="text-[#1A1612]">Erasure</strong> — delete your account and associated data</li>
          <li><strong className="text-[#1A1612]">Portability</strong> — export your data in a machine-readable format</li>
          <li><strong className="text-[#1A1612]">Opt-out</strong> — unsubscribe from marketing emails at any time</li>
          <li><strong className="text-[#1A1612]">Restriction</strong> — limit how we process your data in certain circumstances</li>
        </ul>
        <p>
          To exercise any of these rights, email:{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
          . For GDPR-specific rights, see our <a href="/gdpr" className="text-[#E8402A] hover:underline">GDPR page</a>.
        </p>
      </LegalSection>

      <LegalSection id="s8" title="8. Children's Privacy">
        <p>
          YTNiches is not directed to individuals under the age of 13. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us immediately at <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="s9" title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material changes by email at least 14 days before they take effect. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most recent revision. Continued use of YTNiches after changes constitutes your acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection id="s10" title="10. Contact">
        <p>
          Questions about this Privacy Policy? We&apos;re happy to help.
        </p>
        <p>
          Email: <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
          <br />
          We respond within 24–48 hours.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
