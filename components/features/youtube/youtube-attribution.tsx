import Image from "next/image";

import { cn } from "@/lib/utils";

// Official files from the Branding Guidelines, unaltered (700x250).
const ON_DARK = "/brand/developed-with-youtube-sentence-case-light.png";
const ON_LIGHT = "/brand/developed-with-youtube-sentence-case-dark.png";
const LOGO_SIZE = { width: 700, height: 250 };

// YouTube Developer Policies III.F.2.a + Branding Guidelines (D-084): the
// official, unaltered "developed with YouTube" logo, linking to YouTube,
// wherever YouTube data appears. Never placed next to the YTNiches name or
// logo, and never the most prominent element on the page.
// tone="dark" is for surfaces that are always dark (the marketing site);
// "auto" follows the app theme through globals.css (.yt-logo-on-*).
function YouTubeAttribution({
  className,
  tone = "auto",
}: {
  className?: string;
  tone?: "auto" | "dark";
}) {
  return (
    <a
      href="https://www.youtube.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Developed with YouTube"
      className={cn("inline-block w-[200px] shrink-0", className)}
    >
      <Image
        src={ON_DARK}
        {...LOGO_SIZE}
        alt=""
        className={cn("h-auto w-full", tone === "auto" && "yt-logo-on-dark")}
      />
      {tone === "auto" ? (
        <Image src={ON_LIGHT} {...LOGO_SIZE} alt="" className="yt-logo-on-light h-auto w-full" />
      ) : null}
    </a>
  );
}

export { YouTubeAttribution };
