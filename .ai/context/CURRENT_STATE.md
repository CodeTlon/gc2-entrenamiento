# CURRENT_STATE

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
