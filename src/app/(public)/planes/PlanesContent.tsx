'use client'

import { useState } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import PlanModal from '@/components/sections/PlanModal'
import type { Plan, PlanCategoryItem } from '@/lib/content'

function PlanCard({
  plan,
  whatsappLink,
  onMoreInfo,
}: {
  plan: Plan
  whatsappLink: string
  onMoreInfo: () => void
}) {
  const display = plan.name_display ?? plan.name
  const isLongName = display.length > 6
  const hasDescription = !!plan.description_long
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
        className="font-heading font-black uppercase leading-none text-white mb-5 min-h-[4.5rem] flex items-start"
        style={{ fontSize: isLongName ? 'clamp(1.5rem, 3vw, 2rem)' : 'clamp(2.5rem, 5vw, 3.5rem)' }}
      >
        <span>
          {display}
          <span className="text-accent">.</span>
        </span>
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

      <div className="flex gap-2">
        {hasDescription && (
          <button
            type="button"
            onClick={onMoreInfo}
            className="btn btn--outline flex-1 justify-center text-xs uppercase tracking-widest font-extrabold"
          >
            Más información
          </button>
        )}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn justify-center text-xs uppercase tracking-widest font-extrabold ${hasDescription ? 'flex-1' : 'w-full'} ${plan.featured ? 'btn--primary' : 'btn--outline'}`}
        >
          CONSULTAR
        </a>
      </div>
    </div>
  )
}

function PlansSection({
  subtitle,
  plans,
  whatsappLink,
  onSelect,
}: {
  subtitle: string
  plans: Plan[]
  whatsappLink: string
  onSelect: (plan: Plan) => void
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
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              whatsappLink={whatsappLink}
              onMoreInfo={() => onSelect(plan)}
            />
          ))}
        </div>
      </ScrollReveal>
    </div>
  )
}

export default function PlanesContent({
  categories,
  plans,
  whatsappLink,
}: {
  categories: PlanCategoryItem[]
  plans: Plan[]
  whatsappLink: string
}) {
  const [selected, setSelected] = useState<Plan | null>(null)

  return (
    <>
      <section className="py-section bg-blue-900" id="corredores">
        <div className="container">
          {categories.map((cat) => (
            <PlansSection
              key={cat.id}
              subtitle={cat.name}
              plans={plans.filter((p) => p.plan_category_id === cat.id)}
              whatsappLink={whatsappLink}
              onSelect={setSelected}
            />
          ))}
          {plans.filter((p) => !p.plan_category_id).length > 0 && (
            <PlansSection
              subtitle="Otros planes"
              plans={plans.filter((p) => !p.plan_category_id)}
              whatsappLink={whatsappLink}
              onSelect={setSelected}
            />
          )}
        </div>
      </section>

      <PlanModal plan={selected} onClose={() => setSelected(null)} />
    </>
  )
}
