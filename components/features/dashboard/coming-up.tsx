import Link from "next/link";

import { Calendar, CheckSquare } from "lucide-react";

import { listEntries } from "@/lib/services/calendar";
import { listTasks } from "@/lib/services/tasks";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { DashboardSection } from "@/components/features/dashboard/dashboard-section";
import type { RequestContext } from "@/lib/context";

const SHORT_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function Row({
  href,
  icon,
  title,
  meta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  meta: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-sm px-2 py-2.5 text-body-sm hover:bg-bg-hover"
      >
        <span className="text-text-secondary [&_svg]:size-4">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-text-primary">{title}</span>
        <span className="shrink-0 text-text-secondary">{meta}</span>
      </Link>
    </li>
  );
}

// Workspace users only. ponytail: listEntries/listTasks have no limit, so
// this fetches all upcoming entries / my tasks and slices to 3 -- add a
// limit to those queries if a workspace grows to hundreds of rows.
async function ComingUp({ ctx, workspaceId }: { ctx: RequestContext; workspaceId: string }) {
  const [entries, tasks] = await Promise.all([
    listEntries(workspaceId, { from: new Date().toISOString() }),
    listTasks(ctx, workspaceId, { view: "mine" }),
  ]);
  const nextEntries = entries.filter((entry) => entry.scheduledFor).slice(0, 3);
  const openTasks = tasks.filter((task) => task.status !== "done").slice(0, 3);

  return (
    <DashboardSection id="dash-coming-up" title="Coming up" viewAllHref="/calendar">
      <div className="grid gap-3 md:grid-cols-2">
        <Card padding="sm">
          <h3 className="px-2 pt-1 pb-2 text-body-sm font-semibold text-text-secondary">
            Calendar
          </h3>
          {nextEntries.length > 0 ? (
            <ul>
              {nextEntries.map((entry) => (
                <Row
                  key={entry.id}
                  href="/calendar"
                  icon={<Calendar />}
                  title={entry.title}
                  meta={SHORT_DATE.format(new Date(entry.scheduledFor as string))}
                />
              ))}
            </ul>
          ) : (
            <p className="px-2 pb-2 text-body-sm text-text-secondary">Nothing scheduled.</p>
          )}
        </Card>
        <Card padding="sm">
          <h3 className="px-2 pt-1 pb-2 text-body-sm font-semibold text-text-secondary">
            Your open tasks
          </h3>
          {openTasks.length > 0 ? (
            <ul>
              {openTasks.map((task) => (
                <Row
                  key={task.id}
                  href="/workspace/tasks"
                  icon={<CheckSquare />}
                  title={task.title}
                  meta={
                    task.dueDate ? (
                      SHORT_DATE.format(new Date(task.dueDate))
                    ) : (
                      <Tag>{task.status === "in_progress" ? "In progress" : "Open"}</Tag>
                    )
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="px-2 pb-2 text-body-sm text-text-secondary">
              No open tasks assigned to you.
            </p>
          )}
        </Card>
      </div>
    </DashboardSection>
  );
}

export { ComingUp };
