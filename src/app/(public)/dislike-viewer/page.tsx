import type { Metadata } from 'next'
import { DislikeClient } from './DislikeClient'
import { DislikeViewerContent } from '@/components/tools/DislikeViewerContent'

export const metadata: Metadata = {
  title: 'Free YouTube Dislike Viewer — No Extension Needed',
  description:
    "See hidden dislikes on any YouTube video instantly. Free YouTube dislike viewer — no extension, no login. Works on mobile and YouTube Shorts.",
  alternates: { canonical: 'https://ytniches.com/dislike-viewer' },
  openGraph: {
    title: 'Free YouTube Dislike Viewer — No Extension Needed',
    description: 'Check YouTube dislike counts in seconds. Shows estimated dislikes, likes, and like-to-dislike ratio for any public video.',
    url: 'https://ytniches.com/dislike-viewer',
    siteName: 'YTNiches',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free YouTube Dislike Viewer — No Extension Needed',
    description: 'See hidden YouTube dislikes instantly. No install, no login. Works on mobile.',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Dislike Viewer',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free web tool to view hidden YouTube dislike counts for any public video. No extension or login required.',
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'YouTube Dislike Viewer: See Hidden Dislikes on Any Video (2026)',
  datePublished: '2026-01-01',
  dateModified: '2026-05-01',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches', url: 'https://ytniches.com' },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to View Hidden YouTube Dislikes',
  step: [
    { '@type': 'HowToStep', name: 'Copy the YouTube video URL', text: "Copy the URL from your browser's address bar, or tap Share → Copy link on mobile." },
    { '@type': 'HowToStep', name: 'Paste it into the dislike viewer', text: "Paste the video URL into the tool above and click 'View Dislikes'." },
    { '@type': 'HowToStep', name: 'Read your results', text: 'Results show estimated dislike count, like count, like-to-dislike ratio, and total view count.' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I see dislikes on YouTube without an extension?', acceptedAnswer: { '@type': 'Answer', text: 'Paste the video URL into the dislike viewer tool and click View Dislikes. No extension, no login needed.' } },
    { '@type': 'Question', name: 'Is Return YouTube Dislike accurate?', acceptedAnswer: { '@type': 'Answer', text: 'Highly accurate for pre-2021 videos. For newer videos, estimates are extrapolated from extension user data.' } },
    { '@type': 'Question', name: 'Can you still see dislikes on YouTube in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — via third-party tools and the Return YouTube Dislike extension. Creators see exact counts in YouTube Studio.' } },
    { '@type': 'Question', name: 'How do I see dislikes on YouTube mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Use this web tool in any mobile browser. Copy the video URL from the YouTube app, paste it here, tap View Dislikes.' } },
    { '@type': 'Question', name: 'Why did YouTube remove the dislike count?', acceptedAnswer: { '@type': 'Answer', text: 'YouTube cited protection from coordinated dislike attacks. The button still exists; only the public count was hidden.' } },
    { '@type': 'Question', name: 'Can creators see their own dislikes?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — YouTube Studio → Analytics → Engagement tab shows exact dislike counts for channel owners.' } },
    { '@type': 'Question', name: 'Does the YouTube dislike viewer work on Shorts?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — paste any youtube.com/shorts/VIDEO_ID URL. Post-2021 Shorts estimates are directional, not exact.' } },
    { '@type': 'Question', name: "Is using a YouTube dislike viewer against YouTube's Terms of Service?", acceptedAnswer: { '@type': 'Answer', text: 'No. This tool uses the Return YouTube Dislike API — archived data and voluntarily shared extension data. No ToS violation.' } },
  ],
}

export default function DislikeViewerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Tool above the fold */}
      <DislikeClient />

      {/* SEO Content below tool */}
      <DislikeViewerContent />
    </>
  )
}
