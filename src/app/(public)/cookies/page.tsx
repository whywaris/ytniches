import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Cookie Policy — YTNiches',
  description: 'Learn how YTNiches uses cookies and similar technologies on ytniches.com.',
  alternates: { canonical: 'https://ytniches.com/cookies' },
}

const TOC = [
  { id: 's1', label: '1. What Are Cookies' },
  { id: 's2', label: '2. Cookies We Use' },
  { id: 's3', label: '3. Third-Party Cookies' },
  { id: 's4', label: '4. Managing Cookies' },
  { id: 's5', label: '5. Cookie Consent' },
  { id: 's6', label: '6. Policy Updates' },
  { id: 's7', label: '7. Contact' },
]

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      lastUpdated="January 15, 2026"
      breadcrumbLabel="Cookie Policy"
      toc={TOC}
    >
      <LegalSection id="s1" title="1. What Are Cookies">
        <p>
          Cookies are small text files placed on your device when you visit a website. They help websites remember information about your visit, making subsequent visits easier and the site more useful to you. Cookies cannot run programs or deliver viruses.
        </p>
        <p>
          We also use similar technologies such as localStorage and sessionStorage for certain site features like saving your cookie consent preference.
        </p>
      </LegalSection>

      <LegalSection id="s2" title="2. Cookies We Use">
        <div>
          <p className="font-semibold text-[#1A1612] mb-2">Essential Cookies (always active)</p>
          <p className="text-sm mb-2">These are required for the site to function. They cannot be disabled.</p>
          <div className="bg-[#F5F0E8] rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between gap-4 border-b border-[#E0D9CE] pb-2">
              <span className="font-medium">sb-access-token</span>
              <span className="text-[#8A7F72]">Supabase auth session — 1 hour</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#E0D9CE] pb-2">
              <span className="font-medium">sb-refresh-token</span>
              <span className="text-[#8A7F72]">Session refresh — 7 days</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">cookie_consent</span>
              <span className="text-[#8A7F72]">Your consent choice — 1 year (localStorage)</span>
            </div>
          </div>
        </div>
        <div>
          <p className="font-semibold text-[#1A1612] mb-2">Preference Cookies</p>
          <p>These cookies remember your settings and personalizations between visits.</p>
          <div className="bg-[#F5F0E8] rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <span className="font-medium">Various localStorage keys</span>
              <span className="text-[#8A7F72]">Dashboard filters, notification state — session</span>
            </div>
          </div>
        </div>
        <div>
          <p className="font-semibold text-[#1A1612] mb-2">Analytics Cookies (optional)</p>
          <p>These help us understand how visitors interact with YTNiches so we can improve the product. All data is anonymized — we cannot identify individual users from analytics data.</p>
          <div className="bg-[#F5F0E8] rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <span className="font-medium">Vercel Analytics</span>
              <span className="text-[#8A7F72]">Page views, performance — anonymized</span>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="s3" title="3. Third-Party Cookies">
        <p>Some features of YTNiches load content from third-party services, which may set their own cookies:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[#1A1612]">LemonSqueezy</strong> — required for payment processing on checkout pages</li>
          <li><strong className="text-[#1A1612]">Vercel</strong> — performance monitoring and analytics</li>
        </ul>
        <p>
          These third parties have their own privacy and cookie policies, which we do not control. We recommend reviewing their policies if you have concerns.
        </p>
      </LegalSection>

      <LegalSection id="s4" title="4. Managing Cookies">
        <p>You have several options for controlling cookies:</p>
        <div>
          <p className="font-semibold text-[#1A1612] text-sm mb-1">Browser settings:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Most browsers let you view, delete, and block cookies in Settings → Privacy</li>
            <li>Blocking essential cookies will prevent you from logging into YTNiches</li>
            <li>Clearing cookies will log you out of your current session</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1A1612] text-sm mb-1">Opt-out links:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vercel Analytics: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">Vercel Privacy Policy</a></li>
          </ul>
        </div>
      </LegalSection>

      <LegalSection id="s5" title="5. Cookie Consent">
        <p>
          When you first visit YTNiches, we display a cookie consent banner. Clicking &ldquo;Accept All&rdquo; enables optional analytics cookies. Clicking &ldquo;Essential Only&rdquo; limits cookies to those strictly necessary for the site to function. You can change your preference at any time by clearing your browser&apos;s localStorage or by using your browser&apos;s cookie controls.
        </p>
        <p>
          Essential cookies are always active as they are required to provide the service you requested.
        </p>
      </LegalSection>

      <LegalSection id="s6" title="6. Policy Updates">
        <p>
          We may update this Cookie Policy to reflect changes in the cookies we use or in applicable regulations. We will post the updated policy on this page with a revised &ldquo;Last updated&rdquo; date. Material changes will be announced via email.
        </p>
      </LegalSection>

      <LegalSection id="s7" title="7. Contact">
        <p>
          Questions about our use of cookies? Email:{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
