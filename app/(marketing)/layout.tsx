import type { ReactNode } from "react";

import { Instrument_Serif } from "next/font/google";

import { getPosts } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/features/landing/footer";
import { LazyCommandPalette } from "@/components/features/landing/lazy-command-palette";
import { Navbar } from "@/components/features/landing/navbar";

// Design-System.md §3.1 / D-082: the marketing-only display face, for h1/h2.
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

// Public marketing chrome (Landing-Page-Spec §1/§15): navbar + footer, no
// app sidebar. Wraps / , /pricing, /vs/* and /blog/*. Always dark -- the app
// shell's ThemeProvider isn't mounted here. `.marketing` scopes the glass
// tokens (D-082).
export default function MarketingLayout({ children }: { children: ReactNode }) {
  const blogLive = getPosts().length > 0;
  return (
    <>
      <div
        className={cn(
          "marketing mk-noise flex min-h-screen flex-col overflow-x-clip",
          instrumentSerif.variable,
        )}
      >
        <Navbar blogLive={blogLive} />
        <main className="flex-1">{children}</main>
        <Footer blogLive={blogLive} />
      </div>
      <LazyCommandPalette />
    </>
  );
}
