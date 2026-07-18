# GC² Entrenamiento — Project Context

> **Contexto de sesión para Claude Code.**
> Al iniciar: leer este archivo + `ARCHITECTURE.md` + `TASKS.md`. Ir directo al cambio (leé SOLO lo que indica ARCHITECTURE.md, no el repo entero).
> Sesión de mantenimiento: `/cambio "<tema>"` abre la rama; cada prompt commitea ahí (sin coautor, sin tocar main); `/cerrar` mergea/pushea/tagea cuando lo pidas.
> Al cerrar: fila(s) en el **Changelog del README.md (raíz)** + fila en Historial de Cambios acá. Si hubo cambios estructurales (rutas, tablas, deps, convenciones, env) → editar la sección correspondiente + ARCHITECTURE.md en el mismo commit.

---

## Qué es

Sitio web oficial de **GC² Entrenamiento de la Resistencia** (Córdoba, AR): equipo de entrenamiento para corredores, duatletas y triatletas. Incluye un sitio público y un dashboard administrativo (CMS interno) para editar todo el contenido sin tocar código.

Producto desplegado en Vercel. Dominio: `gc2entrenamientoderesistencia.com.ar`.

## Stack

- **Next.js 16** (App Router, RSC por defecto, Turbopack) — `next` ^16.2.1
- **React 19** — `react` ^19.2.4
- **TypeScript** estricto, alias `@/* → src/*`
- **Tailwind CSS 3** — escala de colores y tokens definidos en `tailwind.config.ts`
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) — Postgres + Auth + Storage (bucket `media`)
- **Resend** — envío de emails del formulario de contacto
- **Zod** — validación de inputs en server actions
- **lucide-react** — iconos
- **slugify** — generación de slugs de blog
- **sharp** — optimización de imágenes (Next/Image)
- **@vercel/og** (Satori) — genera la imagen de export a Instagram Story de un post (1080x1920)
- **Playwright** — tests e2e (`tests/`, `playwright.config.ts`)

Tipografías: **Barlow** (body) y **Barlow Condensed** (headings) vía `next/font`.

## Estructura de carpetas

