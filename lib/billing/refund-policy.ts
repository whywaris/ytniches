// Monetization.md §6.2, the public refund policy. Shown by the help
// center's Refunds article until /legal/refunds exists (D-058).
export const REFUND_POLICY = {
  // Money-back guarantee on a first purchase, monthly or annual.
  guaranteeDays: 14,
  // Annual plans: pro-rated refund of unused whole months if cancelled
  // within this many days of purchase.
  annualProRataWindowDays: 30,
} as const;
