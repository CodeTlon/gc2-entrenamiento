# GC² Entrenamiento

Sitio web del equipo **GC² Entrenamiento** (coaching en running, duatlón y triatlón, Argentina). Sitio público + **dashboard CMS** para administrar todo el contenido. Migración de un sitio legacy PHP + SASS al stack CodeTlon.

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) + React 19 + **TypeScript** (strict)
- **Tailwind CSS 3** (Barlow + Barlow Condensed)
- **Supabase** (PostgreSQL + RLS + Auth + Storage)
- **Resend** (formulario de contacto) · **Zod** + Server Actions
- **Playwright** (E2E) · Deploy en **Vercel**

## Setup

```bash
npm install
cp .env.example .env.local   # completar credenciales Supabase + Resend
npm run dev                  # http://localhost:3000
```

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Build de producción (falla con errores TS/lint)
npm run lint         # ESLint
npm run test:e2e     # Tests E2E (Playwright)
npm run test:e2e:ui  # Playwright UI mode
```

## Variables de entorno

Ver `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `COMPANY_EMAIL`, `NEXT_PUBLIC_GA_ID` (opcional).

## Estructura

- `src/app/(public)/` — sitio público (home, planes, blog, contacto)
- `src/app/dashboard/` — login + CMS admin
- `src/lib/content.ts` — fetchers con fallbacks tipados (fuente de datos de páginas públicas)
- `src/actions/` — Server Actions (mutaciones + contacto)
- `src/proxy.ts` — auth gate de `/dashboard` (era `middleware.ts`, renombrado por Next 16)
- `supabase/migrations/` — migraciones SQL (001–009)

Ver [`ARCHITECTURE.md`](./ARCHITECTURE.md) para el mapa de dónde tocar cada cosa.

## Mantenimiento

Modelo de sesión de CodeTlon:

- `/cambio "<tema>"` — abre una rama de trabajo desde `main`. Cada cambio commitea ahí.
- `/cerrar` — build + actualiza este Changelog + mergea a `main` + tag SemVer.

Contexto de proyecto en `.claude/CLAUDE.md` + `ARCHITECTURE.md`.

## Changelog

| Versión | Fecha | Cambio |
|---------|-------|--------|
| v1.3.0 | 2026-07-18 | Modal "más información" en planes (`description_long` + `PlanModal.tsx`, mismo patrón que coaches). Export de artículos a Instagram Story (`@vercel/og`, PNG 1080x1920 server-side, botón en el editor de post). PDF y video propio adjuntables en posts (subida directa al bucket desde el navegador, bypass del Server Action por el límite de body de Vercel). Límites de upload más generosos y diferenciados por tipo (imagen 20MB, PDF 10MB, video 60MB; antes 12MB fijo). Build verde + 45/45 E2E. |
| v1.2.1 | 2026-07-11 | Seguridad + perf percibida: headers de seguridad en `next.config.mjs` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`); fix RLS (`post_authors` no aceptaba escrituras del dashboard, migración `010`); fix open redirect en `/auth/callback` y `/auth/confirm` (`next` sin validar); nuevo `Skeleton` compartido para los `loading.tsx` del panel + `error.tsx`/`global-error.tsx`. Build verde. |
| v1.2.0 | 2026-06-21 | Cookies: banner de consentimiento + **Consent Mode v2** (GA4 arranca `denied`, opt-in vía banner, elección en `localStorage` `gc2_cookie_consent`). Nuevo `CookieConsent.tsx` montado en el root layout, link a `/privacidad` (la página ya documentaba el uso de GA). El banner solo aparece si hay `GA_ID` real. Cierra el hueco legal de cargar analytics sin consentimiento. Build verde. |
| v1.1.6 | 2026-06-18 | Perf: `GroupClasses` (4ta sección del home) tenía `priority` en su imagen de fondo full-bleed — la forzaba a cargar eager aunque está fuera del viewport inicial. Se sacó para que cargue lazy como el resto de las secciones bajo el fold (Lighthouse: "defer offscreen images"/"properly size images"). Nota aparte (no de código): el dominio apex sin `www` hace 2 saltos de redirect (http→https→www) antes de servir — requiere ajustar el dominio primario en Vercel, no es fixeable desde Next.config. 45/45 E2E verdes. |
| v1.0.0 | — | Entrega inicial — migración legacy PHP+SCSS + dashboard CMS |
| — | 2026 | Next 16 + React 19 (`middleware.ts` → `proxy.ts`); migraciones 008/009; sedes con merge inteligente, cards uniformes + mapa colapsable |
| v1.1.0 | 2026-06-02 | Flujo de recuperación de contraseña autónomo (`/dashboard/forgot-password`); manual del dashboard para administradores (`docs/manual-dashboard.html`) |
| v1.1.1 | 2026-06-02 | Fix: proxy no bloqueaba `/dashboard/forgot-password` para usuarios sin sesión |
| v1.1.2 | 2026-06-02 | Fix: flujo PKCE de recovery — nueva ruta `/auth/callback`, `set-password` usa `createBrowserClient`; template email recovery en `docs/` |
| v1.1.3 | 2026-06-05 | Fix: invite de usuario quedaba en "Verificando link…" infinito (PKCE sin code_verifier). Nueva ruta `/auth/confirm` con `verifyOtp`; `set-password` con timeout/mensaje de link inválido; template email invite en `docs/supabase-email-invite.html` |
| v1.1.4 | 2026-06-14 | Seguridad: `overrides: { glob: "10.5.0" }` (corrige 3 vulns HIGH de la cadena `eslint-config-next`, dev/lint-only) + piso `next ^16.2.9`. `npm audit` 5 (3 high) → 2 moderate (postcss bundleado en Next, no accionable) |
| v1.1.5 | 2026-06-14 | E2E rehecho: el suite viejo (87 tests) asertaba sobre contenido del CMS y quedó stale (83/87 rojos con el Supabase dev vacío). Reemplazado por un smoke resiliente (15 tests × 3 viewports) que valida solo lo determinístico: render sin 500 (footer del layout), navbar, auth-gate del dashboard, redirects 301 `.php`, SEO/robots/sitemap y 404. `mobile`/`tablet` ahora corren en Chromium (sin dependencia de WebKit). **45/45 verde** |

## Licencia

© 2026 CodeTlon. Todos los derechos reservados. Software propietario del cliente/CodeTlon.
Prohibida su copia, redistribución o reuso sin autorización escrita. Ver [LICENSE](./LICENSE).
