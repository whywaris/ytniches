import { Clock, Eye, CheckCircle2, Sparkles, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/types'

const STATUS_CONFIG: Record<RequestStatus, {
  label: string
  color: string
  icon: React.ReactNode
}> = {
  pending: {
    label: 'Pending',
    color: 'bg-[#F0EDE8] text-[#8A7F72]',
    icon: <Clock className="w-3 h-3" />,
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-[#EBF4FF] text-[#2563EB]',
    icon: <Eye className="w-3 h-3" />,
  },
  approved: {
    label: 'Approved ✓',
    color: 'bg-[#F3E8FF] text-[#7C3AED]',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  completed: {
    label: 'Added! 🎉',
    color: 'bg-[#EBF5EF] text-[#2A7A4B]',
    icon: <Sparkles className="w-3 h-3" />,
  },
  rejected: {
    label: 'Not Added',
    color: 'bg-[#FDF0ED] text-[#E8402A]',
    icon: <XCircle className="w-3 h-3" />,
  },
}

interface Props {
  status: RequestStatus
  size?: 'sm' | 'md'
  className?: string
}

export function RequestStatusBadge({ status, size = 'sm', className }: Props) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-bold rounded-full',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        cfg.color,
        className
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}
