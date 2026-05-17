import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SavedNichesClient } from '@/components/dashboard/SavedNichesClient'
import type { Niche, HandpickNiche } from '@/types'

export const metadata: Metadata = { title: 'Saved Niches' }

interface SavedHandpickRow {
  id: string
  handpick_id: string
  handpick: HandpickNiche
}

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('saved_niches')
    .eq('id', user.id)
    .single()

  const ids: string[] = profile?.saved_niches ?? []

  const [{ data: niches }, { data: savedHandpickRaw }] = await Promise.all([
    ids.length
      ? supabase.from('niches').select('*').in('id', ids)
      : { data: [] },
    supabase
      .from('saved_handpick_niches')
      .select('id, handpick_id, handpick:handpick_niches(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const savedHandpick = (savedHandpickRaw as unknown as SavedHandpickRow[]) ?? []

  return (
    <SavedNichesClient
      initialNiches={(niches as Niche[]) ?? []}
      initialSavedHandpick={savedHandpick}
    />
  )
}
