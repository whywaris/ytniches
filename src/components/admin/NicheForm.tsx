'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type { Niche, ScriptHook, ContentCalendar } from '@/types'

const CATEGORIES = ['Finance', 'Tech', 'Health', 'Business', 'Lifestyle', 'Education', 'Gaming', 'Other']
const COMPETITIONS = ['Low', 'Medium', 'High'] as const
const TRENDS = ['rising', 'stable', 'declining'] as const

interface Props { initialData?: Niche }

function emptyCalendar(): ContentCalendar {
  return {
    weeks: Array.from({ length: 4 }, (_, wi) => ({
      week_number: wi + 1,
      label: `Week ${wi + 1}`,
      days: Array.from({ length: 5 }, (_, di) => ({ day: di + 1, title: '' })),
    })),
  }
}

export function NicheForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Basic fields
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0])
  const [cpmMin, setCpmMin] = useState(String(initialData?.cpm_min ?? ''))
  const [cpmMax, setCpmMax] = useState(String(initialData?.cpm_max ?? ''))
  const [competition, setCompetition] = useState<typeof COMPETITIONS[number]>(initialData?.competition_level ?? 'Medium')
  const [trend, setTrend] = useState<typeof TRENDS[number]>(initialData?.growth_trend ?? 'stable')
  const [isPremium, setIsPremium] = useState(initialData?.is_premium ?? false)
  const [published, setPublished] = useState(initialData?.published ?? false)

  // Audience
  const [avgViews, setAvgViews] = useState(initialData?.avg_views ?? '')
  const [bestDay, setBestDay] = useState(initialData?.best_upload_day ?? '')
  const [videoLength, setVideoLength] = useState(initialData?.ideal_video_length ?? '')
  const [audience, setAudience] = useState(initialData?.top_audience ?? '')
  const [ageGroup, setAgeGroup] = useState(initialData?.age_group ?? '')
  const [audienceSize, setAudienceSize] = useState(initialData?.audience_size ?? '')

  // Content arrays
  const [videoIdeas, setVideoIdeas] = useState<string[]>(initialData?.video_ideas?.length ? initialData.video_ideas : Array(5).fill(''))
  const [scriptHooks, setScriptHooks] = useState<ScriptHook[]>(initialData?.script_hooks?.length ? initialData.script_hooks : Array(3).fill({ label: '', text: '' }))
  const [titleTemplates, setTitleTemplates] = useState<string[]>(initialData?.title_templates?.length ? initialData.title_templates : Array(5).fill(''))
  const [thumbnailPrompts, setThumbnailPrompts] = useState<string[]>(initialData?.thumbnail_prompts?.length ? initialData.thumbnail_prompts : Array(4).fill(''))
  const [calendar, setCalendar] = useState<ContentCalendar>(initialData?.content_calendar ?? emptyCalendar())

  useEffect(() => {
    if (!isEdit) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }, [name, isEdit])

  async function handleSubmit(asDraft = false) {
    setSaving(true)
    setError('')
    const payload = {
      name, slug, category,
      cpm_min: Number(cpmMin), cpm_max: Number(cpmMax),
      competition_level: competition, growth_trend: trend,
      is_premium: isPremium, published: asDraft ? false : published,
      avg_views: avgViews || null, best_upload_day: bestDay || null,
      ideal_video_length: videoLength || null, top_audience: audience || null,
      age_group: ageGroup || null, audience_size: audienceSize || null,
      video_ideas: videoIdeas.filter(Boolean),
      script_hooks: scriptHooks.filter((h) => h.label || h.text),
      title_templates: titleTemplates.filter(Boolean),
      thumbnail_prompts: thumbnailPrompts.filter(Boolean),
      content_calendar: calendar,
    }

    const url = isEdit ? `/api/admin/niches/${initialData!.id}` : '/api/admin/niches'
    const method = isEdit ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json() as { error?: string }
    if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }
    router.push('/admin/niches')
  }

  function updateCalendarDay(weekIdx: number, dayIdx: number, title: string) {
    setCalendar((prev) => {
      const weeks = prev.weeks.map((w, wi) =>
        wi !== weekIdx ? w : { ...w, days: w.days.map((d, di) => di !== dayIdx ? d : { ...d, title }) }
      )
      return { weeks }
    })
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Section 1 — Basic info */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <h2 className="font-display font-bold text-[#1A1612] mb-4">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" placeholder="Personal Finance for Millennials" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-full">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">CPM Min ($)</label>
              <input type="number" value={cpmMin} onChange={(e) => setCpmMin(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">CPM Max ($)</label>
              <input type="number" value={cpmMax} onChange={(e) => setCpmMax(e.target.value)} className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Competition</label>
            <select value={competition} onChange={(e) => setCompetition(e.target.value as typeof COMPETITIONS[number])} className="input-field w-full">
              {COMPETITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Growth Trend</label>
            <select value={trend} onChange={(e) => setTrend(e.target.value as typeof TRENDS[number])} className="input-field w-full">
              {TRENDS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="accent-[#E8402A] w-4 h-4" />
              <span className="text-sm font-semibold text-[#1A1612]">Premium</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-[#E8402A] w-4 h-4" />
              <span className="text-sm font-semibold text-[#1A1612]">Published</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 2 — Audience */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <h2 className="font-display font-bold text-[#1A1612] mb-4">Audience Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Avg Views / Video', value: avgViews, set: setAvgViews, ph: '50K–200K' },
            { label: 'Best Upload Day', value: bestDay, set: setBestDay, ph: 'Tuesday, Thursday' },
            { label: 'Ideal Video Length', value: videoLength, set: setVideoLength, ph: '8–15 minutes' },
            { label: 'Top Audience Countries', value: audience, set: setAudience, ph: 'US, UK, Canada' },
            { label: 'Age Group', value: ageGroup, set: setAgeGroup, ph: '25–35' },
            { label: 'Audience Size', value: audienceSize, set: setAudienceSize, ph: 'Large / Growing' },
          ].map(({ label, value, set, ph }) => (
            <div key={label}>
              <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">{label}</label>
              <input value={value ?? ''} onChange={(e) => set(e.target.value)} placeholder={ph} className="input-field w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Video Ideas */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[#1A1612]">Video Ideas ({videoIdeas.length})</h2>
          <button onClick={() => setVideoIdeas((p) => [...p, ...Array(5).fill('')])} className="text-xs font-bold text-[#E8402A] flex items-center gap-1 hover:text-[#CF3520]">
            <Plus className="w-3.5 h-3.5" /> Add 5 more
          </button>
        </div>
        <div className="space-y-2">
          {videoIdeas.map((idea, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-xs text-[#8A7F72] w-6 mt-2.5 shrink-0">{i + 1}.</span>
              <input value={idea} onChange={(e) => setVideoIdeas((p) => p.map((v, idx) => idx === i ? e.target.value : v))} placeholder="Video idea..." className="input-field flex-1" />
              {videoIdeas.length > 1 && (
                <button onClick={() => setVideoIdeas((p) => p.filter((_, idx) => idx !== i))} className="text-[#8A7F72] hover:text-[#E8402A] mt-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 — Script Hooks */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[#1A1612]">Script Hooks</h2>
          <button onClick={() => setScriptHooks((p) => [...p, { label: '', text: '' }])} className="text-xs font-bold text-[#E8402A] flex items-center gap-1 hover:text-[#CF3520]">
            <Plus className="w-3.5 h-3.5" /> Add hook
          </button>
        </div>
        <div className="space-y-4">
          {scriptHooks.map((hook, i) => (
            <div key={i} className="border border-[#E0D9CE] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <input value={hook.label} onChange={(e) => setScriptHooks((p) => p.map((h, idx) => idx === i ? { ...h, label: e.target.value } : h))} placeholder="Hook label (e.g. Shock Stat)" className="input-field flex-1 mr-2" />
                <button onClick={() => setScriptHooks((p) => p.filter((_, idx) => idx !== i))} className="text-[#8A7F72] hover:text-[#E8402A]">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea value={hook.text} onChange={(e) => setScriptHooks((p) => p.map((h, idx) => idx === i ? { ...h, text: e.target.value } : h))} placeholder="Hook text..." rows={2} className="input-field w-full resize-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 5 — Title Templates */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[#1A1612]">Title Templates</h2>
          <button onClick={() => setTitleTemplates((p) => [...p, ''])} className="text-xs font-bold text-[#E8402A] flex items-center gap-1 hover:text-[#CF3520]">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {titleTemplates.map((t, i) => (
            <div key={i} className="flex gap-2">
              <input value={t} onChange={(e) => setTitleTemplates((p) => p.map((v, idx) => idx === i ? e.target.value : v))} placeholder="How I [ACTION] in [TIME] — [RESULT]" className="input-field flex-1" />
              <button onClick={() => setTitleTemplates((p) => p.filter((_, idx) => idx !== i))} className="text-[#8A7F72] hover:text-[#E8402A]">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6 — Thumbnail Prompts */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[#1A1612]">Thumbnail Prompts</h2>
          <button onClick={() => setThumbnailPrompts((p) => [...p, ''])} className="text-xs font-bold text-[#E8402A] flex items-center gap-1 hover:text-[#CF3520]">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {thumbnailPrompts.map((p, i) => (
            <div key={i} className="flex gap-2">
              <textarea value={p} onChange={(e) => setThumbnailPrompts((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))} placeholder="Describe the thumbnail..." rows={2} className="input-field flex-1 resize-none" />
              <button onClick={() => setThumbnailPrompts((prev) => prev.filter((_, idx) => idx !== i))} className="text-[#8A7F72] hover:text-[#E8402A] self-start mt-2">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 7 — Content Calendar */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6">
        <h2 className="font-display font-bold text-[#1A1612] mb-4">Content Calendar (4 weeks)</h2>
        <div className="space-y-6">
          {calendar.weeks.map((week, wi) => (
            <div key={wi}>
              <p className="font-semibold text-sm text-[#1A1612] mb-2">Week {week.week_number}</p>
              <div className="space-y-2">
                {week.days.map((day, di) => (
                  <div key={di} className="flex items-center gap-3">
                    <span className="text-xs text-[#8A7F72] w-12 shrink-0">Day {day.day}</span>
                    <input value={day.title} onChange={(e) => updateCalendarDay(wi, di, e.target.value)} placeholder="Video title for this day..." className="input-field flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {error && <p className="text-sm text-[#E8402A]">{error}</p>}
      <div className="flex gap-3 pb-8">
        <button onClick={() => handleSubmit(false)} disabled={saving || !name.trim()} className="flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Update niche' : 'Save niche'}
        </button>
        <button onClick={() => handleSubmit(true)} disabled={saving} className="border border-[#E0D9CE] text-[#1A1612] font-bold text-sm px-6 py-3 rounded-full hover:border-[#1A1612] transition-colors disabled:opacity-60">
          Save as draft
        </button>
      </div>

      <style jsx>{`
        .input-field {
          padding: 8px 14px;
          font-size: 0.875rem;
          background: #F5F0E8;
          border: 1px solid #E0D9CE;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: #E8402A;
        }
      `}</style>
    </div>
  )
}
