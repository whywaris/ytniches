import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin === true
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = createAdminClient()

  // Auto-generate slug from channel_name or name if not provided
  if (!body.slug) {
    const nameForSlug = body.channel_name || body.name || ''
    if (nameForSlug) {
      body.slug = slugify(nameForSlug)
    }
  }

  const { data, error } = await supabase.from('niches').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/niches')
  revalidatePath('/admin/niches')
  revalidatePath('/')
  return NextResponse.json({ niche: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, ...body } = await request.json()
  const supabase = createAdminClient()

  // Auto-regenerate slug if channel_name changed and no explicit slug provided
  if ((body.channel_name || body.name) && !body.slug) {
    const nameForSlug = body.channel_name || body.name || ''
    if (nameForSlug) {
      body.slug = slugify(nameForSlug)
    }
  }

  const { data, error } = await supabase.from('niches').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/niches')
  revalidatePath('/')
  if (data?.slug) revalidatePath(`/niches/${data.slug as string}`)
  return NextResponse.json({ niche: data })
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await request.json()
  const supabase = createAdminClient()

  const { error } = await supabase.from('niches').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/niches')
  revalidatePath('/')
  return NextResponse.json({ success: true })
}
