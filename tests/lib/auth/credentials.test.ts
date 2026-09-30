import { describe, expect, it } from "vitest";

import { emailSchema, PASSWORD_RULES, passwordSchema } from "@/lib/auth/credentials";

// Security.md §2.1: 12+ characters with a lowercase letter, an uppercase
// letter and a number.
describe("password rules", () => {
  it.each([
    ["Correct-Horse-9", true],
    ["Abcdefghij12", true],
    ["short1A", false],
    ["alllowercase123", false],
    ["ALLUPPERCASE123", false],
    ["NoNumbersHereAtAll", false],
    [`Aa1${"x".repeat(126)}`, false],
  ])("%s -> %s", (password, ok) => {
    expect(passwordSchema.safeParse(password).success).toBe(ok);
  });

  it("the checklist the form shows is the same rule set", () => {
    const value = "Correct-Horse-9";
    expect(PASSWORD_RULES.every((rule) => rule.test(value))).toBe(true);
    expect(PASSWORD_RULES.filter((rule) => rule.test("abc")).map((rule) => rule.label)).toEqual([
      "A lowercase letter",
    ]);
  });
});

describe("email", () => {
  it("trims and lower-cases, and rejects junk", () => {
    expect(emailSchema.parse("  Mac@YTNiches.com ")).toBe("mac@ytniches.com");
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});
