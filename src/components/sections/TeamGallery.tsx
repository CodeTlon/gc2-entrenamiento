'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { TeamGallerySettings } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'

export default function TeamGallery({ data }: { data: TeamGallerySettings }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          grid.querySelectorAll<HTMLElement>('.gallery-item').forEach((el) => {
            el.classList.add('visible')
          })
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-section bg-blue-700 relative" id="equipo">
      {/* Transición suave desde Coaches (blue-900) */}
      <div
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,22,40,0.55) 0%, transparent 100%)',
        }}
      />
      <div className="container">
        <ScrollReveal className="text-center mb-14">
          <h2 className="section-title">
            {data.title_line_1}{' '}
            <span className="gradient-text">{data.title_line_2}</span>
          </h2>
          {data.description && (
            <p className="text-white/45 text-base mt-4 max-w-xl mx-auto font-light">
              {data.description}
            </p>
          )}
        </ScrollReveal>

        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
        >
          {data.items.map((item, i) => {
            const wide = item.size === 'wide'
            const tall = item.size === 'tall'
            const spanClass = tall
              ? ' md:row-span-2 md:aspect-auto'
              : wide
                ? ' md:col-span-2 md:aspect-[2/1]'
                : ''
            const sizes = wide
              ? '(max-width: 768px) 100vw, 66vw'
              : '(max-width: 768px) 50vw, 33vw'
            const fp = focalImageProps(item.image)
            const focalScale = fp.style.transform
              ? { transform: fp.style.transform, transformOrigin: fp.style.transformOrigin }
              : undefined
            return (
            <div
              key={`${item.label}-${i}`}
              className={`gallery-item reveal relative rounded-xl overflow-hidden group aspect-square${spanClass}`}
            >
              {/* Focal scale sits on its own layer so hover scale-110 on Image compounds correctly */}
              <div className="absolute inset-0" style={focalScale}>
                <Image
                  src={fp.src}
                  alt={item.label}
                  fill
                  sizes={sizes}
                  style={{ objectPosition: fp.style.objectPosition }}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 px-4 pt-8 pb-3"
                style={{
                  background:
                    'linear-gradient(0deg, rgba(10,22,40,0.85) 0%, transparent 100%)',
                }}
              >
                <span
                  className="font-body font-bold text-accent text-[10px] uppercase"
                  style={{ letterSpacing: '2px' }}
                >
                  {item.label}
                </span>
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
