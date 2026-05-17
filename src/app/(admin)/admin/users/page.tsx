import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { UserManagerClient } from '@/components/admin/UserManagerClient'

export const metadata: Metadata = { title: 'Users', robots: { index: false, follow: false } }

export default async function AdminUsersPage() {
  const supabase = createAdminClient()

  // Fetch all signups from auth.users (service role required)
  const { data: authUsers } = await supabase.auth.admin.listUsers()

  // Fetch profiles from public.users (may not exist for all auth users)
  const { data: profiles } = await supabase
    .from('users')
    .select('id, plan, saved_niches, lemonsqueezy_customer_id, lemonsqueezy_subscription_id')

  // Merge auth users with their profiles
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])

  const users = (authUsers?.users ?? []).map((authUser) => {
    const profile = profileMap.get(authUser.id)
    return {
      id: authUser.id,
      email: authUser.email ?? '',
      plan: profile?.plan ?? 'free',
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at ?? null,
      saved_niches: profile?.saved_niches ?? [],
      lemonsqueezy_customer_id: profile?.lemonsqueezy_customer_id ?? null,
      lemonsqueezy_subscription_id: profile?.lemonsqueezy_subscription_id ?? null,
    }
  })

  // Sort by newest first
  users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-[#1A1612]">Users</h1>
        <p className="text-[#8A7F72] text-sm mt-1">{users.length} total signups</p>
      </div>
      <UserManagerClient users={users} />
    </div>
  )
}

