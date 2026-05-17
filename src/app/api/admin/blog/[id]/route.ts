import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'
import { sanitizeContent } from '@/lib/sanitize'

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const check = await verifyAdmin()
    if (check instanceof NextResponse) return check

    const { id } = await params
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const check = await verifyAdmin()
    if (check instanceof NextResponse) return check

    const { id } = await params
    let body: Record<string, unknown>
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

    const supabase = createAdminClient()
    const sanitized = body.content ? { ...body, content: sanitizeContent(String(body.content)) } : body
    const { data, error } = await supabase.from('blog_posts').update(sanitized).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const check = await verifyAdmin()
    if (check instanceof NextResponse) return check

    const { id } = await params
    const supabase = createAdminClient()
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
