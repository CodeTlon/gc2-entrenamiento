'use server'

import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { Resend } from 'resend'

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

  // Save to Supabase
  try {
    const supabase = createSupabaseServiceClient()
    const { error: dbError } = await supabase.from('contact_leads').insert({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      ciudad: data.ciudad || null,
      servicio: data.servicio || null,
      objetivo: data.objetivo || null,
      mensaje: data.mensaje,
    })

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      // Don't fail — try to send email anyway
    }
  } catch (err) {
    console.error('DB error:', err)
  }

  // Send email via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromName = process.env.RESEND_FROM_NAME || 'GC2 Entrenamiento'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const toEmail = process.env.COMPANY_EMAIL || 'gc2entrenamiento@gmail.com'

    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      replyTo: data.email,
      subject: `Nueva Consulta${coach ? ` — ${coach}` : ''}: ${data.servicio || 'Consulta General'} — ${data.nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc;">
          <div style="background: #0A1628; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="color: #38BDF8; font-size: 1.5rem; margin: 0;">GC² Entrenamiento</h1>
            <p style="color: #93C5FD; margin: 4px 0 0;">Nueva consulta desde la web</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px;">
            ${coach ? `<p style="background:#EFF6FF;padding:10px 14px;border-radius:8px;border-left:4px solid #38BDF8;margin-bottom:16px;"><strong>Consulta dirigida a:</strong> ${coach}</p>` : ''}
            <p><strong>Nombre:</strong> ${data.nombre}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Teléfono:</strong> ${data.telefono}</p>
            ${data.ciudad ? `<p><strong>Ciudad:</strong> ${data.ciudad}</p>` : ''}
            ${data.servicio ? `<p><strong>Disciplina:</strong> ${data.servicio}</p>` : ''}
            ${data.objetivo ? `<p><strong>Objetivo:</strong> ${data.objetivo}</p>` : ''}
            <hr style="border: 1px solid #e2e8f0; margin: 16px 0;" />
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap; color: #475569;">${data.mensaje}</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Resend error:', err)
    // Email failed but DB may have saved — still return success
  }

  return { success: true, error: null }
}
