import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings, type Plan, type PlanCategoryItem } from '@/lib/content'
import { createSupabaseClient } from '@/lib/supabase'
import MiniHero from '@/components/ui/MiniHero'
import TLDRBox from '@/components/ui/TLDRBox'
import JsonLd from '@/components/ui/JsonLd'
import PlanesContent from './PlanesContent'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Planes',
  description:
    'Planes personalizados para corredores y triatletas. Individual, grupal, presencial y a distancia.',
  alternates: { canonical: '/planes' },
}

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: '¿Qué diferencia hay entre un plan individual y uno grupal?',
    answer:
      'El plan individual se arma a medida según tu nivel, objetivo y disponibilidad, con seguimiento personalizado de tu coach. El plan grupal se entrena en el parque los días fijados (martes, jueves y viernes) junto al resto del equipo, con una planificación común adaptada a distintos niveles.',
  },
  {
    question: '¿Los planes son presenciales o a distancia?',
    answer:
      'Ofrecemos ambas modalidades. Los planes a distancia se envían de forma digital con seguimiento periódico por WhatsApp y videollamada; los presenciales incluyen entrenamiento en cancha con el coach o en las clases grupales en Córdoba.',
  },
  {
    question: '¿Necesito experiencia previa para empezar a entrenar?',
    answer:
      'No. Trabajamos con corredores, duatletas y triatletas de todos los niveles, desde quienes arrancan de cero hasta quienes ya compiten en distancias largas. La evaluación funcional inicial define el punto de partida real de tu planificación.',
  },
  {
    question: '¿Qué incluye la evaluación funcional y los testeos?',
    answer:
      'Un relevamiento de tu estado físico actual, movilidad y antecedentes, más testeos periódicos de rendimiento que sirven para ajustar las cargas de entrenamiento a medida que progresás.',
  },
  {
    question: '¿Puedo cambiar de plan más adelante?',
    answer:
      'Sí. Muchos atletas arrancan con un plan grupal o individual básico y después suman plan de gimnasio complementario o pasan a un plan de mayor seguimiento a medida que se acercan a una competencia.',
  },
  {
    question: '¿Cómo contrato un plan o hago una consulta antes de decidir?',
    answer:
      'Escribinos por WhatsApp o completá el formulario de contacto contándonos tu objetivo y tu disponibilidad; te recomendamos el plan más adecuado sin cargo antes de que decidas.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default async function PlanesPage() {
  const supabase = createSupabaseClient()
  const [{ data: plansData }, { data: catsData }, settings] = await Promise.all([
    supabase.from('plans').select('*').order('display_order', { ascending: true }),
    supabase.from('plan_categories').select('id, name, slug, display_order').order('display_order', { ascending: true }),
    getSiteSettings(),
  ])
  const plans = (plansData ?? []) as Plan[]
  const categories = (catsData ?? []) as PlanCategoryItem[]
  const whatsappLink = settings.contact.whatsapp_link

  return (
    <>
      <MiniHero
        image={settings.page_banners.planes.bg_image}
        imageAlt="Corredor"
        titleWhite="ELEGÍ TU"
        titleAccent="PLAN"
      />

      {/* Intro: intención de búsqueda + TL:DR + CTA */}
      <section className="pt-section pb-0 bg-blue-900">
        <div className="container max-w-3xl">
          <p className="text-white/65 text-base md:text-lg leading-relaxed mb-6">
            Si buscás un <strong className="text-white">plan de entrenamiento para running, duatlón o triatlón en Córdoba</strong>,
            acá vas a encontrar opciones individuales y grupales, presenciales y a distancia, para
            todos los niveles: desde quien corre sus primeros kilómetros hasta quien compite en larga distancia.
          </p>

          <TLDRBox
            points={[
              'Planes individuales con seguimiento personalizado y planes grupales en el parque (martes, jueves y viernes).',
              'Modalidad presencial o a distancia, según lo que necesites.',
              'Evaluación funcional y testeos periódicos incluidos para ajustar la carga de entrenamiento.',
              'Plan de gimnasio complementario disponible en varias categorías.',
            ]}
            className="mb-8"
          />

          <div className="flex flex-wrap gap-3 mb-4">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn--primary uppercase tracking-widest text-xs font-extrabold">
              Consultar por WhatsApp
            </a>
            <Link href="/contacto" className="btn btn--outline uppercase tracking-widest text-xs font-extrabold">
              Ir a Contacto
            </Link>
          </div>
        </div>
      </section>

      <PlanesContent categories={categories} plans={plans} whatsappLink={whatsappLink} />

      {/* FAQ */}
      <section className="py-section bg-blue-900" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <p className="section-label text-center">Preguntas frecuentes</p>
            <h2 className="section-title">
              DUDAS SOBRE <span className="gradient-text">NUESTROS PLANES</span>
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl p-5 md:p-6"
                style={{ background: '#0D2247', border: '1px solid #102E66' }}
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-heading font-bold text-white text-base md:text-lg leading-snug rounded-md transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                  {item.question}
                  <span className="flex-shrink-0 text-accent text-xl leading-none transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-white/60 text-sm md:text-[15px] leading-relaxed mt-4">{item.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-white/50 text-sm mb-4">¿No encontraste tu respuesta?</p>
            <Link href="/contacto" className="btn btn--outline uppercase tracking-widest text-xs font-extrabold">
              Escribinos tu consulta
            </Link>
          </div>
        </div>
      </section>

      <JsonLd schema={faqSchema} />
    </>
  )
}
