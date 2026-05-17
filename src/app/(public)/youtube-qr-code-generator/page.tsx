import type { Metadata } from 'next'
import { QRCodeGeneratorClient } from '@/components/tools/QRCodeGeneratorClient'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube QR Code Generator — Create QR Codes Free',
  description: 'Generate QR codes for any YouTube video or channel. Perfect for business cards, flyers, and social media promotion.',
  alternates: { canonical: 'https://ytniches.com/youtube-qr-code-generator' },
}

export default function YouTubeQRCodeGeneratorPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
            YouTube QR Code Generator
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Generate a QR code for any YouTube video or channel. Great for print materials and offline promotion.
          </p>
        </div>
        <PageAds>
          <QRCodeGeneratorClient />
        </PageAds>
      </div>
    </div>
  )
}
