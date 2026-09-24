import Link from "next/link";

import { getBalance } from "@/lib/credits";
import { pluralize } from "@/lib/utils";
import { getPromptCount } from "@/lib/services/prompts";
import { getTrackedChannelCount } from "@/lib/services/tracking";
import type { RequestContext } from "@/lib/context";

// One compact line instead of four large metric cards.
async function StatsStrip({ ctx }: { ctx: RequestContext }) {
  const [balance, trackedChannelCount, promptCount] = await Promise.all([
    getBalance(ctx),
    getTrackedChannelCount(ctx),
    getPromptCount(ctx),
  ]);

  const stats = [
    { label: pluralize(balance, "credit"), value: balance, href: "/settings/billing" },
    {
      label: pluralize(trackedChannelCount, "tracked channel"),
      value: trackedChannelCount,
      href: "/tracking",
    },
    { label: pluralize(promptCount, "prompt"), value: promptCount, href: "/prompts" },
  ];

  return (
    <section aria-label="Your stats" className="mt-10 border-t border-border-subtle pt-4">
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-text-secondary">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className="hover:text-text-primary">
              <span className="font-semibold text-text-primary">{stat.value}</span> {stat.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { StatsStrip };
