import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'
import { sanitizeContent } from '@/lib/sanitize'

export async function GET() {
  try {
    const check = await verifyAdmin()
    if (check instanceof NextResponse) return check

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posts: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const check = await verifyAdmin()
    if (check instanceof NextResponse) return check

    let body: Record<string, unknown>
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

    if (!body.title || !body.content) return NextResponse.json({ error: 'title and content are required' }, { status: 400 })

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ ...body, content: sanitizeContent(String(body.content)), author: 'Admin', author_id: (check as { userId: string }).userId })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
