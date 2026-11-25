import type { NextRequest } from 'next/server'

// Detrás del proxy de Coolify (Traefik), `request.url` trae el host interno del
// contenedor (http://0.0.0.0:3000): redirigir con ese origin manda al usuario a una
// dirección inválida. Se usa la URL pública configurada o, si falta, los headers
// X-Forwarded-* que setea el proxy.
export function publicOrigin(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  return host ? `${proto}://${host}` : new URL(request.url).origin
}
