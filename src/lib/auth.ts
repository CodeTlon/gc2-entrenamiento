import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/lib/db'
import * as schema from '@/db/schema'
import { sendMail } from '@/lib/mail'

const siteUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const auth = betterAuth({
  baseURL: siteUrl,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    // Solo entran usuarios dados de alta por un admin (scripts/crear-usuario.ts): sin registro público.
    disableSignUp: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      // Sin await: evita revelar por timing si el email existe.
      void sendMail({
        to: user.email,
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
              <a href="${url}" style="background: #38BDF8; color: #0A1628; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Crear nueva contraseña</a>
            </p>
            <p style="color: #64748b; font-size: 13px;">Si no pediste esto, ignorá este email. El link expira en 1 hora.</p>
          </div>
        </div>`,
      })
    },
  },
  // El rol lo asigna solo el servidor: input:false impide que el cliente lo envíe.
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user', input: false },
    },
  },
  plugins: [nextCookies()], // siempre el último plugin
})
