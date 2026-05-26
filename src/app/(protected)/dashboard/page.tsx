import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Heart, Eye, Copy, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NicheCard } from '@/components/niches/NicheCard'
import type { Niche } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Your niche research overview.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // Fetch saved handpick niche IDs (the active save system)
  const { data: savedHandpickRows } = await supabase
    .from('saved_handpick_niches')
    .select('handpick_id')
    .eq('user_id', authUser.id)

  const savedHandpickIds = savedHandpickRows?.map(r => r.handpick_id) ?? []

  // Also check legacy saved_niches on profile
  const legacySavedIds: string[] = profile?.saved_niches ?? []
  const totalSavedCount = savedHandpickIds.length + legacySavedIds.length

  // Fetch last 4 saved niches from legacy system
  const { data: savedNiches } = legacySavedIds.length
    ? await supabase.from('niches').select('*').in('id', legacySavedIds).limit(4)
    : { data: [] }

  // Fetch last 4 saved handpick niches
  const { data: savedHandpickNiches } = savedHandpickIds.length
    ? await supabase
        .from('saved_handpick_niches')
        .select('handpick_id, handpick:handpick_niches(channel_name, category, image_url)')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(4)
    : { data: [] }

  // Fetch total handpick niches count
  const { count: totalNiches } = await supabase
    .from('handpick_niches')
    .select('*', { count: 'exact', head: true })

  const firstName = profile?.display_name || (authUser.email?.split('@')[0] ?? 'there')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const plan = profile?.plan ?? 'free'

  const stats = [
    { label: 'Saved Niches', value: totalSavedCount, icon: Heart, color: 'text-[#E8402A]', bg: 'bg-[#FDF0ED]' },
    { label: 'Total Niches', value: totalNiches ?? 0, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Plan', value: plan.charAt(0).toUpperCase() + plan.slice(1), icon: Copy, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Founding Member badge for lifetime users */}
      {plan === 'lifetime' && (
        <div className="mb-6 flex items-center gap-2 bg-[#FEF6E8] border border-[#F5DFA8] rounded-full px-4 py-2 w-fit">
          <span className="text-sm">⚡</span>
          <span className="text-sm font-bold text-[#A06B00]">Founding Member</span>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground capitalize">
          {greeting}, {firstName}
        </h1>
        <p className="text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Here&apos;s your niche research overview
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-[16px] sm:rounded-[20px] border border-border p-3 sm:p-5">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center mb-2 sm:mb-3`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
            </div>
            <p className="font-display font-bold text-xl sm:text-2xl text-foreground">{value}</p>
            <p className="text-[10px] sm:text-xs text-muted mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link href="/dashboard/handpick" className="bg-accent text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-accent-hover transition-colors">
          Browse niches
        </Link>
        <Link href="/dashboard/saved" className="border border-border text-foreground font-bold text-sm px-5 py-2.5 rounded-full hover:border-foreground transition-colors">
          View saved
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* ── Saved Niches Preview ──────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-foreground">Saved Niches</h2>
              <Link href="/dashboard/saved" className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {(savedNiches && savedNiches.length > 0) || (savedHandpickNiches && savedHandpickNiches.length > 0) ? (
              <div className="space-y-3">
                {/* Legacy saved niches */}
                {savedNiches && savedNiches.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(savedNiches as Niche[]).map((niche) => (
                      <NicheCard key={niche.id} niche={niche} isLocked={false} />
                    ))}
                  </div>
                )}
                {/* HandPick saved niches */}
                {savedHandpickNiches && savedHandpickNiches.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(savedHandpickNiches as { handpick_id: string; handpick: { channel_name: string; category: string; image_url: string | null } }[]).map((item) => (
                      <Link
                        key={item.handpick_id}
                        href="/dashboard/saved"
                        className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border hover:border-accent/30 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F5F0E8] border border-border shrink-0">
                          {item.handpick?.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.handpick.image_url} alt={item.handpick.channel_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted font-bold">
                              {item.handpick?.channel_name?.charAt(0) ?? '?'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{item.handpick?.channel_name}</p>
                          <p className="text-xs text-muted">{item.handpick?.category}</p>
                        </div>
                        <Heart className="w-3.5 h-3.5 text-[#E8402A] fill-current ml-auto shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-[20px] border border-border border-dashed py-14 text-center">
                <Heart className="w-10 h-10 text-border mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">No saved niches yet</p>
                <p className="text-sm text-muted mb-4">Browse the library and save niches you like</p>
                <Link href="/dashboard/handpick" className="text-sm font-bold text-accent hover:text-accent-hover">
                  Browse niches →
                </Link>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* ── Plan Status ──────────────────────────────────────────────── */}
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-4">Plan Status</h2>
            <div className="bg-card rounded-[20px] border border-border p-5">
              {plan === 'lifetime' ? (
                <div className="text-center">
                  <CheckCircle2 className="w-10 h-10 text-[#2A7A4B] mx-auto mb-3" />
                  <p className="font-bold text-foreground mb-1">Lifetime Member</p>
                  <p className="text-xs text-muted">
                    Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ) : plan === 'pro' ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-accent-light text-accent text-xs font-bold px-2.5 py-1 rounded-full">Pro</span>
                    <span className="text-sm text-muted">Active</span>
                  </div>
                  {profile?.plan_expires_at && (
                    <p className="text-xs text-muted mb-3 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Renews {new Date(profile.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  <Link href="/api/lemonsqueezy/portal" className="text-xs font-semibold text-accent hover:text-accent-hover">
                    Manage subscription →
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Free Plan · {totalSavedCount}/5 niches saved
                  </p>
                  <div className="w-full h-1.5 bg-border rounded-full mb-3">
                    <div
                      className="h-1.5 bg-accent rounded-full"
                      style={{ width: `${Math.min(100, (totalSavedCount / 5) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mb-3">Unlock 1,200+ niches and full content kits</p>
                  <Link href="/pricing" className="block text-center bg-accent text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-accent-hover transition-colors">
                    Upgrade to Pro — $9/mo
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
