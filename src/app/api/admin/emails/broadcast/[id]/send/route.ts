import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const supabase = createAdminClient()

  const { data: broadcast, error: fetchError } = await supabase
    .from('broadcast_emails')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !broadcast) {
    return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 })
  }

  // Get recipients based on segment
  let userQuery = supabase.from('users').select('id, email')
  if (broadcast.segment === 'pro') {
    userQuery = userQuery.in('plan', ['pro', 'lifetime'])
  } else if (broadcast.segment === 'free') {
    userQuery = userQuery.eq('plan', 'free')
  }

  const { data: recipients } = await userQuery
  if (!recipients?.length) {
    return NextResponse.json({ error: 'No recipients found' }, { status: 400 })
  }

  await supabase.from('broadcast_emails').update({ status: 'sending' }).eq('id', id)

  let sentCount = 0

  // Send in batches of 50
  for (let i = 0; i < recipients.length; i += 50) {
    const batch = recipients.slice(i, i + 50)
    await Promise.all(
      batch.map(async (recipient) => {
        try {
          const { data: sent } = await resend.emails.send({
            from: 'YTNiches <help@ytniches.com>',
            to: recipient.email,
            subject: broadcast.subject,
            html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">${(broadcast.body as string).replace(/\n/g, '<br/>')}</div>`,
          })
          await supabase.from('email_logs').insert({
            email_type: 'broadcast',
            recipient_email: recipient.email,
            recipient_user_id: recipient.id,
            subject: broadcast.subject,
            status: 'sent',
            resend_id: sent?.id ?? '',
            metadata: { broadcast_id: id },
          })
          sentCount++
        } catch {
          await supabase.from('email_logs').insert({
            email_type: 'broadcast',
            recipient_email: recipient.email,
            recipient_user_id: recipient.id,
            subject: broadcast.subject,
            status: 'failed',
            metadata: { broadcast_id: id },
          })
        }
      })
    )
  }

  await supabase.from('broadcast_emails').update({
    status: sentCount > 0 ? 'sent' : 'failed',
    sent_at: new Date().toISOString(),
    recipients_count: sentCount,
  }).eq('id', id)

  return NextResponse.json({ sent: sentCount, total: recipients.length })
}
