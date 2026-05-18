import Link from 'next/link'
import type { GlobalCta } from '@/types'

interface GlobalCtaBannerProps {
  cta: GlobalCta | null
}

export function GlobalCtaBanner({ cta }: GlobalCtaBannerProps) {
  if (!cta || !cta.is_active) return null

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
      <div className="w-full bg-[#1A1612] rounded-2xl px-8 py-12 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-3">
          {cta.heading}
        </h2>
        {cta.subheading && (
          <p className="text-sm text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            {cta.subheading}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {cta.primary_button_text && cta.primary_button_url && (
            <Link
              href={cta.primary_button_url}
              className="px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors"
            >
              {cta.primary_button_text}
            </Link>
          )}
          {cta.secondary_button_text && cta.secondary_button_url && (
            <Link
              href={cta.secondary_button_url}
              className="px-6 py-3 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              {cta.secondary_button_text}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
