import * as React from "react";

import { cn } from "@/lib/utils";
import { Avatar, type AvatarProps } from "@/components/ui/avatar";

// Design-System.md §5.11. Overlapping stack with a "+N" overflow badge.
export interface AvatarGroupProps extends React.ComponentProps<"div"> {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarProps["size"];
}

function AvatarGroup({ avatars, max = 3, size = "md", className, ...props }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - visible.length;

  return (
    <div data-slot="avatar-group" className={cn("flex items-center", className)} {...props}>
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className={cn("ring-2 ring-bg-base", index > 0 && "-ml-2", avatar.className)}
        />
      ))}
      {overflow > 0 ? (
        <Avatar size={size} fallback={`+${overflow}`} className="-ml-2 ring-2 ring-bg-base" />
      ) : null}
    </div>
  );
}

export { AvatarGroup };
