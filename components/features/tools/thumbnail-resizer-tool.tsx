"use client";

import * as React from "react";

import { Download } from "lucide-react";

import {
  coverCrop,
  encodeUnderLimit,
  MAX_INPUT_BYTES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
  type EncodedThumbnail,
  type OutputType,
} from "@/lib/tools/thumbnail";
import { Button } from "@/components/ui/button";
import { ResultCta, trackToolUsed } from "@/components/features/tools/tool-kit";

type State =
  | { status: "idle" }
  | { status: "working" }
  | { status: "error"; message: string }
  | { status: "done"; url: string; fileName: string; result: EncodedThumbnail };

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

// Runs entirely in the browser (canvas). The image is never uploaded.
export function ThumbnailResizerTool() {
  const [state, setState] = React.useState<State>({ status: "idle" });
  const inputId = React.useId();

  React.useEffect(
    () => () => {
      if (state.status === "done") URL.revokeObjectURL(state.url);
    },
    [state],
  );

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_INPUT_BYTES) {
      setState({ status: "error", message: "That file is over 20MB. Pick a smaller image." });
      return;
    }
    setState({ status: "working" });

    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      setState({
        status: "error",
        message:
          "Your browser can't open this image. HEIC photos usually can't be read: export it as JPG or PNG first.",
      });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = THUMBNAIL_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) {
      setState({ status: "error", message: "Your browser can't resize images here." });
      return;
    }
    const { sx, sy, sw, sh } = coverCrop(bitmap.width, bitmap.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    bitmap.close();

    const preferred: OutputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const result = await encodeUnderLimit(
      (type, quality) =>
        new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
            type,
            quality,
          ),
        ),
      preferred,
    );
    const base = file.name.replace(/\.[^.]+$/, "") || "thumbnail";
    const extension = result.type === "image/png" ? "png" : "jpg";
    setState({
      status: "done",
      url: URL.createObjectURL(result.blob),
      fileName: `${base}-1280x720.${extension}`,
      result,
    });
    trackToolUsed("thumbnail-resizer");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-body-sm font-medium text-text-primary">
          Image (JPG, PNG, WebP or GIF)
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={(event) => void handleFile(event.target.files?.[0])}
          className="text-body-sm text-text-secondary file:mr-3 file:rounded-sm file:border file:border-border-default file:bg-bg-surface-1 file:px-3 file:py-1.5 file:text-text-primary"
        />
        <p className="text-caption text-text-secondary">
          Nothing is uploaded. The resizing happens in your browser.
        </p>
      </div>

      {state.status === "working" && (
        <p role="status" className="text-body-sm text-text-secondary">
          Resizing…
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-body-sm text-error">
          {state.message}
        </p>
      )}
      {state.status === "done" && (
        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local blob: URL, next/image can't optimize it */}
          <img
            src={state.url}
            alt="Your resized thumbnail preview"
            width={THUMBNAIL_WIDTH}
            height={THUMBNAIL_HEIGHT}
            className="h-auto w-full max-w-xl rounded-md border border-border-subtle"
          />
          <p role="status" className="text-body-sm text-text-secondary">
            1280×720 · {state.result.type === "image/png" ? "PNG" : "JPG"} ·{" "}
            {formatBytes(state.result.blob.size)}
            {state.result.convertedToJpeg &&
              ". This PNG was over 2MB at full size, so we saved it as a JPG."}
          </p>
          <Button asChild className="self-start">
            <a href={state.url} download={state.fileName}>
              <Download />
              Download thumbnail
            </a>
          </Button>
          <ResultCta slug="thumbnail-resizer" />
        </div>
      )}
    </div>
  );
}
