import { z } from "zod";

// Security.md §2.1 / D-083: the password rules, checked in the form, in the
// server action and again by Supabase Auth's own policy (min length 12,
// lower + upper + digit). Supabase's leaked-password check (HaveIBeenPwned)
// runs on top when enabled.
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_RULES = [
  {
    test: (value: string) => value.length >= PASSWORD_MIN_LENGTH,
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
  },
  { test: (value: string) => /[a-z]/.test(value), label: "A lowercase letter" },
  { test: (value: string) => /[A-Z]/.test(value), label: "An uppercase letter" },
  { test: (value: string) => /[0-9]/.test(value), label: "A number" },
] as const;

export const passwordSchema = z
  .string()
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters.`)
  .refine((value) => PASSWORD_RULES.every((rule) => rule.test(value)), {
    message: `Use at least ${PASSWORD_MIN_LENGTH} characters, with a lowercase letter, an uppercase letter and a number.`,
  });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254, "Enter a valid email address.");
