'use client'

import { useState } from 'react'
import { Dices, Link as LinkIcon, Loader2, RefreshCw, ExternalLink } from 'lucide-react'


interface Winner {
  text: string
  author: string
  profileImage: string
  channelUrl: string
  likes: number
  publishedAt: string
}

interface PickResult {
  winner: Winner
  totalComments: number
  poolSize: number
  videoTitle: string
  channelName: string
}

interface ApiResponse extends Partial<PickResult> {
  error?: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function CommentPickerClient() {
  const [url, setUrl] = useState('')
  const [filterText, setFilterText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PickResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  async function handlePick() {
    if (!url.trim()) return
    setIsLoading(true)
    setError(null)
    setIsAnimating(true)

    // Brief animation delay for UX
    await new Promise((r) => setTimeout(r, 800))

    try {
      const res = await fetch('/api/tools/random-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url.trim(), filterText: filterText.trim() }),
      })
      const data = (await res.json()) as ApiResponse
      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong')
        setResult(null)
        return
      }
      setResult(data as PickResult)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
      setIsAnimating(false)
    }
  }

  return (
    <div>
      {/* Input card */}
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 mb-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7F72] mb-2">
            YouTube Video URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePick()}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-9 pr-4 py-3 border border-[#E0D9CE] rounded-xl text-sm text-[#1A1612] focus:outline-none focus:border-[#A06B00] bg-white placeholder:text-[#8A7F72]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7F72] mb-2">
            Filter Comments (optional)
          </label>
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="e.g. giveaway, entered, I want to win"
            className="w-full px-4 py-3 border border-[#E0D9CE] rounded-xl text-sm text-[#1A1612] focus:outline-none focus:border-[#A06B00] bg-white placeholder:text-[#8A7F72]"
          />
          <p className="text-[10px] text-[#8A7F72] mt-1">
            Only comments containing this text will be included in the draw
          </p>
        </div>

        <button
          onClick={handlePick}
          disabled={isLoading || !url.trim()}
          className="w-full bg-[#A06B00] text-white font-bold text-sm py-3 rounded-full hover:bg-[#8A5C00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Drawing winner...
            </>
          ) : (
            <>
              <Dices className="w-4 h-4" />
              {result ? 'Pick Again' : 'Pick Random Winner'}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#FDF0ED] border border-[#E8402A]/20 rounded-xl px-4 py-3 text-sm text-[#E8402A] mb-6">
          {error}
        </div>
      )}

      {/* Loading animation */}
      {isAnimating && (
        <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-8 text-center mb-6">
          <Dices className="w-10 h-10 text-[#A06B00] mx-auto mb-3 animate-bounce" />
          <p className="font-display font-bold text-lg text-[#1A1612]">Drawing a winner...</p>
          <p className="text-sm text-[#8A7F72] mt-1">Shuffling through the comments</p>
        </div>
      )}

      {/* Winner card */}
      {result && !isAnimating && (
        <div className="space-y-4">
          {/* Video info bar */}
          <div className="bg-[#FEF6E8] border border-[#A06B00]/20 rounded-xl px-4 py-3 text-sm text-[#1A1612]">
            <span className="font-semibold">From:</span> {result.videoTitle}
            <span className="text-[#8A7F72] ml-2">by {result.channelName}</span>
          </div>

          {/* Winner */}
          <div className="bg-white border-2 border-[#A06B00] rounded-[20px] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Dices className="w-4 h-4 text-[#A06B00]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#A06B00]">
                Winner Selected
              </span>
            </div>

            <div className="flex items-start gap-3">
              {result.winner.profileImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.winner.profileImage}
                  alt=""
                  className="w-10 h-10 rounded-full shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-[#1A1612] text-sm">
                    {result.winner.author}
                  </span>
                  <a
                    href={result.winner.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8A7F72] hover:text-[#A06B00] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-xs text-[#8A7F72]">
                    · {formatDate(result.winner.publishedAt)}
                  </span>
                  {result.winner.likes > 0 && (
                    <span className="text-xs text-[#8A7F72]">· {result.winner.likes} likes</span>
                  )}
                </div>
                <p
                  className="text-sm text-[#1A1612] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: result.winner.text }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#E0D9CE] rounded-xl p-4 text-center">
              <p className="font-display font-black text-2xl text-[#1A1612]">
                {result.poolSize.toLocaleString()}
              </p>
              <p className="text-xs text-[#8A7F72] mt-0.5">
                Comments in pool{filterText ? ' (filtered)' : ''}
              </p>
            </div>
            <div className="bg-white border border-[#E0D9CE] rounded-xl p-4 text-center">
              <p className="font-display font-black text-2xl text-[#1A1612]">
                {result.totalComments > 0 ? result.totalComments.toLocaleString() : '—'}
              </p>
              <p className="text-xs text-[#8A7F72] mt-0.5">Total video comments</p>
            </div>
          </div>

          <button
            onClick={handlePick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 border border-[#E0D9CE] text-[#1A1612] font-bold text-sm py-3 rounded-full hover:border-[#A06B00] hover:text-[#A06B00] transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Pick Another Winner
          </button>
        </div>
      )}

    </div>
  )
}
