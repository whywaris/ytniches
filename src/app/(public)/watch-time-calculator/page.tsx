import type { Metadata } from 'next'
import { WatchTimeClient } from './WatchTimeClient'

export const metadata: Metadata = {
  title: 'YouTube Watch Time Calculator — Reach 4,000 Hours Faster | YTNiches',
  description:
    'Calculate exactly when you\'ll hit YouTube\'s 4,000 watch hour monetization requirement. Enter your upload schedule and average views to get a personalized timeline.',
  openGraph: {
    title: 'YouTube Watch Time Calculator | YTNiches',
    description:
      'Calculate when you\'ll reach 4,000 watch hours for YouTube monetization. Free calculator.',
    url: 'https://ytniches.com/watch-time-calculator',
    type: 'website',
  },
  alternates: { canonical: 'https://ytniches.com/watch-time-calculator' },
}

export default function WatchTimeCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'YouTube Watch Time Calculator',
            description:
              'Calculate when you\'ll reach 4,000 watch hours for YouTube monetization.',
            url: 'https://ytniches.com/watch-time-calculator',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <WatchTimeClient />
    </>
  )
}
