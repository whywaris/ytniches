import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await verifyAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const supabase = createAdminClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('automation_tools')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await verifyAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('automation_tools')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 })
  }
}
