'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Users, Database, BookOpen, PenLine, Megaphone, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/niches', label: 'Niches', icon: Database },
  { href: '/admin/prompts', label: 'Prompts', icon: BookOpen },
  { href: '/admin/blog', label: 'Blog Post', icon: PenLine },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/ads', label: 'Ads', icon: MonitorPlay },
]

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="lg:hidden sticky top-0 z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E0D9CE]">
        <span className="font-display font-bold text-lg text-[#1A1612]">
          YT<span className="text-[#E8402A]">Niches</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold bg-[#E8402A] text-white px-2 py-0.5 rounded-full">Admin</span>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-[#6B6259] hover:bg-[#F5F0E8] transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Dropdown nav */}
      {open && (
        <div className="absolute inset-x-0 top-full bg-white border-b border-[#E0D9CE] shadow-lg z-50">
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#FDF0ED] text-[#E8402A]'
                      : 'text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612]'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}
