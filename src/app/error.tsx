'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

// Error boundary del árbol de rutas bajo el layout raíz (sitio público, auth).
// El dashboard tiene su propio boundary en dashboard/(panel)/error.tsx que mantiene
// el sidebar montado — este es el fallback genérico para todo lo demás.
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[error boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-blue-900">
      <div className="max-w-md w-full text-center">
        <div
          className="w-14 h-14 rounded-xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h1 className="font-heading font-extrabold text-white text-2xl uppercase mb-3">
          Algo salió mal
        </h1>
        <p className="text-white/50 text-sm mb-8">
          Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn btn--primary">
            Reintentar
          </button>
          <a href="/" className="btn btn--outline-accent">
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}
