import type { Metadata } from 'next'
import { SubscribeLinkGeneratorClient } from '@/components/tools/SubscribeLinkGeneratorClient'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Subscribe Link Generator — Auto-Subscribe URL Free',
  description: 'Generate a YouTube subscribe link that auto-opens the subscribe popup. Boost your subscriber count with one-click subscribe URLs.',
  alternates: { canonical: 'https://ytniches.com/youtube-subscribe-link-generator' },
}

export default function YouTubeSubscribeLinkGeneratorPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
            YouTube Subscribe Link Generator
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Create a direct subscribe link that auto-opens the subscribe confirmation popup for your channel.
          </p>
        </div>
        <PageAds>
          <SubscribeLinkGeneratorClient />
        </PageAds>
      </div>
    </div>
  )
}
