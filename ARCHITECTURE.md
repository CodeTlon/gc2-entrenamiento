# ARCHITECTURE — GC² Entrenamiento

Mapa para mantenimiento. **No releas el repo entero**: buscá tu tipo de cambio acá y abrí solo esos archivos. El detalle fino (estructura completa, modelo de datos, convenciones) vive en `.claude/CLAUDE.md`.

## Stack
**Next.js 16** (App Router, RSC, Turbopack) · React 19 · TS strict · Tailwind 3 (Barlow + Barlow Condensed) · Supabase (Postgres + RLS + Auth + Storage bucket `media`) · Resend · Vercel. Alias `@/*` → `src/*`. Dominio: `gc2entrenamientoderesistencia.com.ar`.

## Route Groups
- `src/app/(public)/` — público (home, planes, blog + `[slug]`, contacto, privacidad, terminos)
- `src/app/auth/callback/` — intercambia código PKCE de Supabase (`?code`) por sesión en cookies (recovery iniciado desde el navegador)
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
| Auth gate del dashboard | `src/proxy.ts` (antes `middleware.ts` — renombrado por Next 16) + `src/lib/supabase-server.ts` |
| Flujo de recovery de contraseña | `src/app/auth/callback/route.ts` (exchange PKCE) → `src/app/dashboard/(auth)/set-password/` · `forgotPasswordAction` en `src/actions/auth.ts` |
| Flujo de invite de usuario | Email template (`docs/supabase-email-invite.html`) → `{{ .SiteURL }}/auth/confirm?token_hash=…&type=invite` → `src/app/auth/confirm/route.ts` (`verifyOtp`) → `set-password`. **No usar `{{ .ConfirmationURL }}`** (PKCE sin code_verifier = "Verificando link…" infinito) |
| Upload de imágenes del CMS | `uploadMediaAction` en `src/actions/settings.ts` (sharp: resize 2000px, WebP q82) → bucket `media` |
| Schema / nueva columna / tabla | **nueva** migración numerada en `supabase/migrations/` (la última es `009`) + tipos en `content.ts` |
| Estilos / utilitarios (.btn, .plan-card, .field-input…) | `src/app/globals.css` + `tailwind.config.ts` |
| SEO / JSON-LD / redirects legacy `.php` | `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, `next.config.mjs` |

## Dónde NO meterse sin pensar
- **`src/lib/content.ts` + `src/lib/constants.ts`** — la cadena de fallbacks mantiene el sitio vivo sin DB. Si cambiás la forma de un JSONB de `site_settings`, actualizá el getter/tipo acá Y el editor del dashboard, o el front rompe.
- **`supabase/migrations/`** — nunca editar una migración aplicada. Crear una nueva (última: `009_contact_leads_coach.sql`).
- **`src/proxy.ts`** — es el middleware de Next 16 (renombrado). No volver a `middleware.ts`.
- `next.config.mjs` — remote patterns (`*.supabase.co`, `images.unsplash.com`) + redirects 301 desde URLs `.php`. `tailwind.config.ts` — tokens compartidos.
- TS strict + lint: `npm run build` falla con cualquier `any` implícito o warning.

## Patrones clave
- Server Components por defecto; interactivos `'use client'` (Navbar, Hero parallax, ScrollReveal, ContactForm, CoachModal, DashboardShell, forms del panel).
- Server Actions para todas las mutaciones; `useFormState` + `useFormStatus` de `react-dom`.
- `post_categories` (N:N) es la fuente de verdad del filtrado de blog (el `category_id` en `posts` es legacy).
- Todo en español (es_AR).

## Bugs pendientes (módulo Entrenadores)
- `display_order` duplicado sin validar → validar contra órdenes ya tomados.
- Borrado con `window.confirm()` nativo → modal custom dark en `DeleteButton.tsx` (afecta coaches/planes/posts/categorías).
