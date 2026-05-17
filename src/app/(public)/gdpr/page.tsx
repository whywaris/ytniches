import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'GDPR Compliance — YTNiches',
  description: 'YTNiches GDPR compliance information. Your rights under the General Data Protection Regulation.',
  alternates: { canonical: 'https://ytniches.com/gdpr' },
}

const TOC = [
  { id: 's1', label: '1. Who We Are' },
  { id: 's2', label: '2. Legal Bases' },
  { id: 's3', label: '3. Your GDPR Rights' },
  { id: 's4', label: '4. Right to Access' },
  { id: 's5', label: '5. Right to Erasure' },
  { id: 's6', label: '6. Right to Portability' },
  { id: 's7', label: '7. Right to Object' },
  { id: 's8', label: '8. Data Transfers' },
  { id: 's9', label: '9. Data Retention' },
  { id: 's10', label: '10. How to Exercise Rights' },
  { id: 's11', label: '11. Complaints' },
]

export default function GdprPage() {
  return (
    <LegalLayout
      title="GDPR Compliance"
      lastUpdated="January 15, 2026"
      breadcrumbLabel="GDPR"
      toc={TOC}
    >
      <LegalSection id="s1" title="1. Who We Are (Data Controller)">
        <p>
          YTNiches (ytniches.com) acts as the data controller for personal data collected through our platform. As data controller, we determine the purposes and means of processing your personal data.
        </p>
        <p>
          For GDPR-related inquiries, you can reach us at:{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
        </p>
      </LegalSection>

      <LegalSection id="s2" title="2. Legal Bases for Processing">
        <p>Under the GDPR, we process your personal data on the following legal bases:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-[#1A1612]">Contract performance</strong> — processing necessary to provide the YTNiches service you subscribed to (account management, delivering niche data, processing payments)
          </li>
          <li>
            <strong className="text-[#1A1612]">Legitimate interests</strong> — fraud prevention, service improvement, security monitoring, and internal analytics
          </li>
          <li>
            <strong className="text-[#1A1612]">Consent</strong> — sending marketing emails and weekly digests (you can withdraw consent at any time)
          </li>
          <li>
            <strong className="text-[#1A1612]">Legal obligation</strong> — retaining financial records as required by tax and accounting laws
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="s3" title="3. Your GDPR Rights">
        <p>If you are located in the European Economic Area (EEA) or United Kingdom, you have the following rights under GDPR / UK GDPR:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Right of access (Article 15)</li>
          <li>Right to rectification (Article 16)</li>
          <li>Right to erasure / &ldquo;right to be forgotten&rdquo; (Article 17)</li>
          <li>Right to restriction of processing (Article 18)</li>
          <li>Right to data portability (Article 20)</li>
          <li>Right to object (Article 21)</li>
          <li>Rights related to automated decision-making (Article 22)</li>
        </ul>
        <p>
          We aim to respond to all GDPR requests within <strong className="text-[#1A1612]">30 days</strong>. Complex requests may take up to 90 days, in which case we will notify you of the extended timeline.
        </p>
      </LegalSection>

      <LegalSection id="s4" title="4. Right to Access">
        <p>
          You have the right to obtain confirmation of whether we process your personal data, and if so, to receive a copy of that data along with information about:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The purposes for which it is processed</li>
          <li>The categories of data concerned</li>
          <li>Recipients or categories of recipients</li>
          <li>The retention period or criteria used to determine it</li>
          <li>Your other rights under GDPR</li>
        </ul>
        <p>
          To request access, email{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
          {' '}with the subject &ldquo;Data Access Request.&rdquo;
        </p>
      </LegalSection>

      <LegalSection id="s5" title="5. Right to Erasure">
        <p>
          You have the right to request deletion of your personal data when:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The data is no longer necessary for the purposes it was collected</li>
          <li>You withdraw consent and there is no other legal basis for processing</li>
          <li>You object to processing and there are no overriding legitimate grounds</li>
          <li>The data has been unlawfully processed</li>
        </ul>
        <p>
          Note: We may retain certain data where required by law (e.g., financial records must be kept for 7 years). We will inform you of any such exceptions when processing your request.
        </p>
      </LegalSection>

      <LegalSection id="s6" title="6. Right to Data Portability">
        <p>
          You have the right to receive your personal data in a structured, commonly used, and machine-readable format (JSON or CSV), and to transmit that data to another controller where technically feasible. This right applies where processing is based on consent or contract performance.
        </p>
        <p>
          To request a data export, email{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
          {' '}with subject &ldquo;Data Portability Request.&rdquo;
        </p>
      </LegalSection>

      <LegalSection id="s7" title="7. Right to Object">
        <p>
          You have the right to object to the processing of your personal data where we rely on legitimate interests as our legal basis. We will stop processing unless we can demonstrate compelling legitimate grounds that override your interests, or where processing is necessary for legal claims.
        </p>
        <p>
          You may opt out of marketing communications at any time by visiting your <a href="/dashboard/settings/emails" className="text-[#E8402A] hover:underline">Email Preferences</a> page or clicking the unsubscribe link in any email we send.
        </p>
      </LegalSection>

      <LegalSection id="s8" title="8. International Data Transfers">
        <p>
          YTNiches uses cloud services that may store and process data outside your country of residence. Our primary providers include:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[#1A1612]">Supabase</strong> — database hosting (EU-West region available)</li>
          <li><strong className="text-[#1A1612]">Vercel</strong> — web hosting with global edge network</li>
          <li><strong className="text-[#1A1612]">Resend</strong> — email delivery (US-based)</li>
        </ul>
        <p>
          Where data is transferred outside the EEA, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by the European Commission.
        </p>
      </LegalSection>

      <LegalSection id="s9" title="9. Data Retention">
        <p>We retain personal data for no longer than necessary:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Active account data: retained while your account is active</li>
          <li>Deleted accounts: personal data removed within 30 days</li>
          <li>Payment records: 7 years (legal requirement)</li>
          <li>Email logs: 90 days</li>
          <li>Analytics data: anonymized after 12 months</li>
        </ul>
      </LegalSection>

      <LegalSection id="s10" title="10. How to Exercise Your Rights">
        <p>To submit a GDPR request:</p>
        <div className="bg-[#F5F0E8] rounded-xl p-5 space-y-2 text-sm">
          <div className="flex gap-3">
            <span className="font-bold text-[#E8402A] shrink-0">1.</span>
            Email <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#E8402A] shrink-0">2.</span>
            Use subject: &ldquo;GDPR Request — [Access / Deletion / Portability / Objection]&rdquo;
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#E8402A] shrink-0">3.</span>
            Include your account email address for verification
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#E8402A] shrink-0">4.</span>
            We will confirm receipt within 48 hours and respond within 30 days
          </div>
        </div>
        <p>
          We may ask you to verify your identity before processing sensitive requests to protect your data.
        </p>
      </LegalSection>

      <LegalSection id="s11" title="11. Right to Lodge a Complaint">
        <p>
          If you believe our processing of your personal data violates GDPR, you have the right to lodge a complaint with your national data protection authority. For EU residents, find your local authority at{' '}
          <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">edpb.europa.eu</a>.
          For UK residents, contact the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">Information Commissioner&apos;s Office (ICO)</a>.
        </p>
        <p>
          We encourage you to contact us first so we can try to resolve your concern:{' '}
          <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
