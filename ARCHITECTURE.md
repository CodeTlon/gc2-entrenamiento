# ARCHITECTURE — GC² Entrenamiento

Mapa para mantenimiento. **No releas el repo entero**: buscá tu tipo de cambio acá y abrí solo esos archivos. El detalle fino (estructura completa, modelo de datos, convenciones) vive en `.claude/CLAUDE.md`.

## Stack
**Next.js 16** (App Router, RSC, Turbopack) · React 19 · TS strict · Tailwind 3 (Barlow + Barlow Condensed) · PostgreSQL en Coolify + Drizzle ORM · Better Auth · S3-compatible (Cloudflare R2) · Resend (vía `src/lib/mail.ts`) · `@vercel/og` (Satori, export de posts a Instagram Story) · Vercel. Alias `@/*` → `src/*`. Dominio: `gc2entrenamientoderesistencia.com.ar`.

## Route Groups
- `src/app/(public)/` — público (home, planes, blog + `[slug]`, contacto, privacidad, terminos)
- `src/app/api/auth/[...all]/` — handler de Better Auth; `src/app/api/upload/` — URL firmada para subida directa a S3 (solo autenticados); `src/app/api/health/` — healthcheck con `select 1`
- `src/app/auth/confirm/` — verifica `token_hash` vía `verifyOtp` (invites del panel y cualquier link sin code_verifier en el browser)
- `src/app/dashboard/(auth)/login/` — login
- `src/app/dashboard/(auth)/forgot-password/` — solicitud de reset de contraseña
- `src/app/dashboard/(auth)/set-password/` — formulario para elegir contraseña nueva (post-recovery y post-invite)
- `src/app/dashboard/(panel)/` — CMS protegido (contenido, entrenadores, planes, blog, categorías, contacto)

## Para cambios comunes, leé solo esto

| Querés cambiar… | Abrí |
|-----------------|------|
| Textos de una sección del home | Es JSONB en `site_settings` → editor en `dashboard/(panel)/contenido/<seccion>/` + tipos/getters en `src/lib/content.ts` |
| Datos de páginas públicas | `src/lib/content.ts` (getters + fallbacks). Fallbacks hardcodeados en `src/lib/constants.ts` |
| Una mutación (coach, plan, post, categoría, settings) | `src/actions/*.ts` (firma `(prevState, formData)`) |
| Formulario de contacto | `src/components/sections/ContactForm.tsx` + `src/actions/contact.ts` |
| Auth gate del dashboard | `src/proxy.ts` (redirect optimista por cookie, no es seguridad) + validación real en el layout del panel y `requireUser()` de `src/lib/session.ts` en cada acción |
| Flujo de recovery de contraseña | `forgotPasswordAction` en `src/actions/auth.ts` → `auth.api.requestPasswordReset` → `sendResetPassword` en `src/lib/auth.ts` (mail por Resend) → link de Better Auth → `set-password?token=…` → `authClient.resetPassword` |
| Cache/ISR de páginas públicas | `export const revalidate = 3600` en el `page.tsx` de home, `/blog`, `/blog/[slug]` y `/planes` |
| Insertar video propio en el cuerpo de un post | Nodo custom de TipTap `InlineVideo` en `PostForm.tsx` + `uploadDirectToStorage` (mismo bypass que PDF/video adjunto) → límite `MAX_INLINE_VIDEO_BYTES` (15MB, más chico que el de "video propio" del post) en `src/lib/upload-limits.ts` |
| Flujo de invite de usuario | No hay invites ni registro público: `scripts/crear-usuario.mts` da de alta (contraseña temporal) y el usuario la cambia con "Olvidé mi contraseña" |
| Upload de imágenes del CMS | `uploadMediaAction` en `src/actions/settings.ts` (sharp: resize 2000px, WebP q82) → bucket `media`. Límites por mime en `src/lib/upload-limits.ts` (imagen 20MB, PDF 10MB, video 60MB) |
| Adjuntar PDF o video propio a un post | `FileUpload` en `src/components/dashboard/Field.tsx` → `uploadDirectToStorage` (`src/lib/client-upload.ts`, bypassea el Server Action por el límite ~4.5MB de Vercel, sube directo al bucket `media` con `createBrowserClient`) |
| Export de post a Instagram Story | `src/app/dashboard/(panel)/blog/[id]/story/route.tsx` (`ImageResponse` de `@vercel/og`, 1080x1920) — botón en `PageHeader` de `[id]/page.tsx` |
| Modal "más información" (coaches/planes) | Patrón: `short_desc`/`description_long` en el modelo + `Modal.tsx` genérico (`src/components/ui/`) + `CoachModal.tsx`/`PlanModal.tsx` (`src/components/sections/`) |
| Schema / nueva columna / tabla | editar `src/db/schema.ts` + `npx drizzle-kit generate` (se commitea el SQL en `drizzle/`) + tipos en `content.ts`; consultas compartidas en `src/db/queries.ts` |
| Estilos / utilitarios (.btn, .plan-card, .field-input…) | `src/app/globals.css` + `tailwind.config.ts` |
| SEO / JSON-LD / redirects legacy `.php` | `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, `next.config.mjs` |
| Headers de seguridad / CORS | `next.config.mjs` (`headers()`) — checklist en `../../codetlon-cloud/.claude/modules/security-owasp.md` §5 |
| Loading/error states del dashboard | `loading.tsx`/`error.tsx` por sección en `dashboard/(panel)/**`; primitivo compartido `src/components/dashboard/Skeleton.tsx` |

## Dónde NO meterse sin pensar
- **`src/lib/content.ts` + `src/lib/constants.ts`** — la cadena de fallbacks mantiene el sitio vivo sin DB. Si cambiás la forma de un JSONB de `site_settings`, actualizá el getter/tipo acá Y el editor del dashboard, o el front rompe.
- **`drizzle/`** — nunca editar una migración aplicada: generar una nueva. Sin RLS: la autorización de toda escritura del dashboard es `requireUser()` en la acción (no quitarlo) y los uploads pasan por `/api/upload` (autenticado). `drizzle-kit push` solo en dev local.
- **`src/proxy.ts`** — es el middleware de Next 16 (renombrado). No volver a `middleware.ts`.
- `next.config.mjs` — remote patterns (host de `S3_PUBLIC_BASE_URL`, `images.unsplash.com`) + redirects 301 desde URLs `.php`. `tailwind.config.ts` — tokens compartidos.
- TS strict + lint: `npm run build` falla con cualquier `any` implícito o warning.

## Patrones clave
- Server Components por defecto; interactivos `'use client'` (Navbar, Hero parallax, ScrollReveal, ContactForm, CoachModal, DashboardShell, forms del panel).
- Server Actions para todas las mutaciones; `useFormState` + `useFormStatus` de `react-dom`.
- `post_categories` (N:N) es la fuente de verdad del filtrado de blog (el `category_id` en `posts` es legacy).
- Todo en español (es_AR).

## Bugs pendientes (módulo Entrenadores)
- `display_order` duplicado sin validar → validar contra órdenes ya tomados.
- Borrado con `window.confirm()` nativo → modal custom dark en `DeleteButton.tsx` (afecta coaches/planes/posts/categorías).
