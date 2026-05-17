import type { Metadata } from 'next'
import { TimestampGeneratorClient } from '@/components/tools/TimestampGeneratorClient'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Timestamp Generator — Create Chapters Free',
  description: 'Generate YouTube timestamps and chapters for your videos. Improve watch time and viewer experience with organized video chapters.',
  alternates: { canonical: 'https://ytniches.com/youtube-timestamp-generator' },
}

export default function YouTubeTimestampGeneratorPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
            YouTube Timestamp Generator
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Create formatted timestamps and chapters for your YouTube videos. Boost watch time and SEO.
          </p>
        </div>
        <PageAds>
          <TimestampGeneratorClient />
        </PageAds>
      </div>
    </div>
  )
}
