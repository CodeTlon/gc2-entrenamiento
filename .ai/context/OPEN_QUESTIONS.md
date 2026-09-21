# OPEN_QUESTIONS

Preguntas genuinas que quedaron abiertas de esta auditoría — requieren decisión humana o verificación que esta auditoría no pudo hacer sin arriesgar tocar producción.

1. **¿Se archivan/borran los 4 archivos de `docs/*.md`?** Están desactualizados (Next 14, schema viejo, sin mención del dashboard) y superados por `.claude/CLAUDE.md` + `ARCHITECTURE.md` (raíz) + esta capa `.ai/context/`. No se tocaron en esta auditoría (fuera del alcance pedido).

2. **¿Se revive el split dev/prod de la rama `dev` (`docs/environments.md`)?** Está diseñado y parcialmente implementado (`scripts/db-sync-dev.mjs`, `.env.supabase.local` con ref dev dedicado) pero nunca se mergeó a `main` y tiene ~3 meses de atraso. Relacionado directo con el hallazgo CRÍTICO de `KNOWN_ISSUES.md`.

3. **¿Se sincroniza `main` local con `origin/main`?** Local está 1 commit atrás (`73ef2eb` vs `75d5f14`) — no se hizo `git pull` durante esta auditoría para no alterar el árbol de trabajo mientras hay una sesión en curso sin commitear.

4. **¿Los secrets del workflow `supabase-keepalive.yml` en GitHub Actions apuntan al proyecto correcto (prod o dev)?** Esos secrets viven server-side en GitHub, invisibles desde una auditoría de archivos locales — no verificable sin acceso al dashboard de GitHub del repo.

5. **¿Coinciden los settings del dashboard de Vercel con lo inferido localmente?** Concretamente: ¿la rama de producción configurada ahí sigue siendo `main`, y el auto-deploy sigue activo? La evidencia local (`.vercel/project.json` linkeado, ausencia de cualquier pipeline de deploy alternativo) apunta con confianza alta a que sí, pero sólo es verificable en el dashboard/API de Vercel — no se consultó para mantener esta auditoría 100% de solo lectura sobre el filesystem local.

6. **¿Vale la pena el bump coordinado de `@tiptap/*` a `^3.31.3`?** Resuelve 1 high + 25 moderate de una sola vez, pero requiere subir ~6 paquetes directos juntos por los peer deps estrictos entre ellos — no se probó el bump ni se corrió el test suite contra la versión nueva.
