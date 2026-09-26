import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
type QueryResult = { data: Row[] | null; error: unknown };

// Every chain method returns the builder; awaiting it resolves the next
// queued result for that table.
const queues: Record<string, QueryResult[]> = {};
function builder(table: string) {
  const b: Record<string, unknown> = {};
  for (const method of ["select", "in", "eq", "order"]) b[method] = vi.fn(() => b);
  b.then = (resolve: (value: QueryResult) => void) =>
    resolve(queues[table]?.shift() ?? { data: [], error: null });
  return b;
}
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: (table: string) => builder(table) }),
}));

const { getEffectivePlans, usersAffectedByPlanOf } = await import("@/lib/billing/effective-plan");

function given({ own = [] as Row[], memberships = [] as Row[], owners = [] as Row[] }) {
  queues.subscriptions = [
    { data: own, error: null },
    { data: owners, error: null },
  ];
  queues.workspace_members = [{ data: memberships, error: null }];
}

beforeEach(() => {
  for (const key of Object.keys(queues)) delete queues[key];
});

describe("getEffectivePlans (D-059)", () => {
  it("uses the user's own plan when they're in no Team workspace", async () => {
    given({ own: [{ user_id: "u1", tier: "pro", status: "active" }] });
    expect((await getEffectivePlans(["u1"])).get("u1")).toEqual({
      tier: "pro",
      status: "active",
      teamWorkspaceId: null,
    });
  });

  it("gives a member Team while the owner's Team plan is live", async () => {
    given({
      own: [{ user_id: "member", tier: "starter", status: "active" }],
      memberships: [{ user_id: "member", workspace_id: "ws-1", workspaces: { owner_id: "owner" } }],
      owners: [{ user_id: "owner", status: "active" }],
    });
    expect((await getEffectivePlans(["member"])).get("member")).toEqual({
      tier: "team",
      status: "active",
      teamWorkspaceId: "ws-1",
    });
  });

  it("gives Team to a member with no subscription of their own", async () => {
    given({
      memberships: [{ user_id: "member", workspace_id: "ws-1", workspaces: { owner_id: "owner" } }],
      owners: [{ user_id: "owner", status: "past_due" }],
    });
    expect((await getEffectivePlans(["member"])).get("member")).toMatchObject({
      tier: "team",
      teamWorkspaceId: "ws-1",
    });
  });

  it("falls back to the member's own plan once the owner's Team lapses", async () => {
    given({
      own: [{ user_id: "member", tier: "starter", status: "active" }],
      memberships: [{ user_id: "member", workspace_id: "ws-1", workspaces: { owner_id: "owner" } }],
      owners: [{ user_id: "owner", status: "cancelled" }],
    });
    expect((await getEffectivePlans(["member"])).get("member")).toEqual({
      tier: "starter",
      status: "active",
      teamWorkspaceId: null,
    });
  });

  it("puts the owner in their own workspace's shared pool too", async () => {
    given({
      own: [{ user_id: "owner", tier: "team", status: "active" }],
      memberships: [{ user_id: "owner", workspace_id: "ws-1", workspaces: { owner_id: "owner" } }],
      owners: [{ user_id: "owner", status: "active" }],
    });
    expect((await getEffectivePlans(["owner"])).get("owner")).toEqual({
      tier: "team",
      status: "active",
      teamWorkspaceId: "ws-1",
    });
  });

  it("uses the earliest-joined live Team workspace when there are several", async () => {
    given({
      memberships: [
        { user_id: "m", workspace_id: "ws-dead", workspaces: { owner_id: "lapsed" } },
        { user_id: "m", workspace_id: "ws-first", workspaces: { owner_id: "o1" } },
        { user_id: "m", workspace_id: "ws-second", workspaces: { owner_id: "o2" } },
      ],
      owners: [
        { user_id: "lapsed", status: "cancelled" },
        { user_id: "o1", status: "active" },
        { user_id: "o2", status: "active" },
      ],
    });
    expect((await getEffectivePlans(["m"])).get("m")?.teamWorkspaceId).toBe("ws-first");
  });

  it("returns no plan for someone with nothing", async () => {
    given({});
    expect((await getEffectivePlans(["nobody"])).get("nobody")).toEqual({
      tier: null,
      status: null,
      teamWorkspaceId: null,
    });
  });
});

describe("usersAffectedByPlanOf", () => {
  it("is the user plus every member of workspaces they own", async () => {
    queues.workspace_members = [
      { data: [{ user_id: "owner" }, { user_id: "m1" }, { user_id: "m2" }], error: null },
    ];
    expect(await usersAffectedByPlanOf("owner")).toEqual(["owner", "m1", "m2"]);
  });
});
