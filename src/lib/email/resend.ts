import type { RequestStatus } from '@/types'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'YTNiches <hello@ytniches.com>'
const BASE_URL = 'https://ytniches.com'

const SUBJECTS: Partial<Record<RequestStatus, string>> = {
  under_review: 'Your niche request is under review 👀',
  approved:     'Your niche request has been approved! ✓',
  completed:    'Your requested niche is now live! 🎉',
  rejected:     'Update on your niche request',
}

function buildBody(status: RequestStatus, nicheTitle: string, nicheSlug?: string, adminNote?: string): string {
  switch (status) {
    case 'under_review':
      return `Hi,\n\nWe are reviewing your request for "${nicheTitle}". We'll update you as soon as we have more information.\n\nThanks for helping us grow YTNiches!\n\nThe YTNiches Team`
    case 'approved':
      return `Hi,\n\nGreat news! Your niche request "${nicheTitle}" has been approved and will be added to YTNiches soon. We'll email you once it's live.\n\nThanks,\nThe YTNiches Team`
    case 'completed':
      return `Hi,\n\n"${nicheTitle}" has been added to YTNiches!\n\nCheck it out here: ${BASE_URL}/niches/${nicheSlug ?? ''}\n\nThanks for the suggestion — it made YTNiches better!\n\nThe YTNiches Team`
    case 'rejected':
      return `Hi,\n\nUnfortunately we could not add "${nicheTitle}" at this time.${adminNote ? `\n\nReason: ${adminNote}` : ''}\n\nDon't be discouraged — feel free to submit other niche ideas!\n\nThe YTNiches Team`
    default:
      return `Your niche request "${nicheTitle}" has been updated.`
  }
}

export async function sendRequestStatusEmail({
  to,
  status,
  nicheTitle,
  nicheSlug,
  adminNote,
}: {
  to: string
  status: RequestStatus
  nicheTitle: string
  nicheSlug?: string
  adminNote?: string
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return
  }

  const subject = SUBJECTS[status]
  if (!subject) return

  const body = buildBody(status, nicheTitle, nicheSlug, adminNote)

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
