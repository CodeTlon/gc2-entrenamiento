import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

// Intercambia el código PKCE que Supabase incluye en el link del email
// por una sesión real guardada en cookies, y redirige al destino.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard/set-password'

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
