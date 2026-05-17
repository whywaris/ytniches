import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, Database, TrendingUp, DollarSign, Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminCharts } from '@/components/admin/AdminCharts'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    { count: totalUsers },
    { count: totalNiches },
    { count: proUsers },
    { count: lifetimeUsers },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('niches').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'lifetime'),
    supabase.from('users').select('id, email, plan, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  const mrr = (proUsers ?? 0) * 7
  const ltdRevenue = (lifetimeUsers ?? 0) * 97

  const stats = [
    { label: 'Total Users', value: (totalUsers ?? 0).toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'MRR', value: `$${mrr.toLocaleString()}`, icon: TrendingUp, color: 'text-[#2A7A4B]', bg: 'bg-[#EBF5EF]' },
    { label: 'LTD Revenue', value: `$${ltdRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Published Niches', value: (totalNiches ?? 0).toLocaleString(), icon: Database, color: 'text-[#E8402A]', bg: 'bg-[#FDF0ED]' },
  ]

  const PLAN_BADGE: Record<string, string> = {
    free: 'bg-[#E0D9CE] text-[#8A7F72]',
    pro: 'bg-[#FDF0ED] text-[#E8402A]',
    lifetime: 'bg-[#EBF5EF] text-[#2A7A4B]',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">Admin Dashboard</h1>
          <p className="text-[#8A7F72] text-sm mt-1">Overview of YTNiches platform metrics</p>
        </div>
        <Link href="/admin/niches" className="flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors">
          <Plus className="w-4 h-4" /> Add niche
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-[20px] border border-[#E0D9CE] p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="font-display font-bold text-2xl text-[#1A1612]">{value}</p>
            <p className="text-xs text-[#8A7F72] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-8">
        <AdminCharts proUsers={proUsers ?? 0} lifetimeUsers={lifetimeUsers ?? 0} freeUsers={(totalUsers ?? 0) - (proUsers ?? 0) - (lifetimeUsers ?? 0)} />
      </div>

      {/* Recent signups */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden overflow-x-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0D9CE]">
          <h2 className="font-display font-bold text-[#1A1612]">Recent Signups</h2>
          <Link href="/admin/users" className="text-xs font-semibold text-[#E8402A] hover:text-[#CF3520]">View all →</Link>
        </div>
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-[#E0D9CE] bg-[#F5F0E8]">
              <th className="text-left px-5 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CE]">
            {(recentUsers ?? []).map((u: { id: string; email: string; plan: string; created_at: string }) => (
              <tr key={u.id} className="hover:bg-[#F5F0E8] transition-colors">
                <td className="px-5 py-3 text-[#1A1612]">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${PLAN_BADGE[u.plan] ?? PLAN_BADGE.free}`}>
                    {u.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8A7F72] hidden md:table-cell">
                  {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
