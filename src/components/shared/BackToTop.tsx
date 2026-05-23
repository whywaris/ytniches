'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    setIsAnimating(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => setIsAnimating(false), 600)
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`
        fixed bottom-6 right-6 z-50
        w-11 h-11 rounded-full
        bg-[#E8402A] text-white
        border-2 border-[#E8402A]
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        hover:bg-[#c42e2e] hover:scale-110
        active:scale-95
        transition-all duration-200
        md:bottom-8 md:right-8
        ${isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
        }
      `}
    >
      <ArrowUp
        className={`w-5 h-5 transition-transform duration-300 ${
          isAnimating ? '-translate-y-0.5' : ''
        }`}
      />
    </button>
  )
}
