import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // If profile not found in users table yet, create it
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        plan: 'free',
      })
      .select()
      .single()

    const userProfile = newProfile ?? {
      id: authUser.id,
      email: authUser.email ?? '',
      plan: 'free',
      saved_niches: [],
      is_admin: false,
      created_at: new Date().toISOString(),
    }

    return <SettingsClient user={userProfile} />
  }

  return <SettingsClient user={profile} />
}
