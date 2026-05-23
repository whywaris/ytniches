import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = createAdminClient()
    const { searchParams } = request.nextUrl

    const stage = searchParams.get('stage')
    const search = searchParams.get('search')

    let query = supabase
      .from('automation_tools')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (stage) {
      query = query.eq('stage', stage)
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Auto-generate slug from name if not provided
    if (!body.slug) {
      body.slug = slugify(body.name)
    }

    const { data, error } = await supabase
      .from('automation_tools')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 })
  }
}
