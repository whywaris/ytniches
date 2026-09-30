"use client";

import * as React from "react";

import dynamic from "next/dynamic";

// D-082 performance: the palette (and cmdk) load on the first Cmd/Ctrl+K,
// not with every marketing page. Once loaded, the palette's own shortcut
// handler takes over; this listener only arms it.
const MarketingCommandPalette = dynamic(
  () =>
    import("@/components/features/landing/marketing-command-palette").then(
      (m) => m.MarketingCommandPalette,
    ),
  { ssr: false },
);

function LazyCommandPalette() {
  const [loaded, setLoaded] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (loaded) return;
    function arm(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setLoaded(true);
        setOpen(true);
      }
    }
    document.addEventListener("keydown", arm);
    return () => document.removeEventListener("keydown", arm);
  }, [loaded]);

  return loaded ? <MarketingCommandPalette open={open} onOpenChange={setOpen} /> : null;
}

export { LazyCommandPalette };
