import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

// Allowlist: solo redirects internos a /dashboard. `next` viene de un query param que
// cualquiera puede armar a mano — sin validarlo, `next=@evil.com/x` concatenado en
// `${origin}${next}` se parsea como userinfo y termina redirigiendo a evil.com (open
// redirect) justo después de un exchange de sesión válido.
function safeNext(next: string | null, fallback: string): string {
  if (next && next.startsWith('/dashboard') && !next.startsWith('//')) return next
  return fallback
}

// Intercambia el código PKCE que Supabase incluye en el link del email
// por una sesión real guardada en cookies, y redirige al destino.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'), '/dashboard/set-password')

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Link inválido o expirado
  return NextResponse.redirect(`${origin}/dashboard/login?error=link-invalido`)
}
