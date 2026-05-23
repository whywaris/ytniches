import type { Metadata } from 'next'
import { SubscribeLinkGeneratorClient } from '@/components/tools/SubscribeLinkGeneratorClient'
import { SubscribeLinkGeneratorContent } from '@/components/tools/SubscribeLinkGeneratorContent'
import { BackToTop } from '@/components/shared/BackToTop'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Subscribe Link Generator — Works on All Devices',
  description:
    'Turn any YouTube channel URL into a subscribe link with one click. Free generator — works with @handles, channel IDs, mobile, and desktop. No signup needed.',
  alternates: {
    canonical: 'https://ytniches.com/tools/subscribe-link-generator',
  },
  openGraph: {
    title: 'YouTube Subscribe Link Generator — Free, Instant, Works on All Devices',
    description:
      'Generate your YouTube subscribe link instantly. Paste your channel URL and get a one-click subscribe link free — works on @handles, IDs, and custom URLs.',
    url: 'https://ytniches.com/tools/subscribe-link-generator',
    siteName: 'YTNiches',
    images: [{ url: '/og/subscribe-link-generator.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Subscribe Link Generator — Free, No Signup',
    description:
      'Create a YouTube auto-subscribe link in seconds. Works with @handles, channel IDs, and custom URLs. No account needed.',
    images: ['/og/subscribe-link-generator.png'],
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Subscribe Link Generator',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free tool to generate YouTube auto-subscribe links from any channel URL, @handle, or channel ID. Triggers a one-click subscribe confirmation popup. No signup required.',
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'YouTube Subscribe Link Generator — Free, Instant, Works on All Devices',
  datePublished: '2026-01-01',
  dateModified: '2026-05-01',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches', url: 'https://ytniches.com' },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a YouTube Subscribe Link',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Copy your YouTube channel URL',
      text: 'Go to your YouTube channel. Copy the URL from your browser\'s address bar. It can be in any format: youtube.com/@handle, youtube.com/channel/UCxxxxxx, or youtube.com/c/customname.',
    },
    {
      '@type': 'HowToStep',
      name: 'Paste into the generator',
      text: 'Paste your channel URL into the subscribe link generator above and click Generate.',
    },
    {
      '@type': 'HowToStep',
      name: 'Copy and share your subscribe link',
      text: 'Copy the generated link and share it in your Instagram bio, email newsletter, video descriptions, or anywhere you promote your channel.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I create a subscribe link for YouTube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Two ways: (1) Paste your channel URL into the generator — your subscribe link is ready in seconds. (2) Manually append ?sub_confirmation=1 to your channel URL. The generator is faster and validates the URL format automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the YouTube subscribe link format?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your channel URL with ?sub_confirmation=1 added to the end. Works with @handle, channel ID, and custom URL formats. The parameter does NOT work on video URLs — only channel URLs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the YouTube subscribe link work on mobile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — on mobile with the YouTube app installed, the link opens the app and shows the subscribe popup correctly. Without the app, the experience varies by whether the user is signed in.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is ?sub_confirmation=1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A YouTube URL parameter that triggers a subscribe confirmation popup when someone clicks your channel link. It is an official YouTube feature, not a hack or workaround.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I add a subscribe link to my Instagram bio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to Edit Profile → Website → paste your subscribe link. Or use a link-in-bio tool like Linktree to include it alongside other links. Label it clearly: Subscribe on YouTube.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I create a subscribe link without a tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — append ?sub_confirmation=1 to your YouTube channel URL manually. The full format is: https://www.youtube.com/@YourHandle?sub_confirmation=1.',
      },
    },
    {
      '@type': 'Question',
      name: "Why isn't the subscribe popup appearing?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Four common causes: (1) You're testing while logged in as the channel owner. (2) The link uses a video URL instead of a channel URL. (3) The viewer is already subscribed. (4) The viewer is not signed in to YouTube.",
      },
    },
  ],
}

export default function YouTubeSubscribeLinkGeneratorPage() {
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
              YouTube Subscribe Link Generator
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              This free YouTube subscribe link
              generator creates a link that triggers a one-click subscribe popup for every visitor in under 30
              seconds. Works with @handles, channel IDs, and custom URLs — no signup needed. Paste your channel
              URL below — then read on to learn where to share it and how to track clicks.
            </p>
          </div>

          <PageAds>
            <SubscribeLinkGeneratorClient />
          </PageAds>
        </div>
      </div>

      {/* SEO Content Below Tool */}
      <SubscribeLinkGeneratorContent />
    </>
  )
}
