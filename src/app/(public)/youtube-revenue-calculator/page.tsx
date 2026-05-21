import type { Metadata } from 'next'
import { RevenueCalculatorClient } from '@/components/tools/RevenueCalculatorClient'
import { RevenueCalculatorContent } from '@/components/tools/RevenueCalculatorContent'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Revenue Calculator: Real RPM by Niche & Country',
  description:
    'Free YouTube Revenue Calculator with 2026 RPM rates. Enter your niche, views & country — get realistic daily, monthly & yearly earnings. No signup.',
  alternates: { canonical: 'https://ytniches.com/youtube-revenue-calculator' },
  openGraph: {
    title: 'YouTube Revenue Calculator: Real RPM by Niche & Country',
    description: 'Free YouTube Revenue Calculator with 2026 RPM rates. Enter your niche, views & country — get realistic earnings.',
    url: 'https://ytniches.com/youtube-revenue-calculator',
    type: 'website',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Revenue Calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free YouTube revenue calculator with 2026 RPM and CPM data by niche and country. Estimates daily, monthly, and yearly YouTube ad earnings.',
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'YouTube Revenue Calculator (2026) — Estimate Your Real Earnings by Niche, Views & Country',
  dateModified: '2026-05-01',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches', url: 'https://ytniches.com' },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How much does YouTube pay per 1,000 views in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'Between $0.50 and $25 per 1,000 views, depending on niche, audience country, and content format. Finance creators in the US earn $9–$11 RPM, Gaming creators earn $1–$3 RPM.' } },
    { '@type': 'Question', name: 'What is the difference between CPM and RPM on YouTube?', acceptedAnswer: { '@type': 'Answer', text: 'CPM is what advertisers pay per 1,000 ad impressions. RPM is what you receive per 1,000 video views after YouTube takes 45% and accounts for non-monetized views.' } },
    { '@type': 'Question', name: 'How much do YouTubers make with 100K subscribers?', acceptedAnswer: { '@type': 'Answer', text: 'A 100K subscriber channel posting 4 videos/month at 20K views each earns $200–$2,500/month depending on niche. Finance: $800–$2,200/month. Gaming: $80–$400/month.' } },
    { '@type': 'Question', name: 'How much does YouTube Shorts pay per 1 million views?', acceptedAnswer: { '@type': 'Answer', text: 'Approximately $30–$80 for 1 million Shorts views ($0.03–$0.08 RPM). Long-form earns $1,500–$10,000 for the same views.' } },
    { '@type': 'Question', name: 'Which YouTube niche pays the most in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'Finance, insurance, and legal niches pay $9–$12 RPM for Tier 1 audiences. Technology follows at $6–$10 RPM.' } },
    { '@type': 'Question', name: 'Why is my YouTube RPM so low?', acceptedAnswer: { '@type': 'Answer', text: 'Common reasons: Tier 3 audience (India, Pakistan), low-CPM niche, videos under 8 minutes (no mid-rolls), or Q1 seasonality.' } },
    { '@type': 'Question', name: 'How do I calculate my YouTube earnings?', acceptedAnswer: { '@type': 'Answer', text: 'Monthly earnings = (monthly views ÷ 1,000) × your RPM. Your RPM is in YouTube Studio → Analytics → Revenue.' } },
    { '@type': 'Question', name: 'Does YouTube pay differently for Shorts vs long videos?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Long-form: $1.50–$10+ RPM (CPM-based). Shorts: $0.03–$0.08 RPM (pool-based). Same 1M views = $1,500–$10,000 long-form vs $30–$80 Shorts.' } },
  ],
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the YouTube Revenue Calculator',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Select your content niche', text: 'Choose your niche from the dropdown menu.' },
    { '@type': 'HowToStep', position: 2, name: 'Enter your average monthly views', text: 'Input your total monthly video views.' },
    { '@type': 'HowToStep', position: 3, name: 'Select your primary audience country', text: 'Choose where most of your viewers are located.' },
    { '@type': 'HowToStep', position: 4, name: 'Choose your content type', text: 'Select long-form or Shorts.' },
    { '@type': 'HowToStep', position: 5, name: 'Click Calculate', text: 'See your estimated daily, monthly, and yearly earnings.' },
  ],
}

export default function YouTubeRevenueCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* H1 + Intro above tool */}
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-[32px] sm:text-[42px] leading-tight text-foreground mb-4">
              YouTube Revenue Calculator
            </h1>
            <p className="text-muted text-base max-w-xl mx-auto leading-relaxed">
              YouTube pays between $0.50 and $25 per 1,000 views — a 50× range. The generic &ldquo;$2–$5 per 1,000 views&rdquo; figure most sites quote is meaningless without knowing your niche, your audience&apos;s country, and your content format. Enter your details below for a realistic min/max range in seconds.
            </p>
          </div>

          {/* Tool */}
          <PageAds>
            <RevenueCalculatorClient />
          </PageAds>

          {/* How to read results — below tool */}
          <div className="mt-10 bg-white border border-[#E0D9CE] rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-[#1A1612] mb-3">How to Read Your Results</h2>
            <p className="text-sm text-[#8A7F72] leading-relaxed">
              The calculator shows a <strong className="text-[#1A1612]">Low / Typical / High</strong> range — not a single number. Low = Tier 3 audience + low-CPM niche + Q1 seasonality. Typical = mixed audience + your selected niche average. High = majority Tier 1 audience + Q4 ad spend spike. Your actual RPM is visible in YouTube Studio → Analytics → Revenue. These estimates are benchmarks, not guarantees.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <RevenueCalculatorContent />
    </>
  )
}
