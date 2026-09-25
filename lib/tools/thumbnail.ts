// Pure math + encoding policy for the Thumbnail Resizer. The canvas work
// happens in the browser; nothing is uploaded (D-014, D-054).

export const THUMBNAIL_WIDTH = 1280;
export const THUMBNAIL_HEIGHT = 720;
export const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // YouTube's thumbnail limit
export const MAX_INPUT_BYTES = 20 * 1024 * 1024; // keeps the browser tab responsive

export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

// Largest centered 16:9 region of the source ("cover"), so the output is
// filled edge to edge with nothing stretched.
export function coverCrop(sourceWidth: number, sourceHeight: number): CropRect {
  const target = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT;
  if (sourceWidth / sourceHeight > target) {
    const sw = Math.round(sourceHeight * target);
    return { sx: Math.round((sourceWidth - sw) / 2), sy: 0, sw, sh: sourceHeight };
  }
  const sh = Math.round(sourceWidth / target);
  return { sx: 0, sy: Math.round((sourceHeight - sh) / 2), sw: sourceWidth, sh };
}

export type OutputType = "image/jpeg" | "image/png";
export type Encode = (type: OutputType, quality?: number) => Promise<Blob>;

export interface EncodedThumbnail {
  blob: Blob;
  type: OutputType;
  quality?: number;
  // True when a PNG came out over 2MB and was saved as JPG instead.
  convertedToJpeg: boolean;
}

const JPEG_QUALITIES = [0.92, 0.85, 0.75, 0.65, 0.5];

export async function encodeUnderLimit(
  encode: Encode,
  preferred: OutputType,
): Promise<EncodedThumbnail> {
  if (preferred === "image/png") {
    const png = await encode("image/png");
    if (png.size <= MAX_OUTPUT_BYTES)
      return { blob: png, type: "image/png", convertedToJpeg: false };
  }
  let last: Blob | undefined;
  let lastQuality = JPEG_QUALITIES[0];
  for (const quality of JPEG_QUALITIES) {
    last = await encode("image/jpeg", quality);
    lastQuality = quality;
    if (last.size <= MAX_OUTPUT_BYTES) break;
  }
  return {
    blob: last!,
    type: "image/jpeg",
    quality: lastQuality,
    convertedToJpeg: preferred === "image/png",
  };
}
