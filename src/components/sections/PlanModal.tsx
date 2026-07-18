'use client'

import Modal from '@/components/ui/Modal'
import type { Plan } from '@/lib/content'

interface Props {
  plan: Plan | null
  onClose: () => void
}

export default function PlanModal({ plan, onClose }: Props) {
  return (
    <Modal open={!!plan} onClose={onClose} label={plan?.name_display ?? plan?.name} maxWidth={640}>
      {plan && (
        <div className="p-6 md:p-8">
          {plan.badge && (
            <span
              className="inline-block px-3 py-1 rounded text-[10px] font-body font-extrabold uppercase tracking-widest text-blue-900 mb-4"
              style={{ background: '#38BDF8' }}
            >
              {plan.badge}
            </span>
          )}
          <p className="text-[11px] font-body font-bold tracking-[3px] uppercase text-accent/70 mb-2">
            Plan
          </p>
          <h3 className="font-heading font-extrabold text-white text-3xl md:text-4xl uppercase mb-5 leading-tight">
            {plan.name_display ?? plan.name}
          </h3>

          {plan.description_long && (
            <p className="text-white/65 text-[15px] leading-relaxed mb-6 whitespace-pre-line">
              {plan.description_long}
            </p>
          )}

          {plan.features.length > 0 && (
            <ul className="space-y-2.5">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-blue-900 text-[10px] font-extrabold"
                    style={{ background: '#38BDF8' }}
                  >
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-white/70">{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  )
}
