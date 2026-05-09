import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'radial-gradient(circle at top, #0D2247 0%, #0A1628 60%)' }}
    >
      <div className="text-center max-w-md">
        <p
          className="font-heading font-black text-accent mb-2"
          style={{ fontSize: 'clamp(5rem, 20vw, 9rem)', lineHeight: 1, opacity: 0.15 }}
        >
          404
        </p>
        <h1
          className="font-heading font-black uppercase text-white -mt-6 mb-4 relative z-10"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', letterSpacing: '-1px' }}
        >
          PÁGINA NO <span className="gradient-text">ENCONTRADA</span>
        </h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          La página que buscás no existe o fue movida.
        </p>
        <Link
          href="/"
          className="btn btn--primary uppercase tracking-widest text-sm font-extrabold"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
