import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({
  eyebrow,
  title,
  description,
  back,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  back?: { href: string; label: string }
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-accent mb-3 transition-colors"
          >
            <ArrowLeft size={12} /> {back.label}
          </Link>
        )}
        {eyebrow && (
          <p
            className="text-accent text-xs font-body font-bold uppercase mb-2"
            style={{ letterSpacing: '2.5px' }}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading font-extrabold text-white text-2xl md:text-3xl uppercase leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-white/45 text-sm mt-2 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
