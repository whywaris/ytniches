import type { Metadata } from 'next'
import { AdminNichePromptsClient } from '@/components/admin/AdminNichePromptsClient'

export const metadata: Metadata = {
  title: 'Niche Prompts — Admin',
  robots: { index: false, follow: false },
}

export default function AdminPromptsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminNichePromptsClient />
    </div>
  )
}
