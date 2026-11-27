import Link from 'next/link'
import WhatsAppIcon from './WhatsAppIcon'

interface Props {
  whatsappLink: string
}

/** Barra fija bottom, solo mobile. El padding-bottom que reserva su espacio vive en el layout público. */
export default function StickyMobileCTA({ whatsappLink }: Props) {
  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-2 px-3 py-3"
      style={{
        background: 'rgba(10,22,40,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <Link
        href="/contacto"
        className="flex-1 btn btn--outline justify-center text-xs uppercase tracking-widest font-extrabold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        Contacto
      </Link>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-[1.4] btn btn--wa justify-center text-xs uppercase tracking-widest font-extrabold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <WhatsAppIcon size={16} />
        Escribinos
      </a>
    </div>
  )
}
