import Image from 'next/image'
import { Check } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { GroupClassesSettings } from '@/lib/content'

export default function GroupClasses({ data }: { data: GroupClassesSettings }) {
  return (
    <section className="relative py-section overflow-hidden" id="grupales">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={data.bg_image}
          alt="Entrenamiento grupal"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10,22,40,0.94) 0%, rgba(13,34,71,0.87) 50%, rgba(16,46,102,0.8) 100%)',
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <ScrollReveal>
            <p className="section-label">{data.label}</p>
            <h2 className="section-title mb-7">
              {data.title_line_1}
              <br />
              <span className="gradient-text">{data.title_line_2}</span>
            </h2>

            {/* Time */}
            <div className="inline-flex items-baseline gap-2 mb-8">
              <span
                className="font-heading font-black text-accent leading-none"
                style={{ fontSize: '72px' }}
              >
                {data.time}
              </span>
              <span
                className="text-white/50 font-body font-semibold uppercase text-lg"
                style={{ letterSpacing: '2px' }}
              >
                HS
              </span>
            </div>

            {/* Days */}
            <div className="flex flex-wrap gap-3 mb-9">
              {data.days.map((day) => (
                <span
                  key={day}
                  className="px-5 py-2.5 text-[13px] font-body font-bold text-accent rounded-md"
                  style={{
                    background: 'rgba(56,189,248,0.12)',
                    border: '1px solid rgba(56,189,248,0.25)',
                    letterSpacing: '2px',
                  }}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Plans */}
            <div className="space-y-4">
              {data.plans.map((plan, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-5 rounded-xl"
                  style={{
                    background: 'rgba(13,34,71,0.56)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(26,68,148,0.25)',
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #2563EB, #38BDF8)',
                    }}
                  >
                    <Check size={15} className="text-white" />
                  </span>
                  <div>
                    <p className="font-heading font-bold text-white text-lg leading-snug">
                      {plan.name}
                    </p>
                    <p className="text-white/45 text-sm font-light">{plan.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Side image */}
          <ScrollReveal delay={2}>
            <div
              className="relative rounded-xl overflow-hidden shadow-xl hidden lg:block"
              style={{ height: '520px' }}
            >
              <Image
                src={data.side_image}
                alt="Clases grupales"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
