import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";

import {
  AUTH_EMAILS_PER_HOUR,
  LOCKOUT_MAX_FAILURES,
  LOCKOUT_WINDOW_SECONDS,
} from "@/lib/auth/forms";
import { getRedis } from "@/lib/cache/redis";

// Security.md §2.4 / D-083: 5 failed password sign-ins for one email in 15
// minutes locks password sign-in for that email for 15 minutes. The lock
// applies to any email, account or not, so it never reveals whether an
// account exists; it's checked before Supabase is called; and it never
// touches Google sign-in. Keys hold a hash of the email, not the address.

export { LOCKOUT_MAX_FAILURES, LOCKOUT_WINDOW_SECONDS };

function emailKey(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 32);
}

const failKey = (email: string) => `auth:login-fail:${emailKey(email)}`;
const lockKey = (email: string) => `auth:login-lock:${emailKey(email)}`;
const alertKey = (email: string) => `auth:login-alert:${emailKey(email)}`;

export async function isLocked(email: string): Promise<boolean> {
  return (await getRedis().exists(lockKey(email))) === 1;
}

export interface FailureResult {
  /** This failure locked the email. */
  locked: boolean;
  /** This is the first lock alert of the window: send the email. */
  sendAlert: boolean;
}

export async function recordFailure(email: string): Promise<FailureResult> {
  const redis = getRedis();
  const failures = await redis.incr(failKey(email));
  if (failures === 1) await redis.expire(failKey(email), LOCKOUT_WINDOW_SECONDS);
  if (failures < LOCKOUT_MAX_FAILURES) return { locked: false, sendAlert: false };

  await redis.set(lockKey(email), "1", { ex: LOCKOUT_WINDOW_SECONDS });
  // At most one alert email per lockout window.
  const firstAlert = await redis.set(alertKey(email), "1", {
    ex: LOCKOUT_WINDOW_SECONDS,
    nx: true,
  });
  return { locked: true, sendAlert: firstAlert === "OK" };
}

export async function clearFailures(email: string): Promise<void> {
  await getRedis().del(failKey(email));
}

// Security.md §2.5 / §2.6: 3 password-reset or verification emails per
// email per hour. Over the limit the request is silently dropped -- the
// page still shows the same neutral message.
let emailLimiter: Ratelimit | undefined;
export async function allowAuthEmail(kind: "reset" | "verify", email: string): Promise<boolean> {
  emailLimiter ??= new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(AUTH_EMAILS_PER_HOUR, "1 h"),
    prefix: "auth:email",
  });
  const { success } = await emailLimiter.limit(`${kind}:${emailKey(email)}`);
  return success;
}
