'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Fraunces } from 'next/font/google'
import { KeyRound, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['700', '900'] })

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setResent(true)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#FDF0ED] rounded-full flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-[#E8402A]" />
          </div>
        </div>
        <h1 className={`${fraunces.className} text-3xl font-black text-[#1A1612] mb-3`}>
          Reset password
        </h1>
        <p className="text-[#8A7F72] text-sm mb-6 leading-relaxed">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {resent ? (
          <div className="bg-[#EBF5EF] border border-[#C2E0CE] rounded-xl px-4 py-3 text-sm text-[#2A7A4B] mb-6">
            Check your email for the reset link!
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border-[1.5px] border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#B5ADA3] focus:outline-none focus:border-[#E8402A] bg-white transition-colors"
            />
            {error && (
              <div className="bg-[#FDF0ED] border border-[#F5C4BA] rounded-xl px-4 py-3 text-sm text-[#E8402A]">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E8402A] text-white rounded-full py-3 text-sm font-semibold hover:bg-[#c42e2e] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send reset link
            </button>
          </form>
        )}

        <Link href="/auth/login" className="text-sm text-[#8A7F72] hover:text-[#E8402A] transition-colors">
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
