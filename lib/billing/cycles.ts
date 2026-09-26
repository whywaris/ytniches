// Billing-period math. There's no billing-frequency column (Backend-Schema.md
// §2.3), so a period's length tells monthly from annual.

const DAY_MS = 86_400_000;

export function isAnnualPeriod(periodStart: string, periodEnd: string): boolean {
  return (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / DAY_MS > 300;
}

// start + n calendar months, clamped to the month's last day (Jan 31 -> Feb 28).
function addMonths(start: Date, months: number): Date {
  const target = new Date(start);
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(start.getUTCDate(), lastDay));
  return target;
}

// Whole monthly anniversaries passed since `start` (0 during the first month).
export function monthsElapsed(start: Date, now: Date): number {
  let months =
    (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + now.getUTCMonth() - start.getUTCMonth();
  if (addMonths(start, months) > now) months -= 1;
  return Math.max(0, months);
}
