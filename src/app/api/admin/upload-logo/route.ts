import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use PNG, JPG, WebP, or SVG.' }, { status: 400 })
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 500KB.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Generate unique filename
    const ext = file.name.split('.').pop() ?? 'png'
    const filename = `tool-logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('public-assets')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public-assets')
      .getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
