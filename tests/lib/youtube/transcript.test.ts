import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchTranscript } from "@/lib/youtube/transcript";

function textResponse(status: number, body: string): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const LIST_XML_EN = `<transcript_list><track id="0" name="" lang_code="en"/><track id="1" name="" lang_code="fr"/></transcript_list>`;
const LIST_XML_NO_EN = `<transcript_list><track id="0" name="" lang_code="fr"/></transcript_list>`;
const TRACK_XML = `<transcript><text start="0" dur="2">Hey everyone &amp; welcome</text><text start="2" dur="2">back to the channel</text></transcript>`;

describe("fetchTranscript", () => {
  it("fetches the track list, prefers English, and returns the joined transcript text", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse(200, LIST_XML_EN))
      .mockResolvedValueOnce(textResponse(200, TRACK_XML));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchTranscript("vid1");

    expect(result).toEqual({ text: "Hey everyone & welcome back to the channel", language: "en" });
    const trackCallUrl = String(fetchMock.mock.calls[1][0]);
    expect(trackCallUrl).toContain("lang=en");
  });

  it("falls back to the first available language when English isn't offered", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse(200, LIST_XML_NO_EN))
      .mockResolvedValueOnce(textResponse(200, TRACK_XML));
    vi.stubGlobal("fetch", fetchMock);

    await fetchTranscript("vid1");

    const trackCallUrl = String(fetchMock.mock.calls[1][0]);
    expect(trackCallUrl).toContain("lang=fr");
  });

  it("returns null without throwing when the track list request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(textResponse(404, "")));

    const result = await fetchTranscript("vid1");

    expect(result).toBeNull();
  });

  it("returns null when no caption tracks are listed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(textResponse(200, "<transcript_list></transcript_list>")),
    );

    const result = await fetchTranscript("vid1");

    expect(result).toBeNull();
  });

  it("returns null when the track fetch itself fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse(200, LIST_XML_EN))
      .mockResolvedValueOnce(textResponse(500, ""));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchTranscript("vid1");

    expect(result).toBeNull();
  });

  it("returns null when the track body has no text nodes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(textResponse(200, LIST_XML_EN))
      .mockResolvedValueOnce(textResponse(200, "<transcript></transcript>"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchTranscript("vid1");

    expect(result).toBeNull();
  });

  it("returns null instead of throwing when fetch itself rejects (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("network down")));

    const result = await fetchTranscript("vid1");

    expect(result).toBeNull();
  });
});
