import type { Metadata } from 'next'
import { CommentPickerClient } from './CommentPickerClient'

export const metadata: Metadata = {
  title: 'YouTube Random Comment Picker — Fair Giveaway Winner',
  description:
    'Pick a fair random winner from YouTube comments for giveaways and contests. Paste any YouTube video URL and instantly select a random commenter.',
  openGraph: {
    title: 'YouTube Random Comment Picker',
    description: 'Pick a random comment winner from any YouTube video. Free giveaway tool.',
    url: 'https://ytniches.com/random-comment-picker',
    type: 'website',
  },
  alternates: { canonical: 'https://ytniches.com/random-comment-picker' },
}

export default function RandomCommentPickerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'YouTube Random Comment Picker',
            description:
              'Pick a fair random winner from YouTube comments for giveaways and contests.',
            url: 'https://ytniches.com/random-comment-picker',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <CommentPickerClient />
    </>
  )
}
