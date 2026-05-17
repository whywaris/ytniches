import type { Metadata } from 'next'
import { CTAManager } from '@/components/admin/CTAManager'

export const metadata: Metadata = {
  title: 'CTA Settings — Admin',
  robots: { index: false, follow: false },
}

export default function AdminCTAPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">CTA Settings</h1>
        <p className="text-sm text-[#8A7F72] mt-1">
          Control the call-to-action shown on public pages. Toggle on/off and customize text.
        </p>
      </div>
      <CTAManager />
    </div>
  )
}
