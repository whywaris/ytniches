'use client'

import { useState } from 'react'
import { ThumbsDown, ThumbsUp, Link as LinkIcon, Loader2 } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'

interface DislikeResult {
  videoTitle: string
  channelName: string
  thumbnailUrl: string
  publishedAt: string
  likes: number
  dislikes: number
  rating: number
  viewCount: number
  likeCount: number
  commentCount: number
}

interface ApiResponse extends Partial<DislikeResult> {
  error?: string
}

const RELATED_TOOLS = [
  {
    name: 'YouTube Tag Extractor',
    href: '/tag-extractor',
    description: 'Extract hidden tags from any YouTube video',
  },
  {
    name: 'Random Comment Picker',
    href: '/random-comment-picker',
    description: 'Pick a random winner from YouTube comments',
  },
  {
    name: 'Watch Time Calculator',
    href: '/watch-time-calculator',
    description: "Calculate when you'll reach 4,000 watch hours",
  },
]

const FAQS = [
  {
    q: 'Why did YouTube remove the dislike count?',
    a: "YouTube removed the public dislike count in November 2021, citing creator wellbeing. The decision was widely criticized. While the official count is hidden, this tool uses data from the Return YouTube Dislike browser extension — which collected real dislike counts before the removal and now uses statistical modeling to estimate current counts.",
  },
  {
    q: 'How accurate is the dislike count?',
    a: "For videos published before November 2021, the count is highly accurate — it uses real data collected before the removal. For newer videos, the count is an estimate extrapolated from Return YouTube Dislike extension users and statistical models. It won't be exact, but it gives a meaningful approximation.",
  },
  {
    q: 'What does the like/dislike ratio tell you?',
    a: "A ratio above 90% positive is generally considered excellent. 80-90% is average. Below 70% indicates significant audience dissatisfaction. For creators, monitoring the ratio helps understand audience sentiment beyond just view counts and comments.",
  },
  {
    q: 'Is this tool affiliated with YouTube or Google?',
    a: 'No. This tool uses the Return YouTube Dislike API (returnyoutubedislikeapi.com) and the official YouTube Data API. It is an independent free tool with no affiliation with YouTube or Google.',
  },
]

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function DislikeClient() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DislikeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFetch() {
    if (!url.trim()) return
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/tools/dislike-viewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url.trim() }),
      })
      const data = (await res.json()) as ApiResponse
      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setResult(data as DislikeResult)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const likeRatio = result
    ? result.likes + result.dislikes > 0
      ? Math.round((result.likes / (result.likes + result.dislikes)) * 100)
      : 50
    : 0

  return (
    <ToolLayout
      title="YouTube Dislike Viewer"
      description="View the estimated dislike count on any YouTube video. Uses crowd-sourced data from the Return YouTube Dislike project."
      icon={<ThumbsDown className="w-6 h-6 text-[#7C3AED]" />}
      relatedTools={RELATED_TOOLS}
    >
      {/* Input */}
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7F72] mb-3">
          YouTube Video URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-9 pr-4 py-3 border border-[#E0D9CE] rounded-xl text-sm text-[#1A1612] focus:outline-none focus:border-[#7C3AED] bg-white placeholder:text-[#8A7F72]"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={isLoading || !url.trim()}
            className="bg-[#7C3AED] text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-[#6D28D9] transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ThumbsDown className="w-4 h-4" />
            )}
            {isLoading ? 'Fetching...' : 'View Dislikes'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#FDF0ED] border border-[#E8402A]/20 rounded-xl px-4 py-3 text-sm text-[#E8402A] mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Video info */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-4 flex gap-4">
            {result.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.thumbnailUrl}
                alt=""
                className="w-28 h-16 object-cover rounded-lg shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1A1612] text-sm leading-snug mb-1 line-clamp-2">
                {result.videoTitle}
              </h3>
              <p className="text-xs text-[#8A7F72]">
                {result.channelName} · Published {formatDate(result.publishedAt)}
              </p>
            </div>
          </div>

          {/* Like / Dislike counts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 text-center">
              <ThumbsUp className="w-8 h-8 text-[#2A7A4B] mx-auto mb-2" />
              <p className="font-display font-black text-3xl text-[#1A1612]">
                {formatNum(result.likes)}
              </p>
              <p className="text-xs text-[#8A7F72] mt-1">Likes</p>
            </div>
            <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 text-center">
              <ThumbsDown className="w-8 h-8 text-[#E8402A] mx-auto mb-2" />
              <p className="font-display font-black text-3xl text-[#1A1612]">
                {formatNum(result.dislikes)}
              </p>
              <p className="text-xs text-[#8A7F72] mt-1">Dislikes (estimated)</p>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#1A1612]">Like / Dislike Ratio</span>
              <span className="text-sm font-bold text-[#2A7A4B]">{likeRatio}% positive</span>
            </div>
            <div className="h-3 bg-[#FDF0ED] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#2A7A4B] rounded-l-full transition-all duration-500"
                style={{ width: `${likeRatio}%` }}
              />
              <div
                className="h-full bg-[#E8402A] rounded-r-full transition-all duration-500"
                style={{ width: `${100 - likeRatio}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#8A7F72] mt-1">
              <span>{likeRatio}% likes</span>
              <span>{100 - likeRatio}% dislikes</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
            <h3 className="font-semibold text-[#1A1612] text-sm mb-4">Video Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Views', value: formatNum(result.viewCount) },
                { label: 'Official Likes', value: formatNum(result.likeCount) },
                { label: 'Comments', value: formatNum(result.commentCount) },
                { label: 'Rating', value: `${result.rating.toFixed(2)} / 5` },
                {
                  label: 'Like Rate',
                  value: result.viewCount
                    ? `${((result.likeCount / result.viewCount) * 100).toFixed(2)}%`
                    : '—',
                },
                {
                  label: 'Dislike Rate',
                  value: result.viewCount
                    ? `${((result.dislikes / result.viewCount) * 100).toFixed(2)}%`
                    : '—',
                },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-[#F5F0E8] rounded-xl">
                  <p className="font-display font-bold text-lg text-[#1A1612]">{value}</p>
                  <p className="text-xs text-[#8A7F72] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#8A7F72] text-center">
            Dislike data provided by{' '}
            <a
              href="https://returnyoutubedislike.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#1A1612]"
            >
              Return YouTube Dislike
            </a>
            . Counts for newer videos are estimates.
          </p>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="font-display font-bold text-xl text-[#1A1612] mb-5">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="bg-white border border-[#E0D9CE] rounded-[16px] p-4 group"
            >
              <summary className="font-semibold text-[#1A1612] text-sm cursor-pointer list-none flex items-center justify-between gap-3">
                <span>{item.q}</span>
                <span className="text-[#8A7F72] shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-[#8A7F72] leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
