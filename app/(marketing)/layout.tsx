import type { ReactNode } from "react";

import { getPosts } from "@/lib/blog";
import { Footer } from "@/components/features/landing/footer";
import { MarketingCommandPalette } from "@/components/features/landing/marketing-command-palette";
import { MotionProvider } from "@/components/features/landing/motion-provider";
import { Navbar } from "@/components/features/landing/navbar";

// Public marketing chrome (Landing-Page-Spec §1/§15): navbar + footer, no
// app sidebar. Wraps / , /pricing, /vs/* and /blog/*. Always dark -- the app
// shell's ThemeProvider isn't mounted here.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  const blogLive = getPosts().length > 0;
  return (
    <MotionProvider>
      <div className="flex min-h-screen flex-col bg-bg-base">
        <Navbar blogLive={blogLive} />
        <main className="flex-1">{children}</main>
        <Footer blogLive={blogLive} />
      </div>
      <MarketingCommandPalette />
    </MotionProvider>
  );
}
