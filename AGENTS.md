<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# GC² Entrenamiento — punto de entrada para agentes

> El bloque de arriba lo gestiona `next dev`; no lo borres. Lo de abajo es contexto propio del proyecto, no se regenera solo.

## ⚠️ Este proyecto está en producción

Sirve tráfico y usuarios reales (`gc2entrenamientoderesistencia.com.ar`): leads de contacto, coaches, planes y posts de blog reales (hoy en Supabase; en migración a Postgres propio, ver `PENDIENTES.md`).

- **Nunca ejecutes nada que escriba/modifique/mute datos contra el ambiente de producción real**, ni "solo para probar". Leer datos de prod para diagnosticar está bien; escribir no, salvo autorización explícita puntual.
- **Verificá a qué base apuntan tus variables de entorno antes de asumir nada.** Producción sigue en Supabase hasta el corte; el código de esta rama ya no lo usa y en desarrollo se trabaja contra Postgres local (`docker compose`) o, sin Docker, con `node --import tsx tests/db/verificar-db.mts` (PGlite en memoria). Nunca apuntes `DATABASE_URL` a la base de producción para probar.
- Cualquier verificación que requiera mutar algo se hace contra un ambiente de desarrollo/staging, o se pide confirmación explícita antes de tocar prod.

## Qué es

Sitio web + CMS de **GC² Entrenamiento de la Resistencia** (Córdoba, AR): equipo de entrenamiento para corredores, duatletas y triatletas. Sitio público + dashboard administrativo interno para editar todo el contenido sin tocar código.

## Stack

Next.js 16 (App Router, RSC, Turbopack) · React 19 · TypeScript estricto (`@/* → src/*`) · Tailwind CSS 4 · PostgreSQL + Drizzle ORM + Better Auth + archivos en volumen del servidor · Resend (emails) · Zod (validación) · TipTap (editor rich-text del dashboard) · `@vercel/og` (export a Instagram Story) · Playwright (e2e). Deploy: Coolify (app + Postgres en la misma red interna, `docker-compose.coolify.yml`); Vercel ya no se usa para este proyecto (regla de CodeTlon: solo sitios sin base van a Vercel).

## Comandos básicos

```
npm run dev          # Next dev (Turbopack)
npm run build         # build de producción
npm run lint          # ESLint
npm run test:e2e       # Playwright headless
npm run test:e2e:ui    # Playwright UI
```

## Convenciones críticas

- **Server-first**: páginas y secciones son Server Components salvo que necesiten estado/efectos.
- **Server Actions** (`src/actions/*.ts`), firma estándar `(prevState, formData) => Promise<State>`, usadas con `useFormState`/`useFormStatus`. Toda acción que muta datos del dashboard llama `requireUser()`/`getUser()` porque ya no hay RLS: ese chequeo es la autorización (no lo quites).
- **Fallback de contenido obligatorio**: `src/lib/content.ts` siempre debe devolver datos, cayendo a `FALLBACK_*` (`src/lib/constants.ts`) si la base no responde. No rompas esta cadena.
- **Sin RLS**: la autorización vive en el servidor (`requireUser()` en `src/lib/session.ts`). `contact_leads` se inserta solo desde `submitContact`. Si agregás una tabla escrita desde el dashboard, toda acción que la muta debe llamar `requireUser()`.
- **Uploads grandes** (PDF/video en posts) van por `uploadDirectToStorage` → `POST /api/upload` (cuerpo crudo en streaming al volumen, bypass del Server Action, que limita el body a 20MB) — no muevas ese código a un Server Action. Los videos se recomprimen ahí mismo con el servicio global (`src/lib/transcode.ts`, `TRANSCODE_API_KEY` solo en Coolify): siempre con soft-fail, el original nunca se pierde.
- **i18n**: todo en español (es_AR). Mantenelo así.
- **Comentarios**: en español, sólo cuando aportan — no comentarios obvios.
- `src/proxy.ts` (no `middleware.ts`, renombrado por Next 16) es el auth gate de `/dashboard/**`.

## Para más contexto

No leas todo — andá directo al archivo que corresponde a tu tarea:

| Si vas a... | Leé |
|---|---|
| Orientarte por primera vez / no sabés por dónde arrancar | `.ai/context/00_INDEX.md` |
| Tocar auth, RLS, server actions, deploy o env vars | `.ai/context/ARCHITECTURE.md` + `.ai/context/KNOWN_ISSUES.md` |
| Entender el negocio, el modelo de datos o una regla | `.ai/context/DOMAIN.md` |
| Agregar una feature siguiendo el estilo del repo | `.ai/context/CONVENTIONS.md` |
| Entender por qué algo se hizo de una forma particular | `.ai/context/DECISIONS.md` |
| Saber qué está en curso / qué falta | `.ai/context/CURRENT_STATE.md` |
| Evaluar riesgo antes de una tarea sensible | `.ai/context/KNOWN_ISSUES.md` |
| Ver qué quedó sin resolver | `.ai/context/OPEN_QUESTIONS.md` |

`.claude/CLAUDE.md` sigue existiendo aparte y es la memoria de **sesión de mantenimiento de Claude Code** (flujo `/cambio` abre rama de trabajo, `/cerrar` mergea/pushea/tagea) — es el archivo a actualizar al cerrar una sesión de cambios, no lo reemplaza esta capa. Los módulos de la fábrica (seguridad, a11y, CI/CD, observabilidad) referenciados ahí siguen aplicando igual.
