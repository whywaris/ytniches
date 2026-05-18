import type { Metadata } from 'next'
import { PromptsManager } from '@/components/admin/PromptsManager'

export const metadata: Metadata = {
  title: 'Prompts — Admin',
  robots: { index: false, follow: false },
}

export default function AdminPromptsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PromptsManager />
    </div>
  )
}
