import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tutorials — Coming Soon',
  description: 'Video tutorials on how to use YTNiches to find profitable YouTube niches. Coming soon.',
  alternates: { canonical: 'https://ytniches.com/tutorials' },
}

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-5xl mb-6 block">🎬</span>
        <h1 className="font-display text-3xl md:text-4xl font-black text-[#1A1612] mb-3">
          Coming Soon
        </h1>
        <p className="text-[#8A7F72] text-sm leading-relaxed mb-8">
          Video tutorials on how to use YTNiches — find niches, use prompts, grow your channel. Stay tuned.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
