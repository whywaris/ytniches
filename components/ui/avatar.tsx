import * as React from "react";

import { Avatar as RadixAvatar } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Design-System.md §5.11. Sizes xs(20)/sm(24)/md(32)/lg(40)/xl(56).
const avatarVariants = cva("relative inline-flex shrink-0 overflow-hidden rounded-full", {
  variants: {
    size: {
      xs: "size-5 text-[10px]",
      sm: "size-6 text-caption",
      md: "size-8 text-body-sm",
      lg: "size-10 text-body",
      xl: "size-14 text-h4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface AvatarProps
  extends React.ComponentProps<typeof RadixAvatar.Root>, VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback: string;
}

function Avatar({ className, size, src, alt = "", fallback, ...props }: AvatarProps) {
  return (
    <RadixAvatar.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      <RadixAvatar.Image src={src} alt={alt} className="size-full object-cover" />
      <RadixAvatar.Fallback className="flex size-full items-center justify-center bg-bg-surface-2 font-medium text-text-secondary">
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

export { Avatar, avatarVariants };
