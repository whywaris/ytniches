import type { Metadata } from 'next'
import { EmbedCodeGeneratorClient } from '@/components/tools/EmbedCodeGeneratorClient'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Embed Code Generator — Custom Embed Free',
  description: 'Generate custom YouTube embed codes with autoplay, loop, start time, and responsive options. Copy and paste into your website.',
  alternates: { canonical: 'https://ytniches.com/youtube-embed-code-generator' },
}

export default function YouTubeEmbedCodeGeneratorPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
            YouTube Embed Code Generator
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Generate custom embed codes for YouTube videos with autoplay, loop, start time, and more.
          </p>
        </div>
        <PageAds>
          <EmbedCodeGeneratorClient />
        </PageAds>
      </div>
    </div>
  )
}
