import type { Metadata } from 'next'
import { DislikeClient } from './DislikeClient'

export const metadata: Metadata = {
  title: 'YouTube Dislike Viewer — See Video Dislikes',
  description:
    'View the estimated dislike count on any YouTube video. Uses Return YouTube Dislike API.',
  openGraph: {
    title: 'YouTube Dislike Viewer — See Video Dislikes',
    description: 'View the estimated dislike count on any YouTube video.',
    url: 'https://ytniches.com/dislike-viewer',
    type: 'website',
  },
  alternates: { canonical: 'https://ytniches.com/dislike-viewer' },
}

export default function DislikeViewerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'YouTube Dislike Viewer',
            description:
              'View the estimated dislike count on any YouTube video using the Return YouTube Dislike API.',
            url: 'https://ytniches.com/dislike-viewer',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <DislikeClient />
    </>
  )
}
