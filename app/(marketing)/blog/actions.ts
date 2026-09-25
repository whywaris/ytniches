"use server";

import { z } from "zod";

import { getClientIp } from "@/lib/request-ip";
import { subscribeToNewsletter } from "@/lib/services/newsletter";

export type NewsletterState =
  { status: "idle" } | { status: "success" } | { status: "error"; message: string };

const EmailSchema = z.email().max(254);

const ERROR_COPY = {
  unavailable: "Signups aren't open yet. Check back soon.",
  rate_limited: "Too many tries. Wait a bit and try again.",
  failed: "Something went wrong. Try again in a minute.",
} as const;

export async function subscribeAction(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot: a hidden field real people never fill in. Bots get a fake success.
  if (formData.get("company")) return { status: "success" };

  const email = EmailSchema.safeParse(
    String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  );
  if (!email.success) return { status: "error", message: "Enter a valid email address." };

  const result = await subscribeToNewsletter(email.data, await getClientIp());
  return result.ok
    ? { status: "success" }
    : { status: "error", message: ERROR_COPY[result.error.type] };
}
