import type { Metadata } from 'next'
import { ThumbnailResizerClient } from './ThumbnailResizerClient'

export const metadata: Metadata = {
  title: 'YouTube Thumbnail Resizer — Resize to 1280×720 Free | YTNiches',
  description:
    'Resize any image to the perfect YouTube thumbnail size (1280×720 px). Supports fill, fit, and stretch modes. Download as PNG instantly — free, no signup required.',
  openGraph: {
    title: 'YouTube Thumbnail Resizer | YTNiches',
    description:
      'Resize images to perfect YouTube thumbnail dimensions (1280×720). Free, instant, no upload.',
    url: 'https://ytniches.com/thumbnail-resizer',
    type: 'website',
  },
  alternates: { canonical: 'https://ytniches.com/thumbnail-resizer' },
}

export default function ThumbnailResizerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'YouTube Thumbnail Resizer',
            description:
              'Resize any image to perfect YouTube thumbnail dimensions (1280×720) instantly.',
            url: 'https://ytniches.com/thumbnail-resizer',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <ThumbnailResizerClient />
    </>
  )
}
