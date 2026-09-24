import Image from "next/image";

import { formatRelativeTime } from "@/lib/format-relative-time";
import { listRecentUploadsByChannel } from "@/lib/services/tracking";
import { pluralize } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { DashboardSection } from "@/components/features/dashboard/dashboard-section";
import type { RequestContext } from "@/lib/context";

// One row per channel that posted in the last 7 days -- avatar, count,
// newest thumbnails -- instead of one identical text row per video.
async function LatestUploads({ ctx }: { ctx: RequestContext }) {
  const groups = await listRecentUploadsByChannel(ctx);

  return (
    <DashboardSection id="dash-uploads" title="Latest from your channels" viewAllHref="/tracking">
      {groups.length > 0 ? (
        <Card padding="sm">
          <ul className="divide-y divide-border-subtle">
            {groups.map((group) => (
              <li
                key={group.channelId}
                className="flex flex-col gap-3 p-2 md:flex-row md:items-center md:gap-5"
              >
                <div className="flex min-w-0 items-center gap-3 md:w-56 md:shrink-0">
                  <Avatar
                    size="md"
                    src={group.channelAvatarUrl ?? undefined}
                    fallback={group.channelName.slice(0, 2).toUpperCase()}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-body font-medium text-text-primary">
                      {group.channelName}
                    </p>
                    <p className="text-body-sm text-text-secondary">
                      posted {group.uploadCount} new {pluralize(group.uploadCount, "video")} ·{" "}
                      {formatRelativeTime(group.latestPublishedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {group.latestUploads.map((upload) => (
                    <Image
                      key={upload.videoId}
                      src={upload.thumbnailUrl}
                      alt={upload.title}
                      title={upload.title}
                      width={160}
                      height={90}
                      unoptimized
                      className="h-[90px] w-40 shrink-0 rounded-sm object-cover"
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <p className="text-body-sm text-text-secondary">
            No new uploads from your tracked channels in the last 7 days.
          </p>
        </Card>
      )}
    </DashboardSection>
  );
}

export { LatestUploads };
