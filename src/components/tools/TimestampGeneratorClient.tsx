'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, Check, Clock } from 'lucide-react'

interface Timestamp {
  id: string
  time: string
  label: string
}

export function TimestampGeneratorClient() {
  const [timestamps, setTimestamps] = useState<Timestamp[]>([
    { id: '1', time: '0:00', label: 'Intro' },
  ])
  const [copied, setCopied] = useState(false)

  function addTimestamp() {
    setTimestamps((prev) => [
      ...prev,
      { id: Date.now().toString(), time: '', label: '' },
    ])
  }

  function removeTimestamp(id: string) {
    setTimestamps((prev) => prev.filter((t) => t.id !== id))
  }

  function updateTimestamp(id: string, field: 'time' | 'label', value: string) {
    setTimestamps((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    )
  }

  function getOutput() {
    return timestamps
      .filter((t) => t.time && t.label)
      .map((t) => `${t.time} ${t.label}`)
      .join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(getOutput())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const output = getOutput()

  return (
    <div>
      {/* Timestamp inputs */}
      <div className="bg-card border border-border rounded-[20px] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground text-sm">Timestamps</h2>
          <button
            onClick={addTimestamp}
            className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        <div className="space-y-3">
          {timestamps.map((ts) => (
            <div key={ts.id} className="flex items-center gap-3">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="text"
                  value={ts.time}
                  onChange={(e) => updateTimestamp(ts.id, 'time', e.target.value)}
                  placeholder="0:00"
                  className="w-24 pl-9 pr-3 py-2.5 text-sm border border-border rounded-xl bg-card text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <input
                type="text"
                value={ts.label}
                onChange={(e) => updateTimestamp(ts.id, 'label', e.target.value)}
                placeholder="Chapter title..."
                className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl bg-card text-foreground focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => removeTimestamp(ts.id)}
                className="p-2 text-muted hover:text-accent transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-card border border-border rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground text-sm">Output — paste in description</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-sm text-foreground bg-secondary rounded-xl p-4 whitespace-pre-wrap font-mono">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
