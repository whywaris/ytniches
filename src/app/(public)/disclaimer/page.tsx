import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Disclaimer — YTNiches',
  description: 'Important disclaimers about YTNiches niche data, earnings estimates, and third-party content.',
  alternates: { canonical: 'https://ytniches.com/disclaimer' },
}

const TOC = [
  { id: 's1', label: '1. General Disclaimer' },
  { id: 's2', label: '2. Earnings Disclaimer' },
  { id: 's3', label: '3. Niche Data Accuracy' },
  { id: 's4', label: '4. Not Financial Advice' },
  { id: 's5', label: '5. No YouTube Affiliation' },
  { id: 's6', label: '6. Third-Party Links' },
  { id: 's7', label: '7. Results May Vary' },
  { id: 's8', label: '8. Contact' },
]

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer"
      lastUpdated="January 15, 2026"
      breadcrumbLabel="Disclaimer"
      toc={TOC}
    >
      <LegalSection id="s1" title="1. General Disclaimer">
        <p>
          The information provided by YTNiches on ytniches.com is for general informational and educational purposes only. All information is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the platform.
        </p>
        <p>
          Under no circumstances shall YTNiches be liable for any loss or damage incurred as a result of the use of the platform or reliance on any information provided.
        </p>
      </LegalSection>

      <LegalSection id="s2" title="2. Earnings Disclaimer">
        <p>
          YTNiches provides CPM (Cost Per Mille) and RPM (Revenue Per Mille) estimates as part of niche research data. These figures are:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Based on industry averages and publicly reported ranges</li>
          <li>Not guarantees of actual earnings</li>
          <li>Subject to significant variation based on audience geography, content quality, seasonality, and YouTube algorithm changes</li>
          <li>For research and planning purposes only</li>
        </ul>
        <p>
          Actual YouTube revenue depends on numerous factors outside our control, including but not limited to: your channel&apos;s audience demographics, content type, upload frequency, advertiser demand, and YouTube&apos;s monetization policies.
        </p>
      </LegalSection>

      <LegalSection id="s3" title="3. Niche Data Accuracy">
        <p>
          Our niche database is compiled through research, analysis, and curation by our team. While we strive for accuracy:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Market conditions change rapidly — niche viability may shift after publication</li>
          <li>Competition levels are dynamic and may increase or decrease over time</li>
          <li>Search volume data is approximated and may not reflect real-time figures</li>
          <li>Content suggestions are examples, not exhaustive guides</li>
        </ul>
        <p>
          We recommend using our niche data as a starting point for your own research, not as the sole basis for business decisions.
        </p>
      </LegalSection>

      <LegalSection id="s4" title="4. Not Financial Advice">
        <p>
          Nothing on YTNiches constitutes financial, investment, legal, or tax advice. The information provided is for educational purposes only. You should consult a qualified professional before making any financial decisions based on content from our platform.
        </p>
      </LegalSection>

      <LegalSection id="s5" title="5. No YouTube Affiliation">
        <p>
          YTNiches is an independent platform and is not affiliated with, endorsed by, or sponsored by YouTube, Google, or Alphabet Inc. All YouTube-related trademarks, logos, and brand names are the property of their respective owners. References to YouTube on this platform are for informational purposes only.
        </p>
      </LegalSection>

      <LegalSection id="s6" title="6. Third-Party Links">
        <p>
          YTNiches may contain links to external websites or services. These links are provided for convenience only. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policy of every site you visit.
        </p>
      </LegalSection>

      <LegalSection id="s7" title="7. Results May Vary">
        <p>
          Any case studies, testimonials, or examples of results shared on this platform are individual experiences and do not represent typical results. Your results will vary based on your own effort, experience, skills, niche selection, and market conditions. There is no guarantee that you will achieve similar results.
        </p>
        <p>
          Growing a successful YouTube channel requires consistent effort, quality content, and adaptation to platform changes. YTNiches is a research tool — success ultimately depends on your execution.
        </p>
      </LegalSection>

      <LegalSection id="s8" title="8. Contact">
        <p>
          If you have questions about this disclaimer or believe any information on our platform is inaccurate, please contact us:{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
