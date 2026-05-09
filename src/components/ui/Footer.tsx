import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail } from 'lucide-react'
import { SITE_YEAR, SITE_CITY } from '@/lib/constants'
import WhatsAppIcon from './WhatsAppIcon'

interface Props {
  contact: {
    whatsapp_link: string
    instagram_link: string
    email: string
    city: string
  }
}

export default function Footer({ contact }: Props) {
  return (
    <footer className="bg-blue-800 pt-16 pb-0" style={{ borderTop: '1px solid #0D2247' }}>
      <div className="container">
        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-8 pb-12">
          <Link href="/" className="md:justify-self-start">
            <Image
              src="/images/logo.png"
              alt="GC2 Entrenamiento"
              width={140}
              height={48}
              className="h-12 w-auto"
              sizes="140px"
            />
          </Link>

          <div className="flex items-center justify-center gap-4">
            <a
              href={contact.instagram_link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-md flex items-center justify-center text-white/40 hover:text-accent transition-all"
              style={{ border: '1px solid #102E66' }}
            >
              <Instagram size={18} />
            </a>
            <a
              href={contact.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-10 h-10 rounded-md flex items-center justify-center text-white/40 hover:text-accent transition-all"
              style={{ border: '1px solid #102E66' }}
            >
              <WhatsAppIcon size={18} />
            </a>
            <a
              href={`mailto:${contact.email}`}
              aria-label="Email"
              className="w-10 h-10 rounded-md flex items-center justify-center text-white/40 hover:text-accent transition-all"
              style={{ border: '1px solid #102E66' }}
            >
              <Mail size={18} />
            </a>
          </div>

          <p className="text-white/30 text-xs md:text-right md:justify-self-end">
            © {SITE_YEAR} GC² — {contact.city}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-[11px] text-white/25"
          style={{ borderTop: '1px solid #102E66' }}
        >
          <div className="flex items-center gap-4">
            <Link href="/terminos" className="hover:text-white/50 transition-colors">
              Términos y condiciones
            </Link>
            <span>·</span>
            <Link href="/privacidad" className="hover:text-white/50 transition-colors">
              Política de privacidad
            </Link>
          </div>
          <a
            href="https://codetlon.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/45 transition-colors"
          >
            Desarrollado por CodeTlon
          </a>
        </div>
      </div>
    </footer>
  )
}
