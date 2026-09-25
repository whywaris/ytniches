"use client";

import * as React from "react";

import { Download } from "lucide-react";
import QRCode from "qrcode";

import { normalizeYoutubeLink } from "@/lib/tools/calculators";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { ResultCta, trackToolUsed } from "@/components/features/tools/tool-kit";

const SIZES = [256, 512, 1024] as const;

// Browser-only (D-055). The code encodes the YouTube link directly: no
// redirect through us, so nothing is tracked and it never expires.
export function QrCodeTool() {
  const [input, setInput] = React.useState("");
  const [size, setSize] = React.useState<(typeof SIZES)[number]>(512);
  // Tagged with the link + size they were made for, so a stale code is
  // simply not shown -- no need to clear state when the input changes.
  const [generated, setGenerated] = React.useState<{
    key: string;
    png: string;
    svg: string;
  } | null>(null);
  const tracked = React.useRef(false);

  const link = input.trim() ? normalizeYoutubeLink(input) : null;
  const error =
    input.trim() && !link ? "Paste a YouTube link (youtube.com or youtu.be)." : undefined;
  const key = `${link}|${size}`;
  const codes = link && generated?.key === key ? generated : null;

  React.useEffect(() => {
    if (!link) return;
    let cancelled = false;
    const options = { width: size, margin: 2, errorCorrectionLevel: "M" as const };
    void Promise.all([
      QRCode.toDataURL(link, options),
      QRCode.toString(link, { ...options, type: "svg" }),
    ]).then(([png, svg]) => {
      if (cancelled) return;
      setGenerated({
        key: `${link}|${size}`,
        png,
        svg: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      });
      if (!tracked.current) {
        tracked.current = true;
        trackToolUsed("youtube-qr-code-generator");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [link, size]);

  return (
    <div className="flex flex-col gap-6">
      <TextInput
        label="YouTube link"
        placeholder="https://www.youtube.com/@yourchannel"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        errorMessage={error}
      />
      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="mb-2 w-full text-body-sm font-medium text-text-primary">
          Size (pixels)
        </legend>
        {SIZES.map((option) => (
          <label key={option} className="flex items-center gap-1.5 text-body-sm text-text-primary">
            <input
              type="radio"
              name="qr-size"
              value={option}
              checked={size === option}
              onChange={() => setSize(option)}
              className="accent-accent"
            />
            {option}×{option}
          </label>
        ))}
      </fieldset>
      {codes && link && (
        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- generated data: URL */}
          <img
            src={codes.png}
            alt={`QR code for ${link}`}
            width={256}
            height={256}
            className="rounded-md bg-white p-2"
          />
          <p className="text-caption break-all text-text-secondary">Points to {link}</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={codes.png} download="youtube-qr-code.png">
                <Download />
                Download PNG
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={codes.svg} download="youtube-qr-code.svg">
                <Download />
                Download SVG
              </a>
            </Button>
          </div>
          <ResultCta slug="youtube-qr-code-generator" />
        </div>
      )}
    </div>
  );
}
