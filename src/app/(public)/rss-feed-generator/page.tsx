import type { Metadata } from 'next'
import { RssFeedClient } from './RssFeedClient'
import { RSSFeedGeneratorContent } from '@/components/tools/RSSFeedGeneratorContent'
import { BackToTop } from '@/components/shared/BackToTop'

export const metadata: Metadata = {
  title: 'YouTube RSS Feed Generator — Free, Instant, No Login',
  description:
    'Generate a YouTube RSS feed for any channel or playlist in seconds — no signup, no API key. Paste a URL, get your RSS link. Works with Feedly, Zapier & more.',
  alternates: { canonical: 'https://ytniches.com/rss-feed-generator' },
  openGraph: {
    title: 'YouTube RSS Feed Generator — Free, Instant, No Login',
    description: 'Convert any YouTube channel, playlist, or @handle into an RSS link instantly. No account needed.',
    url: 'https://ytniches.com/rss-feed-generator',
    siteName: 'YTNiches',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube RSS Feed Generator — Free, No Login',
    description: 'Paste any YouTube channel URL or @handle and get an instant RSS link. Free, no signup.',
  },
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'YouTube RSS Feed Generator',
  applicationCategory: 'WebApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free tool to generate YouTube RSS feed URLs for any channel, playlist, or @handle. No signup or API key required.',
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "YouTube RSS Feed Generator — Get Any Channel's RSS Link Instantly (Free)",
  datePublished: '2026-01-01',
  dateModified: '2026-05-01',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches', url: 'https://ytniches.com' },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: "How to Get a YouTube Channel's RSS Feed",
  step: [
    { '@type': 'HowToStep', name: 'Use the generator tool', text: 'Paste any YouTube channel URL, @handle, or video URL into the RSS Feed Generator above and click Generate.' },
    { '@type': 'HowToStep', name: 'Find your Channel ID manually', text: "Go to YouTube Studio → Settings → Channel → Basic Info. Your Channel ID starts with 'UC' and is 24 characters." },
    { '@type': 'HowToStep', name: 'Build the RSS URL directly', text: 'Use: https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I get the RSS feed for a YouTube channel?', acceptedAnswer: { '@type': 'Answer', text: 'Paste the channel URL into the generator and click Generate. Or use: youtube.com/feeds/videos.xml?channel_id=YOUR_ID' } },
    { '@type': 'Question', name: 'Does YouTube still support RSS feeds in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. YouTube removed the visible RSS button in 2013 but the feeds still work for every public channel.' } },
    { '@type': 'Question', name: 'What is the YouTube RSS feed URL format?', acceptedAnswer: { '@type': 'Answer', text: 'youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID (24 chars starting with UC). For playlists: ?playlist_id=PLAYLIST_ID' } },
    { '@type': 'Question', name: 'How do I find my YouTube channel ID for RSS?', acceptedAnswer: { '@type': 'Answer', text: "YouTube Studio → Settings → Channel → Basic Info. Starts with 'UC', exactly 24 characters." } },
    { '@type': 'Question', name: 'Can I get an RSS feed for a YouTube playlist?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use: youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID. Find the ID in the playlist URL after list=.' } },
    { '@type': 'Question', name: 'How do I add a YouTube RSS feed to Feedly?', acceptedAnswer: { '@type': 'Answer', text: "In Feedly: Add Content → RSS Feed → paste URL → Follow. Videos appear within 15–60 minutes." } },
    { '@type': 'Question', name: 'What is the difference between YouTube RSS and YouTube subscription?', acceptedAnswer: { '@type': 'Answer', text: 'Subscriptions are algorithm-controlled. RSS gives chronological, unfiltered feed of every video published.' } },
    { '@type': 'Question', name: 'Can I use YouTube RSS with Zapier or IFTTT?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use RSS trigger in Zapier/Make/IFTTT — paste your YouTube RSS URL, no API key needed.' } },
  ],
}

export default function RssFeedGeneratorPage() {
  return (
    <>
      <BackToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Tool above the fold */}
      <RssFeedClient />

      {/* SEO Content below tool */}
      <RSSFeedGeneratorContent />
    </>
  )
}
