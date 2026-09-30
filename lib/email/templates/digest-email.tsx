import { EmailButton, EmailLayout, EMAIL_COLORS } from "@/lib/email/templates/layout";

export interface DigestVideoItem {
  title: string;
  channelName: string;
  url: string;
}

export interface DigestOutlierItem extends DigestVideoItem {
  viewCount: number;
}

// Niche-Discovery-Engine.md §11: weekly digest's "top rising niches".
export interface DigestNicheItem {
  name: string;
  url: string;
  score: number;
  trend: number;
}

export interface DigestEmailProps {
  cadence: "daily" | "weekly";
  topOutliers: DigestOutlierItem[];
  newVideos: DigestVideoItem[];
  /** Weekly only; empty on daily digests. */
  risingNiches?: DigestNicheItem[];
  siteUrl: string;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function ListItem({ title, channelName, url, suffix }: DigestVideoItem & { suffix?: string }) {
  return (
    <li style={{ marginBottom: "10px" }}>
      <a href={url} style={{ color: EMAIL_COLORS.textPrimary, fontSize: "14px" }}>
        {title}
      </a>
      <div style={{ color: EMAIL_COLORS.textTertiary, fontSize: "12px" }}>
        {channelName}
        {suffix ? ` · ${suffix}` : ""}
      </div>
    </li>
  );
}

const SECTION_LABEL = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: EMAIL_COLORS.textTertiary,
  margin: "0 0 8px",
} as const;

// PRD.md §7.2's weekly digest: "top outliers, top new videos, channel
// movement." Channel movement (subscriber deltas etc.) isn't tracked
// anywhere yet -- workers/digest.ts sends the lists this codebase actually has
// data for, plus rising niches on the weekly one.
export function DigestEmail({
  cadence,
  topOutliers,
  newVideos,
  risingNiches = [],
  siteUrl,
}: DigestEmailProps) {
  const heading = cadence === "daily" ? "Your daily digest" : "Your weekly digest";
  return (
    <EmailLayout
      preheader={`${topOutliers.length} outliers, ${newVideos.length} new videos`}
      siteUrl={siteUrl}
    >
      <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 16px" }}>{heading}</p>

      {topOutliers.length > 0 ? (
        <>
          <p
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: EMAIL_COLORS.textTertiary,
              margin: "0 0 8px",
            }}
          >
            Top outliers
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
            {topOutliers.map((item) => (
              <ListItem key={item.url} {...item} suffix={`${formatCount(item.viewCount)} views`} />
            ))}
          </ul>
        </>
      ) : null}

      {newVideos.length > 0 ? (
        <>
          <p
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: EMAIL_COLORS.textTertiary,
              margin: "0 0 8px",
            }}
          >
            New videos
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {newVideos.map((item) => (
              <ListItem key={item.url} {...item} />
            ))}
          </ul>
        </>
      ) : null}

      {risingNiches.length > 0 ? (
        <>
          <p style={{ ...SECTION_LABEL, marginTop: "16px" }}>Top rising niches</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {risingNiches.map((niche) => (
              <li key={niche.url} style={{ marginBottom: "10px" }}>
                <a href={niche.url} style={{ color: EMAIL_COLORS.textPrimary, fontSize: "14px" }}>
                  {niche.name}
                </a>
                <div style={{ color: EMAIL_COLORS.textTertiary, fontSize: "12px" }}>
                  Opportunity Score {niche.score} · +{niche.trend} this week
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <EmailButton href={`${siteUrl}/outliers`} label="View all outliers" />
    </EmailLayout>
  );
}

export function digestEmailText(props: Omit<DigestEmailProps, "siteUrl">): string {
  const lines: string[] = [
    props.cadence === "daily" ? "Your daily digest" : "Your weekly digest",
    "",
  ];
  if (props.topOutliers.length > 0) {
    lines.push("Top outliers:");
    for (const item of props.topOutliers) {
      lines.push(
        `- ${item.title} (${item.channelName}, ${formatCount(item.viewCount)} views) ${item.url}`,
      );
    }
    lines.push("");
  }
  if (props.newVideos.length > 0) {
    lines.push("New videos:");
    for (const item of props.newVideos) {
      lines.push(`- ${item.title} (${item.channelName}) ${item.url}`);
    }
  }
  if (props.risingNiches && props.risingNiches.length > 0) {
    lines.push("", "Top rising niches:");
    for (const niche of props.risingNiches) {
      lines.push(`- ${niche.name} (score ${niche.score}, +${niche.trend} this week) ${niche.url}`);
    }
  }
  return lines.join("\n");
}
