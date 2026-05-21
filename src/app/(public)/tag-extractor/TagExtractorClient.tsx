'use client'

import { useState } from 'react'
import { Tag, Copy, Check, X, Loader2, Link as LinkIcon } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { cn } from '@/lib/utils'

interface TagResult {
  tags: string[]
  videoTitle: string
  channelName: string
  viewCount: string
  thumbnailUrl: string
}

interface ApiResponse extends TagResult {
  error?: string
}

const RELATED_TOOLS = [
  {
    name: 'Watch Time Calculator',
    href: '/watch-time-calculator',
    description: "Calculate when you'll reach 4,000 watch hours",
  },
  {
    name: 'RSS Feed Generator',
    href: '/rss-feed-generator',
    description: 'Get the RSS feed URL for any YouTube channel',
  },
  {
    name: 'Dislike Viewer',
    href: '/dislike-viewer',
    description: 'See hidden dislike counts on any video',
  },
]

const TIPS = [
  'Videos with 5–15 tags typically perform best on YouTube',
  'Use specific niche tags, not just broad keywords',
  'Include your channel name as a tag for branding',
  'Mix high-volume and low-competition tags',
  'Check competitor tags to find keyword gaps',
]

export function TagExtractorClient() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TagResult | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  async function handleExtract() {
    if (!url.trim()) return
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/tools/tag-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url.trim() }),
      })
      const data = (await res.json()) as ApiResponse
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      const sorted = [...data.tags].sort((a, b) => a.length - b.length)
      setResult({ ...data, tags: sorted })
      setSelectedTags(sorted)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function copyTags(format: 'lines' | 'csv' | 'comma') {
    if (!selectedTags.length) return
    let text = ''
    if (format === 'lines') text = selectedTags.join('\n')
    else if (format === 'csv') text = selectedTags.map((t) => `"${t}"`).join(',')
    else text = selectedTags.join(', ')

    await navigator.clipboard.writeText(text)
    setCopiedKey(format)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <ToolLayout
      title="YouTube Tag Extractor"
      description="Extract hidden tags from any YouTube video instantly. See exactly which keywords top creators are targeting."
      icon={<Tag className="w-6 h-6 text-[#E8402A]" />}
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
              onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-9 pr-4 py-3 border border-[#E0D9CE] rounded-xl text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A] bg-white placeholder:text-[#8A7F72]"
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={isLoading || !url.trim()}
            className="bg-[#E8402A] text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Tag className="w-4 h-4" />
            )}
            {isLoading ? 'Extracting...' : 'Extract Tags'}
          </button>
        </div>
        <p className="text-[10px] text-[#8A7F72] mt-2">
          Supports: youtube.com/watch?v= · youtu.be/ · /shorts/ · /embed/
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
        <div className="space-y-5">
          {/* Video info */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-4 flex gap-4">
            {result.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.thumbnailUrl}
                alt=""
                className="w-24 h-16 object-cover rounded-lg shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1A1612] text-sm leading-snug mb-1 line-clamp-2">
                {result.videoTitle}
              </h3>
              <p className="text-xs text-[#8A7F72]">
                {result.channelName} · {result.viewCount} views
              </p>
            </div>
          </div>

          {/* Tags header + actions */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#8A7F72]">
                  Tags Found
                </p>
                <p className="font-display font-bold text-2xl text-[#1A1612]">
                  {result.tags.length}
                  <span className="text-sm font-normal text-[#8A7F72] ml-2">
                    ({selectedTags.length} selected)
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyTags('comma')}
                  disabled={!selectedTags.length}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-[#E0D9CE] rounded-full hover:border-[#E8402A] hover:text-[#E8402A] transition-colors disabled:opacity-40"
                >
                  {copiedKey === 'comma' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  Copy All
                </button>
                <button
                  onClick={() => copyTags('csv')}
                  disabled={!selectedTags.length}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-[#E0D9CE] rounded-full hover:border-[#E8402A] hover:text-[#E8402A] transition-colors disabled:opacity-40"
                >
                  {copiedKey === 'csv' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  Copy as CSV
                </button>
                <button
                  onClick={() => copyTags('lines')}
                  disabled={!selectedTags.length}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-[#E0D9CE] rounded-full hover:border-[#E8402A] hover:text-[#E8402A] transition-colors disabled:opacity-40"
                >
                  {copiedKey === 'lines' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  One Per Line
                </button>
                <button
                  onClick={() =>
                    setSelectedTags(
                      result.tags.length === selectedTags.length ? [] : [...result.tags]
                    )
                  }
                  className="text-xs font-semibold px-3 py-2 border border-[#E0D9CE] rounded-full hover:border-[#1A1612] transition-colors"
                >
                  {result.tags.length === selectedTags.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {result.tags.length === 0 ? (
              <div className="text-center py-6 text-sm text-[#8A7F72]">
                This video has no tags set by the creator.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
                        isSelected
                          ? 'bg-[#E8402A] text-white border-[#E8402A]'
                          : 'bg-[#F5F0E8] text-[#1A1612] border-[#E0D9CE] hover:border-[#E8402A]'
                      )}
                    >
                      {tag}
                      {isSelected && <X className="w-3 h-3 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
            <h3 className="font-semibold text-[#1A1612] text-sm mb-3">
              Pro Tips for YouTube Tags
            </h3>
            <ul className="space-y-2">
              {TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#8A7F72]">
                  <span className="text-[#E8402A] shrink-0">•</span>
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
