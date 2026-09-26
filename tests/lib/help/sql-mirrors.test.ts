import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { DIGEST_LOCAL_HOUR } from "@/lib/notifications/digest-config";
import { INVITE_EXPIRY_DAYS } from "@/lib/help/facts";
import { EMBEDDING_DIMENSIONS } from "@/lib/ai/client";
import { RESERVED_NICHE_SLUGS, TIER_INTERVAL_DAYS } from "@/lib/discovery/config";

// These TS constants mirror values the database decides. The help center
// shows the TS side, so it must match the SQL that actually runs.
const migration = (name: string) =>
  readFileSync(path.join(process.cwd(), "supabase", "migrations", name), "utf8");

describe("TS constants mirror the SQL", () => {
  it("DIGEST_LOCAL_HOUR matches find_due_digest_user_ids", () => {
    const sql = migration("20260922120001_create_find_due_digest_user_ids_function.sql");
    const hour = /extract\(hour from \(now\(\) at time zone p\.time_zone\)\)::int = (\d+)/.exec(
      sql,
    );
    expect(Number(hour?.[1])).toBe(DIGEST_LOCAL_HOUR);
  });

  it("INVITE_EXPIRY_DAYS matches workspace_invitations.expires_at", () => {
    const sql = migration("20260923100001_create_workspace_tables.sql");
    const days = /expires_at[^,]*interval '(\d+) days'/.exec(sql);
    expect(Number(days?.[1])).toBe(INVITE_EXPIRY_DAYS);
  });

  it("RESERVED_NICHE_SLUGS matches the niches.slug check", () => {
    const sql = migration("20260928100002_create_discovery_tables.sql");
    for (const slug of RESERVED_NICHE_SLUGS) {
      expect(sql).toContain(`slug <> '${slug}'`);
    }
  });

  it("EMBEDDING_DIMENSIONS matches niches.embedding", () => {
    const sql = migration("20260928100002_create_discovery_tables.sql");
    const dims = /embedding extensions\.vector\((\d+)\)/.exec(sql);
    expect(Number(dims?.[1])).toBe(EMBEDDING_DIMENSIONS);
  });

  it("refresh tiers match the channels.refresh_tier check", () => {
    const sql = migration("20260928100002_create_discovery_tables.sql");
    const tiers = /refresh_tier in \(([^)]*)\)/.exec(sql)?.[1];
    expect(tiers?.match(/'(\w+)'/g)?.map((t) => t.slice(1, -1))).toEqual(
      Object.keys(TIER_INTERVAL_DAYS),
    );
  });
});
