import crypto from 'crypto'
import type { LemonSqueezyWebhookPayload } from '@/types'

/** Verify webhook signature from LemonSqueezy */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is not set')
  if (!signature) return false

  const hmac = crypto.createHmac('sha256', secret)
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf-8')
  const sig = Buffer.from(signature, 'utf-8')

  if (digest.length !== sig.length) return false
  return crypto.timingSafeEqual(digest, sig)
}

/** Extract user_id from webhook custom_data */
export function extractUserId(
  payload: LemonSqueezyWebhookPayload
): string | null {
  return payload.meta.custom_data?.user_id ?? null
}

/** Map LemonSqueezy product/variant name to our Plan type */
export function getPlanFromProductName(productName: string): 'pro' | 'lifetime' {
  const lower = productName.toLowerCase()
  if (lower.includes('lifetime')) return 'lifetime'
  return 'pro'
}
