'use client'

import { useMemo, useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Timer } from 'lucide-react'

const INPUT_CLASS =
  'border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A] bg-white w-full'

const RELATED_TOOLS = [
  {
    name: 'YouTube Tag Extractor',
    href: '/tag-extractor',
    description: 'Extract hidden tags from any YouTube video',
  },
  {
    name: 'RSS Feed Generator',
    href: '/rss-feed-generator',
    description: 'Get the RSS feed URL for any YouTube channel',
  },
  {
    name: 'Thumbnail Resizer',
    href: '/thumbnail-resizer',
    description: 'Resize images to perfect YouTube thumbnail dimensions',
  },
]

const FAQ_ITEMS = [
  {
    q: 'How many watch hours do you need for YouTube monetization?',
    a: "YouTube requires 4,000 watch hours in the past 12 months, along with 1,000 subscribers, to join the YouTube Partner Program. Watch hours from Shorts do not count toward this requirement.",
  },
  {
    q: 'How long does it take to get 4,000 watch hours?',
    a: "It depends entirely on your content quality and upload frequency. With high-retention videos (40%+ view duration), uploading 2-3 times per week with 500+ average views per video, most creators reach 4,000 hours within 6-12 months.",
  },
  {
    q: 'Does watch time reset on YouTube?',
    a: "No, watch time does not reset permanently. However, YouTube only counts watch hours from the past 12 months for monetization eligibility. So if you stop uploading, older videos' watch hours will eventually fall out of the 12-month window.",
  },
  {
    q: 'Do YouTube Shorts count toward watch hours?',
    a: "No. Watch time from YouTube Shorts does not count toward the 4,000 watch hour monetization requirement. Only long-form video watch time counts. However, Shorts have their own separate monetization program.",
  },
]

const MILESTONES = [500, 1000, 2000, 4000]

