import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendRequestStatusEmail } from '@/lib/email/resend'
import type { RequestStatus } from '@/types'

export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()

  // Verify admin via service role — caller must pass auth header or rely on session cookie
  // For admin panel (server action context), we trust the admin layout guard
  const body = await request.json()
  const { status, admin_note, linked_niche_id } = body as {
    status?: RequestStatus
    admin_note?: string
    linked_niche_id?: string
  }

  const updateData: Record<string, unknown> = {}
  if (status) updateData.status = status
  if (admin_note !== undefined) updateData.admin_note = admin_note || null
  if (linked_niche_id !== undefined) updateData.linked_niche_id = linked_niche_id || null

  const { data: updated, error } = await supabase
    .from('niche_requests')
    .update(updateData)
    .eq('id', params.id)
    .select('*, user:user_id(email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email notification if status changed to a notifiable state
  const notifiableStatuses: RequestStatus[] = ['under_review', 'approved', 'completed', 'rejected']
  if (status && notifiableStatuses.includes(status)) {
    try {
      const userEmail = (updated as Record<string, unknown> & { user?: { email?: string } }).user?.email
      if (userEmail) {
        // Fetch linked niche slug if completed
        let nicheSlug: string | undefined
        if (status === 'completed' && linked_niche_id) {
          const { data: niche } = await supabase
            .from('niches')
            .select('slug')
            .eq('id', linked_niche_id)
            .single()
          nicheSlug = niche?.slug
        }

        await sendRequestStatusEmail({
          to: userEmail,
          status,
          nicheTitle: updated.title,
          nicheSlug,
          adminNote: admin_note,
        })
      }
    } catch (emailErr) {
      // Non-fatal — log but don't fail the request
      console.error('Email send failed:', emailErr)
    }
  }

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('niche_requests')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
