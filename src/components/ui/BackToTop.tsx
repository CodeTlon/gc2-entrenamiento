'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > window.innerHeight)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      className={`fixed right-4 md:right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center
        text-white/70 hover:text-white transition-all duration-300 hover:-translate-y-0.5
        active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
        bottom-24 md:bottom-6
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      style={{
        background: 'rgba(13,34,71,0.9)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <ArrowUp size={18} />
    </button>
  )
}
