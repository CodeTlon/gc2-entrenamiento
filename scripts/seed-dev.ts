// Datos mínimos para la base de dev local (descartable). NUNCA correr contra test/prod:
// ahí los datos vienen de scripts/migracion (dump saneado) o de la propia operación.
import { db } from '../src/lib/db'
import { planCategories, categories } from '../src/db/schema'

if (process.env.APP_ENV && process.env.APP_ENV !== 'development') {
  console.error(`seed-dev solo corre con APP_ENV=development (actual: ${process.env.APP_ENV})`)
  process.exit(1)
}

await db.insert(planCategories).values([
  { name: 'Corredores', slug: 'runner', display_order: 0 },
  { name: 'Triatletas', slug: 'triathlon', display_order: 1 },
  { name: 'Grupal', slug: 'group', display_order: 2 },
]).onConflictDoNothing()
await db.insert(categories).values([{ name: 'Entrenamiento', slug: 'entrenamiento', display_order: 0 }]).onConflictDoNothing()
console.log('Seed de dev aplicado.')
process.exit(0)
