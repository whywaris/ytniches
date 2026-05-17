import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createAdminClient } from '@/lib/supabase/server'
import { WeeklyDigestEmail } from './templates/weekly-digest'

const resend = new Resend(process.env.RESEND_API_KEY)

interface DigestUser {
  id: string
  email: string
  email_preferences: {
    weekly_digest: boolean
    unsubscribed_all: boolean
    unsubscribe_token: string
  }[]
}

interface DigestNiche {
  name: string
  slug: string
  category: string
  cpm_min: number
  cpm_max: number
  competition_level: string
  video_ideas: string[]
}

export async function sendWeeklyDigest(testEmail?: string) {
  const supabase = createAdminClient()

  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Guard against duplicate sends (skip in test mode)
  if (!testEmail) {
    const { data: existingDigest } = await supabase
      .from('digest_logs')
      .select('id')
      .eq('week_start', weekStartStr)
      .single()

    if (existingDigest) {
      return { skipped: true, reason: 'Already sent this week' }
    }
  }

  // Fetch eligible users: pro/lifetime + weekly_digest opted in
  const { data: rawUsers } = await supabase
    .from('users')
    .select(`
      id, email,
      email_preferences!inner(
        weekly_digest,
        unsubscribed_all,
        unsubscribe_token
      )
    `)
    .in('plan', ['pro', 'lifetime'])

  let users = ((rawUsers ?? []) as unknown as DigestUser[]).filter(u => {
    const prefs = u.email_preferences?.[0]
    return prefs && prefs.weekly_digest && !prefs.unsubscribed_all
  })

  // In test mode, send only to the specified email
  if (testEmail) {
    const adminUser = users.find(u => u.email === testEmail)
    if (adminUser) {
      users = [adminUser]
    } else {
      // Build a synthetic entry for the test email
      users = [{
        id: 'test',
        email: testEmail,
        email_preferences: [{ weekly_digest: true, unsubscribed_all: false, unsubscribe_token: 'test-token' }],
      }]
    }
  }

  if (users.length === 0) return { sent: 0, failed: 0 }

  // Fetch new niches this week
  const { data: newNiches } = await supabase
    .from('niches')
    .select('name, slug, category, cpm_min, cpm_max, competition_level, video_ideas')
    .eq('published', true)
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', weekEnd.toISOString())
    .order('created_at', { ascending: false })

  // Fetch featured niche: lowest competition + highest CPM
  const { data: featuredNiche } = await supabase
    .from('niches')
    .select('name, slug, category, cpm_min, cpm_max, competition_level, video_ideas')
    .eq('published', true)
    .eq('competition_level', 'Low')
    .order('cpm_max', { ascending: false })
    .limit(1)
    .single() as { data: DigestNiche | null }

  // Fetch top voted open requests
  const { data: topRequests } = await supabase
    .from('niche_requests')
    .select('title, votes_count, category, status')
    .in('status', ['pending', 'under_review'])
    .order('votes_count', { ascending: false })
    .limit(3)

  // Total published niches count
  const { count: totalNiches } = await supabase
    .from('niches')
    .select('id', { count: 'exact', head: true })
    .eq('published', true)

  const weekRange = formatWeekRange(weekStart, weekEnd)
  const featured = featuredNiche ?? {
    name: 'Finance for Beginners',
    slug: 'finance-for-beginners',
    category: 'Finance',
    cpm_min: 15,
    cpm_max: 35,
    competition_level: 'Low',
    video_ideas: ['How to start investing with $100'],
  }

  const BATCH_SIZE = 50
  let totalSent = 0
  let totalFailed = 0

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE)

    await Promise.allSettled(
      batch.map(async (user) => {
        try {
          const unsubToken = user.email_preferences?.[0]?.unsubscribe_token ?? 'no-token'
          const userName = user.email.split('@')[0]

          const html = await render(
            WeeklyDigestEmail({
              userName,
              userEmail: user.email,
              unsubscribeToken: unsubToken,
              weekRange,
              newNiches: (newNiches ?? []) as DigestNiche[],
              featuredNiche: {
                name: featured.name,
                category: featured.category,
                cpm_min: featured.cpm_min,
                cpm_max: featured.cpm_max,
                competition_level: featured.competition_level,
                slug: featured.slug,
                why_featured: `We are featuring ${featured.name} this week because of its high CPM and low competition — a rare combination that gives new creators a real advantage.`,
                top_video_idea: (featured.video_ideas as string[])?.[0] ?? '',
              },
              topRequestedNiches: topRequests ?? [],
              totalNiches: totalNiches ?? 0,
              stats: {
                new_niches_count: newNiches?.length ?? 0,
                new_requests_count: 0,
              },
            })
          )

          const subject = newNiches?.length
            ? `🎯 ${newNiches.length} new niches this week + featured: ${featured.name}`
            : `🎯 Weekly Niche Digest — ${weekRange}`

          const { data: sent, error } = await resend.emails.send({
            from: 'YTNiches <digest@ytniches.com>',
            to: user.email,
            subject,
            html,
          })

          if (error) throw error

          if (user.id !== 'test') {
            await supabase.from('email_logs').insert({
              user_id: user.id,
              email_type: 'weekly_digest',
              subject,
              status: 'sent',
              resend_id: sent?.id ?? null,
            })
          }

          totalSent++
        } catch (err) {
          console.error(`Failed to send digest to ${user.email}:`, err)
          if (user.id !== 'test') {
            await supabase.from('email_logs').insert({
              user_id: user.id,
              email_type: 'weekly_digest',
              subject: `Weekly Digest — ${weekRange}`,
              status: 'failed',
            })
          }
          totalFailed++
        }
      })
    )

    if (i + BATCH_SIZE < users.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Log the digest (only for real sends, not tests)
  if (!testEmail) {
    await supabase.from('digest_logs').insert({
      week_start: weekStartStr,
      week_end: weekEnd.toISOString().split('T')[0],
      users_sent: totalSent,
      niches_featured: newNiches?.length ?? 0,
    })
  }

  return { sent: totalSent, failed: totalFailed }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getWeekStart(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getWeekEnd(): Date {
  const start = getWeekStart()
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function formatWeekRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}
