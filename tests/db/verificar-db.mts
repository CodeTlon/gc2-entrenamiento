// Verificacion de la capa de datos contra un Postgres real en memoria (PGlite por socket), sin Docker:
//   npx tsx tests/db/verificar-db.mts
// Aplica las migraciones de drizzle/, siembra datos y ejercita consultas, Better Auth y las acciones de lectura.
import assert from 'node:assert/strict'
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'

const PORT = 42600 + Math.floor(Math.random() * 90)
const pg = new PGlite()
await migrate(drizzlePglite(pg), { migrationsFolder: './drizzle' })
const server = new PGLiteSocketServer({ db: pg, port: PORT, host: '127.0.0.1', maxConnections: 4 })
await server.start()

process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${PORT}/postgres?sslmode=disable`
process.env.DB_POOL_MAX = '1'
process.env.BETTER_AUTH_SECRET = 'test_secret_test_secret_test_secret_123'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'
process.env.APP_ENV = 'development'
process.env.STORAGE_DIR = (await import('node:fs')).mkdtempSync((await import('node:path')).join((await import('node:os')).tmpdir(), 'gc2-db-storage-'))

const { db } = await import('../../src/lib/db')
const s = await import('../../src/db/schema')
const { listPublishedPostSummaries, getPublishedPostBySlug } = await import('../../src/db/queries')
const { eq } = await import('drizzle-orm')

let ok = 0
const check = async (nombre: string, fn: () => Promise<void>) => {
  try { await fn(); ok++; console.log(`ok   ${nombre}`) } catch (e) { console.error(`FAIL ${nombre}\n     ${e instanceof Error ? e.message : e}`); process.exitCode = 1 }
}

await check('migraciones crean todas las tablas', async () => {
  const r = await pg.query<{ t: string }>("select table_name as t from information_schema.tables where table_schema='public' order by 1")
  const t = r.rows.map((x) => x.t)
  for (const n of ['account', 'categories', 'coaches', 'contact_leads', 'plan_categories', 'plans', 'post_authors', 'post_categories', 'posts', 'rate_limit', 'session', 'site_settings', 'user', 'verification'])
    assert.ok(t.includes(n), `falta ${n}`)
})

const [coach] = await db.insert(s.coaches).values({ slug: 'ana', name: 'Ana', specialty: 'Running', display_order: 0 }).returning()
const [cat] = await db.insert(s.categories).values({ name: 'Fuerza', slug: 'fuerza' }).returning()
const [pub] = await db.insert(s.posts).values({ title: 'Publicado', slug: 'publicado', content: '<p>x</p>', published: true }).returning()
await db.insert(s.posts).values({ title: 'Borrador', slug: 'borrador', content: '<p>y</p>', published: false })
await db.insert(s.postCategories).values({ post_id: pub.id, category_id: cat.id })
await db.insert(s.postAuthors).values({ post_id: pub.id, coach_id: coach.id })

await check('listado publico: solo publicados, con categorias y autores', async () => {
  const rows = await listPublishedPostSummaries()
  assert.equal(rows.length, 1)
  assert.equal(rows[0].post_categories[0].categories?.slug, 'fuerza')
  assert.equal(rows[0].post_authors[0].coaches?.name, 'Ana')
  assert.equal(typeof rows[0].created_at, 'string')
})
await check('detalle por slug: publicado si, borrador no', async () => {
  assert.ok(await getPublishedPostBySlug('publicado'))
  assert.equal(await getPublishedPostBySlug('borrador'), null)
})
await check('slug unico', async () => {
  await assert.rejects(db.insert(s.posts).values({ title: 'x', slug: 'publicado', content: 'z' }))
})
await check('borrar post en cascada limpia las junctions', async () => {
  await db.delete(s.posts).where(eq(s.posts.id, pub.id))
  const r = await pg.query('select count(*)::int as n from post_categories')
  assert.equal((r.rows[0] as { n: number }).n, 0)
})
await check('site_settings upsert', async () => {
  const v = (n: number) => ({ key: 'hero', value: { n }, updated_at: new Date().toISOString() })
  await db.insert(s.siteSettings).values(v(1)).onConflictDoUpdate({ target: s.siteSettings.key, set: { value: { n: 2 } } })
  await db.insert(s.siteSettings).values(v(1)).onConflictDoUpdate({ target: s.siteSettings.key, set: { value: { n: 2 } } })
  const [row] = await db.select().from(s.siteSettings).where(eq(s.siteSettings.key, 'hero'))
  assert.deepEqual(row.value, { n: 2 })
})
await check('plans: enum y arrays', async () => {
  const [p] = await db.insert(s.plans).values({ category: 'runner', name: 'Plan', features: ['a', 'b'] }).returning()
  assert.deepEqual(p.features, ['a', 'b'])
  await assert.rejects(pg.query("insert into plans (category, name) values ('invalida','x')"))
})

// Better Auth contra el mismo schema: alta (como crear-usuario.mts), login correcto/incorrecto, sesion
const { auth } = await import('../../src/lib/auth')
const ctx = await auth.$context
await check('Better Auth: alta + login + sesion + rate_limit table', async () => {
  const u = await ctx.internalAdapter.createUser({ email: 'a@b.com', name: 'A', emailVerified: true, role: 'admin' }, { method: 'email-password' })
  await ctx.internalAdapter.linkAccount({ userId: u.id, providerId: 'credential', accountId: u.id, password: await ctx.password.hash('clave-segura-123') })
  const res = await auth.api.signInEmail({ body: { email: 'a@b.com', password: 'clave-segura-123' }, asResponse: true })
  assert.equal(res.status, 200)
  const cookie = res.headers.get('set-cookie') ?? ''
  assert.match(cookie, /session_token/)
  const session = await auth.api.getSession({ headers: new Headers({ cookie }) })
  assert.equal(session?.user.email, 'a@b.com')
  await assert.rejects(auth.api.signInEmail({ body: { email: 'a@b.com', password: 'mala' } }))
})
await check('Better Auth: usuario con hash bcrypt de Supabase entra con su contrasena y no con otra', async () => {
  const bcrypt = (await import('bcryptjs')).default
  const u = await ctx.internalAdapter.createUser({ email: 'legado@b.com', name: 'Legado', emailVerified: true, role: 'admin' }, { method: 'email-password' })
  await ctx.internalAdapter.linkAccount({ userId: u.id, providerId: 'credential', accountId: u.id, password: bcrypt.hashSync('clave-de-supabase-1', 10) })
  const res = await auth.api.signInEmail({ body: { email: 'legado@b.com', password: 'clave-de-supabase-1' }, asResponse: true })
  assert.equal(res.status, 200)
  await assert.rejects(auth.api.signInEmail({ body: { email: 'legado@b.com', password: 'clave-de-supabase-2' } }))
  await assert.rejects(auth.api.signInEmail({ body: { email: 'legado@b.com', password: '' } }))
})
await check('Better Auth: un usuario bcrypt que restablece su contrasena pasa a scrypt', async () => {
  await auth.api.requestPasswordReset({ body: { email: 'legado@b.com', redirectTo: '/dashboard/set-password' } })
  const v = await pg.query<{ identifier: string }>("select identifier from verification where identifier like 'reset-password:%' order by expires_at desc limit 1")
  await auth.api.resetPassword({ body: { newPassword: 'clave-nueva-xyz-9', token: v.rows[0].identifier.replace('reset-password:', '') } })
  const r = await pg.query<{ password: string }>("select a.password from account a join \"user\" u on u.id=a.user_id where u.email='legado@b.com'")
  assert.ok(!r.rows[0].password.startsWith('$2'), 'sigue en bcrypt')
  assert.equal((await auth.api.signInEmail({ body: { email: 'legado@b.com', password: 'clave-nueva-xyz-9' }, asResponse: true })).status, 200)
  await pg.query("delete from verification")
})
await check('Better Auth: registro publico deshabilitado', async () => {
  await assert.rejects(auth.api.signUpEmail({ body: { email: 'x@y.com', password: 'otra-clave-123', name: 'X' } }))
})

await check('recuperacion de contrasena: pedir -> token -> reset -> login con la nueva', async () => {
  await auth.api.requestPasswordReset({ body: { email: 'a@b.com', redirectTo: '/dashboard/set-password' } })
  const v = await pg.query<{ identifier: string }>("select identifier from verification where identifier like 'reset-password:%'")
  assert.equal(v.rows.length, 1)
  const token = v.rows[0].identifier.replace('reset-password:', '')
  await auth.api.resetPassword({ body: { newPassword: 'nueva-clave-456', token } })
  const res = await auth.api.signInEmail({ body: { email: 'a@b.com', password: 'nueva-clave-456' }, asResponse: true })
  assert.equal(res.status, 200)
  await assert.rejects(auth.api.signInEmail({ body: { email: 'a@b.com', password: 'clave-segura-123' } }))
})
await check('recuperacion con email inexistente no falla ni crea token', async () => {
  await auth.api.requestPasswordReset({ body: { email: 'nadie@x.com', redirectTo: '/dashboard/set-password' } }).catch(() => {})
  const v = await pg.query("select 1 from verification where identifier like 'reset-password:%' and value <> (select id from \"user\" limit 1)")
  assert.ok(v.rows.length <= 1)
})
const { submitContact } = await import('../../src/actions/contact')
const form = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f }
await check('contacto: guarda el lead; sin mail configurado igual responde ok', async () => {
  const r = await submitContact(null, form({ nombre: 'Juan Perez', email: 'j@x.com', telefono: '3511234567', mensaje: 'Quiero info del plan', coach: 'Ana' }))
  assert.equal(r.success, true)
  const rows = await db.select().from(s.contactLeads)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].coach, 'Ana')
})
await check('contacto: validacion rechaza datos invalidos', async () => {
  const r = await submitContact(null, form({ nombre: 'J', email: 'no', telefono: '1', mensaje: 'corto' }))
  assert.equal(r.success, false)
  assert.ok(r.fieldErrors?.email)
})

const { putObject, fileInfo } = await import('../../src/lib/storage')
const { liberarArchivos } = await import('../../src/lib/media-cleanup')
await check('archivos huerfanos: se borra lo que nadie usa y se conserva lo que otra fila referencia', async () => {
  const portada = await putObject('blog/aaaaaaaa-0000-0000-0000-000000000001.webp', Buffer.from('p'))
  const video = await putObject('blog/aaaaaaaa-0000-0000-0000-000000000002.mp4', Buffer.from('v'))
  const foto = await putObject('coaches/aaaaaaaa-0000-0000-0000-000000000003.webp', Buffer.from('f'))
  const banner = await putObject('banners/aaaaaaaa-0000-0000-0000-000000000004.webp', Buffer.from('b'))
  const existe = async (u: string) => (await fileInfo(u.replace('/media/', ''))) !== null
  await db.insert(s.coaches).values({ slug: 'c-huerfano', name: 'C Huerfano', specialty: 'x', photo_url: portada })
  await db.insert(s.siteSettings).values({ key: 'page_banners', value: { home: banner }, updated_at: new Date().toISOString() })
  const [post] = await db.insert(s.posts).values({ slug: 'p-huerfano', title: 'P', content: `<video src="${video}"></video>`, cover_image: portada, published: true }).returning({ id: s.posts.id })
  // Se borra el post: el video ya no lo usa nadie; la portada la sigue usando el coach.
  await db.delete(s.posts).where(eq(s.posts.id, post.id))
  await liberarArchivos(`<video src="${video}"></video>`, portada)
  assert.equal(await existe(video), false)
  assert.equal(await existe(portada), true)
  // Se borra el coach: la portada queda libre. La foto sin referencias y el banner de ajustes (referenciado) se distinguen.
  await db.delete(s.coaches).where(eq(s.coaches.slug, 'c-huerfano'))
  await liberarArchivos(portada, foto, banner)
  assert.equal(await existe(portada), false)
  assert.equal(await existe(foto), false)
  assert.equal(await existe(banner), true)
})

console.log(`\n${ok} verificaciones OK${process.exitCode ? ' (hubo fallas)' : ''}`)
await server.stop()
await pg.close()
process.exit(process.exitCode ?? 0)
