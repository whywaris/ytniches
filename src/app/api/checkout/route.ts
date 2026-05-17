import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@/lib/lemonsqueezy/client'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { variantId?: string }
  try {
    body = (await req.json()) as { variantId?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { variantId } = body
  if (!variantId) {
    return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
  }

  try {
    const url = await createCheckout({
      variantId,
      userEmail: user.email ?? '',
      userId: user.id,
    })
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[checkout] error:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
