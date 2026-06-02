'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'

export default function SetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true)
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Mínimo 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    const supabase = createSupabaseClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('No se pudo guardar la contraseña. Intentá de nuevo.')
      setSubmitting(false)
      return
    }

    setDone(true)
    setTimeout(() => router.replace('/dashboard'), 2000)
  }

  const wrapStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.25rem',
    background: 'radial-gradient(circle at top, #0D2247 0%, #0A1628 60%)',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '28rem',
    borderRadius: '1rem',
    padding: '2.5rem',
    background: '#0D2247',
    border: '1px solid #102E66',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  }

  if (!ready) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle} className="text-center">
          <p className="text-white/60 text-sm">Verificando invitación…</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div style={wrapStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <p className="text-accent font-bold text-lg">¡Contraseña creada!</p>
          <p className="text-white/60 text-sm mt-2">Ingresando al dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div className="mb-8 text-center">
          <p
            className="text-accent text-xs font-body font-bold uppercase mb-2"
            style={{ letterSpacing: '2.5px' }}
          >
            Panel privado
          </p>
          <h1 className="font-heading font-extrabold text-white text-3xl uppercase leading-tight">
            GC<span className="gradient-text">²</span> Dashboard
          </h1>
          <p className="text-white/45 text-sm mt-3">
            Ingresá tu nueva contraseña para acceder al panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="field-label">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="field-input"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="field-label">Confirmar contraseña</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              className="field-input"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p
              className="text-sm rounded-md px-3 py-2"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn--primary w-full justify-center"
            style={submitting ? { opacity: 0.7, cursor: 'wait' } : undefined}
          >
            {submitting ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
