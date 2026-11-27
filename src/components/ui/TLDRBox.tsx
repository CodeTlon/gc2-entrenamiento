import { CheckCircle2 } from 'lucide-react'

interface TLDRBoxProps {
  /** Título de la caja. Default: "En resumen". */
  title?: string
  /** Puntos clave en bullets. Usar esto o `children`. */
  points?: string[]
  children?: React.ReactNode
  className?: string
}

/** Caja de puntos clave / resumen, para ubicar arriba del contenido largo (blog posts, Planes). */
export default function TLDRBox({ title = 'En resumen', points, children, className = '' }: TLDRBoxProps) {
  return (
    <div
      className={`rounded-xl p-5 md:p-6 ${className}`}
      style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.22)' }}
    >
      <p className="text-accent text-[11px] font-body font-bold uppercase tracking-[2.5px] mb-3">
        {title}
      </p>
      {points ? (
        <ul className="space-y-2">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-white/75 text-[15px] leading-relaxed">
              <CheckCircle2 size={16} className="text-accent mt-0.5 flex-shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-white/75 text-[15px] leading-relaxed space-y-2">{children}</div>
      )}
    </div>
  )
}
