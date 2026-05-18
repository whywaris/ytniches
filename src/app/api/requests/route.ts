import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { RequestNotificationEmail } from '@/lib/emails/request-notification'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

// GET — fetch current user's requests
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('niche_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST — submit new request + send email to admin
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { request_type, niche_name, description } = await request.json()

  // Only pro/lifetime users can submit requests
  const { data: userData } = await supabase
    .from('users')
    .select('plan, display_name, email')
    .eq('id', user.id)
    .single()

  const isPro = userData?.plan === 'pro' || userData?.plan === 'lifetime'
  if (!isPro) {
    return NextResponse.json({ error: 'Only Pro members can submit requests' }, { status: 403 })
  }

  if (!request_type || !niche_name?.trim()) {
    return NextResponse.json(
      { error: 'request_type and niche_name are required' },
      { status: 400 }
    )
  }

  const { data: newRequest, error } = await supabase
    .from('niche_requests')
    .insert({
      user_id: user.id,
      request_type,
      niche_name: niche_name.trim(),
      description: description?.trim() ?? '',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email to admin via Resend
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
    if (adminEmail) {
      await resend.emails.send({
        from: 'YTNiches <help@ytniches.com>',
        to: adminEmail,
        subject: `New ${request_type === 'niche' ? 'Niche' : 'Prompts'} Request — ${niche_name.trim()}`,
        react: RequestNotificationEmail({
          userName: userData?.display_name ?? 'Unknown',
          userEmail: userData?.email ?? user.email ?? '',
          requestType: request_type,
          nicheName: niche_name.trim(),
          description: description?.trim() ?? '',
          requestId: newRequest.id,
        }),
      })
    }
  } catch (emailError) {
    console.error('[requests] Email send failed:', emailError)
  }

  return NextResponse.json(newRequest)
}
