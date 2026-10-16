# ARCHITECTURE — GC² Entrenamiento

Estado vigente al 2026-10-16. Mapa de cambios por tipo de tarea: `ARCHITECTURE.md` (raiz). Este archivo es la vista estable para agentes.

## Capas
- **Next.js 16.4.2** (App Router, RSC por defecto, Turbopack), React 19.3.1, TypeScript 6 estricto (`@/* -> src/*`). Tailwind 4.3.3 con tokens en `@theme` (`src/app/globals.css`).
- **Server-first**: paginas y secciones son Server Components salvo estado o efectos (Navbar, Hero parallax, ScrollProgress, ScrollReveal, ContactForm, CoachModal, DashboardShell, formularios del panel).
- **Server Actions** (`src/actions/*.ts`) para todas las mutaciones, firma `(prevState, formData) => Promise<State>`. La autorizacion es `requireUser()` (`src/lib/session.ts`) en cada accion; no hay RLS.
- **Datos**: PostgreSQL + Drizzle (`src/db/schema.ts`, `src/db/queries.ts`, migraciones SQL en `drizzle/`, se aplican al arrancar con `scripts/migrate.mjs` y fallan cerrado).
- **Auth**: Better Auth (`src/lib/auth.ts`, handler `src/app/api/auth/[...all]/`). Hashes bcrypt importados de Supabase valen tal cual; los nuevos usan scrypt. No hay registro publico: los usuarios los crea `scripts/crear-usuario.mts`.
- **Archivos**: volumen del servidor (`STORAGE_DIR`, `/data/storage` en el contenedor), servidos por `/media/[...ruta]`; subida por `POST /api/upload` en streaming (sesion + origen + tipo + tamano). Videos: servicio global de compresion (`src/lib/transcode.ts`, soft-fail).
- **Mail**: Resend por `src/lib/mail.ts`, con sandbox obligatorio fuera de produccion (`APP_ENV`, `MAIL_SANDBOX_TO`).
- **`@vercel/og`** (Satori) genera el PNG 1080x1920 del Story de Instagram, en un route handler del servidor. Es solo una libreria: la app **no** corre en Vercel.
- **Auth gate**: `src/proxy.ts` (Next 16, antes `middleware.ts`) hace el redirect optimista de `/dashboard/:path*`; la validacion real esta en el layout del panel y en cada accion.

## Despliegue
Todo en Coolify con `docker-compose.coolify.yml`: servicios `app` (imagen Docker, Next standalone, puerto 3000) y `db` (Postgres, sin puerto publicado), volumenes `db_data` y `storage`. Un recurso por entorno (`gc2-test`, `gc2-prod`). Detalle: `ENVIRONMENTS.md` y `docs/environments.md`.
`main` sigue desplegando la version anterior en Vercel + Supabase hasta el corte (`docs/produccion-coolify.md`); es una situacion de transicion, no la arquitectura objetivo.

## Modelo de datos (resumen; reglas en `DOMAIN.md`)
`contact_leads`, `posts`, `categories`, `post_categories` (N:N, fuente de verdad del filtro de blog), `post_authors` (N:N), `site_settings` (JSONB por seccion del home), `coaches`, `plans`, `plan_categories`, mas las tablas de Better Auth.

## Integraciones externas
Resend (mail), Google Analytics opcional (Consent Mode v2 + banner de cookies), servicio global de transcode de video, Backblaze B2 (backup del VPS; `docs/BACKUPS.md`).
