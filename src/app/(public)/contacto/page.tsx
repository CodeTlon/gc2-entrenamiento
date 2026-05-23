import type { Metadata } from 'next'
import Image from 'next/image'
import { Instagram, Mail } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import ContactForm from '@/components/sections/ContactForm'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon'
import { createSupabaseClient } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactá a GC² Entrenamiento. Escribinos por WhatsApp, Instagram o completá el formulario.',
}

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ coach?: string }>
}) {
  const { coach: coachSlug } = await searchParams
  const { contact, page_banners } = await getSiteSettings()
  const contactoBanner = focalImageProps(page_banners.contacto.bg_image)
  const supabase = createSupabaseClient()

  const { data: coaches } = await supabase
    .from('coaches')
    .select('id, name, specialty, slug')
    .order('display_order', { ascending: true })

  const coachesList = coaches ?? []
  const preselectedCoach = coachSlug
    ? coachesList.find((c) => c.slug === coachSlug)
    : undefined

  return (
    <>
      {/* Hero full */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src={contactoBanner.src || page_banners.contacto.bg_image}
            alt="Contacto"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover"
            style={contactoBanner.style}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(13,34,71,0.92) 40%, rgba(16,46,102,0.78) 70%, rgba(10,22,40,0.95) 100%)',
            }}
          />
        </div>
        <div className="container relative z-10 text-center">
          <h1
            className="font-heading font-black uppercase leading-[1.05]"
            style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', letterSpacing: '-2px' }}
          >
            <span className="block text-white">EMPEZÁ A</span>
            <span className="block gradient-text">ENTRENAR HOY</span>
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-section bg-blue-900" id="contacto">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Redes — arriba, diseño del sitio */}
            <ScrollReveal>
              <div className="grid grid-cols-3 gap-3">
                <a
                  href={contact.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 group"
                  style={{ background: '#0D2247', border: '1px solid #102E66' }}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-accent"
                    style={{ background: '#102E66' }}
                  >
                    <WhatsAppIcon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-white text-sm leading-none">WhatsApp</p>
                    <p className="text-white/40 text-xs mt-1 hidden sm:block">Escribinos directo</p>
                  </div>
                </a>

                <a
                  href={contact.instagram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 group"
                  style={{ background: '#0D2247', border: '1px solid #102E66' }}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-accent"
                    style={{ background: '#102E66' }}
                  >
                    <Instagram size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-white text-sm leading-none">Instagram</p>
                    <p className="text-white/40 text-xs mt-1 truncate hidden sm:block">{contact.instagram_user}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 group"
                  style={{ background: '#0D2247', border: '1px solid #102E66' }}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-accent"
                    style={{ background: '#102E66' }}
                  >
                    <Mail size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-white text-sm leading-none">Email</p>
                    <p className="text-white/40 text-xs mt-1 truncate hidden sm:block">{contact.email}</p>
                  </div>
                </a>
              </div>
            </ScrollReveal>

            {/* Formulario */}
            <ScrollReveal>
              <ContactForm
                coaches={coachesList}
                preselectedCoachName={preselectedCoach?.name}
              />
            </ScrollReveal>

          </div>
        </div>
      </section>
    </>
  )
}
