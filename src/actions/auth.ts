'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export type SignInState = { error?: string; clearEmail?: boolean } | undefined

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/dashboard')

  if (!email || !password) {
    return { error: 'Ingresá email y contraseña.' }
  }

  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() })
  } catch {
    // Mismo texto siempre y se conserva el email: distinguir si la cuenta existe (clearEmail)
    // revelaba qué emails están registrados (hallazgo de la auditoría 2026-11-24).
    return { error: 'Email o contraseña incorrectos.' }
  }

  redirect(next.startsWith('/dashboard') && !next.startsWith('//') ? next : '/dashboard')
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() })
  redirect('/dashboard/login')
}

export type ForgotPasswordState = { error?: string; success?: boolean } | undefined

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email) return { error: 'Ingresá tu email.' }

  // Better Auth genera el token y llama a sendResetPassword (src/lib/auth.ts), que manda el mail
  // por Resend. Siempre devolvemos success para no revelar si el email existe.
  try {
    await auth.api.requestPasswordReset({ body: { email, redirectTo: '/dashboard/set-password' } })
  } catch (err) {
    console.error('[forgotPassword]', err instanceof Error ? err.message : err)
  }

  return { success: true }
}
