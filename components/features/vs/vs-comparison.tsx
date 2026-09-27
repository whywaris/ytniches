import { Check, Minus, X } from "lucide-react";

import { TIER_INFO, TIERS, trialSummary } from "@/lib/billing/plans";
import { FEATURE_LABELS, YTNICHES } from "@/content/vs/ytniches";
import type { Cell, CompetitorPage } from "@/content/vs/types";
import { CtaLink } from "@/components/features/landing/cta-link";
import { FINAL_CTA } from "@/components/features/landing/content";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatCheckedOn(date: string): string {
  return DATE.format(new Date(`${date}T00:00:00Z`));
}

const STATUS_TEXT: Record<Cell["status"], string> = {
  yes: "Yes",
  partial: "Partly",
  no: "No",
  "not-listed": "Not listed on their site",
};

function CellView({ cell }: { cell: Cell }) {
  const icon =
    cell.status === "yes" ? (
      <Check aria-hidden="true" className="size-4 shrink-0 text-success" />
    ) : cell.status === "partial" ? (
      <Minus aria-hidden="true" className="size-4 shrink-0 text-warning" />
    ) : cell.status === "no" ? (
      <X aria-hidden="true" className="size-4 shrink-0 text-text-tertiary" />
    ) : null;
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div>
        <span
          className={
            cell.status === "not-listed"
              ? "text-body-sm text-text-secondary italic"
              : "text-body-sm text-text-primary"
          }
        >
          {STATUS_TEXT[cell.status]}
        </span>
        {cell.note && <span className="block text-caption text-text-secondary">{cell.note}</span>}
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-20">
      <h2 id={id} className="text-h2 font-semibold text-text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

// PRD.md §10.5 / UI-UX-Flow.md §2.4: hero, feature table, pricing, when to
// choose each, CTA. Text only, no competitor logos. Facts come from
// content/vs/<id>.ts with their sources and check date.
function VsComparison({ page }: { page: CompetitorPage }) {
  const checked = formatCheckedOn(page.checkedOn);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl">
        <p className="text-caption font-semibold tracking-wide text-text-secondary uppercase">
          Honest comparison
        </p>
        <h1 className="mt-2 text-display-sm font-semibold tracking-tight text-text-primary">
          YTNiches vs {page.name}
        </h1>
        <p className="mt-4 text-body-lg text-text-secondary">
          {page.bestFor.them} {page.bestFor.us}
        </p>
        <p className="mt-4 text-caption text-text-secondary">
          Last checked: <time dateTime={page.checkedOn}>{checked}</time>, from {page.name}&apos;s
          own website.
        </p>
      </header>

      <Section id="features-heading" title="Feature by feature">
        <div className="mt-6 overflow-x-auto rounded-md border border-border-subtle">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">
              Features of YTNiches and {page.name}, checked {checked}
            </caption>
            <thead className="bg-bg-surface-1">
              <tr>
                <th
                  scope="col"
                  className="w-1/3 px-4 py-3 text-body-sm font-semibold text-text-primary"
                >
                  Feature
                </th>
                <th scope="col" className="px-4 py-3 text-body-sm font-semibold text-text-primary">
                  YTNiches
                </th>
                <th scope="col" className="px-4 py-3 text-body-sm font-semibold text-text-primary">
                  {page.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => (
                <tr key={row.key} className="border-t border-border-subtle align-top">
                  <th scope="row" className="px-4 py-3 text-body-sm font-medium text-text-primary">
                    {FEATURE_LABELS[row.key]}
                  </th>
                  <td className="px-4 py-3">
                    <CellView cell={YTNICHES[row.key]} />
                  </td>
                  <td className="px-4 py-3">
                    <CellView cell={row.them} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-caption text-text-secondary">
          &ldquo;Not listed on their site&rdquo; means we couldn&apos;t find it on {page.name}
          &apos;s own pages, not that it doesn&apos;t exist.
        </p>
      </Section>

      <Section id="pricing-heading" title="Pricing">
        <p className="mt-2 text-body-sm text-text-secondary">
          Prices checked {checked}. Monthly prices in USD.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-md border border-accent-border bg-bg-surface-1 p-6">
            <h3 className="text-h4 font-semibold text-text-primary">YTNiches</h3>
            <ul className="mt-4 space-y-3">
              {TIERS.map((tier) => {
                const info = TIER_INFO[tier];
                return (
                  <li key={tier} className="flex items-baseline justify-between gap-4">
                    <span className="text-body text-text-primary">{info.label}</span>
                    <span className="text-body-sm text-text-secondary">
                      <span className="text-body font-semibold text-text-primary">
                        ${info.monthlyPrice}
                      </span>
                      /mo · ${info.yearlyPrice}/yr
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-caption text-text-secondary">
              Team includes 3 seats. Free trial: {trialSummary()}.
            </p>
          </div>

          <div className="rounded-md border border-border-subtle bg-bg-surface-1 p-6">
            <h3 className="text-h4 font-semibold text-text-primary">{page.name}</h3>
            {page.pricing.kind === "listed" ? (
              <>
                <ul className="mt-4 space-y-3">
                  {page.pricing.tiers.map((tier) => (
                    <li key={tier.name}>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-body text-text-primary">{tier.name}</span>
                        <span className="text-body-sm text-text-secondary">
                          <span className="text-body font-semibold text-text-primary">
                            {tier.monthly}
                          </span>
                          /mo{tier.annual ? ` · ${tier.annual}` : ""}
                        </span>
                      </div>
                      <p className="text-caption text-text-secondary">{tier.details.join(" · ")}</p>
                    </li>
                  ))}
                </ul>
                {page.pricing.notes.map((note) => (
                  <p key={note} className="mt-3 text-caption text-text-secondary">
                    {note}
                  </p>
                ))}
              </>
            ) : (
              <>
                <p className="mt-4 text-body-sm text-text-secondary">{page.pricing.reason}</p>
                <ul className="mt-4 space-y-3">
                  {page.pricing.plans.map((plan) => (
                    <li key={plan.name}>
                      <span className="text-body text-text-primary">{plan.name}</span>
                      <p className="text-caption text-text-secondary">{plan.details.join(" · ")}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-4 text-caption text-text-secondary">Free trial: {page.trial}</p>
            <a
              href={page.pricingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-body-sm font-medium text-accent-text hover:underline"
            >
              See {page.name}&apos;s current pricing
              <span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          </div>
        </div>
      </Section>

      <div className="mt-20 grid gap-6 md:grid-cols-2">
        <section
          aria-labelledby="choose-them"
          className="rounded-md border border-border-subtle p-6"
        >
          <h2 id="choose-them" className="text-h3 font-semibold text-text-primary">
            When to choose {page.name}
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-text-secondary">
            {page.chooseThem.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="choose-us" className="rounded-md border border-border-subtle p-6">
          <h2 id="choose-us" className="text-h3 font-semibold text-text-primary">
            When to choose YTNiches
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-text-secondary">
            {page.chooseUs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section
        aria-labelledby="vs-cta"
        className="mt-20 rounded-md border border-accent-border bg-accent-subtle p-6 text-center md:p-10"
      >
        <h2 id="vs-cta" className="text-h2 font-semibold text-text-primary">
          Research, then keep going.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-body-lg text-text-secondary">
          {FINAL_CTA.subhead}
        </p>
        <CtaLink
          href="/signup"
          event="vs_cta_click"
          eventProps={{ competitor: page.id }}
          className="mt-6"
        >
          Start free trial
        </CtaLink>
      </section>

      <footer className="mt-12 border-t border-border-subtle pt-6">
        <h2 className="text-body-sm font-semibold text-text-primary">Sources</h2>
        <ul className="mt-2 space-y-1 text-caption text-text-secondary">
          {page.sources.map((source) => (
            <li key={source.url}>
              {source.label}:{" "}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-text hover:underline"
              >
                {source.url}
              </a>{" "}
              (checked {checked})
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}

export { VsComparison };
