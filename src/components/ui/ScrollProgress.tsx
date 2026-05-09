'use client'

import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = h > 0 ? window.scrollY / h : 0
      bar.style.transform = `scaleX(${scrolled})`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={barRef}
      className="scroll-progress"
      aria-hidden="true"
    />
  )
}
