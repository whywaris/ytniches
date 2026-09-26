"use client";

import * as React from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { TextInput } from "@/components/ui/text-input";
import { useToast } from "@/components/ui/toast-provider";
import {
  addSeedAction,
  removeSeedAction,
  triggerJobAction,
} from "@/app/(admin)/admin/discovery/actions";
import type { ManualJob } from "@/lib/discovery/events";
import type { DiscoverySeed } from "@/lib/services/discovery/seeds";

type ActionError = { type: string; message?: string };

const ERROR_COPY: Record<string, string> = {
  forbidden: "You're not allowed to do that.",
  invalid_keyword: "Keywords are 2–80 characters.",
  duplicate: "That keyword is already a seed.",
};

function describe(error: ActionError): string {
  return error.message ?? ERROR_COPY[error.type] ?? "Something went wrong.";
}

const JOBS: { job: ManualJob; label: string; hint: string }[] = [
  { job: "discovery", label: "Run discovery", hint: "Search due seeds (100 units each)" },
  { job: "enrichment", label: "Run enrichment", hint: "Refresh due channels" },
  { job: "classify", label: "Run classify", hint: "Label niches (AI, no quota)" },
  { job: "snapshot", label: "Run snapshot", hint: "Recompute scores" },
  { job: "purge", label: "Run purge", hint: "Delete data older than 30 days" },
];

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function DiscoveryControls({ seeds }: { seeds: DiscoverySeed[] }) {
  const { showToast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const [keyword, setKeyword] = React.useState("");
  const [priority, setPriority] = React.useState("5");

  function report(result: { ok: true } | { ok: false; error: ActionError }, success: string) {
    showToast(
      result.ok
        ? { title: success, variant: "success" }
        : { title: describe(result.error), variant: "error" },
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="discovery-jobs">
        <h2 id="discovery-jobs" className="mb-2 text-h4 font-semibold text-text-primary">
          Jobs
        </h2>
        <Card>
          <p className="mb-3 text-body-sm text-text-secondary">
            Jobs run on their own schedule. A manual run obeys the same quota budget.
          </p>
          <div className="flex flex-wrap gap-2">
            {JOBS.map(({ job, label, hint }) => (
              <Button
                key={job}
                size="sm"
                variant="secondary"
                title={hint}
                loading={pending}
                onClick={() =>
                  startTransition(async () => {
                    report(await triggerJobAction({ job }), `${label} queued.`);
                  })
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </Card>
      </section>

      <section aria-labelledby="discovery-seeds">
        <h2 id="discovery-seeds" className="mb-2 text-h4 font-semibold text-text-primary">
          Seeds
        </h2>
        <Card>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await addSeedAction({ keyword, priority });
                report(result, `Added "${keyword.trim()}".`);
                if (result.ok) setKeyword("");
              });
            }}
          >
            <div className="min-w-60 flex-1">
              <TextInput
                label="Keyword"
                value={keyword}
                maxLength={80}
                onChange={(event) => setKeyword(event.target.value)}
                required
              />
            </div>
            <div className="w-28">
              <TextInput
                label="Priority (1–10)"
                type="number"
                min={1}
                max={10}
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm" loading={pending} disabled={keyword.trim().length < 2}>
              Add seed
            </Button>
          </form>

          <table className="mt-4 w-full text-left text-body-sm">
            <thead className="text-caption text-text-secondary">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Keyword
                </th>
                <th scope="col" className="py-2 font-medium">
                  Source
                </th>
                <th scope="col" className="py-2 font-medium">
                  Priority
                </th>
                <th scope="col" className="py-2 font-medium">
                  Last run
                </th>
                <th scope="col" className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {seeds.map((seed) => (
                <tr key={seed.id} className="border-t border-border-subtle">
                  <td className="py-2 text-text-primary">{seed.keyword}</td>
                  <td className="py-2">
                    <Tag tone={seed.source === "manual" ? "neutral" : "info"}>{seed.source}</Tag>
                  </td>
                  <td className="py-2 text-text-secondary tabular-nums">{seed.priority}</td>
                  <td className="py-2 text-text-secondary">
                    {seed.lastRunAt ? DATE.format(new Date(seed.lastRunAt)) : "Never"}
                  </td>
                  <td className="py-2 text-right">
                    <Button
                      size="xs"
                      variant="ghost"
                      iconOnly
                      aria-label={`Remove ${seed.keyword}`}
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          report(await removeSeedAction({ seedId: seed.id }), "Seed removed.");
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

export { DiscoveryControls };
