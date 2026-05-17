import Link from 'next/link'

const footerLinks = {
  Product: [
    { label: 'Niche Library', href: '/niches' },
    { label: 'All Categories', href: '/categories' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  'Top Categories': [
    { label: 'Finance & Business', href: '/categories/finance-business' },
    { label: 'Science & Technology', href: '/categories/science-technology' },
    { label: 'Gaming', href: '/categories/gaming' },
    { label: 'Health & Fitness', href: '/categories/health-fitness' },
    { label: 'View all 26 →', href: '/categories' },
  ],
  Resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'YouTube Strategy Guide', href: '/blog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'GDPR', href: '/gdpr' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[#E0D9CE] bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top: Logo + Links */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-7 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-xl font-bold text-[#1A1612]">
                YT<span className="text-[#E8402A]">Niches</span>
              </span>
            </Link>
            <p className="text-sm text-[#8A7F72] leading-relaxed max-w-xs">
              The smartest way to find profitable faceless YouTube niches.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold text-[#1A1612] mb-4">{group}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#8A7F72] hover:text-[#1A1612] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-[#E0D9CE] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#8A7F72]">
            &copy; {currentYear} YTNiches. All rights reserved.
          </p>
          <p className="text-sm text-[#8A7F72]">
            Built for creators, by creators ❤️
          </p>
        </div>
      </div>
    </footer>
  )
}
