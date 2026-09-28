"use client";

import { useRouter } from "next/navigation";

import { ArrowRight, BookOpen, Home, LogIn, Sparkles, Tag, Wrench } from "lucide-react";

import { CommandPalette } from "@/components/ui/command-palette";
import { HOW_IT_WORKS, PRIMARY_CTA } from "@/components/features/landing/content";

// Cmd/Ctrl+K on public pages. The app shell's palette (D-037) lives in
// app/(app)/layout.tsx and needs a session; this one is navigation-only
// across public routes + on-page sections. Loaded on the first Cmd/Ctrl+K
// (lazy-command-palette.tsx), so it costs nothing until used.
function MarketingCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const go = (href: string) => () => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      groups={[
        {
          heading: "Navigation",
          items: [
            { id: "home", label: "Home", icon: <Home />, onSelect: go("/") },
            {
              id: "how-it-works",
              label: HOW_IT_WORKS.headline,
              icon: <ArrowRight />,
              onSelect: go(`/#${HOW_IT_WORKS.id}`),
            },
            { id: "pricing", label: "Pricing", icon: <Tag />, onSelect: go("/pricing") },
            { id: "tools", label: "Tools", icon: <Wrench />, onSelect: go("/tools") },
            { id: "help", label: "Help", icon: <BookOpen />, onSelect: go("/help") },
          ],
        },
        {
          heading: "Actions",
          items: [
            { id: "signup", label: PRIMARY_CTA, icon: <Sparkles />, onSelect: go("/signup") },
            { id: "login", label: "Log in", icon: <LogIn />, onSelect: go("/login") },
          ],
        },
      ]}
    />
  );
}

export { MarketingCommandPalette };
