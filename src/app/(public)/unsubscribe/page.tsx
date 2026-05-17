import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Unsubscribe — YTNiches',
  robots: { index: false, follow: false },
}

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const isSuccess = searchParams.success === 'true'
  const isError = searchParams.error === 'invalid'

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E0D9CE] rounded-2xl p-10 max-w-md w-full text-center shadow-sm">

        {isSuccess ? (
          <>
            <div className="w-14 h-14 bg-[#EBF5EF] rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-[#2A7A4B]" />
            </div>
            <h1 className="font-display font-bold text-2xl text-[#1A1612] mb-2">
              You&apos;ve been unsubscribed ✓
            </h1>
            <p className="text-[#8A7F72] text-sm mb-6">
              You will no longer receive weekly digest emails from YTNiches.
            </p>
            <p className="text-xs text-[#8A7F72] mb-6">
              Note: You will still receive transactional emails such as receipts,
              password resets, and account security alerts.
            </p>
            <Link
              href="/dashboard/settings/emails"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#E8402A] hover:underline"
            >
              <Mail className="w-4 h-4" />
              Changed your mind? Update email preferences
            </Link>
          </>
        ) : isError ? (
          <>
            <div className="w-14 h-14 bg-[#FDF0ED] rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-7 h-7 text-[#E8402A]" />
            </div>
            <h1 className="font-display font-bold text-2xl text-[#1A1612] mb-2">
              Invalid unsubscribe link
            </h1>
            <p className="text-[#8A7F72] text-sm mb-6">
              This unsubscribe link is invalid or has already been used.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-[#E8402A] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors mb-3"
            >
              Log in to manage preferences
            </Link>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-[#8A7F72]" />
            </div>
            <h1 className="font-display font-bold text-2xl text-[#1A1612] mb-2">
              Email Preferences
            </h1>
            <p className="text-[#8A7F72] text-sm mb-6">
              Manage your YTNiches email preferences from your dashboard settings.
            </p>
            <Link
              href="/dashboard/settings/emails"
              className="inline-block bg-[#E8402A] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors"
            >
              Go to Email Preferences
            </Link>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-[#E0D9CE]">
          <Link href="/" className="text-xs text-[#8A7F72] hover:text-[#1A1612] transition-colors">
            ← Back to YTNiches
          </Link>
        </div>
      </div>
    </div>
  )
}
