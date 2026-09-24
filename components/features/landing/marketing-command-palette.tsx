"use client";

import { useRouter } from "next/navigation";

import { ArrowRight, Home, LogIn, Sparkles, Tag } from "lucide-react";

import { CommandPalette } from "@/components/ui/command-palette";

// Cmd/Ctrl+K on public pages. The app shell's palette (D-037) lives in
// app/(app)/layout.tsx and needs a session; this one is navigation-only
// across public routes + on-page sections.
function MarketingCommandPalette() {
  const router = useRouter();
  const go = (href: string) => () => router.push(href);

  return (
    <CommandPalette
      groups={[
        {
          heading: "Navigation",
          items: [
            { id: "home", label: "Home", icon: <Home />, onSelect: go("/") },
            { id: "features", label: "Features", icon: <ArrowRight />, onSelect: go("/#features") },
            {
              id: "templates",
              label: "Templates",
              icon: <ArrowRight />,
              onSelect: go("/#templates"),
            },
            {
              id: "compare",
              label: "How we compare",
              icon: <ArrowRight />,
              onSelect: go("/#compare"),
            },
            { id: "pricing", label: "Pricing", icon: <Tag />, onSelect: go("/pricing") },
          ],
        },
        {
          heading: "Actions",
          items: [
            { id: "signup", label: "Sign up free", icon: <Sparkles />, onSelect: go("/signup") },
            { id: "login", label: "Log in", icon: <LogIn />, onSelect: go("/login") },
          ],
        },
      ]}
    />
  );
}

export { MarketingCommandPalette };
