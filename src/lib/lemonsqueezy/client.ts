// LemonSqueezy REST API client — no official npm SDK exists

const LS_API_BASE = 'https://api.lemonsqueezy.com/v1'

function getHeaders() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) throw new Error('LEMONSQUEEZY_API_KEY is not set')
  return {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${apiKey}`,
  }
}

async function lsFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${LS_API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers as Record<string, string>) },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`LemonSqueezy API error ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export interface LSCheckoutResponse {
  data: { id: string; attributes: { url: string } }
}

/** Create a checkout session and return the checkout URL */
export async function createCheckout({
  variantId,
  userEmail,
  userId,
  successUrl,
}: {
  variantId: string
  userEmail: string
  userId: string
  successUrl?: string
}): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  if (!storeId) throw new Error('LEMONSQUEEZY_STORE_ID is not set')

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: userEmail,
          custom: { user_id: userId },
        },
        ...(successUrl && {
          product_options: { redirect_url: successUrl },
        }),
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
        variant: { data: { type: 'variants', id: variantId } },
      },
    },
  }

  const res = await lsFetch<LSCheckoutResponse>('/checkouts', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return res.data.attributes.url
}

export interface LSSubscriptionResponse {
  data: {
    id: string
    attributes: {
      status: string
      renews_at: string | null
      ends_at: string | null
      urls: { customer_portal: string }
    }
  }
}

/** Fetch subscription data (includes customer portal URL) */
export async function getSubscription(subscriptionId: string): Promise<LSSubscriptionResponse['data']> {
  const res = await lsFetch<LSSubscriptionResponse>(`/subscriptions/${subscriptionId}`)
  return res.data
}

/** Get the customer portal URL for subscription management */
export async function getCustomerPortalUrl(subscriptionId: string): Promise<string> {
  const sub = await getSubscription(subscriptionId)
  return sub.attributes.urls.customer_portal
}

/** Cancel a subscription */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await lsFetch(`/subscriptions/${subscriptionId}`, { method: 'DELETE' })
}
