import { createSupabaseServerClient } from '@/lib/supabase-server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Verifica el token_hash de los links de email (invite, recovery, signup…) vía
// verifyOtp. A diferencia de /auth/callback (flujo PKCE con ?code), esto funciona
// para invites generados desde el panel de Supabase: ese link no tiene un
// code_verifier en el navegador del usuario, por lo que exchangeCodeForSession
// nunca podría completarse y la pantalla quedaba en "Verificando link…".
// Allowlist: solo redirects internos a /dashboard (ver misma protección en
// auth/callback/route.ts — mismo riesgo de open redirect vía `next`).
function safeNext(next: string | null, fallback: string): string {
  if (next && next.startsWith('/dashboard') && !next.startsWith('//')) return next
  return fallback
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNext(searchParams.get('next'), '/dashboard/set-password')

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Link inválido o expirado
  return NextResponse.redirect(`${origin}/dashboard/login?error=link-invalido`)
}
