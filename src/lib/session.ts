import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

// Valida la sesión en el servidor (cookie firmada + fila en `session`). El proxy solo hace un
// redirect optimista: la seguridad real está acá, en cada página/acción del dashboard.
export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function requireUser() {
  const user = await getUser()
  if (!user) throw new Error('No autenticado.')
  return user
}
