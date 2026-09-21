const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeEntities(text: string): string {
  return text.replace(
    /&(?:amp|lt|gt|quot|#39|apos);/g,
    (entity) => HTML_ENTITIES[entity] ?? entity,
  );
}

function extractLangCode(listXml: string): string | null {
  const codes = [...listXml.matchAll(/lang_code="([^"]+)"/g)].map((m) => m[1]);
  if (codes.length === 0) return null;
  return codes.find((code) => code.startsWith("en")) ?? codes[0];
}

function extractTranscriptText(trackXml: string): string {
  const lines = [...trackXml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((match) =>
    decodeEntities(match[1]).replace(/\s+/g, " ").trim(),
  );
  return lines.join(" ").trim();
}

// D-027 (DECISIONS.md): YouTube's `timedtext` endpoint is UNOFFICIAL -- not
// part of the documented Data API v3, undocumented, and could change or
// break without notice. It's used here because the official
// captions.download endpoint requires OAuth consent from the video's
// owner, which we will never have for an arbitrary competitor's video --
// every "YouTube transcript" tool in the wild uses this same endpoint for
// exactly that reason.
//
// Endpoint format:
//   list tracks:  https://www.youtube.com/api/timedtext?type=list&v=<videoId>
//   fetch a track: https://www.youtube.com/api/timedtext?v=<videoId>&lang=<langCode>
//
// Hard fallback to null on any failure -- never throws, never blocks
// prompt generation (soft-degrade, see DECISIONS.md D-027 and
// UI-UX-Flow.md §7.6's deviation note).
export async function fetchTranscript(youtubeVideoId: string): Promise<string | null> {
  try {
    const listUrl = `https://www.youtube.com/api/timedtext?type=list&v=${encodeURIComponent(youtubeVideoId)}`;
    const listResponse = await fetch(listUrl);
    if (!listResponse.ok) return null;

    const listXml = await listResponse.text();
    const lang = extractLangCode(listXml);
    if (!lang) return null;

    const trackUrl = `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(youtubeVideoId)}&lang=${encodeURIComponent(lang)}`;
    const trackResponse = await fetch(trackUrl);
    if (!trackResponse.ok) return null;

    const trackXml = await trackResponse.text();
    const transcript = extractTranscriptText(trackXml);
    return transcript.length > 0 ? transcript : null;
  } catch {
    return null;
  }
}
