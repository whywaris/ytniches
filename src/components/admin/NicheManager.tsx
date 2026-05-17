'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { Niche } from '@/types'

export function NicheManager() {
  const [niches, setNiches] = useState<Niche[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('niches')
      .select('id, name, category, competition_level, is_premium, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNiches((data as Niche[]) ?? [])
        setIsLoading(false)
      })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this niche? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('niches').delete().eq('id', id)
    setNiches((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Niche Manager</h2>
        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4" />
          Add Niche
        </Button>
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
                {['Name', 'Category', 'Competition', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {niches.map((niche) => (
                <tr key={niche.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{niche.name}</td>
                  <td className="px-4 py-3 text-muted">{niche.category}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        niche.competition_level === 'Low' ? 'low'
                        : niche.competition_level === 'Medium' ? 'medium'
                        : 'high'
                      }
                    >
                      {niche.competition_level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={niche.is_premium ? 'pro' : 'free'}>
                      {niche.is_premium ? 'Pro' : 'Free'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(niche.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
