import Link from 'next/link'
import type { CTASetting } from '@/types'

export function NichesCTA({ cta }: { cta: CTASetting | null }) {
  if (!cta || !cta.is_active) return null

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
      <div className="bg-[#1A1612] rounded-[20px] p-8 md:p-10 text-center">
        <h3 className="font-display text-3xl font-black text-white mb-3">
          {cta.heading}
        </h3>
        <p className="text-sm text-white/60 mb-6 max-w-md mx-auto leading-relaxed">
          {cta.subheading}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href={cta.button_url}
            className="px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors"
          >
            {cta.button_text}
          </Link>
          <Link
            href={cta.button_secondary_url}
            className="px-6 py-3 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            {cta.button_secondary_text}
          </Link>
        </div>
      </div>
    </div>
  )
}
