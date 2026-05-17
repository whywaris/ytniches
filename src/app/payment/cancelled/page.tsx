import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FDF0ED] mx-auto mb-6">
          <XCircle className="w-8 h-8 text-[#E8402A]" />
        </div>

        <h1 className="font-display font-bold text-3xl text-[#1A1612] mb-3">
          Payment cancelled
        </h1>

        <p className="text-[#8A7F72] text-base leading-relaxed mb-8">
          No charge was made. Your account is unchanged. You can upgrade anytime from the pricing page.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center bg-[#E8402A] text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            View pricing
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-[#8A7F72] hover:text-[#1A1612] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
