# CURRENT_STATE

Estado al **2026-10-16** (rama `feature/dev2-estandar-2026`, integrada en `dev` y `test` al cerrar la sesion). El detalle del 2026-10-15 sigue abajo.

## Alineacion de versiones (2026-10-16)
Next 16.4.2, React 19.3.1, Tailwind 4.3.3, TypeScript 6.0.3, ESLint 10.13.0, Zod 4.6.7, Better Auth 1.7.10, Playwright 1.64.1, `@types/node` 22, `lucide-react` 0.577. Verificado: `tsc` limpio, lint 0 errores (5 avisos previos), `test:db` 16/16, `test:storage` 14/14, `test:transcode` 7/7, 45 E2E (3 viewports) contra el servidor con base, `npm audit --omit=dev` en 0, imagen Docker Alpine construida, capturas iguales a la version anterior salvo 2 a 5 px de espaciado en el login del panel. No verificado: despliegue en Coolify (los recursos no existen todavia).

---
Snapshot del 2026-10-15:

## Ramas
- `dev` = `test`: backend propio (Postgres + Drizzle + Better Auth, archivos en el volumen `/media`), Next 16, v2.2.0. Sin Supabase en el código.
- `main`: **producción actual, todavía en Vercel + Supabase** (38 commits atrás de `dev`). El corte a Coolify no se hizo.
- Ramas `feature/dev2-*` (backend-propio, coolify, usuarios-bcrypt, video-transcode, workflows, workflows-coolify): ya integradas en `dev`.

## Verificado hoy en `dev`
`npx tsc --noEmit` limpio · `npm run lint` 0 errores y 5 avisos previos · `test:db` 16/16 · `test:storage` 14/14 · `npm audit --omit=dev --audit-level=high` sin altas ni críticas. Workflows `ci`, `entornos`, `produccion` y `backup-check` presentes.

## Pendiente (detalle en `PENDIENTES.md`)
Crear los recursos `gc2-test` y `gc2-prod` en Coolify, configurar `NEXT_PUBLIC_GA_ID` y las variables que hoy están en Vercel, cargar los datos reales (ensayo de migración ya verificado) y cortar `main`. Sin verificar: compresión de video contra el servicio real y los workflows de producción (solo validados con `actionlint`).

---
# Histórico (snapshot 2026-09-18, era Vercel + Supabase)
Lo de abajo describe `main` antes de la migración. No usar como estado actual.

> **2026-10-13:** en curso `feature/dev2-backend-propio` (PR #1 a `dev`): migración de Supabase a Postgres/Drizzle/Better Auth/S3 con entornos dev > test > main. Los workflows de CI viven en `.github/workflows/` (rama `feature/dev2-workflows`, ver `PENDIENTES.md`). Sin Docker en la sesion del 2026-10-13: test:db (PGlite), tsc, lint, build y E2E 45/45 verdes. Falta: verificar contra una base real (Docker), dump/restauración de prod, copia del bucket, usuarios, recursos en Coolify/R2/Vercel, corte.


Snapshot al 2026-09-18. Esto envejece rápido — si parece desactualizado, confiá en `git log`/`git status` reales antes que en este archivo.

## Git

**FACT**: `main` local está commit `73ef2eb`, `origin/main` está en `75d5f14` — **local está 1 commit atrás del remoto**. Antes de arrancar trabajo nuevo, considerar traer ese commit (no se hizo `git pull` durante esta auditoría para no tocar el árbol de trabajo).

**FACT**: hay una sesión de trabajo en curso, sin commitear, de tema SEO/AEO — archivos nuevos sin trackear: `.claude/ERRORES.md`, `AGENTS.md` (el bloque agregado por esta auditoría), `CLAUDE.md` (raíz), `public/llms.txt`, `src/components/ui/BackToTop.tsx`, `JsonLd.tsx`, `ShareButton.tsx`, `StickyMobileCTA.tsx`, `TLDRBox.tsx`; más ~30 archivos modificados (casi todo `src/app/(public)/**`, `src/components/**`, `.gitignore`, `next.config.mjs`, `package.json`). No se tocó nada de esto durante esta auditoría de contexto.

## Qué está completo

Sitio público (home, planes, blog, contacto, privacidad/términos), dashboard CMS completo (contenido del home, coaches, planes+categorías, blog+categorías, contacto), auth con recovery de contraseña, export a Instagram Story, cookie consent + GA con Consent Mode v2.

## Qué está mockeado / con fallback

`src/lib/content.ts` cae a `FALLBACK_*` (`src/lib/constants.ts`) para todo el contenido del home/coaches/planes si Supabase no responde o las env vars son placeholder — es un fallback real de producción, no un mock de desarrollo (ver `DOMAIN.md`).

## Dependencias — snapshot de `npm audit` (FACT, corrido el 2026-09-18, sólo lectura)

**35 vulnerabilidades: 0 críticas, 2 high, 32 moderate, 1 low.**

Esto contradice lo que afirma el changelog de `.claude/CLAUDE.md` (v1.1.4, "audit 5(3 high)→2 moderate") como si fuera el estado vigente — ese número es de 2026-06-14 y quedó obsoleto tras agregar `@vercel/og` (v1.3.0) y TipTap (v1.4.0) en julio. Ver desglose completo y severidad en `KNOWN_ISSUES.md`.

## Deuda de documentación conocida (no arreglada en esta auditoría, ver `KNOWN_ISSUES.md`)

`docs/*.md` desactualizados (Next 14, schema viejo), `.claude/CLAUDE.md` con auto-contradicciones menores, referencia a un `TASKS.md` inexistente.

## Actualizacion 2026-10-15 (video transcode y estado de ramas)
- **Hecho y verificado:** `src/lib/transcode.ts` + integracion en `/api/upload` (video -> servicio global de compresion, preset `web`, soft-fail). `npm run test:transcode` 7/7, `tsc`, `lint` (0 errores), `test:db` 16/16, `test:storage` 14/14. `dev` y `test` apuntan al mismo commit.
- **Sin verificar:** compresion real de un video contra el servicio (solo se comprobo que la key autentica con un archivo que no es video).
- **Pendiente (del usuario):** cargar `TRANSCODE_API_KEY` en `gc2-test` y `gc2-prod`; cron de backup a B2 y `backup-check.yml` activos al subir `gc2-prod`.
