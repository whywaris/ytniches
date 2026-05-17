import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, FileText, RefreshCw, Cookie, AlertCircle, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Legal — YTNiches',
  description: 'Legal information for YTNiches: Privacy Policy, Terms of Service, Refund Policy, Cookie Policy, Disclaimer, and GDPR.',
  alternates: { canonical: 'https://ytniches.com/legal' },
}

const LEGAL_PAGES = [
  {
    href: '/privacy',
    icon: Shield,
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal data.',
    updated: 'Jan 15, 2026',
  },
  {
    href: '/terms',
    icon: FileText,
    title: 'Terms of Service',
    description: 'Rules and conditions for using YTNiches.',
    updated: 'Jan 15, 2026',
  },
  {
    href: '/refund',
    icon: RefreshCw,
    title: 'Refund Policy',
    description: '7-day money-back guarantee on Pro and Lifetime plans.',
    updated: 'Jan 15, 2026',
  },
  {
    href: '/cookies',
    icon: Cookie,
    title: 'Cookie Policy',
    description: 'What cookies we use and how to control them.',
    updated: 'Jan 15, 2026',
  },
  {
    href: '/disclaimer',
    icon: AlertCircle,
    title: 'Disclaimer',
    description: 'Important notes on earnings estimates and niche data accuracy.',
    updated: 'Jan 15, 2026',
  },
  {
    href: '/gdpr',
    icon: Globe,
    title: 'GDPR Compliance',
    description: 'Your rights under the General Data Protection Regulation.',
    updated: 'Jan 15, 2026',
  },
]

export default function LegalIndexPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="text-xs text-[#8A7F72] mb-8">
          <Link href="/" className="hover:text-[#1A1612]">Home</Link>
          <span className="mx-2">→</span>
          <span className="text-[#1A1612]">Legal</span>
        </nav>

        <h1 className="font-display font-black text-[36px] text-[#1A1612] mb-3">Legal</h1>
        <p className="text-[#8A7F72] leading-relaxed mb-12 max-w-xl">
          We believe in full transparency. Find all our legal documents below — written in plain language, not legalese.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEGAL_PAGES.map(({ href, icon: Icon, title, description, updated }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white border border-[#E0D9CE] rounded-[20px] p-6 hover:border-[#E8402A] hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-[#FDF0ED] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#E8402A] transition-colors">
                <Icon className="w-5 h-5 text-[#E8402A] group-hover:text-white transition-colors" />
              </div>
              <h2 className="font-display font-bold text-[#1A1612] mb-1.5">{title}</h2>
              <p className="text-sm text-[#8A7F72] leading-relaxed mb-3">{description}</p>
              <p className="text-[10px] text-[#B5ADA3]">Updated {updated}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#E0D9CE] text-sm text-[#8A7F72]">
          <p>
            Questions about any of these policies?{' '}
            <a href="mailto:support@ytniches.com" className="text-[#E8402A] hover:underline">support@ytniches.com</a>
            {' '}— we reply within 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
