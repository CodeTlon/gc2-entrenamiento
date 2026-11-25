import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(URL, ANON, {
    // Fuerza Secure en prod (Vercel solo sirve por HTTPS) — @supabase/ssr no lo
    // setea por default. httpOnly queda en su default (false): el dashboard usa
    // createBrowserClient (src/lib/client-upload.ts) para subir archivos grandes
    // directo a Storage, y necesita leer la cookie de sesión desde el browser.
    cookieOptions: { secure: process.env.NODE_ENV === 'production' },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Server Component sin permisos para escribir; el middleware se encarga.
        }
      },
    },
  })
}

export function createSupabaseAdminClient() {
  return createClient(URL, SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
