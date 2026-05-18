import type { Metadata } from 'next'
import { GlobalCtaAdmin } from '@/components/admin/GlobalCtaAdmin'

export const metadata: Metadata = {
  title: 'CTA Settings — Admin',
  robots: { index: false, follow: false },
}

export default function CtaSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <GlobalCtaAdmin />
    </div>
  )
}
