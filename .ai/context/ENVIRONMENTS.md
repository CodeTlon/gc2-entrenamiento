# ENVIRONMENTS

Vigente al 2026-11-27. Fuente completa: `docs/environments.md` y `docs/produccion-coolify.md`.

| Rama | Entorno | Base | Archivos | Correo |
|---|---|---|---|---|
| `dev` | local (`npm run dev`) | Postgres en Docker (`docker compose up -d`, `127.0.0.1:42432`; en la VPS usar el rango de puertos de la cuenta) | `./storage` | credenciales de prueba |
| `test` | Coolify, recurso `gc2-test` (https://gc2-test.51.91.253.54.sslip.io), sin Resend (no manda mails) | Postgres del compose, red interna | volumen `storage` | sandbox (`APP_ENV=test`, `MAIL_SANDBOX_TO`) |
| `main` | Coolify, `gc2-prod` (www + raíz, en producción desde 2026-11-27; `gc2-web` detenido como rollback) | Postgres del compose, backup diario a B2 **pendiente** | volumen `storage` | dominio verificado, sin `MAIL_SANDBOX_TO` |

- Flujo de ramas: `feature/*` -> `dev` -> `test` (merge directo) -> PR a `main` (checks verdes, OK de Mateo).
- Versiones: Node 22, Postgres 16 (desplegado: no cambiar sin dump/restore), resto del stack en `codetlon-cloud/.claude/modules/stack-versions.md`.
- Variables criticas: `BETTER_AUTH_SECRET` (distinta por entorno), `NEXT_PUBLIC_SITE_URL` (tambien arma `BETTER_AUTH_URL`; tiene que llegar como `build-arg` para sitemap, robots y metadatos), `POSTGRES_PASSWORD`, `APP_ENV`, `TRANSCODE_API_KEY`. Los valores no van en el repo.
- Para probar la imagen real: `docker build --build-arg NEXT_PUBLIC_SITE_URL=https://ejemplo.test .` (sin ese argumento el build falla con `Invalid URL`).

## Backups

Desde 2026-11-27 el servicio `backup` del `docker-compose.coolify.yml` hace cada día `pg_dump -Fc` de la base y un tar.gz del volumen `storage`, con `.sha256`, y los sube a `b2:backups-codetlon/prod/<BACKUP_PROJECT>/{postgres,files}/<AAAA-MM-DD>/` (mismo formato que `backup-coolify.sh` de codetlon-cloud). Se activa solo con las variables del recurso `B2_KEY_ID`, `B2_APP_KEY` y `BACKUP_PROJECT` (en test quedan vacías y no respalda); la hora va en `BACKUP_HORA_UTC`. El resultado se ve en los logs del servicio `backup` (líneas `[backup]`). La retención la aplica el bucket.
