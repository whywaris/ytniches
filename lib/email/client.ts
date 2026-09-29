import { Resend } from "resend";

// TRD.md §6.4: Resend wrapper. "hello@ytniches.com" is for transactional
// mail (welcome/verify/reset -- Supabase Auth's own emails, not this
// module); notifications + digests use "updates@ytniches.com" per TRD's
// own from-address split, since they're the easy-opt-out category.
export const NOTIFICATIONS_FROM_ADDRESS = "YTNiches <updates@ytniches.com>";
// Account-security mail the app sends itself (D-083 lockout alert); the
// same address Supabase Auth's own emails use.
export const SECURITY_FROM_ADDRESS = "YTNiches <hello@ytniches.com>";

let client: Resend | undefined;

export function getResendClient(): Resend | undefined {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return undefined;
  client ??= new Resend(apiKey);
  return client;
}
