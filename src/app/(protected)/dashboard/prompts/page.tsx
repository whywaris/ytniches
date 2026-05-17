import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DashboardPromptsClient } from '@/components/dashboard/DashboardPromptsClient'

export const metadata: Metadata = { title: 'Prompts' }

interface RawFieldValue {
  id: string
  field_id: string
  value: string
  field: {
    id: string
    name: string
    slug: string
    show_to_users: boolean
    position: number
  } | { id: string; name: string; slug: string; show_to_users: boolean; position: number }[] | null
}

interface RawNichePrompt {
  id: string
  channel_name: string
  channel_url: string | null
  published: boolean
  created_at: string
  field_values: RawFieldValue[]
}

export default async function PromptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Use admin client to bypass RLS for the join query
  const admin = createAdminClient()

  // Fetch niche prompts with their dynamic field values
  const { data: nichePrompts } = await admin
    .from('niche_prompts')
    .select(`
      id,
      channel_name,
      channel_url,
      published,
      created_at,
      field_values:prompt_field_values(
        id,
        field_id,
        value,
        field:prompt_fields(
          id,
          name,
          slug,
          show_to_users,
          position
        )
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Normalize: Supabase may return `field` as array or object depending on the join
  // Filter: only include field_values where show_to_users = true and value is not empty
  // Sort field values by field position
  const processedPrompts = ((nichePrompts ?? []) as RawNichePrompt[]).map((prompt) => ({
    id: prompt.id,
    channel_name: prompt.channel_name,
    channel_url: prompt.channel_url,
    published: prompt.published,
    created_at: prompt.created_at,
    field_values: (prompt.field_values ?? [])
      .map((fv) => {
        // Normalize field — Supabase returns object for single FK join
        const field = Array.isArray(fv.field) ? fv.field[0] ?? null : fv.field
        return { id: fv.id, field_id: fv.field_id, value: fv.value, field }
      })
      .filter(
        (fv) =>
          fv.field?.show_to_users === true &&
          fv.value?.trim() !== ''
      )
      .sort((a, b) => (a.field?.position ?? 0) - (b.field?.position ?? 0)),
  }))

  return <DashboardPromptsClient prompts={processedPrompts} />
}
