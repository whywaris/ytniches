'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronDown, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DbUser {
  id: string
  email: string
  plan: string
  created_at: string
  last_sign_in_at: string | null
  saved_niches: string[]
  lemonsqueezy_customer_id: string | null
  lemonsqueezy_subscription_id: string | null
}

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-[#E0D9CE] text-[#8A7F72]',
  pro: 'bg-[#FDF0ED] text-[#E8402A]',
  lifetime: 'bg-[#EBF5EF] text-[#2A7A4B]',
}

const PLANS = ['free', 'pro', 'lifetime']

export function UserManagerClient({ users: initialUsers }: { users: DbUser[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('All')
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null)
  const [newPlan, setNewPlan] = useState('')
  const [updatingPlan, setUpdatingPlan] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const filtered = useMemo(() => users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === 'All' || u.plan === filterPlan
    return matchSearch && matchPlan
  }), [users, search, filterPlan])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  async function updatePlan(userId: string, plan: string) {
    setUpdatingPlan(true)
    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan } : u))
      if (selectedUser?.id === userId) setSelectedUser((prev) => prev ? { ...prev, plan } : null)
    }
    setUpdatingPlan(false)
    setNewPlan('')
  }

  async function deleteUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}/plan`, { method: 'DELETE' })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setConfirmDelete(null)
      setSelectedUser(null)
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search by email..." className="pl-9 pr-4 py-2 text-sm bg-white border border-[#E0D9CE] rounded-full focus:outline-none focus:border-[#E8402A] w-56" />
        </div>
        <select value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value); setPage(1) }} className="text-sm bg-white border border-[#E0D9CE] rounded-full px-4 py-2 focus:outline-none focus:border-[#E8402A]">
          {['All', 'free', 'pro', 'lifetime'].map((p) => <option key={p} className="capitalize">{p === 'All' ? 'All plans' : p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden mb-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-[#E0D9CE] bg-[#F5F0E8]">
              {['Email', 'Plan', 'Signed Up', 'Last Login', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider first:pl-5 last:text-right last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CE]">
            {paginated.map((user) => (
              <tr key={user.id} className="hover:bg-[#F5F0E8] transition-colors">
                <td className="px-5 py-3 text-[#1A1612] max-w-[200px] truncate">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full capitalize', PLAN_BADGE[user.plan] ?? PLAN_BADGE.free)}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8A7F72] hidden md:table-cell">
                  {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-[#8A7F72] hidden lg:table-cell">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Never'}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setSelectedUser(user)} className="text-xs font-semibold text-[#E8402A] hover:text-[#CF3520] flex items-center gap-1">
                      Details <ChevronDown className="w-3 h-3" />
                    </button>
                    <button onClick={() => setConfirmDelete(user.id)} className="p-1 text-[#8A7F72] hover:text-[#E8402A] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-[#8A7F72]">No users found.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-4 py-2 text-sm font-semibold rounded-full border border-[#E0D9CE] disabled:opacity-40">Prev</button>
          <span className="text-sm text-[#8A7F72]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="px-4 py-2 text-sm font-semibold rounded-full border border-[#E0D9CE] disabled:opacity-40">Next</button>
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-[20px] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-[#1A1612]">User Details</h3>
              <button onClick={() => setSelectedUser(null)}><X className="w-5 h-5 text-[#8A7F72]" /></button>
            </div>
            <dl className="space-y-2.5 mb-5">
              {[
                ['Email', selectedUser.email],
                ['Plan', selectedUser.plan],
                ['Signed Up', new Date(selectedUser.created_at).toLocaleDateString()],
                ['Last Login', selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleDateString() : 'Never'],
                ['Saved Niches', String(selectedUser.saved_niches?.length ?? 0)],
                ['LS Customer ID', selectedUser.lemonsqueezy_customer_id ?? 'N/A'],
                ['LS Subscription ID', selectedUser.lemonsqueezy_subscription_id ?? 'N/A'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <dt className="text-[#8A7F72] font-medium">{k}</dt>
                  <dd className="text-[#1A1612] font-semibold capitalize">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-[#E0D9CE] pt-4">
              <p className="text-xs font-bold text-[#8A7F72] mb-2">Override Plan</p>
              <div className="flex gap-2">
                <select value={newPlan || selectedUser.plan} onChange={(e) => setNewPlan(e.target.value)} className="flex-1 text-sm bg-[#F5F0E8] border border-[#E0D9CE] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E8402A]">
                  {PLANS.map((p) => <option key={p} className="capitalize">{p}</option>)}
                </select>
                <button onClick={() => updatePlan(selectedUser.id, newPlan || selectedUser.plan)} disabled={updatingPlan} className="bg-[#E8402A] text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-[#CF3520] disabled:opacity-60">
                  {updatingPlan ? '...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full">
            <h3 className="font-display font-bold text-lg text-[#1A1612] mb-2">Delete user?</h3>
            <p className="text-sm text-[#8A7F72] mb-5">This permanently removes the user and all their data.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-[#E0D9CE] text-[#1A1612] font-bold text-sm py-2.5 rounded-full hover:bg-[#F5F0E8]">Cancel</button>
              <button onClick={() => deleteUser(confirmDelete)} className="flex-1 bg-[#E8402A] text-white font-bold text-sm py-2.5 rounded-full hover:bg-[#CF3520]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
