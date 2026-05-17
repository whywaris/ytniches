'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  proUsers: number
  lifetimeUsers: number
  freeUsers: number
}

export function AdminCharts({ proUsers, lifetimeUsers, freeUsers }: Props) {
  const barData = [
    { name: 'Free', value: Math.max(0, freeUsers), color: '#8A7F72' },
    { name: 'Pro', value: proUsers, color: '#E8402A' },
    { name: 'Lifetime', value: lifetimeUsers, color: '#2A7A4B' },
  ]

  const total = freeUsers + proUsers + lifetimeUsers

  return (
    <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-[#1A1612]">Plan Distribution</h2>
        <span className="text-xs text-[#8A7F72]">{total} total users</span>
      </div>

      {total === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-[#8A7F72]">No user data yet</div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F0E8" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#8A7F72' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#8A7F72' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A1612',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value) => [`${value} users`, '']}
                labelStyle={{ color: '#8A7F72' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-4">
        {barData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
            <span className="text-xs text-[#8A7F72]">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
