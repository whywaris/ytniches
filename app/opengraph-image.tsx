import { OG_SIZE, ogCard } from "@/lib/og/card";

// Default social card for every page without its own (App Router file
// convention: nested routes inherit it).
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "YTNiches — niche research to content for faceless creators";

export default function OpenGraphImage() {
  return ogCard({
    title: "Find the niche. Then make the videos.",
    footer: "Niche research to content for faceless YouTube creators · ytniches.com",
  });
}
