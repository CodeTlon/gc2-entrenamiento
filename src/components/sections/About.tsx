import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { AboutSettings } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'

export default function About({ data }: { data: AboutSettings }) {
  const fp = focalImageProps(data.image)
  return (
    <section
      className="relative py-section overflow-hidden bg-blue-900"
      id="nosotros"
    >
      {/* Halos sutiles */}
      <div
        className="absolute -top-32 -left-20 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="container relative">
        {/* Foto del equipo: banner horizontal arriba — la imagen lidera */}
        <ScrollReveal>
          <div className="relative mb-14 lg:mb-16">
            {/* Halo accent detrás */}
            <div
              className="absolute -inset-6 md:-inset-10 rounded-3xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(56,189,248,0.16) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
              aria-hidden
            />
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                aspectRatio: '16 / 9',
                maxHeight: '560px',
                boxShadow:
                  '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(56,189,248,0.12)',
              }}
            >
              <Image
                src={fp.src}
                alt="Equipo de GC²"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                style={fp.style}
                className="object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 65%, rgba(10,22,40,0.50) 100%)',
                }}
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Contenido: bloque unificado a todo el ancho de la imagen */}
        <ScrollReveal delay={1}>
          <h2 className="section-title mb-6">
            {data.title_line_1}{' '}
            <span className="gradient-text">{data.title_line_2}</span>
          </h2>
          <div className="space-y-4 text-white/65 leading-relaxed font-light text-[15px] md:text-base">
            {data.paragraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
