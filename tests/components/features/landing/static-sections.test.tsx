import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics/client", () => ({ capture: vi.fn() }));

const { Footer } = await import("@/components/features/landing/footer");
const { FounderSection } = await import("@/components/features/landing/founder-section");
const { SoonLink } = await import("@/components/features/landing/soon-link");
const { FAQ, HOW_IT_WORKS } = await import("@/components/features/landing/content");
const { faqJsonLd } = await import("@/components/features/landing/faq");
const { default: LandingPage } = await import("@/app/(marketing)/page");
const { COMPETITOR_PAGES } = await import("@/content/vs");
const { generateStaticParams } = await import("@/app/(marketing)/vs/[competitor]/page");

describe("SoonLink", () => {
  it("renders an unbuilt page as plain text with a Soon tag, never a link", () => {
    render(<SoonLink item={{ label: "Changelog", href: null }} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });

  it("renders a built page as a link", () => {
    render(<SoonLink item={{ label: "Pricing", href: "/pricing" }} />);
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });
});

describe("Footer (D-082)", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<Footer />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lists legal pages, contact, blog, tools, help and every VS page by name", () => {
    render(<Footer blogLive />);
    for (const [name, href] of [
      ["Terms", "/legal/terms"],
      ["Privacy", "/legal/privacy"],
      ["Refunds", "/legal/refunds"],
      ["Cookies", "/legal/cookies"],
      ["Blog", "/blog"],
      ["Tools", "/tools"],
      ["Help", "/help"],
    ]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
    expect(screen.getByRole("link", { name: "support@ytniches.com" })).toHaveAttribute(
      "href",
      "mailto:support@ytniches.com",
    );
    const compare = within(screen.getByRole("navigation", { name: "Compare" })).getAllByRole(
      "link",
    );
    expect(compare.map((link) => link.textContent)).toEqual(
      COMPETITOR_PAGES.map((page) => `YTNiches vs ${page.name}`),
    );
    expect(compare.map((link) => link.getAttribute("href")).sort()).toEqual(
      generateStaticParams()
        .map((param) => `/vs/${param.competitor}`)
        .sort(),
    );
  });

  // A real page.tsx must exist for every internal link, in app/ or any
  // route group -- never a 404. Unbuilt pages render as "Soon" text instead.
  it("only links to routes that exist", () => {
    const appDir = path.join(process.cwd(), "app");
    const roots = [
      appDir,
      ...readdirSync(appDir)
        .filter((d) => d.startsWith("("))
        .map((d) => path.join(appDir, d)),
    ];
    const routeExists = (href: string) => {
      const route = href.split("#")[0]!.replace(/^\//, "");
      // Also matches a dynamic segment, e.g. /legal/terms -> legal/[slug]/page.tsx.
      const parent = path.dirname(route);
      return roots.some(
        (root) =>
          existsSync(path.join(root, route, "page.tsx")) ||
          (existsSync(path.join(root, parent)) &&
            readdirSync(path.join(root, parent)).some(
              (entry) =>
                entry.startsWith("[") && existsSync(path.join(root, parent, entry, "page.tsx")),
            )),
      );
    };

    render(<Footer blogLive />);
    const internal = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("/"));
    for (const href of internal) expect(routeExists(href), href).toBe(true);
  });
});

describe("FounderSection", () => {
  it("renders Mac's final story with the abstract art by default", () => {
    const { container } = render(<FounderSection />);
    expect(
      screen.getByRole("heading", { name: "I made this because I needed it." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/World War 2 faceless YouTube channel/)).toBeInTheDocument();
    expect(screen.getByText("— Mac, founder")).toBeInTheDocument();
    expect(container.querySelector("svg[aria-hidden='true']")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows a photo instead when one is passed", () => {
    render(<FounderSection photo={{ src: "/mac.jpg", alt: "Mac, the founder" }} />);
    expect(screen.getByRole("img", { name: "Mac, the founder" })).toBeInTheDocument();
  });
});

describe("Landing page (D-082)", () => {
  it("renders the sections in order and nothing else", () => {
    render(<LandingPage />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      "What YTNiches does",
      "How it works",
      "I made this because I needed it.",
      "Free during beta",
      "Questions, answered",
      "Find your next video idea today.",
    ]);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Spot rising YouTube channels. Plan what to make next.",
      }),
    ).toBeInTheDocument();
  });

  it("points 'See how it works' at the How it works section", () => {
    const { container } = render(<LandingPage />);
    expect(screen.getByRole("link", { name: "See how it works" })).toHaveAttribute(
      "href",
      `#${HOW_IT_WORKS.id}`,
    );
    expect(container.querySelector(`#${HOW_IT_WORKS.id}`)).toBeInTheDocument();
  });

  it("gives the hero art alt text and hides decorative art", () => {
    render(<LandingPage />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("img")).toHaveAccessibleName(/orange line rising/);
  });

  it("ships FAQPage JSON-LD that matches the rendered FAQ", () => {
    const { container } = render(<LandingPage />);
    const blocks = [...container.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => JSON.parse(script.textContent ?? "{}") as { "@type": string },
    );
    const faq = blocks.find((block) => block["@type"] === "FAQPage");
    expect(faq).toEqual(faqJsonLd());
    expect(faqJsonLd().mainEntity.map((q) => q.name)).toEqual(FAQ.map((item) => item.question));
    const app = blocks.find((block) => block["@type"] === "SoftwareApplication") as unknown as {
      offers: { price: string }[];
    };
    expect(app.offers).toEqual([expect.objectContaining({ price: "0" })]);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<LandingPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
