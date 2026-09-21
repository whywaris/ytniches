import { redirect } from "next/navigation";

import { getRequestContext } from "@/lib/context";
import { getChannelDetail } from "@/lib/services/channels";
import { ComparisonView } from "@/components/features/niche-finder/comparison-view";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare — Tracking — YTNiches",
};

function parseIds(raw: string | string[] | undefined): string[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return [];
  return [
    ...new Set(
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
}

// UI-UX-Flow.md §6.3. Reuses niche-finder's ComparisonView directly (no
// copy) -- it already renders 2-3 ChannelSearchResult-shaped channels
// side by side with a per-row leader outline, and getChannelDetail returns
// that exact shape.
export default async function TrackingComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ids = parseIds(params.ids);

  if (ids.length < 2 || ids.length > 3) {
    redirect("/tracking");
  }

  const ctx = await getRequestContext();
  const results = await Promise.all(ids.map((id) => getChannelDetail(ctx, id)));
  // A bad/deleted ID is silently dropped rather than failing the whole
  // page (same soft-fail as getChannelsByIds) -- re-checked against the
  // 2-3 bound after filtering, since dropping one could leave too few.
  const channels = results.flatMap((result) => (result.ok ? [result.value] : []));

  if (channels.length < 2 || channels.length > 3) {
    redirect("/tracking");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10">
      <h1 className="mb-6 text-h1 text-text-primary">Compare tracked channels</h1>
      <ComparisonView channels={channels} />
    </div>
  );
}
