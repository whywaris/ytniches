import type { Metadata } from 'next'
import { EmbedCodeGeneratorClient } from '@/components/tools/EmbedCodeGeneratorClient'
import { EmbedCodeGeneratorContent } from '@/components/tools/EmbedCodeGeneratorContent'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Embed Code Generator — Free & Responsive Tool',
  description:
    'Free YouTube embed code generator with responsive CSS, autoplay, start time & Shorts support. No signup. Works on WordPress, Wix & more.',
  alternates: { canonical: 'https://ytniches.com/youtube-embed-code-generator' },
  openGraph: {
    title: 'YouTube Embed Code Generator — Free & Responsive Tool',
    description: 'Generate custom YouTube embed code instantly. Autoplay, responsive, loop, no-cookie mode & more.',
    url: 'https://ytniches.com/youtube-embed-code-generator',
    siteName: 'YTNiches',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Embed Code Generator — Free, No Signup',
    description: 'Custom YouTube iFrame embed code in seconds. Responsive, autoplay, Shorts support.',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Embed Code Generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free tool to generate custom YouTube iFrame embed code with responsive CSS, autoplay, loop, start time, privacy-enhanced mode, and YouTube Shorts support.',
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate YouTube Embed Code',
  step: [
    { '@type': 'HowToStep', name: 'Paste your YouTube video URL', text: 'Copy the URL of any public YouTube video, playlist, or Short and paste it into the embed code generator above.' },
    { '@type': 'HowToStep', name: 'Customize the player options', text: 'Select options: autoplay (muted), start time, loop, responsive sizing, or privacy-enhanced mode.' },
    { '@type': 'HowToStep', name: 'Copy and paste the embed code', text: 'Click Copy Code and paste into your website HTML editor, WordPress Custom HTML block, or any CMS.' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I get the embed code for a YouTube video?', acceptedAnswer: { '@type': 'Answer', text: 'Paste the URL into the generator above, or on YouTube click Share → Embed, or build manually: youtube.com/embed/VIDEO_ID.' } },
    { '@type': 'Question', name: 'How do I make a YouTube embed responsive?', acceptedAnswer: { '@type': 'Answer', text: 'Wrap in a div with padding-bottom: 56.25% and set iFrame to width: 100%; height: 100%; position: absolute. Or use CSS aspect-ratio: 16/9.' } },
    { '@type': 'Question', name: 'How do I embed without showing related videos?', acceptedAnswer: { '@type': 'Answer', text: 'Add rel=0. Since 2018, this shows same-channel related videos only — not zero. Complete removal is no longer possible.' } },
    { '@type': 'Question', name: 'Can I autoplay a YouTube video on my website?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, but only muted. Use autoplay=1&mute=1 and add allow="autoplay" to the iFrame tag.' } },
    { '@type': 'Question', name: 'What is the YouTube iFrame embed code?', acceptedAnswer: { '@type': 'Answer', text: 'An HTML iFrame that loads a YouTube player: <iframe src="youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>.' } },
    { '@type': 'Question', name: 'How do I embed a YouTube playlist?', acceptedAnswer: { '@type': 'Answer', text: 'Use: youtube.com/embed/videoseries?list=PLAYLIST_ID. Find the ID after list= in the playlist URL.' } },
    { '@type': 'Question', name: 'Why is my YouTube embed not working?', acceptedAnswer: { '@type': 'Answer', text: 'Common causes: private video, embedding disabled, autoplay blocked (add mute=1), or browser extension blocking iFrame.' } },
    { '@type': 'Question', name: 'How do I embed in WordPress?', acceptedAnswer: { '@type': 'Answer', text: 'Use Custom HTML block, not the YouTube embed block. The YouTube block does not support custom parameters.' } },
    { '@type': 'Question', name: 'Does embedding help SEO?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — increases engagement. But iFrames hurt Core Web Vitals. Use lazy loading or facade pattern for critical pages.' } },
    { '@type': 'Question', name: 'How do I embed YouTube Shorts?', acceptedAnswer: { '@type': 'Answer', text: 'Use youtube.com/embed/VIDEO_ID with Shorts ID. Use vertical CSS wrapper: padding-bottom: 177.78% and max-width: 315px.' } },
  ],
}

export default function YouTubeEmbedCodeGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-[32px] sm:text-[42px] leading-tight text-foreground mb-4">
              YouTube Embed Code Generator
            </h1>
            <p className="text-muted text-base max-w-xl mx-auto leading-relaxed">
              YouTube&apos;s default embed code gives you a fixed-size, non-responsive iFrame with no easy way to set autoplay, loop, or start time. This YouTube embed code generator creates responsive, customizable iFrame code — autoplay, loop, privacy-enhanced mode, Shorts support — no signup. Most guides also get the rel=0 parameter wrong. This one doesn&apos;t.
            </p>
          </div>
          <PageAds>
            <EmbedCodeGeneratorClient />
          </PageAds>
        </div>
      </div>

      <EmbedCodeGeneratorContent />
    </>
  )
}