```
src/
  app/
    (public)/                # Rutas públicas (route group)
      layout.tsx             # Layout público (Navbar/Footer/etc.)
      page.tsx               # Home
      planes/
        page.tsx             # Server: fetch de plans/categorías
        PlanesContent.tsx    # Client: grid + estado del modal "más información"
      contacto/page.tsx
      privacidad/page.tsx
      terminos/page.tsx
      blog/
        page.tsx             # Listado con filtro por categoría
        [slug]/              # Detalle (con AuthorCard, PDF adjunto, video propio o YouTube)
        BlogList.tsx         # Client component con paginación y filtros
    auth/
      callback/              # Exchange PKCE (?code) → sesión en cookies (recovery desde el navegador)
      confirm/               # verifyOtp (token_hash) → invites del panel y links sin code_verifier
    dashboard/               # CMS protegido
      (auth)/
        login/               # Login
      (panel)/               # Layout con sidebar (DashboardShell)
        layout.tsx
        page.tsx             # Home / stats
        error.tsx            # Error boundary de sección — mantiene el sidebar montado
        DashboardShell.tsx   # Sidebar + topbar (client)
        contenido/           # Editor de site_settings
          hero/  nosotros/  disciplinas/  clases-grupales/  galeria/
        entrenadores/        # CRUD coaches  (page, [id], nuevo, CoachForm)
        planes/              # CRUD plans    (page, [id], nuevo, PlanForm)
          categorias/        # CRUD plan categories (page, [id], nuevo)
        blog/                # CRUD posts    (page, [id] con export a Instagram Story, nuevo, PostForm)
        categorias/          # CRUD blog categories (page, [id], nuevo)
        contacto/            # Editor settings de contacto
    layout.tsx               # Root layout (fuentes, metadata, JSON-LD, GA)
    error.tsx                # Error boundary del árbol bajo el layout raíz (sitio público, auth)
    global-error.tsx         # Boundary si el root layout mismo crashea (define su propio <html>/<body>)
    globals.css              # Tailwind + componentes utilitarios (.btn, .plan-card, .field-input, etc.)
    robots.ts  sitemap.ts
  proxy.ts                   # Antes "middleware.ts" — auth gate de /dashboard (renombrado por Next 16)
  components/
    ui/                      # Navbar, Footer, Modal, ScrollProgress, ScrollReveal, WhatsAppButton, GoogleAnalytics
    sections/                # Hero, About, Disciplines, Coaches, CoachModal, PlanModal, GroupClasses, TeamGallery, ContactForm
    dashboard/               # Field (incl. FileUpload), PageHeader, SaveButton, DeleteButton, Skeleton (UI compartida del panel)
  actions/                   # Server actions ('use server')
    auth.ts  contact.ts  coaches.ts  plans.ts  posts.ts  settings.ts
    categories.ts            # CRUD categorías de blog
    plan-categories.ts       # CRUD categorías de planes
  lib/
    supabase.ts              # Clientes browser/anon y service-role (no SSR)
    supabase-server.ts       # createSupabaseServerClient (cookies SSR) + admin client
    content.ts               # Tipos + getters (getSiteSettings, getCoaches, getPlans*) con FALLBACKs
    constants.ts             # Datos hardcodeados de fallback (coaches, planes, contacto, imágenes)
    youtube.ts               # Helper para embeds de YouTube en posts
    upload-limits.ts         # Límites de tamaño por mime (imagen/PDF/video) — uploadMediaAction y FileUpload
    client-upload.ts         # uploadDirectToStorage: sube al bucket `media` desde el browser, bypass del Server Action
    utils.ts
supabase/
  migrations/
    001_contact_leads.sql
    002_blog_posts.sql
    003_editorial.sql        # site_settings, coaches, plans + RLS + bucket `media` + seed
    004_categories.sql       # categorías de blog (tabla `categories`)
    005_plan_categories.sql  # categorías de planes (tabla `plan_categories`, col `plan_category_id` en `plans`)
    006_posts_coach.sql      # columna `coach_id` en `posts` → FK a `coaches`
    007_post_categories.sql  # tabla N:N `post_categories` (post_id, category_id) — multi-categoría por post
    008_post_authors.sql     # tabla N:N `post_authors` (post_id, coach_id) — multi-coach por post
    008_seed_locations.sql   # seed de `site_settings.locations` (sedes)
    009_contact_leads_coach.sql  # columna `coach` en `contact_leads`
    010_post_authors_auth_write.sql  # fix RLS: post_authors solo tenía policy de escritura para service_role
    011_plans_description.sql        # columna `description_long` en `plans` (modal "más información")
    012_posts_attachments.sql        # columnas `attachment_url` (PDF) y `video_url` (video propio) en `posts`
docs/                        # Documentación adicional (README, deployment, technical-docs, maintenance)
public/images/               # Assets estáticos
tests/                       # Playwright e2e
```

## Modelo de datos (Supabase)

- **`contact_leads`** — leads del formulario de contacto del sitio público.
- **`posts`** — artículos de blog (`title`, `slug`, `excerpt`, `content`, `cover_image`, `youtube_url`, `video_url` *(video propio, alternativa a youtube_url)*, `attachment_url` *(PDF adjunto)*, `published`, `author_id`, `coach_id` FK→coaches, `category_id` FK→categories *(legacy, no se actualiza desde el form)*, `created_at`, `updated_at`).
- **`categories`** — categorías de blog (`name`, `slug`, `display_order`).
- **`post_categories`** — junction N:N entre `posts` y `categories` (`post_id`, `category_id`). Es la fuente de verdad: el form del dashboard borra y re-inserta filas acá; el listado público filtra por `post_categories.categories.slug`.
- **`site_settings`** — clave/valor JSON con todos los textos editables del home (`hero`, `about`, `disciplines`, `group_classes`, `team_gallery`, `contact`).
- **`coaches`** — equipo de entrenadores (slug, nombre, especialidad, bio, foto, IG, certificaciones, logros, servicios, `display_order`).
- **`plans`** — planes (`category` ∈ `runner | triathlon | group`, `plan_category_id` FK→plan_categories, `name`, `name_display`, `badge`, `features[]`, `featured`, `display_order`, `description_long` *(texto del modal "más información")*).
- **`plan_categories`** — categorías de planes (`name`, `slug`, `display_order`).
- **Storage:** bucket `media` para imágenes subidas desde el dashboard.

**RLS:** lectura pública en todas las tablas de contenido; escritura solo para usuarios `authenticated`. El dashboard depende de Supabase Auth. Todas las tablas escriben vía `createSupabaseServerClient()` (rol `authenticated`, RLS real) salvo `contact_leads` (lee/escribe con el cliente `service_role`, ver `src/actions/contact.ts` y `dashboard/leads/page.tsx`) — cuando agregues una tabla nueva escrita desde el dashboard, la policy de escritura tiene que ser para `authenticated`, no solo `service_role` (bug real: `010_post_authors_auth_write.sql` arregló justo esto en `post_authors`).

