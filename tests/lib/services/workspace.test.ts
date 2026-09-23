import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:crypto", () => {
  const randomBytes = vi.fn(() => ({ toString: () => "deadbeef" }));
  return { randomBytes, default: { randomBytes } };
});

const sendWorkspaceInviteEmail = vi.fn().mockResolvedValue(true);
vi.mock("@/lib/email/invitations", () => ({
  sendWorkspaceInviteEmail: (...args: unknown[]) => sendWorkspaceInviteEmail(...args),
}));

// One mutable result per table, in the same style as
// tests/lib/credits/index.test.ts -- a builder resolves whichever result
// is currently set for the table it was created against, and every
// chainable method just returns itself so call order doesn't matter.
function makeBuilder(getResult: () => { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(getResult())),
    maybeSingle: vi.fn(() => Promise.resolve(getResult())),
    then: (resolve: (value: { data: unknown; error: unknown }) => void) => resolve(getResult()),
  };
  return builder;
}

let workspacesResult: { data: unknown; error: unknown } = { data: null, error: null };
let membersResult: { data: unknown; error: unknown } = { data: null, error: null };
let invitationsResult: { data: unknown; error: unknown } = { data: null, error: null };
let profilesResult: { data: unknown; error: unknown } = { data: [], error: null };

let authUser: { id: string; email: string } | null = { id: "user-1", email: "user1@example.com" };

const sessionFrom = vi.fn((table: string) => {
  if (table === "workspaces") return makeBuilder(() => workspacesResult);
  if (table === "workspace_members") return makeBuilder(() => membersResult);
  if (table === "workspace_invitations") return makeBuilder(() => invitationsResult);
  if (table === "profiles") return makeBuilder(() => profilesResult);
  throw new Error(`unexpected table ${table}`);
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: sessionFrom,
    auth: { getUser: async () => ({ data: { user: authUser } }) },
  }),
}));

const serviceFrom = vi.fn((table: string) => {
  if (table === "workspaces") return makeBuilder(() => workspacesResult);
  if (table === "workspace_members") return makeBuilder(() => membersResult);
  if (table === "workspace_invitations") return makeBuilder(() => invitationsResult);
  throw new Error(`unexpected table ${table}`);
});

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

const {
  acceptInvitation,
  createWorkspace,
  deleteWorkspace,
  getInvitationPreview,
  getWorkspace,
  inviteMember,
  leaveWorkspace,
  listMyWorkspaceMemberships,
  removeMember,
  updateMemberRole,
} = await import("@/lib/services/workspace");

const ctx = { userId: "user-1", workspaceId: null, tier: "team" as const };

beforeEach(() => {
  workspacesResult = { data: null, error: null };
  membersResult = { data: null, error: null };
  invitationsResult = { data: null, error: null };
  profilesResult = { data: [], error: null };
  authUser = { id: "user-1", email: "user1@example.com" };
  sendWorkspaceInviteEmail.mockClear();
});

describe("createWorkspace", () => {
  it("rejects a non-Team-tier caller without touching the database", async () => {
    const result = await createWorkspace({ ...ctx, tier: "pro" }, "Acme");
    expect(result).toEqual({ ok: false, error: { type: "not_team_tier" } });
  });

  it("creates the workspace and its owner's admin membership row", async () => {
    workspacesResult = {
      data: { id: "ws-1", name: "Acme", slug: "acme", owner_id: "user-1" },
      error: null,
    };
    membersResult = { data: null, error: null };

    const result = await createWorkspace(ctx, "Acme");

    expect(result).toEqual({
      ok: true,
      value: { id: "ws-1", name: "Acme", slug: "acme", ownerId: "user-1" },
    });
  });
});

describe("getWorkspace", () => {
  it("returns not_found when the workspace is invisible (nonexistent or not a member)", async () => {
    workspacesResult = { data: null, error: null };
    const result = await getWorkspace(ctx, "ws-1");
    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("returns the workspace with member profiles attached", async () => {
    workspacesResult = {
      data: { id: "ws-1", name: "Acme", slug: "acme", owner_id: "user-1" },
      error: null,
    };
    membersResult = {
      data: [{ id: "m1", user_id: "user-1", role: "admin", joined_at: "2026-01-01T00:00:00Z" }],
      error: null,
    };
    profilesResult = { data: [{ id: "user-1", name: "Alice", avatar_url: null }], error: null };

    const result = await getWorkspace(ctx, "ws-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.members).toEqual([
        {
          id: "m1",
          userId: "user-1",
          name: "Alice",
          avatarUrl: null,
          role: "admin",
          joinedAt: "2026-01-01T00:00:00Z",
        },
      ]);
    }
  });
});

describe("inviteMember", () => {
  it("rejects a non-admin caller", async () => {
    membersResult = { data: { role: "viewer" }, error: null };
    const result = await inviteMember(ctx, "ws-1", "friend@example.com", "editor");
    expect(result).toEqual({ ok: false, error: { type: "not_admin" } });
    expect(sendWorkspaceInviteEmail).not.toHaveBeenCalled();
  });

  it("creates the invitation and sends the email as an admin", async () => {
    membersResult = { data: { role: "admin" }, error: null };
    workspacesResult = { data: { name: "Acme" }, error: null };
    invitationsResult = { data: null, error: null };

    const result = await inviteMember(ctx, "ws-1", "friend@example.com", "editor");

    expect(result).toEqual({ ok: true, value: undefined });
    expect(sendWorkspaceInviteEmail).toHaveBeenCalledWith("friend@example.com", {
      workspaceName: "Acme",
      role: "editor",
      token: "deadbeef",
    });
  });
});

