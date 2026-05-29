import { MapPin } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { LocationsSettings } from '@/lib/content'

export default function Locations({ data }: { data: LocationsSettings }) {
  if (!data.items.length) return null

  const isSingle = data.items.length === 1

  return (
    <section id="ubicaciones" className="py-section bg-blue-800">
      <div className="container">
        <ScrollReveal className="text-center mb-12">
          <p className="section-label">{data.label}</p>
          <h2 className="section-title">
            {data.title_line_1}{' '}
            <span className="gradient-text">{data.title_line_2}</span>
          </h2>
        </ScrollReveal>

        <div
          className={
            isSingle
              ? 'max-w-2xl mx-auto'
              : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
          }
        >
          {data.items.map((loc, i) => (
            <ScrollReveal key={i} delay={(i + 1) as 1 | 2 | 3 | 4}>
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: '#0D2247', border: '1px solid #102E66' }}
              >
                {/* Mapa */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {loc.maps_embed_url ? (
                    <iframe
                      src={loc.maps_embed_url}
                      title={loc.name}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 0 }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                      style={{ background: '#091A35' }}
                    >
                      <MapPin size={32} className="text-white/20" />
                      <p className="text-white/30 text-sm">Mapa no configurado</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-heading font-bold text-white text-base uppercase tracking-wide leading-tight">
                        {loc.name}
                      </h3>
                      <p className="text-white/55 text-sm mt-0.5">{loc.description}</p>
                      <p className="text-white/40 text-xs mt-1">{loc.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
