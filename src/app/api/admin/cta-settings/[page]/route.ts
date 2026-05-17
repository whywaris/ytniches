import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ page: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const check = await verifyAdmin()
    if (check instanceof NextResponse) return check

    const { page } = await params
    let body: Record<string, unknown>
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('cta_settings')
      .update(body)
      .eq('page', page)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
