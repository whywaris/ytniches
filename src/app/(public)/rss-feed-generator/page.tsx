import type { Metadata } from 'next'
import { RssFeedClient } from './RssFeedClient'

export const metadata: Metadata = {
  title: 'YouTube RSS Feed Generator — Get Channel RSS URL | YTNiches',
  description:
    'Generate the RSS feed URL for any YouTube channel. Paste a channel URL or handle and get a ready-to-use RSS link for your feed reader or automation tool.',
  openGraph: {
    title: 'YouTube RSS Feed Generator | YTNiches',
    description: 'Get the RSS feed URL for any YouTube channel instantly. Free tool.',
    url: 'https://ytniches.com/rss-feed-generator',
    type: 'website',
  },
  alternates: { canonical: 'https://ytniches.com/rss-feed-generator' },
}

export default function RssFeedGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'YouTube RSS Feed Generator',
            description:
              'Generate the RSS feed URL for any YouTube channel instantly.',
            url: 'https://ytniches.com/rss-feed-generator',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <RssFeedClient />
    </>
  )
}
