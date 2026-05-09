'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, Check, AlertCircle } from 'lucide-react'

export function SaveButton({ label = 'Guardar cambios' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn--primary"
      style={pending ? { opacity: 0.7, cursor: 'wait' } : undefined}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Guardando…
        </>
      ) : (
        label
      )}
    </button>
  )
}

export function SaveStatus({ state }: { state: { ok?: boolean; error?: string } | undefined }) {
  if (!state) return null
  if (state.ok) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-green-400">
        <Check size={14} /> Guardado
      </p>
    )
  }
  if (state.error) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-red-400">
        <AlertCircle size={14} /> {state.error}
      </p>
    )
  }
  return null
}
