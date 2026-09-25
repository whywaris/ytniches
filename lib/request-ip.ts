import { headers } from "next/headers";

// The visitor's IP for per-IP rate limits on public forms. Vercel puts the
// real client first in x-forwarded-for. Missing header (local dev) means
// everyone shares one bucket, which only errs on the strict side.
export async function getClientIp(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
