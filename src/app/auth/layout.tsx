import Link from 'next/link'
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['700', '900'] })

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo — centered above form */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className={`${fraunces.className} text-2xl font-black text-[#1A1612]`}>
              YT<span className="text-[#E8402A]">Niches</span>
            </span>
          </Link>
        </div>

        {/* Form content */}
        {children}

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-[#8A7F72] hover:text-[#1A1612] transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
