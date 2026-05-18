import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('broadcast_emails')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const supabase = createAdminClient()
  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  const { subject, body, segment, scheduled_at } = await request.json()
  const status = scheduled_at ? 'scheduled' : 'draft'

  const { data, error } = await supabase
    .from('broadcast_emails')
    .insert({
      subject, body,
      segment: segment ?? 'all',
      status,
      scheduled_at: scheduled_at ?? null,
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
