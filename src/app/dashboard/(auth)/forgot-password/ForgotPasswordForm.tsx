'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { forgotPasswordAction, type ForgotPasswordState } from '@/actions/auth'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary w-full justify-center"
      style={pending ? { opacity: 0.7, cursor: 'wait' } : undefined}
    >
      {pending ? 'Enviando…' : 'Enviar link de recuperación'}
    </button>
  )
}

export default function ForgotPasswordForm() {
  const [state, action] = useActionState<ForgotPasswordState, FormData>(forgotPasswordAction, undefined)

  if (state?.success) {
    return (
      <div className="text-center space-y-4">
        <div
          className="rounded-xl p-5"
          style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}
        >
          <p className="text-accent font-bold text-base mb-1">¡Revisá tu email!</p>
          <p className="text-white/60 text-sm leading-relaxed">
            Si el email está registrado, vas a recibir un link para crear una nueva contraseña. Revisá también la carpeta de spam.
          </p>
        </div>
        <Link
          href="/dashboard/login"
          className="inline-block text-sm text-white/45 hover:text-white transition-colors mt-2"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          className="field-input"
        />
        <p className="text-white/35 text-xs mt-1.5">
          Te enviamos un link para crear una contraseña nueva.
        </p>
      </div>

      {state?.error && (
        <p
          className="text-sm rounded-md px-3 py-2"
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
          }}
        >
          {state.error}
        </p>
      )}

      <SubmitButton />

      <Link
        href="/dashboard/login"
        className="block text-center text-sm text-white/40 hover:text-white transition-colors pt-1"
      >
        ← Volver al inicio de sesión
      </Link>
    </form>
  )
}
