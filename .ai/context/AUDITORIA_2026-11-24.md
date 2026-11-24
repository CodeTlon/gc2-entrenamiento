# Auditoría GC² — hallazgos + plan de mejoras

## Context
Mateo pidió una auditoría completa del sistema (lógica, seguridad, SEO, performance, etc.), una opinión sobre migrar a Coolify vs quedarse en Vercel+Supabase, y oportunidades de meter IA. Se auditó en 3 frentes (seguridad/backend, frontend/SEO/perf/a11y, higiene de repo). El sitio está en **producción** → todo cambio va por rama (`/cambio`), nada de escrituras contra el Supabase de prod para "probar".

---

## Fase 0 — Bloqueantes antes de tocar código (hacer primero)
1. **`main` local divergió de `origin/main`** (1 adelante, 2 atrás: commit AGENTS.md duplicado + `75d5f14` fix canonical en remoto). Hay ~32 archivos modificados + 7 nuevos sin commitear (sesión SEO/a11y/seguridad coherente y completa). → `git stash`, `git reset --hard origin/main`, `git stash pop`, resolver conflictos, y commitear eso en una rama `/cambio`.
2. **Flujo de ramas inconsistente**: `dev` local/remoto está 34 commits atrás (línea Coolify abandonada); `.claude/commands/cambio.md` ramifica de `main`. → Definir `main` como base canónica; archivar `origin/dev` (tag `archive/dev-coolify`).
3. **`.env.local` apunta a Supabase de prod** (KNOWN_ISSUES crítico) y Playwright corre con ese env. → crear proyecto Supabase dev (o branch) antes de testear CRUD.
4. **Token `sbp_` y service-role en texto plano en disco** → rotar.
5. **Verificar en Supabase dashboard: "Enable sign-ups" = OFF.** Si está ON es crítico (ver S1).

## Fase 1 — Seguridad (alta prioridad)
| # | Problema | Fix |
|---|---|---|
| S1 | Todo usuario `authenticated` es admin (RLS `auth.role()='authenticated'`, `requireUser()` sin rol) | Tabla `admins` o claim `app_metadata.role`; usarlo en RLS (migración `013_admin_role.sql`) y en `requireUser()` |
| S2 | `contact_leads` acepta insert anon directo vía PostgREST (`001:25-27`) — bypassa Zod y rate limit | Dropear policy anon (la action ya usa service_role) + `check (char_length(...) < N)` |
| S3 | Edge function `supabase/functions/send-contact-email` sin auth, inyecta HTML sin escapar, código muerto | Borrar carpeta + `supabase functions delete` |
| S4 | Uploads: `ext` sale del filename sin sanitizar (path traversal `x.png/../../`), acepta SVG/HTML en bucket público (`settings.ts:103`, `client-upload.ts:22`) | Allowlist MIME→ext, regex `^[a-z0-9]{1,5}$`, rechazar svg/html; `allowed_mime_types` + `file_size_limit` en bucket |
| S5 | `uploadMediaAction` borra cualquier path que mande el cliente (`settings.ts:73-79`) | Limitar a `ALLOWED_UPLOAD_FOLDERS` |
| S6 | Login fallido llama `generateLink(recovery)` → invalida el link de reset del usuario real y revela si el email existe (`auth.ts:17-49`) | Quitar `emailExistsInAuth`, respuesta uniforme |
| S7 | Contacto: rate limit en memoria (inútil en serverless), sin honeypot, Zod sin `.max()`, `coach` fuera de schema, devuelve `success` aunque fallen DB y email | Honeypot + Turnstile, `.max()` por campo, error si fallan ambos, rate limit en Postgres/Upstash |
| S8 | `bodySizeLimit: '20mb'` global (incluye form público) | Bajar a 2mb (los uploads grandes ya van directo a Storage) |
| S9 | Server actions del dashboard sin Zod para URLs (`photo_url`, `video_url`, `site_settings` key/value arbitrarios) y errores de `post_categories`/`post_authors` ignorados (`posts.ts:81-89,123-135`) | Zod con `z.string().url()` https, enum de keys; chequear `error` |
| S10 | Sanitizer: `/^\//` deja pasar `//evil.com` (`sanitize.ts:43`); permite `style` | `/^\/(?!\/)/`, quitar `style` |
| S11 | Cookies de sesión no `httpOnly` + CSP `'unsafe-inline'` → XSS = robo de sesión | Signed upload URLs desde server action → `httpOnly`; CSP con nonce en `proxy.ts` |
| S12 | Menores: `getUser()` explícito en `leads/page.tsx`, `story/route.tsx`; rate limit en forgot-password; `.ilike` con `%` en chequeo de duplicados; slugs vacíos; `NaN` en `display_order`; unificar clientes service (`createSupabaseAdminClient` sin uso) + `import 'server-only'` | — |

