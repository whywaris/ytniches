'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUBJECTS = [
  'General Question',
  'Billing & Payments',
  'Bug Report',
  'Feature Request',
  'Partnership',
  'Other',
]

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [sending, setSending] = useState(false)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format'
    if (!message.trim()) errs.message = 'Message is required'
    else if (message.trim().length < 20) errs.message = 'Message must be at least 20 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    setSending(true)
    // Simulate send (email integration added later)
    setTimeout(() => {
      setSending(false)
      setSuccess(true)
    }, 1000)
  }

  if (success) {
    return (
      <div className="bg-[#EBF5EF] border border-[#C2E0CE] rounded-[20px] p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-[#2A7A4B] mx-auto mb-3" />
        <p className="font-bold text-[#1A1612] mb-1">Message sent!</p>
        <p className="text-sm text-[#6B6259]">We&apos;ll reply within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-[#8A7F72] uppercase tracking-wider mb-1.5">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn('w-full border rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A] transition-colors', errors.name ? 'border-[#E8402A]' : 'border-[#E0D9CE]')}
          placeholder="Your name"
        />
        {errors.name && <p className="text-xs text-[#E8402A] mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold text-[#8A7F72] uppercase tracking-wider mb-1.5">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn('w-full border rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A] transition-colors', errors.email ? 'border-[#E8402A]' : 'border-[#E0D9CE]')}
          placeholder="you@email.com"
        />
        {errors.email && <p className="text-xs text-[#E8402A] mt-1">{errors.email}</p>}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-bold text-[#8A7F72] uppercase tracking-wider mb-1.5">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A] transition-colors bg-white"
        >
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-bold text-[#8A7F72] uppercase tracking-wider mb-1.5">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={cn('w-full border rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A] transition-colors resize-y', errors.message ? 'border-[#E8402A]' : 'border-[#E0D9CE]')}
          placeholder="How can we help? (min 20 characters)"
        />
        {errors.message && <p className="text-xs text-[#E8402A] mt-1">{errors.message}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={sending}
        className="bg-[#E8402A] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Message →'}
      </button>
    </div>
  )
}
