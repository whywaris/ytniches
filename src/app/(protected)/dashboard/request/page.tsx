import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RequestPageClient } from '@/components/dashboard/RequestPageClient'
import type { NicheRequest } from '@/types'

export const metadata: Metadata = { title: 'Request' }
export const dynamic = 'force-dynamic'

export default async function RequestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan === 'pro' || profile?.plan === 'lifetime'

  const { data: requests } = await supabase
    .from('niche_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <RequestPageClient initialRequests={(requests ?? []) as NicheRequest[]} isPro={isPro} />
}
