import type { Metadata } from 'next'
import { TagExtractorClient } from './TagExtractorClient'
import { TagExtractorContent } from '@/components/tools/TagExtractorContent'

export const metadata: Metadata = {
  title: "YouTube Tag Extractor – See Any Video's Hidden Tags Free",
  description:
    "Extract hidden tags from any YouTube video instantly. Use our free YouTube tag extractor to research competitors and optimize your video SEO strategy.",
  alternates: { canonical: 'https://ytniches.com/tag-extractor' },
  openGraph: {
    title: "YouTube Tag Extractor – See Any Video's Hidden Tags Free",
    description: 'Extract hidden tags from any YouTube video instantly. Free tool — no sign-up. Research competitor keywords and boost your video SEO.',
    url: 'https://ytniches.com/tag-extractor',
    siteName: 'YTNiches',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "YouTube Tag Extractor – See Any Video's Hidden Tags Free",
    description: 'Extract hidden tags from any YouTube video instantly. Free, no signup.',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "YouTube Tag Extractor: See Any Video's Hidden Tags in Seconds (Free Tool)",
  datePublished: '2026-01-01',
  dateModified: '2026-05-01',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches', url: 'https://ytniches.com' },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I extract tags from a YouTube video?', acceptedAnswer: { '@type': 'Answer', text: "Paste the YouTube video URL into the tag extractor tool and click Extract. Tags are retrieved via YouTube's Data API in 1–2 seconds." } },
    { '@type': 'Question', name: 'Are YouTube tags still important in 2025?', acceptedAnswer: { '@type': 'Answer', text: 'Less important than before, but not irrelevant. They help with misspelling coverage, topic clustering, and competitor research.' } },
    { '@type': 'Question', name: 'How many tags should a YouTube video have?', acceptedAnswer: { '@type': 'Answer', text: '5–8 focused, relevant tags. YouTube allows 500 total characters. Put your most important keyword as the first tag.' } },
    { '@type': 'Question', name: "Can you see someone else's YouTube tags?", acceptedAnswer: { '@type': 'Answer', text: "Yes — tags exist in the video's page source HTML. A tag extractor retrieves them automatically." } },
    { '@type': 'Question', name: "What's the difference between YouTube tags and hashtags?", acceptedAnswer: { '@type': 'Answer', text: 'Tags are hidden backend metadata. Hashtags are visible text in descriptions starting with #. They serve different purposes.' } },
    { '@type': 'Question', name: 'How do I find the best tags for my YouTube video?', acceptedAnswer: { '@type': 'Answer', text: 'Extract tags from top-ranking videos for your keyword. Use the 3-tier structure: exact keyword → topic cluster → brand tags.' } },
    { '@type': 'Question', name: 'Does YouTube penalize for wrong tags?', acceptedAnswer: { '@type': 'Answer', text: 'No ranking penalty, but misleading tags are ignored. In extreme cases, videos can be removed from search.' } },
  ],
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Extract YouTube Video Tags',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Copy the YouTube video URL', text: "Copy from your browser's address bar or the Share button." },
    { '@type': 'HowToStep', position: 2, name: 'Paste the URL into the tool', text: 'Paste the URL into the YouTube Tag Extractor tool above.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Extract', text: 'All hidden tags from that video will appear instantly.' },
    { '@type': 'HowToStep', position: 4, name: 'Copy, filter, or export', text: 'Select tags you want, then copy or export your results.' },
  ],
}

export default function TagExtractorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      {/* Tool — above the fold */}
      <TagExtractorClient />

      {/* SEO Content — below tool */}
      <TagExtractorContent />
    </>
  )
}
