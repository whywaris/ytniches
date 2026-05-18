import type { Metadata } from 'next'
import { AdminRequestsPage } from '@/components/admin/AdminRequestsClient'

export const metadata: Metadata = { title: 'Requests', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminRequestsPage />
    </div>
  )
}
