'use client'

import { useEffect } from 'react'

export default function Error({
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
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display font-black text-4xl text-[#1A1612] mb-4">
        Something went wrong
      </h1>
      <p className="text-[#8A7F72] text-lg max-w-md mb-8">
        We encountered an unexpected error. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="bg-[#E8402A] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#CF3520] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
