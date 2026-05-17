'use client'

import { useState } from 'react'
import { Clock, FileText, Type, Hash } from 'lucide-react'

export function WordCounterClient() {
  const [text, setText] = useState('')

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter((p) => p.trim()).length : 0

  // Average speaking pace: 150 words per minute for YouTube
  const speakingMinutes = words / 150
  const minutes = Math.floor(speakingMinutes)
  const seconds = Math.round((speakingMinutes - minutes) * 60)

  const stats = [
    { label: 'Words', value: words.toLocaleString(), icon: Type, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Characters', value: characters.toLocaleString(), icon: Hash, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Sentences', value: sentences.toLocaleString(), icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Est. Duration', value: `${minutes}:${seconds.toString().padStart(2, '0')}`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div>
      {/* Text input */}
      <div className="bg-card border border-border rounded-[20px] p-6 mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Paste your script or text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your YouTube video script here..."
          rows={10}
          className="w-full border-[1.5px] border-border rounded-xl px-4 py-3 text-sm text-foreground bg-card focus:outline-none focus:border-accent resize-y"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-[20px] p-4 text-center">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="font-display font-bold text-xl text-foreground">{value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      {words > 0 && (
        <div className="bg-card border border-border rounded-[20px] p-6">
          <h3 className="font-semibold text-foreground text-sm mb-3">Video Length Guide</h3>
          <div className="space-y-2 text-xs text-muted">
            <p>• <strong className="text-foreground">YouTube Shorts:</strong> ~150 words (under 60 sec)</p>
            <p>• <strong className="text-foreground">Short video:</strong> ~750 words (5 min)</p>
            <p>• <strong className="text-foreground">Standard video:</strong> ~1,500 words (10 min)</p>
            <p>• <strong className="text-foreground">Long-form:</strong> ~3,000 words (20 min)</p>
            <p className="pt-2 border-t border-border mt-2">
              Your script is approximately <strong className="text-foreground">{minutes} min {seconds} sec</strong> at average speaking pace (150 wpm).
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
