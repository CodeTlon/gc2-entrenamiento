import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { DisciplinesSettings } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'

export default function Disciplines({ data }: { data: DisciplinesSettings }) {
  return (
    <section
      className="py-section"
      id="disciplinas"
      style={{
        background: 'linear-gradient(180deg, #0D2247 0%, #0A1628 100%)',
      }}
    >
      <div className="container">
        <ScrollReveal className="text-center mb-14">
          <h2 className="section-title">
            {data.title_line_1}{' '}
            <span className="gradient-text">{data.title_line_2}</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {data.items.map((d, i) => {
            const fp = focalImageProps(d.image)
            return (
            <ScrollReveal key={`${d.title}-${i}`} delay={(i + 1) as 1 | 2 | 3}>
              <div
                className="relative rounded-xl overflow-hidden group cursor-default"
                style={{ height: '440px' }}
              >
                <Image
                  src={fp.src}
                  alt={d.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={fp.style}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay: dark from bottom, transparent at 70% */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(0deg, rgba(10,22,40,0.93) 0%, rgba(10,22,40,0.38) 40%, transparent 70%)',
                  }}
                />
                {/* Text content */}
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  <p
                    className="text-accent text-[11px] font-body font-bold uppercase mb-2"
                    style={{ letterSpacing: '2.5px' }}
                  >
                    {d.sub}
                  </p>
                  <h3
                    className="font-heading font-extrabold text-white text-4xl uppercase mb-2"
                    style={{ letterSpacing: '2px' }}
                  >
                    {d.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed font-light">
                    {d.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
