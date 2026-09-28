"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import {
  approveSuggestionAction,
  rejectSuggestionAction,
} from "@/app/(admin)/admin/discovery/actions";
import { NICHE_CATEGORIES } from "@/lib/discovery/config";
import type { NicheSuggestion } from "@/lib/services/admin";

// D-080: niches the classifier found missing from the curated list. Approve
// adds one (with a category) and re-queues unclassified channels.

const ERROR_COPY: Record<string, string> = {
  forbidden: "You're not allowed to do that.",
  not_found: "That suggestion was already reviewed.",
  duplicate: "A niche with that name already exists.",
};

const CATEGORY_OPTIONS = NICHE_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

function SuggestionRow({ suggestion }: { suggestion: NicheSuggestion }) {
  const { showToast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const [category, setCategory] = React.useState("");

  function report(
    result: { ok: true } | { ok: false; error: { type: string; message?: string } },
    success: string,
  ) {
    showToast(
      result.ok
        ? { title: success, variant: "success" }
        : {
            title: result.error.message ?? ERROR_COPY[result.error.type] ?? "Something went wrong.",
            variant: "error",
          },
    );
  }

  return (
    <li className="flex flex-wrap items-end gap-3 border-t border-border-subtle py-3 first:border-t-0">
      <div className="min-w-60 flex-1">
        <p className="text-body-sm font-medium text-text-primary">
          {suggestion.name}{" "}
          <span className="font-normal text-text-tertiary">
            · suggested {suggestion.timesSuggested}×
          </span>
        </p>
        <p className="text-body-sm text-text-secondary">{suggestion.description}</p>
        {suggestion.exampleChannel ? (
          <p className="text-caption text-text-tertiary">e.g. {suggestion.exampleChannel}</p>
        ) : null}
      </div>
      <div className="w-56">
        <Select
          label="Category"
          placeholder="Choose a category"
          options={CATEGORY_OPTIONS}
          value={category}
          disabled={pending}
          onValueChange={setCategory}
        />
      </div>
      <Button
        size="sm"
        loading={pending}
        disabled={!category}
        onClick={() =>
          startTransition(async () => {
            report(
              await approveSuggestionAction({ suggestionId: suggestion.id, category }),
              `Added "${suggestion.name}".`,
            );
          })
        }
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            report(
              await rejectSuggestionAction({ suggestionId: suggestion.id }),
              `Rejected "${suggestion.name}".`,
            );
          })
        }
      >
        Reject
      </Button>
    </li>
  );
}

function NicheSuggestions({ suggestions }: { suggestions: NicheSuggestion[] }) {
  return (
    <section aria-labelledby="niche-suggestions">
      <h2 id="niche-suggestions" className="mb-2 text-h4 font-semibold text-text-primary">
        Niche suggestions
      </h2>
      <Card>
        {suggestions.length === 0 ? (
          <p className="text-body-sm text-text-secondary">
            Nothing to review. The classifier suggests a niche when a channel fits none on the list.
          </p>
        ) : (
          <ul>
            {suggestions.map((suggestion) => (
              <SuggestionRow key={suggestion.id} suggestion={suggestion} />
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

export { NicheSuggestions };
