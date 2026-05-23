import type { Metadata } from 'next'
import { WordCounterClient } from '@/components/tools/WordCounterClient'
import { VideoWordCounterContent } from '@/components/tools/VideoWordCounterContent'
import { BackToTop } from '@/components/shared/BackToTop'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Video Word Counter — Free Transcript Stats',
  description:
    'Count words in any YouTube video instantly. Get word count, speaking rate, reading time, and transcript stats free. Paste a URL — results in seconds. No signup.',
  alternates: {
    canonical: 'https://ytniches.com/tools/video-word-counter',
  },
  openGraph: {
    title: 'YouTube Video Word Counter — Free Transcript Stats',
    description:
      'Free YouTube video word counter for creators, translators & content teams. Get word count, WPM, and script stats from any YouTube URL. No signup needed.',
    url: 'https://ytniches.com/tools/video-word-counter',
    siteName: 'YTNiches',
    images: [{ url: '/og/video-word-counter.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Video Word Counter — Free',
    description:
      'Count words, speaking rate, and reading time from any YouTube video. Free, no signup.',
    images: ['/og/video-word-counter.png'],
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Video Word Counter',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free YouTube video word counter that extracts transcript data and returns word count, character count, speaking rate (WPM), and reading time for any public YouTube video. No signup required.',
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'YouTube Video Word Counter — Count Words, Speaking Rate & Script Stats Free',
  datePublished: '2026-01-01',
  dateModified: '2026-05-01',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches', url: 'https://ytniches.com' },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Count Words in a YouTube Video',
  totalTime: 'PT1M',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Copy the YouTube video URL',
      text: "Go to any public YouTube video. Copy the URL from your browser's address bar, or tap Share → Copy link on mobile.",
    },
    {
      '@type': 'HowToStep',
      name: 'Paste the URL into the word counter',
      text: 'Paste the YouTube video URL into the word counter tool above and click Analyze.',
    },
    {
      '@type': 'HowToStep',
      name: 'Review your results',
      text: 'Your results show the total word count, character count, estimated speaking rate (WPM), reading time, and transcript statistics for that video.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How many words are in a 10-minute YouTube video?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A 10-minute YouTube video typically contains 1,100–1,700 words depending on speaking pace. At the average rate of 130–150 WPM: approximately 1,300–1,500 words.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I count words spoken in a YouTube video?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the free YouTube video word counter above — paste the video URL and get the exact word count from the transcript in seconds. Or manually open the transcript and paste into a word processor.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the average speaking rate for YouTube videos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The average YouTube creator speaks at 130–160 WPM. Educational channels: 120–140 WPM. Gaming: 150–180 WPM. Vlogs: 110–140 WPM.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long should a YouTube video script be?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Multiply target video length in minutes by your WPM. A 10-minute video at 140 WPM = 1,400-word script. A 5-minute video needs 600–800 words.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many words is a 5-minute video?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A 5-minute YouTube video typically contains 550–850 spoken words. At average pace (130–150 WPM): approximately 650–750 words.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I count words in a YouTube video for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — the YouTube video word counter at the top of this page is completely free. Paste any public YouTube video URL for instant results. No signup needed.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many words per minute do YouTubers speak?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'YouTube creators average 130–160 WPM. Educational: 120–140, news: 150–170, vlogs: 110–140, gaming: 150–180, ASMR: 60–90 WPM.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get a transcript word count from YouTube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Paste the YouTube URL into the free word counter above for automatic extraction. Or manually: click three-dot menu → Open transcript → copy text → paste into Google Docs → Tools → Word count.",
      },
    },
  ],
}

export default function YouTubeWordCounterPage() {
  return (
    <>
      <BackToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* H1 + Introduction */}
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
              YouTube Video Word Counter
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto mb-4">
              This free YouTube video word counter returns word count,
              character count, speaking rate (WPM), and reading time from any public video. Creators
              use it to plan scripts. Translators use it to price jobs. Content teams use it to estimate
              repurposing output. Paste any YouTube URL above to start — or scroll down for the complete
              word count benchmark guide.
            </p>
            {/* Trust Callout */}
            <div className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-[#16A34A] font-medium">
              <span>✓ No signup required</span>
              <span>✓ Works on any public video</span>
              <span>✓ Timestamps auto-stripped</span>
              <span>✓ Free forever</span>
            </div>
          </div>

          <PageAds>
            <WordCounterClient />
          </PageAds>
        </div>
      </div>

      {/* SEO Content Below Tool */}
      <VideoWordCounterContent />
    </>
  )
}