## Patrones y convenciones

- **Server-first:** páginas y secciones son **Server Components** salvo que necesiten estado/efectos (Navbar, Hero parallax, ScrollProgress, ScrollReveal, ContactForm, CoachModal, DashboardShell, formularios del panel).
- **Server Actions** (`src/actions/*.ts`) para todas las mutaciones. Firma estándar: `(prevState, formData) => Promise<State>`. Usan `useFormState` + `useFormStatus` desde `react-dom`.
- **Fallbacks de contenido:** `src/lib/content.ts` siempre devuelve datos. Si Supabase no responde o las env vars son placeholder, usa `FALLBACK_*` desde `src/lib/constants.ts`. **No romper esta cadena**: el sitio tiene que renderizar aunque no haya DB.
- **Auth gate:** `src/proxy.ts` (antes `middleware.ts`) protege `/dashboard/**`. Se renombró a `proxy.ts` por Next 16.
- **Estilos:** Tailwind + componentes utilitarios en `globals.css` (`.btn`, `.btn--primary`, `.plan-card`, `.field-input`, `.section-title`, `.gradient-text`, `.reveal`, etc.). Paleta `blue-900..blue-100` + `accent` (`#38BDF8`). Spacing custom: `section`, `gap-sm/md/lg/xl`.
- **Imágenes:** siempre `next/image`. AVIF + WebP, `sharp` instalado. Remote patterns: `images.unsplash.com` y `*.supabase.co`. **Subida desde el dashboard:** `uploadMediaAction` (`src/actions/settings.ts`) optimiza con sharp antes de guardar — resize a 2000px máx, conversión a WebP q=82, EXIF rotation aplicada y metadata stripped. SVG y GIF se suben tal cual. Límites por mime en `src/lib/upload-limits.ts` (imagen 20MB, PDF 10MB, video 60MB).
- **PDF / video propio (posts):** `uploadMediaAction` pasa por un Server Action, y Vercel corta el body real en ~4.5MB antes de llegar al chequeo de tamaño — muy por debajo de los límites de PDF/video. Por eso `FileUpload` (`src/components/dashboard/Field.tsx`) usa `uploadDirectToStorage` (`src/lib/client-upload.ts`, `createBrowserClient` de `@supabase/ssr`) para subir directo al bucket `media` desde el navegador, bypasseando el Server Action. La policy RLS de `storage.objects` ya acepta `insert` de `authenticated` (`003_editorial.sql`), no requiere cambios de storage.
- **Export a Instagram Story:** `src/app/dashboard/(panel)/blog/[id]/story/route.tsx` genera un PNG 1080x1920 con `@vercel/og` (`ImageResponse`) a partir del post — corre 100% server-side para evitar CORS al leer la portada desde `*.supabase.co`.
- **SEO:** metadata + JSON-LD `SportsOrganization` en `src/app/layout.tsx`. `sitemap.ts` y `robots.ts` en App Router. Redirects 301 desde URLs `.php` legacy en `next.config.mjs`.
- **i18n:** todo en español (es_AR). Mantenelo así.
- **Comentarios en código:** los archivos del proyecto usan comentarios en español cuando son necesarios. No agregar comentarios obvios.

## Variables de entorno

Definidas en `.env.local` (ver `.env.example`):

