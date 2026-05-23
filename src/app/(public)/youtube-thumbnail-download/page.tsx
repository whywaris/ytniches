import type { Metadata } from 'next'
import { ThumbnailDownloaderClient } from '@/components/tools/ThumbnailDownloaderClient'
import { ThumbnailDownloaderContent } from '@/components/tools/ThumbnailDownloaderContent'
import { BackToTop } from '@/components/shared/BackToTop'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Thumbnail Downloader — Free HD & 4K',
  description:
    'Download any YouTube thumbnail free — HD 1280×720, SD, HQ, and Default sizes. Works for Shorts. No signup, no watermarks. Paste URL and save in seconds.',
  alternates: { canonical: 'https://ytniches.com/youtube-thumbnail-download' },
  openGraph: {
    title: 'YouTube Thumbnail Downloader — Free HD & 4K',
    description: 'Download any YouTube thumbnail free — HD 1280×720, SD, HQ, and Default sizes. Works for Shorts. No signup, no watermarks.',
    url: 'https://ytniches.com/youtube-thumbnail-download',
    type: 'website',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Thumbnail Downloader',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free tool to download YouTube thumbnails in HD, SD, HQ, and Default resolutions. Works for YouTube Shorts. No signup required.',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I download a YouTube thumbnail?', acceptedAnswer: { '@type': 'Answer', text: 'Copy the YouTube video URL, paste it into the tool, and click the download button on your preferred resolution. The image saves directly to your device.' } },
    { '@type': 'Question', name: 'Is it legal to download YouTube thumbnails?', acceptedAnswer: { '@type': 'Answer', text: 'For personal reference and research, yes. Thumbnails are publicly accessible images. You cannot republish them as your own work or use them commercially without permission.' } },
    { '@type': 'Question', name: 'What size is a YouTube thumbnail in HD?', acceptedAnswer: { '@type': 'Answer', text: 'The HD YouTube thumbnail (maxresdefault) is 1280×720 pixels with a 16:9 aspect ratio.' } },
    { '@type': 'Question', name: 'Can I download thumbnails from YouTube Shorts?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste the Shorts URL into the tool. Most Shorts use auto-generated thumbnails from a video frame rather than custom uploads.' } },
    { '@type': 'Question', name: 'Why is no HD thumbnail available for some videos?', acceptedAnswer: { '@type': 'Answer', text: 'Videos uploaded before 2009, videos with auto-generated thumbnails, and some unlisted videos do not have a maxresdefault file.' } },
    { '@type': 'Question', name: 'How do I get the maxresdefault thumbnail URL directly?', acceptedAnswer: { '@type': 'Answer', text: 'Use the pattern: https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg — replace VIDEO_ID with the 11-character ID from the YouTube URL.' } },
    { '@type': 'Question', name: 'Can I use downloaded YouTube thumbnails for my own content?', acceptedAnswer: { '@type': 'Answer', text: 'You can use them as design reference and inspiration. You cannot copy them directly for your own videos or commercial use without permission.' } },
  ],
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Download a YouTube Thumbnail',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Copy the YouTube video URL', text: 'Copy the full URL from the address bar or use the Share button on mobile.' },
    { '@type': 'HowToStep', position: 2, name: 'Paste it into the tool', text: 'Paste the URL into the input field. The tool automatically detects the video ID and fetches all available resolutions.' },
    { '@type': 'HowToStep', position: 3, name: 'Choose your resolution and download', text: 'Click the download button on your preferred resolution. The image saves directly to your device.' },
  ],
}

export default function YouTubeThumbnailDownloadPage() {
  return (
    <>
      <BackToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

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

            {/* How it works — quick visual */}
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

      {/* SEO Content */}
      <ThumbnailDownloaderContent />
    </>
  )
}
