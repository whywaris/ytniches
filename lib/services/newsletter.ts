import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "@/lib/cache/redis";
import { getResendClient } from "@/lib/email/client";
import { err, ok, type Result } from "@/lib/result";

// D-053: blog newsletter = Resend contacts in the "Newsletter" segment.
// No subscriber table; sending happens later through Resend Broadcasts,
// which owns unsubscribe. The form is public, so each IP gets a small
// hourly allowance.

export type NewsletterError =
  { type: "unavailable" } | { type: "rate_limited" } | { type: "failed" };

let limiter: Ratelimit | undefined;
function getLimiter(): Ratelimit {
  limiter ??= new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "ratelimit:newsletter",
  });
  return limiter;
}

export async function subscribeToNewsletter(
  email: string,
  ip: string,
): Promise<Result<void, NewsletterError>> {
  const resend = getResendClient();
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  if (!resend || !segmentId) return err({ type: "unavailable" });

  const { success } = await getLimiter().limit(ip);
  if (!success) return err({ type: "rate_limited" });

  const created = await resend.contacts.create({ email, segments: [{ id: segmentId }] });
  if (!created.error) return ok(undefined);

  // Most likely the contact already exists (contacts are account-wide):
  // put them in the segment instead. Either way the reply is the same
  // "you're in", so the form never reveals who is already subscribed.
  const added = await resend.contacts.segments.add({ email, segmentId });
  if (!added.error) return ok(undefined);

  console.error("newsletter signup failed", created.error.message, added.error.message);
  return err({ type: "failed" });
}
