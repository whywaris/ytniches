import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { EmailsAdminClient } from '@/components/admin/EmailsAdminClient'

export const metadata: Metadata = { title: 'Emails', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminEmailsPage() {
  const supabase = createAdminClient()

  const [
    { data: digestLogs },
    { data: emailLogs },
    { count: totalDigestUsers },
  ] = await Promise.all([
    supabase
      .from('digest_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(12),
    supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .in('plan', ['pro', 'lifetime']),
  ])

  const lastDigest = digestLogs?.[0] ?? null

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-[#1A1612]">Emails</h1>
        <p className="text-[#8A7F72] text-sm mt-1">Weekly digest and email log management</p>
      </div>
      <EmailsAdminClient
        digestLogs={digestLogs ?? []}
        emailLogs={emailLogs ?? []}
        lastDigest={lastDigest}
        eligibleUsers={totalDigestUsers ?? 0}
      />
    </div>
  )
}
