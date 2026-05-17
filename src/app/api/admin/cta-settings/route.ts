import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const check = await verifyAdmin()
    if (check instanceof NextResponse) return check

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('cta_settings')
      .select('*')
      .order('page')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
