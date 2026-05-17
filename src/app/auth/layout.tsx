import Link from 'next/link'
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['700', '900'] })

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm text-[#8A7F72] hover:text-[#1A1612] transition-colors flex items-center gap-2">
          ← Back to home
        </Link>
        <Link href="/">
          <span className={`${fraunces.className} text-xl font-black text-[#1A1612]`}>
            YT<span className="text-[#E8402A]">Niches</span>
          </span>
        </Link>
        <div className="w-20" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  )
}
