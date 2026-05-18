import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DashboardPromptsClient } from '@/components/dashboard/DashboardPromptsClient'
import type { NicheChannel } from '@/types'

export const metadata: Metadata = { title: 'Prompts' }
export const dynamic = 'force-dynamic'

export default async function PromptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()
  const isPro = userData?.plan === 'pro' || userData?.plan === 'lifetime'

  const admin = createAdminClient()
  const { data: channels } = await admin
    .from('niche_channels')
    .select(`
      id, channel_name, channel_url, category, position,
      prompt_values:niche_prompt_values(id, field_name, access, content, created_at)
    `)
    .eq('is_active', true)
    .order('position')

  return (
    <DashboardPromptsClient
      channels={(channels ?? []) as NicheChannel[]}
      isPro={isPro}
    />
  )
}
