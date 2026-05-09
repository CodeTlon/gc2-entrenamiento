'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { HeroSettings } from '@/lib/content'

const CHEVRONS = [0, 1, 2, 3]

export default function Hero({ data }: { data: HeroSettings }) {
  const bgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = bgRef.current
    if (!img || window.innerWidth < 768) return

    let rafId = 0
    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const yPos = window.scrollY * 0.4
        img.style.transform = `translate3d(0, ${yPos}px, 0)`
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    const section = document.getElementById('inicio')
    if (!section) return
    const revealEls = section.querySelectorAll<HTMLElement>('.reveal')
    const timeouts: ReturnType<typeof setTimeout>[] = []
    revealEls.forEach((el) => {
      const delay = el.classList.contains('delay-1') ? 100
        : el.classList.contains('delay-2') ? 200
        : el.classList.contains('delay-3') ? 300
        : el.classList.contains('delay-4') ? 400
        : 50
      timeouts.push(setTimeout(() => el.classList.add('visible'), delay))
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  const scrollToAbout = () => {
    document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      id="inicio"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          ref={bgRef}
          src={data.bg_image}
          alt="Atleta entrenando"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover will-change-transform"
          style={{ transformOrigin: 'center top' }}
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(13,34,71,0.92) 40%, rgba(16,46,102,0.78) 70%, rgba(10,22,40,0.95) 100%)',
        }}
      />

      {/* Decor circle: 400px, opacidad muy baja, rotación lenta */}
      <div className="absolute top-[15%] right-[8%] z-[1] pointer-events-none hidden lg:block opacity-[0.06]">
        <div
          className="relative rounded-full animate-rotate-slow"
          style={{
            width: '400px',
            height: '400px',
            border: '2px solid #38BDF8',
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              inset: '40px',
              border: '1px solid #3B82F6',
            }}
          />
        </div>
      </div>

      {/* Chevrons (top-right, opacidad baja) */}
      <div
        className="absolute top-[20%] right-[5%] z-[1] gap-1.5 pointer-events-none hidden lg:flex"
        style={{ opacity: 0.15 }}
      >
        {CHEVRONS.map((i) => (
          <svg
            key={i}
            width="28"
            height="48"
            viewBox="0 0 28 48"
            fill="none"
            style={{ opacity: 1 - i * 0.2 }}
          >
            <path
              d="M4 4L24 24L4 44"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-10 pt-32 lg:pt-36 pb-16">
        <h1
          className="font-heading font-black uppercase leading-[1.05] mb-5 reveal delay-1"
          style={{ fontSize: 'clamp(3rem, 11vw, 9rem)', letterSpacing: '-2px' }}
        >
          <span className="block text-white">{data.title_line_1}</span>
          <span className="block gradient-text">{data.title_line_2}</span>
        </h1>

        <p
          className="text-white/55 text-base md:text-lg max-w-[480px] mb-8 reveal delay-2 font-light"
          style={{ lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: data.subtitle }}
        />

        <div className="flex flex-wrap gap-3 md:gap-4 mb-10 md:mb-14 reveal delay-3">
          <Link
            href={data.cta_primary_href}
            className="btn btn--primary uppercase tracking-widest text-sm font-extrabold"
          >
            {data.cta_primary_label}
          </Link>
          <Link
            href={data.cta_secondary_href}
            className="btn btn--outline uppercase tracking-widest text-sm font-extrabold"
            style={{ borderColor: 'rgba(255,255,255,0.4)' }}
          >
            {data.cta_secondary_label}
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 md:gap-12 reveal delay-4">
          {data.stats.map((stat, i) => (
            <div key={`${stat.label}-${i}`}>
              <div
                className="font-heading font-extrabold leading-none text-2xl md:text-[36px]"
                style={{ color: '#38BDF8' }}
              >
                {stat.number}
              </div>
              <div
                className="text-[10px] md:text-xs font-body uppercase mt-1 font-medium"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll button */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white
          transition-colors animate-float"
        aria-label="Scroll hacia abajo"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  )
}
