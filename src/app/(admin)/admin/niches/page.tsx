import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminNichesClient } from '@/components/admin/AdminNichesClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Niches',
  robots: { index: false, follow: false },
}

export default async function AdminNichesPage() {
  const supabase = createAdminClient()

  const { data: niches, error } = await supabase
    .from('niches')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[AdminNichesPage] Error fetching niches:', error.message)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">Niches</h1>
        <p className="text-[#8A7F72] text-sm mt-1">{niches?.length ?? 0} total niches</p>
      </div>
      <AdminNichesClient niches={niches ?? []} />
    </div>
  )
}
