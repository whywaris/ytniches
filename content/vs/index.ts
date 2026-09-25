import { NEXLEV } from "@/content/vs/nexlev";
import { OUTLIERKIT } from "@/content/vs/outlierkit";
import { TUBELAB } from "@/content/vs/tubelab";
import type { CompetitorPage } from "@/content/vs/types";

export const COMPETITOR_PAGES: CompetitorPage[] = [NEXLEV, OUTLIERKIT, TUBELAB];

export function getCompetitorPage(id: string): CompetitorPage | undefined {
  return COMPETITOR_PAGES.find((page) => page.id === id);
}
