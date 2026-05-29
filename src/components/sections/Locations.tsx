import ScrollReveal from '@/components/ui/ScrollReveal'
import type { LocationsSettings } from '@/lib/content'
import LocationCard from './LocationCard'

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
              : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch'
          }
        >
          {data.items.map((loc, i) => (
            <ScrollReveal key={i} delay={(i + 1) as 1 | 2 | 3 | 4} className="h-full">
              <LocationCard loc={loc} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