## Fase 2 — Bugs de lógica / UX que pierden dinero o tráfico
- **CSP bloquea Google Maps** (`next.config.mjs` `frame-src` solo YouTube) → agregar `https://www.google.com`. Fix de 1 línea, alto impacto.
- **Form de contacto pierde todo lo tipeado al fallar validación** (`ContactForm.tsx` + `useActionState`) → devolver `values` en el state como `defaultValue`.
- **Lead perdido silenciosamente** si fallan DB + Resend (ver S7).
- **Editar el título de un post cambia el slug** → URL vieja da 404, rompe backlinks (`posts.ts:110-138`). → Slug editable y congelado al publicar.
- **Revalidación ISR incompleta**: `contact` settings solo revalida `/` (Navbar/Footer/WhatsApp de otras páginas quedan viejos 1h); delete de post no revalida `/blog/[slug]`; coaches no revalida AuthorCard. → `revalidatePath('/', 'layout')` donde aplique.
- `getCoaches()` devuelve coaches demo si la tabla está vacía también en el dashboard (ids falsos → editar falla).
- Botón "CONSULTAR" de planes abre WhatsApp sin contexto → `?text=Hola, quiero info del plan X`.
- `leads?page=abc` → NaN.

## Fase 3 — SEO
1. **Canonical de TODAS las páginas apunta al home** (`layout.tsx:39-41`) → el mayor problema SEO: Google puede desindexar `/planes`, `/blog/*`. Mover canonical a cada página/`generateMetadata`.
2. **Sitemap estático** (generado en build, nunca se actualiza) → `revalidate = 3600` + revalidar al publicar; usar `updated_at`; agregar `/privacidad`, `/terminos`.
3. Post: falta `BlogPosting` JSON-LD (reusar `src/components/ui/JsonLd.tsx`), OG `type: article`, twitter card, canonical.
4. `SportsOrganization` → `LocalBusiness` con NAP, geo, horarios desde `settings.contact`/`locations`.
5. OG propio en `/planes`, `/blog`, `/contacto`.
6. Blog paginado solo en cliente → paginar con `searchParams` + `<Link>` reales (crawlable).
7. Dominio `www` inconsistente: `public/llms.txt`, `auth.ts:71`, templates de email; verificar redirect URLs de Supabase Auth con `www`.
8. Footer sin links internos ni dirección; `lang="es-AR"`; FAQ/TL;DR hardcodean días de clase (leer de `group_classes`).

## Fase 4 — Performance
- **h1 del Hero con `.reveal` (opacity 0 hasta hidratar)** → LCP malo. Sacar el h1/CTAs del reveal.
- Preload manual duplicado del logo (`layout.tsx:120`) → quitar.
- Hero/MiniHero `quality={85}` bajo overlay 95% opaco → `quality={60}`.
- `/contacto` 100% dinámica por leer `searchParams` → leer `?coach` en cliente, ISR.
- Shimmer infinito en `.btn--primary` (repaint constante) → solo hover + `prefers-reduced-motion`.
- `React.cache()` en fetchers de `content.ts` y `getPost` (doble fetch metadata/page).
- Imágenes dentro del rich content sin `loading="lazy"`; YouTube → facade lite.
- `public/images/run.jpg` pesa 14MB → re-exportar ~300KB.
- `isomorphic-dompurify` mete jsdom en el server → medir tamaño de función / cold start.
- GA + cookie banner cargan en `/dashboard` → mover a `(public)/layout.tsx`.

## Fase 5 — Accesibilidad (WCAG)
- `.btn--primary`: texto blanco sobre `#38BDF8` ≈ 2.2:1 (CTA principal) → texto oscuro o gradiente más oscuro.
- Menú mobile cerrado sigue focusable; sin `aria-expanded`/Escape (Navbar + DashboardShell) → `inert`.
- ContactForm: labels sin `htmlFor`, sin `aria-invalid`/live regions/`autoComplete`.
- `<a>` de IG dentro de `<button>` en Coaches (HTML inválido).
- Íconos sin nombre accesible en `/contacto` mobile.
- Modal/ConfirmDialog sin focus trap ni retorno de foco; sin skip-link; sin `prefers-reduced-motion` global; textos `white/40` en 10-11px.
- Editor de posts no permite alt text en imágenes.

## Fase 6 — Ingeniería / calidad
- `npm run lint` roto (`next lint` no existe en Next 16, no hay config) → ESLint 9 flat + `eslint-config-next@16`, quitar override `glob`.
- `@types/react@18` con React 19 → `^19`; `@supabase/ssr` 0.5 → actual; TipTap → `^3.31.x` (1 high + 25 moderate).
- Agregar script `typecheck`, `engines.node: 22`, `.gitattributes` (CRLF).
- **Sin CI en `main`** → `ci.yml` (npm ci, typecheck, lint, build, Playwright smoke, audit) — recuperar de `origin/dev`.
- **Sin observabilidad** → `@vercel/speed-insights` + Sentry (o al menos alerta cuando falla el insert de leads).
- **Sin backups de DB** (Supabase free: sin PITR) → ver Fase 7.
- Tests: agregar Vitest para `sanitize.ts`, e2e del form de contacto (contra Supabase dev), login.
- Código muerto: `WhatsAppButton.tsx`, `getPlansByCategory`, `getAllPlans`, `cn`, `PHONE*`, `SITE_YEAR`, `createSupabaseAdminClient`; migraciones `008_*` duplicadas; `supabase gen types`.
- Dashboard: paginación/búsqueda en posts, estado/export CSV en leads, aviso de cambios sin guardar, campos SEO en posts.

