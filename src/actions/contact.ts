'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { contactLeads } from '@/db/schema'
import { sendMail } from '@/lib/mail'

const contactSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  ciudad: z.string().optional(),
  servicio: z.string().optional(),
  objetivo: z.string().optional(),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

export type ContactState = {
  success: boolean
  error: string | null
  fieldErrors?: Record<string, string[]>
}

export async function submitContact(
  prevState: unknown,
  formData: FormData
): Promise<ContactState> {
  const coach = (formData.get('coach') as string) || null

  const raw = {
    nombre: formData.get('nombre') as string,
    email: formData.get('email') as string,
    telefono: formData.get('telefono') as string,
    ciudad: formData.get('ciudad') as string,
    servicio: formData.get('servicio') as string,
    objetivo: formData.get('objetivo') as string,
    mensaje: formData.get('mensaje') as string,
  }

  const parsed = contactSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Por favor completá los campos obligatorios.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = parsed.data

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  // Guardar el lead en la base
  let leadSaved = false
  try {
    await db.insert(contactLeads).values({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      ciudad: data.ciudad || null,
      servicio: data.servicio || null,
      objetivo: data.objetivo || null,
      mensaje: data.mensaje,
      coach: coach || null,
    })
    leadSaved = true
  } catch (err) {
    // No fallamos: igual intentamos mandar el email
    console.error('DB error:', err)
  }

  // Email vía Resend (sendMail aplica el sandbox de correo en APP_ENV=test)
  let mailSent = false
  try {
    const toEmail = process.env.COMPANY_EMAIL || 'gc2entrenamiento@gmail.com'

    mailSent = await sendMail({
      to: toEmail,
      replyTo: data.email,
      subject: `Nueva Consulta${coach ? ` — ${coach}` : ''}: ${data.servicio || 'Consulta General'} — ${data.nombre}`,
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
    // Falló el email pero la base pudo guardar: igual devolvemos success
  }

  // Si no se guardó ni se envió nada, no le decimos al usuario que salió bien.
  if (!leadSaved && !mailSent) {
    return {
      success: false,
      error: 'No pudimos enviar tu consulta. Intentá de nuevo en unos minutos o escribinos por WhatsApp.',
    }
  }

  return { success: true, error: null }
}