function formatTimeFromWeeks(weeks: number): string {
  if (!isFinite(weeks) || weeks <= 0) return 'Already reached!'
  if (weeks < 1) return 'Less than a week'

  const totalDays = Math.round(weeks * 7)
  const years = Math.floor(totalDays / 365)
  const months = Math.floor((totalDays % 365) / 30)
  const remainingWeeks = Math.floor(((totalDays % 365) % 30) / 7)

  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
  if (remainingWeeks > 0 && years === 0)
    parts.push(`${remainingWeeks} ${remainingWeeks === 1 ? 'week' : 'weeks'}`)

  return parts.length > 0 ? parts.join(', ') : 'Less than a week'
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function WatchTimeClient() {
  const [videoMinutes, setVideoMinutes] = useState(8)
  const [videoSeconds, setVideoSeconds] = useState(0)
  const [videosPerWeek, setVideosPerWeek] = useState(2)
  const [avgViews, setAvgViews] = useState(500)
  const [viewDurationPercent, setViewDurationPercent] = useState(40)
  const [currentWatchHours, setCurrentWatchHours] = useState(0)

  const calc = useMemo(() => {
    const videoLengthMins = videoMinutes + videoSeconds / 60
    const watchMinsPerVideo = videoLengthMins * (viewDurationPercent / 100) * avgViews
    const watchHoursPerVideo = watchMinsPerVideo / 60
    const watchHoursPerWeek = watchHoursPerVideo * videosPerWeek
    const watchHoursPerMonth = watchHoursPerWeek * 4.33
    const watchHoursPerYear = watchHoursPerWeek * 52
    const hoursNeeded = Math.max(0, 4000 - currentWatchHours)
    const weeksNeeded = watchHoursPerWeek > 0 ? hoursNeeded / watchHoursPerWeek : Infinity
    const progressPercent = Math.min(100, (currentWatchHours / 4000) * 100)
    const estimatedDate = new Date(Date.now() + weeksNeeded * 7 * 24 * 60 * 60 * 1000)

    const perVideoMins = watchMinsPerVideo
    const perWeekHours = Math.floor(watchHoursPerWeek)
    const perWeekMins = Math.round((watchHoursPerWeek - perWeekHours) * 60)

    return {
      watchHoursPerWeek,
      watchHoursPerMonth,
      watchHoursPerYear,
      hoursNeeded,
      weeksNeeded,
      progressPercent,
      estimatedDate,
      perVideoMins,
      perWeekHours,
      perWeekMins,
    }
  }, [videoMinutes, videoSeconds, videosPerWeek, avgViews, viewDurationPercent, currentWatchHours])

  return (
    <ToolLayout
      title="Watch Time Calculator"
      description="Calculate how long until you reach YouTube's 4,000 watch hour monetization requirement based on your upload schedule and video performance."
      icon={<Timer className="w-7 h-7 text-[#2A7A4B]" />}
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-5">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Inputs */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 space-y-5">
            <h2 className="font-display font-bold text-base text-[#1A1612]">Your Channel Stats</h2>

            {/* Video Length */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                Average Video Length
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={videoMinutes}
                    onChange={(e) => setVideoMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className={INPUT_CLASS}
                    aria-label="Minutes"
                  />
                  <p className="text-xs text-[#8A7F72] mt-1 text-center">minutes</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={videoSeconds}
                    onChange={(e) =>
                      setVideoSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                    }
                    className={INPUT_CLASS}
                    aria-label="Seconds"
                  />
                  <p className="text-xs text-[#8A7F72] mt-1 text-center">seconds</p>
                </div>
              </div>
            </div>

            {/* Videos Per Week */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                Videos Per Week
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={videosPerWeek}
                onChange={(e) =>
                  setVideosPerWeek(Math.min(14, Math.max(1, parseInt(e.target.value) || 1)))
                }
                className={INPUT_CLASS}
              />
            </div>

            {/* Avg Views Per Video */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                Avg Views Per Video
              </label>
              <input
                type="number"
                min={0}
                value={avgViews}
                onChange={(e) => setAvgViews(Math.max(0, parseInt(e.target.value) || 0))}
                className={INPUT_CLASS}
              />
            </div>

            {/* View Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#1A1612]">Avg View Duration</label>
                <span className="text-sm font-bold text-[#E8402A]">{viewDurationPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={viewDurationPercent}
                onChange={(e) => setViewDurationPercent(parseInt(e.target.value))}
                className="w-full accent-[#E8402A]"
              />
              <div className="flex justify-between text-xs text-[#8A7F72] mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Current Watch Hours */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                Current Watch Hours
              </label>
              <input
                type="number"
                min={0}
                max={4000}
                value={currentWatchHours}
                onChange={(e) =>
                  setCurrentWatchHours(Math.min(4000, Math.max(0, parseInt(e.target.value) || 0)))
                }
                className={INPUT_CLASS}
              />
              <p className="text-xs text-[#8A7F72] mt-1">
                Enter your current watch hours from YouTube Studio
              </p>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 flex flex-col gap-5">
            <h2 className="font-display font-bold text-base text-[#1A1612]">Your Monetization Progress</h2>

            {/* Hours needed */}
            <div className="text-center py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8A7F72] mb-1">
                Watch Hours Goal
              </p>
              <p className="font-display font-black text-4xl text-[#1A1612] leading-none">
                {calc.hoursNeeded <= 0
                  ? '4,000'
                  : calc.hoursNeeded.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-[#8A7F72] mt-1">
                {calc.hoursNeeded <= 0 ? 'Goal reached!' : 'hours remaining to monetization'}
              </p>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#8A7F72]">Progress to 4,000 hrs</span>
                <span className="text-xs font-bold text-[#2A7A4B]">
                  {calc.progressPercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-[#F5F0E8] rounded-full overflow-hidden border border-[#E0D9CE]">
                <div
                  className="h-full bg-[#2A7A4B] rounded-full transition-all duration-300"
                  style={{ width: `${calc.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#8A7F72] mt-1">
                <span>{currentWatchHours.toLocaleString()} hrs</span>
                <span>4,000 hrs</span>
              </div>
            </div>

            {/* Estimated pace */}
            <div className="bg-[#F5F0E8] rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-[#8A7F72] shrink-0">At your pace:</span>
                <span className="text-sm font-bold text-[#1A1612] text-right">
                  {calc.hoursNeeded <= 0
                    ? 'Already monetized!'
                    : !isFinite(calc.weeksNeeded)
                    ? 'Upload videos to calculate'
                    : formatTimeFromWeeks(calc.weeksNeeded)}
                </span>
              </div>
              {isFinite(calc.weeksNeeded) && calc.hoursNeeded > 0 && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-[#8A7F72] shrink-0">Estimated date:</span>
                  <span className="text-sm font-bold text-[#E8402A] text-right">
                    {formatDate(calc.estimatedDate)}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-[#8A7F72] shrink-0">Weekly hours gained:</span>
                <span className="text-sm font-bold text-[#1A1612] text-right">
                  {calc.watchHoursPerWeek.toFixed(1)} hrs/week
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
          <h2 className="font-display font-bold text-base text-[#1A1612] mb-4">
            Milestone Timeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MILESTONES.map((milestone) => {
              const reached = currentWatchHours >= milestone
              const weeksToReach =
                calc.watchHoursPerWeek > 0
                  ? Math.max(0, (milestone - currentWatchHours) / calc.watchHoursPerWeek)
                  : Infinity
              const isFinal = milestone === 4000

              return (
                <div
                  key={milestone}
                  className={`rounded-xl p-4 border ${
                    reached
                      ? 'bg-[#F0FDF4] border-[#86EFAC]'
                      : isFinal
                      ? 'bg-[#FDF0ED] border-[#FBBFB4]'
                      : 'bg-[#F5F0E8] border-[#E0D9CE]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{reached ? '✓' : isFinal ? '🎯' : '⏱'}</span>
                    <span
                      className={`font-display font-black text-lg ${
                        reached
                          ? 'text-[#2A7A4B]'
                          : isFinal
                          ? 'text-[#E8402A]'
                          : 'text-[#1A1612]'
                      }`}
                    >
                      {milestone.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#8A7F72]">hrs</span>
                  </div>
                  <p className="text-xs text-[#8A7F72]">
                    {reached
                      ? 'Already reached!'
                      : !isFinite(weeksToReach)
                      ? 'Upload to calculate'
                      : formatTimeFromWeeks(weeksToReach)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
          <h2 className="font-display font-bold text-base text-[#1A1612] mb-4">
            Weekly Breakdown
          </h2>
          <div className="divide-y divide-[#F5F0E8]">
            {[
              {
                label: 'Per Video',
                value: `${calc.perVideoMins.toFixed(0)} watch minutes`,
              },
              {
                label: 'Per Week',
                value:
                  calc.perWeekHours > 0 || calc.perWeekMins > 0
                    ? `${calc.perWeekHours} hrs ${calc.perWeekMins} min`
                    : '0 hrs',
              },
              {
                label: 'Per Month',
                value: `${calc.watchHoursPerMonth.toFixed(1)} hours`,
              },
              {
                label: 'Per Year',
                value: `${calc.watchHoursPerYear.toFixed(0)} hours`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <span className="text-sm text-[#8A7F72]">{label}</span>
                <span className="text-sm font-bold text-[#1A1612]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
          <h2 className="font-display font-bold text-base text-[#1A1612] mb-4">
            Tips to Earn Watch Hours Faster
          </h2>
          <ul className="space-y-2.5">
            {[
              'Create longer videos (8–15 mins performs best for watch time)',
              'Improve your hook — the first 30 seconds is critical for retention',
              'Use chapters to improve audience retention across the video',
              'Create playlists to chain videos together and autoplay',
              'Upload consistently — the algorithm rewards regularity',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-[#1A1612]">
                <span className="text-[#E8402A] font-bold shrink-0 mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
          <h2 className="font-display font-bold text-base text-[#1A1612] mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 divide-y divide-[#F5F0E8]">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="pt-5 first:pt-0">
                <h3 className="font-semibold text-sm text-[#1A1612] mb-1.5">{q}</h3>
                <p className="text-sm text-[#8A7F72] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
