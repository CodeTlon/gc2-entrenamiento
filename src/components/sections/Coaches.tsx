'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Instagram } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import CoachModal from '@/components/sections/CoachModal'
import type { Coach } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'

export default function Coaches({ coaches }: { coaches: Coach[] }) {
  const [selected, setSelected] = useState<Coach | null>(null)

  return (
    <section className="py-section bg-blue-900" id="profes">
      <div className="container">
        <ScrollReveal className="text-center mb-14">
          <p className="section-label">● Nuestro Staff</p>
          <h2 className="section-title">
            LOS PROFESIONALES <br />
            <span className="gradient-text">DETRÁS DEL EQUIPO</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {coaches.map((coach, i) => (
            <ScrollReveal key={coach.id} delay={(i + 1) as 1 | 2 | 3} className="h-full">
              <button
                type="button"
                onClick={() => setSelected(coach)}
                className="group flex flex-col w-full h-full text-left rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/60"
                style={{
                  background: '#0D2247',
                  border: '1px solid #102E66',
                  boxShadow: '0 4px 16px rgba(10,22,40,0.15)',
                }}
                aria-label={`Ver perfil de ${coach.name}`}
              >
                <div className="relative overflow-hidden flex-shrink-0" style={{ height: '320px' }}>
                  {coach.photo_url && (() => {
                    const fp = focalImageProps(coach.photo_url)
                    return (
                      <Image
                        src={fp.src}
                        alt={`Coach ${coach.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={fp.style}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )
                  })()}
                  <div
                    className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent 50%, rgba(13,34,71,0.4) 100%)',
                    }}
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p
                    className="text-accent text-[11px] font-body font-bold uppercase mb-2"
                    style={{ letterSpacing: '2.5px' }}
                  >
                    {coach.specialty}
                  </p>
                  <h3 className="font-heading font-bold text-white text-2xl uppercase mb-3 leading-tight">
                    {coach.name}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                    {coach.short_desc}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    {coach.ig_url ? (
                      <a
                        href={coach.ig_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-accent transition-colors"
                      >
                        <Instagram size={16} />
                        {coach.ig_handle}
                      </a>
                    ) : (
                      <span />
                    )}
                    <span className="text-accent text-xs font-bold uppercase tracking-widest">
                      Ver perfil
                    </span>
                  </div>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <CoachModal coach={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
