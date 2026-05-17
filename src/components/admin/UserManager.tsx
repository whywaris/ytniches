'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { User, Plan } from '@/types'

export function UserManager() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('users')
      .select('id, email, plan, saved_niches, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setUsers((data as User[]) ?? [])
        setIsLoading(false)
      })
  }, [])

  const planVariant: Record<Plan, 'free' | 'pro' | 'lifetime'> = {
    free: 'free',
    pro: 'pro',
    lifetime: 'lifetime',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">User Manager</h2>
        <p className="text-sm text-muted">{users.length} users</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {['Email', 'Plan', 'Saved Niches', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={planVariant[user.plan]}>{user.plan}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.saved_niches?.length ?? 0}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
