// D-081: free public beta. While BETA_MODE is on:
// - every new account gets the trial (Pro features, trial limits) with no
//   expiry -- D-057's expiry is paused (lib/services/billing.ts);
// - trial credits refill monthly (workers/credit-cycles.ts);
// - there is no checkout: /pricing and the upgrade modal show one Beta
//   card ($0) with the paid plans below it as "Plans after beta" (real
//   prices, no buttons), and createCheckout refuses.
// Turning it off (when billing goes live) needs the 14-day notice email to
// every beta user first -- not built yet (DECISIONS.md D-081).
export const BETA_MODE = true;

export const BETA_BANNER = "Free during beta — paid plans coming soon";

// Beta users are emailed this many days before paid plans start.
export const BETA_NOTICE_DAYS = 14;

// The beta's price, in whole dollars (shown as "$0").
export const BETA_PRICE = 0;

// Under "Plans after beta" (D-081 notice).
export const BETA_NOTICE_LINE = "Beta users will get notice before any paid plan starts.";
