'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Heart, Compass, LayoutGrid,
  Settings, CreditCard, LogOut, BookOpen, MessageSquarePlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { createClient } from '@/lib/supabase/client'

const LAST_VISIT_KEY = 'request_page_last_visit'

const NAV_SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/handpick', label: 'HandPick Niches', icon: Compass },
      { href: '/categories', label: 'Categories', icon: LayoutGrid },
      { href: '/dashboard/saved', label: 'Saved Niches', icon: Heart },
      { href: '/dashboard/prompts', label: 'Prompts', icon: BookOpen },
      { href: '/dashboard/request', label: 'Request', icon: MessageSquarePlus, badge: true },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { clearUser, user } = useAuthStore()
  const [hasRequestBadge, setHasRequestBadge] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  // Clear badge when visiting the request page
  useEffect(() => {
    if (pathname === '/dashboard/request') {
      localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
      setHasRequestBadge(false)
    }
  }, [pathname])

  // Check for unread request status updates
  useEffect(() => {
    if (!user?.id || pathname === '/dashboard/request') return

    async function checkBadge() {
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY)
      if (!lastVisit) return

      const supabase = createClient()
      const { count } = await supabase
        .from('niche_requests')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gt('updated_at', lastVisit)
        .neq('status', 'pending')

      if (count && count > 0) setHasRequestBadge(true)
    }

    checkBadge()
  }, [user?.id, pathname])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearUser()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <span className="font-display font-bold text-xl text-foreground">
          YT<span className="text-accent">Niches</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-muted tracking-widest uppercase px-2 mb-2">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, exact, pro, badge }: any) => {
                const active = isActive(href, exact)
                const showBadge = badge && hasRequestBadge && !active
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        active
                          ? 'bg-accent-light text-accent'
                          : 'text-muted hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                      {pro && <span className="ml-auto text-[9px] font-bold bg-[#FDF0ED] text-[#E8402A] px-1.5 py-0.5 rounded-full">PRO</span>}
                      {showBadge && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-[#E8402A] shrink-0" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Sign out */}
        <div>
          <p className="text-[10px] font-bold text-muted tracking-widest uppercase px-2 mb-2">
            SESSION
          </p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-accent-light hover:text-accent transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </nav>
    </div>
  )
}
