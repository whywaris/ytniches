"use client";

import * as React from "react";

import Link from "next/link";

import Fuse from "fuse.js";

import { SearchInput } from "@/components/ui/search-input";

export interface SearchEntry {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
}

// PRD.md §10.2: client-side Fuse.js over a tiny index built at build time.
// Algolia only if the catalog passes ~200 entries. Shared by the blog and
// the help center (hrefBase / label); tags carry headings for help articles.
function BlogSearch({
  entries,
  hrefBase = "/blog",
  label = "Search posts",
  noun = "posts",
}: {
  entries: SearchEntry[];
  hrefBase?: string;
  label?: string;
  noun?: string;
}) {
  const [query, setQuery] = React.useState("");
  const fuse = React.useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 2 },
          { name: "category", weight: 1 },
          { name: "excerpt", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [entries],
  );
  const trimmed = query.trim();
  const results = trimmed ? fuse.search(trimmed, { limit: 8 }).map((result) => result.item) : [];

  return (
    <div role="search" className="w-full max-w-md">
      <SearchInput
        aria-label={label}
        placeholder={label}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
      />
      {trimmed && (
        <div className="mt-2 rounded-md border border-border-subtle bg-bg-surface-1 p-2">
          <p role="status" className="px-2 py-1 text-caption text-text-secondary">
            {results.length === 0
              ? `No ${noun} match that.`
              : `${results.length} ${results.length === 1 ? "result" : "results"}`}
          </p>
          {results.length > 0 && (
            <ul>
              {results.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`${hrefBase}/${entry.slug}`}
                    className="block rounded-sm px-2 py-2 hover:bg-bg-hover"
                  >
                    <span className="block text-body-sm font-medium text-text-primary">
                      {entry.title}
                    </span>
                    <span className="block text-caption text-text-secondary">{entry.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export { BlogSearch };
