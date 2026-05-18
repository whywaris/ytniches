import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('niche_requests')
    .select('*, user:users(display_name, email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
