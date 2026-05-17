'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fraunces } from 'next/font/google'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['700', '900'] })

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignup() {
    setIsGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError('Google signup failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service.')
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please log in.')
      } else {
        setError('Signup failed. Please try again.')
      }
      setIsLoading(false)
      return
    }

    router.push('/auth/verify-email')
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-8 shadow-sm">

        {/* Heading */}
        <h1 className={`${fraunces.className} text-3xl font-black text-[#1A1612] mb-2`}>
          Start for free
        </h1>
        <p className="text-[#8A7F72] text-sm mb-6">
          Join 8,400+ creators finding their perfect niche
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-[1.5px] border-[#E0D9CE] rounded-full py-3 text-sm font-semibold text-[#1A1612] hover:bg-[#F5F0E8] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#E0D9CE]" />
          <span className="text-xs text-[#8A7F72]">or continue with email</span>
          <div className="flex-1 h-px bg-[#E0D9CE]" />
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1612] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border-[1.5px] border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#B5ADA3] focus:outline-none focus:border-[#E8402A] bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1612] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full border-[1.5px] border-[#E0D9CE] rounded-xl px-4 py-3 pr-10 text-sm text-[#1A1612] placeholder:text-[#B5ADA3] focus:outline-none focus:border-[#E8402A] bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7F72] hover:text-[#1A1612]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1612] mb-1.5">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-[1.5px] border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#B5ADA3] focus:outline-none focus:border-[#E8402A] bg-white transition-colors"
            />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 accent-[#E8402A]"
            />
            <span className="text-xs text-[#8A7F72] leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" className="text-[#E8402A] hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#E8402A] hover:underline">Privacy Policy</Link>
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="bg-[#FDF0ED] border border-[#F5C4BA] rounded-xl px-4 py-3 text-sm text-[#E8402A]">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-[#E8402A] text-white rounded-full py-3 text-sm font-semibold hover:bg-[#c42e2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create free account
          </button>
        </form>

        <p className="text-center text-sm text-[#8A7F72] mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#E8402A] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
