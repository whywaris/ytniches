import type { Metadata } from 'next'
import { TimestampGeneratorClient } from '@/components/tools/TimestampGeneratorClient'
import { TimestampGeneratorContent } from '@/components/tools/TimestampGeneratorContent'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'Free YouTube Timestamp Generator — AI Video Chapters',
  description:
    'Generate AI timestamps for your YouTube videos in seconds. Free tool — paste URL, copy chapters, boost SEO. Add video chapters that rank in Google Key Moments.',
  alternates: {
    canonical: 'https://ytniches.com/tools/timestamp-generator',
  },
  openGraph: {
    title: 'Free YouTube Timestamp Generator — AI Video Chapters',
    description:
      'Stop manually writing timestamps. Free AI YouTube timestamp generator creates video chapters instantly. Improve retention, SEO, and viewer experience. No signup.',
    url: 'https://ytniches.com/tools/timestamp-generator',
    siteName: 'YTNiches',
    images: [{ url: '/og/timestamp-generator.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free YouTube Timestamp Generator — AI Video Chapters',
    description:
      'AI-generated YouTube timestamps in 30 seconds. Free, no signup. Boost retention and rank in Google Key Moments.',
    images: ['/og/timestamp-generator.png'],
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Timestamp Generator',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free AI YouTube timestamp generator that creates video chapter markers for YouTube descriptions. Improves viewer retention and helps videos rank in Google Key Moments. No signup required.',
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'YouTube Timestamp Generator: Free AI Tool for Video Chapters + Complete SEO Guide',
  datePublished: '2026-01-01',
  dateModified: '2026-05-01',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches', url: 'https://ytniches.com' },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Add Timestamps to a YouTube Video',
  totalTime: 'PT2M',
  step: [
    {
      '@type': 'HowToStep',
      name: "Paste your YouTube video URL into the generator",
      text: "Copy the URL of your published YouTube video from your browser's address bar and paste it into the timestamp generator above.",
    },
    {
      '@type': 'HowToStep',
      name: 'Generate and review your timestamps',
      text: "Click Generate. The tool creates chapter timestamps based on your video's content. Review the suggested chapter titles and adjust any that need rewording.",
    },
    {
      '@type': 'HowToStep',
      name: 'Copy the timestamp list',
      text: "Click Copy to copy the complete timestamp list in YouTube's required format: 0:00 Chapter Title / 1:45 Next Chapter.",
    },
    {
      '@type': 'HowToStep',
      name: 'Paste into YouTube Studio description',
      text: 'Open YouTube Studio → select your video → click Details → paste the timestamp list into the Description field. Make sure 0:00 is included (required for chapters to activate).',
    },
    {
      '@type': 'HowToStep',
      name: 'Save and verify chapters appear',
      text: 'Click Save in YouTube Studio. Open your video on YouTube and check that chapter markers appear in the progress bar within 5–10 minutes.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I create timestamps for YouTube videos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Three options: (1) Use an AI timestamp generator — paste your video URL and get formatted chapter timestamps in 30 seconds. (2) Write timestamps manually in 0:00 Title format. (3) Let YouTube auto-generate chapters — but you have no control over titles.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a YouTube timestamp generator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A tool that creates the chapter timestamp list you paste into your video's description on YouTube Studio. It outputs formatted timestamps that create visual chapter markers in the progress bar and appear as Key Moments in Google Search.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does adding timestamps to YouTube videos help SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — chapter timestamps create Key Moments in Google Search results, giving your video multiple click opportunities per search. Videos with chapters see 20–30% higher average view duration, which is a direct YouTube ranking signal.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I make a clickable timestamp link on YouTube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Right-click the video progress bar on desktop → 'Copy video URL at current time.' On mobile: long-press → 'Share at this time.' Or manually append ?t=SECONDS to any YouTube URL.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I generate YouTube chapters automatically?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — use an AI timestamp generator like this one, or rely on YouTube's automatic chapters feature. AI generators give you full control over chapter naming for SEO.",
      },
    },
    {
      '@type': 'Question',
      name: 'How do you format timestamps in a YouTube description?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The required format is M:SS Chapter Title on its own line. First timestamp must be 0:00, minimum 3 timestamps, each chapter at least 10 seconds long, video at least 10 minutes. Wrong format causes silent failure.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum timestamp length for YouTube chapters?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each chapter must be at least 10 seconds long. The video must be at least 10 minutes long. You need minimum 3 timestamps total, and the first must be 0:00.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I share a YouTube video starting at a specific time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Three methods: (1) Desktop: right-click progress bar → 'Copy video URL at current time.' (2) Mobile: long-press → 'Share at this time.' (3) Manual: append ?t=SECONDS to the URL.",
      },
    },
  ],
}

export default function YouTubeTimestampGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* H1 + Introduction */}
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
              YouTube Timestamp Generator
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Manually writing timestamps for a 30-minute video takes 30–60 minutes. This free AI
              YouTube timestamp generator does it in 30 seconds. Generate chapter timestamps instantly,
              then learn how to use them for SEO. Works for video chapters (description) and timestamped
              share links. YouTube chapters also help your video rank in Google&apos;s &ldquo;Key
              Moments&rdquo; search results — most creators don&apos;t know this.
            </p>
          </div>

          <PageAds>
            <TimestampGeneratorClient />
          </PageAds>
        </div>
      </div>

      {/* SEO Content Below Tool */}
      <TimestampGeneratorContent />
    </>
  )
}
