import type { Metadata } from 'next'
import { TagExtractorClient } from './TagExtractorClient'

export const metadata: Metadata = {
  title: 'YouTube Tag Extractor — Extract Tags from Any Video',
  description:
    'Extract tags from any YouTube video instantly. Paste a YouTube URL and see all hidden tags used by top creators. Free YouTube tag extractor tool.',
  openGraph: {
    title: 'YouTube Tag Extractor — Free Tool',
    description:
      'Extract hidden tags from any YouTube video. See which keywords top creators target.',
    url: 'https://ytniches.com/tag-extractor',
    type: 'website',
  },
  alternates: { canonical: 'https://ytniches.com/tag-extractor' },
}

export default function TagExtractorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'YouTube Tag Extractor',
            description: 'Extract hidden tags from any YouTube video instantly.',
            url: 'https://ytniches.com/tag-extractor',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <TagExtractorClient />
    </>
  )
}
