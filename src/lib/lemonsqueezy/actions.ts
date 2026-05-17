'use server'

import { createClient } from '@/lib/supabase/server'
import { createCheckout, cancelSubscription, getSubscription } from './client'
import { redirect } from 'next/navigation'

const PRO_VARIANT_ID = process.env.NEXT_PUBLIC_LS_PRO_VARIANT_ID!
const LIFETIME_VARIANT_ID = process.env.NEXT_PUBLIC_LS_LIFETIME_VARIANT_ID!
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('users')
    .select('email, lemonsqueezy_subscription_id, plan')
    .eq('id', user.id)
    .single()
  return { user, profile }
}

export async function createProCheckout(userId: string, userEmail: string): Promise<string> {
  if (!PRO_VARIANT_ID) throw new Error('NEXT_PUBLIC_LS_PRO_VARIANT_ID is not set')
  return createCheckout({
    variantId: PRO_VARIANT_ID,
    userEmail,
    userId,
    successUrl: `${APP_URL}/payment/success?plan=pro`,
  })
}

export async function createLifetimeCheckout(userId: string, userEmail: string): Promise<string> {
  if (!LIFETIME_VARIANT_ID) throw new Error('NEXT_PUBLIC_LS_LIFETIME_VARIANT_ID is not set')
  return createCheckout({
    variantId: LIFETIME_VARIANT_ID,
    userEmail,
    userId,
    successUrl: `${APP_URL}/payment/success?plan=lifetime`,
  })
}

export async function cancelProSubscription(subscriptionId: string): Promise<void> {
  await cancelSubscription(subscriptionId)
}

export async function getSubscriptionStatus(subscriptionId: string) {
  return getSubscription(subscriptionId)
}

export async function redirectToProCheckout() {
  const { user, profile } = await getAuthenticatedUser()
  const url = await createProCheckout(user.id, profile?.email ?? user.email ?? '')
  redirect(url)
}

export async function redirectToLifetimeCheckout() {
  const { user, profile } = await getAuthenticatedUser()
  const url = await createLifetimeCheckout(user.id, profile?.email ?? user.email ?? '')
  redirect(url)
}
