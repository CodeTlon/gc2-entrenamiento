/**
 * Correo por entorno (estándar CodeTlon: .claude/modules/entornos.md → "Correo en test").
 *
 *  - APP_ENV=test        → SIEMPRE sandbox: todo mail va a MAIL_SANDBOX_TO (estándar: codetloncordoba+prueba@gmail.com)
 *                          y el destinatario original queda en el asunto. Sin MAIL_SANDBOX_TO no se envía nada.
 *  - APP_ENV=production  → sale normal; se NIEGA si hay MAIL_SANDBOX_TO o si el remitente es onboarding@resend.dev.
 *  - otro / sin definir  → pasa tal cual (con MAIL_SANDBOX_TO redirige igual).
 *
 * Cargar las variables SIN COMILLAS en Coolify/GitHub (se toman literalmente; con comillas Resend responde 501).
 * `limpiarValorEnv` las quita igual como red de seguridad.
 */
export interface MailSandboxInput {
  appEnv?: string;
  sandboxTo?: string;
  from: string;
  to: string[];
  subject: string;
}

const REMITENTE_DE_PRUEBAS = 'onboarding@resend.dev';

export function limpiarValorEnv(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const v = value.trim();
  if (v.length >= 2 && (v[0] === '"' || v[0] === "'") && v[v.length - 1] === v[0]) return v.slice(1, -1).trim();
  return v;
}

export function resolverDestinoMail(input: MailSandboxInput): { to: string[]; subject: string } {
  const appEnv = (input.appEnv ?? '').trim().toLowerCase();
  const sandboxTo = (input.sandboxTo ?? '').trim();

  if (appEnv === 'production') {
    if (sandboxTo) throw new Error('MAIL_SANDBOX_TO está definida en producción: configuración de test filtrada a prod.');
    if (input.from.toLowerCase().includes(REMITENTE_DE_PRUEBAS)) {
      throw new Error(`Producción no puede enviar desde el remitente de pruebas (${REMITENTE_DE_PRUEBAS}).`);
    }
    return { to: input.to, subject: input.subject };
  }
  if (appEnv === 'test' && !sandboxTo) {
    throw new Error('APP_ENV=test requiere MAIL_SANDBOX_TO: no se envía mail desde test sin sandbox.');
  }
  if (sandboxTo) return { to: [sandboxTo], subject: `[TEST → ${input.to.join(', ')}] ${input.subject}` };
  return { to: input.to, subject: input.subject };
}

export async function sendMail(args: { to: string; subject: string; html: string; replyTo?: string }): Promise<boolean> {
  const apiKey = limpiarValorEnv(process.env.RESEND_API_KEY);
  const from = limpiarValorEnv(process.env.RESEND_FROM_EMAIL);
  if (!apiKey || !from) return false;
  const destino = resolverDestinoMail({
    appEnv: process.env.APP_ENV,
    sandboxTo: limpiarValorEnv(process.env.MAIL_SANDBOX_TO),
    from,
    to: [args.to],
    subject: args.subject,
  });
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: destino.to,
      subject: destino.subject,
      html: args.html,
      ...(args.replyTo ? { reply_to: args.replyTo } : {}),
    }),
  });
  return res.ok;
}
