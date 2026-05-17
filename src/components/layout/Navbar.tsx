'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

const navItems = [
  { label: 'Niches', href: '/niches' },
  { label: 'Categories', href: '/categories' },
  { label: 'Free Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setIsOpen(false), [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#E0D9CE] shadow-sm'
            : 'bg-transparent'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <span className="font-display text-xl font-bold text-[#1A1612]">
              YT<span className="text-[#E8402A]">Niches</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-[#EDE8DF] text-[#1A1612]'
                      : 'text-[#6B6259] hover:text-[#1A1612] hover:bg-[#EDE8DF]'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-[#E8402A] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-[#1A1612] px-4 py-2 text-sm font-medium hover:text-[#E8402A] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#E8402A] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#CF3520] transition-colors"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-12 h-12 flex items-center justify-center rounded-xl text-[#6B6259] hover:text-[#1A1612] hover:bg-[#EDE8DF] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu — full-screen overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-[#F5F0E8] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Menu header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#E0D9CE]">
          <span className="font-display text-lg font-bold text-[#1A1612]">
            YT<span className="text-[#E8402A]">Niches</span>
          </span>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#6B6259] hover:bg-[#EDE8DF] transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-4 h-12 rounded-xl text-sm font-medium transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-[#EDE8DF] text-[#1A1612] font-semibold'
                  : 'text-[#6B6259] hover:text-[#1A1612] hover:bg-[#EDE8DF]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="px-4 pb-8 pt-4 border-t border-[#E0D9CE] flex flex-col gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center h-12 bg-[#E8402A] text-white rounded-full text-sm font-semibold"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center justify-center h-12 border border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center justify-center h-12 bg-[#E8402A] text-white rounded-full text-sm font-semibold"
              >
                Start Free
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
