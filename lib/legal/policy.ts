// The facts our legal pages state about the business (D-058, D-067f).
// Numbers reach the pages through <Fact> (lib/help/facts.ts), never typed.
export const LEGAL = {
  operator: "Waris Jamil",
  entity: "Waris Jamil, a sole proprietor",
  governingLaw: "Pakistan",
  minimumAge: 16,
  // Export, correction and deletion requests are completed within this.
  dataRequestDays: 30,
  // Liability is capped at the fees paid in this many months before a claim.
  liabilityCapMonths: 12,
} as const;
