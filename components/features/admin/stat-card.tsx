import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <p className="text-body-sm text-text-secondary">{label}</p>
      <p className="mt-1 text-h2 font-semibold text-text-primary">{value}</p>
      {hint ? <p className="mt-1 text-caption text-text-secondary">{hint}</p> : null}
    </Card>
  );
}

export { StatCard };
