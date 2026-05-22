import { Fragment } from 'react'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { GroupClassesSettings } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'

export default function GroupClasses({ data }: { data: GroupClassesSettings }) {
  const bg = focalImageProps(data.bg_image)
  return (
    <section
      className="relative py-section overflow-hidden"
      id="grupales"
    >
      {/* Fondo: foto full-bleed + overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={bg.src}
          alt="Entrenamiento grupal"
          fill
          sizes="100vw"
          style={bg.style}
          className="object-cover"
        />
        {/* Degradado azul desde arriba para que el título y el horario respiren */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #0A1628 0%, rgba(10,22,40,0.92) 22%, rgba(13,34,71,0.70) 55%, rgba(13,34,71,0.55) 100%)',
          }}
        />
        {/* Tinte general + vignette para borde inferior */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(10,22,40,0.45) 100%)',
          }}
        />
      </div>

      <div
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(56,189,248,0.30), transparent)',
        }}
      />

      <div className="container relative z-10">
        {/* Título */}
        <ScrollReveal className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="section-title">
            {data.title_line_1}{' '}
            <span className="gradient-text">{data.title_line_2}</span>
          </h2>
        </ScrollReveal>

        {/* Horario tipográfico, sin cards: días + hora como statement */}
        <ScrollReveal delay={1}>
          <div className="text-center">
            <div
              className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-8 gap-y-2 font-heading font-bold text-white"
              style={{
                fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
                letterSpacing: '0.04em',
              }}
            >
              {data.days.map((day, i) => (
                <Fragment key={day}>
                  {i > 0 && (
                    <span className="text-accent/40 font-light" aria-hidden>
                      /
                    </span>
                  )}
                  <span>{day}</span>
                </Fragment>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-accent/40" />
              <p className="text-white/70 text-sm md:text-base font-body">
                a las{' '}
                <span className="text-accent font-heading font-bold text-lg md:text-xl">
                  {data.time}
                </span>{' '}
                <span className="text-accent/80 font-body font-semibold uppercase text-xs tracking-widest">
                  hs
                </span>
              </p>
              <span className="h-px w-10 bg-accent/40" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
