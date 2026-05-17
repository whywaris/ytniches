import type { Metadata } from 'next'
import { RevenueCalculatorClient } from '@/components/tools/RevenueCalculatorClient'
import { PageAds } from '@/components/ads/PageAds'

export const metadata: Metadata = {
  title: 'YouTube Revenue Calculator — Estimate Earnings Free',
  description:
    'Calculate estimated YouTube earnings based on views, CPM, and niche. See how much money YouTubers make per video and per month.',
  alternates: { canonical: 'https://ytniches.com/youtube-revenue-calculator' },
}

export default function YouTubeRevenueCalculatorPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
            YouTube Revenue Calculator
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Estimate how much a YouTube channel or video earns based on views and CPM rates.
          </p>
        </div>

        {/* Tool */}
        <PageAds>
          <RevenueCalculatorClient />

          {/* Info */}
          <div className="mt-16">
            <h2 className="font-display font-bold text-2xl text-foreground mb-6 text-center">
              How YouTube Revenue Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Views', desc: 'Revenue is based on monetized views (typically 40-60% of total views).' },
                { step: '2', title: 'CPM Rate', desc: 'CPM varies by niche — finance pays $15-30, gaming pays $2-5.' },
                { step: '3', title: 'YouTube Cut', desc: 'YouTube takes 45% of ad revenue. Creators keep 55%.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-accent text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </PageAds>
      </div>
    </div>
  )
}
