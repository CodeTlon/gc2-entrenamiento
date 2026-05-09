import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { getSiteSettings, type Plan, type PlanCategoryItem } from '@/lib/content'
import { createSupabaseClient } from '@/lib/supabase'
import { IMG_RUNNING } from '@/lib/constants'
import MiniHero from '@/components/ui/MiniHero'

export const metadata: Metadata = {
  title: 'Planes',
  description:
    'Planes personalizados para corredores y triatletas. Individual, grupal, presencial y a distancia.',
}

function PlanCard({ plan, whatsappLink }: { plan: Plan; whatsappLink: string }) {
  const display = plan.name_display ?? plan.name
  const isLongName = display.length > 6
  return (
    <div className={`plan-card h-full ${plan.featured ? 'plan-card--featured' : ''}`}>
      {/* Badge dentro de la card, arriba a la derecha */}
      {plan.badge && (
        <div
          className="absolute top-4 right-4 z-10 px-3 py-1 rounded text-[10px] font-body font-extrabold uppercase tracking-widest text-blue-900"
          style={{ background: '#38BDF8' }}
        >
          {plan.badge}
        </div>
      )}

      <p className="text-[11px] font-body font-bold tracking-[3px] uppercase text-accent/70 mb-3">
        Plan
      </p>
      <div
        className="font-heading font-black uppercase leading-none text-white mb-5"
        style={{ fontSize: isLongName ? 'clamp(1.5rem, 3vw, 2rem)' : 'clamp(2.5rem, 5vw, 3.5rem)' }}
      >
        {display}
        <span className="text-accent">.</span>
      </div>

      <div className="flex-1 space-y-2.5 mb-7">
        {plan.features.map((feat, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span
              className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-blue-900 text-[10px] font-extrabold"
              style={{ background: '#38BDF8' }}
            >
              ✓
            </span>
            <span className="text-sm leading-relaxed text-white/65">{feat}</span>
          </div>
        ))}
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn w-full justify-center text-xs uppercase tracking-widest font-extrabold ${plan.featured ? 'btn--primary' : 'btn--outline'}`}
      >
        CONSULTAR
      </a>
    </div>
  )
}

function PlansSection({
  subtitle,
  plans,
  whatsappLink,
}: {
  subtitle: string
  plans: Plan[]
  whatsappLink: string
}) {
  if (plans.length === 0) return null
  return (
    <div className="mb-20">
      <ScrollReveal>
        <div className="flex items-center gap-4 mb-10">
          <div
            className="w-1 h-7 rounded"
            style={{ background: '#38BDF8' }}
          />
          <span className="font-heading font-bold text-2xl text-white uppercase tracking-wider">
            {subtitle}
          </span>
        </div>
      </ScrollReveal>
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}
      >
        {plans.map((plan, i) => (
          <ScrollReveal key={plan.id} delay={(Math.min(i + 1, 4)) as 1 | 2 | 3 | 4} className="h-full">
            <PlanCard plan={plan} whatsappLink={whatsappLink} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
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
        image={IMG_RUNNING}
        imageAlt="Corredor"
        titleWhite="ELEGÍ TU"
        titleAccent="PLAN"
      />

      {/* Plans */}
      <section className="py-section bg-blue-900" id="corredores">
        <div className="container">
          {categories.map((cat) => (
            <PlansSection
              key={cat.id}
              subtitle={cat.name}
              plans={plans.filter((p) => p.plan_category_id === cat.id)}
              whatsappLink={whatsappLink}
            />
          ))}
          {plans.filter((p) => !p.plan_category_id).length > 0 && (
            <PlansSection
              subtitle="Otros planes"
              plans={plans.filter((p) => !p.plan_category_id)}
              whatsappLink={whatsappLink}
            />
          )}
        </div>
      </section>
    </>
  )
}
