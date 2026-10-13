# ARCHITECTURE — GC² Entrenamiento

> **Actualización 2026-10-13 (feature/dev2-backend-propio, aún sin mergear a main):** Supabase fue reemplazado por Postgres (Drizzle) + Better Auth + S3/R2. Donde este archivo mencione Supabase, RLS, `supabase-server.ts`, `/auth/callback` o `/auth/confirm`, ver `ARCHITECTURE.md` (raíz) y `docs/environments.md`. Producción sigue en Supabase hasta el corte.


## Capas

- **Next.js 16 App Router**, RSC por defecto, Turbopack. React 19. TypeScript estricto (`@/* → src/*`).
- **Server-first**: páginas/secciones son Server Components salvo estado/efectos (Navbar, Hero parallax, ScrollProgress, ScrollReveal, ContactForm, CoachModal, DashboardShell, formularios del panel).
- **Server Actions** (`src/actions/*.ts`) para todas las mutaciones — firma `(prevState, formData) => Promise<State>`.
- **Supabase**: Postgres (contenido + leads), Auth (sesión del dashboard), Storage (bucket `media`).
- **Resend**: envío de emails (contacto, recovery de contraseña).
- **`@vercel/og`** (Satori): genera PNG 1080x1920 para export a Instagram Story, corre server-side (route handler) para evitar CORS con `*.supabase.co`.
- **Auth gate**: `src/proxy.ts` (antes `middleware.ts`, renombrado por Next 16) protege `/dashboard/:path*` — matchea toda la rama incluidos los route groups `(panel)`/`(auth)` porque no aparecen en la URL.

## Cadena de deploy real (Fase 0 — verificada, no asumida)

**FACT** — Evidencia recolectada directamente de config/archivos locales:

- `.vercel/project.json` existe y está linkeado a un proyecto Vercel real (`projectName: "gc2-entrenamiento"`), gitignoreado.
- No existe `vercel.json` en el repo (sin overrides de build/rutas).
- El único workflow en `.github/workflows/` es `supabase-keepalive.yml` (cron cada 3 días, sólo hace un `curl` a la REST API de Supabase para evitar que el free tier pause el proyecto) — **no es un pipeline de deploy**.
- `package.json` no tiene ningún script de deploy (`dev`/`build`/`start`/`lint`/`test:e2e` únicamente).
- `git remote -v` → `origin` es `github.com/CodeTlon/gc2-entrenamiento.git`.
- `docs/deployment-guide.md` y `docs/maintenance-guide.md` describen explícitamente "Import from GitHub" en Vercel + "commit y push → Vercel re-deploya automáticamente".

**Conclusión (confianza alta)**: el deploy es **automático vía la integración Git nativa de Vercel** al pushear a `main` — no es un `vercel deploy` manual ni un pipeline de CI/CD propio.

**Límite explícito de esta verificación**: los archivos locales NO pueden confirmar que el toggle de "Git Integration" siga activo en el dashboard de Vercel hoy, ni que la rama de producción configurada ahí siga siendo `main`, ni que nadie haya pausado el auto-deploy después. Esa configuración vive sólo en el dashboard/API de Vercel — queda como **UNKNOWN**, verificable únicamente ahí (no re-verificar contra prod sin necesidad real).

## Entornos (Fase 0 — verificado)

**FACT** — archivos `.env*` que existen hoy en disco:

| Archivo | Trackeado en git | Contenido |
|---|---|---|
| `.env.example` | Sí | placeholders vacíos |
| `.env.local.example` | Sí | placeholders (`YOUR-PROJECT`, etc.) |
| `.env.local` | No (gitignoreado, `.env*.local`) | valores reales de producción (Supabase, Resend, dominio real) |
| `.env.supabase.local` | No (gitignoreado) | credenciales de un proyecto Supabase **dev** distinto + token de Management API |

No existen `.env.production`, `.env.development` ni `.env.staging` en disco. No hay branching por ambiente en `next.config.mjs` (el único condicional por `NODE_ENV` en todo `src/` es `cookieOptions.secure`).

**FACT — split dev/prod diseñado pero no activo en `main`**: existe `scripts/db-sync-dev.mjs` (trackeado, con guard de seguridad que rechaza correr si el proyecto Supabase destino no termina en `-dev`) y `docs/environments.md`, que describe un diseño completo de dos ambientes (`main`→Vercel Production→Supabase prod; `dev`→Vercel Preview→Supabase dev). **Ese archivo sólo existe en la rama `dev` de GitHub** (`origin/dev`, commit `1b8d645`, 2026-06-14), **nunca mergeada a `main`** (`git merge-base --is-ancestor origin/dev origin/main` → not merged) y con ~3 meses de atraso respecto a `main`. Ningún doc en `main` (`ARCHITECTURE.md` raíz, `.claude/CLAUDE.md`, `docs/*.md`) menciona este split.

**Ver `KNOWN_ISSUES.md` (severidad CRÍTICA)** para el hallazgo de que `.env.local` de este workstation aparenta apuntar al proyecto de producción en vez de al ref dev dedicado que sí existe en `.env.supabase.local`.

## Modelo de datos (resumen — detalle de reglas en `DOMAIN.md`)

Tablas: `contact_leads`, `posts`, `categories`, `post_categories` (N:N), `post_authors` (N:N), `site_settings`, `coaches`, `plans`, `plan_categories`. RLS: lectura pública en contenido, escritura sólo `authenticated`, excepto `contact_leads` (service-role). Storage: bucket `media`.

## Integraciones externas

Supabase (DB/Auth/Storage), Resend (email), Google Analytics (opcional, gated por Consent Mode v2 + banner de cookies), Vercel (hosting + `@vercel/og`).
