import { beforeEach, describe, expect, it, vi } from "vitest";

const getChannelById = vi.fn();
const getVideoById = vi.fn();
const resolveVideoUrl = vi.fn();
vi.mock("@/lib/youtube", () => ({
  getChannelById: (...args: unknown[]) => getChannelById(...args),
  getVideoById: (...args: unknown[]) => getVideoById(...args),
  resolveVideoUrl: (...args: unknown[]) => resolveVideoUrl(...args),
}));

const fetchTranscript = vi.fn();
vi.mock("@/lib/youtube/transcript", () => ({
  fetchTranscript: (...args: unknown[]) => fetchTranscript(...args),
}));

const generatePromptOutput = vi.fn();
vi.mock("@/lib/ai", () => ({
  generatePromptOutput: (...args: unknown[]) => generatePromptOutput(...args),
}));

const consume = vi.fn();
const refund = vi.fn();
vi.mock("@/lib/credits", () => ({
  consume: (...args: unknown[]) => consume(...args),
  refund: (...args: unknown[]) => refund(...args),
}));

const upsertChannels = vi.fn();
vi.mock("@/lib/services/channels", () => ({
  upsertChannels: (...args: unknown[]) => upsertChannels(...args),
}));

const upsertVideos = vi.fn();
vi.mock("@/workers/channel-sync", () => ({
  upsertVideos: (...args: unknown[]) => upsertVideos(...args),
}));

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const serviceFrom = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

const {
  generatePrompts,
  regeneratePrompts,
  getPrompt,
  listPrompts,
  updatePromptOutput,
  deletePrompt,
} = await import("@/lib/services/prompts");

const ctx = { userId: "user-1", workspaceId: null, tier: null };

// A chainable, thenable double covering every method prompts.ts calls on a
// Supabase query builder -- same pattern as tracking.test.ts's
// makeQueryBuilder.
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    is: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

const VIDEO_ROW = {
  id: "vid-internal-1",
  youtube_video_id: "yt-vid-1",
  title: "How to pick a niche",
  description: "A guide",
  tags: ["niche", "youtube"],
  thumbnail_url: "https://example.com/thumb.jpg",
};

const PROMPT_OUTPUT = {
  title_variants: ["A", "B", "C", "D", "E"],
  thumbnail_concepts: ["X", "Y", "Z"],
  hook_variants: ["H1", "H2", "H3"],
  script_outline: { intro: "Intro", body_sections: ["Body"], outro: "Outro" },
  description_template: "Description",
};

function promptRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "prompt-1",
    user_id: ctx.userId,
    workspace_id: null,
    source_video_id: "vid-internal-1",
    target_audience: null,
    tone: "neutral",
    output: PROMPT_OUTPUT,
    regeneration_of: null,
    feedback_tags: [],
    deleted_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generatePrompts (by videoId)", () => {
  it("generates, consumes credits, and inserts a prompt on the happy path", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null })); // getVideoRow
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // transcript cache miss
    fetchTranscript.mockResolvedValueOnce({ text: "Hey everyone", language: "en" });
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // transcript insert
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // has_transcript update
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generatePromptOutput.mockResolvedValueOnce({ ok: true, value: PROMPT_OUTPUT });
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: promptRow(), error: null })); // insertPromptRow

    const result = await generatePrompts(
      ctx,
      { videoId: "vid-internal-1", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(consume).toHaveBeenCalledWith(ctx, 5, "Prompt generation", "key-1");
    expect(generatePromptOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        videoTitle: "How to pick a niche",
        transcriptText: "Hey everyone",
        tone: "neutral",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.output).toEqual(PROMPT_OUTPUT);
      expect(result.value.sourceVideo.title).toBe("How to pick a niche");
    }
  });

  it("returns not_found when the videoId doesn't exist, without touching credits", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    const result = await generatePrompts(
      ctx,
      { videoId: "missing", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
    expect(consume).not.toHaveBeenCalled();
  });

  it("soft-degrades to a null transcript without failing generation", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // cache miss
    fetchTranscript.mockResolvedValueOnce(null); // unfetchable
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generatePromptOutput.mockResolvedValueOnce({ ok: true, value: PROMPT_OUTPUT });
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: promptRow(), error: null }));

    const result = await generatePrompts(
      ctx,
      { videoId: "vid-internal-1", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(generatePromptOutput).toHaveBeenCalledWith(
      expect.objectContaining({ transcriptText: null }),
    );
    expect(result.ok).toBe(true);
  });

  it("reuses an already-cached transcript instead of calling fetchTranscript", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: { transcript_text: "Cached transcript" }, error: null }),
    );
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generatePromptOutput.mockResolvedValueOnce({ ok: true, value: PROMPT_OUTPUT });
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: promptRow(), error: null }));

    await generatePrompts(
      ctx,
      { videoId: "vid-internal-1", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(fetchTranscript).not.toHaveBeenCalled();
    expect(generatePromptOutput).toHaveBeenCalledWith(
      expect.objectContaining({ transcriptText: "Cached transcript" }),
    );
  });

  it("returns insufficient_credits without ever calling the AI", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    fetchTranscript.mockResolvedValueOnce(null);
    consume.mockResolvedValueOnce({
      ok: false,
      error: { type: "insufficient_credits", balance: 2, required: 5 },
    });

    const result = await generatePrompts(
      ctx,
      { videoId: "vid-internal-1", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(result).toEqual({
      ok: false,
      error: { type: "insufficient_credits", balance: 2, required: 5 },
    });
    expect(generatePromptOutput).not.toHaveBeenCalled();
  });

  it("refunds the charge and returns generation_failed when the AI call fails", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    fetchTranscript.mockResolvedValueOnce(null);
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generatePromptOutput.mockResolvedValueOnce({ ok: false, error: { type: "overloaded" } });

    const result = await generatePrompts(
      ctx,
      { videoId: "vid-internal-1", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(refund).toHaveBeenCalledWith(ctx, 5, "Prompt generation failed", "key-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("generation_failed");
    }
  });
});

