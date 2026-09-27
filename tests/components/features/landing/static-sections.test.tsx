import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics/client", () => ({ capture: vi.fn() }));

const { Footer } = await import("@/components/features/landing/footer");
const { FounderSection } = await import("@/components/features/landing/founder-section");
const { VsSection } = await import("@/components/features/landing/vs-section");
const { SoonLink } = await import("@/components/features/landing/soon-link");
const { generateStaticParams } = await import("@/app/(marketing)/vs/[competitor]/page");

describe("SoonLink", () => {
  it("renders an unbuilt page as plain text with a Soon tag, never a link", () => {
    render(<SoonLink item={{ label: "Blog", href: null }} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });

  it("renders a built page as a link", () => {
    render(<SoonLink item={{ label: "Pricing", href: "/pricing" }} />);
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });
});

describe("Footer", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<Footer />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens Ask-AI pills in a new tab with a pre-filled query", () => {
    render(<Footer />);
    const pills = within(screen.getByRole("list", { name: "Ask AI about YTNiches" })).getAllByRole(
      "link",
    );
    expect(pills).toHaveLength(3);
    for (const pill of pills) {
      expect(pill).toHaveAttribute("target", "_blank");
      expect(pill).toHaveAttribute("rel", "noopener noreferrer");
      expect(pill.getAttribute("href")).toContain(encodeURIComponent("Tell me about YTNiches"));
    }
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
      const route = href.split("#")[0].replace(/^\//, "");
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

    render(<Footer blogLive={false} />);
    const internal = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("/"));

    expect(internal).toContain("/tools");
    for (const href of internal) expect(routeExists(href), href).toBe(true);
  });
});

describe("FounderSection", () => {
  it("renders Mac's final story", () => {
    render(<FounderSection />);
    expect(
      screen.getByRole("heading", { name: "I made this because I needed it." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/World War 2 faceless YouTube channel/)).toBeInTheDocument();
    expect(screen.getByText("— Mac, founder")).toBeInTheDocument();
  });
});

describe("VsSection + /vs stubs", () => {
  it("links each card to its /vs page, and each /vs page is statically generated", () => {
    render(<VsSection />);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .sort();
    expect(hrefs).toEqual(["/vs/nexlev", "/vs/outlierkit", "/vs/tubelab"]);
    expect(
      generateStaticParams()
        .map((param) => `/vs/${param.competitor}`)
        .sort(),
    ).toEqual(hrefs);
  });
});
