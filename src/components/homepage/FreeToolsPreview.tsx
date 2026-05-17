import Link from 'next/link'
import { Download, DollarSign, Tags, ArrowRight } from 'lucide-react'

const TOOLS = [
  {
    name: 'YouTube Thumbnail Downloader',
    description: 'Download any YouTube thumbnail in HD quality instantly',
    href: '/youtube-thumbnail-download',
    icon: Download,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    name: 'YouTube Revenue Calculator',
    description: 'Calculate your earnings potential by niche and views',
    href: '/youtube-revenue-calculator',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    name: 'YouTube Tag Extractor',
    description: 'Extract tags from any YouTube video in one click',
    href: '/youtube-tag-extractor',
    icon: Tags,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
]

export function FreeToolsPreview() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A7F72] mb-3">
            Free YouTube Tools
          </p>
          <h2 className="font-display font-bold text-[32px] sm:text-[38px] text-[#1A1612] mb-3">
            Free Tools Every Creator Needs
          </h2>
          <p className="text-[#8A7F72] text-sm">No signup required. 100% free. Forever.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {TOOLS.map(({ name, description, href, icon: Icon, color, bg }) => (
            <Link
              key={name}
              href={href}
              className="group bg-white rounded-[20px] border border-[#E0D9CE] p-6 hover:shadow-[0_8px_32px_0_rgba(26,22,18,0.1)] hover:border-[#C8C0B3] transition-all"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-display font-bold text-[15px] text-[#1A1612] mb-1.5 group-hover:text-[#E8402A] transition-colors">
                {name}
              </h3>
              <p className="text-xs text-[#8A7F72] leading-relaxed mb-3">{description}</p>
              <span className="text-xs font-bold text-[#E8402A] flex items-center gap-1">
                Use Free Tool <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/tools" className="text-sm font-semibold text-[#E8402A] hover:text-[#CF3520] transition-colors">
            See all free tools →
          </Link>
        </div>
      </div>
    </section>
  )
}
