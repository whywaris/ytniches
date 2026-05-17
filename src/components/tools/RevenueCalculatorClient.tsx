'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Eye, BarChart3 } from 'lucide-react'

const NICHE_CPMS: Record<string, { min: number; max: number }> = {
  'Finance & Investing': { min: 15, max: 30 },
  'Business & Marketing': { min: 12, max: 25 },
  'Technology': { min: 8, max: 18 },
  'Health & Fitness': { min: 6, max: 14 },
  'Education': { min: 5, max: 12 },
  'Lifestyle & Vlogs': { min: 3, max: 8 },
  'Gaming': { min: 2, max: 6 },
  'Entertainment': { min: 2, max: 7 },
  'Food & Cooking': { min: 4, max: 10 },
  'Travel': { min: 5, max: 12 },
  'Custom CPM': { min: 0, max: 0 },
}

export function RevenueCalculatorClient() {
  const [views, setViews] = useState('')
  const [niche, setNiche] = useState('Technology')
  const [customCpm, setCustomCpm] = useState('')
  const [videosPerMonth, setVideosPerMonth] = useState('8')

  const viewCount = parseInt(views.replace(/,/g, '')) || 0
  const cpmRange = NICHE_CPMS[niche]
  const isCustom = niche === 'Custom CPM'
  const cpmMin = isCustom ? (parseFloat(customCpm) || 0) : cpmRange.min
  const cpmMax = isCustom ? (parseFloat(customCpm) || 0) : cpmRange.max

  // YouTube takes 45%, creator gets 55%
  // Only ~50% of views are monetized on average
  const monetizedViews = viewCount * 0.5
  const revenueMin = (monetizedViews / 1000) * cpmMin * 0.55
  const revenueMax = (monetizedViews / 1000) * cpmMax * 0.55

  const monthlyMin = revenueMin * (parseInt(videosPerMonth) || 1)
  const monthlyMax = revenueMax * (parseInt(videosPerMonth) || 1)
  const yearlyMin = monthlyMin * 12
  const yearlyMax = monthlyMax * 12

  function formatCurrency(n: number) {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
    return `$${n.toFixed(0)}`
  }

  return (
    <div>
      {/* Inputs */}
      <div className="bg-card border border-border rounded-[20px] p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Views per video
            </label>
            <input
              type="text"
              value={views}
              onChange={(e) => setViews(e.target.value.replace(/[^0-9,]/g, ''))}
              placeholder="e.g. 50,000"
              className="w-full border-[1.5px] border-border rounded-xl px-4 py-3 text-sm text-foreground bg-card focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Niche / Category
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full border-[1.5px] border-border rounded-xl px-4 py-3 text-sm text-foreground bg-card focus:outline-none focus:border-accent transition-colors"
            >
              {Object.keys(NICHE_CPMS).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {isCustom && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Custom CPM ($)
              </label>
              <input
                type="number"
                value={customCpm}
                onChange={(e) => setCustomCpm(e.target.value)}
                placeholder="e.g. 10"
                className="w-full border-[1.5px] border-border rounded-xl px-4 py-3 text-sm text-foreground bg-card focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Videos per month
            </label>
            <input
              type="number"
              value={videosPerMonth}
              onChange={(e) => setVideosPerMonth(e.target.value)}
              placeholder="e.g. 8"
              min="1"
              max="60"
              className="w-full border-[1.5px] border-border rounded-xl px-4 py-3 text-sm text-foreground bg-card focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {!isCustom && (
          <p className="text-xs text-muted mt-3">
            Estimated CPM for {niche}: ${cpmMin}–${cpmMax}
          </p>
        )}
      </div>

      {/* Results */}
      {viewCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-[20px] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted mb-1">Per Video</p>
            <p className="font-display font-bold text-xl text-foreground">
              {isCustom
                ? formatCurrency(revenueMin)
                : `${formatCurrency(revenueMin)}–${formatCurrency(revenueMax)}`}
            </p>
          </div>

          <div className="bg-card border border-border rounded-[20px] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-muted mb-1">Monthly</p>
            <p className="font-display font-bold text-xl text-foreground">
              {isCustom
                ? formatCurrency(monthlyMin)
                : `${formatCurrency(monthlyMin)}–${formatCurrency(monthlyMax)}`}
            </p>
          </div>

          <div className="bg-card border border-border rounded-[20px] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-muted mb-1">Yearly</p>
            <p className="font-display font-bold text-xl text-foreground">
              {isCustom
                ? formatCurrency(yearlyMin)
                : `${formatCurrency(yearlyMin)}–${formatCurrency(yearlyMax)}`}
            </p>
          </div>

          <div className="bg-card border border-border rounded-[20px] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-xs text-muted mb-1">RPM (Creator)</p>
            <p className="font-display font-bold text-xl text-foreground">
              {isCustom
                ? `$${(cpmMin * 0.55 * 0.5).toFixed(2)}`
                : `$${(cpmMin * 0.55 * 0.5).toFixed(2)}–$${(cpmMax * 0.55 * 0.5).toFixed(2)}`}
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted text-center mt-6">
        * Estimates are approximate. Actual earnings depend on audience location, ad types, watch time, and monetization rate.
      </p>
    </div>
  )
}
