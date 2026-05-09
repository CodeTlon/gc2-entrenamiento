import Image from 'next/image'
import { Check } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { AboutSettings } from '@/lib/content'

export default function About({ data }: { data: AboutSettings }) {
  return (
    <section className="py-section bg-blue-900 relative" id="nosotros">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(26,68,148,0.25), transparent)',
        }}
      />
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <ScrollReveal>
            <div
              className="relative rounded-xl overflow-hidden shadow-xl"
              style={{ height: '480px' }}
            >
              <Image
                src={data.image}
                alt="Atleta entrenando"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={2}>
            <p className="section-label flex items-center gap-2.5">
              <span className="inline-block w-7 h-px bg-accent" />
              {data.label}
            </p>
            <h2 className="section-title mb-6">
              {data.title_line_1}{' '}
              <span className="gradient-text">{data.title_line_2}</span>
            </h2>
            <div className="space-y-4 mb-8 text-white/55 leading-relaxed font-light">
              {data.paragraphs.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>

            {/* Features */}
            <div className="space-y-3">
              {data.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #38BDF8)' }}
                  >
                    <Check size={14} className="text-white" />
                  </span>
                  <span className="text-white/70 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
