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
| v1.0.0 | — | Entrega inicial — migración legacy PHP+SCSS + dashboard CMS |
| — | 2026 | Next 16 + React 19 (`middleware.ts` → `proxy.ts`); migraciones 008/009; sedes con merge inteligente, cards uniformes + mapa colapsable |
| v1.1.0 | 2026-06-02 | Flujo de recuperación de contraseña autónomo (`/dashboard/forgot-password`); manual del dashboard para administradores (`docs/manual-dashboard.html`) |
| v1.1.1 | 2026-06-02 | Fix: proxy no bloqueaba `/dashboard/forgot-password` para usuarios sin sesión |
