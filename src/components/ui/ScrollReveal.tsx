'use client'

import { useEffect, useRef } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: 1 | 2 | 3 | 4
}

export default function ScrollReveal({
  children,
  className = '',
  style,
  delay,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const delayClass = delay ? `delay-${delay}` : ''

  return (
    <div ref={ref} className={`reveal ${delayClass} ${className}`} style={style}>
      {children}
    </div>
  )
}
