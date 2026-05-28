'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitContact, ContactState } from '@/actions/contact'

const initialState: ContactState = { success: false, error: null }

interface Coach {
  id: string
  name: string
  specialty: string
}

interface Discipline {
  id: string
  name: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary w-full justify-center uppercase tracking-widest text-sm font-extrabold disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? 'ENVIANDO...' : 'ENVIAR CONSULTA'}
    </button>
  )
}

export default function ContactForm({
  coaches = [],
  disciplines = [],
  preselectedCoachName,
}: {
  coaches?: Coach[]
  disciplines?: Discipline[]
  preselectedCoachName?: string
}) {
  const [state, formAction] = useActionState(submitContact, initialState)

  if (state.success) {
    return (
      <div
        className="p-8 rounded-xl text-center"
        style={{
          background: 'rgba(37,211,102,0.08)',
          border: '1px solid rgba(37,211,102,0.25)',
        }}
      >
        <p className="text-success text-lg font-semibold">
          ✓ ¡Mensaje enviado! Te responderemos pronto.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-8 md:p-10"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h3 className="font-heading font-bold text-2xl uppercase text-white mb-8">
        ENVIANOS TU CONSULTA
      </h3>

      {state.error && (
        <div
          className="mb-6 p-4 rounded-lg text-danger text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormGroup label="Nombre completo *" error={state.fieldErrors?.nombre?.[0]}>
            <input type="text" name="nombre" className="form-input" placeholder="Tu nombre" required />
          </FormGroup>

          <FormGroup label="Email *" error={state.fieldErrors?.email?.[0]}>
            <input type="email" name="email" className="form-input" placeholder="tu@email.com" required />
          </FormGroup>

          <FormGroup label="Teléfono / WhatsApp *" error={state.fieldErrors?.telefono?.[0]}>
            <input type="tel" name="telefono" className="form-input" placeholder="+54 9..." required />
          </FormGroup>

          <FormGroup label="Ciudad / Localidad">
            <input type="text" name="ciudad" className="form-input" placeholder="¿Dónde vivís?" />
          </FormGroup>

          <FormGroup label="Disciplina de interés">
            <select name="servicio" className="form-input">
              <option value="">Seleccionar...</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
              <option value="Otro / Consulta General">Otro / Consulta General</option>
            </select>
          </FormGroup>

          <FormGroup label="Tu principal objetivo">
            <input type="text" name="objetivo" className="form-input" placeholder="Ej: Correr mis primeros 21k" />
          </FormGroup>
        </div>

        {coaches.length > 0 && (
          <FormGroup label="Entrenador de preferencia">
            <select name="coach" defaultValue={preselectedCoachName ?? ''} className="form-input">
              <option value="">Sin preferencia</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} — {c.specialty}
                </option>
              ))}
            </select>
          </FormGroup>
        )}

        <FormGroup label="Mensaje o dudas adicionales *" error={state.fieldErrors?.mensaje?.[0]}>
          <textarea name="mensaje" className="form-input" rows={4} required placeholder="Contanos más sobre vos..." />
        </FormGroup>

        <SubmitButton />
      </form>
    </div>
  )
}

function FormGroup({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-body font-semibold tracking-wider uppercase text-white/55">{label}</label>
      <style jsx global>{`
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 11px 14px;
          color: white;
          font-family: var(--font-barlow), sans-serif;
          font-size: 0.9rem;
          transition: border-color 0.2s, background 0.2s;
          outline: none;
        }
        .form-input::placeholder { color: rgba(255,255,255,0.3); }
        .form-input:focus {
          border-color: #38BDF8;
          background: rgba(56,189,248,0.06);
        }
        .form-input option { background: #0D2247; color: white; }
        select.form-input {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-color: rgba(13,34,71,0.98);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%2338BDF8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 14px;
          padding-right: 36px;
          cursor: pointer;
        }
      `}</style>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}