---

## Fase 7 — ¿Coolify o quedarse en Vercel + Supabase?
**Recomendación: quedarse con Supabase sí o sí; Vercel depende del plan.**

- **Supabase → NO migrar.** El sistema depende de Auth (invites, recovery, `verifyOtp`), Storage con RLS y Postgres con RLS. Self-hostear Supabase en Coolify es mucho mantenimiento (Kong, GoTrue, Storage, Realtime) para un sitio de este tamaño, y ya hubo un intento de migración abandonado (`origin/dev`). Lo que sí falta es **backup**: usar el servidor Coolify solo como cron de `pg_dump` → B2 (la infra y la clave B2 ya existen, `/etc/backup/<proyecto>.env`, ver `codetlon-cloud/docs/BACKUPS.md`). Riesgo actual del free tier: pausa por inactividad (mitigado con keepalive) y sin PITR. Si el cliente crece, Supabase Pro (US$25/mes) antes que self-host.
- **Vercel → depende:**
  - Si está en **Hobby**: los términos de Vercel prohíben uso comercial en Hobby y este es un sitio comercial de un cliente. Ahí hay que elegir entre Vercel Pro (US$20/mes) o mover **solo el Next** a Coolify. En Coolify andan ISR, `@vercel/og` (corre en Node) y desaparece el límite de 4.5MB de body; se pierden preview deploys automáticos, CDN global y cero-ops.
  - Si ya está en **Pro** o el cliente lo paga: quedarse. El tráfico no justifica la complejidad.
- Conclusión práctica: backups a B2 desde Coolify ya; mover el frontend solo si Vercel Hobby es un problema de costo/ToS.

## Fase 8 — IA en el sistema (por ROI)
Usar API de Anthropic server-side (`ANTHROPIC_API_KEY` solo server, features detrás de `requireUser()`). Modelo por defecto `claude-haiku-5-5` (barato) y `claude-sonnet-5-5` para redacción larga.
1. **Asistente SEO en el editor de posts** (más ROI): botón que genera excerpt, meta title/description, slug sugerido, categorías sugeridas y **alt text de imágenes** (con visión). Ataca directo los huecos SEO y a11y de arriba. Costo: centavos por post.
2. **Caption + copy para Instagram** al exportar la Story (ya existe `story/route.tsx`): genera caption y hashtags en el tono del equipo.
3. **Triage de leads**: al entrar un lead, clasificar (disciplina, nivel, urgencia, coach sugerido) y proponer respuesta de WhatsApp lista para copiar en `/dashboard/leads`.
4. **"¿Qué plan me conviene?"** en `/planes`: un chat corto o un quiz con IA que usa planes y FAQ como contexto y termina en WhatsApp con el plan precargado. Mayor impacto en conversión pero requiere rate limit fuerte, Turnstile y tope de gasto. Hacerlo después de S7.
5. Opcional: `llms.txt` generado dinámicamente desde el CMS (AEO) en vez de estático.

---

## Orden sugerido de ejecución (sesiones `/cambio`)
1. Fase 0 (sync git + commitear lo pendiente + dev Supabase + chequear sign-ups).
2. Quick wins de 1 línea: CSP Maps, canonical por página, sitemap revalidate, `.reveal` del h1, contraste de `.btn--primary`.
3. Seguridad S1–S8 (migración `013` con admins + fix `contact_leads`).
4. Lógica/ISR (Fase 2) + SEO resto (Fase 3).
5. CI + lint + deps + observabilidad + backups B2.
6. a11y + perf restante.
7. IA: asistente SEO del editor → triage de leads → caption IG → recomendador de planes.

## Verificación
- `npm run build` + `npm run typecheck` + `eslint .` verdes.
- `npm run test:e2e` (45 smoke) contra **Supabase dev**, nunca prod.
- SEO: `curl` a `/planes`, `/blog/<slug>` y chequear `<link rel="canonical">` propio; `/sitemap.xml` incluye un post nuevo sin redeploy; Rich Results Test para BlogPosting/LocalBusiness.
- Seguridad: intentar `insert` en `contact_leads` con anon key → debe fallar; subir archivo `.svg`/`x.png/../a` → rechazado; login fallido no genera email de recovery.
- Perf/a11y: Lighthouse mobile en `/`, `/planes`, `/contacto` (meta: perf > 90, a11y > 90); mapa de sedes carga.
- IA: probar en Supabase dev, revisar costo por llamada en la consola de Anthropic.
