import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface ContactPayload {
  nombre: string
  email: string
  telefono: string
  ciudad?: string
  servicio?: string
  objetivo?: string
  mensaje: string
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload: ContactPayload = await req.json()
    const { nombre, email, telefono, ciudad, servicio, objetivo, mensaje } = payload

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const COMPANY_EMAIL = Deno.env.get('COMPANY_EMAIL') ?? 'gc2entrenamiento@gmail.com'
    const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'
    const FROM_NAME = Deno.env.get('RESEND_FROM_NAME') ?? 'GC2 Entrenamiento'

    if (!RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY')
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc;">
        <div style="background: #0A1628; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="color: #38BDF8; font-size: 1.5rem; margin: 0;">GC² Entrenamiento</h1>
          <p style="color: #93C5FD; margin: 4px 0 0;">Nueva consulta desde la web</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px;">
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          ${ciudad ? `<p><strong>Ciudad:</strong> ${ciudad}</p>` : ''}
          ${servicio ? `<p><strong>Disciplina:</strong> ${servicio}</p>` : ''}
          ${objetivo ? `<p><strong>Objetivo:</strong> ${objetivo}</p>` : ''}
          <hr style="border: 1px solid #e2e8f0; margin: 16px 0;" />
          <p><strong>Mensaje:</strong></p>
          <p style="white-space: pre-wrap; color: #475569;">${mensaje}</p>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [COMPANY_EMAIL],
        reply_to: email,
        subject: `Nueva Consulta: ${servicio ?? 'General'} — ${nombre}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend error: ${err}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
