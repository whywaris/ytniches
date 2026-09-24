import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

import type { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
}

// UI-UX-Flow.md §4.5's "4 metric cards row". No "use client" -- plain
// presentational component, rendered directly by the server-rendered
// dashboard page for 3 of the 4 cards and by dashboard-client-widgets.tsx
// (localStorage-backed streak) for the 4th.
function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-accent-subtle text-accent">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div>
          <div className="text-h3 font-semibold text-text-primary">{value}</div>
          <div className="text-body-sm text-text-secondary">{label}</div>
        </div>
      </div>
    </Card>
  );
}

export { MetricCard };
