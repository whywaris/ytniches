import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin === true
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcements')
      .single()

    if (error || !data?.value) {
      return NextResponse.json({
        settings: {
          public_enabled: false,
          public_text: '',
          dashboard_enabled: false,
          dashboard_text: '',
        },
      })
    }

    return NextResponse.json({ settings: data.value })
  } catch {
    return NextResponse.json({
      settings: {
        public_enabled: false,
        public_text: '',
        dashboard_enabled: false,
        dashboard_text: '',
      },
    })
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await request.json()
  const supabase = createAdminClient()

  // Try upsert
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key: 'announcements', value: settings, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (error) {
    console.error('[Announcements] Save error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
