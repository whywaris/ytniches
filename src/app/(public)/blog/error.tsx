'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="py-24 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FDF0ED] mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-[#E8402A]" />
        </div>
        <h1 className="font-display font-bold text-2xl text-[#1A1612] mb-2">
          Couldn&apos;t load the blog
        </h1>
        <p className="text-[#8A7F72] text-sm mb-8 leading-relaxed">
          Something went wrong. Try again or head back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
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
