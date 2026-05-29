'use client'

import { useState } from 'react'
import { MapPin, Map } from 'lucide-react'
import type { LocationItem } from '@/lib/content'

export default function LocationCard({ loc }: { loc: LocationItem }) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const hasMap = !!loc.maps_embed_url

  function toggle() {
    if (!hasMap) return
    if (!loaded) setLoaded(true)
    setOpen((v) => !v)
  }

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col h-full"
      style={{ background: '#0D2247', border: '1px solid #102E66' }}
    >
      {/* Info */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start gap-2.5 flex-1">
          <MapPin size={15} className="text-accent mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-heading font-bold text-white text-base uppercase tracking-wide leading-tight">
              {loc.name}
            </h3>
            <p className="text-white/55 text-sm mt-1">{loc.description}</p>
            <p className="text-white/40 text-xs mt-1.5">{loc.address}</p>
          </div>
        </div>

        <button
          onClick={toggle}
          disabled={!hasMap}
          className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          style={
            !hasMap
              ? {
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.2)',
                  cursor: 'not-allowed',
                  border: '1px solid rgba(255,255,255,0.05)',
                }
              : open
                ? {
                    background: 'rgba(56,189,248,0.12)',
                    color: '#38BDF8',
                    border: '1px solid rgba(56,189,248,0.2)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
          }
        >
          <Map size={14} />
          {!hasMap ? 'Mapa no disponible' : open ? 'Cerrar mapa' : 'Ver ubicación'}
        </button>
      </div>

      {/* Mapa colapsable */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ height: open ? '240px' : '0px' }}
      >
        {loaded && (
          <iframe
            src={loc.maps_embed_url}
            title={loc.name}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="w-full"
            style={{ height: '240px', border: 0, display: 'block' }}
          />
        )}
      </div>
    </div>
  )
}
