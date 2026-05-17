import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Users, Eye, Video, Calendar, Target, TrendingUp } from 'lucide-react'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const admin = createAdminClient()
  const { data: niche } = await admin.from('niches').select('name').eq('slug', slug).single()
  return { title: niche?.name ?? 'Niche' }
}

export default async function NicheDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: niche } = await admin.from('niches').select('*').eq('slug', slug).eq('published', true).single()

  if (!niche) notFound()

  function formatSubs(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
    return String(n)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Back */}
      <Link href="/dashboard/handpick" className="inline-flex items-center gap-1.5 text-sm text-[#8A7F72] hover:text-[#1A1612] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to niches
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E8402A] mb-2">{niche.category}</p>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1A1612] mb-2">{niche.name}</h1>
        {niche.channel_url && (
          <a href={niche.channel_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#E8402A] hover:underline flex items-center gap-1">
            Visit Channel <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {niche.subscribers_count && (
          <div className="bg-white border border-[#E0D9CE] rounded-2xl p-4 text-center">
            <Users className="w-4 h-4 mx-auto mb-1.5 text-[#E8402A]" />
            <div className="text-lg font-black font-display text-[#1A1612]">{niche.subscribers_count}</div>
            <div className="text-[10px] text-[#8A7F72]">Subscribers</div>
          </div>
        )}
        {niche.views_per_day && (
          <div className="bg-white border border-[#E0D9CE] rounded-2xl p-4 text-center">
            <Eye className="w-4 h-4 mx-auto mb-1.5 text-[#2563EB]" />
            <div className="text-lg font-black font-display text-[#2563EB]">{niche.views_per_day}</div>
            <div className="text-[10px] text-[#8A7F72]">Views/Day</div>
          </div>
        )}
        {niche.total_videos && (
          <div className="bg-white border border-[#E0D9CE] rounded-2xl p-4 text-center">
            <Video className="w-4 h-4 mx-auto mb-1.5 text-[#8A7F72]" />
            <div className="text-lg font-black font-display text-[#1A1612]">{niche.total_videos}</div>
            <div className="text-[10px] text-[#8A7F72]">Videos</div>
          </div>
        )}
        {niche.total_views && (
          <div className="bg-white border border-[#E0D9CE] rounded-2xl p-4 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1.5 text-[#8A7F72]" />
            <div className="text-lg font-black font-display text-[#1A1612]">{niche.total_views}</div>
            <div className="text-[10px] text-[#8A7F72]">Total Views</div>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="space-y-4 mb-8">
        {niche.estimated_earning && (
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EBF5EF] flex items-center justify-center">
              <Target className="w-4 h-4 text-[#2A7A4B]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1612]">{niche.estimated_earning}</div>
              <div className="text-xs text-[#8A7F72]">Estimated Earning</div>
            </div>
          </div>
        )}
        {niche.channel_age && (
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5F0E8] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#8A7F72]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1612]">{niche.channel_age}</div>
              <div className="text-xs text-[#8A7F72]">Channel Age</div>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {(niche.thumbnail_url_1 || niche.thumbnail_url_2 || niche.thumbnail_url_3) && (() => {
        const thumbs = [niche.thumbnail_url_1, niche.thumbnail_url_2, niche.thumbnail_url_3].filter(Boolean) as string[]
        return (
          <div className="mb-8">
            <h2 className="font-display font-bold text-lg text-[#1A1612] mb-3">Recent Videos</h2>
            <div className={`grid gap-3 ${thumbs.length === 1 ? 'grid-cols-1' : thumbs.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
              {thumbs.map((url, i) => (
                <img key={i} src={url} alt={`Video ${i + 1}`} className="w-full rounded-xl object-cover aspect-video border border-[#E0D9CE]" />
              ))}
            </div>
          </div>
        )
      })()}

      {/* Top Channels */}
      {niche.top_competitors && niche.top_competitors.length > 0 && (
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#E8402A]" />
            <h2 className="text-sm font-semibold text-[#1A1612]">Top Channels</h2>
          </div>
          <div className="space-y-3">
            {niche.top_competitors.map((ch: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#F5F0E8] rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#E8402A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                {ch.thumbnail ? (
                  <img src={ch.thumbnail} alt={ch.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E0D9CE] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#8A7F72]">{ch.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1A1612] truncate">{ch.name}</div>
                </div>
                <div className="text-xs font-bold text-[#1A1612] shrink-0">{formatSubs(ch.subscribers)} subs</div>
                <a href={`https://youtube.com/channel/${ch.channelId}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[#E8402A]">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
