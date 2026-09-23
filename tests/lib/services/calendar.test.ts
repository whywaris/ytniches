import { beforeEach, describe, expect, it, vi } from "vitest";

function makeBuilder(getResult: () => { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    is: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(getResult())),
    single: vi.fn(() => Promise.resolve(getResult())),
    then: (resolve: (value: { data: unknown; error: unknown }) => void) => resolve(getResult()),
  };
  return builder;
}

let membersQueue: { data: unknown; error: unknown }[] = [];
let entriesResult: { data: unknown; error: unknown } = { data: null, error: null };
let channelsResult: { data: unknown; error: unknown } = { data: [], error: null };

function queueMembers(...results: { data: unknown; error: unknown }[]) {
  membersQueue = results;
}

const sessionFrom = vi.fn((table: string) => {
  if (table === "workspace_members") {
    return makeBuilder(() => membersQueue.shift() ?? { data: null, error: null });
  }
  if (table === "calendar_entries") return makeBuilder(() => entriesResult);
  if (table === "channels") return makeBuilder(() => channelsResult);
  throw new Error(`unexpected table ${table}`);
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const { createEntry, deleteEntry, listEntries, moveEntry, updateEntry } =
  await import("@/lib/services/calendar");

const ctx = { userId: "user-1", workspaceId: null, tier: null };

beforeEach(() => {
  membersQueue = [];
  entriesResult = { data: null, error: null };
  channelsResult = { data: [], error: null };
});

describe("createEntry", () => {
  it("rejects a viewer", async () => {
    queueMembers({ data: { role: "viewer" }, error: null });
    const result = await createEntry(ctx, "ws-1", { title: "New video" });
    expect(result).toEqual({ ok: false, error: { type: "not_contributor" } });
  });

  it("rejects an assignee who isn't a workspace member", async () => {
    queueMembers({ data: { role: "admin" }, error: null }, { data: null, error: null });
    const result = await createEntry(ctx, "ws-1", { title: "New video", assigneeId: "user-2" });
    expect(result).toEqual({ ok: false, error: { type: "assignee_not_member" } });
  });

  it("creates an entry as an editor, defaulting status to idea", async () => {
    queueMembers({ data: { role: "editor" }, error: null });
    entriesResult = {
      data: {
        id: "e1",
        workspace_id: "ws-1",
        user_id: "user-1",
        channel_id: null,
        title: "New video",
        description: null,
        linked_prompts: [],
        status: "idea",
        scheduled_for: null,
        assignee_id: null,
      },
      error: null,
    };

    const result = await createEntry(ctx, "ws-1", { title: "New video" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("idea");
    }
  });
});

describe("listEntries", () => {
  it("attaches channel names", async () => {
    entriesResult = {
      data: [
        {
          id: "e1",
          workspace_id: "ws-1",
          user_id: "user-1",
          channel_id: "chan-1",
          title: "New video",
          description: null,
          linked_prompts: [],
          status: "idea",
          scheduled_for: null,
          assignee_id: null,
        },
      ],
      error: null,
    };
    channelsResult = { data: [{ id: "chan-1", name: "Sleep Sounds" }], error: null };

    const result = await listEntries("ws-1", {});

    expect(result).toEqual([
      {
        id: "e1",
        workspaceId: "ws-1",
        userId: "user-1",
        channelId: "chan-1",
        channelName: "Sleep Sounds",
        title: "New video",
        description: null,
        linkedPrompts: [],
        status: "idea",
        scheduledFor: null,
        assigneeId: null,
      },
    ]);
  });
});

describe("updateEntry", () => {
  it("returns not_found for a missing entry", async () => {
    entriesResult = { data: null, error: null };
    const result = await updateEntry(ctx, "missing", { status: "scripted" });
    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("rejects a viewer", async () => {
    entriesResult = { data: { workspace_id: "ws-1" }, error: null };
    queueMembers({ data: { role: "viewer" }, error: null });
    const result = await updateEntry(ctx, "e1", { status: "scripted" });
    expect(result).toEqual({ ok: false, error: { type: "not_contributor" } });
  });

  it("updates status as an admin", async () => {
    entriesResult = { data: { workspace_id: "ws-1" }, error: null };
    queueMembers({ data: { role: "admin" }, error: null });
    const result = await updateEntry(ctx, "e1", { status: "scripted" });
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("moveEntry", () => {
  it("delegates to updateEntry with scheduledFor", async () => {
    entriesResult = { data: { workspace_id: "ws-1" }, error: null };
    queueMembers({ data: { role: "editor" }, error: null });
    const result = await moveEntry(ctx, "e1", "2026-02-01T00:00:00.000Z");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("deleteEntry", () => {
  it("returns not_found for a missing entry", async () => {
    entriesResult = { data: null, error: null };
    const result = await deleteEntry(ctx, "missing");
    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("soft-deletes as a contributor", async () => {
    entriesResult = { data: { workspace_id: "ws-1" }, error: null };
    queueMembers({ data: { role: "editor" }, error: null });
    const result = await deleteEntry(ctx, "e1");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});
