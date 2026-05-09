import WhatsAppIcon from './WhatsAppIcon'

export default function WhatsAppButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center
        text-white transition-all duration-300 hover:-translate-y-1"
      style={{
        background: '#25D366',
        boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
      }}
    >
      <WhatsAppIcon size={28} />
    </a>
  )
}