describe("generatePrompts (by videoUrl)", () => {
  it("resolves the URL, caches the channel and video, then generates", async () => {
    resolveVideoUrl.mockReturnValueOnce({ ok: true, value: "yt-vid-1" });
    getVideoById.mockResolvedValueOnce({
      ok: true,
      value: {
        id: "yt-vid-1",
        snippet: { title: "Video", description: "Desc", tags: [], channelId: "yt-chan-1" },
      },
    });
    getChannelById.mockResolvedValueOnce({ ok: true, value: { id: "yt-chan-1" } });
    upsertChannels.mockResolvedValueOnce(new Map([["yt-chan-1", "chan-internal-1"]]));
    upsertVideos.mockResolvedValueOnce(new Map([["yt-vid-1", "vid-internal-1"]]));
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    fetchTranscript.mockResolvedValueOnce(null);
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generatePromptOutput.mockResolvedValueOnce({ ok: true, value: PROMPT_OUTPUT });
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: promptRow(), error: null }));

    const result = await generatePrompts(
      ctx,
      { videoUrl: "https://youtube.com/watch?v=yt-vid-1", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(upsertChannels).toHaveBeenCalledWith([{ id: "yt-chan-1" }]);
    expect(upsertVideos).toHaveBeenCalledWith("chan-internal-1", [
      expect.objectContaining({ id: "yt-vid-1" }),
    ]);
    expect(result.ok).toBe(true);
  });

  it("returns invalid_url without any lookups when the URL doesn't parse", async () => {
    resolveVideoUrl.mockReturnValueOnce({ ok: false, error: { type: "invalid_url" } });

    const result = await generatePrompts(
      ctx,
      { videoUrl: "not a url", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(result).toEqual({ ok: false, error: { type: "invalid_url" } });
    expect(getVideoById).not.toHaveBeenCalled();
  });

  it("returns not_found when the video doesn't exist on YouTube", async () => {
    resolveVideoUrl.mockReturnValueOnce({ ok: true, value: "yt-vid-missing" });
    getVideoById.mockResolvedValueOnce({
      ok: false,
      error: { type: "api_error", status: 404, message: "not found" },
    });

    const result = await generatePrompts(
      ctx,
      { videoUrl: "https://youtu.be/yt-vid-missing", targetAudience: null, tone: "neutral" },
      "key-1",
    );

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });
});

describe("regeneratePrompts", () => {
  it("inserts a new row with regeneration_of set, reusing the original's tone and audience", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: promptRow({ id: "prompt-1", tone: "casual", target_audience: "beginners" }),
        error: null,
      }),
    ); // getOwnPromptRow
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null })); // getVideoRow
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // transcript cache miss
    fetchTranscript.mockResolvedValueOnce(null);
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generatePromptOutput.mockResolvedValueOnce({ ok: true, value: PROMPT_OUTPUT });
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: promptRow({ id: "prompt-2", regeneration_of: "prompt-1" }),
        error: null,
      }),
    ); // insertPromptRow

    const result = await regeneratePrompts(
      ctx,
      "prompt-1",
      { tags: ["more_casual"], freeText: "less corporate" },
      "regen-key-1",
    );

    expect(consume).toHaveBeenCalledWith(ctx, 3, "Prompt regeneration", "regen-key-1");
    expect(generatePromptOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "casual",
        targetAudience: "beginners",
        feedback: { tags: ["more_casual"], freeText: "less corporate" },
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.regenerationOf).toBe("prompt-1");
    }
  });

  it("returns not_found when the prompt doesn't belong to this user (or doesn't exist)", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    const result = await regeneratePrompts(
      ctx,
      "someone-elses-prompt",
      { tags: [], freeText: null },
      "k",
    );

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
    expect(consume).not.toHaveBeenCalled();
  });

  it("refunds the regenerate cost (3) on AI failure", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: promptRow(), error: null }));
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    fetchTranscript.mockResolvedValueOnce(null);
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generatePromptOutput.mockResolvedValueOnce({ ok: false, error: { type: "rate_limited" } });

    const result = await regeneratePrompts(
      ctx,
      "prompt-1",
      { tags: [], freeText: null },
      "regen-key-1",
    );

    expect(refund).toHaveBeenCalledWith(ctx, 3, "Prompt regeneration failed", "regen-key-1");
    expect(result.ok).toBe(false);
  });
});

