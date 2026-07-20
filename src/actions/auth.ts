'use server'

import { Resend } from 'resend'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export type SignInState = { error?: string } | undefined

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

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  redirect(next.startsWith('/dashboard') ? next : '/dashboard')
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/dashboard/login')
}

export type ForgotPasswordState = { error?: string; success?: boolean } | undefined

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email) return { error: 'Ingresá tu email.' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gc2entrenamientoderesistencia.com.ar'

  // Generamos el link con la Admin API (service role) y lo mandamos por Resend
  // en vez de supabase.auth.resetPasswordForEmail: el envío de emails de auth
  // de Supabase (free tier) tiene rate limit bajo y llega lento o a spam —
  // Resend ya es el proveedor que funciona para el resto del sitio (leads).
  // El link usa /auth/confirm (verifyOtp) porque, igual que un invite generado
  // desde el panel, no hay code_verifier en el navegador del usuario para
  // completar el flujo PKCE de /auth/callback (ver comentario en auth/confirm/route.ts).
  const admin = createSupabaseServiceClient()
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${siteUrl}/auth/confirm?next=/dashboard/set-password` },
  })

  // Siempre devolvemos success para no revelar si el email existe o no
  if (error || !data?.properties) {
    if (error) console.error('[forgotPassword] generateLink:', error.message)
    return { success: true }
  }

  const link = `${siteUrl}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&next=/dashboard/set-password`

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromName = process.env.RESEND_FROM_NAME || 'GC2 Entrenamiento'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: 'Recuperar contraseña — Dashboard GC²',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc;">
          <div style="background: #0A1628; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="color: #38BDF8; font-size: 1.5rem; margin: 0;">GC² Entrenamiento</h1>
            <p style="color: #93C5FD; margin: 4px 0 0;">Recuperar contraseña del panel</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px;">
            <p>Pediste recuperar tu contraseña del dashboard. Hacé click para crear una nueva:</p>
            <p style="margin: 24px 0;">
              <a href="${link}" style="background: #38BDF8; color: #0A1628; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Crear nueva contraseña</a>
            </p>
            <p style="color: #64748b; font-size: 13px;">Si no pediste esto, ignorá este email. El link expira en 1 hora.</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[forgotPassword] resend:', err)
  }

  return { success: true }
}
