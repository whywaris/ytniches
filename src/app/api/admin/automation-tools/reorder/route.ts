import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = createAdminClient()
    const { items } = await request.json() as {
      items: Array<{ id: string; position: number }>
    }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid body: items array required' }, { status: 400 })
    }

    // Update positions in parallel
    const updates = items.map(({ id, position }) =>
      supabase
        .from('automation_tools')
        .update({ position })
        .eq('id', id)
    )

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)

    if (failed?.error) {
      return NextResponse.json({ error: failed.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to reorder tools' }, { status: 500 })
  }
}
