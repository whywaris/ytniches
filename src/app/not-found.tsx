import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <p className="text-[120px] sm:text-[160px] font-display font-black text-[#E8402A] leading-none mb-4">
          404
        </p>
        <h1 className="text-[32px] sm:text-[42px] font-display font-bold text-[#1A1612] leading-tight mb-4">
          Page not found
        </h1>
        <p className="text-[#8A7F72] text-lg mb-10 leading-relaxed">
          This page doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-[#1A1612] text-white font-bold text-sm px-8 py-4 rounded-full hover:bg-black transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/niches"
            className="border border-[#E0D9CE] text-[#1A1612] font-bold text-sm px-8 py-4 rounded-full hover:bg-[#F5F0E8] transition-colors"
          >
            Browse niches
          </Link>
        </div>
      </div>
    </div>
  )
}
