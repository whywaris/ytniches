import type { Metadata } from 'next'
import { WordCounterClient } from '@/components/tools/WordCounterClient'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Video Word Counter — Script Length Calculator Free',
  description: 'Count words in your YouTube video script and estimate video duration. Plan the perfect video length for your niche.',
  alternates: { canonical: 'https://ytniches.com/youtube-word-counter' },
}

export default function YouTubeWordCounterPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
            YouTube Video Word Counter
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Paste your script to count words and estimate video duration. Plan the perfect video length.
          </p>
        </div>
        <PageAds>
          <WordCounterClient />
        </PageAds>
      </div>
    </div>
  )
}
