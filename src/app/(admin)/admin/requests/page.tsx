import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { RequestsManagerClient } from '@/components/admin/RequestsManagerClient'

export const metadata: Metadata = { title: 'Niche Requests', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminRequestsPage() {
  const supabase = createAdminClient()

  const { data: requests } = await supabase
    .from('niche_requests')
    .select('*')
    .order('votes_count', { ascending: false })

  // Fetch emails from auth.users for requests that have a user_id
  const userIds = Array.from(new Set((requests ?? []).filter(r => r.user_id).map(r => r.user_id as string)))
  let emailMap: Map<string, string> = new Map()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds)

    emailMap = new Map((profiles ?? []).map(p => [p.id, p.email ?? '']))
  }

  const enriched = (requests ?? []).map(r => ({
    ...r,
    user_email: r.user_id ? (emailMap.get(r.user_id) ?? '') : '',
  }))

  const stats = {
    total: enriched.length,
    pending: enriched.filter(r => r.status === 'pending').length,
    under_review: enriched.filter(r => r.status === 'under_review').length,
    approved: enriched.filter(r => r.status === 'approved').length,
    completed: enriched.filter(r => r.status === 'completed').length,
    rejected: enriched.filter(r => r.status === 'rejected').length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-[#1A1612]">Niche Requests</h1>
        <p className="text-[#8A7F72] text-sm mt-1">Manage and fulfill user niche requests</p>
      </div>
      <RequestsManagerClient requests={enriched} stats={stats} />
    </div>
  )
}
