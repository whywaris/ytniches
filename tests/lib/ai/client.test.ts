import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";

const parseMock = vi.fn();
const embeddingsCreate = vi.fn();

vi.mock("openai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("openai")>();
  class MockOpenAI {
    chat = { completions: { parse: parseMock } };
    embeddings = { create: embeddingsCreate };
  }
  // The real error classes are static properties on the default export
  // (OpenAI.RateLimitError, etc.) -- client.ts checks `instanceof
  // OpenAI.RateLimitError`, so the mock needs the same real classes
  // attached, not a bare stand-in.
  Object.assign(MockOpenAI, {
    APIError: actual.default.APIError,
    APIConnectionError: actual.default.APIConnectionError,
    RateLimitError: actual.default.RateLimitError,
    BadRequestError: actual.default.BadRequestError,
  });
  return { ...actual, default: MockOpenAI };
});

const OpenAI = (await import("openai")).default;
const { createEmbedding, generateStructuredOutput } = await import("@/lib/ai/client");

const VALID_OUTPUT = {
  title_variants: ["A", "B", "C", "D", "E"],
  thumbnail_concepts: ["X", "Y", "Z"],
  hook_variants: ["H1", "H2", "H3"],
  script_outline: { intro: "Intro", body_sections: ["Body 1"], outro: "Outro" },
  description_template: "Description",
};

// The mock returns canned `completion` objects directly, not something
// actually validated against this schema -- it only needs to exist to
// exercise generateStructuredOutput's now-generic signature.
const TEST_SCHEMA = z.object({ title_variants: z.array(z.string()) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateStructuredOutput", () => {
  it("returns the parsed output on success", async () => {
    parseMock.mockResolvedValueOnce({
      choices: [{ message: { parsed: VALID_OUTPUT } }],
    });

    const result = await generateStructuredOutput(
      "system prompt",
      "user prompt",
      TEST_SCHEMA,
      "test_output",
    );

    expect(result).toEqual({ ok: true, value: VALID_OUTPUT });
    expect(parseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "system prompt" },
          { role: "user", content: "user prompt" },
        ],
      }),
    );
  });

  it("returns invalid_response when the message has no parsed output", async () => {
    parseMock.mockResolvedValueOnce({ choices: [{ message: { parsed: null } }] });

    const result = await generateStructuredOutput("system", "user", TEST_SCHEMA, "test_output");

    expect(result).toEqual({
      ok: false,
      error: { type: "invalid_response", message: expect.any(String) },
    });
  });

  it("maps a RateLimitError to rate_limited", async () => {
    parseMock.mockRejectedValueOnce(
      new OpenAI.RateLimitError(429, undefined, "slow down", new Headers()),
    );

    const result = await generateStructuredOutput("system", "user", TEST_SCHEMA, "test_output");

    expect(result).toEqual({ ok: false, error: { type: "rate_limited" } });
  });

  it("maps a 503 APIError to overloaded", async () => {
    parseMock.mockRejectedValueOnce(new OpenAI.APIError(503, undefined, "overloaded", undefined));

    const result = await generateStructuredOutput("system", "user", TEST_SCHEMA, "test_output");

    expect(result).toEqual({ ok: false, error: { type: "overloaded" } });
  });

  it("maps a BadRequestError to invalid_request", async () => {
    parseMock.mockRejectedValueOnce(
      new OpenAI.BadRequestError(400, undefined, "bad schema", new Headers()),
    );

    const result = await generateStructuredOutput("system", "user", TEST_SCHEMA, "test_output");

    expect(result).toEqual({
      ok: false,
      error: { type: "invalid_request", message: "400 bad schema" },
    });
  });

  it("maps an APIConnectionError to network_error", async () => {
    parseMock.mockRejectedValueOnce(
      new OpenAI.APIConnectionError({ message: "connection refused" }),
    );

    const result = await generateStructuredOutput("system", "user", TEST_SCHEMA, "test_output");

    expect(result).toEqual({
      ok: false,
      error: { type: "network_error", message: "connection refused" },
    });
  });

  it("maps an arbitrary 500 APIError to a generic api_error", async () => {
    parseMock.mockRejectedValueOnce(
      new OpenAI.APIError(500, undefined, "server exploded", undefined),
    );

    const result = await generateStructuredOutput("system", "user", TEST_SCHEMA, "test_output");

    expect(result).toEqual({
      ok: false,
      error: { type: "api_error", status: 500, message: "500 server exploded" },
    });
  });

  it("maps a non-SDK thrown error to network_error without crashing", async () => {
    parseMock.mockRejectedValueOnce(new Error("totally unexpected"));

    const result = await generateStructuredOutput("system", "user", TEST_SCHEMA, "test_output");

    expect(result).toEqual({
      ok: false,
      error: { type: "network_error", message: "totally unexpected" },
    });
  });
});

describe("model override (D-074)", () => {
  it("lets background classification run on the mini model", async () => {
    parseMock.mockResolvedValueOnce({ choices: [{ message: { parsed: VALID_OUTPUT } }] });

    await generateStructuredOutput("s", "u", TEST_SCHEMA, "t", { model: "gpt-4o-mini" });

    expect(parseMock).toHaveBeenCalledWith(expect.objectContaining({ model: "gpt-4o-mini" }));
  });
});

describe("token usage log", () => {
  const usageLines = (spy: { mock: { calls: unknown[][] } }) =>
    spy.mock.calls.map((call) => JSON.parse(String(call[0])) as Record<string, unknown>);

  it("logs one ai_usage line per call with job, model and tokens", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    parseMock.mockResolvedValueOnce({
      choices: [{ message: { parsed: VALID_OUTPUT } }],
      usage: { prompt_tokens: 1200, completion_tokens: 340 },
    });
    embeddingsCreate.mockResolvedValueOnce({
      data: [{ embedding: Array.from({ length: 1536 }, () => 0) }],
      usage: { prompt_tokens: 9 },
    });

    await generateStructuredOutput("s", "u", TEST_SCHEMA, "channel_classification", {
      model: "gpt-4o-mini",
    });
    await createEmbedding("x", "niche_embedding");

    expect(usageLines(info)).toEqual([
      {
        event: "ai_usage",
        job: "channel_classification",
        model: "gpt-4o-mini",
        input_tokens: 1200,
        output_tokens: 340,
      },
      {
        event: "ai_usage",
        job: "niche_embedding",
        model: "text-embedding-3-small",
        input_tokens: 9,
        output_tokens: 0,
      },
    ]);
    info.mockRestore();
  });
});

describe("createEmbedding", () => {
  it("returns a 1536-dim text-embedding-3-small vector", async () => {
    const vector = Array.from({ length: 1536 }, () => 0.01);
    embeddingsCreate.mockResolvedValueOnce({ data: [{ embedding: vector }] });

    const result = await createEmbedding("Mafia History: organised crime stories");

    expect(result).toEqual({ ok: true, value: vector });
    expect(embeddingsCreate).toHaveBeenCalledWith({
      model: "text-embedding-3-small",
      input: "Mafia History: organised crime stories",
      dimensions: 1536,
    });
  });

  it("rejects a vector of the wrong size", async () => {
    embeddingsCreate.mockResolvedValueOnce({ data: [{ embedding: [0.1] }] });
    const result = await createEmbedding("x");
    expect(result.ok).toBe(false);
  });

  it("maps a rate limit", async () => {
    embeddingsCreate.mockRejectedValueOnce(
      new OpenAI.RateLimitError(429, undefined, "slow down", new Headers()),
    );
    expect(await createEmbedding("x")).toEqual({ ok: false, error: { type: "rate_limited" } });
  });
});
