import Link from 'next/link'
import { Shield, Check, Zap } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="py-20 px-4 bg-[#1A1612]">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E8402A]/20 mx-auto mb-6">
          <Zap className="w-6 h-6 text-[#E8402A]" />
        </div>
        <h2 className="font-display font-black text-[36px] sm:text-[44px] text-white leading-tight mb-4 text-balance">
          Ready to Find Your Niche?
        </h2>
        <p className="text-[#8A7F72] text-base mb-10 max-w-md mx-auto">
          Join creators building faceless YouTube channels with data-backed niche research.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-8 py-4 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Get Started Free →
          </Link>
          <Link
            href="/niches"
            className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold text-sm px-8 py-4 rounded-full hover:bg-white/10 transition-colors"
          >
            Browse Niches
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
          {[
            { icon: Shield, text: '7-day money back' },
            { icon: Check, text: 'Cancel anytime' },
            { icon: Check, text: 'No credit card for free plan' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-[#8A7F72]">
              <Icon className="w-3.5 h-3.5 text-[#E8402A]" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
