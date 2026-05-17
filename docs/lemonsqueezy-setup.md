# LemonSqueezy Setup Guide

## Required environment variables

```env
# Server-side only
LEMONSQUEEZY_API_KEY=         # From LS Dashboard → API → Personal access tokens
LEMONSQUEEZY_STORE_ID=        # From LS Dashboard → Settings → Store
LEMONSQUEEZY_PRO_VARIANT_ID=  # From the Pro product's variant page
LEMONSQUEEZY_LIFETIME_VARIANT_ID=  # From the Lifetime product's variant page
LEMONSQUEEZY_WEBHOOK_SECRET=  # Set when creating webhook in LS dashboard

# Client-side (safe to expose)
NEXT_PUBLIC_APP_URL=https://yoursite.com
NEXT_PUBLIC_LS_PRO_VARIANT_ID=       # Same as server-side version
NEXT_PUBLIC_LS_LIFETIME_VARIANT_ID=  # Same as server-side version
```

## Products to create in LemonSqueezy

### Pro (subscription)
- Type: Subscription
- Billing: Monthly, $7/mo
- Copy the Variant ID from the variant URL

### Lifetime (one-time)
- Type: Single payment
- Price: $97 one-time
- Copy the Variant ID from the variant URL

## Webhook setup

1. Go to LS Dashboard → Webhooks → Add webhook
2. URL: `https://yoursite.com/api/webhooks/lemonsqueezy`
3. Set a strong secret and copy it to `LEMONSQUEEZY_WEBHOOK_SECRET`
4. Enable these events:
   - `order_created`
   - `order_refunded`
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_resumed`
   - `subscription_unpaused`
   - `subscription_payment_success`
   - `subscription_payment_failed`

## How user_id is passed through checkout

The `createCheckout()` call passes `custom: { user_id }` inside `checkout_data`. LemonSqueezy forwards this in every webhook as `meta.custom_data.user_id`. The webhook handler reads it via `getUserId(payload)` to update the correct Supabase row.

## Required Supabase columns on `public.users`

```sql
plan                          text default 'free'
lemonsqueezy_customer_id      text
lemonsqueezy_subscription_id  text
plan_expires_at               timestamptz
```

## Plan lifecycle

| Event | Action |
|---|---|
| `order_created` | Set `plan = 'lifetime'`, store `customer_id` |
| `subscription_created` | Set `plan = 'pro'`, store `subscription_id` + `customer_id`, set `plan_expires_at = renews_at` |
| `subscription_updated` | Update `plan_expires_at = renews_at` |
| `subscription_cancelled` | Keep `plan = 'pro'`, set `plan_expires_at = ends_at` (access until period ends) |
| `subscription_expired` | Downgrade to `plan = 'free'`, clear `subscription_id` + `plan_expires_at` |
| `subscription_payment_success` | Renew: set `plan = 'pro'`, `plan_expires_at = renews_at` |
| `subscription_payment_failed` | Log warning only — LS handles retry/dunning |
| `order_refunded` | Downgrade to `plan = 'free'` |

## Local testing with ngrok

```bash
ngrok http 3000
# Copy the https URL → use as webhook URL in LS dashboard (sandbox mode)
```

Use LemonSqueezy's test mode and sandbox store for local development.
