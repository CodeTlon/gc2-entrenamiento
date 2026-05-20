'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { TeamGallerySettings } from '@/lib/content'

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
    <section className="py-section bg-blue-900" id="equipo">
      <div className="container">
        <ScrollReveal className="text-center mb-14">
          <p className="section-label">{data.label}</p>
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
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {data.items.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className={`gallery-item reveal relative rounded-xl overflow-hidden group${item.large ? ' row-span-2' : ' aspect-square'}`}
            >
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
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
          ))}
        </div>
      </div>
    </section>
  )
}
