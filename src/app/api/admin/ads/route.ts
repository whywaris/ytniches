import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('banner_ads')
    .select('*')
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const body = await request.json()
  const supabase = createAdminClient()

  const { data: maxRow } = await supabase
    .from('banner_ads')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('banner_ads')
    .insert({ ...body, position: (maxRow?.position ?? -1) + 1 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
