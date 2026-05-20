'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Award, Trophy, Briefcase } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { Coach } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'

interface Props {
  coach: Coach | null
  onClose: () => void
}

export default function CoachModal({ coach, onClose }: Props) {
  return (
    <Modal open={!!coach} onClose={onClose} label={coach?.name} maxWidth={840}>
      {coach && (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* Photo */}
          <div className="relative h-72 md:h-auto md:min-h-[420px] overflow-hidden md:rounded-l-xl">
            {coach.photo_url && (() => {
              const fp = focalImageProps(coach.photo_url)
              return (
                <Image
                  src={fp.src}
                  alt={coach.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  style={fp.style}
                  className="object-cover"
                />
              )
            })()}
            <div
              className="absolute inset-0 md:rounded-l-xl"
              style={{
                background:
                  'linear-gradient(180deg, transparent 60%, rgba(13,34,71,0.9) 100%)',
              }}
            />
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <p
              className="text-accent text-xs font-body font-bold uppercase mb-2"
              style={{ letterSpacing: '2.5px' }}
            >
              {coach.specialty}
            </p>
            <h3 className="font-heading font-extrabold text-white text-3xl md:text-4xl uppercase mb-5 leading-tight">
              {coach.name}
            </h3>

            {coach.bio_long && (
              <p className="text-white/65 text-[15px] leading-relaxed mb-6 whitespace-pre-line">
                {coach.bio_long}
              </p>
            )}

            {coach.certifications.length > 0 && (
              <Section icon={<Award size={16} />} title="Formación">
                <ul className="space-y-2">
                  {coach.certifications.map((c, i) => (
                    <Bullet key={i}>{c}</Bullet>
                  ))}
                </ul>
              </Section>
            )}

            {coach.achievements.length > 0 && (
              <Section icon={<Trophy size={16} />} title="Logros">
                <ul className="space-y-2">
                  {coach.achievements.map((c, i) => (
                    <Bullet key={i}>{c}</Bullet>
                  ))}
                </ul>
              </Section>
            )}

            {coach.services.length > 0 && (
              <Section icon={<Briefcase size={16} />} title="Servicios">
                <div className="flex flex-wrap gap-2">
                  {coach.services.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-body font-semibold text-accent"
                      style={{
                        background: 'rgba(56,189,248,0.1)',
                        border: '1px solid rgba(56,189,248,0.25)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            <div className="flex flex-wrap gap-3 mt-7">
              {coach.ig_url && (
                <a
                  href={coach.ig_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-body font-semibold text-white transition-transform hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                  }}
                >
                  <Instagram size={16} />
                  {coach.ig_handle ?? 'Instagram'}
                </a>
              )}
              <Link
                href={`/contacto?coach=${coach.slug}`}
                onClick={onClose}
                className="btn btn--outline"
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <h4 className="flex items-center gap-2 text-accent text-xs font-body font-bold uppercase mb-3 tracking-widest">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-white/70 text-sm leading-relaxed">
      <span className="text-accent mt-0.5">✓</span>
      <span>{children}</span>
    </li>
  )
}
