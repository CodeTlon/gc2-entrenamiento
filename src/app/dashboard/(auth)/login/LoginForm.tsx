'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { signInAction, type SignInState } from '@/actions/auth'
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
      {pending ? 'Ingresando…' : 'Ingresar'}
    </button>
  )
}

export default function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<SignInState, FormData>(signInAction, undefined)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />

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
      </div>

      <div>
        <label htmlFor="password" className="field-label">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="field-input"
        />
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
        href="/dashboard/forgot-password"
        className="block text-center text-sm text-white/40 hover:text-white transition-colors pt-1"
      >
        ¿Olvidaste tu contraseña?
      </Link>
    </form>
  )
}
