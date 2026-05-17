import type { Metadata } from 'next'
import { HandpickManager } from '@/components/admin/HandpickManager'

export const metadata: Metadata = {
  title: 'HandPick Niches — Admin',
  robots: { index: false, follow: false },
}

export default function AdminHandpickPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">HandPick Niches</h1>
        <p className="text-[#8A7F72] text-sm mt-1">
          Manually curated real YouTube channels as proof and inspiration.
        </p>
      </div>
      <HandpickManager />
    </div>
  )
}
