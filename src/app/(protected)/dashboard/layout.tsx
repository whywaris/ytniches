import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { DashboardAnnouncementBar } from '@/components/dashboard/DashboardAnnouncementBar'
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
        <div className="h-screen flex flex-col overflow-hidden">
          {/* Top bar — mobile only, fixed */}
          <div className="md:hidden flex-shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
            <span className="font-black text-foreground text-lg font-display">
              YT<span className="text-accent">Niches</span>
            </span>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar — desktop only, fixed with internal scroll */}
            <aside className="w-[240px] flex-shrink-0 hidden md:flex flex-col overflow-y-auto border-r border-border bg-card">
              <DashboardSidebar />
            </aside>

            {/* Main content — only this scrolls */}
            <main className="flex-1 min-w-0 overflow-y-auto bg-background">
              <DashboardAnnouncementBar />
              {children}
            </main>
          </div>

          {/* Bottom nav — mobile only, fixed */}
          <div className="flex-shrink-0 md:hidden">
            <MobileBottomNav />
          </div>
        </div>
  )
}