describe("getPrompt", () => {
  it("returns the prompt joined with its source video", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: promptRow(), error: null }));
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));

    const result = await getPrompt(ctx, "prompt-1");

    expect(result?.sourceVideo.title).toBe("How to pick a niche");
  });

  it("returns null when not found", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    const result = await getPrompt(ctx, "missing");

    expect(result).toBeNull();
  });
});

describe("listPrompts", () => {
  it("returns [] without a videos query when there are no prompts", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));

    const result = await listPrompts(ctx);

    expect(result).toEqual([]);
    expect(sessionFrom).toHaveBeenCalledTimes(1);
  });

  it("joins each prompt with its source video's title and thumbnail", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [promptRow()], error: null }));
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: [{ id: "vid-internal-1", title: "How to pick a niche", thumbnail_url: "thumb.jpg" }],
        error: null,
      }),
    );

    const result = await listPrompts(ctx);

    expect(result).toEqual([
      {
        id: "prompt-1",
        sourceVideo: {
          id: "vid-internal-1",
          title: "How to pick a niche",
          thumbnailUrl: "thumb.jpg",
        },
        createdAt: "2026-01-01T00:00:00Z",
      },
    ]);
  });

  it("filters by search against the source video title", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: [
          promptRow({ id: "p1", source_video_id: "v1" }),
          promptRow({ id: "p2", source_video_id: "v2" }),
        ],
        error: null,
      }),
    );
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: [
          { id: "v1", title: "Sleep music tips", thumbnail_url: "" },
          { id: "v2", title: "Tech review", thumbnail_url: "" },
        ],
        error: null,
      }),
    );

    const result = await listPrompts(ctx, { search: "sleep" });

    expect(result).toHaveLength(1);
    expect(result[0].sourceVideo.title).toBe("Sleep music tips");
  });
});

describe("updatePromptOutput", () => {
  it("succeeds when the row belongs to the user", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [{ id: "prompt-1" }], error: null }));

    const result = await updatePromptOutput(ctx, "prompt-1", PROMPT_OUTPUT);

    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("returns not_found when no row matched", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));

    const result = await updatePromptOutput(ctx, "missing", PROMPT_OUTPUT);

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });
});

describe("deletePrompt", () => {
  it("soft-deletes when the row belongs to the user", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [{ id: "prompt-1" }], error: null }));

    const result = await deletePrompt(ctx, "prompt-1");

    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("returns not_found when no row matched", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));

    const result = await deletePrompt(ctx, "missing");

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });
});
