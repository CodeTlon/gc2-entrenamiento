'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db'
import { contactLeads } from '@/db/schema'
import { sendMail } from '@/lib/mail'

// Rate limiting simple en memoria por IP, sin dependencias nuevas (mismo patrón que
// codetlon-site/src/app/actions/contact.ts). No es distribuido (cada instancia/lambda
// tiene su propio Map), pero corta el caso común de un script/bot golpeando el form
// repetidas veces y agotando la cuota de envíos de Resend. Ventana fija: 5 envíos
// cada 10 minutos por IP.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

async function isRateLimited(): Promise<boolean> {
  let headersList: Headers
  try {
    headersList = await headers()
  } catch {
    // Fuera de un request (scripts y tests de la base) no hay IP que limitar.
    return false
  }
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'

  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true
  }

  entry.count += 1
  return false
}

const contactSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingresá tu nombre completo (mínimo 2 caracteres)').max(120, 'Nombre demasiado largo'),
  email: z.string().trim().email('Ingresá un email válido, ej: nombre@ejemplo.com').max(200),
  telefono: z.string().trim().min(8, 'Ingresá un teléfono válido con código de área (mínimo 8 dígitos)').max(40, 'Teléfono demasiado largo'),
  ciudad: z.string().max(120).optional(),
  servicio: z.string().max(120).optional(),
  objetivo: z.string().max(300).optional(),
  coach: z.string().max(120).optional(),
  mensaje: z.string().trim().min(10, 'Contanos un poco más: el mensaje debe tener al menos 10 caracteres').max(5000, 'El mensaje es demasiado largo (máximo 5000 caracteres)'),
})

const FIELDS = ['nombre', 'email', 'telefono', 'ciudad', 'servicio', 'objetivo', 'coach', 'mensaje'] as const

export type ContactState = {
  success: boolean
  error: string | null
  fieldErrors?: Record<string, string[]>
  // Se devuelven al form para repoblarlo si falla (React 19 resetea el form tras la action).
  values?: Record<string, string>
}

export async function submitContact(
  prevState: unknown,
  formData: FormData
): Promise<ContactState> {
  // Honeypot: un humano nunca ve ni completa este campo. Respondemos éxito para no darle señal al bot.
  if (String(formData.get('website') ?? '').trim() !== '') {
    return { success: true, error: null }
  }

  const raw: Record<string, string> = {}
  for (const k of FIELDS) raw[k] = String(formData.get(k) ?? '').slice(0, 6000)

  if (await isRateLimited()) {
    return {
      success: false,
      error: 'Hiciste demasiados envíos en poco tiempo. Probá de nuevo en unos minutos.',
      values: raw,
    }
  }

  const parsed = contactSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Por favor completá los campos obligatorios.',
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: raw,
    }
  }

  const data = parsed.data
  const coach = data.coach || null
  let savedToDb = false
  let emailSent = false

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  // El subject del email interpola nombre/servicio/coach tal cual los mandó el
  // usuario del form público — sin esto, un \r\n dentro de esos campos podría
  // inyectar headers de email si la API de Resend no los sanitiza internamente
  // (defensa en profundidad, header injection).
  function stripHeaderInjection(s: string): string {
    return s.replace(/[\r\n]+/g, ' ').trim()
  }

  // Guardar el lead en la base
  try {
    await db.insert(contactLeads).values({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      ciudad: data.ciudad || null,
      servicio: data.servicio || null,
      objetivo: data.objetivo || null,
      mensaje: data.mensaje,
      coach,
    })
    savedToDb = true
  } catch (err) {
    // No cortamos: intentamos igual el email.
    console.error('DB error:', err)
  }

  // Email vía Resend (sendMail aplica el sandbox de correo en APP_ENV=test)
  try {
    const toEmail = process.env.COMPANY_EMAIL || 'gc2entrenamiento@gmail.com'

    emailSent = await sendMail({
      to: toEmail,
      replyTo: data.email,
      subject: `Nueva Consulta${coach ? ` — ${stripHeaderInjection(coach)}` : ''}: ${stripHeaderInjection(data.servicio || 'Consulta General')} — ${stripHeaderInjection(data.nombre)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc;">
          <div style="background: #0A1628; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="color: #38BDF8; font-size: 1.5rem; margin: 0;">GC² Entrenamiento</h1>
            <p style="color: #93C5FD; margin: 4px 0 0;">Nueva consulta desde la web</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px;">
            ${coach ? `<p style="background:#EFF6FF;padding:10px 14px;border-radius:8px;border-left:4px solid #38BDF8;margin-bottom:16px;"><strong>Consulta dirigida a:</strong> ${esc(coach)}</p>` : ''}
            <p><strong>Nombre:</strong> ${esc(data.nombre)}</p>
            <p><strong>Email:</strong> ${esc(data.email)}</p>
            <p><strong>Teléfono:</strong> ${esc(data.telefono)}</p>
            ${data.ciudad ? `<p><strong>Ciudad:</strong> ${esc(data.ciudad)}</p>` : ''}
            ${data.servicio ? `<p><strong>Disciplina:</strong> ${esc(data.servicio)}</p>` : ''}
            ${data.objetivo ? `<p><strong>Objetivo:</strong> ${esc(data.objetivo)}</p>` : ''}
            <hr style="border: 1px solid #e2e8f0; margin: 16px 0;" />
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap; color: #475569;">${esc(data.mensaje)}</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Mail error:', err)
  }

  // Si no se guardó ni se envió, el lead se perdería sin que nadie se entere: avisamos al usuario.
  if (!savedToDb && !emailSent) {
    return {
      success: false,
      error: 'No pudimos enviar tu consulta. Probá de nuevo en unos minutos o escribinos por WhatsApp.',
      values: raw,
    }
  }

  return { success: true, error: null }
}
