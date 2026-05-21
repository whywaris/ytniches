import type { Metadata } from 'next'
import { ThumbnailResizerClient } from './ThumbnailResizerClient'
import { ThumbnailResizerContent } from '@/components/tools/ThumbnailResizerContent'

export const metadata: Metadata = {
  title: 'YouTube Thumbnail Resizer: Free Tool + Size Guide 2026',
  description:
    'Free YouTube thumbnail resizer — instantly resize any image to 1280×720px. No watermark, no upload limit. Plus: Shorts dimensions, blurry thumbnail fixes & more.',
  alternates: {
    canonical: 'https://ytniches.com/tools/thumbnail-resizer',
  },
  openGraph: {
    title: 'YouTube Thumbnail Resizer: Free Tool + Size Guide 2026',
    description:
      'Resize your YouTube thumbnail to 1280×720 for free — no login, no watermark. Supports JPG, PNG, WebP. Full YouTube thumbnail size guide for 2026 included.',
    url: 'https://ytniches.com/tools/thumbnail-resizer',
    siteName: 'YTNiches',
    images: [{ url: '/og/thumbnail-resizer.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Thumbnail Resizer — Free, No Watermark',
    description:
      'Instantly resize to 1280×720px. Free, no login, no watermark. Shorts dimensions included.',
    images: ['/og/thumbnail-resizer.png'],
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Thumbnail Resizer',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free online YouTube thumbnail resizer. Resize any image to 1280×720px (standard) or 1080×1920px (Shorts) instantly. Supports JPG, PNG, WebP. No watermark, no login, client-side processing — your images never leave your browser.',
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Resize a YouTube Thumbnail',
  totalTime: 'PT1M',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Upload your image',
      text: 'Click the upload area or drag and drop your thumbnail image into the resizer tool above. Supports JPG, PNG, WebP, and GIF (non-animated).',
    },
    {
      '@type': 'HowToStep',
      name: 'Select the size preset',
      text: "Choose 'YouTube Thumbnail (1280×720)' for standard videos, or 'YouTube Shorts (1080×1920)' for vertical Shorts thumbnails. Select Fill, Fit, or Stretch mode depending on your image composition.",
    },
    {
      '@type': 'HowToStep',
      name: 'Set quality and download',
      text: "Set JPG quality to 85–90% for optimal file size under the 2MB limit. Click Download to save your resized thumbnail in the correct format.",
    },
    {
      '@type': 'HowToStep',
      name: 'Upload to YouTube Studio',
      text: 'Open YouTube Studio → select your video → Details → Custom thumbnail → upload the resized file. YouTube accepts JPG, PNG, WebP, and GIF under 2MB.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the best size for a YouTube thumbnail?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The best YouTube thumbnail size is 1920×1080 pixels (16:9 aspect ratio) for the sharpest display, with a minimum of 1280×720 pixels. Keep the file under 2MB. YouTube accepts JPG, PNG, WebP, and non-animated GIF.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I resize a thumbnail for YouTube for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Upload your image to a free YouTube thumbnail resizer, select the 1280×720 preset, set JPG quality to 85%, and download. No login or watermark needed. The image is processed in your browser.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why does my YouTube thumbnail look blurry?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Three causes: (1) File exceeded 2MB and YouTube recompressed it. (2) Wrong aspect ratio — YouTube auto-cropped it. (3) Red/warm gradient compression artifact from YouTube's 4:2:0 chroma subsampling.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is the file size limit for YouTube thumbnails?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "2MB is the hard limit. Files approaching 2MB trigger aggressive recompression by YouTube's CDN. The practical target is under 1.8MB. At 85% JPG quality, a 1920×1080 thumbnail exports at 300–600KB.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use PNG for YouTube thumbnails?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — PNG is best for text-heavy thumbnails with hard edges. The trade-off: PNG at 1920×1080 often exceeds 2MB and must be compressed before uploading. Use JPG at 85% for photographic thumbnails.',
      },
    },
    {
      '@type': 'Question',
      name: 'What aspect ratio should YouTube thumbnails be?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '16:9 (widescreen horizontal) for standard videos. 9:16 (vertical) for YouTube Shorts. Wrong aspect ratios get auto-cropped by YouTube, cutting off parts of your design.',
      },
    },
    {
      '@type': 'Question',
      name: 'What size thumbnail does YouTube Shorts need?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '1080×1920 pixels (9:16 vertical). If you upload a 16:9 horizontal thumbnail to a Short, YouTube crops the sides to fit the vertical player.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does changing a thumbnail affect views?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — changing a thumbnail on an actively growing video can temporarily reduce impressions. For underperforming videos (CTR below 3%), a new thumbnail can meaningfully increase clicks.",
      },
    },
  ],
}

export default function ThumbnailResizerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* H1 + Introduction */}
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
              YouTube Thumbnail Resizer
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto mb-4">
              YouTube rejects or silently blurs thumbnails that don&apos;t hit its exact specs. The two
              most common mistakes: wrong dimensions and files over 2MB. This free YouTube thumbnail
              resizer converts any image to 1280×720 (standard) or 1080×1920 (Shorts) — no watermark,
              no login, processed entirely in your browser. Your images never leave your device — no
              server upload, no storage. Not sure what size, format, or quality setting to use? The
              complete guide is below the tool.
            </p>
            {/* Trust Callout */}
            <div className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-[#16A34A] font-medium">
              <span>✓ No watermark</span>
              <span>✓ No login required</span>
              <span>✓ No file upload to server</span>
              <span>✓ Free forever</span>
            </div>
          </div>

          {/* Tool Embed */}
          <ThumbnailResizerClient />
        </div>
      </div>

      {/* SEO Content Below Tool */}
      <ThumbnailResizerContent />
    </>
  )
}
