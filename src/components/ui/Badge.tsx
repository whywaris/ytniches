import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#EDE8DF] text-[#6B6259]',
        accent: 'bg-accent text-white',
        outline: 'border border-border text-foreground bg-transparent',
        success: 'bg-[#EBF5EF] text-[#2A7A4B] border border-[#C2E0CE]',
        warning: 'bg-[#FEF6E8] text-[#A06B00] border border-[#F5DFA8]',
        // competition level badges — exact design system colors
        low:    'bg-[#EBF5EF] text-[#2A7A4B] border border-[#C2E0CE]',
        medium: 'bg-[#FEF6E8] text-[#A06B00] border border-[#F5DFA8]',
        high:   'bg-[#FDF0ED] text-[#E8402A] border border-[#F5C4BA]',
        // plan badges
        pro:      'bg-accent text-white',
        free:     'bg-[#EDE8DF] text-[#8A7F72]',
        lifetime: 'bg-[#1A1612] text-[#F5F0E8]',
        // cpm / dark
        cpm: 'bg-[#EDE8DF] text-[#1A1612] font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
