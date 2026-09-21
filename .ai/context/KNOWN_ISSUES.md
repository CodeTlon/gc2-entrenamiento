# KNOWN_ISSUES

Severidad explícita. Generado 2026-09-18 por auditoría de evidencia real (no se mutó ningún dato de producción para producir este archivo). Ningún fix se aplicó todavía — son hallazgos con remediación propuesta, no cambios ya hechos.

---

## 🔴 CRÍTICA — el entorno local probablemente apunta a producción, no a dev

**Evidencia (FACT)**: `.env.local` de este workstation tiene `NEXT_PUBLIC_SUPABASE_URL` con ref `nqjnutjbjkpgywlvevab`, y en el mismo archivo `NEXT_PUBLIC_SITE_URL=https://gc2entrenamientoderesistencia.com.ar` (dominio real de producción) + un remitente de email de producción. Existe por separado un `.env.supabase.local` con `SUPABASE_DEV_PROJECT_REF=rbzzcbyanduyoiwgkxwh` — un ref **distinto**, pensado para un proyecto Supabase de desarrollo dedicado, usado sólo por `scripts/db-sync-dev.mjs`. El diseño completo de un split dev/prod (`docs/environments.md`) existe únicamente en la rama `dev` de GitHub, nunca mergeada a `main`, con ~3 meses de atraso.

**Escenario de falla concreto**: alguien corre `npm run dev` localmente para probar un cambio en el dashboard (crear un coach, editar un plan, mandar un lead de prueba por el form de contacto) — si `.env.local` efectivamente apunta al proyecto de producción, esa "prueba" escribe en la base de datos real que ve el público, sin ningún aviso de que se está tocando prod.

**Confianza**: alta, pero no 100% verificado (UNKNOWN definitivo requeriría comparar el ref contra el proyecto Supabase que Vercel Production realmente usa, algo que no se chequeó para no arriesgar tocar credenciales de prod más de lo necesario).

**Fix propuesto (no aplicado)**: repuntar `.env.local` de este workstation al `SUPABASE_DEV_PROJECT_REF` dedicado, o revivir el split documentado en `docs/environments.md` (mergear esa rama o recrear el doc en `main`) y provisionar un `.env.local` que use el proyecto dev por default.

---

## 🟠 ALTA — credenciales reales en texto plano en disco local

**Evidencia (FACT)**: `.env.local` y `.env.supabase.local` (ambos correctamente gitignoreados, `git ls-files` confirma que NO están trackeados ni en el historial) contienen: `SUPABASE_SERVICE_ROLE_KEY` real (bypassea RLS por completo), `SUPABASE_ACCESS_TOKEN` con prefijo `sbp_` (token de Management API de Supabase — alcance de cuenta completa, puede crear/borrar/modificar proyectos), y una password real de Postgres del proyecto dev.

**No es una fuga a git/GitHub** — el `.gitignore` los cubre correctamente (`.env*.local`). El riesgo es exposición en el disco local (cualquier proceso/script/agente con acceso al filesystem del workstation puede leerlos).

**Fix propuesto (no aplicado)**: rotar el token de Management API (`sbp_...`) periódicamente dado su alcance; no fue necesario mostrar ni mover ningún valor completo para este hallazgo.

---

## 🟡 MEDIA-ALTA — 35 vulnerabilidades en `npm audit` hoy (vs. changelog desactualizado)

**Evidencia (FACT, `npm audit --json` corrido 2026-09-18)**: 0 críticas, 2 high, 32 moderate, 1 low. El changelog de `.claude/CLAUDE.md` (v1.1.4, 2026-06-14) afirma "audit 5(3 high)→2 moderate" como si describiera el estado actual — quedó obsoleto al agregar `@vercel/og` (v1.3.0, jul) y TipTap (v1.4.0, jul), ninguna sesión corrió `npm audit` de nuevo desde entonces.

