'use client'

import { useState } from 'react'
import Image from 'next/image'
import CoachModal from '@/components/sections/CoachModal'
import type { Coach } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'

export default function AuthorCard({ coach }: { coach: Coach }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex items-center gap-4 w-full text-left p-5 rounded-xl transition-all hover:-translate-y-0.5"
        style={{ background: '#0D2247', border: '1px solid #102E66' }}
      >
        {coach.photo_url && (() => {
          const fp = focalImageProps(coach.photo_url)
          return (
            <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: '2px solid rgba(56,189,248,0.3)' }}>
              <Image
                src={fp.src}
                alt={coach.name}
                fill
                sizes="56px"
                style={fp.style}
                className="object-cover"
              />
            </div>
          )
        })()}
        <div className="flex-1 min-w-0">
          <p className="text-accent text-[10px] font-body font-bold uppercase tracking-[2px] mb-0.5">
            Escrito por
          </p>
          <p className="font-heading font-bold text-white uppercase leading-tight">
            {coach.name}
          </p>
          <p className="text-white/50 text-xs mt-0.5">{coach.specialty}</p>
        </div>
        <span className="text-accent text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          Ver perfil
        </span>
      </button>

      <CoachModal coach={open ? coach : null} onClose={() => setOpen(false)} />
    </>
  )
}
