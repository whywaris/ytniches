import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { user_id, email, subject, body } = await request.json()
  const supabase = createAdminClient()

  try {
    const { data: sent, error } = await resend.emails.send({
      from: 'YTNiches <help@ytniches.com>',
      to: email,
      subject,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">${body.replace(/\n/g, '<br/>')}</div>`,
    })

    if (error) throw error

    await supabase.from('email_logs').insert({
      email_type: 'manual',
      recipient_email: email,
      recipient_user_id: user_id ?? null,
      subject,
      status: 'sent',
      resend_id: sent?.id ?? '',
    })

    return NextResponse.json({ success: true })
  } catch {
    await supabase.from('email_logs').insert({
      email_type: 'manual',
      recipient_email: email,
      recipient_user_id: user_id ?? null,
      subject,
      status: 'failed',
    })
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
