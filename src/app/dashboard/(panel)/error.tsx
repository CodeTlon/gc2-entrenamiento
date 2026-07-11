'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

// Boundary a nivel de sección del panel: DashboardShell (layout.tsx, el sidebar/topbar)
// sigue montado — solo se reemplaza el contenido de la sección que falló.
export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard error boundary]', error)
  }, [error])

  return (
    <div
      className="rounded-xl p-10 text-center"
      style={{ background: '#0D2247', border: '1px solid #102E66' }}
    >
      <div
        className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        <AlertTriangle size={20} className="text-red-400" />
      </div>
      <h2 className="font-heading font-extrabold text-white text-lg uppercase mb-2">
        No se pudo cargar esta sección
      </h2>
      <p className="text-white/40 text-sm mb-6">
        Ocurrió un error al procesar la solicitud. Probá de nuevo.
      </p>
      <button type="button" onClick={() => reset()} className="btn btn--primary">
        Reintentar
      </button>
    </div>
  )
}
