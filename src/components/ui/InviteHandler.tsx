'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Detecta tokens de invitación de Supabase en el hash de la URL raíz
// y redirige a la página de creación de contraseña.
export default function InviteHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token') && hash.includes('type=invite')) {
      router.replace('/dashboard/set-password' + hash)
    }
  }, [router])

  return null
}
