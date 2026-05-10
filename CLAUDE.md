# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

GC² Entrenamiento is a Next.js 14 sports training website for an Argentine team specializing in running, duathlon, and triathlon coaching. It migrates a legacy PHP+SASS site and includes a dashboard CMS for managing all site content.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (fails on TypeScript/lint errors)
npm run lint         # ESLint
npm run test:e2e     # Playwright E2E tests (headless)
npm run test:e2e:ui  # Playwright UI mode
```

Single Playwright test:
```bash
npx playwright test tests/contact.spec.ts
```

## Architecture

### Route Groups
- `src/app/(public)/` — public-facing pages (home, planes, blog, contacto)
- `src/app/dashboard/(auth)/` — login page
- `src/app/dashboard/(panel)/` — admin CMS (Supabase auth required)

### Data Layer
- **`src/lib/content.ts`** — data fetchers with TypeScript-typed fallback values when DB is unavailable. All public page data goes through here.
- **`src/actions/`** — Next.js Server Actions for all mutations (contact form, CRUD for posts, coaches, plans, categories, site settings, auth)
- **`src/lib/supabase.ts`** — browser Supabase client + service-role client
- **`src/lib/supabase-server.ts`** — server-side auth helpers using `createServerClient`

### Database (Supabase/PostgreSQL)
All tables use Row-Level Security:
- `contact_leads` — contact form submissions (public insert, service-role read)
- `posts` — blog articles linked to `coaches` via `coach_id` (public read when published)
- `coaches` — team member profiles with arrays for certifications/achievements/services
- `plans` — training packages categorized by `runner | triathlon | group`
- `site_settings` — JSONB key/value store for frontend sections (hero, about, disciplines, group_classes, team_gallery, contact)
- `categories` / `plan_categories` — classification tables

Migration files are in `supabase/migrations/` numbered 001–006.

### Key Patterns
- **Server Components by default** — pages and section components are RSC; interactive components are `'use client'`
- **Fallback data** — `content.ts` returns static defaults when Supabase is unreachable, keeping the site functional
- **Contact form resilience** — submission writes to Supabase AND sends email via Resend; both are best-effort (errors caught, don't fail the action)
- **Storage** — Supabase `media` bucket for image uploads from the dashboard; public read, authenticated write/update/delete

### Environment Variables
See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `COMPANY_EMAIL`
- `NEXT_PUBLIC_GA_ID` (optional analytics)

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router), React 19, TypeScript 5 strict mode |
| Styling | Tailwind CSS with custom Barlow font, custom color scale |
| Database | Supabase (PostgreSQL + RLS + Auth + Storage) |
| Email | Resend API |
| Validation | Zod + React Hook Form |
| Testing | Playwright (mobile/tablet/desktop viewports) |
| Hosting | Vercel |

Path alias `@/*` maps to `./src/*`.

## Current Branch: `Origin/Fix/First`

This branch is focused on fixing TypeScript errors and build issues. The last commit (`de11348`) fixed TypeScript errors that were breaking the build. When working on this branch, always verify `npm run build` passes before considering a fix complete.

## Known Issues & Context

- TypeScript strict mode is enabled — all types must be explicit, no implicit `any`
- The `posts` table has a `coach_id` foreign key added in migration 006; make sure queries join correctly
- Dashboard editors for site_settings (hero, about, disciplines, group_classes, gallery, contact) store data as JSONB — changes to the shape require updating both the editor component and `content.ts` types

## Bugs Pendientes — Módulo Entrenadores

### BUG-01: `display_order` duplicado no se valida
- Dos coaches pueden compartir el mismo valor de orden de visualización
- El sitio público muestra primero al que fue creado antes (el segundo queda detrás)
- **Fix**: pasar los valores tomados al formulario como prop `takenOrders: number[]` y mostrar error en rojo si el valor ya está en uso

### BUG-02: Dialog de borrado usa `window.confirm()`
- Al eliminar un entrenador aparece el `confirm()` nativo del navegador (fuera de estilo)
- **Fix**: reemplazar `DeleteButton.tsx` con un modal custom que use el estilo del dashboard (dark, `#0D2247`, bordes azul-marino)
- El cambio impacta todos los módulos que usan `DeleteButton` (coaches, planes, posts, categorías)
