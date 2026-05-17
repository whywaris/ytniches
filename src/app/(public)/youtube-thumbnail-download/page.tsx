import type { Metadata } from 'next'
import { ThumbnailDownloaderClient } from '@/components/tools/ThumbnailDownloaderClient'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Thumbnail Downloader — Download HD Thumbnails Free',
  description:
    'Download YouTube video thumbnails in full HD quality. Just paste the video URL and get all thumbnail sizes instantly. 100% free.',
  alternates: { canonical: 'https://ytniches.com/youtube-thumbnail-download' },
}

export default function YouTubeThumbnailDownloadPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
            YouTube Thumbnail Downloader
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Download any YouTube video thumbnail in HD. Paste the video URL below and get all available sizes.
          </p>
        </div>

        <PageAds>
          {/* Tool */}
          <ThumbnailDownloaderClient />

          {/* How it works */}
          <div className="mt-16">
            <h2 className="font-display font-bold text-2xl text-foreground mb-6 text-center">
              How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Paste URL', desc: 'Copy any YouTube video URL and paste it above.' },
                { step: '2', title: 'Get Thumbnails', desc: 'We fetch all available thumbnail sizes instantly.' },
                { step: '3', title: 'Download', desc: 'Click to download in your preferred resolution.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-accent text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </PageAds>
      </div>
    </div>
  )
}
