import type { RequestStatus } from '@/types'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'YTNiches <hello@ytniches.com>'
const BASE_URL = 'https://ytniches.com'

const SUBJECTS: Partial<Record<RequestStatus, string>> = {
  under_review: 'Your request is under review 👀',
  completed:    'Your request has been fulfilled! 🎉',
  rejected:     'Update on your request',
}

function buildBody(status: RequestStatus, nicheName: string, adminNote?: string): string {
  switch (status) {
    case 'under_review':
      return `Hi,\n\nWe are reviewing your request for "${nicheName}". We'll update you soon.\n\nThanks,\nThe YTNiches Team`
    case 'completed':
      return `Hi,\n\nYour request for "${nicheName}" has been completed!\n\nCheck it out at ${BASE_URL}\n\nThanks,\nThe YTNiches Team`
    case 'rejected':
      return `Hi,\n\nUnfortunately we could not fulfill your request for "${nicheName}" at this time.${adminNote ? `\n\nNote: ${adminNote}` : ''}\n\nFeel free to submit other requests!\n\nThe YTNiches Team`
    default:
      return `Your request for "${nicheName}" has been updated.`
  }
}

export async function sendRequestStatusEmail({
  to,
  status,
  nicheName,
  adminNote,
}: {
  to: string
  status: RequestStatus
  nicheName: string
  adminNote?: string
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return
  }

  const subject = SUBJECTS[status]
  if (!subject) return

  const body = buildBody(status, nicheName, adminNote)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to,
      subject,
      text: body,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Resend API error: ${err}`)
  }
}
