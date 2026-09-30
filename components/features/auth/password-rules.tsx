import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { PASSWORD_RULES } from "@/lib/auth/credentials";

// Security.md §2.1, live under the password field. Same rules the server
// and Supabase enforce (lib/auth/credentials.ts).
function PasswordRules({ value, id }: { value: string; id: string }) {
  return (
    <ul id={id} className="space-y-1 text-caption" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5",
              met ? "text-success" : "text-text-secondary",
            )}
          >
            {met ? (
              <Check aria-hidden="true" className="size-3.5" />
            ) : (
              <Circle aria-hidden="true" className="size-3.5" />
            )}
            {rule.label}
            <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export { PasswordRules };
