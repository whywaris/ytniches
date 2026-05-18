import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('global_cta')
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const body = await request.json()
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('global_cta')
    .select('id')
    .single()

  if (!existing) return NextResponse.json({ error: 'No CTA record found' }, { status: 404 })

  const { data, error } = await supabase
    .from('global_cta')
    .update(body)
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
