'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Database, BookOpen, PenLine, Megaphone, MonitorPlay, MessageSquarePlus, Mail, Flame, SlidersHorizontal, Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/niches', label: 'Niches', icon: Database },
  { href: '/admin/handpick', label: 'HandPick', icon: Flame },
  { href: '/admin/prompts', label: 'Prompts', icon: BookOpen },
  { href: '/admin/blog', label: 'Blog Post', icon: PenLine },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/ads', label: 'Ads', icon: MonitorPlay },
  { href: '/admin/cta', label: 'CTA Settings', icon: SlidersHorizontal },
  { href: '/admin/requests', label: 'Requests', icon: MessageSquarePlus },
  { href: '/admin/automation-tools', label: 'YT Tools', icon: Wrench },
  { href: '/admin/emails', label: 'Emails', icon: Mail },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E0D9CE]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[#E0D9CE]">
        <span className="font-display font-bold text-xl text-[#1A1612]">
          YT<span className="text-[#E8402A]">Niches</span>
        </span>
        <span className="text-[10px] font-bold bg-[#E8402A] text-white px-2 py-0.5 rounded-full">Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors',
                    active
                      ? 'bg-[#FDF0ED] text-[#E8402A]'
                      : 'text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612]',
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
