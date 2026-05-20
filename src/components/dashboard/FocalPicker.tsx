'use client'

import { useMemo } from 'react'

/**
 * Selector 3×3 para elegir el "focal point" de una imagen.
 * Devuelve un string `objectPosition` (ej: "50% 0%", "100% 50%").
 *
 * Si la imagen está dada, se usa como preview. La marca azul muestra
 * la posición elegida.
 */
const POSITIONS: { value: string; label: string }[] = [
  { value: '0% 0%', label: 'Arriba izquierda' },
  { value: '50% 0%', label: 'Arriba centro' },
  { value: '100% 0%', label: 'Arriba derecha' },
  { value: '0% 50%', label: 'Centro izquierda' },
  { value: '50% 50%', label: 'Centro' },
  { value: '100% 50%', label: 'Centro derecha' },
  { value: '0% 100%', label: 'Abajo izquierda' },
  { value: '50% 100%', label: 'Abajo centro' },
  { value: '100% 100%', label: 'Abajo derecha' },
]

export default function FocalPicker({
  image,
  value,
  onChange,
  previewAspect = '1 / 1',
}: {
  image?: string
  value?: string
  onChange: (position: string) => void
  /** CSS aspect-ratio string para el preview (ej: "1 / 1", "2 / 1", "1 / 2"). */
  previewAspect?: string
}) {
  const current = value || '50% 50%'

  const dotPos = useMemo(() => {
    const [x, y] = current.split(' ')
    return { x: x ?? '50%', y: y ?? '50%' }
  }, [current])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Preview */}
        <div
          className="relative rounded-md overflow-hidden flex-shrink-0"
          style={{
            width: '120px',
            aspectRatio: previewAspect,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: current }}
            />
          ) : null}
          {/* Punto que muestra la posición */}
          <span
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{
              left: dotPos.x,
              top: dotPos.y,
              transform: 'translate(-50%, -50%)',
              background: '#38BDF8',
              boxShadow: '0 0 0 2px rgba(13,34,71,0.9)',
            }}
          />
        </div>

        {/* Grilla 3x3 */}
        <div
          className="grid grid-cols-3 gap-1 flex-shrink-0"
          style={{ width: '96px' }}
          role="group"
          aria-label="Posición del foco de la imagen"
        >
          {POSITIONS.map((p) => {
            const active = p.value === current
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onChange(p.value)}
                title={p.label}
                aria-label={p.label}
                aria-pressed={active}
                className="rounded-sm transition-colors"
                style={{
                  width: '28px',
                  height: '28px',
                  background: active ? '#38BDF8' : 'rgba(255,255,255,0.06)',
                  border: active
                    ? '1px solid #38BDF8'
                    : '1px solid rgba(255,255,255,0.12)',
                }}
              />
            )
          })}
        </div>

        <p className="text-white/40 text-xs leading-snug max-w-[200px]">
          Elegí qué zona de la foto se ve cuando se recorta al tamaño del layout.
        </p>
      </div>
    </div>
  )
}
