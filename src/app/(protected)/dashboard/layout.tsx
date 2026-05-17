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
        <div className="min-h-screen bg-background flex">
          {/* Sidebar — desktop only */}
          <aside className="hidden md:flex w-[240px] flex-shrink-0">
            <DashboardSidebar />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 flex flex-col">
            {/* Top bar — mobile only */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
              <span className="font-black text-foreground text-lg font-display">
                YT<span className="text-accent">Niches</span>
              </span>
            </div>

            {/* Page content */}
            <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
              <DashboardAnnouncementBar />
              {children}
            </div>
          </main>

          {/* Bottom nav — mobile only */}
          <MobileBottomNav />
        </div>
  )
}
