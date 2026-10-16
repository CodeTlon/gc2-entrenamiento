# ENVIRONMENTS

Vigente al 2026-10-16. Fuente completa: `docs/environments.md` y `docs/produccion-coolify.md`.

| Rama | Entorno | Base | Archivos | Correo |
|---|---|---|---|---|
| `dev` | local (`npm run dev`) | Postgres en Docker (`docker compose up -d`, `127.0.0.1:42432`; en la VPS usar el rango de puertos de la cuenta) | `./storage` | credenciales de prueba |
| `test` | Coolify, recurso `gc2-test`, apagado salvo que se pruebe | Postgres del compose, red interna | volumen `storage` | sandbox (`APP_ENV=test`, `MAIL_SANDBOX_TO`) |
| `main` | Coolify, `gc2-prod` (aun no creado; hoy `main` sigue en Vercel + Supabase) | Postgres del compose, backup diario a B2 | volumen `storage` | dominio verificado, sin `MAIL_SANDBOX_TO` |

- Flujo de ramas: `feature/*` -> `dev` -> `test` (merge directo) -> PR a `main` (checks verdes, OK de Mateo).
- Versiones: Node 22, Postgres 16 (desplegado: no cambiar sin dump/restore), resto del stack en `codetlon-cloud/.claude/modules/stack-versions.md`.
- Variables criticas: `BETTER_AUTH_SECRET` (distinta por entorno), `NEXT_PUBLIC_SITE_URL` (tambien arma `BETTER_AUTH_URL`; tiene que llegar como `build-arg` para sitemap, robots y metadatos), `POSTGRES_PASSWORD`, `APP_ENV`, `TRANSCODE_API_KEY`. Los valores no van en el repo.
- Para probar la imagen real: `docker build --build-arg NEXT_PUBLIC_SITE_URL=https://ejemplo.test .` (sin ese argumento el build falla con `Invalid URL`).
