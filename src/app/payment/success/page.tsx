import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ plan?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { plan } = await searchParams
  const isLifetime = plan === 'lifetime'

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#EBF5EF] mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-[#2A7A4B]" />
        </div>

        <h1 className="font-display font-bold text-3xl text-[#1A1612] mb-3">
          {isLifetime ? "You're a Lifetime member!" : "Welcome to Pro!"}
        </h1>

        <p className="text-[#8A7F72] text-base leading-relaxed mb-8">
          {isLifetime
            ? "You now have unlimited access to every niche, content kit, and future feature — forever. No more payments, ever."
            : "Your Pro subscription is active. You now have access to all 200+ niches, full content kits, and every Pro feature."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-[#E8402A] text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            Go to dashboard
          </Link>
          <Link
            href="/niches"
            className="text-sm font-semibold text-[#8A7F72] hover:text-[#1A1612] transition-colors"
          >
            Browse all niches
          </Link>
        </div>
      </div>
    </div>
  )
}
