'use client'

import { useState } from 'react'
import { Copy, Check, Link2 } from 'lucide-react'

export function SubscribeLinkGeneratorClient() {
  const [channelInput, setChannelInput] = useState('')
  const [copied, setCopied] = useState(false)

  function getChannelIdentifier(): string | null {
    const input = channelInput.trim()
    if (!input) return null

    // Extract from full URL
    const channelMatch = input.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/)
    if (channelMatch) return channelMatch[1]

    const handleMatch = input.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/)
    if (handleMatch) return `@${handleMatch[1]}`

    const customMatch = input.match(/youtube\.com\/c\/([a-zA-Z0-9_.-]+)/)
    if (customMatch) return customMatch[1]

    // If it starts with UC (channel ID)
    if (input.startsWith('UC') && input.length === 24) return input

    // If it starts with @
    if (input.startsWith('@')) return input

    // Assume it's a channel name/handle
    return input
  }

  const channelId = getChannelIdentifier()

  function getSubscribeLink(): string {
    if (!channelId) return ''
    if (channelId.startsWith('UC')) {
      return `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`
    }
    if (channelId.startsWith('@')) {
      return `https://www.youtube.com/${channelId}?sub_confirmation=1`
    }
    return `https://www.youtube.com/@${channelId}?sub_confirmation=1`
  }

  const subscribeLink = getSubscribeLink()

  function handleCopy() {
    navigator.clipboard.writeText(subscribeLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Input */}
      <div className="bg-card border border-border rounded-[20px] p-6 mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Channel URL, Handle, or Channel ID
        </label>
        <input
          type="text"
          value={channelInput}
          onChange={(e) => setChannelInput(e.target.value)}
          placeholder="e.g. @MrBeast or https://youtube.com/@MrBeast or UCX6OQ3..."
          className="w-full border-[1.5px] border-border rounded-full px-5 py-3 text-sm text-foreground bg-card focus:outline-none focus:border-accent"
        />
      </div>

      {/* Result */}
      {subscribeLink && (
        <div className="bg-card border border-border rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-accent" />
            <p className="font-semibold text-foreground text-sm">Your Subscribe Link</p>
          </div>

          <div className="flex items-center gap-3 bg-secondary rounded-xl p-4 mb-4">
            <p className="flex-1 text-sm text-foreground font-mono break-all">{subscribeLink}</p>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 bg-accent text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-accent-hover transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-muted">
            Share this link anywhere — when clicked, it opens your channel with the subscribe popup automatically shown.
          </p>
        </div>
      )}
    </div>
  )
}
