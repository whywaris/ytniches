import { cn } from "@/lib/utils";

// YouTube Developer Policies III.F.2.a: screens showing YouTube data make
// clear that YouTube is the source (D-067d). Rendered by the app shell (every
// signed-in screen) and by free tools that fetch YouTube data.
function YouTubeAttribution({ className }: { className?: string }) {
  return (
    <p className={cn("text-caption text-text-tertiary", className)}>
      Data from{" "}
      <a
        href="https://www.youtube.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-text-secondary"
      >
        YouTube
      </a>
    </p>
  );
}

export { YouTubeAttribution };
