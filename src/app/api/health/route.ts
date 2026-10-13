import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

// Usado por el healthcheck de Coolify y por el uptime check externo.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await db.execute(sql`select 1`)
    return Response.json({ status: 'ok' })
  } catch {
    return Response.json({ status: 'db_error' }, { status: 503 })
  }
}
