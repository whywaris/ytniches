import type { Metadata } from 'next'
import { WatchTimeClient } from './WatchTimeClient'
import { WatchTimeCalculatorContent } from '@/components/tools/WatchTimeCalculatorContent'
import { BackToTop } from '@/components/shared/BackToTop'

export const metadata: Metadata = {
  title: 'YouTube Watch Time Calculator | Track 4,000 Hours',
  description:
    'Free YouTube watch time calculator. Enter your avg view duration → get exact views needed for monetization. Covers Shorts rules, deleted videos, and live stream tips.',
  alternates: {
    canonical: 'https://ytniches.com/tools/watch-time-calculator',
  },
  openGraph: {
    title: 'YouTube Watch Time Calculator — Track Your 4,000 Hours Progress Free',
    description:
      'Calculate exactly how many views you need for 4,000 YouTube watch hours. Free tool — enter your avg watch time and see your monetization timeline instantly.',
    url: 'https://ytniches.com/tools/watch-time-calculator',
    siteName: 'YTNiches',
    images: [{ url: '/og/watch-time-calculator.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Watch Time Calculator — Free',
    description:
      'How many views do you need for 4,000 watch hours? Enter your avg watch duration and get the exact number instantly.',
    images: ['/og/watch-time-calculator.png'],
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Watch Time Calculator',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free YouTube watch time calculator. Enter your current watch hours, average view duration, and daily views to calculate exact views needed for 4,000 hours and your estimated days to YouTube monetization.',
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'YouTube Watch Time Calculator — Track Your 4,000 Hours Progress Free',
  datePublished: '2026-01-01',
  dateModified: '2026-05-01',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches', url: 'https://ytniches.com' },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Reach 4,000 YouTube Watch Hours Faster',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Use live streams to accumulate watch time rapidly',
      text: 'A 3-hour live stream with 50 concurrent viewers generates 150 watch hours in a single session — equivalent to 150 individual 60-minute video views.',
    },
    {
      '@type': 'HowToStep',
      name: 'Improve your first 30 seconds to boost retention',
      text: "Hook your viewers in the first 30 seconds. YouTube's algorithm uses average view duration as a ranking signal. Higher retention = more watch time per view = fewer views needed to hit 4,000 hours.",
    },
    {
      '@type': 'HowToStep',
      name: 'Create playlists to extend session watch time',
      text: 'Auto-play playlists keep viewers watching consecutive videos. A viewer who watches 3 videos back-to-back from your playlist generates 3× the watch time of a single video viewer.',
    },
    {
      '@type': 'HowToStep',
      name: "Target video lengths that match your niche's retention curve",
      text: "8–15 minute videos consistently achieve higher total watch time per video than shorter or longer content for most creator niches. Match your video length to your audience's typical viewing session.",
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How many views do you need for 4,000 watch hours?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It depends on your average view duration. At 3 minutes: ~80,000 views. At 5 minutes: ~48,000 views. At 10 minutes: ~24,000 views. Formula: 240,000 ÷ avg view duration in minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does YouTube Shorts watch time count toward monetization?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No — YouTube Shorts watch time does NOT count toward the 4,000-hour YPP requirement. Only watch time from regular public videos counts.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to get 4,000 watch hours on YouTube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It varies widely. A channel posting 3 videos/week at 500 views each with 4-minute avg duration earns ~100 hours/month — reaching 4,000 hours in ~40 months. Live streams and higher viewership can cut this to 6–12 months.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do deleted YouTube videos lose watch hours?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — immediately. When you delete a public video, its watch time is removed from your rolling 365-day total. Check watch time contribution before deleting.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does rewatching count as watch time on YouTube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Genuine rewatches from real viewers count. However, YouTube detects and discounts artificial inflation — repeatedly watching your own videos violates Terms of Service.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I check my watch hours in YouTube Studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "YouTube Studio → Analytics → Overview → change date range to 'Last 365 days' → find 'Watch time (hours)' card. Or go to Earn → Get started for the YPP progress bar.",
      },
    },
    {
      '@type': 'Question',
      name: 'What happens to watch hours after 12 months?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Watch hours older than 365 days are automatically removed from your rolling YPP total. YouTube uses a rolling 12-month window, not a calendar year.',
      },
    },
  ],
}

export default function WatchTimeCalculatorPage() {
  return (
    <>
      <BackToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* H1 + Introduction */}
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
              YouTube Watch Time Calculator
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto mb-4">
              You need 4,000 public watch hours in the last 12 months to join the YouTube Partner
              Program. This YouTube watch time calculator tells you the exact number of views your
              channel needs — based on your real average watch time. Before you start: YouTube Shorts
              watch time does NOT count toward the 4,000 hours. Enter your numbers above — results
              are instant.
            </p>
            {/* Trust Callout */}
            <div className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-[#16A34A] font-medium">
              <span>✓ No signup required</span>
              <span>✓ Based on official YPP requirements</span>
              <span>✓ Free forever</span>
            </div>
          </div>

          {/* Tool Embed */}
          <WatchTimeClient />
        </div>
      </div>

      {/* SEO Content Below Tool */}
      <WatchTimeCalculatorContent />
    </>
  )
}