| Grupo | Severidad | Directo/transitivo | Prod/dev | Fix real |
|---|---|---|---|---|
| `@tiptap/core` + 25 paquetes `@tiptap/*` (ReDoS + proto-pollution) | 1 high + 25 moderate | mixto (varios directos) | **producción** (editor del dashboard, va al bundle client) | subir **todos** los `@tiptap/*` juntos a `^3.31.3` (peer deps estrictos entre ellos — `npm audit fix` solo no alcanza, rompe con ERESOLVE) |
| `browserslist` + `baseline-browser-mapping` | 2 high + 1 moderate | transitivo | dev-only (vía `autoprefixer`, build-time) | `npm audit fix` (no-major) |
| `@vercel/og` → `satori` → `fflate` (ZIP64 infinite loop) | 3 moderate | `@vercel/og` directo, resto transitivo | producción (route handler server-side, no bundle client) | **sin fix upstream todavía** — `@vercel/og@1.0.2` ya es la última versión y pinea `satori` con `fflate` vulnerable; requeriría un `overrides` manual forzando `fflate@0.7.5+`, no verificado contra compatibilidad de satori |
| `postcss-selector-parser` (DoS por recursión) | 1 low | transitivo (`tailwindcss`) | dev-only | `npm audit fix` |

**Nota**: el override existente (`glob: "10.5.0"`, changelog v1.1.4) sigue funcionando y esa cadena específica (`eslint-config-next`) está limpia hoy — no es el problema, el problema es que el número total de vulnerabilidades cambió por dependencias agregadas después.

**No se aplicó ningún fix** — son cambios de `package.json`, fuera del alcance de esta tarea de documentación.

---

## 🟡 MEDIA — `docs/*.md` desactualizados sin marca de deprecación

**Evidencia (FACT)**: `docs/README.md` y `docs/technical-docs.md` dicen "Next.js 14" (real: 16). `docs/technical-docs.md` documenta un schema de 2 tablas (`contact_leads`, `posts` sin `coach_id`/`attachment_url`/etc.) — el real tiene 9+ tablas. Ningún doc en `docs/` menciona el dashboard CMS, que es una parte central del proyecto hoy. `docs/deployment-guide.md` referencia sólo migraciones `001`/`002` (hoy hay 12) y `next.config.ts` (el archivo real es `.mjs`).

**Riesgo**: un agente que lea `docs/` en vez de `.claude/CLAUDE.md`/`ARCHITECTURE.md`/esta capa recibe información activamente incorrecta sobre stack y schema.

**Fix propuesto (no aplicado)**: archivar o borrar `docs/*.md`, ya superado por `.claude/CLAUDE.md` + `ARCHITECTURE.md` (raíz) + esta capa.

---

## 🟡 MEDIA — `.claude/CLAUDE.md` se auto-contradice y referencia un archivo inexistente

**Evidencia (FACT)**: Stack dice `next ^16.2.1` (línea 18) mientras su propio changelog (línea 183, v1.1.4) dice que el piso se subió a `^16.2.9` — real instalado: `16.3.3`. El árbol de carpetas omite archivos/rutas reales ya committeados (`CookieConsent.tsx`, `InviteHandler.tsx`, `MiniHero.tsx`, `LocationCard.tsx`, `image-focal.ts`, `responsive-grid.ts`, `sanitize.ts`, rutas `forgot-password/`, `set-password/`, `leads/`). El Stack omite `@tiptap/*` e `isomorphic-dompurify`, ambas dependencias de producción reales. Además, la instrucción de onboarding del propio archivo (línea 4) le dice al agente que lea `TASKS.md` — **ese archivo no existe en ningún lado del repo**.

**Fix propuesto (no aplicado)**: refrescar en el próximo `/cerrar`; no se edita en esta tarea (fuera del alcance acordado).

---

## 🟢 BAJA — hallazgos menores, no bloqueantes

- `uploadDirectToStorage` no aplica el chequeo de tamaño/mime de la app (sigue protegido por la RLS de `storage.objects`, que exige `authenticated` — no es un problema de autorización, sólo falta un guard de UX en ese path puntual).
- RLS de `categories`/`plan_categories`/`post_categories` usa la forma implícita de una sola cláusula `using(...)` en vez de `using + with check` explícito como el resto de las tablas — funcionalmente equivalente en Postgres, sólo inconsistencia de estilo.

---

## ✅ Verificado sin hallazgos — autorización server-side

Auditoría completa de `proxy.ts`, las 8 familias de server actions, todos los route handlers y las policies RLS de las 9 tablas: **no se encontró ningún caso de "chequeo sólo en cliente sin enforcement de servidor."** Toda acción mutante llama `requireUser()`/`getUser()` además de depender de RLS. El bug histórico de `post_authors` (RLS sólo para `service_role`) está confirmado arreglado por la migración `010`. El open-redirect histórico en `next` param de `/auth/callback`/`/auth/confirm` está confirmado arreglado y sigue arreglado hoy.