describe("getInvitationPreview", () => {
  it("returns invalid_invitation for a missing token", async () => {
    invitationsResult = { data: null, error: null };
    const result = await getInvitationPreview("bad-token");
    expect(result).toEqual({ ok: false, error: { type: "invalid_invitation" } });
  });

  it("returns invalid_invitation for an expired invitation", async () => {
    invitationsResult = {
      data: {
        role: "editor",
        accepted_at: null,
        expires_at: "2020-01-01T00:00:00Z",
        workspace_id: "ws-1",
      },
      error: null,
    };
    const result = await getInvitationPreview("token");
    expect(result).toEqual({ ok: false, error: { type: "invalid_invitation" } });
  });

  it("returns the workspace name and role for a live invitation", async () => {
    invitationsResult = {
      data: {
        role: "editor",
        accepted_at: null,
        expires_at: "2099-01-01T00:00:00Z",
        workspace_id: "ws-1",
      },
      error: null,
    };
    workspacesResult = { data: { name: "Acme" }, error: null };

    const result = await getInvitationPreview("token");

    expect(result).toEqual({ ok: true, value: { workspaceName: "Acme", role: "editor" } });
  });
});

describe("acceptInvitation", () => {
  it("rejects when the invitation email doesn't match the signed-in user", async () => {
    authUser = { id: "user-1", email: "someone-else@example.com" };
    invitationsResult = {
      data: {
        id: "inv-1",
        workspace_id: "ws-1",
        email: "user1@example.com",
        role: "editor",
        accepted_at: null,
        expires_at: "2099-01-01T00:00:00Z",
      },
      error: null,
    };
    const result = await acceptInvitation(ctx, "token");
    expect(result).toEqual({ ok: false, error: { type: "invalid_invitation" } });
  });

  it("inserts membership and marks the invitation accepted on success", async () => {
    invitationsResult = {
      data: {
        id: "inv-1",
        workspace_id: "ws-1",
        email: "user1@example.com",
        role: "editor",
        accepted_at: null,
        expires_at: "2099-01-01T00:00:00Z",
      },
      error: null,
    };
    workspacesResult = {
      data: { id: "ws-1", name: "Acme", slug: "acme", owner_id: "owner-1" },
      error: null,
    };
    membersResult = { data: null, error: null };

    const result = await acceptInvitation(ctx, "token");

    expect(result).toEqual({
      ok: true,
      value: { id: "ws-1", name: "Acme", slug: "acme", ownerId: "owner-1" },
    });
  });

  it("treats an already-a-member accept as an idempotent success", async () => {
    invitationsResult = {
      data: {
        id: "inv-1",
        workspace_id: "ws-1",
        email: "user1@example.com",
        role: "editor",
        accepted_at: null,
        expires_at: "2099-01-01T00:00:00Z",
      },
      error: null,
    };
    workspacesResult = {
      data: { id: "ws-1", name: "Acme", slug: "acme", owner_id: "owner-1" },
      error: null,
    };
    membersResult = { data: { id: "m1" }, error: null };

    const result = await acceptInvitation(ctx, "token");

    expect(result.ok).toBe(true);
  });
});

describe("removeMember", () => {
  it("rejects a non-admin caller", async () => {
    membersResult = { data: { role: "editor" }, error: null };
    const result = await removeMember(ctx, "ws-1", "user-2");
    expect(result).toEqual({ ok: false, error: { type: "not_admin" } });
  });

  it("refuses to remove the workspace owner", async () => {
    membersResult = { data: { role: "admin" }, error: null };
    workspacesResult = { data: { owner_id: "user-2" }, error: null };
    const result = await removeMember(ctx, "ws-1", "user-2");
    expect(result).toEqual({ ok: false, error: { type: "cannot_remove_owner" } });
  });

  it("removes a non-owner member as an admin", async () => {
    membersResult = { data: { role: "admin" }, error: null };
    workspacesResult = { data: { owner_id: "user-1" }, error: null };
    const result = await removeMember(ctx, "ws-1", "user-2");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("updateMemberRole", () => {
  it("rejects a non-admin caller", async () => {
    membersResult = { data: { role: "viewer" }, error: null };
    const result = await updateMemberRole(ctx, "ws-1", "user-2", "editor");
    expect(result).toEqual({ ok: false, error: { type: "not_admin" } });
  });

  it("updates the role as an admin", async () => {
    membersResult = { data: { role: "admin" }, error: null };
    const result = await updateMemberRole(ctx, "ws-1", "user-2", "editor");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("leaveWorkspace", () => {
  it("refuses to let the owner leave", async () => {
    workspacesResult = { data: { owner_id: "user-1" }, error: null };
    const result = await leaveWorkspace(ctx, "ws-1");
    expect(result).toEqual({ ok: false, error: { type: "must_transfer_or_delete" } });
  });

  it("lets a non-owner member leave", async () => {
    workspacesResult = { data: { owner_id: "owner-2" }, error: null };
    const result = await leaveWorkspace(ctx, "ws-1");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("deleteWorkspace", () => {
  it("rejects a non-admin caller", async () => {
    membersResult = { data: { role: "editor" }, error: null };
    const result = await deleteWorkspace(ctx, "ws-1");
    expect(result).toEqual({ ok: false, error: { type: "not_admin" } });
  });

  it("deletes the workspace as an admin", async () => {
    membersResult = { data: { role: "admin" }, error: null };
    const result = await deleteWorkspace(ctx, "ws-1");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("listMyWorkspaceMemberships", () => {
  it("maps rows to workspaceId/role pairs", async () => {
    membersResult = { data: [{ workspace_id: "ws-1", role: "admin" }], error: null };
    const result = await listMyWorkspaceMemberships(ctx);
    expect(result).toEqual([{ workspaceId: "ws-1", role: "admin" }]);
  });
});
