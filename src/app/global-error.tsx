'use client'

import { useEffect } from 'react'

// Se activa SOLO si el root layout (layout.tsx) mismo tira una excepción — reemplaza
// todo el árbol, por eso define su propio <html>/<body>. No puede depender de nada que
// viva en layout.tsx (fuentes, GA, CookieConsent): si eso es lo que rompió, este archivo
// tiene que seguir renderizando igual. Estilos inline a propósito (sin confiar en que
// Tailwind/globals.css hayan podido cargar).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global error boundary]', error)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#0A1628',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
            GC² Entrenamiento
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 28 }}>
            Ocurrió un error inesperado y no pudimos cargar la página. Probá de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: 'linear-gradient(90deg, #2563EB, #38BDF8)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '12px 28px',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
