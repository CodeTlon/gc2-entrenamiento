// Aplica las migraciones de drizzle/ contra DATABASE_URL. Corre al arrancar el contenedor (docker-entrypoint.sh):
// idempotente (drizzle registra lo aplicado) y fail-closed: si falla, el proceso termina con error y la app no arranca.
// En la imagen se empaqueta a un solo archivo con esbuild (scripts/migrate.mjs); en local: npx tsx scripts/migrate.mts
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL.')
  process.exit(1)
}

const pool = new Pool({ connectionString: url, max: 1 })
try {
  await migrate(drizzle({ client: pool }), { migrationsFolder: process.env.MIGRATIONS_DIR ?? './drizzle' })
  console.log('Base al día.')
} catch (e) {
  console.error('Error aplicando migraciones:', e instanceof Error ? e.message : e)
  process.exit(1)
} finally {
  await pool.end()
}
