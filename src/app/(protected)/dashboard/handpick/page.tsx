import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DashboardHandpickClient } from './DashboardHandpickClient'
import type { HandpickNiche } from '@/types'

export const metadata: Metadata = { title: 'HandPick Niches' }

export default async function DashboardHandpickPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan === 'pro' || profile?.plan === 'lifetime'

  // Admin client bypasses RLS — fetch all published niches
  const adminSupabase = createAdminClient()
  const { data: niches, error } = await adminSupabase
    .from('handpick_niches')
    .select('*')
    .eq('published', true)
    .order('position', { ascending: true })

  if (error) console.error('[dashboard/handpick] fetch error:', error.message)

  // Normalize niche_tags — DB may return null for rows with no tags
  const safeNiches = (niches ?? []).map((n) => ({
    ...n,
    niche_tags: Array.isArray(n.niche_tags) ? n.niche_tags : [],
  }))

  return (
    <DashboardHandpickClient
      niches={safeNiches as HandpickNiche[]}
      isPro={isPro}
    />
  )
}
