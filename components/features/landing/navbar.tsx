"use client";

import * as React from "react";

import Link from "next/link";

import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { NAV_LINKS, withBlogLink } from "@/components/features/landing/content";
import { CtaLink } from "@/components/features/landing/cta-link";
import { SoonLink } from "@/components/features/landing/soon-link";

function Wordmark() {
  return (
    <Link href="/" className="text-h4 font-semibold tracking-tight text-text-primary">
      YTNiches
    </Link>
  );
}

// Landing-Page-Spec §1: 72px, sticky; transparent over the hero, bg-base +
// border + blur once scrolled. Mobile: full-screen overlay (Radix Dialog
// via ui/Modal -- focus trap, Esc, focus return for free).
function Navbar({ blogLive = false }: { blogLive?: boolean }) {
  const links = withBlogLink(NAV_LINKS, blogLive);
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[72px] border-b transition-colors duration-default",
        scrolled
          ? "border-border-subtle bg-bg-base/80 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-full max-w-[1440px] items-center gap-8 px-6 md:px-10"
      >
        <Wordmark />
        <ul className="hidden items-center gap-6 text-body-sm text-text-secondary md:flex">
          {links.map((item) => (
            <li key={item.label}>
              <SoonLink item={item} />
            </li>
          ))}
        </ul>
        <div className="flex-1" />
        <div className="hidden items-center gap-2 md:flex">
          <CtaLink href="/login" event="landing_nav_login_click" variant="secondary" size="sm">
            Log in
          </CtaLink>
          <CtaLink
            href="/signup"
            event="landing_hero_cta_click"
            eventProps={{ source: "navbar" }}
            size="sm"
          >
            Sign up free
          </CtaLink>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </Button>
      </nav>

      <Modal open={menuOpen} onOpenChange={setMenuOpen} title="Menu" size="full">
        <ul className="flex flex-col gap-5 text-h3 text-text-primary">
          {links.map((item) => (
            <li key={item.label}>
              <SoonLink item={item} onClick={() => setMenuOpen(false)} />
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col gap-3">
          <CtaLink href="/login" event="landing_nav_login_click" variant="secondary">
            Log in
          </CtaLink>
          <CtaLink
            href="/signup"
            event="landing_hero_cta_click"
            eventProps={{ source: "mobile_menu" }}
          >
            Sign up free
          </CtaLink>
        </div>
      </Modal>
    </header>
  );
}

export { Navbar, Wordmark };