| Var | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente Supabase (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase anónimo |
| `SUPABASE_SERVICE_ROLE_KEY` | Cliente admin (solo server) |
| `RESEND_API_KEY` | Envío de emails |
| `RESEND_FROM_NAME` / `RESEND_FROM_EMAIL` | Remitente |
| `COMPANY_EMAIL` | Destino de leads |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (opcional) |
| `NEXT_PUBLIC_SITE_URL` | Base URL para metadata (opcional) |

Si faltan/son placeholder, `content.ts` cae a fallbacks y el sitio sigue funcionando (sin persistir leads ni mandar emails).

## Scripts

- `npm run dev` — Next dev (Turbopack)
- `npm run build` — build prod
- `npm run start` — server prod
- `npm run lint` — ESLint
- `npm run test:e2e` / `test:e2e:ui` — Playwright

## Notas históricas / contexto

- Migración fiel desde un sitio **PHP+SCSS** anterior. La paleta y la tipografía vienen 1:1 de los SCSS originales. Hay redirects 301 de las viejas URLs `.php`.
- **Next 16 + React 19**: ya se hizo el rename `middleware.ts → proxy.ts` y se silenciaron warnings de dev (commits `176d91b`, `853be79`).
- El dashboard (commits `d7c36ad`, `5546bf5`, `1871c3c`) es relativamente nuevo: shell + editores de site content + CRUD de coaches/planes/blog con upload de imágenes y embed de YouTube.

---

## Historial de Cambios
| Fecha | Rama | Cambio |
|-------|------|--------|
| 2026-07-18 | feat/planes-modal-ig-story-blog-media | v1.3.0 — **Modal de planes**: `plans.description_long` (`011_plans_description.sql`) + `PlanModal.tsx` (patrón `CoachModal`/`Modal.tsx` genérico) + botón "Más información" en `PlanesContent.tsx` (extraído de `planes/page.tsx`, que ahora solo hace fetch). **Export a Instagram Story**: nueva dep `@vercel/og`; `dashboard/blog/[id]/story/route.tsx` genera un PNG 1080x1920 (título + portada + branding) server-side (evita CORS con `*.supabase.co`); botón "Exportar a Instagram" en el `PageHeader` de la edición de post. **PDF y video propio en posts**: `posts.attachment_url`/`video_url` (`012_posts_attachments.sql`); `FileUpload` (`Field.tsx`) sube directo al bucket `media` desde el browser vía `uploadDirectToStorage` (`client-upload.ts`, `createBrowserClient`) — bypassea el Server Action porque Vercel corta el body real en ~4.5MB, muy por debajo de los límites de PDF/video; la RLS de `storage.objects` ya permitía ese insert `authenticated`, sin migración de storage. **Límites de upload más generosos y por tipo** (antes 12MB fijo para todo): `src/lib/upload-limits.ts` (imagen 20MB, PDF 10MB, video 60MB) consumido por `uploadMediaAction` y `FileUpload`; `next.config.mjs` `bodySizeLimit` 15mb→20mb. Build verde + 45/45 E2E. |
| 2026-07-11 | chore/security-headers-loading-states | v1.2.1 — Baseline de seguridad + perf percibida. **Headers** en `next.config.mjs` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`). **Fix RLS**: `post_authors` solo tenía policy de escritura para `service_role` — el dashboard escribe coautores de posts con el cliente de sesión (`authenticated`), así que los `insert`/`delete` fallaban silenciosamente bajo RLS (el código no revisaba el error de esa llamada puntual); migración `010_post_authors_auth_write.sql` agrega la policy que faltaba, mismo patrón que `post_categories`. **Fix open redirect**: `/auth/callback` y `/auth/confirm` redirigían a `${origin}${next}` sin validar `next` — un valor tipo `next=@evil.com/x` se parsea como userinfo y termina afuera del dominio justo después de un exchange de sesión válido; ahora `next` solo se acepta si empieza con `/dashboard` (mismo allowlist que ya usaba `signInAction`). **CORS**: revisado — no hay `app/api/**/route.ts`; las rutas `auth/callback` y `auth/confirm` no setean headers CORS (same-origin por default), sin cambios. **Progressive loading**: nuevo primitivo `Skeleton` (`src/components/dashboard/Skeleton.tsx`, mismo API que el `Skeleton` de shadcn/ui — el proyecto no tiene shadcn instalado) aplicado a los `loading.tsx` de nivel sección (`(panel)/`, `blog/`, `entrenadores/`, `planes/`, `categorias/`, `contacto/`, `contenido/`, `leads/`); ya existían `loading.tsx` para todas las subrutas de una sesión previa, no se tocaron los anidados (`nuevo/`, `[id]/`). Nuevos `error.tsx` (raíz y `dashboard/(panel)/`, este último mantiene el sidebar montado) + `global-error.tsx` (root layout). Build verde. Pendiente (fuera de este alcance, no tocado): el form de contacto sigue sin rate-limit/honeypot. |
| 2026-06-21 | feat/cookie-consent | v1.2.0 — Cookies: `GoogleAnalytics.tsx` con `consent default 'denied'` (Consent Mode v2, respeta `localStorage` `gc2_cookie_consent`) + nuevo `src/components/ui/CookieConsent.tsx` (banner sin deps, opt-in, link a `/privacidad`) montado en el root layout. GA arranca denegado y solo trackea tras "Aceptar"; el banner solo aparece si hay `GA_ID` real. Privacidad/términos ya existían. Build verde. |
| 2026-06-19 | fix/coaches-image-sizes | v1.1.7 — fix "fotos de coaches se rompen con 4 entrenadores". El grid ya pasaba a 2x2 capado en 460px (commits `6573643`/`8a019c1`) pero el `sizes` del `<Image>` en `Coaches.tsx` seguía hardcodeado en `33vw` (lg) → Next/Image elegía un candidato del srcset que no matcheaba el ancho real (460px) y la foto se veía borrosa/"rota". Nuevo helper `adaptiveImageSizes(count)` en `responsive-grid.ts` (espeja la lógica de columnas/cap de `adaptiveFlexItemClass`); `Coaches.tsx` lo consume. Build verde + 45/45 E2E |
| 2026-06-14 | chore/e2e-rehab | v1.1.5 — E2E rehecho: `tests/e2e/landing.spec.ts` pasó de 87 tests CMS-dependientes (stale, 83/87 rojos con Supabase dev vacío) a smoke resiliente (15×3 viewports: render sin 500 vía footer, navbar, auth-gate, redirects .php, SEO/robots/sitemap, 404). `playwright.config.ts`: mobile/tablet en Chromium (sin WebKit), reporter `list`. 45/45 verde |
| 2026-06-14 | chore/next16-vuln-patch | v1.1.4 — seguridad: `overrides: { glob: "10.5.0" }` (3 vulns HIGH cadena `eslint-config-next`, dev/lint-only) + piso `next ^16.2.9`. audit 5(3 high)→2 moderate (postcss-en-Next). Pendiente eventual: eslint 8→9 + eslint-config-next 16 |
| — | main | v1.0.0 — entrega inicial (migración legacy PHP+SCSS + dashboard CMS) |
| 2026 | main | Migración a Next 16 + React 19 (`middleware.ts` → `proxy.ts`) |
| 2026 | main | Migraciones 008 (post_authors / seed locations) + 009 (contact_leads_coach); sedes con merge inteligente, cards uniformes + mapa colapsable |
| 2026-06-05 | fix/invite-verificando-link | v1.1.3 — invite con `verifyOtp` (`/auth/confirm`) resuelve "Verificando link…" infinito; `set-password` con timeout; template email invite en `docs/` |
| 2026-06-02 | feat/reset-password-flow | v1.1.0 — flujo de recuperación de contraseña (`/dashboard/forgot-password`, `forgotPasswordAction`); manual del dashboard (`docs/manual-dashboard.html`) |
| 2026-06-02 | fix/proxy-forgot-password-route | v1.1.1 — fix: proxy bloqueaba `/dashboard/forgot-password` para usuarios sin sesión |
| 2026-06-02 | fix/set-password-pkce-flow | v1.1.2 — fix PKCE recovery: `/auth/callback` exchange + `set-password` con `createBrowserClient`; template email en `docs/supabase-email-recovery.html` |
<!-- Agregar fila al finalizar cada sesión de mantenimiento -->

---

## Cómo actualizar este archivo

Cuando hagas un cambio de código, antes de cerrar la respuesta:

- ¿Agregaste/borraste rutas? → actualizá la sección **Estructura de carpetas**.
- ¿Tocaste el schema (migration nueva, columna nueva, tabla nueva)? → actualizá **Modelo de datos**.
- ¿Agregaste deps o cambiaste versiones mayores? → actualizá **Stack**.
- ¿Cambiaste una convención (renombre de carpeta, nuevo patrón de server action, nuevo helper compartido)? → actualizá **Patrones y convenciones**.
- ¿Agregaste env vars? → actualizá **Variables de entorno**.
- Si es un cambio chico que no altera nada de lo de arriba, **no hace falta tocar el archivo**.
---

## Módulos de la fábrica — consultar en `/cambio` según lo que toques

Estos módulos viven en `codetlon-cloud/.claude/modules/` (desde este repo: `../../codetlon-cloud/.claude/modules/`). NO están copiados acá: leé el que aplique al iniciar una sesión de mantenimiento que toque cada tema.

| Si el `/cambio` toca… | Módulo a leer |
|---|---|
| deps / vulnerabilidades (`npm audit`, actualizar libs, upgrade de major) | `security-maintenance.md` |
| auth / DB / RLS / route handler / form / env / secrets (seguridad de **código**) | `security-owasp.md` |
| UI / componentes / forms / páginas (accesibilidad WCAG, Lighthouse a11y > 90) | `accessibility.md` |
| pipeline / `.github/workflows` / Dockerfile / env vars (CI = gate de calidad) | `ci-cd.md` |
| dejar el proyecto live / incidente en producción (monitoreo) | `observability.md` |

Regla: leer SOLO el módulo que la tarea pide (disciplina de tokens), no todos por las dudas.
