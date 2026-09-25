import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(marketing)/blog/actions", () => ({
  subscribeAction: vi.fn(async () => ({ status: "success" })),
}));

const { NewsletterSignup } = await import("@/components/features/blog/newsletter-signup");
const { BlogSearch } = await import("@/components/features/blog/blog-search");
const { NAV_LINKS, withBlogLink } = await import("@/components/features/landing/content");

const ENTRIES = [
  {
    slug: "what-is-an-outlier-video",
    title: "What an outlier video is",
    excerpt: "Subscriber count tells you the past.",
    category: "Outlier Analysis",
    tags: ["outliers"],
  },
  {
    slug: "find-a-niche",
    title: "How to find a faceless niche",
    excerpt: "Saturation gets measured wrong.",
    category: "Faceless Niches",
    tags: ["niche-research"],
  },
];

describe("NewsletterSignup", () => {
  it("shows the consent line and has no axe violations", async () => {
    const { container } = render(<NewsletterSignup />);
    expect(screen.getByText("New posts by email. Unsubscribe anytime.")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("BlogSearch", () => {
  it("finds posts by title with Fuse and has no axe violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<BlogSearch entries={ENTRIES} />);

    await user.type(screen.getByRole("searchbox", { name: "Search posts" }), "outlier");

    expect(screen.getByRole("link", { name: /What an outlier video is/ })).toHaveAttribute(
      "href",
      "/blog/what-is-an-outlier-video",
    );
    expect(screen.queryByRole("link", { name: /faceless niche/ })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("says so when nothing matches", async () => {
    const user = userEvent.setup();
    render(<BlogSearch entries={ENTRIES} />);
    await user.type(screen.getByRole("searchbox", { name: "Search posts" }), "zzzzqqq");
    expect(screen.getByRole("status")).toHaveTextContent("No posts match that.");
  });
});

describe("withBlogLink", () => {
  it("shows Blog as Soon until a post is visible, then links it", () => {
    const blog = (live: boolean) => withBlogLink(NAV_LINKS, live).find((l) => l.label === "Blog");
    expect(blog(false)?.href).toBeNull();
    expect(blog(true)?.href).toBe("/blog");
  });
});
