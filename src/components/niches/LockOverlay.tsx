import Link from 'next/link'
import { Lock } from 'lucide-react'

interface LockOverlayProps {
  title?: string
  description?: string
  price?: string
}

export function LockOverlay({
  title = 'Pro Niche',
  description = 'Upgrade to Pro to unlock this niche and 1,200+ more.',
  price = '$9/mo',
}: LockOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-8 px-6 rounded-[20px] bg-gradient-to-b from-transparent via-white/70 to-white">
      <div className="text-center">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#EDE8DF] border border-[#E0D9CE] mx-auto mb-3">
          <Lock className="w-4 h-4 text-[#8A7F72]" />
        </div>
        <p className="font-display text-base font-bold text-[#1A1612] mb-1">{title}</p>
        <p className="text-xs text-[#8A7F72] mb-5 max-w-[200px] mx-auto leading-relaxed">
          {description}
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 bg-[#E8402A] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors"
        >
          Unlock — {price}
        </Link>
      </div>
    </div>
  )
}
