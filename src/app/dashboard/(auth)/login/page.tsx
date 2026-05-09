import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Acceso',
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const next = params.next ?? '/dashboard'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{ background: 'radial-gradient(circle at top, #0D2247 0%, #0A1628 60%)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 md:p-10"
        style={{
          background: '#0D2247',
          border: '1px solid #102E66',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div className="mb-8 text-center">
          <p
            className="text-accent text-xs font-body font-bold uppercase mb-2"
            style={{ letterSpacing: '2.5px' }}
          >
            Panel privado
          </p>
          <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl uppercase leading-tight">
            GC<span className="gradient-text">²</span> Dashboard
          </h1>
          <p className="text-white/45 text-sm mt-3">
            Accedé con tus credenciales para editar el sitio.
          </p>
        </div>

        <LoginForm next={next} />
      </div>
    </div>
  )
}
