import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is not set')
  if (!signature) return false
  const digest = createHmac('sha256', secret).update(rawBody).digest('hex')
  const digestBuf = Buffer.from(digest)
  const sigBuf = Buffer.from(signature)
  if (digestBuf.length !== sigBuf.length) return false
  return timingSafeEqual(digestBuf, sigBuf)
}

function getUserId(payload: Record<string, unknown>): string | null {
  try {
    const meta = payload.meta as Record<string, unknown>
    const custom = meta.custom_data as Record<string, string> | undefined
    return custom?.user_id ?? null
  } catch {
    return null
  }
}

function getAttrs(payload: Record<string, unknown>): Record<string, unknown> {
  const data = payload.data as Record<string, unknown>
  return (data.attributes as Record<string, unknown>) ?? {}
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature')

  let isValid: boolean
  try {
    isValid = verifySignature(rawBody, signature)
  } catch (err) {
    console.error('[LS Webhook] Secret not configured:', err)
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const meta = payload.meta as Record<string, unknown>
  const eventName = meta.event_name as string
  const supabase = createAdminClient()

  try {
    switch (eventName) {
      case 'order_created': {
        // Lifetime purchase — one-time order
        const userId = getUserId(payload)
        if (!userId) break
        const attrs = getAttrs(payload)
        const customerId = attrs.customer_id as number | undefined
        await supabase
          .from('users')
          .update({
            plan: 'lifetime',
            ...(customerId && { lemonsqueezy_customer_id: String(customerId) }),
            plan_expires_at: null,
          })
          .eq('id', userId)
        break
      }

      case 'subscription_created': {
        const userId = getUserId(payload)
        if (!userId) break
        const attrs = getAttrs(payload)
        const subscriptionId = (payload.data as Record<string, unknown>).id as string
        const customerId = attrs.customer_id as number | undefined
        const renewsAt = attrs.renews_at as string | null
        await supabase
          .from('users')
          .update({
            plan: 'pro',
            lemonsqueezy_subscription_id: subscriptionId,
            ...(customerId && { lemonsqueezy_customer_id: String(customerId) }),
            plan_expires_at: renewsAt ?? null,
          })
          .eq('id', userId)
        break
      }

      case 'subscription_updated': {
        const userId = getUserId(payload)
        if (!userId) break
        const attrs = getAttrs(payload)
        const renewsAt = attrs.renews_at as string | null
        const status = attrs.status as string
        // Only update expiry, keep plan as-is unless status changed
        if (status === 'active') {
          await supabase
            .from('users')
            .update({ plan_expires_at: renewsAt ?? null })
            .eq('id', userId)
        }
        break
      }

      case 'subscription_cancelled': {
        // Keep pro access until billing period ends (ends_at)
        const userId = getUserId(payload)
        if (!userId) break
        const attrs = getAttrs(payload)
        const endsAt = attrs.ends_at as string | null
        await supabase
          .from('users')
          .update({ plan: 'pro', plan_expires_at: endsAt })
          .eq('id', userId)
        break
      }

      case 'subscription_expired': {
        // Access window closed — downgrade to free
        const userId = getUserId(payload)
        if (!userId) break
        await supabase
          .from('users')
          .update({ plan: 'free', plan_expires_at: null, lemonsqueezy_subscription_id: null })
          .eq('id', userId)
        break
      }

      case 'subscription_resumed':
      case 'subscription_unpaused': {
        const userId = getUserId(payload)
        if (!userId) break
        const attrs = getAttrs(payload)
        const renewsAt = attrs.renews_at as string | null
        await supabase
          .from('users')
          .update({ plan: 'pro', plan_expires_at: renewsAt ?? null })
          .eq('id', userId)
        break
      }

      case 'subscription_payment_success': {
        // Renew — extend plan_expires_at to new renews_at
        const userId = getUserId(payload)
        if (!userId) break
        const attrs = getAttrs(payload)
        const renewsAt = attrs.renews_at as string | null
        if (renewsAt) {
          await supabase
            .from('users')
            .update({ plan: 'pro', plan_expires_at: renewsAt })
            .eq('id', userId)
        }
        break
      }

      case 'subscription_payment_failed': {
        // Log only — do not immediately downgrade
        const userId = getUserId(payload)
        console.warn('[LS Webhook] Payment failed for user:', userId)
        break
      }

      case 'order_refunded': {
        const userId = getUserId(payload)
        if (!userId) break
        await supabase
          .from('users')
          .update({ plan: 'free', plan_expires_at: null })
          .eq('id', userId)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[LS Webhook] DB error:', err)
    // Return 200 so LemonSqueezy doesn't keep retrying a DB error
    return NextResponse.json({ received: true, error: 'DB write failed' })
  }

  return NextResponse.json({ received: true })
}
