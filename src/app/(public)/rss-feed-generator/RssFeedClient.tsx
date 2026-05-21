'use client'

import { useState } from 'react'
import { Rss, Copy, Check, Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'

interface RssResult {
  channelId: string
  rssUrl: string
  channelTitle: string
  channelDescription: string
  channelHandle: string | null
  thumbnailUrl: string
  subscriberCount: number
  videoCount: number
}

interface ApiResponse extends Partial<RssResult> {
  error?: string
}

const RELATED_TOOLS = [
  {
    name: 'YouTube Tag Extractor',
    href: '/tag-extractor',
    description: 'Extract hidden tags from any YouTube video',
  },
  {
    name: 'Watch Time Calculator',
    href: '/watch-time-calculator',
    description: "Calculate when you'll reach 4,000 watch hours",
  },
  {
    name: 'Dislike Viewer',
    href: '/dislike-viewer',
    description: 'See hidden dislike counts on any video',
  },
]

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export function RssFeedClient() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<RssResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function handleGenerate() {
    if (!input.trim()) return
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/tools/rss-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelInput: input.trim() }),
      })
      const data = (await res.json()) as ApiResponse
      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setResult(data as RssResult)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ToolLayout
      title="YouTube RSS Feed Generator"
      description="Generate RSS feed URLs for any YouTube channel. Paste a channel URL, @handle, or channel ID and get a ready-to-use RSS link."
      icon={<Rss className="w-6 h-6 text-[#2563EB]" />}
      relatedTools={RELATED_TOOLS}
    >
      {/* Input */}
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7F72] mb-3">
          YouTube Channel URL, @Handle, or Channel ID
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="https://youtube.com/@mkbhd"
              className="w-full pl-9 pr-4 py-3 border border-[#E0D9CE] rounded-xl text-sm text-[#1A1612] focus:outline-none focus:border-[#2563EB] bg-white placeholder:text-[#8A7F72]"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="bg-[#2563EB] text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Rss className="w-4 h-4" />
            )}
            {isLoading ? 'Fetching...' : 'Generate Feed'}
          </button>
        </div>
        <p className="text-[10px] text-[#8A7F72] mt-2">
          Accepts: youtube.com/@handle · youtube.com/channel/UCxxx · channel ID (UCxxx) · @handle
        </p>
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
          {/* Channel card */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-4 flex gap-4 items-center">
            {result.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.thumbnailUrl}
                alt=""
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1A1612] text-base leading-snug">
                {result.channelTitle}
              </h3>
              <p className="text-xs text-[#8A7F72]">
                {result.channelHandle ? `${result.channelHandle} · ` : ''}
                {formatNum(result.subscriberCount)} subscribers · {formatNum(result.videoCount)} videos
              </p>
            </div>
          </div>

          {/* RSS URL card */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Rss className="w-4 h-4 text-[#2563EB]" />
                <span className="text-sm font-semibold text-[#1A1612]">RSS Feed URL</span>
              </div>
              <a
                href={result.rssUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline"
              >
                Open feed
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="bg-[#F5F0E8] rounded-xl p-3 flex items-center gap-3 mb-3">
              <code className="text-xs text-[#1A1612] flex-1 break-all font-mono">
                {result.rssUrl}
              </code>
            </div>
            <button
              onClick={() => copyText(result.rssUrl, 'rss')}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white font-bold text-sm py-3 rounded-full hover:bg-[#1D4ED8] transition-colors"
            >
              {copied === 'rss' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy RSS URL
                </>
              )}
            </button>
          </div>

          {/* Channel ID card */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8A7F72] mb-2">
              Channel ID
            </p>
            <div className="flex items-center gap-3">
              <code className="text-sm text-[#1A1612] flex-1 font-mono bg-[#F5F0E8] rounded-lg px-3 py-2 break-all">
                {result.channelId}
              </code>
              <button
                onClick={() => copyText(result.channelId, 'id')}
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-[#E0D9CE] rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                {copied === 'id' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === 'id' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Usage guide */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
            <h3 className="font-semibold text-[#1A1612] text-sm mb-3">How to use this feed</h3>
            <ul className="space-y-2">
              {[
                'Paste the RSS URL into Feedly, Inoreader, or any RSS reader',
                'Use with Zapier or Make to trigger automations on new uploads',
                'Add to Slack with /feed command for team notifications',
                'Subscribe in email clients like Thunderbird or Apple Mail',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-[#8A7F72]">
                  <span className="text-[#2563EB] shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </ToolLayout>
  )
}
