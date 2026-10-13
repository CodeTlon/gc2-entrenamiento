import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import * as schema from '@/db/schema'
import { sendMail } from '@/lib/mail'

const siteUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Orígenes aceptados además de baseURL (previews de Vercel, dominios extra). Coma-separados.
const trustedOrigins = [
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '').split(',').map((o) => o.trim()),
  process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
].filter((o): o is string => !!o)

export const auth = betterAuth({
  baseURL: siteUrl,
  trustedOrigins,
  // En serverless la memoria no se comparte entre instancias: el límite vive en la base (tabla rate_limit).
  // Activo solo en producción por defecto de Better Auth; en test/prod real corre con NODE_ENV=production.
  rateLimit: {
    storage: 'database',
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 300, max: 5 },
      '/request-password-reset': { window: 600, max: 3 },
      '/reset-password': { window: 600, max: 5 },
    },
  },
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    // Solo entran usuarios dados de alta por un admin (scripts/crear-usuario.ts): sin registro público.
    disableSignUp: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    // Las contraseñas nuevas usan el hash por defecto de Better Auth (scrypt). Los usuarios traídos de Supabase conservan su
    // hash bcrypt ($2a$/$2b$/$2y$) y siguen entrando con la misma contraseña; al restablecerla pasan a scrypt.
    password: {
      hash: hashPassword,
      verify: ({ hash, password }) =>
        /^\$2[aby]\$/.test(hash) ? bcrypt.compare(password, hash) : verifyPassword({ hash, password }),
    },
    sendResetPassword: async ({ user, url }) => {
      // Sin await: evita revelar por timing si el email existe. El .catch evita un rechazo no manejado
      // (sendMail lanza ante config inválida, ej. MAIL_SANDBOX_TO en producción).
      sendMail({
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
      }).catch((err) => console.error('[sendResetPassword]', err instanceof Error ? err.message : err))
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
