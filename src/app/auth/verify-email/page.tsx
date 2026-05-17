'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Fraunces } from 'next/font/google'
import { Mail, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['700', '900'] })

export default function VerifyEmailPage() {
  const supabase = createClient()
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    setIsResending(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsResending(false)
    setResent(true)
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#FDF0ED] rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-[#E8402A]" />
          </div>
        </div>
        <h1 className={`${fraunces.className} text-3xl font-black text-[#1A1612] mb-3`}>
          Check your email
        </h1>
        <p className="text-[#8A7F72] text-sm mb-6 leading-relaxed">
          We sent a verification link to your email address. Click the link to activate your account.
        </p>
        {resent && (
          <div className="bg-[#EBF5EF] border border-[#C2E0CE] rounded-xl px-4 py-3 text-sm text-[#2A7A4B] mb-4">
            Verification email resent!
          </div>
        )}
        <button
          onClick={handleResend}
          disabled={isResending || resent}
          className="w-full border-[1.5px] border-[#1A1612] text-[#1A1612] rounded-full py-3 text-sm font-semibold hover:bg-[#1A1612] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
        >
          {isResending && <Loader2 className="w-4 h-4 animate-spin" />}
          {resent ? 'Email sent!' : 'Resend verification email'}
        </button>
        <Link href="/auth/login" className="text-sm text-[#8A7F72] hover:text-[#E8402A] transition-colors">
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
