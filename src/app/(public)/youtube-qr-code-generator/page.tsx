import type { Metadata } from 'next'
import { QRCodeGeneratorClient } from '@/components/tools/QRCodeGeneratorClient'
import { QRCodeGeneratorContent } from '@/components/tools/QRCodeGeneratorContent'
import { BackToTop } from '@/components/shared/BackToTop'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube QR Code Generator: Free, Custom & Trackable',
  description:
    'Generate free QR codes for any YouTube video or channel. Customize colors, add your logo, download as PNG or SVG, and track scans with UTM parameters. No signup required.',
  alternates: { canonical: 'https://ytniches.com/youtube-qr-code-generator' },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube QR Code Generator',
  url: 'https://ytniches.com/youtube-qr-code-generator',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free online tool to generate custom QR codes for YouTube videos and channels with color customization, logo support, and SVG download.',
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'YouTube QR Code Generator: Free, Custom & Trackable',
  description:
    'Complete guide to creating YouTube QR codes with customization, tracking, and best placement strategies.',
  author: { '@type': 'Organization', name: 'YTNiches' },
  publisher: { '@type': 'Organization', name: 'YTNiches' },
  url: 'https://ytniches.com/youtube-qr-code-generator',
  mainEntityOfPage: 'https://ytniches.com/youtube-qr-code-generator',
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a YouTube QR Code',
  description:
    'Generate a custom QR code for any YouTube video or channel in three simple steps.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Paste Your YouTube URL',
      text: 'Copy the full URL of your YouTube video, channel, or playlist and paste it into the generator input field.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Customize Your QR Code',
      text: 'Choose foreground and background colors, add a logo, and select your preferred error correction level.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Download and Test',
      text: 'Download the QR code as PNG or SVG, then test it with multiple phone cameras before printing.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I create a QR code for a YouTube video?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Paste your YouTube video URL into the generator above, customize the colors and logo if desired, then download the QR code as PNG or SVG. Test it with your phone camera before printing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does YouTube have a built-in QR code feature?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. In the YouTube mobile app, tap Share on any video or channel and select the QR code option. However, it produces a plain black-and-white code with no customization, no logo support, and no scan tracking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track how many people scan my YouTube QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Add UTM parameters to your YouTube URL before generating the QR code. You will see scan data in YouTube Studio under Traffic sources > External. Use utm_source=qr_code to identify QR traffic specifically.',
      },
    },
    {
      '@type': 'Question',
      name: "What's the minimum size for a printed QR code?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The minimum recommended size is 2cm × 2cm (0.8 inches). For distance scanning like posters, use the 10:1 rule — the code should be 1/10th the scanning distance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I use a static or dynamic QR code for YouTube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Static codes work best for most YouTube creators. Your video URL won't change, and UTM parameters provide tracking. Dynamic codes are useful only if you need to redirect the same printed code to different videos over time.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I add my channel logo to the QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Upload your logo and it will be placed in the center of the QR code. Use the highest error correction level (H) when adding a logo, and keep the logo under 20% of the total QR code area to ensure reliable scanning.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do QR codes work for YouTube Shorts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Paste any YouTube Shorts URL (youtube.com/shorts/VIDEO_ID) into the generator. The QR code will open the Short directly in the YouTube app or browser when scanned.',
      },
    },
  ],
}

export default function YouTubeQRCodeGeneratorPage() {
  return (
    <>
      <BackToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
              Free YouTube QR Code Generator
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Generate custom QR codes for any YouTube video, channel, or playlist. Add your logo, pick brand colors, download as PNG or SVG, and track scans with UTM parameters — completely free, no signup required.
            </p>
          </div>
          <PageAds>
            <QRCodeGeneratorClient />
          </PageAds>
        </div>
      </div>

      <QRCodeGeneratorContent />
    </>
  )
}
