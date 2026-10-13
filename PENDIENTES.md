# Pendientes de la migracion fuera de Supabase

Rama: `feature/dev2-backend-propio` (PR #1 a `dev`). Estado al 2026-10-13. `main` sin tocar; `dev` y `test` son espejo de `main` (`3594ec3`) hasta que se mergee el PR.

## Hecho (solo verificado sin base)
- Codigo sin Supabase: Drizzle + Better Auth + S3/R2. `tsc` limpio, `next build` verde, E2E 45/45 (sin base, con fallbacks).
- `scripts/migracion/`, entornos, CI, workflows, scripts de backup y docs (`docs/environments.md`, `docs/BACKUPS.md`).

## A cargo de Mateo (infraestructura)
- [ ] R2: regla CORS del bucket (PUT desde los origenes del sitio), ver `docs/environments.md`.
- [ ] `DATABASE_URL` con `?sslmode=require&uselibpqcompat=true` (o CA de Coolify + `verify-full`).
- [ ] **Activar los workflows:** `cp docs/workflows/*.yml .github/workflows/` y pushear con un token con scope `workflow` (o desde la PC). Estan en `docs/workflows/` porque el token de la VPS no puede crear workflows.
- [ ] Coolify: crear Postgres `gc2-test` y `gc2-prod` (usuario propio con minimos privilegios, `sslmode=require`, puerto publico no estandar). Backup diario a B2 en prod.
- [ ] Cloudflare R2: bucket de test y de produccion con dominio publico; claves S3.
- [ ] Vercel: variables de `.env.example` en Preview (rama `test`) y Production; `BETTER_AUTH_SECRET` distinto por entorno; confirmar que el preview de `test` use la base de test.
- [ ] GitHub: proteger `dev` y `test` (PR obligatorio); secrets `COOLIFY_URL`, `COOLIFY_TOKEN`, `TEST_DB_UUID`, `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DATABASE_URL`, `TEST_URL`; Environment `production` con reviewers, secrets `PROD_DATABASE_URL`, `B2_READ_KEY_ID`, `B2_READ_APP_KEY`, vars `PROD_URL`, `BACKUP_BUCKET`, `BACKUP_PROJECT`; variable de repo `PRODUCCION_HABILITADA=true` solo al final.
- [ ] Resend: remitente del dominio verificado para prod; en test `APP_ENV=test` + `MAIL_SANDBOX_TO`.

## Verificar con una base real (nada de esto se probo)
- [ ] `docker compose up -d`, `npx drizzle-kit migrate`, `scripts/seed-dev.mts`, `scripts/crear-usuario.mts`.
- [ ] Login, logout, "Olvide mi contrasena" (mail + `set-password`), CRUD de coaches, planes, categorias y posts (transacciones de `post_categories`/`post_authors`), leads, export a Instagram Story (debe dar 401 sin sesion).
- [ ] Subida a S3: imagenes (sharp), PDF y video via `/api/upload`; borrado del archivo anterior; `next/image` con el host de `S3_PUBLIC_BASE_URL`.
- [ ] Agregar E2E con base: login, CRUD, upload, IDOR (acceder a recursos sin sesion). Sacar capturas con Playwright a `screenshots/` si cambia UI.
- [x] Lint arreglado: ESLint 9 + `eslint-config-next` 16 (`eslint.config.mjs`); 0 errores, 5 avisos de hidratacion (`react-hooks/set-state-in-effect`, patrones previos).
- [x] `npm run test:db` (`tests/db/verificar-db.mts`): migraciones, consultas, Better Auth (alta, login, sesion, reset de contrasena, registro bloqueado) y contacto contra Postgres real en memoria (PGlite). 13 verificaciones OK. Sigue sin cubrir S3, acciones con `next/headers` ni el dashboard en navegador.
- [ ] Probar a mano el export de Instagram Story (`@vercel/og` 1.0.3, antes 0.11) y subidas con sharp 0.35.
- [ ] Validar con una corrida real `ci.yml`, `entornos.yml` y `produccion.yml` (son esqueletos).

## Migracion de datos de produccion (read-only sobre Supabase)
Ver `scripts/migracion/README.md`.
- [ ] Crear `scripts/migracion/.env.migracion` (gitignored) con `SUPABASE_DB_URL` (idealmente usuario de solo lectura), `LOCAL_DB_URL`, `SUPABASE_URL` y `S3_*`.
- [ ] `01` dump, `02` sanear, `03` inventario, `04` restaurar y validar conteos en una base local/test.
- [ ] Comparar `drizzle/0000_baseline.sql` (salio de las migraciones) con el schema real del dump; corregir drift en `src/db/schema.ts` y regenerar.
- [ ] `05-copiar-storage.mjs` (dry-run, luego `--yes`) y ejecutar `out/reescribir-urls.sql` en la base nueva; revisar muestras de imagen, PDF y video, incluido HTML de `posts.content`.
- [ ] Usuarios (`06-usuarios.md`): alta con `crear-usuario.mts` y reset de contrasena; avisar que las sesiones e invites de Supabase dejan de funcionar.
- [ ] Backup de la base nueva y simulacro de restauracion con `scripts/backup/restore-test.sh`; anotar la fecha en `.claude/CLAUDE.md`. Replicar el bucket R2 a B2.

## Corte
- [ ] Ventana de bajo trafico, aviso a la dueña del sitio, dump final, modo mantenimiento.
- [ ] Variables de Production en Vercel, redeploy, smoke test (`/api/health`, home, blog, login).
- [ ] Supabase en solo lectura 1-2 semanas con fecha de baja anotada; despues dar de baja el proyecto.
- [ ] Promover por PR: `dev` -> `test` -> `main` (lo hace Mateo).

## Decisiones abiertas
- Datos sensibles: la doctrina pide app y base en Coolify sin puerto publico; aca el front esta en Vercel y la base expuesta por TCP con SSL. Revisar si se acepta.
- `posts.author_id` queda sin FK y sin completar en posts nuevos (ids de Better Auth son texto): eliminar la columna o migrarla a `text`.
- Orden de migraciones vs deploy de Vercel en `produccion.yml` (hoy en paralelo; migraciones deben ser compatibles hacia atras).
- `npm audit --omit=dev`: resueltos critical/high (Next 16.4.0, TipTap 3.32, sharp 0.35.5, @vercel/og 1.0.3). Quedan 4 moderate en drizzle-kit/esbuild (herramienta de dev). El CI corta en `high`.
- Auditoria 2026-10-13: corregidos ssl, rate limit en base, `.catch` en mail de recuperacion, contacto que no pierde leads en silencio, trustedOrigins, errores sin SQL, URLs https en posts, pagina de leads con `?page` invalido. Sigue abierto: honeypot/rate limit del formulario de contacto.
- SVG en `uploadMediaAction` (Server Action) se sube tal cual al bucket publico; `/api/upload` ya lo rechaza. Evaluar sanitizarlo o bloquearlo.
- Compartir una sola instancia de Postgres entre test y prod para ahorrar RAM (menos aislamiento).
